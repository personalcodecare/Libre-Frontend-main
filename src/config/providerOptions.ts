import WalletConnectProvider from '@walletconnect/web3-provider';

export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      // infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    },
  },
};
