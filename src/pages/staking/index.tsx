import { useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import Image from 'next/image';
import Head from 'next/head';
import InputRange from 'react-input-range';
import Link from 'next/link';
import { useModal } from 'hooks';
import {
  useAppFacade,
  useUserFacade,
  useWeb3Facade,
  useLunarFacade,
} from 'state';
import {
  StakingContract,
  TokenContract,
  NFTMintContract,
  FarmingContract,
  ApyContract,
} from 'contracts';
import { CHAINS, RPC_URLS } from '../../constants';
import { formatNumber, parseInt } from 'utils';

import {
  PageContainer,
  Button,
  StakingModal,
  ClaimRewardsModal,
  Input,
  ChainSelector,
} from 'components';
import { SVG_LIBRE1, SVG_CARET_DOWN } from 'assets/icons';

export default function Staking() {
  const { appEnv } = useAppFacade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { lunarState } = useLunarFacade();
  const {
    isOpen: isStakingModalOpen,
    showModal: showStakingModal,
    hideModal: hideStakingModal,
  } = useModal();

  const [nftboostModal, setNFTBoostModal] = useState(false);
  const [totalDeposited, setTotalDeposited] = useState('0');
  const [libreEarned, setLibreEarned] = useState('0');
  const [totalLocked, setTotalLocked] = useState('0');
  const [rewards, setRewards] = useState('0');
  const [showDetails, setShowDetails] = useState(false);
  const [usdBalance, setUsdBalance] = useState('0.00');
  const [depositAmount, setDepositAmount] = useState(0.0);
  const [withdrawAmount, setWithdrawAmount] = useState(0.0);
  const [depositPercentage, setDepositPercentage] = useState(0);
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const [nftBalance, setNftBalance] = useState(0);
  const [lpApy, setLpApy] = useState(0);
  const [nextClaimTime, setNextClaimTime] = useState(0);
  const handleCompound = async () => {
    try {
      await FarmingContract.restake(
        address,
        userChain,
        web3
      );
    } catch (err) {
      console.log('Restake - ', err);
    }
  }

  const handleClaim = async () => {
    try {
      await FarmingContract.claimReward(
        0,
        address,
        userChain,
        web3
      );
    } catch (err) {
      console.log('Claim Reward - ', err);
    }
  }

  const handleStake = async () => {
    if (depositAmount > 0) {
      showStakingModal();
    }
  };

  const handleUnstake = async () => {
    if (withdrawAmount > 0) {
      try {
        await FarmingContract.unstake(
          address,
          withdrawAmount.toString(),
          userChain,
          web3
        );
        FarmingContract.getUserInfo(address, 0, userChain, web3).then(
          (result: any) => {
            setTotalDeposited(Web3.utils.fromWei(result.amount));
            setWithdrawAmount(0);
            setWithdrawPercentage(0);
            updateBalance(address, userChain, web3);
          }
        );
      } catch (err) {
        console.log('Unstake - ', err);
      }
    }
  };

  const unstakefromoldcontract = async () => {
    try {
      if (userChain == "POLY"){
        await FarmingContract.emergencyWithdraw_V1(
          0,
          address,
          userChain,
          web3
        );
      }
      else{
        FarmingContract.getUserInfo_v1(address, 0, userChain, web3).then(
          async (result: any) => {
            await FarmingContract.unstake_v1(
              address,
              Web3.utils.fromWei(result.amount).toString(),
              userChain,
              web3
            );
          }
        );
      }
      
    } catch (err) {
      console.log('unstakefromoldcontract - ', err);
    }
  };

  useEffect(() => {
    if (web3 && address && web3ChainId === userChainId) {
      updateBalance(address, userChain, web3);

      (async()=>{
        if (userChain == "BSC"){
          const count = await NFTMintContract.getBalanceOfOwner(userChain, web3, address);
          setNftBalance(count);
        }
        
        const nextClaimTime = await FarmingContract.getNextClaimTime(
          0,
          address,
          userChain,
          web3
        );

        const rewardPeriod = await FarmingContract.rewardPeriod(
          userChain,
          web3
        );

        console.log("nextClaimTime, rewardPeriod", nextClaimTime, rewardPeriod)
        setNextClaimTime(parseInt(nextClaimTime) + parseInt(rewardPeriod));
      })();

    } else if (web3ChainId !== userChainId) {
      updateUserInfo({ balance: 0 });
      setTotalDeposited('0');
      setRewards('0');
      console.log("lunarState", lunarState);
      // setLpApy(0);
      // setTotalLocked('0');
    }
  }, [web3, address, web3ChainId, userChainId, updateBalance, updateUserInfo]);

  useEffect(() => {
    if (web3 && address && web3ChainId === userChainId && userChainId) {
      FarmingContract.getUserInfo(address, 0, userChain, web3)
        .then((result: any) => {
          setTotalDeposited(Web3.utils.fromWei(result.amount));
        })
        .catch((err) => console.log('FarmingUserInfo - ', err));
      FarmingContract.pendingLib(address, 0, userChain, web3)
        .then((result: any) => {
          setRewards(Web3.utils.fromWei(result));
        })
        .catch((err) => console.log('FarmingPendingLib - ', err));
      // FarmingContract.getTotalLockedAmount(userChain)
      //   .then((res) => setTotalLocked(Web3.utils.fromWei(res)))
      //   .catch((err) => console.log('FarmingTotalLockedAmount - ', err));
      // ApyContract.APY(0, userChain, web3)
      //   .then((res) => {
      //     setLpApy(
      //       CHAINS[userChain].blocks *
      //         parseInt(Web3.utils.fromWei(res.rewardPerBlock)) *
      //         100
      //     );
      //   })
      //   .catch((err) => console.log('GetAPY - ', err));
    }
  });

  useEffect(() => {
    if (depositPercentage > 0)
      setDepositAmount((+balance * depositPercentage) / 100);
    else setDepositAmount(0);
  }, [depositPercentage]);

  useEffect(() => {
    if (withdrawPercentage > 0)
      setWithdrawAmount((+totalDeposited * withdrawPercentage) / 100);
    else setWithdrawAmount(0);
  }, [withdrawPercentage]);

  useEffect(() => {
    if (!isStakingModalOpen) {
      updateBalance(address, userChain, web3);
    }
  }, [isStakingModalOpen]);

  useEffect(() => {
    if (userChain) {
      const web3 = new Web3(RPC_URLS[userChain].prod);

      (async () => {
        FarmingContract.getTotalLockedAmount(userChain)
          .then((res) => setTotalLocked(Web3.utils.fromWei(res)))
          .catch((err) => console.log('FarmingTotalLockedAmount - ', err));
        ApyContract.APY(0, userChain, web3)
          .then((res) => {
            setLpApy(
              CHAINS[userChain].blocks *
                parseInt(Web3.utils.fromWei(res.rewardPerBlock)) *
                100
            );
          })
          .catch((err) => console.log('GetAPY - ', err));

          
      })();
    }
  }, [userChain]);

  return (
    <PageContainer>
      <Head>
        <title>Staking | Libre DeFi</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex justify-between items-center relative mb-5 dark:text-white mobile:flex-col mobile:justify-center">
        <div className="w-full">
          <h1 className="text-3xl font-semibold mobile:text-center">
            Libre Staking
          </h1>
          <h3 className="text-base mobile:text-center">
            {userChain === 'BSC' ? (
              <>
                {nftBalance > 0 ? 
                <button
                className="inline-flex justify-center items-center pt-1 pb-1 bg-primary text-xs mobile:text-xs text-white px-3 rounded-full mt-2"
                onClick={() => {

                }}
              >
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.44746 3.52928C9.28977 3.35423 9.19697 3.13035 9.18458 2.89508C9.14879 2.35533 8.91821 1.84694 8.5357 1.46445C8.15319 1.08195 7.6448 0.851371 7.10504 0.815582C6.86974 0.803108 6.64581 0.710462 6.47049 0.553052C6.06359 0.196616 5.54108 9.18866e-05 5.00014 3.05319e-05C4.4592 -3.08227e-05 3.93665 0.196374 3.52968 0.552718C3.35446 0.710358 3.13049 0.803142 2.89513 0.815588C2.35537 0.85138 1.84698 1.08196 1.46447 1.46446C1.08197 1.84695 0.851388 2.35533 0.815598 2.89508C0.803179 3.1305 0.710259 3.35451 0.552394 3.52961C0.196264 3.93668 -2.99115e-07 4.45918 6.10495e-05 5.00004C0.000122398 5.5409 0.196505 6.06336 0.552728 6.47035C0.710369 6.64556 0.803153 6.86953 0.815598 7.10488C0.851386 7.64463 1.08197 8.15302 1.46448 8.53551C1.84698 8.91801 2.35538 9.14859 2.89514 9.18438C3.13044 9.19686 3.35437 9.28951 3.52969 9.44692C3.93656 9.80341 4.45908 9.99996 5.00003 10C5.54099 10.0001 6.06355 9.80365 6.4705 9.44726C6.64571 9.28962 6.86969 9.19683 7.10505 9.18438C7.64481 9.1486 8.15321 8.91802 8.53572 8.53552C8.91822 8.15302 9.14881 7.64464 9.1846 7.10489C9.19707 6.8696 9.28973 6.64568 9.44715 6.47036C9.80352 6.06337 9.99999 5.54083 10 4.99988C10.0001 4.45892 9.80374 3.93635 9.44746 3.52928ZM7.24272 4.70625L6.27482 5.50503C6.237 5.53695 6.2091 5.57902 6.19443 5.62628C6.17975 5.67353 6.1789 5.724 6.19198 5.77173L6.52609 7.01294C6.54141 7.06101 6.54148 7.11264 6.52627 7.16074C6.51107 7.20884 6.48133 7.25105 6.44116 7.28156C6.40099 7.31208 6.35236 7.32941 6.30194 7.33116C6.25152 7.33292 6.2018 7.31902 6.1596 7.29137L5.13414 6.57556C5.09491 6.5479 5.04808 6.53305 5.00008 6.53305C4.95208 6.53305 4.90525 6.5479 4.86602 6.57556L3.84056 7.29137C3.79836 7.31901 3.74864 7.33291 3.69822 7.33116C3.64781 7.3294 3.59917 7.31207 3.559 7.28155C3.51884 7.25104 3.48911 7.20883 3.4739 7.16073C3.45869 7.11263 3.45876 7.061 3.47408 7.01294L3.80819 5.77173C3.82127 5.724 3.82042 5.67353 3.80574 5.62628C3.79106 5.57902 3.76317 5.53695 3.72535 5.50503L2.75744 4.70625C2.71837 4.67407 2.68977 4.63099 2.67528 4.58249C2.6608 4.53399 2.66108 4.48228 2.6761 4.43395C2.69111 4.38561 2.72019 4.34284 2.7596 4.31109C2.79902 4.27934 2.847 4.26005 2.89743 4.25567L4.12939 4.20453C4.17788 4.2019 4.22447 4.18479 4.26314 4.15541C4.30181 4.12603 4.33077 4.08573 4.34629 4.03971L4.77359 2.83009C4.78902 2.78216 4.81926 2.74036 4.85996 2.71071C4.90066 2.68106 4.94972 2.66508 5.00007 2.66508C5.05043 2.66508 5.09949 2.68106 5.14019 2.71071C5.18089 2.74036 5.21113 2.78216 5.22656 2.83009L5.65385 4.03971C5.66938 4.08573 5.69834 4.12603 5.73701 4.15541C5.77568 4.18479 5.82227 4.2019 5.87076 4.20453L7.10272 4.25567C7.15315 4.26005 7.20113 4.27934 7.24055 4.31109C7.27997 4.34284 7.30904 4.3856 7.32406 4.43394C7.33908 4.48228 7.33936 4.53399 7.32488 4.58249C7.31039 4.63098 7.28179 4.67407 7.24272 4.70625Z" fill="white"/>
                </svg>&nbsp;

                NFT BOOST ACTIVE
              </button> :
              <button
                className="inline-flex justify-center items-center pt-1 pb-1 bg-gray-300 text-xs mobile:text-xs text-white px-3 rounded-full mt-2"
                onClick={() => {
                  setNFTBoostModal(true);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.44746 3.52928C9.28977 3.35423 9.19697 3.13035 9.18458 2.89508C9.14879 2.35533 8.91821 1.84694 8.5357 1.46445C8.15319 1.08195 7.6448 0.851371 7.10504 0.815582C6.86974 0.803108 6.64581 0.710462 6.47049 0.553052C6.06359 0.196616 5.54108 9.18866e-05 5.00014 3.05319e-05C4.4592 -3.08227e-05 3.93665 0.196374 3.52968 0.552718C3.35446 0.710358 3.13049 0.803142 2.89513 0.815588C2.35537 0.85138 1.84698 1.08196 1.46447 1.46446C1.08197 1.84695 0.851388 2.35533 0.815598 2.89508C0.803179 3.1305 0.710259 3.35451 0.552394 3.52961C0.196264 3.93668 -2.99115e-07 4.45918 6.10495e-05 5.00004C0.000122398 5.5409 0.196505 6.06336 0.552728 6.47035C0.710369 6.64556 0.803153 6.86953 0.815598 7.10488C0.851386 7.64463 1.08197 8.15302 1.46448 8.53551C1.84698 8.91801 2.35538 9.14859 2.89514 9.18438C3.13044 9.19686 3.35437 9.28951 3.52969 9.44692C3.93656 9.80341 4.45908 9.99996 5.00003 10C5.54099 10.0001 6.06355 9.80365 6.4705 9.44726C6.64571 9.28962 6.86969 9.19683 7.10505 9.18438C7.64481 9.1486 8.15321 8.91802 8.53572 8.53552C8.91822 8.15302 9.14881 7.64464 9.1846 7.10489C9.19707 6.8696 9.28973 6.64568 9.44715 6.47036C9.80352 6.06337 9.99999 5.54083 10 4.99988C10.0001 4.45892 9.80374 3.93635 9.44746 3.52928ZM7.24272 4.70625L6.27482 5.50503C6.237 5.53695 6.2091 5.57902 6.19443 5.62628C6.17975 5.67353 6.1789 5.724 6.19198 5.77173L6.52609 7.01294C6.54141 7.06101 6.54148 7.11264 6.52627 7.16074C6.51107 7.20884 6.48133 7.25105 6.44116 7.28156C6.40099 7.31208 6.35236 7.32941 6.30194 7.33116C6.25152 7.33292 6.2018 7.31902 6.1596 7.29137L5.13414 6.57556C5.09491 6.5479 5.04808 6.53305 5.00008 6.53305C4.95208 6.53305 4.90525 6.5479 4.86602 6.57556L3.84056 7.29137C3.79836 7.31901 3.74864 7.33291 3.69822 7.33116C3.64781 7.3294 3.59917 7.31207 3.559 7.28155C3.51884 7.25104 3.48911 7.20883 3.4739 7.16073C3.45869 7.11263 3.45876 7.061 3.47408 7.01294L3.80819 5.77173C3.82127 5.724 3.82042 5.67353 3.80574 5.62628C3.79106 5.57902 3.76317 5.53695 3.72535 5.50503L2.75744 4.70625C2.71837 4.67407 2.68977 4.63099 2.67528 4.58249C2.6608 4.53399 2.66108 4.48228 2.6761 4.43395C2.69111 4.38561 2.72019 4.34284 2.7596 4.31109C2.79902 4.27934 2.847 4.26005 2.89743 4.25567L4.12939 4.20453C4.17788 4.2019 4.22447 4.18479 4.26314 4.15541C4.30181 4.12603 4.33077 4.08573 4.34629 4.03971L4.77359 2.83009C4.78902 2.78216 4.81926 2.74036 4.85996 2.71071C4.90066 2.68106 4.94972 2.66508 5.00007 2.66508C5.05043 2.66508 5.09949 2.68106 5.14019 2.71071C5.18089 2.74036 5.21113 2.78216 5.22656 2.83009L5.65385 4.03971C5.66938 4.08573 5.69834 4.12603 5.73701 4.15541C5.77568 4.18479 5.82227 4.2019 5.87076 4.20453L7.10272 4.25567C7.15315 4.26005 7.20113 4.27934 7.24055 4.31109C7.27997 4.34284 7.30904 4.3856 7.32406 4.43394C7.33908 4.48228 7.33936 4.53399 7.32488 4.58249C7.31039 4.63098 7.28179 4.67407 7.24272 4.70625Z" fill="white"/>
                </svg>&nbsp;

                NFT BOOST INACTIVE
              </button>
              }
              </>  
            ) : (<></>)}
            {//Stake your Libre tokens and earn rewards.
            }
            {/* NFT BOOST Modal */}
            <div
                className={`${
                  nftboostModal ? 'flex flex-col' : 'hidden'
                } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
              >
                <div
                  className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-10"
                  onClick={() => setNFTBoostModal(false)}
                />
                <div className="w-1/4 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-xl shadow-lg bg-white text-black">
                  <span className="text-xl font-semibold text-black bg-gray-200 py-3 pl-6">
                    NFT Boosts:
                  </span>
                  <div className="px-6 pt-4 pb-4 flex flex-col">
                    <div className="mt-8 px-12 inline-flex justify-center items-center gap-4 text-lg font-semibold">
                      You don’t currently have any NFTs in your wallet.
                    </div>
                    <div className="mt-8 flex flex-row gap-4 mb-8">
                      <button
                        className=" w-1/2 rounded-full bg-white border border-primary text-primary py-3"
                        onClick={() => setNFTBoostModal(false)}
                        
                      >
                        Close
                      </button>
                      <Link
                        href={'/nftmint'}
                        passHref
                      >
                        <button
                          className={`w-1/2 rounded-full bg-primary border border-primary text-white py-3`}
                          
                        >
                          Mint Now!
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <ChainSelector />
        </div>
        <div className="flex items-center mobile:mt-7 w-full justify-end">
          <SVG_LIBRE1 width="33" height="33" />
          <span className="text-xl ml-1">
            <strong>{formatNumber(balance)}</strong> LIBRE
          </span>
        </div>
      </div>
      <div
        className="mt-3 mb-3 pl-8 pr-8 border-solid border rounded-xl bg-white dark:bg-secondary dark:text-white mobile:hidden"
        style={{
          borderColor:
            userChain === 'BSC' ? 'var(--primary)' : CHAINS[userChain].bgColor,
        }}
      >
        <div className="pt-4 pb-4 flex items-center justify-between">
          <div>
            <Image src={`/assets/icons/libre.svg`} width={47} height={47} />
            <div className="-mt-6 ml-6">
              <Image src={`/assets/icons/libre.svg`} width={30} height={30} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Stake Libre</h3>
            <p className="text-xs dark:text-white dark:opacity-100 font-medium">
              Stake LIBRE, earn LIBRE
            </p>
            <button
              className="pt-1 pb-1 bg-primary text-sm font-bold text-white w-52 rounded-md mt-2"
              onClick={() => {
                unstakefromoldcontract();
              }}
            >
              unstake old contract
            </button>
          </div>
          <div>
            <h3 className="text-2xl leading-7 font-bold text-center">
              {formatNumber(totalDeposited, 2)}
            </h3>
            <p className="text-xs dark:text-white dark:opacity-100 font-semibold text-center">
              Deposited
            </p>
          </div>
          <div>
            <h3 className="text-2xl leading-7 font-bold text-center text-primary">
              {formatNumber(rewards, 2)}
            </h3>
            <p className="text-xs text-primary font-semibold text-center">
              Libre Earned
            </p>
          </div>
          <div>
            <h3 className="text-2xl leading-7 font-bold text-center">
              {formatNumber(lpApy, 2)}%
            </h3>
            <p className="text-xs dark:text-white dark:opacity-100 font-semibold text-center">
              APR
            </p>
          </div>
          <div>
            <h3 className="text-2xl leading-7 font-bold text-center">
              {formatNumber(lpApy / 365, 2)}%
            </h3>
            <p className="text-xs dark:text-white dark:opacity-100  font-semibold text-center">
              Daily
            </p>
          </div>
          <div>
            <h3 className="text-2xl leading-7 font-bold text-center">
              ${formatNumber(+totalLocked * lunarState.LIBRE, 2)}
            </h3>
            <p className="text-xs dark:text-white dark:opacity-100 font-semibold text-center">
              TVL
            </p>
          </div>
          <div>
            <h3
              className="font-semibold text-xl leading-6 text-primary dark:text-white cursor-pointer flex items-center"
              onClick={() => {
                setShowDetails(!showDetails);
              }}
            >
              <span className="mr-1.5">Details</span> <SVG_CARET_DOWN />
            </h3>
          </div>
        </div>
        {showDetails && (
          <div className="pt-12 pb-12 border-t-2 border-gray-200 flex items-stretch">
            <div className="px-14 w-1/2">
              <h1 className="text-xl font-semibold">
                Balance: {formatNumber(balance)} LIBRE
              </h1>
              <h2 className="text-sm font-semibold">
                ~ {formatNumber(parseInt(balance) * lunarState.LIBRE, 2)} USD
              </h2>
              <Input
                value={depositAmount > 0 ? depositAmount.toString() : ''}
                onChange={(v) => setDepositAmount(+v)}
                className="mt-3 mb-5 bg-grayBackground dark:text-black"
              />
              <InputRange
                maxValue={100}
                minValue={0}
                value={depositPercentage}
                step={5}
                onChange={(value) => {
                  setDepositPercentage(value as number);
                }}
              />
              <div className="grid grid-cols-4 gap-2 w-full mt-10">
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setDepositPercentage(25)}
                >
                  25%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setDepositPercentage(50)}
                >
                  50%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setDepositPercentage(75)}
                >
                  75%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setDepositPercentage(100)}
                >
                  MAX
                </button>
              </div>
            {/* <Button
                className="mt-6 w-full"
                onClick={handleStake}
                variant="primary"
              >
                Stake Libre
              </Button>*/} 
              <button
                className={`bg-gray-400 text-black font-semibold border-primary border mt-6 h-12 w-full rounded-md text-base mobile:text-sm`}
              >
                Stake Libre
              </button>
              <p className="mt-7 text-center text-sm font-medium">
                Stake your LIBRE tokens and earn high APR Libre rewards.
              </p>
            </div>
            <div className="px-14 w-1/2">
              <h1 className="text-xl font-semibold">
                Deposited: {formatNumber(totalDeposited)} LIBRE
              </h1>
              <h2 className="text-sm font-semibold">
                ~ {formatNumber(parseInt(totalDeposited) * lunarState.LIBRE, 2)}{' '}
                USD
              </h2>
              <Input
                value={withdrawAmount > 0 ? withdrawAmount.toString() : ''}
                onChange={(v) => setWithdrawAmount(+v)}
                className="mt-3 mb-5 dark:text-black"
              />
              <InputRange
                maxValue={100}
                minValue={0}
                value={withdrawPercentage}
                onChange={(value) => setWithdrawPercentage(value as number)}
              />
              <div className="grid grid-cols-4 gap-2 w-full mt-10">
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setWithdrawPercentage(25)}
                >
                  25%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setWithdrawPercentage(50)}
                >
                  50%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setWithdrawPercentage(75)}
                >
                  75%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setWithdrawPercentage(100)}
                >
                  MAX
                </button>
              </div>
              <Button
                className="mt-6 w-full"
                onClick={handleCompound}
                variant="secondary"
              >
                Compound Rewards
              </Button>
              <button
                className={`${
                  Math.floor(Date.now() / 1000) > nextClaimTime
                    ? 'bg-white hover:bg-primary hover:text-white'
                    : 'bg-gray-400 text-black'
                } font-semibold border-primary border mt-6 h-12 w-full rounded-md text-base mobile:text-sm text-primary`}
                onClick={handleClaim}
                disabled={
                  Math.floor(Date.now() / 1000) < nextClaimTime
                }
              >
                Claim Rewards
              </button>
              <Button
                className="mt-6 w-full"
                onClick={handleUnstake}
                variant="secondary"
              >
                Unstake Libre
              </Button>
              {/*userChain === 'AVAX' && (
                <Button
                  className="mt-6 w-full"
                  onClick={handleEmergencyWithdraw}
                  variant="secondary"
                >
                  Emergency Withdraw <br />
                  (From Old Contract)
                </Button>
              )*/}
              <p className="mt-7 text-center text-sm font-medium">
                A 2% withdrawal fee is applied on your total rewards.
                <br/>
                Rewards can be claimed every 7 days
              </p>
            </div>
          </div>
        )}
      </div>
      <div
        className="mt-3 mb-3 pl-8 pr-8 border-solid border rounded-xl bg-white dark:bg-secondary dark:text-white hidden mobile:block"
        style={{
          borderColor:
            userChain === 'BSC' ? 'var(--primary)' : CHAINS[userChain].bgColor,
        }}
      >
        <div className="pt-4 pb-4 flex flex-col items-center justify-between">
          <div className="flex justify-start w-full items-center">
            <div className="mr-6 flex-shrink-0">
              <Image src={`/assets/icons/libre.svg`} width={47} height={47} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Stake Libre</h3>
              <p className="text-xs dark:text-white dark:opacity-100 font-medium">
                Stake LIBRE, earn LIBRE
              </p>
              <button
                className="pt-1 pb-1 bg-primary text-sm font-bold text-white w-52 rounded-md mt-2"
                onClick={() => {
                  unstakefromoldcontract();
                }}
              >
                unstake old contract
              </button>
            </div>
          </div>
          <div className="flex items-center mt-5">
            <div className="mr-6">
              <h3 className="text-2xl leading-7 font-bold text-center">
                {formatNumber(totalDeposited, 2)}
              </h3>
              <p className="text-xs dark:text-white dark:opacity-100 font-semibold text-center">
                Deposited
              </p>
            </div>
            <div>
              <h3 className="text-2xl leading-7 font-bold text-center text-primary">
                {formatNumber(rewards, 2)}
              </h3>
              <p className="text-xs text-primary font-semibold text-center">
                Libre Earned
              </p>
            </div>
          </div>
          <div className="flex items-center mt-5">
            <div className="mr-6">
              <h3 className="text-2xl leading-7 font-bold text-center">
                {formatNumber(lpApy, 2)}%
              </h3>
              <p className="text-xs dark:text-white dark:opacity-100 font-semibold text-center">
                APR
              </p>
            </div>
            <div className="mr-6">
              <h3 className="text-2xl leading-7 font-bold text-center">
                {formatNumber(lpApy / 365, 2)}%
              </h3>
              <p className="text-xs dark:text-white dark:opacity-100  font-semibold text-center">
                Daily
              </p>
            </div>
            <div>
              <h3 className="text-2xl leading-7 font-bold text-center">
                ${formatNumber(+totalLocked * lunarState.LIBRE, 2)}
              </h3>
              <p className="text-xs dark:text-white dark:opacity-100 font-semibold text-center">
                TVL
              </p>
            </div>
          </div>
          <div className="mt-5">
            <h3
              className="font-semibold text-xl leading-6 text-primary dark:text-white cursor-pointer flex items-center"
              onClick={() => {
                setShowDetails(!showDetails);
              }}
            >
              <span className="mr-1.5">Details</span> <SVG_CARET_DOWN />
            </h3>
          </div>
        </div>
        {showDetails && (
          <div className="pt-12 pb-12 border-t-2 border-gray-200 flex items-stretch flex-col">
            <div className="w-full">
              <h1 className="text-xl font-semibold">
                Balance: {formatNumber(balance)} LIBRE
              </h1>
              <h2 className="text-sm font-semibold">
                ~ {formatNumber(parseInt(balance) * lunarState.LIBRE, 2)} USD
              </h2>
              <Input
                value={depositAmount > 0 ? depositAmount.toString() : ''}
                onChange={(v) => setDepositAmount(+v)}
                className="mt-3 mb-5 bg-grayBackground"
              />
              <InputRange
                maxValue={100}
                minValue={0}
                value={depositPercentage}
                step={5}
                onChange={(value) => {
                  setDepositPercentage(value as number);
                }}
              />
              <div className="grid grid-cols-4 gap-2 w-full mt-10">
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setDepositPercentage(25)}
                >
                  25%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setDepositPercentage(50)}
                >
                  50%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setDepositPercentage(75)}
                >
                  75%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setDepositPercentage(100)}
                >
                  MAX
                </button>
              </div>
              <Button
                className="mt-6 w-full"
                onClick={handleStake}
                variant="primary"
              >
                Stake Libre
              </Button>
              <p className="mt-7 text-center text-sm font-medium">
                Stake your LIBRE tokens and earn high APR Libre rewards.
              </p>
            </div>
            <div className="w-full mt-8">
              <h1 className="text-xl font-semibold">
                Deposited: {formatNumber(totalDeposited)} LIBRE
              </h1>
              <h2 className="text-sm font-semibold">
                ~ {formatNumber(parseInt(totalDeposited) * lunarState.LIBRE, 2)}{' '}
                USD
              </h2>
              <Input
                value={withdrawAmount > 0 ? withdrawAmount.toString() : ''}
                onChange={(v) => setWithdrawAmount(+v)}
                className="mt-3 mb-5"
              />
              <InputRange
                maxValue={100}
                minValue={0}
                value={withdrawPercentage}
                onChange={(value) => setWithdrawPercentage(value as number)}
              />
              <div className="grid grid-cols-4 gap-2 w-full mt-10">
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setWithdrawPercentage(25)}
                >
                  25%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setWithdrawPercentage(50)}
                >
                  50%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setWithdrawPercentage(75)}
                >
                  75%
                </button>
                <button
                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                  onClick={() => setWithdrawPercentage(100)}
                >
                  MAX
                </button>
              </div>
              <Button
                className="mt-6 w-full"
                onClick={handleCompound}
                variant="secondary"
              >
                Compound Rewards
              </Button>
              <button
                className={`${
                  Math.floor(Date.now() / 1000) > nextClaimTime
                    ? 'bg-white hover:bg-primary hover:text-white'
                    : 'bg-gray-400 text-black'
                } font-semibold border-primary border mt-6 h-10 w-full rounded-md text-base mobile:text-sm text-primary`}
                onClick={handleClaim}
                disabled={
                  Math.floor(Date.now() / 1000) < nextClaimTime
                }
              >
                Claim Rewards
              </button>
              <Button
                className="mt-6 w-full"
                onClick={handleUnstake}
                variant="secondary"
              >
                Unstake Libre
              </Button>
              {/*userChain === 'AVAX' && (
                <Button
                  className="mt-6 w-full"
                  onClick={handleEmergencyWithdraw}
                  variant="secondary"
                >
                  Emergency Withdraw <br />
                  (From Old Contract)
                </Button>
              )*/}
              <p className="mt-7 text-center text-sm font-medium">
                A 2% withdrawal fee is applied on your total rewards.
                <br/>
                Rewards can be claimed every 7 days
              </p>
            </div>
          </div>
        )}
      </div>
      {isStakingModalOpen && (
        <StakingModal
          isOpen={isStakingModalOpen}
          amount={depositAmount.toString()}
          hide={hideStakingModal}
        />
      )}
    </PageContainer>
  );
}
