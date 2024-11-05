/* eslint-disable @next/next/no-img-element */
import React, {
  useState,
  useEffect,
  Fragment,
  useRef,
  SetStateAction,
} from 'react';
import { ethers, getDefaultProvider, Contract, BigNumber } from 'ethers';
import { ChainSelector } from 'components';
import {
  Token as TokenBSC,
  TokenAmount as TokenAmountBSC,
  Pair as PairBSC,
  Percent as PercentBSC,
  Fetcher as FetcherBSC,
  Route as RouteBSC,
  ETHER as ETHER_BSC,
  WETH as WETH_BSC,
  ChainId as ChainIdBSC,
  JSBI as JSBI_BSC,
  CurrencyAmount as CurrencyAmountBSC,
  Currency as CurrencyBSC,
  FACTORY_ADDRESS as FACTORY_ADDRESS_BSC,
  Trade as TradeBSC,
} from '@libre-defi/bsc-swap-sdk';
import {
  Token as TokenPolygon,
  TokenAmount as TokenAmountPolygon,
  Pair as PairPolygon,
  Percent as PercentPolygon,
  Fetcher as FetcherPolygon,
  Route as RoutePolygon,
  ETHER as ETHER_Polygon,
  WETH as WETH_Polygon,
  ChainId as ChainIdPolygon,
  JSBI as JSBI_Polygon,
  CurrencyAmount as CurrencyAmountPolygon,
  Currency as CurrencyPolygon,
  FACTORY_ADDRESS as FACTORY_ADDRESS_Polygon,
  Trade as TradePolygon,
} from '@libre-defi/polygon-swap-sdk';
import {
  Token as TokenAvalanche,
  TokenAmount as TokenAmountAvalanche,
  Pair as PairAvalanche,
  Percent as PercentAvalanche,
  Fetcher as FetcherAvalanche,
  Route as RouteAvalanche,
  ETHER as ETHER_Avalanche,
  WETH as WETH_Avalanche,
  ChainId as ChainIdAvalanche,
  JSBI as JSBI_Avalanche,
  CurrencyAmount as CurrencyAmountAvalanche,
  Currency as CurrencyAvalanche,
  FACTORY_ADDRESS as FACTORY_ADDRESS_Avalanche,
  Trade as TradeAvalanche,
} from '@libre-defi/avalanche-swap-sdk';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import InputComponent from '../components/InputComponent';
import SupplyModal from './SupplyModal';
import AddLiquidityList from './AddLiquidityList';
import { useModal } from 'hooks';
import { Bep20ABI, FactoryABI, PairABI } from '../../../constants';
import { useWeb3Facade, useUserFacade, useLiquidityFacade } from 'state';
import {
  formatNumber,
  formatNumberInto9,
  parseIntWithParams,
  parseInt,
} from 'utils';
import wethABI from 'constants/abis/weth.json';
import Web3 from 'web3';
import isTradeBetter from 'utils/trade';
import { RemoveLiquidityModal } from 'components/modals';
import {
  CHAINS,
  ROUTER_ADDRESS_BSC,
  ROUTER_ADDRESS_AVALANCHE,
  ROUTER_ADDRESS_POLYGON,
} from '../../../constants';

const customHttpProvider = new ethers.providers.JsonRpcProvider(
  'https://bsc-dataseed.binance.org/'
);

const logoURI =
  'https://img.icons8.com/external-bearicons-glyph-bearicons/64/000000/external-question-call-to-action-bearicons-glyph-bearicons.png';

