import Web3 from 'web3';

import { Bep20ABI, TOKENS, CHAINS, CONTRACTS } from '../constants';
import { PolyABI } from 'constants/abis';

export const getBep20TokenContract = (
  symbol: string,
  chain: string,
  web3: any
) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];
  const bep20Token = new web3.eth.Contract(
    Bep20ABI,
    TOKENS[chain][symbol].address[chainId]
  );
  return bep20Token;
};

export const getBep20TokenBalanceOf = async (
  address: string,
  symbol: string,
  chain: string,
  web3: any
) => {
  if (symbol === 'BNB' || symbol === 'AVAX' || symbol === 'MATIC') {
    return await new web3.eth.getBalance(address);
  } else {
    const bep20Token = getBep20TokenContract(symbol, chain, web3);

    return await bep20Token.methods
      .balanceOf(address)
      .call({ from: '0x0000000000000000000000000000000000000000' });
  }
};

export const approve = async (
  address: string,
  amount: string,
  symbol: string,
  chain: string,
  web3: any
) => {
  const chainId = CHAINS[chain].chainIds[process.env.NEXT_PUBLIC_ENV ?? 'dev'];

  const bep20Token = getBep20TokenContract(symbol, chain, web3);
  return await bep20Token.methods
    .approve(CONTRACTS[chain][chainId], Web3.utils.toWei(amount))
    .send({ from: address });
};

export const totalSupply = async (address: string, web3: any) => {
  const contract = new web3.eth.Contract(Bep20ABI, address);
  return await contract.methods.totalSupply().call();
};
