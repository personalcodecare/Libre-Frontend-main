/* eslint-disable @next/next/no-img-element */
import {
  useState,
  useEffect,
  Fragment,
  useRef,
  SetStateAction,
  useMemo,
} from 'react';
import Head from 'next/head';
import { ethers, getDefaultProvider, Contract } from 'ethers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

import CurrencyModal from './components/currencyModal';
import {
  Token as TokenBSC,
  TokenAmount as TokenAmountBSC,
  Trade as TradeBSC,
  Pair,
  Percent as PercentBSC,
  Fetcher as FetcherBSC,
  Route,
  TradeType,
  ETHER as ETHER_BSC,
  WETH as WETH_BSC,
  ChainId as ChainIdBSC,
  JSBI as JSBI_BSC,
  CurrencyAmount,
} from '@libre-defi/bsc-swap-sdk';
import {
  Token as TokenAvalanche,
  Fetcher as FetcherAvalanche,
  Trade as TradeAvalanche,
  ETHER as ETHER_AVALANCHE,
  WETH as WETH_AVALANCHE,
  ChainId as ChainIdAVALANCHE,
  JSBI as JSBI_AVALANCHE,
  TokenAmount as TokenAmountAvalanche,
  Percent as PercentAvalanche,
} from '@libre-defi/avalanche-swap-sdk';
import {
  Token as TokenPolygon,
  Fetcher as FetcherPolygon,
  Trade as TradePolygon,
  ETHER as ETHER_POLYGON,
  WETH as WETH_POLYGON,
  ChainId as ChainIdPOLYGON,
  JSBI as JSBI_POLYGON,
  TokenAmount as TokenAmountPolygon,
  Percent as PercentPolygon,
} from '@libre-defi/polygon-swap-sdk';
import InputComponent from './components/InputComponent';
import {
  formatNumber,
  formatNumberInto9,
  parseInt,
  parseIntWithParams,
} from 'utils';
import SwapModal from './components/swapModal';
import Web3 from 'web3';
import {
  useAppFacade,
  useUserFacade,
  useWeb3Facade,
  useLunarFacade,
  useExchangeFacade,
  useLiquidityFacade,
} from 'state';
import {
  PageContainer,
  Button,
  Input,
  CreatePoolModal,
  ChainSelector,
} from 'components';
import { Bep20Contract } from 'contracts';
import { Bep20ABI } from '../../constants/abis/bep20';
import { CHAIN_DATA_LIST } from 'web3modal';
import Liquidity from './liquidity';
import {
  Common_Bases_AVALANCHE,
  Common_Bases_BSC,
  Common_Bases_POLYGON,
} from '../../constants';
import isTradeBetter from 'utils/trade';
import {
  CHAINS,
  ROUTER_ADDRESS_BSC,
  ROUTER_ADDRESS_AVALANCHE,
  ROUTER_ADDRESS_POLYGON,
} from '../../constants';

import DEFAULT_TOKEN_LIST_BSC from 'constants/TokenLists/pancake-default.tokenlist.json';
import DEFAULT_TOKEN_LIST_POLYGON from 'constants/TokenLists/polygon-default.tokenlist.json';
import DEFAULT_TOKEN_LIST_AVALANCHE from 'constants/TokenLists/avalanche-default.tokenlist.json';

type NonNullable<EToken> = Exclude<EToken, null | undefined>;

