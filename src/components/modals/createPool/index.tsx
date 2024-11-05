import { FC, useState, useEffect } from 'react';
import Web3 from 'web3';
import Image from 'next/image';

import { useUserFacade, useWeb3Facade, useLunarFacade } from 'state';
import { Bep20Contract, FarmingContract, StakingContract } from 'contracts';
import { formatNumber, parseInt } from 'utils';
import { IBep20Token, LP_PAIRS, EXPLORERS, CHAINS } from '../../../constants';

import { Modal, Button, Spinner } from 'components';
import { SVG_METAMASK, SVG_SUCCESS } from 'assets/icons';
import { totalSupply } from 'contracts/bep20';

type ICreatePoolModalProps = {
  isOpen: boolean;
  hide: () => void;
  activePair: number;
  depositAmount: string;
  slippage: number;
  activeLpBalance: string;
  setActiveLpBalance: (index: number, value: string) => void;
  symbol: string;
};

export const CreatePoolModal: FC<ICreatePoolModalProps> = ({
  isOpen,
  hide,
  activePair,
  depositAmount,
  slippage,
  activeLpBalance,
  setActiveLpBalance,
  symbol,
}) => {
  const { userState, updateBalance } = useUserFacade();
  const { address, chainId: userChainId, chain: userChain } = userState;
  const { chainId: web3ChainId, web3 } = useWeb3Facade();
  const { lunarState } = useLunarFacade();

  const [loading, setLoading] = useState(false);
  const [lpTotalSupply, setLpTotalSupply] = useState('0.00');
  const [transactionHash, setTransactionHash] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);
    try {
      const tokenSymbol = LP_PAIRS[userChain][activePair].pair[1];
      if (
        tokenSymbol !== 'BNB' &&
        tokenSymbol !== 'AVAX' &&
        tokenSymbol !== 'MATIC'
      )
        await Bep20Contract.approve(
          address,
          depositAmount,
          LP_PAIRS[userChain][activePair].pair[1],
          userChain,
          web3
        );

      const result = await FarmingContract.deposit(
        activePair + 1,
        depositAmount,
        slippage,
        address,
        userChain,
        symbol,
        web3
      );
      setTransactionHash(result.transactionHash);

      const userInfo = await FarmingContract.getUserInfo(
        address,
        activePair + 1,
        userChain,
        web3
      );
      setActiveLpBalance(
        activePair,
        formatNumber(+Web3.utils.fromWei(userInfo.amount))
      );
      if (LP_PAIRS[userChain][activePair].address[web3ChainId]) {
        const totalSupply = await Bep20Contract.totalSupply(
          LP_PAIRS[userChain][activePair].address[web3ChainId],
          web3
        );
        setLpTotalSupply(Web3.utils.fromWei(totalSupply));
      }
    } catch (err: any) {
      if (
        err.message !==
        'MetaMask Tx Signature: User denied transaction signature.'
      ) {
        alert('Something went wrong. Try again.');
      }
      hide();
      console.log('FarmingDeposit - ', err);
    }
    setLoading(false);
  };

  const addLpToMetamask = async () => {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: LP_PAIRS[userChain][activePair].address[web3ChainId], // The address that the token is at.
          symbol: LP_PAIRS[userChain][activePair].symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: LP_PAIRS[userChain][activePair].decimals, // The number of decimals in the token
        },
      },
    });
  };

  useEffect(() => {
    if (web3 && address && web3ChainId === userChainId) {
      handleDeposit();
    }
    return () => hide();
  }, [web3, web3ChainId, userChainId, address]);

  return (
    <Modal
      isOpen={isOpen}
      hide={() => {
        if (!loading) hide();
      }}
      title={
        loading
          ? `Create ${LP_PAIRS[userChain][activePair].pair[0]}-${LP_PAIRS[userChain][activePair].pair[1]} LP`
          : !confirmed
          ? 'Confirmation:'
          : 'Success'
      }
    >
      <div className="flex flex-col">
        {loading ? (
          <>
            <div className="mt-10 text-center">
              <Spinner />
              <h3 className="text-lg font-semibold">Please Wait...</h3>
              <h2 className="text-3xl mobile:text-xl font-semibold mt-2">
                Creating LP Pair
              </h2>
            </div>
          </>
        ) : (
          <>
            <div className={`${!confirmed ? 'block' : 'hidden'}`}>
              <div className="flex items-center">
                <h2 className="text-4xl font-semibold mr-2.5">
                  {activeLpBalance}
                </h2>
                <Image
                  src={`/assets/icons/${LP_PAIRS[userChain][
                    activePair
                  ].pair[0].toLowerCase()}.svg`}
                  width={47}
                  height={47}
                />
                <Image
                  src={`/assets/icons/${LP_PAIRS[userChain][
                    activePair
                  ].pair[1].toLowerCase()}.svg`}
                  width={47}
                  height={47}
                />
              </div>
              <p className="text-lg font-medium mt-2">
                {LP_PAIRS[userChain][activePair].pair[0]}-
                {LP_PAIRS[userChain][activePair].pair[1]} Pool Tokens
              </p>
              <div className="mt-10">
                <div className="flex justify-between">
                  <span className="text-base font-medium">
                    {LP_PAIRS[userChain][activePair].pair[1]} Deposited
                  </span>
                  <span className="text-base font-medium">
                    {formatNumber(parseInt(depositAmount) / 2, 4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base font-medium">
                    {LP_PAIRS[userChain][activePair].pair[0]} Deposited
                  </span>
                  <span className="text-base font-medium">
                    {formatNumber(
                      ((parseInt(depositAmount) / 2) *
                        lunarState[LP_PAIRS[userChain][activePair].pair[1]]) /
                        lunarState[LP_PAIRS[userChain][activePair].pair[0]],
                      4
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base font-medium">Rates</span>
                  <span className="text-base font-medium">
                    1 {LP_PAIRS[userChain][activePair].pair[1]} ={' '}
                    {formatNumber(
                      lunarState[LP_PAIRS[userChain][activePair].pair[1]] /
                        lunarState[LP_PAIRS[userChain][activePair].pair[0]],
                      4
                    )}{' '}
                    {LP_PAIRS[userChain][activePair].pair[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base font-medium">Share of Pool:</span>
                  <span className="text-base font-medium">
                    {formatNumber(
                      (parseInt(activeLpBalance) * 100) /
                        +lpTotalSupply.replace(',', ''),
                      8
                    )}
                    %
                  </span>
                </div>
              </div>

              <Button
                className="mt-6 w-full rounded-full"
                onClick={() => setConfirmed(true)}
                variant="primary"
              >
                Confirm Supply
              </Button>
              <p className="text-xs mt-5 font-medium text-center">
                We’ve successfully created your LP Token. Please confirm <br />
                supply to begin farming rewards.
              </p>
            </div>

            <div className={`${confirmed ? 'block' : 'hidden'}`}>
              <div className="flex justify-center">
                <SVG_SUCCESS />
              </div>
              <span className="flex justify-center my-3 text-2xl font-bold">
                Transaction Submitted
              </span>
              <div className="text-center">
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
              <div
                className="w-full mt-5 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer py-2"
                onClick={addLpToMetamask}
              >
                <SVG_METAMASK />
                <p className="font-bold text-base text-gray-700 ml-1">
                  Add {LP_PAIRS[userChain][activePair].pair[0]}-
                  {LP_PAIRS[userChain][activePair].pair[1]} LP to Metamask
                </p>
              </div>
              <Button
                className="mt-6 w-full rounded-full"
                onClick={() => {
                  setConfirmed(false);
                }}
                variant="primary"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
