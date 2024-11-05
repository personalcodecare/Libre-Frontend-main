import { useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import Image from 'next/image';
import Head from 'next/head';
import InputRange from 'react-input-range';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

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
  Bep20Contract,
  FarmingContract,
  ApyContract,
  NFTMintContract
} from 'contracts';
import { formatNumber, parseInt } from 'utils';
import {
  LP_PAIRS,
  IBep20Token,
  TOKENS,
  NFT_CONTRACTS,
  CHAINS,
  RPC_URLS,
  EXPLORERS,
} from '../../constants';

import {
  PageContainer,
  Button,
  Input,
  CreatePoolModal,
  ChainSelector,
  InputBackgroundColor,
} from 'components';
import {
  SVG_CARET_DOWN,
  SVG_LIBRE,
  SVG_LIBRE1,
  SVG_SUCCESS,
  SVG_TOOLTIP,
} from 'assets/icons';
import { emergencyWithdraw } from 'contracts/farming';
import { urlObjectKeys } from 'next/dist/next-server/lib/utils';

const customHttpProvider = new ethers.providers.JsonRpcProvider(
  'https://bsc-dataseed.binance.org/'
);
const BNB_NFT_LIMIT = 10;
const LIBRE_NFT_LIMIT = 5;
export default function NFTMint() {
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
    isOpen: isCreatePoolModalOpen,
    showModal: showCreatePoolModal,
    hideModal: hideCreatePoolModal,
  } = useModal();

  // Modal Variables
  const [tokenBalance, setTokenBalance] = useState('0.00');
  const [allowance, setAllowance] = useState(0);
  const [libreprice, setLibrePrice] = useState(0);
  const [count_BNB, setCountBNB] = useState(0);
  const [count_Libre, setCountLibre] = useState(0);
  const [unminted, setUnminted] = useState(3000);
  const [lpBalances, setLpBalances] = useState<string[]>(
    new Array(5).fill('0.00')
  );

  useEffect(() => {

    async function getData(){
      const allowance = await TokenContract.getAllowance(address, NFT_CONTRACTS[userChain][userChainId], userChain, web3);
      console.log("allowance: ", allowance);
      const price_libre = await NFTMintContract.getPriceNFT_Libre(userChain, web3);
      console.log("price", price_libre);
      const _count_NFT_BNB = await NFTMintContract.getCount_NFT_BNB(address,
        userChain, web3);
      const _count_NFT_LIBRE = await NFTMintContract.getCount_NFT_LIBRE(address,
        userChain, web3);
      const _count_unMinted = await NFTMintContract.getUnMintedNFT(
          userChain, web3);
      console.log(_count_unMinted)
      setAllowance(allowance);
      setLibrePrice(price_libre);
      setCountBNB(_count_NFT_BNB);
      setCountLibre(_count_NFT_LIBRE);
      setUnminted(_count_unMinted);
    }
    if (userChain == "BSC" && address && userChainId && (web3ChainId == 97 || web3ChainId==56)){
      console.log("userChain", web3ChainId);
      getData(); 
    }
  }, [userChain, web3, userChainId, address]);

  const mintWithBNB = async () => {
    try {
      const _count_NFT_BNB = await NFTMintContract.getCount_NFT_BNB(address,
        userChain, web3);

      const _count_unMinted = await NFTMintContract.getUnMintedNFT(
        userChain, web3);
      setCountBNB(_count_NFT_BNB);
      setUnminted(_count_unMinted);
      
      if (_count_NFT_BNB < BNB_NFT_LIMIT && _count_unMinted > 0){
        const result = await NFTMintContract.mint_BNB(
          address,
          userChain,
          web3
        );
         console.log("Mint with BNB Result: ", result);
      }
      
    } catch (err) {
      console.log('Mint with BNB error - ', err);
    }
  }

  const ApproveLibre = async () => {
    const amount = "100000000";
    try {
      const result = await TokenContract.approvetoNFTcontract(
         address,
         amount,
         userChain,
         web3
      );
        console.log("Approve", result);

        const allowance = await TokenContract.getAllowance(address, NFT_CONTRACTS[userChain][userChainId], userChain, web3);
        const price_libre = await NFTMintContract.getPriceNFT_Libre(userChain, web3);
        setAllowance(allowance);
        setLibrePrice(price_libre);
     } catch (err) {
       console.log('Approve LIBRE error - ', err);
     }
  }
  const mintWithLibre = async () => {
    try {
      const _count_NFT_LIBRE = await NFTMintContract.getCount_NFT_LIBRE(address,
        userChain, web3);
      const _count_unMinted = await NFTMintContract.getUnMintedNFT(
          userChain, web3);
      setCountLibre(_count_NFT_LIBRE);
      setUnminted(_count_unMinted);
      if (_count_NFT_LIBRE < LIBRE_NFT_LIMIT && _count_unMinted > 0){
        const result = await NFTMintContract.mint_LIBRE(
          address,
          userChain,
          web3
        );
        console.log("Mint with LiBre Result: ", result);
      }
    } catch (err) {
      console.log('Mint with LIBRE error - ', err);
    }
  }
  return (
    <>
    <title>NFT Mint | Libre DeFi</title>
    {/*<Image
      src={`/assets/icons/${lpPair.pair[0].toLowerCase()}.svg`}
      width={47}
      height={47}
  />*/}
    <div className = "w-full h-auto bg-cover flex flex-col justify-end items-center" style = {{backgroundImage:'url("./assets/images/background.png")'}}>
      {unminted ==3000 ? 
      <>
        <span className = "text-5xl mt-20 font-semibold mobile:text-2xl mobile:mt-10">Animal Farm NFT Mint</span>
        <span className = "text-xl mt-5 w-2/5 text-center mobile:w-10/12 mobile:text-sm">Hey Libre Natives … Get your hands on limited edition Libre Animal Farm NFTs which come packed full of ecosystem-specific utilities!</span>
        <div className = "flex flex-row items-center mt-8">
          <button
            disabled = "disabled"
            className="pt-1 pb-1 bg-gray-200 text-lg mobile:text-base border border-black text-black h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
          >Connect your Wallet
          </button>
        </div>
      </>
      
      : unminted > 0 ? 
      <>
          <div className = "mt-20 mb-2 mobile:mt-10 text-primary bg-sky-200 font-medium rounded-full px-3 py-0.5">Minted : {2500-unminted} / 2,500 </div>
          <span className = "text-5xl font-semibold mobile:text-2xl">Animal Farm NFT Mint</span>
          <span className = "text-xl mt-5 w-2/5 text-center mobile:w-10/12 mobile:text-sm">Hey Libre Natives … Get your hands on limited edition Libre Animal Farm NFTs which come packed full of ecosystem-specific utilities!</span>

          <div className = "flex flex-row items-center">
          {allowance.length >= libreprice.length ? count_Libre < LIBRE_NFT_LIMIT ?
          <button
            //className="pt-1 pb-1 mr-5 bg-primary text-lg mobile:text-base text-white h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
            className="pt-1 pb-1 mr-5 bg-grayBackground text-lg mobile:text-base text-black h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
            onClick={() => {
              //mintWithLibre();
            }}
          >Mint Using LIBRE
          </button> : 
          <button
            className="mobile:pt-0 pt-1 pb-1 mr-5 border-black border bg-gray-200 text-lg mobile:text-base text-black h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
            disabled = "disabled"
          >Libre Mint Limited
          </button>
          :
          <button
            className="pt-1 pb-1 mr-5 bg-primary text-lg mobile:text-base text-white h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
            onClick={() => {
              ApproveLibre();
            }}
          >Approve Libre
          </button>
          }
          {
            count_BNB < BNB_NFT_LIMIT ? 
            <button
              //className="pt-1 pb-1 bg-transparent text-lg mobile:text-base border border-primary text-primary h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
              className="pt-1 pb-1 bg-grayBackground text-lg mobile:text-base border border-primary text-black h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
              onClick={() => {
                //mintWithBNB();
              }}
            >Mint Using BNB
            </button> :
            <button
              disabled = "disabled"
              className="mobile:pt-0 pt-1 pb-1 bg-gray-200 text-lg mobile:text-base border border-black text-black h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
            >BNB Mint Limited
            </button>
          }
        </div>
      </>
      :
    <div className = "flex flex-row items-center mt-8">
      <button
          disabled = "disabled"
          className="pt-1 pb-1 bg-gray-200 text-lg mobile:text-base border border-black text-black h-12 w-56 mobile:w-36 mobile:h-11 rounded-full mt-2"
        >Mint is End
        </button>
    </div>
    }
      
      <div className='mt-10 flex justify-end'>
        <Image
          src={`/assets/images/nft-hero-banner.png`}
          alt={'asdf'}
          width={1300}
          height={500}
        />
      </div>
    </div>
    </>
    
  );
}
