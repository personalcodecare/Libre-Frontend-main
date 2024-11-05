import Web3 from 'web3';
import { createAsyncThunk } from '@reduxjs/toolkit';

import * as UserService from './user.service';

export const updateBalance = createAsyncThunk(
  'user/updateBalance',
  async (params: { address: string; chain: string; web3: Web3 }) =>
    await UserService.updateBalance(params.address, params.chain, params.web3)
);
