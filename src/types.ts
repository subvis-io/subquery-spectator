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
  firstSlot: number;
  lastSlot: number;
  trieIndex: number;
}
