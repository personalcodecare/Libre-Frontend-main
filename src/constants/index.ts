import { ChainId } from '@libre-defi/bsc-swap-sdk';
import {
  StakingABI,
  TokenABI,
  VestingABI,
  FarmingABI,
  Bep20ABI,
  ApyABI,
  FactoryABI,
  RouterABI,
  PairABI,
} from './abis';
import {
  mainnetTokensBSC,
  mainnetTokensPolygon,
  mainnetTokensAvalanche,
} from './Tokens';

export const ROUTER_ADDRESS_BSC = '0x98Ee246E3aCb2eBA5F5Cc4AF768f4ae989Af3C3e';
export const ROUTER_ADDRESS_AVALANCHE =
  '0xd00cB1bc0E8cdAbb3d895Ad13c3488D9e50dE581';
export const ROUTER_ADDRESS_POLYGON =
  '0x64e71E143aa724C66C038Ad287C0df23bf694080';

export const V1_CONTRACTS: { [key: string]: { [key: number]: string } } = {
    BSC: {
      56: '0x31D3966DA1cAB3dE7E9221ed016484E4Bb03Ba02',
     // 97: '0x5b8b3FCFaB44697817c9CF6D3e31E122a9EFAFB9',
      97: '0xd87C870e29C36DD9224D74243CF01C1bb8388337'
    },
    POLY: {
      137: '0x6Bb9EAb44Dc7f7e0a0454107F9e46Eedf0aA0285',
      80001: '0xf7775AeB48dc8473ce3DCff43A657D213D6981D1',
    },
    AVAX: {
      43114: '0xE6DCE53f17FBF673f4FA60A38746F110517457B2',
      43113: '0x7664D1d111F8ae9E2c6e40eDf258AA45CBF3eAFb',
    },
  };
export const CONTRACTS: { [key: string]: { [key: number]: string } } = {
  BSC: {
    56: '0x0FdD2A7660F669442686E68e781405CaDe8d11BF',
   // 97: '0x5b8b3FCFaB44697817c9CF6D3e31E122a9EFAFB9',
    97: '0x68618507e7451fa7c164042011a33c9ce37d8f3d'
  },
  POLY: {
    137: '0xD17f7e4B0a17c9cC711532aa9690b9F24D306aB3',
    80001: '0xf7775AeB48dc8473ce3DCff43A657D213D6981D1',
  },
  AVAX: {
    43114: '0xE2bC2E8df89c62CDf8eacae8365916a44738207e',
    43113: '0x7664D1d111F8ae9E2c6e40eDf258AA45CBF3eAFb',
  },
};

export const NFT_CONTRACTS: { [key: string]: { [key: number]: string } } = {
  BSC: {
    56: '0x1a35cb725ba2e08f93b5b536dea607f1f57648c7',
    97: '0x12fec1ef90492baf10d275ea0fcbcc8472b7c77d',
  },
};

export const APY_CONTRACTS: { [key: string]: { [key: number]: string } } = {
  BSC: {
    56: '0x3A6e7defAF3c25181b0390617c36651aDD08D5d1',//'0x1C90b4EC7e6267d0709Cb9f13C6984342870e26b',
    97: '0x56dBE463983F6406Ce5BfF4048f965E9E9A07413',
  },
  POLY: {
    137: '0xE2bC2E8df89c62CDf8eacae8365916a44738207e',//'0x49804197843C0461B70D2941831b9ec59D70cD40',
    80001: '0xF541dD67Ff954D4c276BfF9d1333BBC8fefeda9c',
  },
  AVAX: {
    43114: '0x7aa8456055A9fFb3c28E5b63ae3Bc40005DeBee4',//'0x26CF2f5BED45ce0c8Ae5D6b5D68Af1562b4159fb',
    43113: '0x2652F079A65d165f5478fF20F174f8c46Df9524b',
  },
};

type IChain = {
  name: string;
  swap: string;
  chainIds: { [key: string]: number };
  bgColor: string;
  textColor: string;
  blocks: number;
  explorer: string;
};

export const CHAINS: { [key: string]: IChain } = {
  BSC: {
    name: 'Binance',
    swap: 'LibreSwap',
    chainIds: {
      prod: 56,
      dev: 97,
    },
    bgColor: '#000000',
    textColor: '#F0B90B',
    blocks: 10402500,
    explorer: 'BscScan',
  },
  POLY: {
    name: 'Polygon',
    swap: 'LibreSwap',
    chainIds: {
      prod: 137,
      dev: 80001,
    },
    bgColor: '#8247E5',
    textColor: '#FFFFFF',
    blocks: 15768000,
    explorer: 'PolygonScan',
  },
  AVAX: {
    name: 'Avalanche',
    swap: 'LibreSwap',
    chainIds: {
      prod: 43114,
      dev: 43113,
    },
    bgColor: '#E84142',
    textColor: '#FFFFFF',
    blocks: 10512000,
    explorer: 'SnowTrace',
  },
};
export const RouterAddress = '0x98Ee246E3aCb2eBA5F5Cc4AF768f4ae989Af3C3e';
export const FactoryAddress = '0x36373fcf92049cb8221798367F35c0246fd2a9ac';
export const ROUTER_CONTRACT = {
  address: RouterAddress,
  abi: RouterABI,
};

