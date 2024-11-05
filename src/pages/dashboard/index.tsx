import { useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import Image from 'next/image';
import Head from 'next/head';
import InputRange from 'react-input-range';

import { useModal } from 'hooks';
import {
  useAppFacade,
  useUserFacade,
  useWeb3Facade,
  useLunarFacade,
} from 'state';
import {
  StakingContract,
  TokenContract,
  FarmingContract,
  ApyContract,
} from 'contracts';
import { CHAINS, RPC_URLS, LP_PAIRS } from '../../constants';
import { formatNumber, parseInt } from 'utils';

import {
  PageContainer,
  Button,
  StakingModal,
  ClaimRewardsModal,
  Input,
  ChainSelector,
} from 'components';
import { SVG_LIBRE1, SVG_CARET_DOWN } from 'assets/icons';

export default function Staking() {
  const { appEnv } = useAppFacade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { lunarState } = useLunarFacade();

  useEffect(() => {
    if (userChain) {
      const web3 = new Web3(RPC_URLS[userChain].prod);
      const pairs = LP_PAIRS[userChain];
      let tvl = 0;

      for (let i = 0; i < pairs.length; i++) {
        ApyContract.LPtoUSD(pairs[i].address[userChainId], userChain, web3)
          .then((res) => {
            tvl +=
              parseInt(Web3.utils.fromWei(res.LPToUSD)) *
              parseInt(Web3.utils.fromWei(res.totalLP));
          })
          .catch((err) => console.log('GetAPY - ', err));
      }
    }
  }, [userChain]);

  return (
    <PageContainer>
      <Head>
        <title>Staking | Libre DeFi</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex justify-between items-center relative mb-5 dark:text-white mobile:flex-col mobile:justify-center">
        <div>
          <h1 className="text-4xl font-semibold mobile:text-center">
            Dashboard
          </h1>
          <h3 className="text-base">Libre DeFi Info & Analytics</h3>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mobile:static mobile:transform-none mobile:mt-6">
          <ChainSelector />
        </div>
        <div className="flex items-center mobile:mt-7">
          <SVG_LIBRE1 width="33" height="33" />
          <span className="text-xl ml-1">
            <strong>{formatNumber(balance)}</strong> LIBRE
          </span>
        </div>
      </div>
    </PageContainer>
  );
}
