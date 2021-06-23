import { SubstrateEvent } from '@subql/types';
import * as Storage from '../services/storage';
import { isFundAddress, parseNumber } from '../utils';
import { Auction } from '../types/models/Auction';
import { ChronicleKey } from '../constants';
import { CrowdloanStatus } from '../types';

const IgnoreParachainIds = [100, 110, 120, 1];

export const handleNewLeasePeriod = async (substrateEvent: SubstrateEvent) => {
  const { event, block } = substrateEvent;
  const blockNum = block.block.header.number.toNumber();
  const [leaseIdx] = event.data.toJSON() as [number];
  const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
  await Storage.upsert('Chronicle', ChronicleKey, {
    curLease: leaseIdx,
    curLeaseStart: blockNum,
    curLeaseEnd: blockNum + leasePeriod - 1
  });
  logger.info('Update new lease period on Chronicle');
};

export const handleSlotsLeased = async (substrateEvent: SubstrateEvent) => {
  const { event, extrinsic, block } = substrateEvent;
  const { method, section } = extrinsic?.extrinsic.method || {};
  const blockNum = block.block.header.number.toNumber();
  const [paraId, from, firstLease, leaseCount, extra, total] = event.data.toJSON() as [
    number,
    string,
    number,
    number,
    string,
    string
  ];

  const lastLease = firstLease + leaseCount - 1;

  if (IgnoreParachainIds.includes(paraId)) {
    logger.info(`Ignore testing parachain ${paraId}`);
    return;
  }

  const { id: parachainId } = await Storage.ensureParachain(paraId);
  const totalUsed = parseNumber(total);
  const extraAmount = parseNumber(extra);
  logger.info(
    `Slot leased, with ${JSON.stringify({ paraId, from, firstLease, lastLease, extra, total, parachainId }, null, 2)}`
  );

  const [ongoingAuction] = await Auction.getByOngoing(true);
  const curAuction = ongoingAuction || { id: 'unknown', resultBlock: blockNum, leaseEnd: null };

  if (curAuction.id === 'unknown') {
    logger.info('No active auction found, sudo or system parachain, upsert unknown Auction');
    await Storage.upsert('Auction', 'unknown', {
      id: 'unknown',
      blockNum,
      status: 'Closed',
      slotsStart: 0,
      slotsEnd: 0,
      closingStart: 0,
      closingEnd: 0,
      ongoing: false
    });
  }

  if (isFundAddress(from)) {
    await Storage.ensureFund(paraId, {
      status: CrowdloanStatus.WON,
      wonAuctionId: curAuction.id,
      leaseExpiredBlock: curAuction.leaseEnd
    });
  }

  const { id: auctionId, resultBlock } = curAuction;
  logger.info(`Resolved auction id ${curAuction.id}, resultBlock: ${curAuction.id}, ${curAuction.resultBlock}`);

  await Storage.upsert('ParachainLeases', `${paraId}-${auctionId || 'sudo'}-${firstLease}-${lastLease}`, {
    paraId,
    leaseRange: `${auctionId || 'sudo'}-${firstLease}-${lastLease}`,
    firstLease,
    lastLease,
    latestBidAmount: totalUsed,
    auctionId,
    activeForAuction: auctionId || 'sudo',
    parachainId,
    extraAmount,
    winningAmount: totalUsed,
    wonBidFrom: from,
    winningResultBlock: resultBlock,
    hasWon: true
  }).catch((err) => {
    logger.error(`Upsert ParachainLeases failed ${err}`);
  });
};
