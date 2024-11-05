import { AnyAction, PayloadAction } from "@reduxjs/toolkit";

import { IWeb3State } from "./web3.slice";

// Reducers
export const reducers = {
  updateWeb3State(state: IWeb3State, action: any) {
    return { ...state, ...action.payload };
  },
};

export const extraReducers = {};
