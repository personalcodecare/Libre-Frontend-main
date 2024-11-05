import { useEffect } from 'react';
import Image from 'next/image';

import { useModal } from 'hooks';
import { useUserFacade } from 'state/user';
import { useWeb3Facade } from 'state/web3';
// import { VestingContract } from 'contracts';
import { formatNumber } from 'utils';

import { PageContainer, Button } from 'components';
import { SVG_LIBRE } from 'assets/icons';

export default function Investor() {
  const {
    isOpen: isClaimRewardsModalOpen,
    showModal: showClaimRewardsModal,
    hideModal: hideClaimRewardsModal,
  } = useModal();

  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const { address, balance } = userState;
  const { web3, chainId } = useWeb3Facade();

  useEffect(() => {
    if (web3 && address) {
      // VestingContract.getTokenGrants(address, web3)
      //   .then((res) => console.log({ res }))
      //   .catch((error) => console.error(error));
    }
  }, [web3, address]);

  return (
    <PageContainer>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Investor Tokens</h1>
        <div className="flex items-center">
          <SVG_LIBRE />
          <span className="text-xl">
            Wallet Balance: <strong>{formatNumber(balance)}</strong>
          </span>
        </div>
      </div>
      <div className="mt-8 rounded-3xl shadow bg-white py-7">
        <div className="px-8">
          <h3 className="text-xl font-semibold">Your Libre Tokens</h3>
        </div>
        <table className="table-fixed w-full mt-8">
          <thead>
            <tr className="bg-primary bg-opacity-10">
              <th className="text-primary text-left px-8 py-4 whitespace-nowrap">
                TOTAL LIBRE
              </th>
              <th className="text-primary text-left px-8 py-4 whitespace-nowrap">
                AVAILABLE TO CLAIM
              </th>
              <th className="text-primary text-left px-8 py-4 whitespace-nowrap">
                VESTING SCHEDULE
              </th>
              <th className="text-primary text-left px-8 py-4 whitespace-nowrap">
                PER DAY CLAIM
              </th>
              <th className="text-primary text-left px-8 py-4 whitespace-nowrap">
                PER MONTH CLAIM
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold px-8 py-4">400,000</td>
              <td className="font-bold px-8 py-4">20,000</td>
              <td className="font-bold px-8 py-4">12mo. (Linear)</td>
              <td className="font-bold px-8 py-4">2,000</td>
              <td className="font-bold px-8 py-4">24,000</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="text-center mt-14">
        <p className="text-lg font-semibold">Available to Claim</p>
        <p className="text-5xl font-semibold">20,000.00</p>
        <Button className="mt-2" variant="primary" onClick={() => {}}>
          Claim Tokens
        </Button>
        <p className="text-lg text-black space-x-1 mt-10 font-normal">
          Please refer to{' '}
          <a href="#" className="underline">
            Libre whitepaper
          </a>{' '}
          for full vesting schedule details.
        </p>
      </div>
    </PageContainer>
  );
}