type Props = {
  toggle?: boolean;
  setToggle?: any;
};
const AddLiquidity: React.FC<Props> = ({ toggle, setToggle }) => {
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;
  const { liquidityState } = useLiquidityFacade();
  const { tokens } = liquidityState;
  const {
    isOpen: isLiquidityModalOpen,
    showModal: showLiquidityModal,
    hideModal: hideLiquidityModal,
  } = useModal();

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
  const Pair =
    userChain === 'BSC'
      ? PairBSC
      : userChain === 'AVAX'
      ? PairAvalanche
      : PairPolygon;
  const Route =
    userChain === 'BSC'
      ? RouteBSC
      : userChain === 'AVAX'
      ? RouteAvalanche
      : RoutePolygon;
  const CurrencyAmount =
    userChain === 'BSC'
      ? CurrencyAmountBSC
      : userChain === 'AVAX'
      ? CurrencyAmountAvalanche
      : CurrencyAmountPolygon;
  const Currency =
    userChain === 'BSC'
      ? CurrencyBSC
      : userChain === 'AVAX'
      ? CurrencyAvalanche
      : CurrencyPolygon;
  const FACTORY_ADDRESS =
    userChain === 'BSC'
      ? FACTORY_ADDRESS_BSC
      : userChain === 'AVAX'
      ? FACTORY_ADDRESS_Avalanche
      : FACTORY_ADDRESS_Polygon;

  const [showLiquidityForm, setShowLiquidityForm] = useState(false);
  const [supply, setSupply] = useState<boolean>(false);
  const [token0, setToken0] = useState<Token>();
  const [token1, setToken1] = useState<Token>();
  const [showModal0, setShowModal0] = useState<boolean>(false);
  const [showModal1, setShowModal1] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<any>();
  const [allowance, setAllowance] = useState();
  const [userAmountInput0, setUserAmountInput0] = useState<any>();
  const [userAmountInput1, setUserAmountInput1] = useState<any>();
  const [amountInCurrency, setAmountInCurrency] = useState<boolean>(true);
  const [toggleSupplyButton0, setToggleSupplyButton0] =
    useState<boolean>(false);
  const [toggleSupplyButton1, setToggleSupplyButton1] =
    useState<boolean>(false);
  const [amount, setAmount] = useState<string>('0.0');
  const [balance0, setBalance0] = useState<string>('0.00');
  const [balance1, setBalance1] = useState<string>('0.00');
  const [supplyPercentage, setSupplyPercentage] = useState<number | any>();
  const [reserveExist, setReserveExist] = useState<boolean>(true);
  const [cases, setCases] = useState<number>();
  const [pair, setPair] = useState<Pair>();
  const [lpTokens, setLpTokens] = useState<string>();
  const [lpList, setLpList] = useState([]);
  let toAmount: any = 0,
    fromAmount: any = 0;
  let parseToAmount, parseFromAmount
  const [supplyButtonEnabled, setSupplyButtonEnabled] = useState(false);
  const [activeLpIndex, setActiveLpIndex] = useState(-1);

  try {    if (reserveExist) {
      if (amountInCurrency) {
        fromAmount = amount;
        toAmount = Number(parseFloat(amount) * parseFloat(exchangeRate)).toFixed(
          10
        );
      } else {
        toAmount = amount;
        fromAmount = Number(
          parseFloat(amount) * (1 / parseFloat(exchangeRate))
        ).toFixed(10);
      }
      parseFromAmount = Number(fromAmount).toFixed(token0.decimals) 
      parseToAmount = Number(toAmount).toFixed(token1.decimals)
    } else {
      parseFromAmount = userAmountInput0;
      parseToAmount = userAmountInput1;
    }
  } catch(err) {
    console.log(err);
  }

  const AddLiquidityData = async () => {
    try {
      if ((token0 && token1) !== undefined) {
        let pair, route, Token0, Token1;
        if (token0.symbol === ETHER.symbol) {
          setCases(0);
          Token0 = WETH[ChainId.MAINNET];
          Token1 = await Fetcher.fetchTokenData(
            token1.chainId,
            token1.address,
            customHttpProvider
          );
        } else if (token1.symbol === ETHER.symbol) {
          setCases(0);
          Token0 = await Fetcher.fetchTokenData(
            token0.chainId,
            token0.address,
            customHttpProvider
          );
          Token1 = WETH[ChainId.MAINNET];
        } else {
          setCases(1);
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
        }
        const pairAddress = Pair.getAddress(Token0, Token1);
        const PairContract = new web3.eth.Contract(PairABI as any, pairAddress);
        let reserves;
        try {
          reserves = await PairContract.methods
            .getReserves()
            .call({ from: address });
        } catch (err) {}
        if (!reserves) {
          setReserveExist(false);
        } else {
          setReserveExist(true);
        }
        if (reserveExist) {
          pair = await Fetcher.fetchPairData(
            Token0,
            Token1,
            customHttpProvider
          );
          setPair(pair);
          route = new Route([pair], Token0);
          setExchangeRate(route.midPrice.toSignificant(6));
          const tokenDecimals = token0.decimals;
          let amountIn;
          if (amountInCurrency) {
            amountIn = ethers.utils.parseUnits(
              String(userAmountInput0),
              tokenDecimals
            );
            setUserAmountInput1(amountIn.toString());
          } else {
            amountIn = ethers.utils.parseUnits(
              String(fromAmount),
              tokenDecimals
            );
            setUserAmountInput0(amountIn.toString());
          }
        } else {
          let rate = fromAmount / toAmount;
          setExchangeRate(rate);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setLpTokens(lpTokens);
  }, [lpTokens]);

  useEffect(() => {
    AddLiquidityData();
  }, [token0, token1, userAmountInput0, userAmountInput1]);

  useEffect(() => {
    setPair(pair);
  }, [pair]);

  function handleFromAmountChange(value: string) {
    setAmount(value);
    setAmountInCurrency(true);
  }

  function handleToAmountChange(value: string) {
    setAmount(value);
    setAmountInCurrency(false);
  }

  async function TotalSupply() {
    try {
      if ((token0 && token1) !== undefined && pair) {
        const PairContract = new web3.eth.Contract(
          PairABI,
          pair.liquidityToken.address
        );
        const TotalSupply: BigNumber = await PairContract.methods
          .totalSupply()
          .call();
        let totalSupplyAmount = new TokenAmount(
          pair.liquidityToken,
          TotalSupply.toString()
        );
        let totalPoolTokens = new TokenAmount(token0, TotalSupply.toString());
        let input, output, userPoolBalance0, userPoolBalance1;
        if (amountInCurrency) {
          input = tryParseAmount(fromAmount, token0);
          output = tryParseAmount(toAmount, token1);
        } else {
          input = tryParseAmount(fromAmount, token0);
          output = tryParseAmount(toAmount, token1);
        }
        if (pair.token0.address == token0.address) {
          userPoolBalance0 = new TokenAmount(pair.token0, input.raw);
          userPoolBalance1 = new TokenAmount(pair.token1, output.raw);
        } else {
          userPoolBalance0 = new TokenAmount(pair.token1, input.raw);
          userPoolBalance1 = new TokenAmount(pair.token0, output.raw);
        }

        try {
          const LPToken = pair.getLiquidityMinted(
            totalSupplyAmount,
            userPoolBalance0,
            userPoolBalance1
          );
          setLpTokens(LPToken.toSignificant(10));
          const userPoolPercent = new Percent(LPToken.raw, totalPoolTokens.raw);
          setSupplyPercentage(userPoolPercent);
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      // set a boolean if pair doesn't exist
      console.log(err);
    }
  }

  function tryParseAmount(
    value?: string,
    currency?: Currency
  ): CurrencyAmount | undefined {
    if (!value || !currency) {
      return undefined;
    }
    try {
      const typedValueParsed = web3.utils.toWei(value).toString();
      if (typedValueParsed !== '0') {
        return currency instanceof Token
          ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
          : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
      }
    } catch (error) {
      // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
      console.debug(`Failed to parse input amount: "${value}"`, error);
    }
    // necessary for all paths to return a value
    return undefined;
  }

  useEffect(() => {
    calculateAllowance(
      token0,
      userAmountInput0 ? userAmountInput0 : toAmount,
      setToggleSupplyButton0
    );
    calculateAllowance(
      token1,
      userAmountInput1 ? userAmountInput1 : fromAmount,
      setToggleSupplyButton1
    );
    TotalSupply();
  }, [token0, token1, userAmountInput0, userAmountInput1]);

  useEffect(() => {
    calculateBalance();
  }, [token0, token1]);

  async function calculateAllowance(
    token: Token,
    input: any,
    setToggleSupplyButton: any
  ) {
    try {
      if (token && token.symbol === ETHER.symbol) {
        setToggleSupplyButton(true);
      }
      if (token != undefined && token.symbol !== ETHER.symbol) {
        setToggleSupplyButton(false);
        const bep20Token = await new web3.eth.Contract(Bep20ABI, token.address);
        const allowance = await bep20Token.methods
          .allowance(address, ROUTER_ADDRESS)
          .call();
        setAllowance(allowance);
        // setPriceImpact('0.0');
        // console.log({
        //   token: token.symbol,
        //   allowance: allowance >= input,
        //   input,
        // });
        if (input != null && allowance !== '0') {
          setToggleSupplyButton(true);
        }
      }
    } catch (err) {
      console.log('allowance - ', err);
    }
  }

  async function calculateBalance() {
    try {
      if (token0 !== undefined) {
        if (token0.symbol === ETHER.symbol) {
          const balance = await web3.eth.getBalance(address);
          const balancePrecise = parseFloat(balance) / 10 ** 18;
          setBalance0(balancePrecise.toPrecision(4));
        } else {
          const bep20Token = await new web3.eth.Contract(
            Bep20ABI,
            token0.address
          );

          const balance = await bep20Token.methods.balanceOf(address).call();
          const balancePrecise = parseFloat(balance) / 10 ** token0.decimals;
          setBalance0(balancePrecise.toPrecision(4));
        }
      }
      if (token1 !== undefined) {
        if (token1.symbol === ETHER.symbol) {
          const balance = await web3.eth.getBalance(address);
          const balancePrecise = parseFloat(balance) / 10 ** 18;
          setBalance1(balancePrecise.toPrecision(4));
        } else {
          const bep20Token = await new web3.eth.Contract(
            Bep20ABI,
            token1.address
          );

          const balance = await bep20Token.methods.balanceOf(address).call();
          const balancePrecise = parseFloat(balance) / 10 ** token1.decimals;
          setBalance1(balancePrecise.toPrecision(4));
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function ApproveToken(token: any, setToggleSupplyButton: any) {
    if (web3ChainId !== ChainId.MAINNET) {
    } else {
      if (token != undefined) {
        if (token.symbol === ETHER.symbol) {
          setToggleSupplyButton(true);
        } else {
          try {
            const Bep20Contract = await new web3.eth.Contract(
              Bep20ABI,
              token.address
            );
            const maxAmt = web3.utils.toBN(
              '115792089237316195423570985008687907853269984665640564039457584007913129639935'
            );
            //   setApproving(true);
            const approveBool = await Bep20Contract.methods
              .approve(ROUTER_ADDRESS, maxAmt)
              .send({ from: address });

            setToggleSupplyButton(approveBool);
          } catch (err) {
            console.log('Approving - ', err);
          }
        }
      }
    }
  }

  useEffect(() => {
    setReserveExist(reserveExist);
  }, [reserveExist]);

  // useEffect(() => {
  //   setToggleSupplyButton0(toggleSupplyButton0);
  // }, [toggleSupplyButton0]);

  // useEffect(() => {
  //   setToggleSupplyButton1(toggleSupplyButton1);
  // }, [toggleSupplyButton1]);

  function ButtonCases() {
    if (
      (token0 || token1) === ETHER &&
      (token0 || token1) === WETH[ChainId.MAINNET]
    ) {
      return (
        <button
          type="button"
          className="w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white bg-gray-500 border cursor-not-allowed rounded-xl"
        >
          Invalid Pair
        </button>
      );
    } else {
      return (
        <div className="flex flex-row flex-1 gap-4">
          {!toggleSupplyButton0 ? (
            <button
              type="button"
              onClick={() => {
                ApproveToken(token0, setToggleSupplyButton0);
              }}
              className="w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white border bg-primary rounded-xl"
            >
              {token0 ? `Enable  ${token0.symbol}` : `Enable`}
            </button>
          ) : null}
          {!toggleSupplyButton1 ? (
            <button
              type="button"
              onClick={() => {
                ApproveToken(token1, setToggleSupplyButton1);
              }}
              className="w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white border bg-primary rounded-xl"
            >
              {token1 ? `Enable  ${token1.symbol}` : `Enable`}
            </button>
          ) : null}
        </div>
      );
    }
    //   } else {
    //     return (
    //       <button
    //       type="button"
    //      onClick={() => {AddLiquidityData();setSupply(true);}}
    //       className="w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white border bg-primary rounded-xl"
    //     >
    //       Supply
    //     </button>
    //     )
    //   }
  }

  useEffect(() => {
    setSupplyButtonEnabled(
      token0 &&
        token0.address &&
        token1 &&
        token1.address &&
        fromAmount &&
        toAmount &&
        parseInt(fromAmount) > 0 &&
        parseInt(toAmount) > 0 &&
        parseInt(balance0) > parseInt(fromAmount) &&
        parseInt(balance1) > parseInt(toAmount)
    );
  }, [token0, token1, fromAmount, toAmount, balance0, balance1]);

  const fetchPairs = async () => {
    const FactoryContract = await new web3.eth.Contract(
      FactoryABI,
      FACTORY_ADDRESS
    );
    const pairLength = await FactoryContract.methods.allPairsLength().call();
    const tempTokenList: any = [];
    await Promise.all(
      new Array(+pairLength).fill(0).map(async (i, index) => {
        const pairAddress = await FactoryContract.methods
          .allPairs(index)
          .call();
        const PairContract = await new web3.eth.Contract(PairABI, pairAddress);
        const lpBalance = await PairContract.methods
          .balanceOf(address)
          .call({ from: '0x0000000000000000000000000000000000000000' });
        const token0Address = await PairContract.methods.token0().call();
        const token1Address = await PairContract.methods.token1().call();
        const token0Contract = await new web3.eth.Contract(
          Bep20ABI,
          token0Address
        );
        const token1Contract = await new web3.eth.Contract(
          Bep20ABI,
          token1Address
        );
        const token0Name = await token0Contract.methods.name().call();
        const token0Symbol = await token0Contract.methods.symbol().call();
        const token1Name = await token1Contract.methods.name().call();
        const token1Symbol = await token1Contract.methods.symbol().call();

        let token0: any = tokens.find(
          (token) => token.address === token0Address
        );
        let token1: any = tokens.find(
          (token) => token.address === token1Address
        );
        if (!token0) {
          const tokenInst = await new web3.eth.Contract(
            Bep20ABI,
            token0Address
          );
          const tokenDecimal = await tokenInst.methods.decimals().call();
          const tokenName = await tokenInst.methods.name().call();
          const tokenSymbol = await tokenInst.methods.symbol().call();
          const chainId = web3ChainId;
          token0 = {
            name: tokenName,
            symbol: tokenSymbol,
            address: token0Address,
            chainId: chainId,
            decimals: tokenDecimal,
            logoURI: logoURI,
          };
        }

        if (!token1) {
          const tokenInst = await new web3.eth.Contract(
            Bep20ABI,
            token1Address
          );
          const tokenDecimal = await tokenInst.methods.decimals().call();
          const tokenName = await tokenInst.methods.name().call();
          const tokenSymbol = await tokenInst.methods.symbol().call();
          const chainId = web3ChainId;
          token1 = {
            name: tokenName,
            symbol: tokenSymbol,
            address: token1Address,
            chainId: chainId,
            decimals: tokenDecimal,
            logoURI: logoURI,
          };
        }
        if (parseInt(Web3.utils.fromWei(lpBalance)) > 0)
          tempTokenList.push({
            balance: Web3.utils.fromWei(lpBalance),
            token0,
            token1,
            address: pairAddress,
          });
      })
    );
    setLpList(tempTokenList);
  };

  useEffect(() => {
    if (web3 && address) {
      fetchPairs();
    }
  }, [web3, address]);

  useEffect(() => {
    if (!isLiquidityModalOpen) {
      fetchPairs();
    }
  }, [isLiquidityModalOpen]);

  return (
    <div className="p-4 mx-auto bg-white swap-component rounded-xl dark:bg-secondary dark:text-white ">
      {!showLiquidityForm && (
        <div>
          {lpList && lpList.length > 0 ? (
            lpList.map((lp, index) => (
              <div
                className="p-6 my-3 border border-primary rounded-md cursor-pointer"
                key={lp.address}
                onClick={() =>
                  setActiveLpIndex(index === activeLpIndex ? -1 : index)
                }
              >
                <div className="flex items-start gap-2">
                  <img src={lp.token0.logoURI} width={26} height={26} />
                  <img src={lp.token1.logoURI} width={26} height={26} />
                  <div>
                    <p className="font-semibold text-lg text-black dark:text-white">
                      {lp.token0.symbol}-{lp.token1.symbol} LP
                    </p>
                    <span className="font-normal text-sm">
                      {formatNumber(lp.balance, 4)}
                    </span>
                  </div>
                  <div className="text-xl ml-auto self-center">
                    <FontAwesomeIcon icon={faAngleDown} />
                  </div>
                </div>
                {activeLpIndex === index && (
                  <div className="mt-4">
                    <button
                      className="w-full bg-white rounded-md py-2 text-primary font-semibold text-base"
                      onClick={(e) => {
                        e.stopPropagation();
                        showLiquidityModal();
                      }}
                    >
                      - Remove Liquidity
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 bg-white bg-opacity-20 rounded-2xl text-black dark:text-white text-center">
              No Liquidity Found. Add liquidity to create LPs.
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setShowLiquidityForm(true);
            }}
            className="w-full py-4 mt-2 font-semibold text-center text-white bg-primary rounded-xl text-lg"
          >
            + Add Liquidity
          </button>
        </div>
      )}
      {showLiquidityForm &&
        (!reserveExist ? (
          <div className="p-4 m-2 text-white bg-gray-400 rounded-lg">
            <p className="p-3 font-bold text-black">
              You are the first liquidity provider.
            </p>
            <p className="p-3 font-semibold">
              The ratio of tokens you add will set the price of this pool. Once
              you are happy with the rate click supply to review.
            </p>
          </div>
        ) : null)}
      {showLiquidityForm && (
        <form>
          <div className="px-4 py-4 rounded-lg bg-white border">
            <div className="flex justify-between items-end overflow-hidden">
              <div>
                <div className="text-base font-semibold dark:text-black">
                  Input
                </div>
                <InputComponent
                  amount={fromAmount}
                  onChangeAmount={handleFromAmountChange}
                  setAmount={setUserAmountInput0}
                  className="bg-opacity-0 pl-0"
                />
              </div>
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
                    <div className="flex items-center justify-between font-semibold flex-shrink-0">
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
            <p className="text-black font-semibold">
              {balance0} {token0?.symbol}
            </p>
          </div>
          <div className="px-4 py-4 mt-6 rounded-lg bg-white border">
            <div className="flex justify-between items-end overflow-hidden text-black">
              <div>
                <div className="text-base font-semibold">Input</div>

                <InputComponent
                  amount={toAmount}
                  onChangeAmount={handleToAmountChange}
                  setAmount={setUserAmountInput1}
                  className="bg-opacity-0 pl-0"
                />
              </div>
              <div className="flex items-center px-2 rounded-lg ms:flex ">
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
                    <div className="flex items-center justify-between font-semibold flex-shrink-0">
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
            <p className="text-black font-semibold">
              {balance1} {token1?.symbol}
            </p>
          </div>
          {
            <div>
              {!token0 || !token1 || !reserveExist ? null : (
                <div className="mt-5">
                  <div className="flex justify-between items-center text-black dark:text-white">
                    <div>Rate (Incl. fee):</div>
                    <div>
                      1 {token0.symbol} = {exchangeRate} {token1.symbol}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-black dark:text-white mt-3">
                    <div>Share of Pool:</div>
                    <div>
                      {supplyPercentage
                        ? `${
                            supplyPercentage.toFixed(2) === '0.00'
                              ? '<0.01'
                              : supplyPercentage.toFixed(2) > 100.0
                              ? '100.00'
                              : supplyPercentage.toFixed(2)
                          }%`
                        : '-'}{' '}
                    </div>
                  </div>
                  {/* <div className="m-2 text-xs font-semibold text-left">
                    Prices and Pool Share
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center border rounded-xl">
                    <div className="flex flex-col justify-center m-2">
                      <p className="text-xs font-semibold">{exchangeRate}</p>
                      <p className="text-xs font-semibold">
                        {' '}
                        {token1.symbol + ' per ' + token0.symbol}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center m-2">
                      <p className="text-xs font-semibold">
                        {(1 / exchangeRate).toPrecision(6)}
                      </p>
                      <p className="text-xs font-semibold">
                        {token0.symbol + ' per ' + token1.symbol}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center m-2">
                      <p className="text-xs font-semibold">
                        {' '}
                        {supplyPercentage
                          ? `${
                              supplyPercentage.toFixed(2) === '0.00'
                                ? '<0.01'
                                : supplyPercentage.toFixed(2) > 100.0
                                ? '100.00'
                                : supplyPercentage.toFixed(2)
                            }%`
                          : '-'}{' '}
                      </p>
                      <p className="text-xs font-semibold">share of Pool</p>
                    </div>
                  </div> */}
                </div>
              )}
            </div>
          }
          <div className="flex justify-center">
            <div className="flex flex-col w-full">
              {!token0 || !token1 ? (
                <button
                  type="button"
                  className="w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white bg-gray-500 border cursor-not-allowed rounded-xl"
                >
                  Select Tokens
                </button>
              ) : (
                <>
                  {!toggleSupplyButton1 || !toggleSupplyButton0 ? (
                    <ButtonCases />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        AddLiquidityData();
                        setSupply(true);
                      }}
                      className="w-full px-8 py-3 mt-2 font-semibold tracking-wide text-center text-white border bg-primary rounded-xl"
                      disabled={!supplyButtonEnabled}
                    >
                      Supply
                    </button>
                  )}{' '}
                </>
              )}
            </div>
          </div>
        </form>
      )}
      {isLiquidityModalOpen && (
        <RemoveLiquidityModal
          isOpen={isLiquidityModalOpen}
          hide={hideLiquidityModal}
          token0={lpList[activeLpIndex] ? lpList[activeLpIndex].token0 : null}
          token1={lpList[activeLpIndex] ? lpList[activeLpIndex].token1 : null}
        />
      )}
      <SupplyModal
        display={supply}
        setDisplay={setSupply}
        tokenA={token0}
        tokenB={token1}
        liquidity={lpTokens}
        amountADesired={parseFromAmount}
        amountBDesired={parseToAmount}
        exchangeRate={exchangeRate}
        cases={cases}
        newPool={reserveExist}
        supplyPercent={supplyPercentage}
      />
      <AddLiquidityList
        setShowModal={setShowModal0}
        showModal={showModal0}
        token={token0}
        setToken={setToken0}
      />
      <AddLiquidityList
        setShowModal={setShowModal1}
        showModal={showModal1}
        token={token1}
        setToken={setToken1}
      />
    </div>
  );
};
export default AddLiquidity;
