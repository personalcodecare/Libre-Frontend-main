import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from 'state';
import Web3 from 'web3';
import * as LiquiditySlice from './liquidity.slice';

export const useLiquidityFacade = () => {
  const dispatch = useAppDispatch();

  const liquidityState = useAppSelector((state) => state.liquidityState);

  const updateLiquidityState = useCallback(
    (payload) => dispatch(LiquiditySlice.actions.updateLiquidityState(payload)),
    [dispatch]
  );

  const addLiquidityToken = useCallback(
    (payload) => dispatch(LiquiditySlice.actions.addLiquidityToken(payload)),
    [dispatch]
  );

  return {
    liquidityState,
    updateLiquidityState,
    addLiquidityToken,
  };
};
