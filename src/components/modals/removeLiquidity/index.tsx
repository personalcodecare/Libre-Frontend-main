import React, { useState } from 'react';
import { Modal, Button, Spinner } from 'components';

import RemoveLiquidity from '../../../pages/exchange/LiquidityComponents/RemoveLiquidity';
import { useUserFacade, useWeb3Facade, useLunarFacade } from 'state';
import { EXPLORERS, CHAINS } from '../../../constants';
import { SVG_LIBRE1, SVG_SUCCESS } from 'assets/icons';

type IRemoveLiquidityModalProps = {
  isOpen: boolean;
  hide: () => void;
  token0: any;
  token1: any;
};

export const RemoveLiquidityModal: React.FC<IRemoveLiquidityModalProps> = ({
  isOpen,
  hide,
  token0,
  token1,
}) => {
  const { userState, updateBalance } = useUserFacade();
  const { address, chainId: userChainId, chain: userChain } = userState;
  const { chainId: web3ChainId, web3 } = useWeb3Facade();

  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  return (
    <Modal
      isOpen={isOpen}
      hide={() => {
        if (!loading) hide();
      }}
      title={`Remove ${token0 ? token0.symbol : ''}-${
        token1 ? token1.symbol : ''
      } Liquidity`}
    >
      {loading ? (
        <div className="flex flex-col">
          <div className="mt-10 text-center">
            <Spinner />
            <h3 className="text-lg font-semibold">Please Wait...</h3>
            <h2 className="text-3xl font-semibold mt-2">Removing Liquidity</h2>
          </div>
        </div>
      ) : transactionHash ? (
        <div className="flex flex-col items-center mt-8">
          <SVG_SUCCESS />
          <h2 className="text-3xl font-semibold mt-2">Transaction Submitted</h2>
          <div className="text-center mt-5">
            <a
              href={
                transactionHash
                  ? `${EXPLORERS[web3ChainId]}/tx/${transactionHash}`
                  : '#'
              }
              target="_blank"
              rel="noreferrer"
              className="text-primary font-bold"
            >
              View on {CHAINS[userChain].explorer}
            </a>
          </div>
        </div>
      ) : (
        <RemoveLiquidity
          token0={token0}
          token1={token1}
          setLoading={setLoading}
          setTransactionHash={setTransactionHash}
        />
      )}
    </Modal>
  );
};
