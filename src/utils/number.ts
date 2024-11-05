import { CurrencyAmount, JSBI } from '@libre-defi/bsc-swap-sdk';
import numeral from 'numeral';
import Web3 from 'web3';

export const formatNumber = (num: any, decimal: number = 4) => {
  if (numeral(num).value() && numeral(num).value()! < 0.00001) return '0.00';

  return numeral(num).format(
    `0,0.${new Array(decimal).fill('0').join('').toString()}`,
    Math.floor
  );
};
export const formatNumberInto9 = (num: any, decimal: number = 9) => {
  if (numeral(num).value() && numeral(num).value()! < 0.00001) return '0.00';

  return numeral(num).format(
    `0,0.${new Array(decimal).fill('0').join('').toString()}`,
    Math.floor
  );
};

export const parseInt = (num: string) => {
  return num ? +num.slice(0, 17).replace(',', '') : 0;
};
export const parseIntWithParams = (num: string, slice: string) => {
  return num ? +num.slice(0, parseInt(slice)).replace(',', '') : 0;
};

export function calculateSlippageAmount(
  value: CurrencyAmount,
  slippage: number
): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)),
      JSBI.BigInt(10000)
    ),
    JSBI.divide(
      JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)),
      JSBI.BigInt(10000)
    ),
  ];
}
