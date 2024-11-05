import Web3 from 'web3';

import { FarmingABI, TokenABI } from 'constants/abis';
import { V1_CONTRACTS, CONTRACTS, CHAINS, TOKENS, RPC_URLS } from '../constants';

export const getLibreFarmingContract = (
  chain: string,
  web3: any,
  emergency?: boolean
) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];

  const libreFarming = new web3.eth.Contract(
    FarmingABI,
    chain === 'AVAX' && emergency
      ? '0x9a232F2DA48643Bdb0de1488De9f1a95D00CeC20'
      : CONTRACTS[chain][chainId]
  );
  return libreFarming;
};

export const getLibreFarmingContract_v1 = (
  chain: string,
  web3: any,
  emergency?: boolean
) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];

  const libreFarming_v1 = new web3.eth.Contract(
    FarmingABI,
    chain === 'AVAX' && emergency
      ? '0x9a232F2DA48643Bdb0de1488De9f1a95D00CeC20'
      : V1_CONTRACTS[chain][chainId]
  );
  return libreFarming_v1;
};
export const stake = async (
  address: string,
  amount: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);
  return await libreFarming.methods
    .stake(Web3.utils.toWei(amount))
    .send({ from: address });
};

export const unstake = async (
  address: string,
  amount: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods
    .unstake(Web3.utils.toWei(amount))
    .send({ from: address });
};

export const restake = async (
  address: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods
    .restake()
    .send({ from: address });
};

export const unstake_v1 = async (
  address: string,
  amount: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract_v1(chain, web3);

  return await libreFarming.methods
    .unstake(Web3.utils.toWei(amount))
    .send({ from: address });
};

export const getUserInfo = async (
  address: string,
  pid: number,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods
    .userInfo(pid, address)
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const getUserInfo_v1 = async (
  address: string,
  pid: number,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract_v1(chain, web3);

  return await libreFarming.methods
    .userInfo(pid, address)
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const pendingLib = async (
  address: string,
  pid: number,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);
  return await libreFarming.methods
    .pendingLib(pid, address)
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const getTotalLockedAmount = async (chain: string) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];

  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      RPC_URLS[chain][process.env.NEXT_PUBLIC_ENV as 'dev' | 'prod']
    )
  );
  const libreToken = new web3.eth.Contract(
    TokenABI as any,
    TOKENS[chain]['LIBRE'].address[chainId]
  );

  return await libreToken.methods
    .balanceOf(CONTRACTS[chain][chainId])
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const deposit = async (
  poolId: number,
  amount: string,
  slippage: number,
  address: string,
  chain: string,
  symbol: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods
    .deposit(poolId, Web3.utils.toWei(poolId > 0 ? amount : '0'), slippage)
    .send(
      symbol === 'BNB' || symbol === 'AVAX' || symbol === 'MATIC'
        ? { from: address, value: Web3.utils.toWei(amount) }
        : { from: address }
    );
};

export const depositLP = async (
  poolId: number,
  amount: string,
  address: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);
  let txHash;
  await libreFarming.methods
    .depositLP(poolId, Web3.utils.toWei(amount))
    .send({ from: address })
    .on('transactionHash', function (hash: string) {
      txHash = hash;
    });
  return txHash;
};

export const withdraw = async (
  poolId: number,
  amount: string,
  address: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods
    .withdraw(poolId, Web3.utils.toWei(amount))
    .send({ from: address });
};

export const withdraw_v1 = async (
  poolId: number,
  amount: string,
  address: string,
  chain: string,
  web3: any
) => {
  const libreFarming_v1 = getLibreFarmingContract_v1(chain, web3);

  return await libreFarming_v1.methods
    .withdraw(poolId, Web3.utils.toWei(amount))
    .send({ from: address });
};

export const emergencyWithdraw_V1 = async (
  poolId: number,
  address: string,
  chain: string,
  web3: any
) => {
  const libreFarming_v1 = getLibreFarmingContract_v1(chain, web3);

  return await libreFarming_v1.methods
    .emergencyWithdraw(poolId)
    .send({ from: address });
};



export const withdrawLP = async (
  poolId: number,
  amount: string,
  address: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods
    .withdrawLP(poolId, Web3.utils.toWei(amount))
    .send({ from: address });
};

export const emergencyWithdraw = async (
  poolId: number,
  address: string,
  emergency: boolean,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3, emergency);

  return await libreFarming.methods
    .emergencyWithdraw(poolId)
    .send({ from: address });
};

export const poolInfo = async (poolId: number, chain: string, web3: any) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods
    .poolInfo(poolId)
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const APYC = async (poolId: number, chain: string, web3: any) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods
    .APYC(poolId)
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const getNextClaimTime = async (
  poolId: number,
  address: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);
  return await libreFarming.methods
    .getNextClaimTime(address, poolId)
    .call({ from: address });
};

export const rewardPeriod = async (chain: string, web3: any) => {
  const libreFarming = getLibreFarmingContract(chain, web3);
  return await libreFarming.methods
    ._rewardPeriod()
    .call({ from: '0x0000000000000000000000000000000000000000' });
};

export const claimReward = async (
  poolId: number,
  address: string,
  chain: string,
  web3: any
) => {
  const libreFarming = getLibreFarmingContract(chain, web3);

  return await libreFarming.methods.claimReward(poolId).send({ from: address });
};
