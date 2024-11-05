import { NavOption } from 'types';

export const navigations: NavOption[] = [
  {
    text: 'Trade',
    link: 'exchange',
    active: true,
    external: false,
  },
  {
    text: 'Pools',
    link: 'staking',
    active: true,
    external: false,
  },  
  {
    text: 'Farm',
    link: 'farms',
    active: true,
    external: false,
  },
  {
    text: 'NFT',
    link: 'nftmint',
    active: true,
    external: false,
  },
  {
    text: 'Buy',
    link: 'https://buy.libre.indacoin.io/',
    active: true,
    external: true,
  },
  {
    text: 'Bridge',
    link: 'https://app.multichain.org/#/router',
    active: true,
    external: true,
  },
  // {
  //   text: 'Dashboard',
  //   link: 'dashboard',
  //   active: true,
  //   external: false,
  // },
  {
    text: 'Info',
    link: 'info',
    active: true,
    external: false,
  },
 /* {
    text: 'Docs',
    link: 'https://docs.libredefi.io/',
    active: true,
    external: true,
  },
  /*{
    text: 'FAQs',
    link: 'https://docs.libredefi.io/faqs/',
    active: true,
    external: true,
  },*/
  
  
];
