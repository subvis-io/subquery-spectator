import { Crowdloan } from './types/models';

type HexNumber = string;

export interface ParachainReturn {
  manager: string;
  deposit: number;
}

export interface CrowdloanReturn {
  retiring: boolean;
  depositor: string;
  verifier: null | string;
  deposit: number;
  raised: HexNumber;
  end: number;
  cap: HexNumber;
  lastContribution: {
    preEnding?: number[];
    ending: number[];
    never?: null;
  };
  firstPeriod: number;
  lastPeriod: number;
  trieIndex: number;
}

export enum CrowdloanStatus {
  RETIRING = 'Retiring',
  DISSOLVED = 'Dissolved',
  STARTED = 'Started',
  WON = 'Won'
}

export type CrowdloanUpdater = keyof Crowdloan;
