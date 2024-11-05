/* eslint-disable @next/next/no-img-element */
import { useState, Fragment, useRef, useEffect } from 'react';
import { parseUnits } from '@ethersproject/units'
import { Modal } from 'components';
import { ETHER as ETHER_BSC, JSBI as JSBI_BSC } from '@libre-defi/bsc-swap-sdk';
import {
  ETHER as ETHER_POLYGON,
  JSBI as JSBI_POLYGON,
} from '@libre-defi/polygon-swap-sdk';
import {
  ETHER as ETHER_AVALANCHE,
  JSBI as JSBI_AVALANCHE,
} from '@libre-defi/avalanche-swap-sdk';
import { BigNumber, ethers } from 'ethers';
import Web3 from 'web3';
import {
  RouterABI,
  ROUTER_ADDRESS_AVALANCHE,
  ROUTER_ADDRESS_BSC,
  ROUTER_ADDRESS_POLYGON,
} from '../../../constants';
import { useUserFacade, useWeb3Facade } from 'state';

type Props = {
  display: boolean;
  setDisplay: any;
  tokenA: any;
  tokenB: any;
  amountADesired: any;
  amountBDesired: any;
  cases: number;
  exchangeRate: any;
  liquidity: string;
  newPool: boolean;
  supplyPercent: number | any;
};

const SupplyModal: React.FC<Props> = ({
  display,
  setDisplay,
  tokenA,
  tokenB,
  exchangeRate,
  amountADesired,
  amountBDesired,
  cases,
  liquidity,
  newPool,
  supplyPercent,
}) => {
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;

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

  async function CreateSupply() {
    const pancake_router = new web3.eth.Contract(RouterABI, ROUTER_ADDRESS);

    function addSlippage(value: String) {
      return JSBI.divide(
        JSBI.multiply(JSBI.BigInt(value), JSBI.BigInt(10000 - 50)),
        JSBI.BigInt(10000)
      ).toString();
    }
    const amountADesiredString = ethers.utils.parseUnits(
      String(amountADesired),
      tokenA.decimals
    );
   
    const amountBDesiredString = ethers.utils.parseUnits(
      String(amountBDesired),
      tokenB.decimals
    );

    var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    let amountBMin, amountAMin, tokenAddress, amountDesired, msgValue;
    if (cases === 0) {
      if (tokenA.symbol === ETHER.symbol) {
        amountAMin = addSlippage(amountADesiredString.toString());
        amountBMin = addSlippage(amountBDesiredString.toString());
        tokenAddress = tokenB.address;
        msgValue = amountADesiredString;
        amountDesired = amountBDesiredString;
      } else {
        amountAMin = addSlippage(amountBDesiredString.toString());
        amountBMin = addSlippage(amountADesiredString.toString());
        tokenAddress = tokenA.address;
        msgValue = amountBDesiredString;
        amountDesired = amountADesiredString;
      }
    } else if (cases === 1) {
      amountAMin = addSlippage(amountADesiredString.toString());
      amountBMin = addSlippage(amountBDesiredString.toString());
    }

    switch (cases) {
      case 0:
        const gas = await pancake_router.methods
          .addLiquidityETH(
            tokenAddress,
            amountDesired.toString(),
            amountBMin.toString(),
            amountAMin.toString(),
            address,
            deadline
          )
          .estimateGas({ from: address, value: msgValue.toString() })
          .then((res: any) => {
            console.log(res);
          })
          .catch((err: any) => {
            console.log(err);
          });
        await pancake_router.methods
          .addLiquidityETH(
            tokenAddress,
            amountDesired.toString(),
            amountBMin.toString(),
            amountAMin.toString(),
            address,
            deadline
          )
          .send({
            from: address,
            value: msgValue.toString(),
            gasLimit: gas,
          });
        break;
      case 1:
        const gasTokenToToken = await pancake_router.methods
          .addLiquidity(
            tokenA.address,
            tokenB.address,
            amountADesiredString,
            amountBDesiredString,
            amountAMin.toString(),
            amountBMin.toString(),
            address,
            deadline
          )
          .estimateGas({ from: address })
          .then((res: any) => {})
          .catch((err: any) => {
            console.log(err);
          });
        await pancake_router.methods
          .addLiquidity(
            tokenA.address,
            tokenB.address,
            amountADesiredString,
            amountBDesiredString,
            amountAMin.toString(),
            amountBMin.toString(),
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
          title="Success :"
          isOpen={display}
          hide={() => {
            setDisplay(false);
          }}
        >
          {newPool ? (
            <div>
              <div className="flex">
                <p className="flex items-center p-2 text-2xl font-semibold">
                  {liquidity}
                </p>
                <img className="h-12 m-2" src={tokenA.logoURI} alt="logo" />
                <img className="h-12 m-2" src={tokenB.logoURI} alt="logo" />
              </div>
              <div className="flex items-center text-3xl font-medium text-black">
                <p>{tokenA.symbol}</p> /<p>{tokenB.symbol}</p> &nbsp; Pool
                Tokens
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold">You are creating a Pool </div>
          )}
          <div className="text-sm">
            Output is estimated. If the price changes by more than 0.5% your
            transaction will revert.
          </div>
          <div className="flex justify-between py-4">
            <div className="flex flex-col gap-3">
              <p>{tokenA.symbol} Deposited</p>
              <p> {tokenB.symbol} Deposited </p>
              <p>Rates</p>
              <p>Share of Pool</p>
            </div>
            <div className="flex flex-col items-end gap-3 justify-items-end">
              <div className="flex items-center ">
                <img className="h-6 px-2" src={tokenA.logoURI} alt="logo" />
                <p>{Number(amountADesired).toFixed(tokenA.decimals)}</p>
              </div>
              <div className="flex items-center ">
                <img className="h-6 px-2" src={tokenB.logoURI} alt="logo" />
                <p>{Number(amountBDesired).toFixed(tokenB.decimals)}</p>
              </div>
              <div className="flex flex-col items-center text-sm">
                <p>
                  {'1 ' +
                    tokenA.symbol +
                    ' = ' +
                    parseFloat(exchangeRate).toPrecision(6) +
                    tokenB.symbol}
                </p>
                <p>
                  {'1 ' +
                    tokenB.symbol +
                    ' = ' +
                    parseFloat((1 / exchangeRate).toString()).toPrecision(6) +
                    tokenA.symbol}
                </p>
              </div>
              <div className="flex items-center ">
                {newPool ? (
                  <p>
                    {' '}
                    {supplyPercent
                      ? `${
                          supplyPercent.toFixed(2) === '0.00'
                            ? '<0.01'
                            : supplyPercent.toFixed(2) > 100.0
                            ? '100.00'
                            : supplyPercent.toFixed(2)
                        }%`
                      : '-'}{' '}
                  </p>
                ) : (
                  <p>100%</p>
                )}
              </div>
            </div>
          </div>
          <div>
            <button
              type="button"
              className="w-full p-3 font-semibold text-white rounded-xl bg-primary"
              onClick={() => {
                CreateSupply();
              }}
            >
              {' '}
              Create Supply
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
};
export default SupplyModal;
