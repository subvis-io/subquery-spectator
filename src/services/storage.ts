import { Entity } from '@subql/types';
import assert from 'assert';
import { Parachain } from '../types/models/Parachain';
import { Crowdloan } from '../types/models/Crowdloan';
import { CrowdloanSequence } from '../types/models/CrowdloanSequence';
import { fetchCrowdloan, fetchParachain, getParachainId, parseNumber } from '../utils';
import { CrowdloanReturn, CrowdloanStatus } from '../types';

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
  updater: Record<string, any>,
  updateFn?: (entry?: Entity) => Omit<T, 'save'>
): Promise<T> => {
  const entry = await get(colName, id);
  const updatedItem = entry
    ? updateFn
      ? updateFn(entry)
      : { ...entry, ...updater, id }
    : updateFn
    ? updateFn()
    : { ...updater, id };

  logger.debug(`UpsertItem: ${JSON.stringify(updatedItem, null, 2)}`);
  return store
    .set(colName, id, updatedItem)
    .then(() => updatedItem as T)
    .catch((err) => {
      logger.error(`Upsert entity ${colName} ${JSON.stringify(updatedItem, null, 2)} failed, ${err.toString()}`);
      throw err;
    });
};

export const ensureParachain = async (paraId: number): Promise<Parachain> => {
  logger.info(`Fetch parachain by ${paraId}`);
  const { manager, deposit } = await fetchParachain(paraId);
  const parachainId = `${paraId}-${manager}`;
  return upsert('Parachain', parachainId, { id: parachainId, paraId, manager, deposit, deregistered: false });
};

export const ensureFund = async (paraId: number, modifier?: Record<string, any>): Promise<Crowdloan> => {
  const fund = await fetchCrowdloan(paraId);
  const parachainId = await getParachainId(paraId);
  logger.info(`Retrieved parachainId: ${parachainId} for paraId: ${paraId}`);
  const fundId = await getLatestCrowdloanId(parachainId);
  const { cap, end, trieIndex, raised, lastContribution, firstPeriod, lastPeriod, ...rest } =
    fund || ({} as CrowdloanReturn);
  logger.info(`Fund detail: ${JSON.stringify(fund, null, 2)}`);

  return upsert<Crowdloan>('Crowdloan', fundId, null, (cur: Crowdloan) => {
    return !cur
      ? {
          id: fundId,
          parachainId,
          ...rest,
          firstSlot: firstPeriod,
          lastSlot: lastPeriod,
          status: CrowdloanStatus.STARTED,
          raised: parseNumber(raised) as unknown as bigint,
          cap: parseNumber(cap) as unknown as bigint,
          lockExpiredBlock: end,
          isFinished: false,
          ...modifier
        }
      : {
          id: fundId,
          ...cur,
          raised: parseNumber(raised) as unknown as bigint,
          cap: parseNumber(cap) as unknown as bigint,
          ...modifier
        };
  });
};

export const getLatestCrowdloanId = async (parachainId: string) => {
  const seq = await CrowdloanSequence.get(parachainId);
  const curBlockNum = await api.query.system.number();
  if (seq) {
    return `${parachainId}-${seq.curIndex}`;
  }

  await CrowdloanSequence.create({ id: parachainId, curIndex: 0, createdAt: new Date(), blockNum: curBlockNum }).save();
  return `${parachainId}-0`;
};
