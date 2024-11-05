import { useEffect, useState, useCallback } from 'react';
import { ethers, BigNumber } from 'ethers';

import Web3 from 'web3';
import Image from 'next/image';
import Head from 'next/head';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

import { useUserFacade, useWeb3Facade } from 'state';
import {
  OVERVIEW_CHARTS,
  TOP_TOKENS_QUERY,
  TOP_TOKENS_DETAILS_NOW_QUERY,
  TOP_TOKENS_DETAILS_PAST_QUERY,
  TOP_POOLS_QUERY,
  TOP_POOLS_DETAILS_NOW_QUERY,
  TOP_POOLS_DETAILS_PAST_QUERY,
} from 'service/subgraph';
import { formatNumber } from 'utils';
import {
  ITopToken,
  ITopTokenDetails,
  ITopTokensDetails,
  ITopPool,
  ITopPoolsDetails,
  IChartData,
} from 'types';
import Chart from './chart';

import { PageContainer, ChainSelector } from 'components';
import { SVG_LIBRE1 } from 'assets/icons';
import axios from 'axios';

export default function Info() {
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;
  const { web3, chainId: web3ChainId } = useWeb3Facade();

  const [lastDayBlock, setLastDayBlock] = useState<number | null>(null);

  const lastDayTimeStamp = Math.round(
    new Date().getTime() / 1000 - 60 * 60 * 24
  );

  const { data: chartsData, loading: loadingChartsData } =
    useQuery<IChartData>(OVERVIEW_CHARTS);

  const { data: topTokens, loading: loadingTopTokens } =
    useQuery<{ tokenDayDatas: ITopToken[] }>(TOP_TOKENS_QUERY);

  const topTokenAddresses =
    topTokens &&
    topTokens.tokenDayDatas
      .map((token) => token.id.split('-')[0])
      .filter(
        (addr, index) =>
          topTokens.tokenDayDatas.findIndex(
            (t) => t.id.split('-')[0] === addr
          ) === index
      )
      .slice(0, 3);

  const { data: tokensNow, loading: loadingTokensNow } =
    useQuery<ITopTokensDetails>(TOP_TOKENS_DETAILS_NOW_QUERY, {
      variables: { ids: topTokenAddresses, block: +lastDayBlock },
    });

  const { data: tokensPast, loading: loadingTokensPast } =
    useQuery<ITopTokensDetails>(TOP_TOKENS_DETAILS_PAST_QUERY, {
      variables: { ids: topTokenAddresses, block: +lastDayBlock },
    });

  const { data: topPools, loading: loadingTopPools } = useQuery<{
    pairDayDatas: ITopPool[];
  }>(TOP_POOLS_QUERY, {
    variables: {
      timestamp24hAgo: lastDayTimeStamp,
    },
  });

  const topPoolAddresses =
    topPools &&
    topPools.pairDayDatas
      .map((pool) => pool.id.split('-')[0])
      .filter(
        (addr, index) =>
          topPools.pairDayDatas.findIndex(
            (t) => t.id.split('-')[0] === addr
          ) === index
      )
      .slice(0, 3);

  const { data: poolsNow, loading: loadingPoolsNow } =
    useQuery<ITopPoolsDetails>(TOP_POOLS_DETAILS_NOW_QUERY, {
      variables: {
        ids: topPoolAddresses,
        track:
          userChain === 'BSC'
            ? 'trackedReserveBNB'
            : userChain === 'AVAX'
            ? 'trackedReserveAVAX'
            : 'trackedReserveMATIC',
      },
    });

  const { data: poolsPast, loading: loadingPoolPast } =
    useQuery<ITopPoolsDetails>(TOP_POOLS_DETAILS_PAST_QUERY, {
      variables: {
        ids: topPoolAddresses,
        track:
          userChain === 'BSC'
            ? 'trackedReserveBNB'
            : userChain === 'AVAX'
            ? 'trackedReserveAVAX'
            : 'trackedReserveMATIC',
        block: +lastDayBlock,
      },
    });

  useEffect(() => {
    const apiKey =
      userChain === 'BSC'
        ? process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
        : userChain === 'AVAX'
        ? process.env.NEXT_PUBLIC_SNOWTRACE_API_KEY
        : process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY;
    const apiUrl = `https://api.${
      userChain === 'BSC'
        ? 'bscscan.com'
        : userChain === 'AVAX'
        ? 'snowtrace.io'
        : 'polygonscan.com'
    }/api?module=block&action=getblocknobytime&timestamp=${lastDayTimeStamp}&closest=before&apikey=${apiKey}`;
    axios.get(apiUrl).then((res) => {
      if (res.status === 200 && res.data.status === '1') {
        setLastDayBlock(res.data.result);
      }
    });
  }, [userChain]);

  useEffect(() => {
    if (web3 && address && web3ChainId === userChainId) {
      updateBalance(address, userChain, web3);
    } else if (web3ChainId !== userChainId) {
      updateUserInfo({ balance: 0 });
    }
  }, [web3, address, web3ChainId, updateBalance, updateUserInfo]);

  return (
    <PageContainer>
      <Head>
        <title>Info | Libre DeFi</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex justify-between items-center relative mb-5 dark:text-white mobile:flex-col mobile:justify-center">
        <div className="w-1/3 mobile:w-full">
          <h1 className="text-2xl font-semibold mobile:text-center">
            Libre Info & Analytics
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <ChainSelector />
        </div>
        <div className="flex items-center mobile:mt-7 w-1/3 mobile:w-full">
          <SVG_LIBRE1 width="33" height="33" />
          <span className="text-xl ml-1">
            <strong>{formatNumber(balance)}</strong> LIBRE
          </span>
        </div>
      </div>
      {chartsData ? <Chart data={chartsData} /> : null}
      {lastDayBlock &&
        !loadingTokensNow &&
        !loadingTokensPast &&
        !loadingTopTokens &&
        !loadingTopPools &&
        !loadingPoolPast &&
        tokensNow &&
        !loadingPoolsNow &&
        tokensNow.tokens &&
        tokensNow.tokens.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl text-black dark:text-white font-semibold">
              Top Tokens
            </h3>
            <div className="mt-7 rounded-xl bg-white dark:bg-third">
              <div className="flex py-6 text-black dark:text-white text-sm font-semibold ">
                <div className="w-20 text-center">#</div>
                <div className="flex-grow max-w-lg">TOKEN</div>
                <div className="w-40">PRICE</div>
                <div className="w-52">PRICE CHANGE</div>
                <div className="w-52">LIQUIDITY</div>
              </div>
              {tokensNow.tokens.map((token, index: number) => {
                const pastToken =
                  tokensPast &&
                  tokensPast.tokens &&
                  tokensPast.tokens.length > 0 &&
                  tokensPast.tokens.find((t) => t.id === token.id);
                let price = '';
                const [integer, decimals] = token.derivedUSD.split('.');
                if (!decimals) {
                  price = integer;
                } else {
                  if (+integer > 0) {
                    price = `${integer}.${decimals.slice(0, 2)}`;
                  } else if (decimals) {
                    price = `${integer}.${decimals.slice(
                      0,
                      decimals.split('').findIndex((c) => c === '0') + 3
                    )}`;
                  }
                }

                const priceUp = pastToken
                  ? parseFloat(token.derivedUSD) >
                    parseFloat(pastToken.derivedUSD)
                  : false;
                const priceChange = pastToken
                  ? parseFloat(
                      priceUp
                        ? (
                            parseFloat(token.derivedUSD) /
                            parseFloat(pastToken.derivedUSD)
                          ).toString()
                        : (
                            parseFloat(pastToken.derivedUSD) /
                            parseFloat(token.derivedUSD)
                          ).toString()
                    ) - 1
                  : 0;

                return (
                  <div
                    className="flex items-center py-6 text-black dark:text-white text-sm font-semibold"
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.31)',
                    }}
                    key={token.id}
                  >
                    <div className="w-20 text-center">{index + 1}</div>
                    <div className="flex-grow max-w-lg">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`/assets/icons/${token.symbol.toLowerCase()}.svg`}
                          width={33}
                          height={33}
                        />
                        {token.name} ({token.symbol})
                      </div>
                    </div>
                    <div className="w-40">${price}</div>
                    <div
                      className="w-52"
                      style={{
                        color: priceUp ? '#17C671' : priceChange && '#EA3943',
                      }}
                    >
                      {priceChange ? (
                        <FontAwesomeIcon
                          icon={priceUp ? faCaretUp : faCaretDown}
                        />
                      ) : null}
                      &nbsp;
                      {priceChange.toFixed(2)}%
                    </div>
                    <div className="w-52">
                      $
                      {formatNumber(
                        parseFloat(token.totalLiquidity) *
                          parseFloat(token.derivedUSD)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      {lastDayBlock &&
        poolsNow &&
        poolsNow.pairs &&
        poolsNow.pairs.length > 0 &&
        poolsPast &&
        poolsPast.pairs &&
        poolsPast.pairs.length > 0 &&
        !loadingTokensNow &&
        !loadingTokensPast &&
        !loadingTopTokens &&
        !loadingTopPools &&
        !loadingPoolsNow &&
        !loadingPoolPast && (
          <div className="mt-12">
            <h3 className="text-2xl text-black dark:text-white font-semibold">
              Top Pools
            </h3>
            <div className="mt-7 rounded-xl bg-white dark:bg-third">
              <div className="flex py-6 text-black dark:text-white text-sm font-semibold ">
                <div className="w-20 text-center">#</div>
                <div className="flex-grow max-w-lg">POOL</div>
                <div className="w-40">VOLUME 24H</div>
                <div className="w-52">LP REWARDS 24H</div>
                <div className="w-52">LIQUIDITY</div>
              </div>
              {poolsNow.pairs.map((pool, index) => {
                const pastPool = poolsPast.pairs.find(
                  (pair) => pair.id === pool.id
                );
                return (
                  <div
                    className="flex items-center py-6 text-black dark:text-white text-sm font-semibold"
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.31)',
                    }}
                    key={pool.id}
                  >
                    <div className="w-20 text-center">{index + 1}</div>
                    <div className="flex-grow max-w-lg">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`/assets/icons/${pool.name
                            .split('-')[0]
                            .toLowerCase()}.svg`}
                          width={33}
                          height={33}
                        />
                        <div className="-ml-3 inline-flex">
                          <Image
                            src={`/assets/icons/${pool.name
                              .split('-')[1]
                              .toLowerCase()}.svg`}
                            width={33}
                            height={33}
                          />
                        </div>
                        {pool.name.toUpperCase()} &nbsp; LP
                      </div>
                    </div>
                    <div className="w-40">
                      $
                      {(
                        parseFloat(pool.volumeUSD) -
                        parseFloat(pastPool.volumeUSD)
                      ).toFixed(2)}
                    </div>
                    <div className="w-52">
                      $
                      {(
                        (parseFloat(pool.volumeUSD) -
                          parseFloat(pastPool.volumeUSD)) *
                        0.0017
                      ).toFixed(2)}
                    </div>
                    <div className="w-52">${formatNumber(pool.reserveUSD)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </PageContainer>
  );
}
