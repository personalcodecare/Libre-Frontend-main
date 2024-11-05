import Web3 from 'web3';

import { NFTABI, TokenABI } from 'constants/abis';
import { NFT_CONTRACTS, CHAINS, TOKENS, RPC_URLS } from '../constants';

export const getNFTMintContract = (
    chain: string,
    web3: any
  ) => {
    const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];
    const libreNFT = new web3.eth.Contract(
        NFTABI, NFT_CONTRACTS[chain][chainId]
    );
    return libreNFT;
  };

export const getPriceNFT_Libre = async (
    chain: string,
    web3: any
) => {
    const NFTContract = getNFTMintContract(chain, web3);
    const Libre_price = await NFTContract.methods.libprice().call({ from: '0x0000000000000000000000000000000000000000' });
    return Libre_price;
};

export const getBalanceOfOwner = async (
  chain: string,
  web3: any,
  address: string
) => {
  const NFTContract = getNFTMintContract(chain, web3);
  const count = await NFTContract.methods.balanceOf(address).call({ from: '0x0000000000000000000000000000000000000000' });
  return count;
};

export const mint_BNB = async (
    address: string,
    chain: string,
    web3: any
  ) => {
    const NFTContract = getNFTMintContract(chain, web3);

    const BNB_price = await NFTContract.methods.ethprice().call({ from: '0x0000000000000000000000000000000000000000' });

    NFTContract.methods.mintWithEth().estimateGas({from: address, value: BNB_price})
    .then(async function(gasAmount:any){
        return await NFTContract.methods
        .mintWithEth()
        .send({
            from: address,
            value: BNB_price,
            gasLimit: gasAmount,
        });
    })
    .catch(function(error:any){
        console.log(error);
    });
    
  };

export const mint_LIBRE = async (
    address: string,
    chain: string,
    web3: any
  ) => {
    const NFTContract = getNFTMintContract(chain, web3);

    NFTContract.methods.mintWithLib().estimateGas({from: address})
    .then(async function(gasAmount:any){
        return await NFTContract.methods
        .mintWithLib()
        .send( { from: address, gasLimit: gasAmount } );
    })
    .catch(function(error:any){
        console.log(error);
    });
};

export const getCount_NFT_BNB = async (
    address: string,
    chain: string,
    web3: any
  ) => {
    const NFTContract = getNFTMintContract(chain, web3);
    const BNB_COUNT = await NFTContract.methods._mintEthAllowance(address).call({ from: '0x0000000000000000000000000000000000000000' });
    return BNB_COUNT;
};

export const getCount_NFT_LIBRE = async (
    address: string,
    chain: string,
    web3: any
  ) => {
    const NFTContract = getNFTMintContract(chain, web3);
    const Libre_COUNT = await NFTContract.methods._mintLibAllowance(address).call({ from: '0x0000000000000000000000000000000000000000' });
    return Libre_COUNT;
};

export const getUnMintedNFT = async (
  chain: string,
  web3: any
) => {
  const NFTContract = getNFTMintContract(chain, web3);
  const unMinted = await NFTContract.methods.unMintedCount().call({ from: '0x0000000000000000000000000000000000000000' });
  return unMinted;
};