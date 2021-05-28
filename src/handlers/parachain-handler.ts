import { SubstrateBlock, SubstrateEvent } from '@subql/types';
import { ChronicleKey } from '../constants';
import * as Storage from '../services/storage';
import { Crowdloan } from '../types/models/Crowdloan';
import { Chronicle } from '../types/models/Chronicle';
import { parseNumber } from '../utils';

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

export const updateCrowdloanStatus = async (block: SubstrateBlock) => {
  const blockNum = block.block.header.number.toNumber();
  const funds = (await Crowdloan.getByRetiring(false)) || [];
  await Promise.all(
    funds
      .filter((fund) => fund.lockExpiredBlock <= blockNum)
      .map((fund) => {
        fund.retiring = true;
        return fund.save();
      })
  );
};

export const handleCrowdloanWon = async (substrateEvent: SubstrateEvent) => {
  const { event, block } = substrateEvent;
  const { block: rawBlock } = block;
  const { curAuctionId } = (await Chronicle.get(ChronicleKey)) || {};
  const blockNum = rawBlock.header.number.toNumber();
  const [fundIdx] = event.data.toJSON() as [number, number];
  const { lastSlot, ...rest } = await Storage.ensureFund(fundIdx, blockNum);
  const leasePeriod = api.consts.slots.leasePeriod.toJSON() as number;
  await Storage.save('Crowdloan', {
    ...rest,
    lockExpiredBlock: lastSlot * leasePeriod,
    wonAuctionId: curAuctionId
  });
};