export type IBep20Token = 'BNB' | 'BUSD' | 'CAKE' | 'BAKE';

type IToken = {
  address: { [key: number]: string };
  name?: string;
};

export const TOKENS: { [key: string]: { [key: string]: IToken } } = {
  BSC: {
    LIBRE: {
      address: {
        56: '0x63db060697b01c6f4a26561b1494685DcbBd998c',
        97: '0x4B303C3bFEA56A252D2573ec9A30dE8Efb9d00FD'//'0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
      },
      name: 'Libre',
    },
    BNB: {
      address: {
        56: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
        97: '0x54d8b11d6a0437A48fEB1F92fb21418E269ac5fa',
      },
      name: 'BNB',
    },
    BUSD: {
      address: {
        56: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        97: '0x3072e6d4F00Afaa19c06F9eecF0ef8CEE4A2f414',
      },
    },
    CAKE: {
      address: {
        56: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
        97: '0x72B81909583ca4C9ccc8374eDD3e770C5181bB16',
      },
    },
    BAKE: {
      address: {
        56: '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
        97: '0x10EC69F3850Df4ce0B161C508AE957a8442f2D93',
      },
    },
  },
  AVAX: {
    AVAX: {
      address: {
        43114: '',
        43113: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
      },
    },
    USDC: {
      address: {
        43114: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
        43113: '0x02176de2704431fd367f73e273bceCE180Bd7Cfb',
      },
    },
    JOE: {
      address: {
        43114: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
        43113: '0x316AE374D33d655a24210E4C9a4798cAD60D89FD',
      },
    },
    PNG: {
      address: {
        43114: '',
        43113: '0x3628d7d05364e7b0c809fF7d568BA787b09eCF17',
      },
    },
    LIBRE: {
      address: {
        43114: '0x8afa62Fa8DdE8888405c899D7Da077A61a87EeD3',
        43113: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
      },
    },
  },
  POLY: {
    USDC: {
      address: {
        137: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        80001: '0x6a26F1d7161a4B83616a861D94f0535E51264eFc',
      },
    },
    MATIC: {
      address: {
        137: '',
        80001: '0x476cEd9De1174F44488A0b9f448578faA53bF3B5',
      },
    },
    QUICK: {
      address: {
        137: '0x831753dd7087cac61ab5644b308642cc1c33dc13',
        80001: '0x60e058360eFB5Da53cec13c218C28A3c50875A67',
      },
    },
    LIBRE: {
      address: {
        137: '0xF52d69BC301BE21cbed7D3ca652D1708FF8a1162',
        80001: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
      },
    },
  },
};

type IExplorer = {
  [key: number]: string;
};

export const EXPLORERS: IExplorer = {
  56: 'https://bscscan.com',
  97: 'https://testnet.bscscan.com',
  137: 'https://polygonscan.com',
  80001: 'https://mumbai.polygonscan.com',
  43114: 'https://snowtrace.io',
  43113: 'https://testnet.snowtrace.io',
};

type ILpAddress = {
  [key: number]: string;
};

type ILpPair = {
  pair: string[];
  address: ILpAddress;
  symbol: string;
  decimals: number;
  active: boolean;
};

