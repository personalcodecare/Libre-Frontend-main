import { FC, useState } from 'react';
import Web3 from 'web3';
import Image from 'next/image';

import { useUserFacade } from 'state/user';
import { useWeb3Facade } from 'state/web3';
import { FarmingContract, StakingContract } from 'contracts';
import { formatNumber } from 'utils';

import { Modal, Button, Spinner } from 'components';
import { SVG_LIBRE1 } from 'assets/icons';
import 'react-input-range/lib/css/index.css';

type ClaimRewardsModalProps = {
  isOpen: boolean;
  hide: () => void;
  rewards: string;
};

export const ClaimRewardsModal: FC<ClaimRewardsModalProps> = ({
  isOpen,
  hide,
  rewards,
}) => {
  const { userState, updateBalance } = useUserFacade();
  const { address } = userState;
  const { chainId, web3 } = useWeb3Facade();

  const [loading, setLoading] = useState(false);

  const onClaimRewards = () => {
    setLoading(true);

    // FarmingContract.unstake(Web3.utils.toWei(rewards), address, web3)
    //   .then((result) => {
    //     updateBalance(address, web3);
    //     setLoading(false);
    //     hide();
    //   })
    //   .catch((err) => {
    //     alert('Something went wrong. Try again.');
    //     hide();
    //     console.log({ err });
    //   });
  };

  return (
    <Modal
      isOpen={isOpen}
      hide={() => {
        if (!loading) hide();
      }}
      title="Claim Your Rewards"
    >
      <div className="flex flex-col items-center">
        {loading ? (
          <>
            <div className="mt-10 text-center">
              <Spinner />
              <h3 className="text-lg font-semibold">Please Wait...</h3>
              <h2 className="text-3xl font-semibold mt-2">
                Claiming Your Rewards
              </h2>
            </div>
          </>
        ) : (
          <>
            <SVG_LIBRE1 />
            <h3 className="text-lg font-semibold mt-2">Available Rewards</h3>
            <h2 className="text-5xl font-semibold">{formatNumber(rewards)}</h2>
            <p className="text-primary text-base font-semibold mt-3 mb-4">
              {/* ~{formatNumber(TOKEN_PRICE * +rewards)} USD */}
            </p>
            <Button
              className="mt-6 w-full"
              onClick={onClaimRewards}
              variant="primary"
            >
              Claim Rewards
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
