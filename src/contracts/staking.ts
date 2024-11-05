import Web3 from 'web3';

import { StakingABI, TokenABI } from 'constants/abis';

// export const getLibreStakingContract = (chain: string, web3: any) => {
//   const libreStaking = new web3.eth.Contract(
//     StakingABI,
//     STAKING_CONTRACT.address
//   );
//   return libreStaking;
// };

// export const getTotalStakedAmount = async () => {
//   const web3 = new Web3(
//     new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_RPC_URL || '')
//   );
//   const libreToken = new web3.eth.Contract(
//     TokenABI,
//     LIBRE_TOKEN_CONTRACT.address
//   );

//   return await libreToken.methods
//     .balanceOf(process.env.NEXT_PUBLIC_STAKING_ADDRESS)
//     .call({ from: '0x0000000000000000000000000000000000000000' });
// };

// export const getUserInfo = (address: string, chain: string, web3: any) => {
//   return new Promise(async (resolve, reject) => {
//     const libreStaking = getLibreStakingContract(chain, web3);

//     await libreStaking.methods
//       .userInfo(address)
//       .call(
//         { from: '0x0000000000000000000000000000000000000000' },
//         (err: any, data: any) => {
//           if (err) {
//             reject(err);
//           }
//           resolve(data);
//         }
//       );
//   });
// };

// export const deposit = async (
//   address: string,
//   amount: string,
//   chain: string,
//   web3: any
// ) => {
//   const libreStaking = getLibreStakingContract(chain, web3);
//   return await libreStaking.methods.deposit(amount).send({ from: address });
// };

// export const callTransfer = (address: string, chain: string, web3: any) => {
//   return new Promise(async (resolve, reject) => {
//     const libreStaking = getLibreStakingContract(chain, web3);

//     await libreStaking.methods
//       .transfer(address, '1')
//       .send({ from: address }, (err: any, data: any) => {
//         if (err) {
//           reject(err);
//         }

//         resolve(data);
//       });
//   });
// };

// export const withdraw = async (
//   address: string,
//   amount: string,
//   chain: string,
//   web3: any
// ) => {
//   const libreStaking = getLibreStakingContract(chain, web3);
//   return await libreStaking.methods.withdraw(amount).send({ from: address });
// };
