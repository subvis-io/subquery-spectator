import { SignedBlock } from '@polkadot/types/interfaces';
import { SubstrateExtrinsic, SubstrateEvent } from '@subql/types';
import { SubstrateBlock } from '@subql/types';

import {
  handleCrowdloanContributed,
  handleCrowdloanCreated,
  handleParachainRegistered,
  handleSlotsLeased
} from '../handlers/parachain-handler';
import {
  checkAuctionClosed,
  handleAuctionStarted,
  handleBidAccepted,
  updateBlockNum
} from '../handlers/auction-handler';
import { Chronicle } from '../types/models/Chronicle';
import { ChronicleKey } from '../constants';

const noop = async () => {};

const eventsMapping = {
  'registrar/Registered': handleParachainRegistered,
  'crowdloan/Created': handleCrowdloanCreated,
  'auctions/AuctionStarted': handleAuctionStarted,
  'crowdloan/Contributed': handleCrowdloanContributed,
  'auctions/BidAccepted': handleBidAccepted,
  'auctions/Reserved': noop,
  'auctions/Unreserved': noop,
  'crowdloan/HandleBidResult': noop,
  'slots/Leased': handleSlotsLeased
};

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  await checkAuctionClosed(block);
  await updateBlockNum(block);
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  const {
    event: { method, section },
    block: {
      block: { header }
    },
    idx
  } = event;

  const eventType = `${section}/${method}`;

  const handler = eventsMapping[eventType];
  if (handler) {
    logger.info(
      `Event at ${idx} received, block: ${header.number.toNumber()} - ${eventType} ${JSON.stringify(
        event.toJSON(),
        null,
        2
      )}`
    );
    await handler(event);
  }
}

const init = async () => {
  const chronicle = await Chronicle.get(ChronicleKey);
  if (!chronicle) {
    logger.info('Setup Chronicle');
    await Chronicle.create({ id: ChronicleKey })
      .save()
      .catch((err) => logger.error(err));
  }
};

init();
