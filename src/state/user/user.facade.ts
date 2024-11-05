import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'state';
import Web3 from 'web3';
import * as UserSlice from './user.slice';
import * as WalletThunks from './user.thunks';

export const useUserFacade = () => {
  const dispatch = useAppDispatch();

  const userState = useAppSelector((state) => state.userState);

  const updateUserInfo = useCallback(
    (payload) => dispatch(UserSlice.actions.updateUserInfo(payload)),
    [dispatch]
  );

  const updateBalance = useCallback(
    (address: string, chain: string, web3: Web3) =>
      dispatch(WalletThunks.updateBalance({ address, chain, web3 })),
    [dispatch]
  );

  return {
    userState,
    updateUserInfo,
    updateBalance,
  };
};
