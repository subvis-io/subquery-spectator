import { SignedBlock } from '@polkadot/types/interfaces';
import { SubstrateExtrinsic, SubstrateEvent } from '@subql/types';
import { SubstrateBlock } from '@subql/types';

import { handleParachainRegistered } from '../handlers/parachain-handler';

const eventsMapping = {
  'registrat/registered': handleParachainRegistered
};

export async function handleBlock(block: SubstrateBlock): Promise<void> {}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  const {
    event: { method, section }
  } = event;

  const eventType = `${section}/${method}`;
  const handler = eventsMapping[eventType];
  if (handler) {
    await handler(event);
  }
}
