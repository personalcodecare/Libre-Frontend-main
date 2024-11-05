import {IExchangeState} from './exchange.slice';

// Reducers
export const reducers = {
  updateExchangeState(state: IExchangeState, action: any) {
    return {...state, ...action.payload};
  },
  addExchangeToken(state: IExchangeState, action: any) {
    if (!state.tokens.find((token) => token.address === action.payload.address))
      state.tokens.push(action.payload);
    return state;
  },
};

export const extraReducers = {};
