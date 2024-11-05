import {ILiquidityState} from './liquidity.slice';

// Reducers
export const reducers = {
  updateLiquidityState(state: ILiquidityState, action: any) {
    return {...state, ...action.payload};
  },
  addLiquidityToken(state: ILiquidityState, action: any) {
    if (!state.tokens.find((token) => token.address === action.payload.address))
      state.tokens.push(action.payload);
    return state;
  },
};

export const extraReducers = {};
