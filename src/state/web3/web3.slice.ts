import { createSlice, Reducer } from '@reduxjs/toolkit';

import { reducers, extraReducers } from './web3.reducers';

export interface IWeb3State {
  web3: any;
  provider: any;
  chainId: number;
}

const initialState: IWeb3State = {
  web3: null,
  provider: null,
  chainId: 0,
};

const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers,
  extraReducers: (builder) => {},
});

// Action Creators

export const actions = {
  updateWeb3State: web3Slice.actions.updateWeb3State,
};

export default web3Slice.reducer as Reducer<IWeb3State>;
