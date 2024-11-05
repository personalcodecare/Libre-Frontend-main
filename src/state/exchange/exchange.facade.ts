import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from 'state';
import Web3 from 'web3';
import * as ExchangeSlice from './exchange.slice';

export const useExchangeFacade = () => {
  const dispatch = useAppDispatch();

  const exchangeState = useAppSelector((state) => state.exchangeState);

  const updateExchangeState = useCallback(
    (payload) => dispatch(ExchangeSlice.actions.updateExchangeState(payload)),
    [dispatch]
  );

  const addExchangeToken = useCallback(
    (payload) => dispatch(ExchangeSlice.actions.addExchangeToken(payload)),
    [dispatch]
  );

  return {
    exchangeState,
    updateExchangeState,
    addExchangeToken,
  };
};
