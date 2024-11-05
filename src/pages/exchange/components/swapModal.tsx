/* eslint-disable @next/next/no-img-element */
import { useState, Fragment, useRef, useEffect } from 'react';

import {
  WETH as WETH_BSC,
  ChainId as ChainIdBSC,
} from '@libre-defi/bsc-swap-sdk';
import {
  WETH as WETH_AVALANCHE,
  ChainId as ChainIdAVALANCHE,
} from '@libre-defi/avalanche-swap-sdk';
import {
  WETH as WETH_POLYGON,
  ChainId as ChainIdPOLYGON,
} from '@libre-defi/polygon-swap-sdk';
import Web3 from 'web3';

import {
  EXPLORERS,
  CHAINS,
  ROUTER_ADDRESS_BSC,
  ROUTER_ADDRESS_AVALANCHE,
  ROUTER_ADDRESS_POLYGON,
} from '../../../constants';
import WETH_ABI from 'constants/abis/weth.json';
import { RouterABI } from 'constants/abis/Router';
import {
  useAppFacade,
  useUserFacade,
  useWeb3Facade,
  useLunarFacade,
} from 'state';
import { BigNumber } from '@ethersproject/bignumber';
import { Modal, Button, Spinner } from 'components';
import { SVG_LIBRE1, SVG_SUCCESS, SVG_METAMASK } from 'assets/icons';

type Props = {
  showSwapModal: boolean;
  setShowSwapModal: any;
  swapCase: number;
  amountIn?: string;
  amountOut?: string;
  path?: string[];
  deadline?: number;
  address?: string;
  token0?: any;
  token1?: any;
  priceImpact?: string;
  displayRate?: any;
};

