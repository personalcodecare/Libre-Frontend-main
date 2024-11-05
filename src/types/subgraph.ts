export type ILibreDayData = {
  date: number;
  dailyVolumeUSD: string;
  totalLiquidityUSD: string;
};

export type IChartData = {
  libreDayDatas: ILibreDayData[];
};

export type ITopToken = {
  id: string;
};

export type ITopTokenDetails = {
  derivedBNB: string;
  derivedUSD: string;
  id: string;
  name: string;
  symbol: string;
  totalLiquidity: string;
  totalTransactions: string;
  tradeVolumeUSD: string;
};

export type ITopTokensDetails = {
  tokens: ITopTokenDetails[];
};

export type ITopPool = {
  id: string;
};

export type ITopPoolDetails = {
  id: string;
  name: string;
  reserve0: string;
  reserve1: string;
  reserveUSD: string;
  token0Price: string;
  token1Price: string;
  volumeUSD: string;
};

export type ITopPoolsDetails = {
  pairs: ITopPoolDetails[];
};
