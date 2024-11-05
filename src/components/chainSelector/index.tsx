import { useEffect, useState } from 'react';
import Image from 'next/image';

import { useAppFacade, useUserFacade, useWeb3Facade } from 'state';

import { CHAINS } from '../../constants';

export const ChainSelector = () => {
  const { appEnv } = useAppFacade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (userChainId && web3ChainId && userChainId !== web3ChainId) {
      // alert(`Please change your Metamask network to ${CHAINS[userChain].name}`);
    }
  }, [userChainId, web3ChainId]);
  const renderChainImage = () => {
    if (userChain == 'POLY') {
      return (
        <Image
          src={`/assets/icons/polygon.svg`}
          width={39}
          height={39}
          className={`cursor-pointer ${userChain !== 'POLY' && 'opacity-50'}`}
          onClick={() =>
            updateUserInfo({
              chain: 'POLY',
              chainId: CHAINS.POLY.chainIds[appEnv as 'prod' | 'dev'],
            })
          }
        />
      );
    } else if (userChain == 'BSC') {
      return (
        <Image
          src={`/assets/icons/bsc.svg`}
          width={39}
          height={39}
          className={`cursor-pointer ${userChain !== 'BSC' && 'opacity-50'}`}
          onClick={() =>
            updateUserInfo({
              chain: 'BSC',
              chainId: CHAINS['BSC'].chainIds[appEnv as 'prod' | 'dev'],
            })
          }
        />
      );
    } else {
      return (
        <Image
          src={`/assets/icons/avax.svg`}
          width={39}
          height={39}
          className={`cursor-pointer ${userChain !== 'AVAX' && 'opacity-50'}`}
          onClick={() =>
            updateUserInfo({
              chain: 'AVAX',
              chainId: CHAINS.AVAX.chainIds[appEnv as 'prod' | 'dev'],
            })
          }
        />
      );
    }
  };

  return (
    <div className="">
      <p className="text-black dark:text-white text-sm text-center mb-1 font-bold ">
        Select Network:
      </p>
      <div
        onClick={() => setModalVisible(true)}
        className="w-36 text-primary flex justify-between items-center rounded-full gap-2 bg-primary bg-opacity-20 cursor-pointer"
      >
        {renderChainImage()}
        <span className="text-sm font-semibold">{userState.chain}</span>
        <span className="mr-3">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.79708 0.525879L6 4.7288L10.2029 0.525879L11.5 1.82296L6 7.32296L0.5 1.82296L1.79708 0.525879Z"
              fill="#00B7FF"
            />
          </svg>
        </span>
      </div>

      <div
        className={`fixed ${
          modalVisible ? 'flex' : 'hidden'
        } flex-col items-center top-0 left-0 h-full w-full z-40`}
      >
        <div className="flex flex-col bg-white border rounded-lg shadow-lg outline-none w-96 mobile:w-80 focus:outline-none z-10 relative mt-24">
          <div className="flex flex-col rounded-t border-blueGray-200 overflow-hidden relative">
            <span className="text-lg font-semibold text-black bg-gray-100 py-3 px-8">
              Select a Network:
            </span>
            <div className="flex flex-row w-full gap-2 p-2">
              <div
                className={`flex flex-col justify-between items-center w-full gap-1 ${
                  userChain !== 'POLY'
                    ? 'bg-blue-100 opacity-70'
                    : 'bg-blue-200'
                } hover:bg-blue-200 rounded-lg p-2 cursor-pointer`}
                onClick={() =>{
                    updateUserInfo({
                      chain: 'POLY',
                      chainId: CHAINS.POLY.chainIds[appEnv as 'prod' | 'dev'],
                    })
                    setModalVisible(false);
                  }
                }
              >
                <Image
                  src={`/assets/icons/polygon.svg`}
                  width={"50%"}
                  height={"50%"}
                />
                <span className="text-black font-semibold mobile:text-xs">Polygon</span>
              </div>
              <div
                className={`flex flex-col justify-between items-center w-full gap-1 ${
                  userChain !== 'BSC' ? 'bg-blue-100 opacity-70' : 'bg-blue-200'
                } hover:bg-blue-200 rounded-lg p-2 cursor-pointer`}
                onClick={() =>{
                    updateUserInfo({
                      chain: 'BSC',
                      chainId: CHAINS['BSC'].chainIds[appEnv as 'prod' | 'dev'],
                    })
                    setModalVisible(false);
                  }
                }
              >
                <Image
                    src={`/assets/icons/bsc.svg`}
                    width={"50%"}
                    height={"50%"}
                />
                <span className="text-black font-semibold mobile:text-xs">Binance</span>
              </div>
              <div
                className={`flex flex-col justify-between items-center w-full gap-1 ${
                  userChain !== 'AVAX'
                    ? 'bg-blue-100 opacity-70'
                    : 'bg-blue-200'
                } hover:bg-blue-200 rounded-lg p-2 cursor-pointer`}
                onClick={() =>{
                    updateUserInfo({
                      chain: 'AVAX',
                      chainId: CHAINS.AVAX.chainIds[appEnv as 'prod' | 'dev'],
                    })
                    setModalVisible(false);
                  }
                }
              >
                <Image
                src={`/assets/icons/avax.svg`}
                width={"50%"}
                height={"50%"}
                />
                <span className="text-black font-semibold mobile:text-xs">Avalanche</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40"
          onClick={() => setModalVisible(false)}
        />
      </div>
    </div>
  );
};
