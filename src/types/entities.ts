export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigInt: string;
};

export type Account = {
  __typename?: 'Account';
  id: Scalars['ID'];
  isFund: Scalars['Boolean'];
};

export type Auction = {
  __typename?: 'Auction';
  id: Scalars['ID'];
  blockNum: Scalars['Int'];
  status: Scalars['String'];
  bids: Array<Maybe<Bid>>;
  winningBidIds: Array<Maybe<WinningBid>>;
  leaseStart: Scalars['Int'];
  leaseEnd: Scalars['Int'];
  started: Scalars['Int'];
  closingStart: Scalars['Int'];
  closingEnd: Scalars['Int'];
  resultBlock: Maybe<Scalars['Int']>;
  parachains: Array<Maybe<AuctionParachain>>;
};

export type AuctionParachain = {
  __typename?: 'AuctionParachain';
  id: Scalars['ID'];
  auction: Auction;
  parachain: Parachain;
};

export type Bid = {
  __typename?: 'Bid';
  id: Scalars['ID'];
  auction: Auction;
  blockNum: Scalars['Int'];
  parachain: Parachain;
  isCrowdloan: Scalars['Boolean'];
  value: Scalars['BigInt'];
  fund: Maybe<Crowdloan>;
  slotStart: Scalars['Int'];
  slotEnd: Scalars['Int'];
  bidder: Maybe<Account>;
};


export type Chronicle = {
  __typename?: 'Chronicle';
  id: Scalars['ID'];
  curAuction: Maybe<Auction>;
  curLease: Scalars['Int'];
  curLeaseStart: Scalars['Int'];
  curLeaseEnd: Scalars['Int'];
  parachains: Array<Maybe<Parachain>>;
};

export type Contribution = {
  __typename?: 'Contribution';
  id: Scalars['ID'];
  Auction: Auction;
  Account: Account;
  parachain: Parachain;
  fund: Crowdloan;
  value: Scalars['BigInt'];
  blockNum: Scalars['Int'];
};

export type Crowdloan = {
  __typename?: 'Crowdloan';
  id: Scalars['ID'];
  parachain: Maybe<Parachain>;
  retiring: Scalars['Boolean'];
  auction: Auction;
  depositor: Account;
  cap: Scalars['BigInt'];
  raised: Scalars['BigInt'];
  lockExpiredBlock: Scalars['Int'];
  contributions: Maybe<Array<Maybe<Contribution>>>;
};

export type Parachain = {
  __typename?: 'Parachain';
  id: Scalars['ID'];
  deregistered: Scalars['Boolean'];
  reserved: Scalars['BigInt'];
  creator: Account;
  leased: Array<Maybe<Array<Maybe<Scalars['Int']>>>>;
  onboarded: Scalars['Boolean'];
  bids: Array<Maybe<Bid>>;
  funds: Array<Maybe<Crowdloan>>;
  activeFund: Maybe<Crowdloan>;
  latestBid: Maybe<Bid>;
  winningBlocks: Maybe<Array<Maybe<WinningBlock>>>;
  chronicle: Maybe<Chronicle>;
};

export type WinningBid = {
  __typename?: 'WinningBid';
  bid: Bid;
  auction: Auction;
  slotStart: Scalars['Int'];
  slotEnd: Scalars['Int'];
};

export type WinningBlock = {
  __typename?: 'WinningBlock';
  id: Scalars['ID'];
  auction: Auction;
  parachain: Parachain;
  blockNum: Scalars['Int'];
  bid: Bid;
  slotStart: Scalars['Int'];
  slotEnd: Scalars['Int'];
};
