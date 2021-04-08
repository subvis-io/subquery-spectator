import { Entity } from '@subql/types';
import assert from 'assert';

const saveEntity = <T extends Entity>(colName: string) => async (entity: T): Promise<T> => {
  const { id } = entity;
  assert(id != null, `Invalid entity id: ${id}`);
  await store.set(colName, id, entity);
  return entity;
};

const getEntity = <T extends Entity>(colName: string) => async (id: string): Promise<T | null> =>
  store.get(colName, id) as Promise<T | null>;

const upsertEntity = <T extends Entity>(colName: string) => async (
  id: string,
  updater: Record<string, any>
): Promise<T> => {
  const entry = await getEntity(colName)(id);
  const updatedItem = entry ? { ...entry, ...updater, id } : { ...updater, id };
  return store.set(colName, id, updatedItem).then(() => updatedItem as T);
};

export const getStorage = (colName: string) => ({
  save: saveEntity(colName),
  get: getEntity(colName),
  upsert: upsertEntity(colName)
});
