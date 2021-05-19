import { SubstrateEvent } from '@subql/types';
import * as Storage from '../services/storage';

import { ParachainLeases } from '../types/models/ParachainLeases';
import { getParachainId, parseNumber } from '../utils';

const IgnoreParachainIds = [100, 110, 120, 1];

export const handleParachainRegistered = async (substrateEvent: SubstrateEvent) => {
  const { event, extrinsic, block } = substrateEvent;
  const { timestamp: createdAt, block: rawBlock } = block;
  const { number: blockNum } = rawBlock.header;
  const reservedEvent = extrinsic.events.find((event) => event.event.method.match(/reserved/i));
  const [, deposit] = (reservedEvent?.event.data.toJSON() as [string, number]) || [, 0];
  const [paraId, manager] = event.data.toJSON() as [number, string];
  const parachain = await Storage.save('Parachain', {
    id: `${paraId}-${manager}`,
    paraId,
    createdAt,
    manager,
    deposit,
    creationBlockNum: blockNum,
    deregistered: false
  });
  logger.info(`new Parachain saved: ${JSON.stringify(parachain, null, 2)}`);
};

export const handleSlotsLeased = async (substrateEvent: SubstrateEvent) => {
  const { event, block } = substrateEvent;
  const { block: rawBlock } = block;
  const { number: blockNum } = rawBlock.header;
  const [paraId, from, firstSlot, slotCount, extra, total] = event.data.toJSON() as [
    number,
    string,
    number,
    number,
    string,
    string
  ];

  const lastSlot = firstSlot + slotCount;

  if (IgnoreParachainIds.includes(paraId)) {
    logger.info(`Ignore testing parachain ${paraId}`);
    return;
  }

  const parachainId = await getParachainId(paraId);
  const totalUsed = parseNumber(total);
  logger.info(`Slot leased, with ${JSON.stringify({ paraId, from, firstSlot, lastSlot, extra, total }, null, 2)}`);

  const lease = ParachainLeases.create({
    id: `${paraId}-${firstSlot}-${lastSlot}`,
    parachainId,
    firstSlot,
    lastSlot,
    blockNum,
    winningAmount: totalUsed
  });
  logger.info(`Lease: ${JSON.stringify(lease, null, 2)}`);
  lease.save();
};

export const handleCrowdloanCreated = async (substrateEvent: SubstrateEvent) => {
  const { event, block } = substrateEvent;
  const { block: rawBlock } = block;
  const blockNum = rawBlock.header.number.toNumber();
  const [fundIdx] = event.data.toJSON() as [number];
  await Storage.ensureParachain(fundIdx);
  const fund = await Storage.ensureFund(fundIdx, blockNum);
  logger.info(`Create Crowdloan: ${JSON.stringify(fund, null, 2)}`);
};

export const handleCrowdloanContributed = async (substrateEvent: SubstrateEvent) => {
  const { event, extrinsic, block } = substrateEvent;
  const { timestamp: createdAt, block: rawBlock } = block;
  const nonce = extrinsic.extrinsic.nonce.toNumber();
  const blockNum = rawBlock.header.number.toNumber();
  const [contributor, fundIdx, amount] = event.data.toJSON() as [string, number, number | string];
  const amtValue = typeof amount === 'string' ? parseNumber(amount) : amount;
  await Storage.ensureParachain(fundIdx);

  const { id: fundId, parachainId } = await Storage.ensureFund(fundIdx);
  const contribution = {
    id: `${fundIdx}-${contributor}-${nonce}`,
    account: contributor,
    parachainId,
    fundId,
    amount: amtValue,
    createdAt,
    blockNum
  };

  logger.info(`contribution for ${JSON.stringify(contribution, null, 2)}`);
  await Storage.save('Contribution', contribution);
};
