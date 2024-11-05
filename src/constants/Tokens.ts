import {
  ChainId as ChainIdBSC,
  Token as TokenBSC,
} from '@libre-defi/bsc-swap-sdk';
import {
  ChainId as ChainIdPOLYGON,
  Token as TokenPOLYGON,
} from '@libre-defi/polygon-swap-sdk';
import {
  ChainId as ChainIdAvalanche,
  Token as TokenAvalanche,
} from '@libre-defi/polygon-swap-sdk';
const { MAINNET: MAINNET_BSC } = ChainIdBSC;
const { MAINNET: MAINNET_POLYGON } = ChainIdPOLYGON;
const { MAINNET: MAINNET_AVALANCHE } = ChainIdAvalanche;

export const mainnetTokensBSC = {
  wbnb: new TokenBSC(
    MAINNET_BSC,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.com/'
  ),
  libre: new TokenBSC(
    MAINNET_BSC,
    '0x63db060697b01c6f4a26561b1494685DcbBd998c',
    18,
    'LIBRE',
    'Libre Token',
    'https://www.libredefi.io'
  ),
  // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
  bnb: new TokenBSC(
    MAINNET_BSC,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'BNB',
    'BNB',
    'https://www.binance.com/'
  ),
  cake: new TokenBSC(
    MAINNET_BSC,
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    18,
    'CAKE',
    'PancakeSwap Token',
    'https://pancakeswap.finance/'
  ),

  nft: new TokenBSC(
    MAINNET_BSC,
    '0x1fC9004eC7E5722891f5f38baE7678efCB11d34D',
    6,
    'NFT',
    'APENFT',
    'https://apenft.org'
  ),
  dai: new TokenBSC(
    MAINNET_BSC,
    '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    18,
    'DAI',
    'Dai Stablecoin',
    'https://www.makerdao.com/'
  ),
  usdt: new TokenBSC(
    MAINNET_BSC,
    '0x55d398326f99059fF775485246999027B3197955',
    18,
    'USDT',
    'Tether USD',
    'https://tether.to/'
  ),
  eth: new TokenBSC(
    MAINNET_BSC,
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    18,
    'ETH',
    'Binance-Peg Ethereum Token',
    'https://ethereum.org/en/'
  ),
  usdc: new TokenBSC(
    MAINNET_BSC,
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    18,
    'USDC',
    'Binance-Peg USD Coin',
    'https://www.centre.io/usdc'
  ),
  busd: new TokenBSC(
    MAINNET_BSC,
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    18,
    'BUSD',
    'Binance USD',
    'https://www.paxos.com/busd/'
  ),
};

export const mainnetTokensPolygon = {
  libre: new TokenPOLYGON(
    MAINNET_POLYGON,
    '0xF52d69BC301BE21cbed7D3ca652D1708FF8a1162',
    18,
    'LIBRE',
    'Libre Token',
    'https://www.libredefi.io'
  ),
  // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
  wmatic: new TokenPOLYGON(
    MAINNET_POLYGON,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    18,
    'WMATIC',
    'Wrapped MATIC',
    'https://polygon.technology/'
  ),
  matic: new TokenPOLYGON(
    MAINNET_POLYGON,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    18,
    'MATIC',
    'MATIC',
    'https://polygon.technology/'
  ),
};

export const mainnetTokensAvalanche = {
  libre: new TokenAvalanche(
    MAINNET_AVALANCHE,
    '0x8afa62Fa8DdE8888405c899D7Da077A61a87EeD3',
    18,
    'LIBRE',
    'Libre Token',
    'https://www.libredefi.io'
  ),
  avax: new TokenAvalanche(
    MAINNET_AVALANCHE,
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    18,
    'AVAX',
    'AVAX',
    'https://www.avalabs.org/'
  ),
  wavax: new TokenAvalanche(
    MAINNET_AVALANCHE,
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    18,
    'AVAX',
    'AVAX',
    'https://www.avalabs.org/'
  ),
};
