import { CrowdloanReturn, ParachainReturn } from './types';
import { CrowdloanSequence } from './types/models/CrowdloanSequence';

export const parseNumber = (hexOrNum: string | number | undefined): number => {
  if (!hexOrNum) {
    return 0;
  }
  return typeof hexOrNum === 'string' ? parseInt(hexOrNum.replace(/^0x/, ''), 16) || 0 : hexOrNum;
};

export const getParachainId = async (paraId: number | ParachainReturn) => {
  if (typeof paraId === 'number') {
    const { manager } = (await fetchParachain(paraId)) || {};
    return `${paraId}-${manager || ''}`;
  }
  const { manager } = paraId || {};
  return `${paraId}-${manager || ''}`;
};

export const fetchParachain = async (paraId: number): Promise<ParachainReturn | null> => {
  const parachain = (await api.query.registrar.paras(paraId)).toJSON() as unknown;
  logger.info(`Fetched parachain ${paraId}: ${JSON.stringify(parachain, null, 2)}`);
  return parachain as ParachainReturn | null;
};

export const fetchCrowdloan = async (paraId: number): Promise<CrowdloanReturn | null> => {
  const fund = await api.query.crowdloan.funds(paraId);
  return fund.toJSON() as unknown as CrowdloanReturn | null;
};

export const isFundAddress = (address: string) => {
  const hexStr = api.createType('Address', address).toHex();
  return Buffer.from(hexStr.slice(4, 28), 'hex').toString().startsWith('modlpy/cfund');
};

export const getParachainIndex = (address: string) => {
  const hexStr = api.createType('Address', address).toHex();
  const hexIndexLE = '0x' + hexStr.slice(28, 32).match(/../g).reverse().join('');
  return parseInt(hexIndexLE, 10);
};
