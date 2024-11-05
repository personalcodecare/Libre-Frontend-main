import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'state';
import Web3 from 'web3';
import * as LunarSlice from './lunar.slice';

export const useLunarFacade = () => {
  const dispatch = useAppDispatch();

  const lunarState = useAppSelector((state) => state.lunarState);

  const updateLunarState = useCallback(
    (payload) => dispatch(LunarSlice.actions.updateLunarState(payload)),
    [dispatch]
  );

  return {
    lunarState,
    updateLunarState,
  };
};
