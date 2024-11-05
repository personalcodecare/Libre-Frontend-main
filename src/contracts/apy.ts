import Web3 from 'web3';

import { APY_CONTRACTS, CHAINS } from '../constants';
import { ApyABI } from 'constants/abis';

export const getLibreAPYContract = (chain: string, web3: any) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];

  const libreAPY = new web3.eth.Contract(ApyABI, APY_CONTRACTS[chain][chainId]);
  return libreAPY;
};

export const APY = async (poolId: number, chain: string, web3: any) => {
  const libreAPY = getLibreAPYContract(chain, web3);

  return await libreAPY.methods
    .APYC(poolId)
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const LPtoUSD = async (lpAddress: string, chain: string, web3: any) => {
  const libreAPY = getLibreAPYContract(chain, web3);

  return await libreAPY.methods
    .LPtoUSD(lpAddress)
    .call({ from: '0x0000000000000000000000000000000000000000' });
};
