import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "state";
import * as web3Slice from "./web3.slice";

export const useWeb3Facade = () => {
  const dispatch = useAppDispatch();

  const web3State = useAppSelector((state) => state.web3State);
  const web3 = useAppSelector((state) => state.web3State.web3);
  const provider = useAppSelector((state) => state.web3State.provider);
  const chainId = useAppSelector((state) => state.web3State.chainId);

  const updateWeb3State = useCallback(
    (payload) => dispatch(web3Slice.actions.updateWeb3State(payload)),
    [dispatch]
  );

  return {
    web3,
    provider,
    chainId,
    updateWeb3State,
  };
};
