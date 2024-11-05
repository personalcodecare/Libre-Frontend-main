import Web3 from 'web3';

import { web3Config } from 'config';
import { TokenABI } from 'constants/abis';
import { TOKENS, CHAINS, CONTRACTS, NFT_CONTRACTS } from '../constants';

const getLibreTokenContract = (chain: string, web3: any) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];
  const libreToken = new web3.eth.Contract(
    TokenABI,
    TOKENS[chain].LIBRE.address[chainId]
  );
  return libreToken;
};

export const getLibreTokenBalanceOf = async (
  address: string,
  chain: string,
  web3: any
) => {
  const libreToken = getLibreTokenContract(chain, web3);

  return await libreToken.methods
    .balanceOf(address)
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const approve = async (
  address: string,
  amount: string,
  chain: string,
  web3: any
) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];
  const libreToken = getLibreTokenContract(chain, web3);
  return await libreToken.methods
    .approve(CONTRACTS[chain][chainId], Web3.utils.toWei(amount))
    .send({ from: address });
};

// export const addEventListener = async (
//   event: string,
//   callback: (data: any) => void,
//   web3: any
// ) => {
//   const libreToken = getLibreTokenContract(web3);
//   libreToken.events[event]({}, function (error: any, event: any) {
//     console.log(event);
//   })
//     .on('connected', function (subscriptionId: any) {
//       console.log(subscriptionId);
//     })
//     .on('data', function (event: any) {
//       console.log(event);
//     })
//     .on('changed', function (event: any) {})
//     .on('error', function (error: any, receipt: any) {});
// };

export const getAllowance = async (
  owner: string,
  spender: string,
  chain: string,
  web3: any
) => {
    const libreToken = getLibreTokenContract(chain, web3);
    return await libreToken.methods
    .allowance(owner, spender)
    .call({ from: owner }); 
};

export const approvetoNFTcontract = async (
  address: string,
  amount: string,
  chain: string,
  web3: any
) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];
  const libreToken = getLibreTokenContract(chain, web3);
  return await libreToken.methods
    .approve(NFT_CONTRACTS[chain][chainId], Web3.utils.toWei(amount))
    .send({ from: address });
};