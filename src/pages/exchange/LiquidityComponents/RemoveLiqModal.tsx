/* eslint-disable @next/next/no-img-element */

import { ETHER as ETHER_BSC, JSBI as JSBI_BSC } from '@libre-defi/bsc-swap-sdk';
import {
  ETHER as ETHER_POLYGON,
  JSBI as JSBI_POLYGON,
} from '@libre-defi/polygon-swap-sdk';
import {
  ETHER as ETHER_AVALANCHE,
  JSBI as JSBI_AVALANCHE,
} from '@libre-defi/avalanche-swap-sdk';
import react, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'components';
import { ethers } from 'ethers';
import { useUserFacade, useWeb3Facade } from 'state';
import { RouterABI } from 'constants/abis';
import { parseUnits } from '@ethersproject/units'
import {
  ROUTER_ADDRESS_BSC,
  ROUTER_ADDRESS_AVALANCHE,
  ROUTER_ADDRESS_POLYGON,
} from '../../../constants';
import Web3 from 'web3';

type Props = {
  display: boolean;
  setDisplay: any;
  tokenA: any;
  tokenB: any;
  exchangeRate: any;
  liquidity: any;
  amountA: any;
  amountB: any;
  cases: number;
};

const RemoveLiqModal: React.FC<Props> = ({
  display,
  setDisplay,
  tokenA,
  tokenB,
  amountA,
  amountB,
  exchangeRate,
  cases,
  liquidity,
}) => {
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const { address, balance, chain: userChain } = userState;

  const ROUTER_ADDRESS =
    userChain === 'BSC'
      ? ROUTER_ADDRESS_BSC
      : userChain === 'AVAX'
      ? ROUTER_ADDRESS_AVALANCHE
      : ROUTER_ADDRESS_POLYGON;
  const ETHER =
    userChain === 'BSC'
      ? ETHER_BSC
      : userChain === 'AVAX'
      ? ETHER_AVALANCHE
      : ETHER_POLYGON;
  const JSBI =
    userChain === 'BSC'
      ? JSBI_BSC
      : userChain === 'AVAX'
      ? JSBI_AVALANCHE
      : JSBI_POLYGON;

  const NumericA = amountA ? amountA.toSignificant(3) : 0;
  const NumericB = amountB ? amountB.toSignificant(3) : 0;
  const NumbericLiq = Number(liquidity ) ? Number(liquidity).toFixed(15) : 0;
  function addSlippage(value: String) {
    return JSBI.divide(
      JSBI.multiply(JSBI.BigInt(value), JSBI.BigInt(10000 - 50)),
      JSBI.BigInt(10000)
    ).toString();
  }

  async function setValue() {
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const pancake_router = new web3.eth.Contract(RouterABI, ROUTER_ADDRESS);
    let TokenAddress,
      liquidityString,
      amountTokenMin,
      amountEthMin,
      amountBMin,
      amountAMin;
    if (cases === 0) {
      if (tokenA.symbol === ETHER.symbol) {
        TokenAddress = tokenB.address;
        liquidityString = parseUnits(NumbericLiq.toString(), 18);
        amountEthMin = parseUnits(NumericA.toString(), tokenA.decimals);
        amountTokenMin = parseUnits(NumericB.toString(), tokenB.decimals);
      } else {
        TokenAddress = tokenA.address;
        liquidityString = parseUnits(NumbericLiq.toString(), 18);
        amountEthMin = parseUnits(NumericB.toString(), tokenB.decimals);
        amountTokenMin = parseUnits(NumericA.toString(), tokenA.decimals);
      }
    } else if (cases === 1) {
      liquidityString = parseUnits(NumbericLiq.toString(), 18);
      amountBMin = parseUnits(NumericB.toString(), tokenB.decimals);
      amountAMin = parseUnits(NumericA.toString(), tokenA.decimals);
    }
    switch (cases) {
      case 0:
        const gas = await pancake_router.methods
          .removeLiquidityETH(
            TokenAddress,
            liquidityString.toString(),
            addSlippage(amountTokenMin.toString()),
            addSlippage(amountEthMin.toString()),
            address,
            deadline
          )
          .estimateGas({ from: address })
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
        await pancake_router.methods
          .removeLiquidityETH(
            TokenAddress,
            liquidityString.toString(),
            addSlippage(amountTokenMin.toString()),
            addSlippage(amountEthMin.toString()),
            address,
            deadline
          )
          .send({ from: address, gasLimit: gas });

        break;
      case 1:
        const gasTokenToToken = await pancake_router.methods
          .removeLiquidity(
            tokenA.address,
            tokenB.address,
            liquidityString.toString(),
            addSlippage(amountAMin.toString()),
            addSlippage(amountBMin.toString()),
            address,
            deadline
          )
          .estimateGas({ from: address })
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
        await pancake_router.methods
          .removeLiquidity(
            tokenA.address,
            tokenB.address,
            liquidityString.toString(),
            addSlippage(amountAMin.toString()),
            addSlippage(amountBMin.toString()),
            address,
            deadline
          )
          .send({ from: address, gasLimit: gasTokenToToken });
        break;
    }
  }

  return (
    <>
      {display ? (
        <Modal
          title="Remove Liquidity"
          isOpen={display}
          hide={() => {
            setDisplay(false);
          }}
        >
          <div className="p-2">
            <div className="flex flex-col gap-y-3">
              <div className="flex justify-between p-4">
                <div className="flex items-center text-lg font-bold">
                  {NumericA.toString()}
                </div>

                <div>
                  {tokenA ? (
                    <div className="flex items-center">
                      <img className="h-8" src={tokenA.logoURI} alt="logo" />
                      &emsp;
                      <p className="text-sm font-bold">{tokenA.symbol}</p>
                    </div>
                  ) : null}
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mx-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <div className="flex justify-between p-4">
                <div className="flex items-center text-lg font-bold">
                  {NumericB.toString()}
                </div>
                <div>
                  {tokenB ? (
                    <div className="flex items-center">
                      <img className="h-8" src={tokenB.logoURI} alt="logo" />{' '}
                      &emsp;
                      <p className="text-sm font-bold">{tokenB.symbol}</p>
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="mx-2 text-sm font-semibold">
                Output is estimated. If the price changes by more than 0.5% your
                transaction will revert.
              </p>
              <div className="flex justify-between p-4">
                <div>
                  {tokenB && tokenA ? (
                    <div className="flex items-center">
                      <p className="font-semibold">
                        {' '}
                        {tokenA.symbol + ' / ' + tokenB.symbol + ' Burned'}{' '}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div>
                  {tokenB && tokenA ? (
                    <div className="flex flex-row items-center">
                      <img className="h-6" src={tokenA.logoURI} alt="logo" />
                      <img className="h-6" src={tokenB.logoURI} alt="logo" />
                      <div className="text-sm font-bold">
                        {NumbericLiq.toString()}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex justify-between p-4">
                <div className="text-sm font-bold">Price </div>
                <div className="text-sm font-semibold text-right">
                  <p>
                    1 {tokenA.symbol} = {exchangeRate} {tokenB.symbol}
                  </p>
                  <p>
                    1 {tokenB.symbol} = {(1 / exchangeRate).toFixed(10)}{' '}
                    {tokenA.symbol}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="w-full p-2 my-3 font-semibold text-white rounded-xl bg-primary "
              onClick={() => setValue()}
            >
              Remove Liquidity
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
};
export default RemoveLiqModal;
