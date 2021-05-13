import { Entity } from '@subql/types';
import assert from 'assert';
import { CrowdloanReturn } from '../types';
import { CrowdloanSequence } from '../types/models/CrowdloanSequence';
import { fetchCrowdloan, fetchParachain, getParachainId, parseNumber } from '../utils';

type Crowdloan = Omit<CrowdloanReturn, 'lastContribution' | 'cap'> & { cap: number; id: string; parachainId: string };

export const save = async <T extends Entity>(colName: string, entity: T): Promise<T> => {
  const { id } = entity;
  assert(id != null, `Invalid entity id: ${id}`);
  await store.set(colName, id, entity).catch((err) => {
    logger.error(`Save entity failed, ${err.toString()}`);
    process.exit(-1);
  });
  return entity;
};

export const get = async <T extends Entity>(colName: string, id: string): Promise<T | null> =>
  store.get(colName, id) as Promise<T | null>;

export const upsert = async <T extends Entity>(
  colName: string,
  id: string,
  updater: Record<string, any>
): Promise<T> => {
  const entry = await get(colName, id);
  const updatedItem = entry ? { ...entry, ...updater, id } : { ...updater, id };
  return store
    .set(colName, id, updatedItem)
    .then(() => updatedItem as T)
    .catch((err) => {
      logger.error(`Upsert entity failed, ${err.toString()}`);
      return null;
    });
};

export const ensureParachain = async (paraId: number): Promise<Entity> => {
  logger.info(`Fetch parachain by ${paraId}`);
  const { manager, deposit } = await fetchParachain(paraId);
  const parachainId = `${paraId}-${manager}`;
  return upsert('Parachain', parachainId, { id: parachainId, paraId, manager, deposit, deregistered: false });
};

export const ensureFund = async (paraId: number, blockNum = 0): Promise<Crowdloan> => {
  const fund = await fetchCrowdloan(paraId);
  const parachainId = await getParachainId(paraId);
  logger.info(`Retrieved parachainId: ${parachainId} for paraId: ${paraId}`);
  const fundId = await getLatestCrowdloanId(parachainId, blockNum);
  const { cap, end, trieIndex, raised, lastContribution, ...rest } = fund;
  logger.info(`Fund detail: ${JSON.stringify(fund, null, 2)}`);

  return upsert<Crowdloan>('Crowdloan', fundId, {
    id: fundId,
    retiring: false,
    parachainId,
    ...rest,
    raised: parseNumber(raised),
    cap: parseNumber(cap),
    lockExpiredBlock: end,
    blockNum
  });
};

export const getLatestCrowdloanId = async (parachainId: string, blockNum = 0) => {
  const seq = await CrowdloanSequence.get(parachainId);
  if (seq) {
    if (blockNum) {
      seq.curIndex = seq.curIndex + 1;
      seq.bumpAt = seq.bumpAt ? `${seq.bumpAt}, ${blockNum}` : blockNum.toString();
      logger.info(`Increase Fund index for parachain: ${parachainId}`);
      await seq.save();
    }
    return `${parachainId}-${seq.curIndex}`;
  }

  await CrowdloanSequence.create({ id: parachainId, curIndex: 0 }).save();
  return `${parachainId}-0`;
};
