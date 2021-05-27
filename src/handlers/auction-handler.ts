import { SubstrateBlock, SubstrateEvent } from '@subql/types';
import { ChronicleKey } from '../constants';
import { Auction } from '../types/models/Auction';
import { AuctionParachain } from '../types/models/AuctionParachain';
import { Chronicle } from '../types/models/Chronicle';
import { parseNumber } from '../utils';
import * as Storage from '../services/storage';
import { Bid } from '../types/models/Bid';
import { ParachainWinningLeases } from '../types/models/ParachainWinningLeases';

const isFundAddress = (address: string) => {
  const hexStr = api.createType('Address', address).toHex();
  return Buffer.from(hexStr.slice(4, 28), 'hex').toString().startsWith('modlpy/cfund');
};

export const handleAuctionStarted = async (substrateEvent: SubstrateEvent) => {
  const endingPeriod = api.consts.auctions.endingPeriod.toJSON() as number;
  const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
  const periods = api.consts.auctions.leasePeriodsPerSlot.toJSON() as number;
  const { event, block } = substrateEvent;
  const { timestamp: createdAt, block: rawBlock } = block;
  const [auctionId, slotStart, auctionEnds] = event.data.toJSON() as [number, number, number];
  await Storage.save('Auction', {
    id: auctionId.toString(),
    blockNum: rawBlock.header.number.toNumber(),
    status: 'Started',
    slotsStart: slotStart,
    slotsEnd: slotStart + periods - 1,
    leaseStart: slotStart * leasePeriod,
    leaseEnd: (slotStart + periods - 1) * leasePeriod,
    createdAt,
    closingStart: auctionEnds,
    ongoing: true,
    closingEnd: auctionEnds + endingPeriod
  });

  const chronicle = await Chronicle.get(ChronicleKey);
  chronicle.curAuctionId = auctionId.toString();
  await chronicle.save();

  logger.info(`Auction ${auctionId} saved`);
};

export const handleAuctionClosed = async (substrateEvent: SubstrateEvent) => {
  const { event } = substrateEvent;
  const [auctionId] = event.data.toJSON() as [number];
  const auction = await Auction.get(auctionId.toString());
  auction.status = 'Closed';
  await auction.save();
  const chronicle = await Chronicle.get(ChronicleKey);
  chronicle.curAuctionId = null;
  chronicle.save();
};

const markLosingBids = async (auctionId: number, slotStart: number, slotEnd: number, winningBidId: string) => {
  const winningBids = (await Bid.getByWinningAuction(auctionId)) || [];
  const losingBids = winningBids.filter(
    ({ firstSlot, lastSlot, id }) => id !== winningBidId && slotStart == firstSlot && slotEnd == lastSlot
  );
  for (const bid of losingBids) {
    bid.winningAuction = null;
    await bid.save();
    logger.info(`Mark Bid as losing bid ${bid.id}`);
  }
};

const markParachainWinningLeases = async (
  auctionId: number,
  paraId: number,
  leaseStart: number,
  leaseEnd: number,
  bidAmount: number
) => {
  const leaseRange = `${auctionId}-${leaseStart}-${leaseEnd}`;
  const winningLeases = (await ParachainWinningLeases.getByLeaseRange(leaseRange)) || [];
  const losingLeases = winningLeases.filter((lease) => lease.paraId !== paraId);
  for (const lease of losingLeases) {
    lease.activeForAuction = null;
    await lease.save();
    logger.info(`Mark losing parachain leases ${lease.paraId} for ${lease.leaseRange}`);
  }
  await Storage.upsert('ParachainWinningLeases', `${paraId}-${leaseRange}`, {
    paraId,
    leaseRange,
    firstLease: leaseStart,
    lastLease: leaseEnd,
    auctionId,
    latestBidAmount: bidAmount,
    activeForAuction: auctionId
  });
};

/**
 *
 * @param substrateEvent SubstrateEvent
 * Create Bid record and create auction parachain record if not exists already
 * Skip winning bid before we have query abilities
 */
export const handleBidAccepted = async (substrateEvent: SubstrateEvent) => {
  const { event, block } = substrateEvent;
  const { timestamp: createdAt, block: rawBlock } = block;
  const blockNum = rawBlock.header.number.toNumber();
  const [from, paraId, amount, firstSlot, lastSlot] = event.data.toJSON() as [
    string,
    number,
    number | string,
    number,
    number
  ];
  const auctionId = (await api.query.auctions.auctionCounter()).toJSON() as number;
  const isFund = isFundAddress(from);
  const parachain = await Storage.ensureParachain(paraId);
  const { id: parachainId } = parachain;

  const fundId = await Storage.getLatestCrowdloanId(parachainId);
  const bidAmount = parseNumber(amount);
  const bid = {
    id: `${blockNum}-${from}-${paraId}-${firstSlot}-${lastSlot}`,
    auctionId: `${auctionId}`,
    blockNum,
    winningAuction: auctionId,
    parachainId,
    isCrowdloan: isFund,
    amount: parseNumber(amount),
    firstSlot,
    lastSlot,
    createdAt,
    fundId: isFund ? fundId : null,
    bidder: isFund ? null : from
  };

  logger.info(`Bid detail: ${JSON.stringify(bid, null, 2)}`);
  const { id: bidId } = await Storage.save('Bid', bid);
  logger.info(`Bid saved: ${bidId}`);

  markParachainWinningLeases(auctionId, paraId, firstSlot, lastSlot, bidAmount);

  markLosingBids(auctionId, firstSlot, lastSlot, bidId);

  const auctionParaId = `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`;
  const auctionPara = await AuctionParachain.get(auctionParaId);
  if (!auctionPara) {
    const { id } = await Storage.save('AuctionParachain', {
      id: `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`,
      parachainId,
      auctionId,
      firstSlot,
      lastSlot,
      createdAt,
      blockNum
    });
    logger.info(`Create AuctionParachain: ${id}`);
  }
};

export const checkAuctionClosed = async (block: SubstrateBlock) => {
  const auctions = await Auction.getByOngoing(true);
  if (!auctions) {
    return;
  }
  const blockNum = block.block.header.number.toNumber();
  const closedAuctions = auctions.filter(({ closingEnd }) => closingEnd <= blockNum);
  for (const auction of closedAuctions) {
    if (auction.closingEnd <= blockNum) {
      auction.status = 'Closed';
      auction.ongoing = false;
      auction.save();
    }
  }
  if (closedAuctions.length) {
    Storage.upsert('Chronicle', ChronicleKey, { curAuctionId: null });
  }
};

export const updateBlockNum = async (block: SubstrateBlock) => {
  await Storage.upsert<Chronicle>('Chronicle', ChronicleKey, {
    curBlockNum: block.block.header.number.toNumber()
  });
};

export const updateWinningBlocks = async (block: SubstrateBlock) => {
  const { curAuctionId, curBlockNum } = (await Chronicle.get(ChronicleKey)) || {};
  const { closingStart, closingEnd } = (await Auction.get(curAuctionId || '')) || {};

  if (curAuctionId && closingStart >= curBlockNum && curBlockNum <= closingEnd) {
    logger.info(`About to update winning leases ${curBlockNum}, closing: ${closingStart} - ${closingEnd}`);
    const winningLeases = await ParachainWinningLeases.getByActiveForAuction(curAuctionId);
    for (const lease of winningLeases) {
      lease.numBlockWon = (lease.numBlockWon || 0) + 1;
      await lease.save();
    }
  }
};
