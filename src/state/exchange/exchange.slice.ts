import { createSlice, Reducer } from '@reduxjs/toolkit';

import { reducers, extraReducers } from './exchange.reducers';

import DEFAULT_TOKEN_LIST_BSC from 'constants/TokenLists/pancake-default.tokenlist.json';
import DEFAULT_TOKEN_LIST_POLYGON from 'constants/TokenLists/polygon-default.tokenlist.json';
import DEFAULT_TOKEN_LIST_AVALANCHE from 'constants/TokenLists/avalanche-default.tokenlist.json';
import { CHAINS } from '../../constants';

type IExchangeToken = {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
};

export type IExchangeState = {
  tokens: IExchangeToken[];
};

export const initialState: IExchangeState = {
  tokens: [],
};

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers,
  extraReducers: (builder) => {},
});

// Action Creators

export const actions = {
  updateExchangeState: exchangeSlice.actions.updateExchangeState,
  addExchangeToken: exchangeSlice.actions.addExchangeToken,
};

export default exchangeSlice.reducer as Reducer<IExchangeState>;
