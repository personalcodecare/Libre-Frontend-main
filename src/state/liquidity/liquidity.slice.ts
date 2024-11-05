import {createSlice, Reducer} from '@reduxjs/toolkit';

import {reducers, extraReducers} from './liquidity.reducers';

import DEFAULT_TOKEN_LIST from 'constants/TokenLists/pancake-default.tokenlist.json';
import {CHAINS} from '../../constants';

type ILiquidityToken = {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
};

export type ILiquidityState = {
  tokens: ILiquidityToken[];
};

export const initialState: ILiquidityState = {
  tokens: DEFAULT_TOKEN_LIST.tokens,
};

const liquiditySlice = createSlice({
  name: 'liquidity',
  initialState,
  reducers,
  extraReducers: (builder) => {},
});

// Action Creators

export const actions = {
  updateLiquidityState: liquiditySlice.actions.updateLiquidityState,
  addLiquidityToken: liquiditySlice.actions.addLiquidityToken,
};

export default liquiditySlice.reducer as Reducer<ILiquidityState>;
