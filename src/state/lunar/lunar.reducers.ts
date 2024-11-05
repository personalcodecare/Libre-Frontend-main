import { ILunarState } from './lunar.slice';

// Reducers
export const reducers = {
  updateLunarState(state: ILunarState, action: any) {
    return { ...state, ...action.payload };
  },
};

export const extraReducers = {};
