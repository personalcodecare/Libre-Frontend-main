import { createSlice, Reducer } from '@reduxjs/toolkit';

import { reducers, extraReducers } from './lunar.reducers';

import { CHAINS } from '../../constants';

export type ILunarState = { [key: string]: number };

export const initialState: ILunarState = {
  LIBRE: 0.01,
  USDT: 1,
  USDC: 1,
  MATIC: 2,
  BNB: 500,
  BUSD: 1,
  CAKE: 18,
  BAKE: 2,
  AVAX: 70,
  JOE: 2.5,
  PNG: 1.5,
};

const lunarSlice = createSlice({
  name: 'lunar',
  initialState,
  reducers,
  extraReducers: (builder) => {},
});

// Action Creators

export const actions = {
  updateLunarState: lunarSlice.actions.updateLunarState,
};

export default lunarSlice.reducer as Reducer<ILunarState>;
