import Web3 from 'web3';

import { Bep20ABI, LP_PAIRS, CHAINS, CONTRACTS } from '../constants';
import { PolyABI } from 'constants/abis';

export const getLPTokenContract = (
  activePair: number,
  chain: string,
  web3: any
) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];
  const bep20Token = new web3.eth.Contract(
    Bep20ABI,
    LP_PAIRS[chain][activePair].address[chainId]
  );
  return bep20Token;
};

export const getAllowance = async (
  owner: string,
  activePair: number,
  chain: string,
  web3: any
) => {
    const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];

    const LP = getLPTokenContract(activePair, chain, web3);
    return await LP.methods
    .allowance(owner, CONTRACTS[chain][chainId])
    .call({ from: owner }); 
};

export const getBalance = async (
  owner: string,
  activePair: number,
  chain: string,
  web3: any
) => {
    const LP = getLPTokenContract(activePair, chain, web3);
    return await LP.methods
      .balanceOf(owner)
      .call({ from: '0x0000000000000000000000000000000000000000' });
}

export const approveToFarm = async (
  address: string,
  amount: string,
  activePair: number,
  chain: string,
  web3: any
) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];

  const lpToken = getLPTokenContract(activePair, chain, web3);
  return await lpToken.methods
    .approve(CONTRACTS[chain][chainId], amount)
    .send({ from: address });
};
