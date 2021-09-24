import { SubstrateBlock, SubstrateEvent } from '@subql/types';
import { ChronicleKey } from '../constants';
import { Auction } from '../types/models/Auction';
import { AuctionParachain } from '../types/models/AuctionParachain';
import { Chronicle } from '../types/models/Chronicle';
import { parseNumber } from '../utils';
import * as Storage from '../services/storage';
import { Bid } from '../types/models/Bid';
import { ParachainLeases } from '../types/models/ParachainLeases';
import { isFundAddress } from '../utils';

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
  auction.ongoing = false;
  await auction.save();
  const chronicle = await Chronicle.get(ChronicleKey);
  chronicle.curAuctionId = null;
  chronicle.save();
};

export const handleAuctionWinningOffset = async (substrateEvent: SubstrateEvent) => {
  const { event } = substrateEvent;
  const [auctionId, offsetBlock] = event.data.toJSON() as [number, number];
  const auction = await Auction.get(auctionId.toString());
  auction.resultBlock = auction.closingStart + offsetBlock;
  logger.info(`Update auction ${auctionId} winning offset: ${auction.resultBlock}`);
  await auction.save();
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

const markParachainLeases = async (
  auctionId: number,
  paraId: number,
  leaseStart: number,
  leaseEnd: number,
  bidAmount: number
) => {
  const leaseRange = `${auctionId}-${leaseStart}-${leaseEnd}`;
  const { id: parachainId } = await Storage.ensureParachain(paraId);
  const winningLeases = (await ParachainLeases.getByLeaseRange(leaseRange)) || [];
  const losingLeases = winningLeases.filter((lease) => lease.paraId !== paraId);
  for (const lease of losingLeases) {
    lease.activeForAuction = null;
    await lease.save();
    logger.info(`Mark losing parachain leases ${lease.paraId} for ${lease.leaseRange}`);
  }
  await Storage.upsert('ParachainLeases', `${paraId}-${leaseRange}`, {
    paraId,
    leaseRange,
    parachainId,
    firstLease: leaseStart,
    lastLease: leaseEnd,
    auctionId: auctionId?.toString(),
    latestBidAmount: bidAmount,
    activeForAuction: auctionId?.toString(),
    hasWon: false
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

  await markParachainLeases(auctionId, paraId, firstSlot, lastSlot, bidAmount);

  await markLosingBids(auctionId, firstSlot, lastSlot, bidId);

  const auctionParaId = `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`;
  const auctionPara = await AuctionParachain.get(auctionParaId);
  if (!auctionPara) {
    const { id } = await Storage.save('AuctionParachain', {
      id: `${paraId}-${firstSlot}-${lastSlot}-${auctionId}`,
      parachainId,
      auctionId:auctionId?.toString(),
      firstSlot,
      lastSlot,
      createdAt,
      blockNum
    });
    logger.info(`Create AuctionParachain: ${id}`);
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

  if (curAuctionId && curBlockNum >= closingStart && curBlockNum < closingEnd) {
    const winningLeases = await ParachainLeases.getByActiveForAuction(curAuctionId);
    for (const lease of winningLeases) {
      lease.numBlockWon = (lease.numBlockWon || 0) + 1;
      await lease.save();
    }
  }
};
