/* eslint-disable @next/next/no-img-element */
import {
  Pair as PairBSC,
  Fetcher as FetcherBSC,
  Route as RouteBSC,
  ETHER as ETHER_BSC,
  WETH as WETH_BSC,
  ChainId as ChainIdBSC,
  JSBI as JSBI_BSC,
  TokenAmount as TokenAmountBSC,
  Token as TokenBSC
} from '@libre-defi/bsc-swap-sdk';
import {
  Pair as PairPolygon,
  Fetcher as FetcherPolygon,
  Route as RoutePolygon,
  ETHER as ETHER_Polygon,
  WETH as WETH_Polygon,
  ChainId as ChainIdPolygon,
  JSBI as JSBI_Polygon,
  TokenAmount as TokenAmountPolygon,
  Token as TokenPolygon
} from '@libre-defi/polygon-swap-sdk';
import {
  Pair as PairAvalanche,
  Fetcher as FetcherAvalanche,
  Route as RouteAvalanche,
  ETHER as ETHER_Avalanche,
  WETH as WETH_Avalanche,
  ChainId as ChainIdAvalanche,
  JSBI as JSBI_Avalanche,
  TokenAmount as TokenAmountAvalanche,
  Token as TokenAvalanche
} from '@libre-defi/avalanche-swap-sdk';
import InputRange from 'react-input-range';
import { parseUnits } from '@ethersproject/units'
import {
  Bep20ABI,
  PairABI,
  RouterABI,
  ROUTER_ADDRESS_AVALANCHE,
  ROUTER_ADDRESS_BSC,
  ROUTER_ADDRESS_POLYGON,
} from '../../../constants';
import { BigNumber, ethers } from 'ethers';
import React, { useState, useEffect } from 'react';
import { useWeb3Facade, useUserFacade } from 'state';

import Web3 from 'web3';

type IRemoveLiquidityProps = {
  token0: any;
  token1: any;
  setLoading: (loading: boolean) => void;
  setTransactionHash: (transactionHash: string) => void;
};