const SwapModal: React.FC<Props> = ({
  showSwapModal,
  setShowSwapModal,
  swapCase,
  amountIn,
  amountOut,
  path,
  deadline,
  address,
  token0,
  token1,
  priceImpact,
  displayRate,
}) => {
  const { userState, updateBalance } = useUserFacade();
  const { chain: userChain } = userState;
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const [swapping, setSwapping] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const ROUTER_ADDRESS =
    userChain === 'BSC'
      ? ROUTER_ADDRESS_BSC
      : userChain === 'AVAX'
      ? ROUTER_ADDRESS_AVALANCHE
      : ROUTER_ADDRESS_POLYGON;
  const ChainId =
    userChain === 'BSC'
      ? ChainIdBSC
      : userChain === 'AVAX'
      ? ChainIdAVALANCHE
      : ChainIdPOLYGON;
  const WETH =
    userChain === 'BSC'
      ? WETH_BSC
      : userChain === 'AVAX'
      ? WETH_AVALANCHE
      : WETH_POLYGON;

  async function swapModalFunction() {
    setSwapping(true);
    const wethContract = new web3.eth.Contract(
      WETH_ABI,
      WETH[ChainId.MAINNET].address
    );
    const pancake_router = new web3.eth.Contract(RouterABI, ROUTER_ADDRESS);
    // Gas Price Calculation
    // const gasPrice = await web3.eth.getGasPrice().then((result: any) => {
    //   console.log(web3.utils.fromWei(result, 'ether'))
    //   })

    // add 20% margin for safety purpose
    function calculateGasMargin(value: BigNumber): BigNumber {
      return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000));
    }
    let result;
    try {
      switch (swapCase) {
        case 0:
          const gasLimitEthtoToken = await pancake_router.methods
            .swapExactETHForTokens(amountOut, path, address, deadline)
            .estimateGas({ value: amountIn, from: address })
            .then()
            .catch((error: any) => {
              console.error(`estimateGas failed`, error);
            });

          result = await pancake_router.methods
            .swapExactETHForTokens(amountOut, path, address, deadline)
            .send({
              from: address,
              value: amountIn,
              gasLimit: calculateGasMargin(BigNumber.from(gasLimitEthtoToken)),
            });
          setTransactionHash(result.transactionHash);
          break;
        case 1:
          const gasLimitTokentoEth = await pancake_router.methods
            .swapExactTokensForETH(amountIn, amountOut, path, address, deadline)
            .estimateGas({ from: address })
            .then()
            .catch((error: any) => {
              console.error(`estimateGas failed`, error);
            });
          result = await pancake_router.methods
            .swapExactTokensForETH(amountIn, amountOut, path, address, deadline)
            .send({
              from: address,
              gasLimit: calculateGasMargin(BigNumber.from(gasLimitTokentoEth)),
            });
          setTransactionHash(result.transactionHash);
          break;
        case 2:
          // path = ['0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', '0x63db060697b01c6f4a26561b1494685DcbBd998c']
          // console.log(amountIn, amountOut, path, address, deadline)
          // const gasLimitTokentoToken = await pancake_router.methods
          //   .swapExactTokensForTokens(amountIn, amountOut, path, address, deadline)
          //   .estimateGas({ from: address })
          //   .then( () => console.log(gasLimitTokentoToken, "108")
          //   )
          //   .catch((error: any) => {
          //     console.error(`estimateGas failed`, error);
          //   });

          result = await pancake_router.methods
            .swapExactTokensForTokens(
              amountIn,
              amountOut,
              path,
              address,
              deadline
            )
            .send({
              from: address,
            });
          setTransactionHash(result.transactionHash);
          break;
        case 3:
          const gasLimitBNBtoWBNB = await wethContract.methods
            .deposit()
            .estimateGas({ from: address, value: amountIn })
            .then()
            .catch((error: any) => {
              console.error(`estimateGas failed`, error);
            });
          result = await wethContract.methods.deposit().send({
            from: address,
            value: amountIn,
            gasLimit: calculateGasMargin(BigNumber.from(gasLimitBNBtoWBNB)),
          });
          setTransactionHash(result.transactionHash);
          break;
        case 4:
          const gasLimitWBNBtoBNB = await wethContract.methods
            .withdraw(amountIn)
            .estimateGas({ from: address })
            .then()
            .catch((error: any) => {
              console.error(`estimateGas failed`, error);
            });

          result = await wethContract.methods.withdraw(amountIn).send({
            from: address,
            gasLimit: calculateGasMargin(BigNumber.from(gasLimitWBNBtoBNB)),
          });
          setTransactionHash(result.transactionHash);
          break;
      }
    } catch (err) {
      setSwapping(false);
      setShowSwapModal(false);
      return;
    }
    setSwapping(false);
    // setShowSwapModal(false);
  }
  // to calculate the decimal number in string format rather
  // than exponential format
  function toFixed(x: any) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = '0.' + new Array(e).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join('0');
      }
    }
    return x;
  }

  //  In Uniswap V2 , Liquidity Provider Fee is hard-coded
  //  Liquidity Provider Fee = 0.25

  let LiqFee = toFixed(
    (parseFloat(Web3.utils.hexToNumberString(amountIn)) / 10 ** token0
      ? token0.decimals
      : 18) * 0.0025
  );

  // LiqFee = parseFloat(LiqFee).toPrecision(10)

  const addTokenToMetamask = async () => {
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: token1.address, // The address that the token is at.
          symbol: token1.symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: token1.decimals, // The number of decimals in the token
        },
      },
    });
  };

  return (
    <>
      {showSwapModal ? (
        <Modal
          isOpen={showSwapModal}
          hide={() => {
            !swapping && setShowSwapModal(false);
          }}
          title={transactionHash ? 'Success' : 'Confirm Swap'}
        >
          <div className="w-96">
            {swapping ? (
              <>
                <div className="mt-10 text-center">
                  <Spinner />
                  <h3 className="text-lg font-semibold">Please Wait...</h3>
                  <h2 className="mt-2 text-3xl font-semibold">
                    Swapping Token
                  </h2>
                </div>
              </>
            ) : (
              <>
                {transactionHash ? (
                  <>
                    <div className="flex flex-col items-center">
                      <SVG_SUCCESS />
                      <h2 className="text-3xl font-semibold mt-6">
                        Transaction Submitted
                      </h2>
                      <a
                        href={
                          transactionHash
                            ? `${EXPLORERS[web3ChainId]}/tx/${transactionHash}`
                            : '#'
                        }
                        className="text-primary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on {CHAINS[userChain].explorer}
                      </a>
                      <div
                        className="w-full flex items-center justify-center gap-3 font-bold py-2 rounded-lg cursor-pointer mt-7"
                        style={{ backgroundColor: '#EEECF0' }}
                        onClick={addTokenToMetamask}
                      >
                        <SVG_METAMASK width={33} />
                        Add {token1.symbol} to Metamask
                      </div>
                      <Button
                        className="mt-7 w-full"
                        onClick={() => setShowSwapModal(false)}
                        variant="primary"
                      >
                        Close
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between w-96">
                      <div className="flex items-center">
                        <img
                          alt="currency logo"
                          className="h-10 mr-3"
                          src={token0.logoURI}
                        />
                        <p className="text-3xl font-semibold">
                          {token0 &&
                            (
                              web3.utils.hexToNumberString(amountIn) /
                              10 ** token0.decimals
                            ).toPrecision(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-black">
                          {' '}
                          {token0.symbol}{' '}
                        </p>
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 mt-4 mb-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <img
                          alt="currency logo"
                          className="h-10 mr-3"
                          src={token1.logoURI}
                        />
                        <p className="text-3xl font-semibold">
                          {token1 &&
                            (
                              web3.utils.hexToNumberString(amountOut) /
                              10 ** token1.decimals
                            ).toPrecision(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-black">
                          {' '}
                          {token1.symbol}{' '}
                        </p>
                      </div>
                    </div>
                    <p className="mt-5 text-sm font-medium text-center text-black">
                      Output is estimated. You will receive at least{' '}
                      <strong className="font-bold">
                        {token1 &&
                          (
                            web3.utils.hexToNumberString(amountOut) /
                            10 ** token1.decimals
                          ).toPrecision(6)}{' '}
                        {'  '}
                        {token1.symbol}
                      </strong>{' '}
                      or the transaction will be revert.
                    </p>

                    <div className="px-4 py-2 mt-4 text-xs rounded bg-grayBackground">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Price</div>
                        <p className="font-medium">
                          1 {token0.symbol} = {displayRate} {token1.symbol}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Min. received</div>
                        <p className="font-medium">
                          {token1 &&
                            (
                              web3.utils.hexToNumberString(amountOut) /
                              10 ** token1.decimals
                            ).toPrecision(6)}{' '}
                          {token1.symbol}{' '}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Price Impact</div>
                        <p className="font-medium">{priceImpact} </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Fee</div>
                        <p className="font-medium">
                          {LiqFee} {token0.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="flex pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSwapModal(false);
                        }}
                        className="w-1/2 p-3 px-4 mr-2 text-white bg-gray-400 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          swapModalFunction();
                        }}
                        className="w-1/2 p-3 px-4 text-white border rounded-lg bg-primary modal-close hover:bg-white hover:text-primary"
                      >
                        Swap Token
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Modal>
      ) : null}
    </>
  );
};
export default SwapModal;