export default function Swap() {
  const { appEnv } = useAppFacade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { exchangeState, updateExchangeState } = useExchangeFacade();
  const { tokens } = exchangeState;
  const { updateLiquidityState } = useLiquidityFacade();

  const Fetcher =
    userChain === 'BSC'
      ? FetcherBSC
      : userChain === 'AVAX'
      ? FetcherAvalanche
      : FetcherPolygon;
  const Trade =
    userChain === 'BSC'
      ? TradeBSC
      : userChain === 'AVAX'
      ? TradeAvalanche
      : TradePolygon;
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
      ? ETHER_AVALANCHE
      : ETHER_POLYGON;
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
  const JSBI =
    userChain === 'BSC'
      ? JSBI_BSC
      : userChain === 'AVAX'
      ? JSBI_AVALANCHE
      : JSBI_POLYGON;
  const TokenAmount =
    userChain === 'BSC'
      ? TokenAmountBSC
      : userChain === 'AVAX'
      ? TokenAmountAvalanche
      : TokenAmountPolygon;
  const Token =
    userChain === 'BSC'
      ? TokenBSC
      : userChain === 'AVAX'
      ? TokenAvalanche
      : TokenPolygon;
  const Percent =
    userChain === 'BSC'
      ? PercentBSC
      : userChain === 'AVAX'
      ? PercentAvalanche
      : PercentPolygon;

  interface EToken {
    name: string;
    symbol: string;
    chainId: any;
    decimal: number;
    logoURI: string;
    address: string;
  }

  const [showModal0, setShowModal0] = useState<boolean>(false);
  const [showModal1, setShowModal1] = useState<boolean>(false);
  const [showSwapModal, setSwapShowModal] = useState<boolean>(false);
  const [token0, setToken0] = useState<any | EToken>();
  const [token1, setToken1] = useState<any | EToken>();
  const [token0Balance, setToken0Balance] = useState('0.00');
  const [token1Balance, setToken1Balance] = useState('0.00');
  const [userAmountInput0, setUserAmountInput0] = useState<any>();
  const [userAmountInput1, setUserAmountInput1] = useState<any>();
  const [slippage, setSlippage] = useState<number>(50);
  const [allowance, setAllowance] = useState<any>();
  const [toggleSwapButton, setToggleSwapButton] = useState<Boolean>(false);
  const [inputRange, setInputRage] = useState<number>();
  const [swapCase, setSwapCase] = useState<number>();
  const [priceImpact, setPriceImpact] = useState<string>('0.00');
  const [valueIn, setValueIn] = useState<string>();
  const [deadline, setDeadline] = useState<number>();
  const [path, setPath] = useState<string[]>();
  const [amountOut, setAmountOut] = useState<string>();
  var TAmount: string | undefined;
  var invertAmount: string | undefined;
  var MaxAmount: Amount;
  const [displayRate, setDisplayRate] = useState<string>();
  const [invertDisplayRate, setInvertDisplayRate] = useState<string>();
  const [tradeObject, setTradeObject] = useState<any>();
  const [amountInCurrency, setAmountInCurrency] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('0.0');
  const [noLiquidity, setNoLiquidity] = useState<boolean>(false);
  const [approving, setApproving] = useState(false);
  const [tabToggle, setTabToggle] = useState<boolean>(true);
  const [buttonBool, setButtonBool] = useState<Boolean>(false);
  const [swapButtonEnabled, setSwapButtonEnabled] = useState(false);

  interface Amount {
    TAmount: string | undefined;
    invertAmount: string | undefined;
  }
  let toAmount: any = 0.0,
    fromAmount: any = 0.0;

  try {
    if (amountInCurrency) {
      fromAmount = amount;
      var slippageTolerance = new Percent(BigInt(slippage), '10000'); // 50 bips, or 0.50%
      toAmount =
        parseFloat(
          tradeObject.minimumAmountOut(slippageTolerance).raw.toString()
        ) / parseFloat(Number(10 ** token1.decimals).toString());
    } else {
      toAmount = amount;
      var slippageTolerance = new Percent(BigInt(slippage), '10000'); // 50 bips, or 0.50%
      fromAmount =
        parseFloat(
          tradeObject.maximumAmountIn(slippageTolerance).raw.toString()
        ) / parseFloat(Number(10 ** token0.decimals).toString());
    }
  } catch (err) {}

  function handleFromAmountChange(value: string) {
    setAmount(value);
    setAmountInCurrency(true);
  }
  function handleToAmountChange(value: string) {
    setAmount(value);
    setAmountInCurrency(false);
  }
  async function AllPairs(tokenA: any, tokenB: any) {
    let pairArray, pair;
    const Common_Bases =
      userChain === 'BSC'
        ? Common_Bases_BSC
        : userChain === 'AVAX'
        ? Common_Bases_AVALANCHE
        : Common_Bases_POLYGON;
    let tokenArray = [...Common_Bases, tokenA, tokenB];
    tokenArray = tokenArray.filter((v, i) => tokenArray.indexOf(v) === i);

    pairArray = await Promise.all(
      tokenArray.map(async (element0) => {
        let pairs = await Promise.all(
          tokenArray.map(async (element1) => {
            try {
              pair = await Fetcher.fetchPairData(
                element0,
                element1,
                customHttpProvider
              );
              return pair;
            } catch (err) {
              pair = undefined;
              return pair;
            }
          })
        );
        return pairs;
      })
    );
    pairArray = [].concat(...pairArray);
    pairArray = pairArray.filter(function (element) {
      return element !== undefined;
    });
    pairArray = pairArray.filter(
      (v, i, a) =>
        a.findIndex(
          (t) => t.liquidityToken.address === v.liquidityToken.address
        ) === i
    );
    return pairArray;
  }

  async function setTrade() {
    if (token0 == undefined || token1 == undefined) return;
    console.log("token0.symbol", token0)
      console.log("ETHER.symbol", ETHER)
    try {
      let TokenA, TokenB;
      
      if (token0.symbol === ETHER.symbol) {
        TokenA = WETH[ChainId.MAINNET];
        TokenB = await Fetcher.fetchTokenData(
          token1.chainId,
          token1.address,
          customHttpProvider
        );
      } else if (token1.symbol === ETHER.symbol) {
        TokenB = WETH[ChainId.MAINNET];
        TokenA = await Fetcher.fetchTokenData(
          token0.chainId,
          token0.address,
          customHttpProvider
        );
      } else {
        TokenA = await Fetcher.fetchTokenData(
          token0.chainId,
          token0.address,
          customHttpProvider
        );
        TokenB = await Fetcher.fetchTokenData(
          token1.chainId,
          token1.address,
          customHttpProvider
        );
      }

      let amountIn, amountOut;

      if (amountInCurrency) {
        amountIn = ethers.utils.parseUnits(
          String(userAmountInput0),
          token0.decimals
        );
        amountOut = ethers.utils.parseUnits(String(toAmount), token1.decimals);
      } else {
        amountIn = ethers.utils.parseUnits(String(fromAmount), token0.decimals);
        amountOut = ethers.utils.parseUnits(
          String(userAmountInput1),
          token1.decimals
        );
      }
      const MAX_HOP = 3;
      const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(
        JSBI.BigInt(50),
        JSBI.BigInt(10000)
      );
      var SwapAmountIn = amountIn.toString();
      var SwapAmountOut = amountOut.toString();
      let bestTradeSoFar: any = null;
      let currentTrade: any;
      if (amountInCurrency) {
        let allpairs = await AllPairs(TokenA, TokenB);
        for (let i = 1; i < MAX_HOP; i++) {
          currentTrade =
            Trade.bestTradeExactIn(
              allpairs,
              new TokenAmount(TokenA, SwapAmountIn),
              TokenB,
              { maxHops: i, maxNumResults: 1 }
            )[0] ?? null;
          //  if current trade is best yet, save it
          if (
            isTradeBetter(
              bestTradeSoFar,
              currentTrade,
              BETTER_TRADE_LESS_HOPS_THRESHOLD as Percent,
              userChain
            )
          ) {
            bestTradeSoFar = currentTrade;
          }
        }
      } else {
        let allpairs = await AllPairs(TokenB, TokenA);
        for (let i = 1; i < MAX_HOP; i++) {
          currentTrade =
            Trade.bestTradeExactOut(
              allpairs,
              TokenA,
              new TokenAmount(TokenB, SwapAmountOut),
              { maxHops: i, maxNumResults: 1 }
            )[0] ?? null;
          //  if current trade is best yet, save it
          if (
            isTradeBetter(
              bestTradeSoFar,
              currentTrade,
              BETTER_TRADE_LESS_HOPS_THRESHOLD,
              userChain
            )
          ) {
            bestTradeSoFar = currentTrade;
          }
        }
      }
      setTradeObject(bestTradeSoFar);

      if (bestTradeSoFar === null) {
        setNoLiquidity(true);
      } else {
        setNoLiquidity(false);
      }
      TAmount = bestTradeSoFar.route.midPrice.toSignificant(6);
      invertAmount = bestTradeSoFar.route.midPrice.invert().toSignificant(6);
      setDisplayRate(TAmount);
      setInvertDisplayRate(invertAmount);
      setButtonBool(true);
    } catch (err) {
      console.log('Set Trade Error -', err);
    }
  }

  useEffect(() => {
    setTradeObject(tradeObject);
  }, [tradeObject]);

  useEffect(() => {
    setTrade();
  }, [userAmountInput0, userAmountInput1, token0, token1]);

  // global contract object
  useEffect(() => {
    calculateAllowance();
  }, [token0, token1, userAmountInput0, userAmountInput1]);

  useEffect(() => {
    if (token0 && token0.address) {
      const bep20TokenContract = new web3.eth.Contract(
        Bep20ABI,
        token0.address
      );
      if (token0.symbol !== ETHER.symbol) {
        bep20TokenContract.methods
          .balanceOf(address)
          .call({ from: '0x0000000000000000000000000000000000000000' })
          .then((res: any) =>
            setToken0Balance(ethers.utils.formatUnits(res, token0.decimals))
          )
          .catch((err: any) => console.log({ err }));
      } else {
        new web3.eth.getBalance(address)
          .then((res: any) => setToken0Balance(Web3.utils.fromWei(res)))
          .catch((err: any) => console.log({ err }));
      }
    }
  }, [token0]);

  useEffect(() => {
    if (token1 && token1.address) {
      const bep20TokenContract = new web3.eth.Contract(
        Bep20ABI,
        token1.address
      );
      if (token1.symbol !== ETHER.symbol) {
        bep20TokenContract.methods
          .balanceOf(address)
          .call({ from: '0x0000000000000000000000000000000000000000' })
          .then((res: any) => {
            setToken1Balance(ethers.utils.formatUnits(res, token1.decimals));
          })
          .catch((err: any) => console.log({ err }));
      } else {
        new web3.eth.getBalance(address)
          .then((res: any) => setToken1Balance(Web3.utils.fromWei(res)))
          .catch((err: any) => console.log({ err }));
      }
    }
  }, [token1, web3]);

  useEffect(() => {
    setSwapButtonEnabled(
      // buttonBool &&
      token0 &&
        token0.address &&
        userAmountInput0 &&
        parseInt(userAmountInput0) > 0 &&
        parseInt(token0Balance) > parseInt(userAmountInput0)
    );
  }, [token0, token1, userAmountInput0, userAmountInput1, token0Balance]);

  async function calculateAllowance() {
    try {
      if (token0 != undefined) {
        if (token0.symbol === ETHER.symbol) {
          setToggleSwapButton(true);
          // setToggleSwapButton(false);
          // const bep20Token = await new web3.eth.Contract(
          //   Bep20ABI,
          //   token0.address
          // );
          // const allowance = await bep20Token.methods
          //   .allowance(address, ROUTER_ADDRESS)
          //   .call();
          // setAllowance(allowance);
          // setPriceImpact('0.0');
          // if (userAmountInput0 != null && allowance >= userAmountInput0) {
          //   setToggleSwapButton(true);
          // }
        } else {
          setToggleSwapButton(false);

          const bep20Token = await new web3.eth.Contract(
            Bep20ABI,
            token0.address
          );
          const allowance = await bep20Token.methods
            .allowance(address, ROUTER_ADDRESS)
            .call();
          setAllowance(allowance);
          setPriceImpact('0.0');
          if (
            userAmountInput0 != (null || 0) &&
            ethers.BigNumber.from(ethers.utils.parseEther(allowance)).gt(
              ethers.BigNumber.from(ethers.utils.parseEther(userAmountInput0))
            )
          ) {
            setToggleSwapButton(true);
          }
        }
      } else if (token0 != undefined && token1 != undefined) {
        if (
          token0.symbol === ETHER.symbol &&
          token1.symbol === WETH[ChainId.MAINNET].symbol
        ) {
          setToggleSwapButton(false);
          const bep20Token = await new web3.eth.Contract(
            Bep20ABI,
            WETH[ChainId.MAINNET].address
          );
          const allowance = await bep20Token.methods
            .allowance(WETH[ChainId.MAINNET].address, ROUTER_ADDRESS)
            .call();
          setAllowance(allowance);

          if (userAmountInput0 != null && allowance > userAmountInput0) {
            setToggleSwapButton(true);
          }
        }
      } else {
        // console.log("token not selected")
      }
    } catch (err) {
      console.log('allowance - ', err);
    }
  }

  async function checkAllowanceAgainstUser() {
    if (token0 != undefined && userAmountInput0 != null) {
      if (userAmountInput0 > allowance) {
        setToggleSwapButton(false);
      }
    }
  }

  async function ApproveToken() {
    // if (web3ChainId !== 56) {
    // } else {
    if (token0 != undefined) {
      try {
        const bep20Token = await new web3.eth.Contract(
          Bep20ABI,
          token0.address
        );
        const maxAmt = web3.utils.toBN('1000000000000000000000000000000');
        setApproving(true);
        const approveBool = await bep20Token.methods
          .approve(ROUTER_ADDRESS, maxAmt)
          .send({ from: address });
        if (approveBool) {
          setToggleSwapButton(approveBool);
        }
      } catch (err) {
        console.log('Approving - ', err);
      }
    }
    // }
  }

  useEffect(() => {
    setNoLiquidity(noLiquidity);
  }, [noLiquidity]);

  //     swap token main function
  const SwapTokens = async (): Promise<any> => {
    if (
      token0.address === WETH[ChainId.MAINNET].address &&
      token1.address === WETH[ChainId.MAINNET].address
    ) {
      if (token0.symbol != token1.symbol) {
        if (token0.symbol === ETHER.symbol) {
          setButtonBool(true);
          const tokenDecimals = token0.decimals;
          let amountIn;
          if (amountInCurrency) {
            amountIn = ethers.utils.parseUnits(
              String(userAmountInput0),
              tokenDecimals
            );
          } else {
            amountIn = ethers.utils.parseUnits(
              String(fromAmount),
              tokenDecimals
            );
          }
          var SwapAmountIn = amountIn.toString();
          const amountInHex = ethers.BigNumber.from(SwapAmountIn).toHexString();
          setValueIn(amountInHex);
          setAmountOut(amountInHex);
          setSwapCase(3);
        } else {
          setButtonBool(true);
          const tokenDecimals = token0.decimals;
          let amountIn;
          if (amountInCurrency) {
            amountIn = ethers.utils.parseUnits(
              String(userAmountInput0),
              tokenDecimals
            );
          } else {
            amountIn = ethers.utils.parseUnits(
              String(fromAmount),
              tokenDecimals
            );
          }
          var SwapAmountIn = amountIn.toString();
          const amountInHex = ethers.BigNumber.from(SwapAmountIn).toHexString();
          setValueIn(amountInHex);
          setAmountOut(amountInHex);
          setSwapCase(4);
        }
      }
    } else if (token0.symbol === ETHER.symbol) {
      // BNB -> Token
      setButtonBool(true);
      var slippageTolerance = new Percent(BigInt(slippage), '10000'); // 50 bips, or 0.50%
      setPriceImpact(tradeObject.priceImpact.toSignificant(6));
      var amountOutMin = tradeObject.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
      var value = tradeObject.inputAmount.raw; // // needs to be converted to e.g. hex
      var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
      const amountOutMinHex = ethers.BigNumber.from(
        amountOutMin.toString()
      ).toHexString();
      const amountInHex = ethers.BigNumber.from(value.toString()).toHexString();
      const path: string[] = tradeObject.route.path.map(
        (token) => token.address
      );
      //  set state for swap
      setAmountOut(amountOutMinHex);
      setDeadline(deadline);
      setValueIn(amountInHex);
      setPath(path);
      setSwapCase(0);
    } else if (token1.symbol === ETHER.symbol) {
      // Token -> BNB

      setButtonBool(true);
      const price = tradeObject.priceImpact.toSignificant(6);
      setPriceImpact(price);
      var slippageTolerance = new Percent(BigInt(slippage), '10000'); // 50 bips, or 0.50%
      var amountOutMin = tradeObject.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
      var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
      var value = tradeObject.inputAmount.raw; // // needs to be converted to e.g. hex
      const amountOutMinHex = ethers.BigNumber.from(
        amountOutMin.toString()
      ).toHexString();
      const amountInHex = ethers.BigNumber.from(value.toString()).toHexString();
      const path: string[] = tradeObject.route.path.map(
        (token) => token.address
      );
      setAmountOut(amountOutMinHex);
      setDeadline(deadline);
      setValueIn(amountInHex);
      setPath(path);
      setSwapCase(1);
    } else {
      setButtonBool(true);
      var slippageTolerance = new Percent(BigInt(slippage), '10000'); // 50 bips, or 0.50%
      const price = tradeObject.priceImpact.toSignificant(6);
      setPriceImpact(price);
      var amountOutMin = tradeObject.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
      var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
      var value = tradeObject.inputAmount.raw; // // needs to be converted to e.g. hex
      const amountOutMinHex = ethers.BigNumber.from(
        amountOutMin.toString()
      ).toHexString();
      const amountInHex = ethers.BigNumber.from(value.toString()).toHexString();
      const path: string[] = tradeObject.route.path.map(
        (token) => token.address
      );
      setAmountOut(amountOutMinHex);
      setDeadline(deadline);
      setValueIn(amountInHex);
      setPath(path);
      setSwapCase(2);
    }
  };

  const ApproveSwapButton = () => {
    if (toggleSwapButton) {
      return (
        <div className="flex flex-col w-full">
          <div className="flex flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                ApproveToken();
                setInputRage(50);
              }}
              className="px-8 py-3 mt-2 text-lg font-semibold tracking-wide text-center dark:text-white dark:bg-white bg-gray-300 dark:bg-opacity-20 rounded-md cursor-not-allowed w-96"
              disabled
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => {
                SwapTokens();
                setInputRage(100);
                setSwapShowModal(true);
              }}
              className={`px-8 py-3 mt-2 text-lg font-semibold tracking-wide text-center text-white rounded-md bg-primary focus:bg-primary hover:bg-white hover:text-primary w-96 ${
                !swapButtonEnabled &&
                'bg-gray-600 rounded-md  cursor-not-allowed'
              }`}
              disabled={!swapButtonEnabled}
            >
              Swap
            </button>
          </div>
          <div className=""></div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col w-full">
          <div className="flex flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                ApproveToken();
                setInputRage(50);
              }}
              className="px-8 py-3 mt-2 text-lg font-semibold tracking-wide text-center text-white border rounded-md  bg-primary w-96"
            >
              Approve
            </button>
            {toggleSwapButton && buttonBool ? (
              <button
                type="button"
                onClick={() => {
                  SwapTokens();
                  setInputRage(100);
                  setSwapShowModal(true);
                }}
                className={`px-8 py-3 mt-2 text-lg font-semibold tracking-wide text-center text-white rounded-md  bg-primary w-96 ${
                  !swapButtonEnabled &&
                  'bg-gray-600 rounded-md  cursor-not-allowed'
                }`}
                disabled={!swapButtonEnabled}
              >
                Swap
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  SwapTokens();
                  setInputRage(100);
                }}
                className="px-8 py-3 mt-2 text-lg font-semibold tracking-wide text-center text-white bg-gray-600 rounded-md  cursor-not-allowed w-96"
                disabled={!swapButtonEnabled}
              >
                Swap
              </button>
            )}
          </div>
          <div className=""></div>
        </div>
      );
    }
  };

  // useEffect(() => {
  //   if (window && window.ethereum && web3ChainId) {
  //     if (userChainId !== 56) {
  //       updateUserInfo({ chain: 'BSC', chainId: 56 });
  //     }
  //     if (web3ChainId !== 56) {
  //       window.ethereum.request({
  //         method: 'wallet_switchEthereumChain',
  //         params: [{ chainId: '0x38' }],
  //       });
  //     }
  //   }
  // }, [web3ChainId]);

  useEffect(() => {
    if (tradeObject) {
      const price = tradeObject.priceImpact.toSignificant(6);
      setPriceImpact(price);
    }
  }, [tradeObject]);

  useEffect(() => {
    if (userChainId && userChainId === web3ChainId) {
      const tokens =
        userChainId === CHAINS.BSC.chainIds.prod
          ? DEFAULT_TOKEN_LIST_BSC.tokens
          : userChainId === CHAINS.AVAX.chainIds.prod
          ? DEFAULT_TOKEN_LIST_AVALANCHE.tokens
          : DEFAULT_TOKEN_LIST_POLYGON.tokens;
      setToken0(null);
      setToken1(null);
      updateExchangeState({ tokens: [...tokens] });
      updateLiquidityState({ tokens: [...tokens] });
    }
  }, [userChainId, web3ChainId]);

  return (
    <PageContainer>
      <Head>
        <title>Exchange | Libre DeFi</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex justify-between items-center relative mb-5 dark:text-white mobile:flex-col mobile:justify-center h-16">
        <div className="flex flex-col items-center justify-center w-full">
          <ChainSelector />
        </div>
      </div>
      {tabToggle ? (
        <div className="relative flex flex-col items-center justify-between mb-5 dark:text-white mobile:flex-col mobile:justify-center mt-10">
          <div className=" mobile:static mobile:transform-none mobile:mt-6">
            <nav className="flex flex-row my-3 tabs sm:flex-row border border-primary rounded-3xl">
              <button
                type="button"
                onClick={() => setTabToggle(true)}
                data-target="panel-1"
                className="block px-6 py-2 tab active  focus:outline-none font-semibold border border-primary text-white bg-primary rounded-3xl"
              >
                Exchange
              </button>
              <button
                type="button"
                onClick={() => setTabToggle(false)}
                data-target="panel-2"
                className="block px-6 py-2  tab hover:text-white  focus:outline-none font-semibold text-primary dark:text-white"
              >
                Liquidity
              </button>
            </nav>
          </div>
          <div className="p-4 mx-auto bg-white border border-solid swap-component rounded-xl dark:bg-secondary dark:text-white ">
            <div className="text-2xl font-semibold text-center text-black dark:text-white">
              Libre Swap
            </div>
            <form>
              <div className="mt-6 px-4 py-4 bg-white bg-opacity-20 rounded-lg border dark:border-opacity-0">
                <div className="flex justify-between items-end overflow-hidden">
                  <div>
                    <div className="text-base font-semibold dark:text-white">
                      From
                    </div>
                    <InputComponent
                      className="bg-opacity-0 dark:text-white pl-0"
                      amount={parseFloat(fromAmount) === 0.0 ? '' : fromAmount}
                      onChangeAmount={handleFromAmountChange}
                      setAmount={setUserAmountInput0}
                      checkAllowance={checkAllowanceAgainstUser}
                    />
                  </div>
                  <div className="flex flex-shrink-0 items-center px-2 rounded-lg ms:flex ">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal0(true);
                      }}
                      className={`flex justify-center items-center px-3 py-2 text-md text-black dark:text-white rounded-lg font-semibold ${
                        !token0 && 'bg-primary text-white'
                      }`}
                    >
                      {!token0 ? (
                        <div className="flex items-center justify-between font-semibold">
                          <div className="mr-1 text-sm">Select Token </div>
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
                            src={token0.logoURI}
                          ></img>
                          <p className="">{token0.symbol}</p>
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
                <p className="text-black font-semibold dark:text-white">
                  {formatNumber(token0Balance, 4)} {token0?.symbol}
                </p>
              </div>
              <div className="px-7 text-xl mt-6">
                <FontAwesomeIcon
                  icon={faArrowDown}
                  onClick={() => {
                    const temp = token0;
                    setToken0(token1);
                    setToken1(temp);
                  }}
                  className="cursor-pointer"
                />
              </div>
              <div className="mt-6 px-4 py-4 bg-white bg-opacity-20 rounded-lg border dark:border-opacity-0">
                <div className="flex justify-between items-end overflow-hidden dark:text-white">
                  <div>
                    <div className="text-base font-semibold">To</div>

                    <InputComponent
                      className="bg-opacity-0 dark:text-white pl-0"
                      amount={parseFloat(toAmount) === 0.0 ? '' : toAmount}
                      onChangeAmount={handleToAmountChange}
                      setAmount={setUserAmountInput1}
                    />
                  </div>
                  <div className="flex flex-shrink-0 items-center px-2 rounded-lg ms:flex ">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal1(true);
                      }}
                      className={`flex justify-center items-center px-3 py-2 text-md font-semibold text-black dark:text-white rounded-lg ${
                        !token1 && 'bg-primary text-white'
                      }`}
                    >
                      {token1 == undefined ? (
                        <div className="flex items-center justify-between font-semibold">
                          <div className="mr-1 text-sm">Select Token </div>
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
                            src={token1.logoURI}
                          ></img>
                          <p> {token1.symbol}</p>
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
                <p className="dark:text-white font-semibold">
                  {formatNumber(token1Balance, 4)} {token1?.symbol}
                </p>
              </div>

              <div className="flex justify-between">
                <div className="mt-5 text-sm text-center text-black dark:text-white">
                  Slippage Tolerance:{' '}
                </div>
                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    className="w-16 py-2 font-semibold text-gray-800 rounded-md  bg-grayBackground hover:bg-primary focus:bg-primary hover:text-white"
                    onClick={() => setSlippage(50)}
                  >
                    0.5%
                  </button>
                  <button
                    type="button"
                    className="w-16 py-2 font-semibold text-gray-800 rounded-md  bg-grayBackground hover:bg-primary focus:bg-primary hover:text-white"
                    onClick={() => setSlippage(100)}
                  >
                    1%
                  </button>

                  <input
                    placeholder="0.00%"
                    type="number"
                    min="0.5"
                    max="100"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setSlippage(
                        parseInt(event.target.value) * parseInt('100')
                      );
                    }}
                    className="w-24 px-4 py-2 m-0 text-base font-semibold text-gray-800 rounded-md border-primary bg-grayBackground dark:text-black"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <div className="text-sm text-center text-black dark:text-white">
                  Price:
                </div>
                {token0?.symbol && token1?.symbol && displayRate && (
                  <div>
                    {`1 ${token0.symbol} = ${displayRate} ${token1.symbol}`}
                  </div>
                )}
              </div>
              {priceImpact && (
                <div className="flex justify-between mt-3">
                  <div className="text-sm text-center text-black dark:text-white">
                    Price Impact:
                  </div>
                  <div>
                    {+priceImpact > 0.01
                      ? formatNumber(priceImpact, 2)
                      : '<0.01'}
                    %
                  </div>
                </div>
              )}
              {noLiquidity ? (
                <div className="p-4 m-2 font-semibold text-center text-black bg-white bg-opacity-20 rounded-lg">
                  No Liquidity For Swap
                </div>
              ) : null}
              <div className="flex justify-center">
                {buttonBool ? (
                  <ApproveSwapButton />
                ) : (
                  <div className="flex flex-col w-full">
                    <div className="flex flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInputRage(50);
                        }}
                        className="px-8 py-3 mt-2 text-lg font-semibold tracking-wide text-center text-white bg-gray-500 rounded-md  cursor-not-allowed w-96"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputRage(100);
                        }}
                        className="px-8 py-3 mt-2 text-lg font-semibold tracking-wide text-center text-white bg-gray-500 rounded-md  cursor-not-allowed w-96"
                      >
                        Swap
                      </button>
                    </div>
                    <div className=""></div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <Liquidity tabFunc={setTabToggle} tabState={tabToggle} />
      )}

      <CurrencyModal
        setShowModal={setShowModal0}
        showModal={showModal0}
        token={token0}
        setToken={setToken0}
      />
      <CurrencyModal
        setShowModal={setShowModal1}
        showModal={showModal1}
        token={token1}
        setToken={setToken1}
      />
      {showSwapModal && (
        <SwapModal
          setShowSwapModal={setSwapShowModal}
          showSwapModal={showSwapModal}
          swapCase={swapCase}
          amountIn={valueIn}
          amountOut={amountOut}
          deadline={deadline}
          path={path}
          address={address}
          token0={token0}
          token1={token1}
          priceImpact={priceImpact}
          displayRate={displayRate}
        />
      )}
    </PageContainer>
  );
}