const RemoveLiquidity: React.FC<IRemoveLiquidityProps> = ({
  token0,
  token1,
  setLoading,
  setTransactionHash,
}) => {
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const { address, balance, chain: userChain } = userState;

  const Fetcher =
    userChain === 'BSC'
      ? FetcherBSC
      : userChain === 'AVAX'
      ? FetcherAvalanche
      : FetcherPolygon;
  const customHttpProvider = new ethers.providers.JsonRpcProvider(
    userChain === 'BSC'
      ? 'https://bsc-dataseed.binance.org/'
      : userChain === 'AVAX'
      ? 'https://api.avax.network/ext/bc/C/rpc'
      : 'https://polygon-rpc.com'
  );
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
      ? ETHER_Avalanche
      : ETHER_Polygon;
  const ChainId =
    userChain === 'BSC'
      ? ChainIdBSC
      : userChain === 'AVAX'
      ? ChainIdAvalanche
      : ChainIdPolygon;
  const WETH =
    userChain === 'BSC'
      ? WETH_BSC
      : userChain === 'AVAX'
      ? WETH_Avalanche
      : WETH_Polygon;
  const JSBI =
    userChain === 'BSC'
      ? JSBI_BSC
      : userChain === 'AVAX'
      ? JSBI_Avalanche
      : JSBI_Polygon;
  const TokenAmount =
    userChain === 'BSC'
      ? TokenAmountBSC
      : userChain === 'AVAX'
      ? TokenAmountAvalanche
      : TokenAmountPolygon;
  const Pair =
    userChain === 'BSC'
      ? PairBSC
      : userChain === 'AVAX'
      ? PairAvalanche
      : PairPolygon;
  const Token =
      userChain === 'BSC'
        ? TokenBSC
        : userChain === 'AVAX'
        ? TokenAvalanche
        : TokenPolygon;
  const Route =
    userChain === 'BSC'
      ? RouteBSC
      : userChain === 'AVAX'
      ? RouteAvalanche
      : RoutePolygon;

  // const [token0, setToken0] = useState();
  // const [token1, setToken1] = useState();
  const [showModal0, setShowModal0] = useState<boolean>(false);
  const [showModal1, setShowModal1] = useState<boolean>(false);
  const [totalSupply, setTotalSupply] = useState<TokenAmount>();
  const [liquidity, setLiquidity] = useState<TokenAmount>();
  const [pairs, setPairs] = useState<Pair>();
  const [showRemove, setShowRemove] = useState<boolean>(false);
  const [buttonToggle, setButtonToggle] = useState<boolean>(false);
  const [buttonToggleEnable, setButtonToggleEnable] = useState<boolean>(false);
  const [balance0, setBalance0] = useState<TokenAmount>();
  const [balance1, setBalance1] = useState<TokenAmount>();
  const [lpAmount, setLPAmount] = useState<string>('0');
  const [exchangeRate, setExchangeRate] = useState<string>();
  const [allowance, setAllowance] = useState();
  const [cases, setCases] = useState<number>(0);
  const [percentage, setPercentage] = useState(100);

  async function handleAmountChange(v) {
    if (pairs) {
      setLPAmount(v);
      let inputValue = Web3.utils.toWei(Number(v).toFixed(15));
      let displayLiq = new TokenAmount(
        pairs.liquidityToken,
        inputValue.toString()
      );

      if (pairs.token0.address === token0.address) {
        const LPAmountToken0 = pairs.getLiquidityValue(
          pairs.token0,
          totalSupply,
          displayLiq,
          false
        );
        setBalance0(LPAmountToken0);
        const LPAmountToken1 = pairs.getLiquidityValue(
          pairs.token1,
          totalSupply,
          displayLiq,
          false
        );
        setBalance1(LPAmountToken1);
      } else {
        const LPAmountToken0 = pairs.getLiquidityValue(
          pairs.token1,
          totalSupply,
          displayLiq,
          false
        );
        setBalance0(LPAmountToken0);
        const LPAmountToken1 = pairs.getLiquidityValue(
          pairs.token0,
          totalSupply,
          displayLiq,
          false
        );
        setBalance1(LPAmountToken1);
      }
    }
  }
  async function ApproveToken() {
    if (web3ChainId !== ChainId.MAINNET) {
    } else {
      if (pairs != undefined) {
        try {
          const PairContract = await new web3.eth.Contract(
            PairABI,
            pairs.liquidityToken.address
          );
          const maxAmt = web3.utils.toBN(
            '115792089237316195423570985008687907853269984665640564039457584007913129639935'
          );
          //   setApproving(true);
          const approveBool = await PairContract.methods
            .approve(ROUTER_ADDRESS, maxAmt)
            .send({ from: address });

          if (approveBool) {
            setButtonToggleEnable(!approveBool);
          }
        } catch (err) {
          console.log('Approving - ', err);
        }
      }
    }
  }

  async function TotalSupply() {
    if ((token0 && token1) !== undefined) {
      setButtonToggle(false);
      let Token0, Token1, pair: Pair;
      if (token0.address === WETH[ChainId.MAINNET].address) {
        Token0 = WETH[ChainId.MAINNET];
        Token1 = await Fetcher.fetchTokenData(
          token1.chainId,
          token1.address,
          customHttpProvider
        );
        pair = await Fetcher.fetchPairData(Token0, Token1, customHttpProvider);
        setPairs(pair);
        setCases(0);
      } else if (token1.address === WETH[ChainId.MAINNET].address) {
        Token0 = await Fetcher.fetchTokenData(
          token0.chainId,
          token0.address,
          customHttpProvider
        );
        Token1 = WETH[ChainId.MAINNET];
        pair = await Fetcher.fetchPairData(Token0, Token1, customHttpProvider);
        setPairs(pair);
        setCases(0);
      } else {
        Token0 = await Fetcher.fetchTokenData(
          token0.chainId,
          token0.address,
          customHttpProvider
        );
        Token1 = await Fetcher.fetchTokenData(
          token1.chainId,
          token1.address,
          customHttpProvider
        );
        pair = await Fetcher.fetchPairData(Token0, Token1, customHttpProvider);
        setCases(1);
        setPairs(pair);
      }
      const route = new Route([pair], Token0);
      setExchangeRate(route.midPrice.toSignificant(6));

      const PairContract = new web3.eth.Contract(
        PairABI,
        pair.liquidityToken.address
      );

      let TotalSupply = await PairContract.methods.totalSupply().call();
      TotalSupply = new TokenAmount(pair.liquidityToken, TotalSupply);

      setTotalSupply(TotalSupply);
      let _liquidity = await PairContract.methods.balanceOf(address).call();
      _liquidity = new TokenAmount(pair.liquidityToken, _liquidity);

      setLiquidity(_liquidity);
      if (_liquidity.toSignificant(6) > 0.0) {
        setButtonToggle(true);
      }
    }
  }
  async function calculateAllowance() {
    try {
      if (pairs != undefined) {
        setButtonToggleEnable(true);
        const PairContract = await new web3.eth.Contract(
          PairABI,
          pairs.liquidityToken.address
        );
        const allowance = await PairContract.methods
          .allowance(address, ROUTER_ADDRESS)
          .call();
        setAllowance(allowance);
        // setPriceImpact('0.0');
        if (lpAmount != null && allowance >= lpAmount) {
          setButtonToggleEnable(false);
        }
      }
    } catch (err) {
      console.log('allowance - ', err);
    }
  }

  useEffect(() => {
    TotalSupply()
      .then()
      .catch((err) => console.log(err));
  }, [token0, token1]);
  useEffect(() => {
    setPairs(pairs);
    setLiquidity(liquidity);
    setTotalSupply(totalSupply);
  }, [pairs, liquidity, totalSupply]);
  useEffect(() => {
    setBalance0(balance0);
  }, [balance0]);
  useEffect(() => {
    setLPAmount(lpAmount);
  }, [lpAmount]);
  useEffect(() => {
    setBalance1(balance1);
  }, [balance1]);
  useEffect(() => {
    setCases(cases);
  }, [cases]);
  useEffect(() => {
    calculateAllowance();
  }, [token0, token1, lpAmount]);

  useEffect(() => {
    handleAmountChange(
      (
        (parseFloat(liquidity ? liquidity.toSignificant(6) : '0') *
          percentage) /
        100
      ).toString()
    );
  }, [percentage, liquidity]);

  async function setValue() {
    function addSlippage(value: String) {
      return JSBI.divide(
        JSBI.multiply(JSBI.BigInt(value), JSBI.BigInt(10000 - 50)),
        JSBI.BigInt(10000)
      ).toString();
    }

    try {
      setLoading(true);
      var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
      const pancake_router = new web3.eth.Contract(RouterABI, ROUTER_ADDRESS);
      let TokenAddress,
        liquidityString,
        amountTokenMin,
        amountEthMin,
        amountBMin,
        amountAMin;
      const NumericA = balance0 ? balance0.toFixed(Number(token0.decimals)) : 0;
      const NumericB = balance1 ? balance1.toFixed(Number(token1.decimals)) : 0;
      const NumbericLiq = Number(lpAmount) ? Number(lpAmount).toFixed(15) : 0;

      if (cases === 0) {
        if (token0.address === WETH[ChainId.MAINNET].address) {
          TokenAddress = token1.address;
          liquidityString = parseUnits(NumbericLiq.toString(), 18);
          amountEthMin = parseUnits(NumericA.toString(), token0.decimals).toString();
          amountTokenMin = parseUnits(NumericB.toString(), token1.decimals).toString();
        } else {
          TokenAddress = token0.address;
          liquidityString = parseUnits(NumbericLiq.toString(), 18);
          amountEthMin = parseUnits(NumericB.toString(), token1.decimals).toString();
          amountTokenMin = parseUnits(NumericA.toString(), token0.decimals).toString();
        }
      } else if (cases === 1) {
        liquidityString = parseUnits(NumbericLiq.toString(), 18);
        amountBMin = parseUnits(NumericB.toString(), token1.decimals).toString();
        amountAMin = parseUnits(NumericA.toString(), token0.decimals).toString();
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
            .estimateGas({ from: address });
          const res = await pancake_router.methods
            .removeLiquidityETH(
              TokenAddress,
              liquidityString.toString(),
              addSlippage(amountTokenMin.toString()),
              addSlippage(amountEthMin.toString()),
              address,
              deadline
            )
            .send({ from: address, gasLimit: gas });
          setTransactionHash(res.transactionHash);
          break;
        case 1:
          const gasTokenToToken = await pancake_router.methods
            .removeLiquidity(
              token0.address,
              token1.address,
              liquidityString.toString(),
              addSlippage(amountAMin.toString()),
              addSlippage(amountBMin.toString()),
              address,
              deadline
            )
            .estimateGas({ from: address });
          const result = await pancake_router.methods
            .removeLiquidity(
              token0.address,
              token1.address,
              liquidityString.toString(),
              addSlippage(amountAMin.toString()),
              addSlippage(amountBMin.toString()),
              address,
              deadline
            )
            .send({ from: address, gasLimit: gasTokenToToken });
          setTransactionHash(result.transactionHash);
          break;
      }
    } catch (err) {
      console.log('err - ', err);
    }
    setLoading(false);
  }

  const EnableRemoveButton = () => {
    return (
      <>
        <div className="flex flex-row gap-4">
          <button
            type="button"
            onClick={() => {
              ApproveToken()
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
            }}
            className={`w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white border rounded-xl  ${
              buttonToggleEnable
                ? 'bg-primary'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Enable
          </button>
          <button
            type="button"
            onClick={() => {
              setValue();
            }}
            className={`w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white border bg-gray rounded-xl ${
              buttonToggleEnable
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary'
            }`}
          >
            Remove
          </button>
        </div>
      </>
    );
  };
  const ButtonCase = () => {
    return (
      <>
        {buttonToggle ? (
          <EnableRemoveButton />
        ) : (
          <button
            type="button"
            className="w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white bg-gray-400 border rounded-xl"
          >
            No Liquidity
          </button>
        )}
      </>
    );
  };

  return (
    <>
      <div className="p-4 mx-auto bg-white swap-component rounded-xl">
        <div>
          <p className="text-black font-semibold text-base">Amount</p>
          <p className="text-black font-semibold text-5xl">{percentage} %</p>
          <InputRange
            maxValue={100}
            minValue={0}
            value={percentage}
            step={5}
            onChange={(value) => {
              setPercentage(value as number);
            }}
          />
          <div className="grid grid-cols-4 gap-2 w-full mt-10">
            <button
              className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
              onClick={() => setPercentage(25)}
            >
              25%
            </button>
            <button
              className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
              onClick={() => setPercentage(50)}
            >
              50%
            </button>
            <button
              className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
              onClick={() => setPercentage(75)}
            >
              75%
            </button>
            <button
              className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
              onClick={() => setPercentage(100)}
            >
              MAX
            </button>
          </div>
          {/* <div className="flex gap-4 mb-8">
            <div className="flex items-center justify-between w-full py-4 overflow-hidden text-black bg-white border rounded-lg">
              <div className="flex items-center px-2 rounded-lg ms:flex ">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal0(true);
                  }}
                  className={`flex justify-center items-center px-3 py-2 text-md font-semibold text-black rounded-lg ${
                    !token0 && 'bg-primary text-white'
                  }`}
                >
                  {token0 == undefined ? (
                    <div className="flex items-center justify-between font-semibold">
                      <div className="mr-1 text-sm">Select Token A </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>{' '}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 p-1">
                      <img
                        className="mr-1 w-7 h-7"
                        alt="token logo"
                        src={token0.logoURI}
                      ></img>
                      <p> {token0.symbol}</p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 "
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>{' '}
                    </div>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between w-full py-4 overflow-hidden text-black bg-white border rounded-lg">
              <div className="flex items-center px-2 rounded-lg ms:flex ">
                {/* balance 
                <button
                  type="button"
                  onClick={() => {
                    setShowModal1(true);
                  }}
                  className={`flex justify-center items-center px-3 py-2 text-md text-black rounded-lg font-semibold ${
                    !token1 && 'bg-primary text-white'
                  }`}
                >
                  {!token1 ? (
                    <div className="flex items-center justify-between font-semibold">
                      <div className="mr-1 text-sm">Select Token B </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 "
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>{' '}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 p-1">
                      <img
                        className="w-7 h-7"
                        alt="token logo"
                        src={token1.logoURI}
                      ></img>
                      <p className="">{token1.symbol}</p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 "
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>{' '}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div> */}
          {/* Price and pool share */}
          {/* {!token0 || !token1 ? null : (
            <>
              <div className="w-full text-right">
                LP Balance : {liquidity ? liquidity.toSignificant(6) : null}
              </div>

              <div className="flex flex-col h-auto my-5 border rounded-xl">
                <div className="flex justify-between p-4">
                  <div>
                    <div className="text-base font-semibold">
                      {token0.symbol + ' : ' + token1.symbol + ' LP Pair'}
                    </div>
                    <InputComponent
                      amount={lpAmount}
                      setAmount={setLPAmount}
                      onChangeAmount={handleAmountChange}
                    />
                  </div>
                  <div className="flex">
                    <img className="h-10" src={token0.logoURI} alt="logo" />{' '}
                    &nbsp;
                    <img className="h-10" src={token1.logoURI} alt="logo" />
                  </div>
                </div>
              </div>
            </>
          )} */}
          {/* {!token0 || !token1 ? null : (
            <div className="flex justify-center w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 17l-4 4m0 0l-4-4m4 4V3"
                />
              </svg>
            </div>
          )} */}
          {!token0 || !token1 ? null : (
            <div className="mt-6">
              <p className="font-semibold text-sm">You will receive:</p>
              <div
                className="rounded-md flex flex-col gap-2 py-3 px-4 mt-2"
                style={{ backgroundColor: '#EAEAEA' }}
              >
                <div className="flex items-center gap-2 mt">
                  <img className="w-6 h-6" src={token0.logoURI} alt="logo" />
                  <div className="font-bold text-xs">{token0?.symbol}</div>
                  <div className="ml-auto text-xs">
                    {balance0 ? balance0.toSignificant(6) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <img className="w-6 h-6" src={token1.logoURI} alt="logo" />
                  <div className="font-bold text-xs">{token1?.symbol}</div>
                  <div className="ml-auto text-xs">
                    {balance1 ? balance1.toSignificant(6) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* {!token0 || !token1 ? null : (
            <div className="flex flex-col h-auto my-5 border rounded-xl">
              <div className="flex justify-between p-4">
                <div>
                  <div className="text-base font-semibold">
                    {token1.symbol + ' : '}
                  </div>
                  {balance1 ? balance1.toSignificant(6) : null}
                </div>
                <div className="flex">
                  <img className="h-10" src={token1.logoURI} alt="logo" />
                </div>
              </div>
            </div>
          )} */}
          <div className="mt-6">
            <p className="font-semibold text-sm">Prices:</p>
            <div
              className="rounded-md flex flex-col gap-2 py-3 px-4 mt-2"
              style={{ backgroundColor: '#EAEAEA' }}
            >
              <div className="flex items-center gap-2 mt">
                <div className="font-bold text-xs">1 {token0?.symbol} =</div>
                <div className="ml-auto text-xs">
                  {exchangeRate} {token1?.symbol}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-xs">1 {token1?.symbol} = </div>
                <div className="ml-auto text-xs">
                  {(1 / +exchangeRate).toFixed(10)} {token0?.symbol}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col w-full">
              {!token0 || !token1 ? (
                <button
                  type="button"
                  className="w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white bg-gray-400 border rounded-xl"
                >
                  Select Token
                </button>
              ) : (
                <ButtonCase />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <AddLiquidityList
        setShowModal={setShowModal0}
        showModal={showModal0}
        token={token0}
        setToken={setToken0}
        fetchPrice={() => {}}
      />
      <AddLiquidityList
        setShowModal={setShowModal1}
        showModal={showModal1}
        token={token1}
        setToken={setToken1}
        fetchPrice={() => {}}
      /> */}
      {/* <RemoveLiqModal
        display={showRemove}
        setDisplay={setShowRemove}
        token0={token0}
        token1={token1}
        liquidity={lpAmount}
        cases={cases}
        amountA={balance0}
        amountB={balance1}
        exchangeRate={exchangeRate}
      /> */}
    </>
  );
};
export default RemoveLiquidity;
