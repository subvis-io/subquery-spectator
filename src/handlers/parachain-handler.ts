import { SubstrateBlock, SubstrateEvent } from '@subql/types';
import * as Storage from '../services/storage';
import { Crowdloan } from '../types/models/Crowdloan';
import { parseNumber } from '../utils';
import { CrowdloanStatus } from '../types';
import {Contribution} from '../types/index';

interface ParaInfo {
  manager: string;
  deposit: number;
  locked: boolean;
}

export const handleParachainRegistered = async (substrateEvent: SubstrateEvent) => {
  const { event, block } = substrateEvent;
  const { timestamp: createdAt, block: rawBlock } = block;
  const { number: blockNum } = rawBlock.header;

  const [paraId, manager] = event.data.toJSON() as [number, string];
  const { deposit } = ((await api.query.registrar.paras(paraId)).toJSON() as unknown as ParaInfo) || { deposit: 0 };
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

export const handleCrowdloanCreated = async (substrateEvent: SubstrateEvent) => {
  const { event, block } = substrateEvent;
  const { block: rawBlock } = block;
  const blockNum = rawBlock.header.number.toNumber();
  const [fundIdx] = event.data.toJSON() as [number];
  await Storage.ensureParachain(fundIdx);
  const fund = await Storage.ensureFund(fundIdx, { blockNum });
  logger.info(`Create Crowdloan: ${JSON.stringify(fund, null, 2)}`);
};

export const handleCrowdloanContributed = async (substrateEvent: SubstrateEvent) => {
  const { event, block, idx } = substrateEvent;
  const { timestamp: createdAt, block: rawBlock } = block;

  const blockNum = rawBlock.header.number.toNumber();
  const [contributor, fundIdx, amount] = event.data.toJSON() as [string, number, number | string];
  const amtValue = typeof amount === 'string' ? parseNumber(amount) : amount;
  await Storage.ensureParachain(fundIdx);

  logger.info(event.toHuman());

  const { id: fundId, parachainId } = await Storage.ensureFund(fundIdx);
  const contribution = {
    id: `${blockNum}-${idx}`,
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

export const handleCrowdloanMemo = async (substrateEvent: SubstrateEvent) => {
  const {event, block} = substrateEvent;
  const {block: rawBlock} = block;

  const blockNum = rawBlock.header.number.toNumber();
  const [contributor, fundIdx, memo] = event.data.toJSON() as [string, number, string];
  await Storage.ensureParachain(fundIdx);
  await Storage.ensureFund(fundIdx);

  const contributions = await Contribution.getByAccount(contributor);
  const latestContributionBeforeMemo = contributions.filter((contrib) => contrib.blockNum <= blockNum).sort((a, b) => a.blockNum - b.blockNum).pop();

  if (!latestContributionBeforeMemo) return;
  latestContributionBeforeMemo.memo = memo;
  logger.info(`memo for ${JSON.stringify(latestContributionBeforeMemo, null, 2)}`);
  await Storage.save('Contribution', latestContributionBeforeMemo);
};

export const updateCrowdloanStatus = async (block: SubstrateBlock) => {
  const blockNum = block.block.header.number.toNumber();
  const funds = (await Crowdloan.getByIsFinished(false)) || [];

  for (const fund of funds) {
    if (fund.status === CrowdloanStatus.STARTED && blockNum >= fund.lockExpiredBlock) {
      fund.status = CrowdloanStatus.RETIRING;
      logger.info(`Fund ${fund.id} status change from Started to Retiring`);
      await fund.save();
    }

    if (fund.status === CrowdloanStatus.WON && blockNum >= fund.leaseExpiredBlock) {
      fund.status = CrowdloanStatus.RETIRING;
      logger.info(`Fund ${fund.id} status change from Won to Retiring`);
      await fund.save();
    }
  }
};

export const handleCrowdloanDissolved = async (substrateEvent: SubstrateEvent) => {
  const { event, block } = substrateEvent;
  const { timestamp: createdAt, block: rawBlock } = block;
  const blockNum = rawBlock.header.number.toNumber();
  const [fundIdx] = event.data.toJSON() as [number];
  await Storage.ensureFund(fundIdx, {
    status: CrowdloanStatus.DISSOLVED,
    isFinished: true,
    updatedAt: new Date(createdAt),
    dissolvedBlock: blockNum
  });
};
