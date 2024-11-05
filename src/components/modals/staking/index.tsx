import { FC, useEffect, useState } from 'react';

import { useUserFacade } from 'state/user';
import { useWeb3Facade } from 'state/web3';
import { StakingContract, TokenContract, FarmingContract } from 'contracts';
import { EXPLORERS, CHAINS } from '../../../constants';

import { Modal, Button, Spinner } from 'components';
import { SVG_LIBRE1, SVG_SUCCESS } from 'assets/icons';
import 'react-input-range/lib/css/index.css';

type StakingModalProps = {
  isOpen: boolean;
  hide: () => void;
  amount: string;
};

export const StakingModal: FC<StakingModalProps> = ({
  isOpen,
  hide,
  amount,
}) => {
  const { userState, updateBalance } = useUserFacade();
  const { balance, address, chain: userChain } = userState;
  const { web3, provider, chainId: web3ChainId } = useWeb3Facade();

  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  useEffect(() => {
    setLoading(true);
    TokenContract.approve(address, amount.toString(), userChain, web3)
      .then((res) => {
        FarmingContract.stake(address, amount.toString(), userChain, web3).then(
          (result) => {
            setLoading(false);
            setTransactionHash(result.transactionHash);
          }
        );
      })
      .catch((err) => {
        setLoading(false);
        hide();
        alert('Something went wrong. Try again.');
      });
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      hide={loading ? () => {} : hide}
      title={loading ? 'Please confirm:' : 'Success:'}
    >
      <div className="flex flex-col items-center">
        {loading ? (
          <>
            <div className="mt-10 text-center">
              <Spinner />
              <h3 className="text-lg font-semibold">Please confirm...</h3>
              <h2 className="text-3xl font-semibold mt-2">
                Waiting for Confirmation
              </h2>
            </div>
          </>
        ) : (
          <>
            <SVG_SUCCESS />
            <h2 className="text-3xl font-semibold mt-2">
              Transaction Submitted
            </h2>
            <a
              href={
                transactionHash
                  ? `${EXPLORERS[web3ChainId]}/tx/${transactionHash}`
                  : '#'
              }
              className="text-primary"
              target="_blank"
              rel="noreferrer"
            >
              View on {CHAINS[userChain].explorer}
            </a>
            <Button className="mt-16 w-full" onClick={hide} variant="primary">
              Close
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
