import {
  Trade as TradeBSC,
  currencyEquals as currencyEqualsBSC,
  Percent as PercentBSC,
  JSBI,
} from '@libre-defi/bsc-swap-sdk';
import {
  Trade as TradeAvalanche,
  currencyEquals as currencyEqualsAvalanche,
  Percent as PercentAvalanche,
} from '@libre-defi/avalanche-swap-sdk';
import {
  Trade as TradePolygon,
  Percent,
  currencyEquals as currencyEqualsPolygon,
  Percent as PercentPolygon,
} from '@libre-defi/polygon-swap-sdk';

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
function isTradeBetter(
  tradeA: any,
  tradeB: any,
  minimumDel: any,
  userChain: 'BSC' | 'AVAX' | 'POLY'
): boolean | undefined {
  const Trade =
    userChain === 'BSC'
      ? TradeBSC
      : userChain === 'AVAX'
      ? TradeAvalanche
      : TradePolygon;
  const currencyEquals =
    userChain === 'BSC'
      ? currencyEqualsBSC
      : userChain === 'AVAX'
      ? currencyEqualsAvalanche
      : currencyEqualsPolygon;
  const Percent =
    userChain === 'BSC'
      ? PercentBSC
      : userChain === 'AVAX'
      ? PercentAvalanche
      : PercentPolygon;
  const ZERO_PERCENT = new Percent('0');
  const ONE_HUNDRED_PERCENT = new Percent('1');
  const minimumDelta = minimumDel ? minimumDel : ZERO_PERCENT;

  if (tradeA && !tradeB) return false;
  if (tradeB && !tradeA) return true;
  if (!tradeA || !tradeB) return undefined;

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !currencyEquals(tradeB.outputAmount.currency, tradeB.outputAmount.currency)
  ) {
    throw new Error('Trades are not comparable');
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice);
  }
  return tradeA.executionPrice.raw
    .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
    .lessThan(tradeB.executionPrice);
}

export default isTradeBetter;
