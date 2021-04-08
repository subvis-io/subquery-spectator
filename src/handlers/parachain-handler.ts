import { SubstrateEvent } from '@subql/types';
import { Parachain } from '../types/models/Parachain';

export const handleParachainRegistered = async (substrateEvent: SubstrateEvent) => {
  const { event, extrinsic, block } = substrateEvent;
  const { timestamp: createdAt, block: rawBlock } = block;
  const { number: blockNum } = rawBlock.header;
  const reservedEvent = extrinsic.events.find((event) => event.event.method.match(/reserved/i));
  const [, reserved] = (reservedEvent?.event.data.toJSON() as [string, number]) || [, 0];
  const [paraId, creatorId] = event.data.toJSON() as [number, string];
  const parachain = Parachain.create({
    id: `${paraId}-${blockNum}`,
    paraId,
    createdAt,
    creatorId,
    reserved,
    creationBlockNum: blockNum,
    onboarded: false,
    deregistered: false
  });
  console.log(parachain);
  await parachain.save();
};
