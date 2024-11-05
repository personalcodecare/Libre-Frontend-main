import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';

import { IUserState } from './user.slice';

// Reducers
export const reducers = {
  updateUserInfo(state: IUserState, action: any) {
    const newState = { ...state, ...action.payload };
    if (localStorage) {
      localStorage.setItem(
        'libre-cache',
        JSON.stringify({ chain: newState.chain, chainId: newState.chainId })
      );
    }
    return newState;
  },
};

export const updateBalance = {
  fulfilled: (state: IUserState, action: AnyAction): void => {
    state.balance = Web3.utils.fromWei(action.payload);
  },
};

export const extraReducers = { updateBalance };
