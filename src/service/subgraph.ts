import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';

const APIURL =
  'https://api.thegraph.com/subgraphs/name/libre-defi/libre-bsc-exchange-subgraph';

export const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
});

export const OVERVIEW_CHARTS = gql`
  query overviewCharts {
    libreDayDatas(
      skip: 0
      where: { date_gt: 1636359855 }
      orderBy: date
      orderDirection: asc
    ) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`;

export const TOP_TOKENS_QUERY = gql`
  query topTokens {
    tokenDayDatas(first: 30, orderBy: dailyVolumeUSD, orderDirection: desc) {
      id
    }
  }
`;

export const TOP_TOKENS_DETAILS_NOW_QUERY = gql`
  query GetTopTokensDetailsNow($ids: [String]) {
    tokens(where: { id_in: $ids }) {
      id
      name
      symbol
      derivedUSD
      tradeVolumeUSD
      totalTransactions
      totalLiquidity
    }
  }
`;

export const TOP_TOKENS_DETAILS_PAST_QUERY = gql`
  query GetTopTokensDetailsPast($ids: [String], $block: Int) {
    tokens(where: { id_in: $ids }, block: { number: $block }) {
      id
      name
      symbol
      derivedUSD
      tradeVolumeUSD
      totalTransactions
      totalLiquidity
    }
  }
`;

export const TOP_POOLS_QUERY = gql`
  query GetTopPools($timestamp24hAgo: Int) {
    pairDayDatas(
      first: 30
      where: { date_gt: $timestamp24hAgo }
      orderBy: dailyVolumeUSD
      orderDirection: desc
    ) {
      id
    }
  }
`;

export const TOP_POOLS_DETAILS_NOW_QUERY = gql`
  query GetTopPoolsDetailsNow($ids: [String], $track: String) {
    pairs(orderBy: $track, orderDirection: desc, where: { id_in: $ids }) {
      id
      name
      reserve0
      reserve1
      reserveUSD
      volumeUSD
      token0Price
      token1Price
    }
  }
`;

export const TOP_POOLS_DETAILS_PAST_QUERY = gql`
  query GetTopPoolsDetailsPast($ids: [String], $track: String, $block: Int) {
    pairs(
      orderBy: $track
      orderDirection: desc
      where: { id_in: $ids }
      block: { number: $block }
    ) {
      id
      name
      reserve0
      reserve1
      reserveUSD
      volumeUSD
      token0Price
      token1Price
    }
  }
`;

// export const fetchTopTokens = async () => {
//   return await client.query({
//     query: gql(topTokensQuery),
//   });
// };