export const LP_PAIRS: { [key: string]: ILpPair[] } = {
  BSC: [
    {
      pair: ['LIBRE', 'BNB'],
      address: {
        56: '0xEc89a7333e897bAB62dbC106b7D5406Bde8E8AA3',
        97: '0xC8345E4E8519b588EBeb2d7bA560Dc438a21B734',
      },
      symbol: 'LIBRE-BNB LP',
      decimals: 18,
      active: true,
    },
    {
      pair: ['LIBRE', 'BUSD'],
      address: {
        56: '0xaA50B9675b6C6FaBb75F1f542f5adF53A61963cE',
        97: '0xA3AfE6398Be2EFC2748a8C16f966cE51a140a3aC',
      },
      symbol: 'LIBRE-BUSD LP',
      decimals: 18,
      active: true,
    },
    {
      pair: ['CAKE', 'BNB'],
      address: {
        56: '0x7A9DA03d738301ad4928Da2351Bb9007be45a2aE',
        97: '0x2BD559CE46951452414a413749981D0F4998C477',
      },
      symbol: 'BNB-CAKE LP',
      decimals: 18,
      active: true,
    },
    {
      pair: ['BUSD', 'BAKE'],
      address: {
        56: '0x403Af8046E92607525F686FA5C78D93ec6257354',
        97: '0xF48b51D0B4427Fb8Aee6d3305CE1A89F5c8407D5',
      },
      symbol: 'BAKE-BUSD LP',
      decimals: 18,
      active: false,
    },
    {
      pair: ['BUSD', 'BNB'],
      address: {
        56: '0x5D83533C903F2B4F50516aa2E684Fe742519Ffc3',
        97: '0x4AC0f6915090491C538467B77792933C5c996ebA',
      },
      symbol: 'BNB-BUSD LP',
      decimals: 18,
      active: true,
    },
  ],
  POLY: [
    {
      pair: ['LIBRE', 'QUICK'],
      address: {
        137: '0x51dAe72014fe9d9174aFC4E6a0A33E4f4C05783D',
        80001: '0xC472bE42984Ce94158E52484B136Ac55a8cCFdac',
      },
      symbol: 'LIBRE-QUICK LP',
      decimals: 18,
      active: true,
    },
    {
      pair: ['LIBRE', 'MATIC'],
      address: {
        137: '0x33A46CE78ADf5d87dB75F5d1fda306269b34d407',
        80001: '0xd25eebbeB729348960133504Fdf7eE2CC986baB2',
      },
      symbol: 'LIBRE-MATIC LP',
      decimals: 18,
      active: true,
    },
    {
      pair: ['USDC', 'MATIC'],
      address: {
        137: '0xC0E53BD0539B7F2DAc98FafD5Bc5F65A491c16C8',
        80001: '0xD6916e59A70575F090B318363fABe47917caC5f6',
      },
      symbol: 'MATIC-USDC LP',
      decimals: 18,
      active: true,
    },
  ],
  AVAX: [
    {
      pair: ['LIBRE', 'AVAX'],
      address: {
        43114: '0xea4a6e2950ca8c9885ECBCDF8CEED197f461FEA5',
        43113: '0x432B88e5c68Bd1E0005E715f3208Da375AbaF4c3',
      },
      symbol: 'LIBRE-AVAX LP',
      decimals: 18,
      active: true,
    },
    {
      pair: ['LIBRE', 'JOE'],
      address: {
        43114: '0xBD3307cb9feA34d0E63611c5fa2F03dD0a69b8d6',
        43113: '0xFcB1E4B9A6bF42D5568f6b6E7B43e61dad1d6eF7',
      },
      symbol: 'LIBRE-JOE LP',
      decimals: 18,
      active: true,
    },
    // {
    //   pair: ['LIBRE', 'PNG'],
    //   address: {
    //     43114: '',
    //     43113: '0x1A42C5D1FC6fE76DA837226F7308C8e0C74493fb',
    //   },
    //   symbol: 'LIBRE-PNG LP',
    //   decimals: 18,
    // },
    {
      pair: ['USDC', 'JOE'],
      address: {
        43114: '0xb8a09F701f92a1255295d73008c0F8f8C6cfdCd9',
        43113: '0x18Ce8eef5b70925a44f2d5dDfAc6558F29143dF2',
      },
      symbol: 'JOE-USDC LP',
      decimals: 18,
      active: true,
    },
    {
      pair: ['USDC', 'AVAX'],
      address: {
        43114: '0xC90A5855AfD991EA196c607F3D9adc52D1B4EdB0',
        43113: '0xEBf8328F565adc1Af198A6e4fFc481760DEeCED2',
      },
      symbol: 'AVAX-USDC LP',
      decimals: 18,
      active: true,
    },
  ],
};

type IRpcUrl = {
  dev: string;
  prod: string;
};

export const RPC_URLS: { [key: string]: IRpcUrl } = {
  BSC: {
    dev: 'https://data-seed-prebsc-1-s2.binance.org:8545/',
    prod: 'https://bsc-dataseed.binance.org/',
  },
  POLY: {
    dev: 'https://matic-mumbai.chainstacklabs.com',
    prod: 'https://polygon-rpc.com',
  },
  AVAX: {
    dev: 'https://api.avax-test.network/ext/bc/C/rpc',
    prod: 'https://api.avax.network/ext/bc/C/rpc',
  },
};
export const Common_Bases_BSC = [
  mainnetTokensBSC.busd,
  mainnetTokensBSC.cake,
  mainnetTokensBSC.dai,
  mainnetTokensBSC.bnb,
  mainnetTokensBSC.libre,
  mainnetTokensBSC.eth,
  mainnetTokensBSC.dai,
];

export const Common_Bases_POLYGON = [
  mainnetTokensPolygon.libre,
  mainnetTokensPolygon.wmatic,
  mainnetTokensPolygon.matic,
];

export const Common_Bases_AVALANCHE = [
  mainnetTokensAvalanche.libre,
  mainnetTokensAvalanche.wavax,
  mainnetTokensAvalanche.avax,
];

export { Bep20ABI, FactoryABI };
export { PairABI, RouterABI };
export { mainnetTokensBSC, mainnetTokensPolygon };
