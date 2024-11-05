import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getFirestore,
  getDoc,
} from 'firebase/firestore';

import {
  useAppFacade,
  useLunarFacade,
  useUserFacade,
  useWeb3Facade,
} from 'state';
import { initialState as initialLunarState } from 'state/lunar/lunar.slice';
import { CHAINS, TOKENS } from '../../constants';
import { navigations } from 'config/nav';
import { ILunarResponse } from 'types';

import { Button } from 'components';
import { providerOptions } from 'config';
import Logo from 'assets/images/logo.svg';
import LogoDark from 'assets/images/logo_dark.svg';
import { SVG_WALLET, SVG_CARET_DOWN, SVG_LOGOUT } from 'assets/icons';

function initWeb3(provider: any) {
  const web3: any = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: 'chainId',
        call: 'eth_chainId',
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });

  return web3;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore();

const pricesRef = collection(db, 'prices');

export const Header = () => {
  const router = useRouter();

  const { appEnv } = useAppFacade();
  const { userState, updateUserInfo } = useUserFacade();
  const { address, chainId: userChainId, chain: userChain, theme } = userState;
  const { updateWeb3State, chainId: web3ChainId, web3 } = useWeb3Facade();
  const { lunarState, updateLunarState } = useLunarFacade();

  const [web3modal, setWeb3modal] = useState<Web3Modal>();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const [showDisconnect, setShowDisconnect] = useState(false);

  const handleClick = () => {
    setVisible(!visible);
  };

  const fetchLunarPrices = async () => {
    const query = Object.keys(initialLunarState).join(',');
    try {
      const result: ILunarResponse = (
        await axios.get(
          `https://api.lunarcrush.com/v2?data=assets&key=${process.env.NEXT_PUBLIC_LUNAR_API_KEY}&symbol=${query}&data_points=1&time_series_indicators=close&indicators=close`
        )
      ).data;
      let newPrices = { ...initialLunarState };
      result.data.map((price) => {
        if (price.close) {
          newPrices[price.symbol] = price.close;
        }
      });

      updateLunarState(newPrices);
    } catch (err) {
      console.log('Lunar - ', err);
    }
  };

  useEffect(() => {
    (async () => {
      const query = Object.keys(initialLunarState).join(',');
      try {
        const docRef = doc(db, 'prices', 'tokens');
        const docSnap = await getDoc(docRef);

        const currentTimestamp = new Date().getTime() / 1000;
        if (
          docSnap.exists() &&
          currentTimestamp <= docSnap.data().updated_at + 60
        ) {
          const tokens = docSnap.data();
          delete tokens.updated_at;
          updateLunarState(tokens);
        } else {
          const result: ILunarResponse = (
            await axios.get(
              `https://api.lunarcrush.com/v2?data=assets&key=${process.env.NEXT_PUBLIC_LUNAR_API_KEY}&symbol=${query}&data_points=1&time_series_indicators=close&indicators=close`
            )
          ).data;
          let newPrices = { ...lunarState };
          result.data.map((price) => {
            if (price.close) {
              newPrices[price.symbol] = price.close;
            }
          });
          delete newPrices.LIBRE;

          setDoc(doc(db, 'prices', 'tokens'), {
            ...newPrices,
            updated_at: new Date().getTime() / 1000,
          });

          updateLunarState(newPrices);
        }
      } catch (err) {
        console.log('Lunar - ', err);
      }
    })();
  }, []);

  useEffect(() => {
    setWeb3modal(
      new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
    );

    setActive(
      navigations.findIndex((nav) => `/${nav.link}` === router.pathname)
    );
  }, []);

  useEffect(() => {
    if (userChainId !== web3ChainId && userChainId && web3ChainId) {
      (async () => {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [
              {
                chainId: Web3.utils.toHex(userChainId),
              },
            ],
          });
        } catch (err) {
          console.log('SwitchNetwork - ', err);
        }
      })();
    }
  }, [userChain]);

  useEffect(() => {
    if (web3ChainId === 56 || web3ChainId === 137 || web3ChainId === 43114) {
      const chainName =
        web3ChainId === 56 ? 'BSC' : web3ChainId === 137 ? 'POLY' : 'AVAX';
      updateUserInfo({ chain: chainName, chainId: web3ChainId });
    }
  }, [web3ChainId]);

  useEffect(() => {
    if (userChain) {
      let chain = '';

      if (userChain === 'BSC') chain = 'binance-smart-chain';
      if (userChain === 'POLY') chain = 'polygon-pos';
      if (userChain === 'AVAX') chain = 'avalanche';

      (async () => {
        const docRef = doc(db, 'prices', 'libre');
        const docSnap = await getDoc(docRef);
        const currentTimestamp = new Date().getTime() / 1000;
        if (
          docSnap.exists() &&
          currentTimestamp <= docSnap.data().updated_at + 60
        ) {
          updateLunarState({ LIBRE: docSnap.data().price });
        } else {
          axios
            .get(
              `https://api.coingecko.com/api/v3/simple/token_price/${chain}?contract_addresses=${TOKENS[userChain].LIBRE.address[userChainId]}&&vs_currencies=usd`
            )
            .then((result: any) => {
              const data = result.data;
              let price = 0;
              Object.keys(data).map((key) => {
                if (
                  key ===
                  TOKENS[userChain].LIBRE.address[userChainId].toLowerCase()
                ) {
                  price = data[key].usd;
                }
              });

              if (price > 0) {
                setDoc(doc(db, 'prices', 'libre'), {
                  price,
                  updated_at: new Date().getTime() / 1000,
                });
                updateLunarState({ LIBRE: price });
              }
            })
            .catch((err) => console.log('coingecko - ', err));
        }
      })();
    }
  }, [userChainId, web3ChainId]);

  const connectWallet = useCallback(async () => {
    try {
      const provider = await web3modal?.connect();
      provider.on('chainChanged', (chainId: string) => {
        updateWeb3State({ chainId: +chainId });
      });

      const web3 = new Web3(provider);

      const chainId = await web3.eth.getChainId();
      updateWeb3State({ web3, provider, chainId: +chainId });

      const accounts = await web3.eth.getAccounts();
      if (accounts) {
        updateUserInfo({ address: accounts[0] });
      }
    } catch (err) {
      console.log('ConnectWallet - ', err);
    }
  }, [updateUserInfo, web3modal, updateWeb3State]);

  const disconnectWallet = useCallback(async () => {
    if (web3modal && web3modal.cachedProvider) {
      await web3modal.clearCachedProvider();
      location.reload();
    }
  }, [web3modal]);

  useEffect(() => {
    if (web3modal && web3modal.cachedProvider) {
      connectWallet();
    }
  }, [web3modal, connectWallet]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.enable().then(() => {
        // detect Metamask account change
        window.ethereum.on('accountsChanged', function (accounts: string[]) {});
      }); // get permission to access accounts
    }
  }, []);

  // useEffect(() => {
  //   const cachedState = JSON.parse(
  //     localStorage ? localStorage.getItem('libre-cache') || '' : ''
  //   );
  //   const cachedChain =
  //     cachedState.chain &&
  //     (cachedState.chain === 'BSC' ||
  //       cachedState.chain === 'POLY' ||
  //       cachedState.chain === 'AVAX')
  //       ? cachedState.chain
  //       : 'POLY';
  //   const cachedChainId =
  //     CHAINS[cachedChain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];

  //   updateUserInfo({ chain: cachedChain });
  // }, []);

  return (
    <>
      <div
        style={{
          backgroundColor: CHAINS[userChain].bgColor,
          color: CHAINS[userChain].textColor,
        }}
        className="text-center text-sm px-3 py-3 flex items-center justify-center"
      >
        <div className="mr-2 inline-flex">
          <Image
            src={`/assets/icons/${userChain.toLowerCase()}.svg`}
            width={35}
            height={35}
          />
        </div>
        You are currently using the {CHAINS[userChain].name} Network.
      </div>
      <nav className="container flex items-stretch flex-wrap bg-white dark:bg-secondary px-4 h-20 m-auto justify-between relative mobile:sticky top-0 header z-30">
        <Link href="/staking">
          <a className="inline-flex items-center p-2 mobile:p-1 mr-4 absolute top-1/2 transform -translate-y-1/2 mobile:w-28">
            {theme === 'light' ? <Logo /> : <LogoDark />}
          </a>
        </Link>
        {/*Note that in this div we will use a ternary operator to decide whether or not to display the content of the div  */}
        <div
          className={`${
            visible ? '' : 'mobile:hidden'
          } inline-flex flex-col ml-auto mr-auto mobile:-ml-4 mobile:-mr-4 mobile:w-64 bg-white dark:bg-secondary mobile:fixed mobile:top-0 mobile:bottom-0 mobile:right-0 mobile:pt-5 mobile:z-40`}
        >
          <div className="hidden mobile:inline-flex justify-end mobile:w-full mobile:border-b mobile:border-black dark:border-white mobile:pr-8 mobile:pb-5">
            <Image
              src={`/assets/icons/${
                theme === 'light' ? 'thin_close' : 'thin_close_dark'
              }.svg`}
              width={15}
              height={15}
              onClick={() => setVisible(false)}
            />
          </div>
          <div className="inline-flex flex-row ml-auto w-auto mobile:w-full items-stretch mobile:items-start  mobile:flex mobile:flex-col mobile:h-auto mobile:pl-3  mobile:z-10 mobile:pt-4">
            <Link
              href={'/exchange'}
              passHref
            >
              <a
                onClick={() => setActive(1)}
                className={`relative inline-flex w-auto mobile:w-full mx-3 py-6 mobile:py-2 font-semibold mobile:justify-start items-center justify-center border-t-4 border-primary border-opacity-0 whitespace-nowrap hover:border-opacity-100 hover:text-primary mobile:mt-2 ${
                    active === 1
                      ? 'text-primary border-opacity-100'
                      : 'text-black dark:text-white'
                  }
                  mobile:border-t-0
                `}
                target={'_self'}
              >
                Trade
              </a>
            </Link>
            
            <Link
              href={'/farms'}
              passHref
            >
              <a
                onClick={() => setActive(3)}
                className={`hidden mobile:inline-flex relative w-auto mobile:w-full mx-3 py-6 mobile:py-2 font-semibold mobile:justify-start items-center justify-center border-t-4 border-primary border-opacity-0 whitespace-nowrap hover:border-opacity-100 hover:text-primary mobile:mt-2 ${
                    active === 3
                      ? 'text-primary border-opacity-100'
                      : 'text-black dark:text-white'
                  }
                  mobile:border-t-0
                `}
                target={'_self'}
              >
                Farms
              </a>
            </Link>

            <Link
              href={'/staking'}
              passHref
            >
              <a
                onClick={() => setActive(4)}
                className={`hidden mobile:inline-flex relative w-auto mobile:w-full mx-3 py-6 mobile:py-2 font-semibold mobile:justify-start items-center justify-center border-t-4 border-primary border-opacity-0 whitespace-nowrap hover:border-opacity-100 hover:text-primary mobile:mt-2 ${
                    active === 4
                      ? 'text-primary border-opacity-100'
                      : 'text-black dark:text-white'
                  }
                  mobile:border-t-0
                `}
                target={'_self'}
              >
                Pools
              </a>
            </Link>
            <div className = "relative group mobile:hidden">
              <button className={`relative inline-flex w-auto mobile:w-full mx-3 py-6 mobile:py-2 font-semibold mobile:justify-start items-center justify-center border-t-4 border-primary border-opacity-0 whitespace-nowrap hover:border-opacity-100 hover:text-primary mobile:mt-2 ${
                    active === 3 || active === 4
                      ? 'text-primary border-opacity-100'
                      : 'text-black dark:text-white'
                  }
                  mobile:border-t-0
                `}>
                  <span>Earn</span>
              </button>
              <div className = "absolute w-32 z-10 hidden group-hover:block">
                <div className = "px-2 pt-3 pb-3 bg-white rounded-md border border-gray-300 shadow-lg dark:bg-secondary">
                  <div className = "grid grid-cols-1 gap-1 md:grid-cols-2">
                    <Link
                      href={'/farms'}
                      passHref
                    >
                      <a
                        onClick={() => setActive(3)}
                        className={`relative rounded-md inline-flex w-28 mobile:w-full px-1 py-1 mobile:py-2 font-semibold justify-start items-center whitespace-nowrap dark:hover:bg-gray-500 hover:bg-gray-200 hover:text-primary mobile:mt-2 ${
                            active === 3
                              ? 'text-primary border-opacity-100'
                              : 'text-black dark:text-white'
                          }
                          mobile:border-t-0
                        `}
                        target={'_self'}
                      >
                        Farms
                      </a>
                    </Link>
                    <Link
                      href={'/staking'}
                      passHref
                    >
                      <a
                        onClick={() => setActive(4)}
                        className={`relative rounded-md inline-flex w-28 mobile:w-full px-1 py-1 mobile:py-2 font-semibold justify-start items-center whitespace-nowrap dark:hover:bg-gray-500 hover:bg-gray-200 hover:text-primary mobile:mt-2 ${
                            active === 4
                              ? 'text-primary border-opacity-100'
                              : 'text-black dark:text-white'
                          }
                          mobile:border-t-0
                        `}
                        target={'_self'}
                      >
                        Pools
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
          </div>  

            <Link
              href={'/nftmint'}
              passHref
            >
              <a
                onClick={() => setActive(5)}
                className={`relative inline-flex w-auto mobile:w-full mx-3 py-6 mobile:py-2 font-semibold mobile:justify-start items-center justify-center border-t-4 border-primary border-opacity-0 whitespace-nowrap hover:border-opacity-100 hover:text-primary mobile:mt-2 ${
                    active === 5
                      ? 'text-primary border-opacity-100'
                      : 'text-black dark:text-white'
                  }
                  mobile:border-t-0
                `}
                target={'_self'}
              >
                NFT Mint
              </a>
            </Link>

            <Link
              href={'https://buy.libre.indacoin.io/'}
              passHref
            >
              <a
                onClick={() => setActive(6)}
                className={`relative inline-flex w-auto mobile:w-full mx-3 py-6 mobile:py-2 font-semibold mobile:justify-start items-center justify-center border-t-4 border-primary border-opacity-0 whitespace-nowrap hover:border-opacity-100 hover:text-primary mobile:mt-2 ${
                    active === 6
                      ? 'text-primary border-opacity-100'
                      : 'text-black dark:text-white'
                  }
                  mobile:border-t-0
                `}
                target={'_blank'}
              >
                Buy
              </a>
            </Link>

            <Link
              href={'https://app.multichain.org/#/router'}
              passHref
            >
              <a
                onClick={() => setActive(7)}
                className={`relative inline-flex w-auto mobile:w-full mx-3 py-6 mobile:py-2 font-semibold mobile:justify-start items-center justify-center border-t-4 border-primary border-opacity-0 whitespace-nowrap hover:border-opacity-100 hover:text-primary mobile:mt-2 ${
                    active === 7
                      ? 'text-primary border-opacity-100'
                      : 'text-black dark:text-white'
                  }
                  mobile:border-t-0
                `}
                target={'_blank'}
              >
                Bridge
              </a>
            </Link>

            <Link
              href={'/info'}
              passHref
            >
              <a
                onClick={() => setActive(8)}
                className={`relative inline-flex w-auto mobile:w-full mx-3 py-6 mobile:py-2 font-semibold mobile:justify-start items-center justify-center border-t-4 border-primary border-opacity-0 whitespace-nowrap hover:border-opacity-100 hover:text-primary mobile:mt-2 ${
                    active === 8
                      ? 'text-primary border-opacity-100'
                      : 'text-black dark:text-white'
                  }
                  mobile:border-t-0
                `}
                target={'_self'}
              >
                Info
              </a>
            </Link>
          </div>
        </div>
        <div
          className={`${
            visible ? 'hidden mobile:block' : 'hidden'
          } fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40 z-0`}
          onClick={() => setVisible(false)}
        />
        <div className="flex items-center absolute top-1/2 transform -translate-y-1/2 right-8 mobile:right-14">
          <div
            className="inline-flex items-center justify-center mr-4 mobile:mr-1 cursor-pointer"
            onClick={() =>
              updateUserInfo({ theme: theme === 'light' ? 'dark' : 'light' })
            }
          >
            <Image
              src={`/assets/icons/${theme === 'light' ? 'dark' : 'light'}.svg`}
              width={25}
              height={25}
            />
          </div>
          {address ? (
            <div
              className="relative"
              onMouseEnter={() => setShowDisconnect(true)}
              onMouseLeave={() => setShowDisconnect(false)}
            >
              <div className="flex items-center px-5 py-3 rounded-md bg-primary text-white cursor-pointer mobile:px-2 mobile:py-2">
                <span className="ml-1 mr-3 font-semibold mobile:text-sm">{`0x${address.slice(
                  2,
                  5
                )}...${address.slice(
                  address.length - 4,
                  address.length
                )}`}</span>
                <SVG_CARET_DOWN />
              </div>
              {showDisconnect && (
                <div className="pt-3">
                  <div
                    className="absolute top-full left-0 right-0 flex items-center justify-between px-5 py-3 rounded-md bg-white cursor-pointer border border-gray-200 font-semibold mobile:px-2 mobile:py-2"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                    <SVG_LOGOUT />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={connectWallet}
              variant="primary"
              className="px-2 connectwallet mobile:px-4"
            >
              Connect Wallet
            </Button>
          )}
        </div>
        <button
          className="hidden mobile:inline-flex items-center p-2 rounded text-black dark:text-white ml-2.5 hover:text-white outline-none absolute top-1/2 transform -translate-y-1/2 right-2 z-30"
          onClick={handleClick}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>
    </>
  );
};
