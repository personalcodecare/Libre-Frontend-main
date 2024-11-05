import { useEffect, useState, useCallback } from 'react';
import Web3 from 'web3';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import InputRange from 'react-input-range';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import { useModal } from 'hooks';
import {
  useAppFacade,
  useUserFacade,
  useWeb3Facade,
  useLunarFacade,
} from 'state';
import {
  StakingContract,
  TokenContract,
  LPContract,
  Bep20Contract,
  NFTMintContract,
  FarmingContract,
  ApyContract,
} from 'contracts';
import { formatNumber, parseInt } from 'utils';
import {
  LP_PAIRS,
  IBep20Token,
  TOKENS,
  CHAINS,
  RPC_URLS,
  EXPLORERS,
} from '../../constants';

import {
  PageContainer,
  Button,
  Input,
  CreatePoolModal,
  ChainSelector,
  InputBackgroundColor,
} from 'components';
import {
  SVG_CARET_DOWN,
  SVG_LIBRE,
  SVG_LIBRE1,
  SVG_SUCCESS,
  SVG_TOOLTIP,
} from 'assets/icons';
import { emergencyWithdraw } from 'contracts/farming';
import { urlObjectKeys } from 'next/dist/next-server/lib/utils';

const customHttpProvider = new ethers.providers.JsonRpcProvider(
  'https://bsc-dataseed.binance.org/'
);

export default function Farms() {
  const { appEnv } = useAppFacade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { lunarState } = useLunarFacade();

  const {
    isOpen: isCreatePoolModalOpen,
    showModal: showCreatePoolModal,
    hideModal: hideCreatePoolModal,
  } = useModal();

  // Modal Variables
  const [depositLPModal, setDepositLPModal] = useState(false);
  const [depositLPSuccessModal, setDepositLPSuccessModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [withdrawLPModal, setWithdrawLPModal] = useState(false);
  const [withdrawLPV1Modal, setWithdrawLPV1Modal] = useState(false);
  const [withdrawLP_WrapModal, setWithdrawLP_WrapModal] = useState(false);
  const [singleAssetModal, setSingleAssetModal] = useState(false);
  const [harvestModal, setHarvestModal] = useState(false);
  const [nftboostModal, setNFTBoostModal] = useState(false);

  const [depositPercentage, setDepositPercentage] = useState(0);
  const [depositLPPercentage, setDepositLPPercentage] = useState(0);
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const [slippage, setSlippage] = useState(5);
  const [activePair, setActivePair] = useState(-1);
  const [tokenBalance, setTokenBalance] = useState('0.00');
  const [usdBalance, setUsdBalance] = useState('0.00');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLPAmount, setDepositLPAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [nftBalance, setNftBalance] = useState(0);
  const [lpBalances, setLpBalances] = useState<string[]>(
    new Array(5).fill('0.00')
  );
  const [lpBalancesWallet, setLpBalancesWallet] = useState<string[]>(
    new Array(5).fill('0.00')
  );
  const [lpAllowances, setLpAllowances] = useState<string[]>(
    new Array(5).fill('0.00')
  );
  const [lpPrices, setLpPrices] = useState<string[]>(new Array(5).fill('0.00'));
  const [libreEarned, setLibreEarned] = useState<string[]>(
    new Array(5).fill('0.00')
  );
  const [totalLpLocked, setTotalLpLocked] = useState<string[]>(
    new Array(5).fill('0')
  );
  const [totalLpLockedUsd, setTotalLpLockedUsd] = useState<number[]>(
    new Array(5).fill(0)
  );
  const [lpApy, setLpApy] = useState<number[]>(new Array(5).fill(0));

  const [nextClaimTimes, setNextClaimTimes] = useState<number[]>(
    new Array(5).fill(0)
  );

  const setActiveLpBalance = (activePair: number, value: string) => {
    setLpBalances((lpBalances) => {
      return lpBalances.map((balance, index) => {
        if (activePair === index) {
          return value;
        } else return balance;
      });
    });
  };

  const setActiveLpBalanceWalllet = (activePair: number, value: string) => {
    setLpBalancesWallet((lpBalances) => {
      return lpBalances.map((balance, index) => {
        if (activePair === index) {
          return value;
        } else return balance;
      });
    });
  };

  const setActiveLPAllowance = (activePair: number, value: string) => {
    setLpAllowances((lpallowance) => {
      return lpallowance.map((allowance, index) => {
        if (activePair === index) {
          return value;
        } else return allowance;
      });
    });
  };

  const handleDeposit = async () => {
    if (
      parseInt(depositAmount) > 0 &&
      parseInt(depositAmount) <= parseInt(tokenBalance)
    ) {
      showCreatePoolModal();
    }
  };
  const handleDepositLP = async () => {
    if (parseInt(depositLPAmount) > 0) {
      try {
        const txHash = await FarmingContract.depositLP(
          activePair + 1,
          new BigNumber(depositLPAmount).toString(10),
          address,
          userChain,
          web3
        );
        setTransactionHash(txHash);
        setDepositLPModal(false);
        setDepositLPSuccessModal(true);

        const userInfo = await FarmingContract.getUserInfo(
          address,
          activePair + 1,
          userChain,
          web3
        );
        setActiveLpBalance(activePair, Web3.utils.fromWei(userInfo.amount));

        let amount = await LPContract.getBalance(address, activePair, userChain, web3);
        setActiveLpBalanceWalllet(activePair, amount);

        const result = await Bep20Contract.getBep20TokenBalanceOf(
          address,
          LP_PAIRS[userChain][activePair].pair[1],
          userChain,
          web3
        );
        setTokenBalance(Web3.utils.fromWei(result));

        const pendingLib = await FarmingContract.pendingLib(
          address,
          activePair + 1,
          userChain,
          web3
        );
        setLibreEarned((libreEarned) => {
          return libreEarned.map((lib, i) => {
            if (activePair === i) {
              return Web3.utils.fromWei(pendingLib);
            } else return lib;
          });
        });
        updateBalance(address, userChain, web3);
        setDepositLPAmount('');
        setDepositLPPercentage(0);
      } catch (err) {
        console.log('FarmingWithdraw - ', err);
      }
    }
  };
  const handleWithdraw = async () => {
    if (parseInt(withdrawAmount) > 0) {
      try {
        await FarmingContract.withdraw(
          activePair + 1,
          new BigNumber(withdrawAmount).toString(10),
          address,
          userChain,
          web3
        );
        const userInfo = await FarmingContract.getUserInfo(
          address,
          activePair + 1,
          userChain,
          web3
        );
        setActiveLpBalance(activePair, Web3.utils.fromWei(userInfo.amount));

        let amount = await LPContract.getBalance(address, activePair, userChain, web3);
        setActiveLpBalanceWalllet(activePair, amount);

        const result = await Bep20Contract.getBep20TokenBalanceOf(
          address,
          LP_PAIRS[userChain][activePair].pair[1],
          userChain,
          web3
        );
        setTokenBalance(Web3.utils.fromWei(result));

        const pendingLib = await FarmingContract.pendingLib(
          address,
          activePair + 1,
          userChain,
          web3
        );
        setLibreEarned((libreEarned) => {
          return libreEarned.map((lib, i) => {
            if (activePair === i) {
              return Web3.utils.fromWei(pendingLib);
            } else return lib;
          });
        });
        updateBalance(address, userChain, web3);
        setDepositAmount('');
        setWithdrawAmount('');
        setWithdrawPercentage(0);
      } catch (err) {
        console.log('FarmingWithdraw - ', err);
      }
    }
  };
  const handleWithdrawV1 = async () => {
      try {
        await FarmingContract.emergencyWithdraw_V1(
          activePair + 1,
          address,
          userChain,
          web3
        );
        const userInfo = await FarmingContract.getUserInfo(
          address,
          activePair + 1,
          userChain,
          web3
        );
        setActiveLpBalance(activePair, Web3.utils.fromWei(userInfo.amount));

        let amount = await LPContract.getBalance(address, activePair, userChain, web3);
        setActiveLpBalanceWalllet(activePair, amount);

        const result = await Bep20Contract.getBep20TokenBalanceOf(
          address,
          LP_PAIRS[userChain][activePair].pair[1],
          userChain,
          web3
        );
        setTokenBalance(Web3.utils.fromWei(result));

        const pendingLib = await FarmingContract.pendingLib(
          address,
          activePair + 1,
          userChain,
          web3
        );
        setLibreEarned((libreEarned) => {
          return libreEarned.map((lib, i) => {
            if (activePair === i) {
              return Web3.utils.fromWei(pendingLib);
            } else return lib;
          });
        });
        updateBalance(address, userChain, web3);
        setDepositAmount('');
        setWithdrawAmount('');
        setWithdrawPercentage(0);
      } catch (err) {
        console.log('FarmingWithdraw V1 - ', err);
      }
  };
  const handleApprove = async() => {
    try {
      const maxAmt = web3.utils.toBN('1000000000000000000000000000000');
      //aprove LP to Farm Contract
      await LPContract.approveToFarm(address, maxAmt, activePair, userChain, web3);
      setActiveLPAllowance(activePair, maxAmt);
    } catch (err) {
      console.log('Approve To Farm - ', err);
    }
  }
  const handleMigrate = async() => {
    try {
      //withdraw
      await FarmingContract.emergencyWithdraw_V1(
        activePair + 1,
        address,
        userChain,
        web3
      );
      const maxAmt = web3.utils.toBN('1000000000000000000000000000000');
      //aprove LP to Farm Contract
      if (lpAllowances[activePair].length < 3)
      {
        await LPContract.approveToFarm(address, maxAmt, activePair, userChain, web3);
        setActiveLPAllowance(activePair, maxAmt);
      }      
      //deposit LP to Farm
      let amount = await LPContract.getBalance(address, activePair, userChain, web3);
      console.log("LP amount", amount);
      amount = Web3.utils.fromWei(amount);
      await FarmingContract.depositLP(
        activePair + 1,
        amount,
        address,
        userChain,
        web3
      );

      const userInfo = await FarmingContract.getUserInfo(
        address,
        activePair + 1,
        userChain,
        web3
      );
      setActiveLpBalance(activePair, Web3.utils.fromWei(userInfo.amount));
      setActiveLpBalanceWalllet(activePair, amount);

      const result = await Bep20Contract.getBep20TokenBalanceOf(
        address,
        LP_PAIRS[userChain][activePair].pair[1],
        userChain,
        web3
      );
      setTokenBalance(Web3.utils.fromWei(result));

      const pendingLib = await FarmingContract.pendingLib(
        address,
        activePair + 1,
        userChain,
        web3
      );
      setLibreEarned((libreEarned) => {
        return libreEarned.map((lib, i) => {
          if (activePair === i) {
            return Web3.utils.fromWei(pendingLib);
          } else return lib;
        });
      });
      updateBalance(address, userChain, web3);
      setDepositAmount('');
      setWithdrawAmount('');
      setWithdrawPercentage(0);
    } catch (err) {
      console.log('FarmingWithdraw - ', err);
    }
  }
  const handleWithdrawLP = async () => {
    if (parseInt(withdrawAmount) > 0) {
      try {
        await FarmingContract.withdrawLP(
          activePair + 1,
          new BigNumber(withdrawAmount).toString(10),
          address,
          userChain,
          web3
        );
        const userInfo = await FarmingContract.getUserInfo(
          address,
          activePair + 1,
          userChain,
          web3
        );
        setActiveLpBalance(activePair, Web3.utils.fromWei(userInfo.amount));

        let amount = await LPContract.getBalance(address, activePair, userChain, web3);
        setActiveLpBalanceWalllet(activePair, amount);

        const result = await Bep20Contract.getBep20TokenBalanceOf(
          address,
          LP_PAIRS[userChain][activePair].pair[1],
          userChain,
          web3
        );
        setTokenBalance(Web3.utils.fromWei(result));

        const pendingLib = await FarmingContract.pendingLib(
          address,
          activePair + 1,
          userChain,
          web3
        );
        setLibreEarned((libreEarned) => {
          return libreEarned.map((lib, i) => {
            if (activePair === i) {
              return Web3.utils.fromWei(pendingLib);
            } else return lib;
          });
        });
        updateBalance(address, userChain, web3);
        setDepositAmount('');
        setWithdrawAmount('');
        setWithdrawPercentage(0);
      } catch (err) {
        console.log('FarmingWithdrawLP - ', err);
      }
    }
  };
  const handleClaimV1Rewards = async() => {
    try {
     /* FarmingContract.getUserInfo_v1(address, activePair + 1, userChain, web3).then(
        async (result: any) => {
          console.log("result.amount", result.amount);*/
         // let amount = Web3.utils.fromWei(result.amount, "kether").toString();
          await FarmingContract.withdraw_v1(
            activePair + 1,
            "0.000000000001",
            //amount,
            address,
            userChain,
            web3
          );
       /* }
      );*/
    } catch (err) {
      console.log('Claim V1 Rewards - ', err);
    }
  }
  const handleEmergencyWithdraw = async () => {
    try {
      await FarmingContract.emergencyWithdraw(
        activePair + 1,
        address,
        true,
        userChain,
        web3
      );
      const userInfo = await FarmingContract.getUserInfo(
        address,
        activePair + 1,
        userChain,
        web3
      );
      setActiveLpBalance(activePair, Web3.utils.fromWei(userInfo.amount));

      let amount = await LPContract.getBalance(address, activePair, userChain, web3);
        setActiveLpBalanceWalllet(activePair, amount);
      const result = await Bep20Contract.getBep20TokenBalanceOf(
        address,
        LP_PAIRS[userChain][activePair].pair[1],
        userChain,
        web3
      );
      setTokenBalance(Web3.utils.fromWei(result));

      const pendingLib = await FarmingContract.pendingLib(
        address,
        activePair + 1,
        userChain,
        web3
      );
      setLibreEarned((libreEarned) => {
        return libreEarned.map((lib, i) => {
          if (activePair === i) {
            return Web3.utils.fromWei(pendingLib);
          } else return lib;
        });
      });
      updateBalance(address, userChain, web3);
      setDepositAmount('');
      setWithdrawAmount('');
      setWithdrawPercentage(0);
    } catch (err) {
      console.log('FarmingWithdraw - ', err);
    }
  };

  const harvestReward = async (activePair: number) => {
    try {
      await FarmingContract.claimReward(
        activePair + 1,
        address,
        userChain,
        web3
      );
      setHarvestModal(true);
    } catch (err) {
      console.log('FarmingWithdraw - ', err);
    }
  };

  useEffect(() => {
    if (web3 && address && web3ChainId === userChainId) {
      updateBalance(address, userChain, web3);

      (async()=>{
        if (userChain == "BSC"){
          const count = await NFTMintContract.getBalanceOfOwner(userChain, web3, address);
          setNftBalance(count);
        }
        
      })();

      ApyContract.APY(1, userChain, web3)
      .then((res) => {
        setLpApy((lpApy) => {
          return lpApy.map((apy, i) => {
            if (i === 0) {
              console.log("here0, index", i);
              return (
                CHAINS[userChain].blocks *
                parseInt(Web3.utils.fromWei(res.rewardPerBlock)) *
                100
              );
            } else return apy;
          });
        });
      })
      .catch((err) => console.log('GetAPY - ', err));

      ApyContract.APY(2, userChain, web3)
      .then((res) => {
        setLpApy((lpApy) => {
          return lpApy.map((apy, i) => {
            if (i === 1) {
              console.log("here1, index", i);
              return (
                CHAINS[userChain].blocks *
                parseInt(Web3.utils.fromWei(res.rewardPerBlock)) *
                100
              );
            } else return apy;
          });
        });
      })
      .catch((err) => console.log('GetAPY - ', err));

      (async () => {
        try {
          await Promise.all(
            LP_PAIRS[userChain].map(async (pair, index) => {
              if (index == 0 || index == 1){
                const totalSupply = await Bep20Contract.totalSupply(
                  pair.address[userChainId],
                  web3
                );
                console.log("pair.address[userChainId]", pair.address[userChainId]);
                console.log("totalSupply",totalSupply)
                setTotalLpLocked((totalLpLocked) => {
                  return totalLpLocked.map((bal, i) => {
                    if (index === i) {
                      return Web3.utils.fromWei(totalSupply);
                    } else return bal;
                  });
                });
  
                const res = await ApyContract.LPtoUSD(
                  pair.address[userChainId],
                  userChain,
                  web3
                );
  
              /*  console.log("res", res);
                setLpPrices((lpPrices) => {
                  return lpPrices.map((lpPrice, i) => {
                    if (index === i) {
                      return Web3.utils.fromWei(res.LPToUSD);
                    } else return lpPrice;
                  });
                });
  */
                setTotalLpLockedUsd((totalLpLockedUsd) => {
                    return totalLpLockedUsd.map((tvl, i) => {
                      if (index === i) {
                        return (
                          Web3.utils.fromWei(res)
                        );
                      } else return tvl;
                    });
                  });
                
              }
            })  
          );
        } catch (err) {
          console.log("Getting APY, TVL-", err );
        }
      })();
      
    } else if (web3ChainId !== userChainId) {
      updateUserInfo({ balance: 0 });
      setLpBalances(new Array(LP_PAIRS[userChain].length).fill(0));
      setLpBalancesWallet(new Array(LP_PAIRS[userChain].length).fill(0));
    }
  }, [web3, address, web3ChainId, userChainId, updateBalance, updateUserInfo]);

  useEffect(() => {
    if (
      web3 &&
      address &&
      web3ChainId === userChainId &&
      activePair >= 0 &&
      !isCreatePoolModalOpen
    ) {
      (async () => {
        try {
          const result = await Bep20Contract.getBep20TokenBalanceOf(
            address,
            LP_PAIRS[userChain][activePair].pair[1],
            userChain,
            web3
          );
          setTokenBalance(Web3.utils.fromWei(result));
          
          const balance = await FarmingContract.getUserInfo(
            address,
            activePair + 1,
            userChain,
            web3
          );
          setActiveLpBalance(activePair, Web3.utils.fromWei(balance.amount));

          let amount = await LPContract.getBalance(address, activePair, userChain, web3);
          setActiveLpBalanceWalllet(activePair, amount);

          setDepositPercentage(0);
        } catch (err) {
          console.log('FarmingDeposit - ', err);
        }
      })();
    }
  }, [activePair, isCreatePoolModalOpen]);

  useEffect(() => {
    if (activePair >= 0) {
      setUsdBalance('0.00');
      setSlippage(5);
    }
  }, [activePair, tokenBalance]);

  useEffect(() => {
    if (depositPercentage > 0)
      setDepositAmount((depositAmount) =>
        ((+tokenBalance * depositPercentage) / 100).toString()
      );
    else setDepositAmount('');
  }, [depositPercentage]);

  useEffect(() => {
    if (depositLPPercentage > 0)
      setDepositLPAmount((depositLPAmount) =>
        (
          (parseInt(lpBalancesWallet[activePair]) * depositLPPercentage) /
          100
        ).toString()
      );
    else setDepositLPAmount('');
  }, [depositLPPercentage]);

  useEffect(() => {
    if (withdrawPercentage > 0)
      setWithdrawAmount((withdrawAmount) =>
        (
          (parseInt(lpBalances[activePair]) * withdrawPercentage) /
          100
        ).toString()
      );
    else setWithdrawAmount('');
  }, [withdrawPercentage]);

  useEffect(() => {
    if (web3 && address && web3ChainId === userChainId) {
      (async () => {
        
        try {
          await Promise.all(
            LP_PAIRS[userChain].map(async (pair, index) => {
              const userInfo = await FarmingContract.getUserInfo(
                address,
                index + 1,
                userChain,
                web3
              );
              setLpBalances((lpBalances) => {
                return lpBalances.map((bal, i) => {
                  if (index === i) {
                    return Web3.utils.fromWei(userInfo.amount);
                  } else return bal;
                });
              });
              let amount = await LPContract.getBalance(address, index, userChain, web3);
              setLpBalancesWallet((lpBalances) => {
                return lpBalances.map((bal, i) => {
                  if (index === i) {
                    return Web3.utils.fromWei(amount);
                  } else return bal;
                });
              });
              const allowance = await LPContract.getAllowance(
                address,
                index,
                userChain,
                web3
              );
              setLpAllowances((lpallowance) => {
                return lpallowance.map((bal, i) => {
                  if (index === i) {
                    return Web3.utils.fromWei(allowance);
                  } else return bal;
                });
              });

              const pendingLib = await FarmingContract.pendingLib(
                address,
                index + 1,
                userChain,
                web3
              );

              setLibreEarned((libreEarned) => {
                return libreEarned.map((lib, i) => {
                  if (index === i) {
                    return Web3.utils.fromWei(pendingLib);
                  } else return lib;
                });
              });

              const nextClaimTime = await FarmingContract.getNextClaimTime(
                index + 1,
                address,
                userChain,
                web3
              );
              const rewardPeriod = await FarmingContract.rewardPeriod(
                userChain,
                web3
              );
              setNextClaimTimes((nextClaimTimes) => {
                return nextClaimTimes.map((item, i) => {
                  if (index === i) {
                    return parseInt(nextClaimTime) + parseInt(rewardPeriod);
                  } else return item;
                });
              });
              
            })
          );
        } catch (err) {
          console.log('FarmingInfo - ', err);
        }
      })();
    } else {
      setLibreEarned(new Array(LP_PAIRS[userChain].length).fill(0));
      // setTotalLpLocked(new Array(LP_PAIRS[userChain].length).fill(0));
      // setTotalLpLockedUsd(new Array(LP_PAIRS[userChain].length).fill(0));
      // setLpApy(new Array(LP_PAIRS[userChain].length).fill(0));
    }
  }, [web3, address, userChainId, web3ChainId, tokenBalance]);
/*
  useEffect(() => {
    if (userChain) {
     // const web3 = new Web3(RPC_URLS[userChain].prod);
      
     console.log(web3);
      (async () => {
        try {
          await Promise.all(
            LP_PAIRS[userChain].map(async (pair, index) => {
              const totalSupply = await Bep20Contract.totalSupply(
                pair.address[userChainId],
                web3
              );
               const apyResult = await ApyContract.APY(
                index + 1,
                userChain,
                web3
              );

              console.log("ApyResult", index+1, apyResult);
              setTotalLpLocked((totalLpLocked) => {
                return totalLpLocked.map((bal, i) => {
                  if (index === i) {
                    return Web3.utils.fromWei(totalSupply);
                  } else return bal;
                });
              });

              const res = await ApyContract.LPtoUSD(
                pair.address[userChainId],
                userChain,
                web3
              );

              console.log()
              setLpPrices((lpPrices) => {
                return lpPrices.map((lpPrice, i) => {
                  if (index === i) {
                    return Web3.utils.fromWei(res.LPToUSD);
                  } else return lpPrice;
                });
              });

             setTotalLpLockedUsd((totalLpLockedUsd) => {
                return totalLpLockedUsd.map((tvl, i) => {
                  if (index === i) {
                    return (
                      parseInt(Web3.utils.fromWei(res.LPToUSD)) *
                      parseInt(Web3.utils.fromWei(res.totalLP))
                    );
                  } else return tvl;
                });
              });
              setLpApy((lpApy) => {
                return lpApy.map((apy, i) => {
                  
                  if (index === i) {
                    console.log("here, index", index);
                    return (
                      CHAINS[userChain].blocks *
                      parseInt(Web3.utils.fromWei(apyResult.rewardPerBlock)) *
                      100
                    );
                  } else return apy;
                });
              });
            })  
          );
        } catch (err) {
          console.log({ err });
        }
      })();
    }
  }, [userChain]);
*/
  return (
    <>
    <PageContainer>
      <Head>
        <title>Farming | Libre DeFi</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex justify-between items-center relative mb-5 dark:text-white mobile:flex-col mobile:justify-center">
        <div className="w-full">
          <h1 className="text-3xl font-semibold mobile:text-center">Farms</h1>
          <h3 className="text-base mobile:text-center">
            Deposit LP Tokens to Earn
          </h3>
        </div>
        <div className="mt-3 flex flex-col items-center justify-center w-full mobile:mb-4">
          <ChainSelector />
        </div>
        <div className="flex items-center mobile:mt-7 w-full mobile:hidden justify-end">
          <SVG_LIBRE1 width="33" height="33" />
          <span className="text-xl ml-1 ">
            <strong>{formatNumber(balance)}</strong> LIBRE
          </span>
        </div>
      </div>
      <div className="mobile:block">
        {LP_PAIRS[userChain] &&
          LP_PAIRS[userChain].map((lpPair, index) => (
            <div
              className="mt-3 mb-3 px-8 mobile:px-4 border-solid border rounded-xl bg-white dark:bg-secondary dark:text-white"
              key={index}
              style={{
                borderColor:
                  userChain === 'BSC'
                    ? 'var(--primary)'
                    : CHAINS[userChain].bgColor,
              }}
            >
              <div className="pt-4 pb-4 flex flex-row mobile:flex-col gap-y-3 items-center justify-between">
                <div className="flex flex-row gap-3 mobile:w-full">
                  <div className="flex-shrink-0 w-16">
                    <Image
                      src={`/assets/icons/${lpPair.pair[0].toLowerCase()}.svg`}
                      width={47}
                      height={47}
                    />
                    <div className="-mt-8 ml-5">
                      <Image
                        src={`/assets/icons/${lpPair.pair[1].toLowerCase()}.svg`}
                        width={47}
                        height={47}
                      />
                    </div>
                  </div>
                  <div style={{ width: '208px', flexShrink: 0 }}>
                    <h3 className="text-2xl font-semibold">
                      {lpPair.pair[0]}-{lpPair.pair[1]} LP
                    </h3>
                    <p className="text-xs font-medium">
                      Uses: {CHAINS[userChain].swap}
                    </p>
                    {userChain === 'BSC' ? (
                      <>
                        {index >= 2 ? "": nftBalance > 0 ? 
                        <button
                        className="inline-flex justify-center items-center pt-1 pb-1 bg-primary text-xs mobile:text-xs text-white px-3 rounded-full mt-2"
                        onClick={() => {

                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.44746 3.52928C9.28977 3.35423 9.19697 3.13035 9.18458 2.89508C9.14879 2.35533 8.91821 1.84694 8.5357 1.46445C8.15319 1.08195 7.6448 0.851371 7.10504 0.815582C6.86974 0.803108 6.64581 0.710462 6.47049 0.553052C6.06359 0.196616 5.54108 9.18866e-05 5.00014 3.05319e-05C4.4592 -3.08227e-05 3.93665 0.196374 3.52968 0.552718C3.35446 0.710358 3.13049 0.803142 2.89513 0.815588C2.35537 0.85138 1.84698 1.08196 1.46447 1.46446C1.08197 1.84695 0.851388 2.35533 0.815598 2.89508C0.803179 3.1305 0.710259 3.35451 0.552394 3.52961C0.196264 3.93668 -2.99115e-07 4.45918 6.10495e-05 5.00004C0.000122398 5.5409 0.196505 6.06336 0.552728 6.47035C0.710369 6.64556 0.803153 6.86953 0.815598 7.10488C0.851386 7.64463 1.08197 8.15302 1.46448 8.53551C1.84698 8.91801 2.35538 9.14859 2.89514 9.18438C3.13044 9.19686 3.35437 9.28951 3.52969 9.44692C3.93656 9.80341 4.45908 9.99996 5.00003 10C5.54099 10.0001 6.06355 9.80365 6.4705 9.44726C6.64571 9.28962 6.86969 9.19683 7.10505 9.18438C7.64481 9.1486 8.15321 8.91802 8.53572 8.53552C8.91822 8.15302 9.14881 7.64464 9.1846 7.10489C9.19707 6.8696 9.28973 6.64568 9.44715 6.47036C9.80352 6.06337 9.99999 5.54083 10 4.99988C10.0001 4.45892 9.80374 3.93635 9.44746 3.52928ZM7.24272 4.70625L6.27482 5.50503C6.237 5.53695 6.2091 5.57902 6.19443 5.62628C6.17975 5.67353 6.1789 5.724 6.19198 5.77173L6.52609 7.01294C6.54141 7.06101 6.54148 7.11264 6.52627 7.16074C6.51107 7.20884 6.48133 7.25105 6.44116 7.28156C6.40099 7.31208 6.35236 7.32941 6.30194 7.33116C6.25152 7.33292 6.2018 7.31902 6.1596 7.29137L5.13414 6.57556C5.09491 6.5479 5.04808 6.53305 5.00008 6.53305C4.95208 6.53305 4.90525 6.5479 4.86602 6.57556L3.84056 7.29137C3.79836 7.31901 3.74864 7.33291 3.69822 7.33116C3.64781 7.3294 3.59917 7.31207 3.559 7.28155C3.51884 7.25104 3.48911 7.20883 3.4739 7.16073C3.45869 7.11263 3.45876 7.061 3.47408 7.01294L3.80819 5.77173C3.82127 5.724 3.82042 5.67353 3.80574 5.62628C3.79106 5.57902 3.76317 5.53695 3.72535 5.50503L2.75744 4.70625C2.71837 4.67407 2.68977 4.63099 2.67528 4.58249C2.6608 4.53399 2.66108 4.48228 2.6761 4.43395C2.69111 4.38561 2.72019 4.34284 2.7596 4.31109C2.79902 4.27934 2.847 4.26005 2.89743 4.25567L4.12939 4.20453C4.17788 4.2019 4.22447 4.18479 4.26314 4.15541C4.30181 4.12603 4.33077 4.08573 4.34629 4.03971L4.77359 2.83009C4.78902 2.78216 4.81926 2.74036 4.85996 2.71071C4.90066 2.68106 4.94972 2.66508 5.00007 2.66508C5.05043 2.66508 5.09949 2.68106 5.14019 2.71071C5.18089 2.74036 5.21113 2.78216 5.22656 2.83009L5.65385 4.03971C5.66938 4.08573 5.69834 4.12603 5.73701 4.15541C5.77568 4.18479 5.82227 4.2019 5.87076 4.20453L7.10272 4.25567C7.15315 4.26005 7.20113 4.27934 7.24055 4.31109C7.27997 4.34284 7.30904 4.3856 7.32406 4.43394C7.33908 4.48228 7.33936 4.53399 7.32488 4.58249C7.31039 4.63098 7.28179 4.67407 7.24272 4.70625Z" fill="white"/>
                        </svg>&nbsp;

                        NFT BOOST ACTIVE
                      </button> :
                      <button
                        className="inline-flex justify-center items-center pt-1 pb-1 bg-gray-300 text-xs mobile:text-xs text-white px-3 rounded-full mt-2"
                        onClick={() => {
                          setNFTBoostModal(true);
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.44746 3.52928C9.28977 3.35423 9.19697 3.13035 9.18458 2.89508C9.14879 2.35533 8.91821 1.84694 8.5357 1.46445C8.15319 1.08195 7.6448 0.851371 7.10504 0.815582C6.86974 0.803108 6.64581 0.710462 6.47049 0.553052C6.06359 0.196616 5.54108 9.18866e-05 5.00014 3.05319e-05C4.4592 -3.08227e-05 3.93665 0.196374 3.52968 0.552718C3.35446 0.710358 3.13049 0.803142 2.89513 0.815588C2.35537 0.85138 1.84698 1.08196 1.46447 1.46446C1.08197 1.84695 0.851388 2.35533 0.815598 2.89508C0.803179 3.1305 0.710259 3.35451 0.552394 3.52961C0.196264 3.93668 -2.99115e-07 4.45918 6.10495e-05 5.00004C0.000122398 5.5409 0.196505 6.06336 0.552728 6.47035C0.710369 6.64556 0.803153 6.86953 0.815598 7.10488C0.851386 7.64463 1.08197 8.15302 1.46448 8.53551C1.84698 8.91801 2.35538 9.14859 2.89514 9.18438C3.13044 9.19686 3.35437 9.28951 3.52969 9.44692C3.93656 9.80341 4.45908 9.99996 5.00003 10C5.54099 10.0001 6.06355 9.80365 6.4705 9.44726C6.64571 9.28962 6.86969 9.19683 7.10505 9.18438C7.64481 9.1486 8.15321 8.91802 8.53572 8.53552C8.91822 8.15302 9.14881 7.64464 9.1846 7.10489C9.19707 6.8696 9.28973 6.64568 9.44715 6.47036C9.80352 6.06337 9.99999 5.54083 10 4.99988C10.0001 4.45892 9.80374 3.93635 9.44746 3.52928ZM7.24272 4.70625L6.27482 5.50503C6.237 5.53695 6.2091 5.57902 6.19443 5.62628C6.17975 5.67353 6.1789 5.724 6.19198 5.77173L6.52609 7.01294C6.54141 7.06101 6.54148 7.11264 6.52627 7.16074C6.51107 7.20884 6.48133 7.25105 6.44116 7.28156C6.40099 7.31208 6.35236 7.32941 6.30194 7.33116C6.25152 7.33292 6.2018 7.31902 6.1596 7.29137L5.13414 6.57556C5.09491 6.5479 5.04808 6.53305 5.00008 6.53305C4.95208 6.53305 4.90525 6.5479 4.86602 6.57556L3.84056 7.29137C3.79836 7.31901 3.74864 7.33291 3.69822 7.33116C3.64781 7.3294 3.59917 7.31207 3.559 7.28155C3.51884 7.25104 3.48911 7.20883 3.4739 7.16073C3.45869 7.11263 3.45876 7.061 3.47408 7.01294L3.80819 5.77173C3.82127 5.724 3.82042 5.67353 3.80574 5.62628C3.79106 5.57902 3.76317 5.53695 3.72535 5.50503L2.75744 4.70625C2.71837 4.67407 2.68977 4.63099 2.67528 4.58249C2.6608 4.53399 2.66108 4.48228 2.6761 4.43395C2.69111 4.38561 2.72019 4.34284 2.7596 4.31109C2.79902 4.27934 2.847 4.26005 2.89743 4.25567L4.12939 4.20453C4.17788 4.2019 4.22447 4.18479 4.26314 4.15541C4.30181 4.12603 4.33077 4.08573 4.34629 4.03971L4.77359 2.83009C4.78902 2.78216 4.81926 2.74036 4.85996 2.71071C4.90066 2.68106 4.94972 2.66508 5.00007 2.66508C5.05043 2.66508 5.09949 2.68106 5.14019 2.71071C5.18089 2.74036 5.21113 2.78216 5.22656 2.83009L5.65385 4.03971C5.66938 4.08573 5.69834 4.12603 5.73701 4.15541C5.77568 4.18479 5.82227 4.2019 5.87076 4.20453L7.10272 4.25567C7.15315 4.26005 7.20113 4.27934 7.24055 4.31109C7.27997 4.34284 7.30904 4.3856 7.32406 4.43394C7.33908 4.48228 7.33936 4.53399 7.32488 4.58249C7.31039 4.63098 7.28179 4.67407 7.24272 4.70625Z" fill="white"/>
                        </svg>&nbsp;

                        NFT BOOST INACTIVE
                      </button>
                      }
                      </>  
                    ) : (<></>)}
                  </div>
                </div>
                <div className="flex flex-row mobile:flex-col gap-y-4 items-center">
                  <div className="flex flex-row">
                    <div className="w-40 mobile:w-24 flex-shrink-0">
                      <h3 className="text-size-14 leading-7 text-center mobile:text-xl font-semibold">
                        {formatNumber(lpBalances[index], 2)}
                      </h3>
                      <p className="text-xs text-center">
                        Deposited
                      </p>
                    </div>
                    <div className="w-40 mobile:w-24 flex-shrink-0">
                      <h3 className="text-size-14 leading-7 text-center text-primary mobile:text-xl font-semibold">
                        {formatNumber(libreEarned[index], 2)}
                      </h3>
                      <p className="text-xs text-primary text-center">
                        Libre Earned
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <div className="w-40 mobile:w-24 border-gray-400 flex-shrink-0">
                      <h3 className="text-size-14 leading-7 text-center mobile:text-xl font-semibold">
                        {((index >= 2 && index <= 4) && userChain === 'BSC') || ((index >= 2 && index <= 4) && userChain === 'POLY') || ((index >= 2 && index <= 4) && userChain === 'AVAX')
                          ? 'Closed'
                          : `${formatNumber(lpApy[index], 2)}%`}
                      </h3>
                      <p className="text-xs text-center">APR</p>
                    </div>
                    <div className="w-40 mobile:w-24 border-gray-400 flex-shrink-0">
                      <h3 className="text-size-14 leading-7 text-center mobile:text-xl font-semibold">
                        {((index >= 2 && index <= 4) && userChain === 'BSC') || ((index >= 2 && index <= 4) && userChain === 'POLY') || ((index >= 2 && index <= 4) && userChain === 'AVAX')
                          ? 'Closed'
                          : `${formatNumber(lpApy[index] / 365, 2)}%`}
                      </h3>
                      <p className="text-xs text-center">Daily</p>
                    </div>
                    <div className="w-40 mobile:w-24 flex-shrink-0">
                      <h3 className="text-size-14 leading-7 text-center mobile:text-xl font-semibold">
                        {((index >= 2 && index <= 4) && userChain === 'BSC') || ((index >= 2 && index <= 4) && userChain === 'POLY') || ((index >= 2 && index <= 4) && userChain === 'AVAX')
                          ? 'Closed'
                          : `$${formatNumber(totalLpLockedUsd[index], 2)}`}
                      </h3>
                      <p className="text-xs text-center">TVL</p>
                    </div>
                  </div>
                  <div className="w-24 flex-shrink-0 ml-4">
                    <h3
                      className="font-semibold text-xl leading-6 text-primary dark:text-white mobile:dark:text-primary cursor-pointer flex items-center"
                      onClick={() => {
                        setTokenBalance('0.00');
                        setUsdBalance('0.00');
                        setDepositAmount('0.00');
                        setWithdrawAmount('0.00');
                        // setActiveLpBalance(index, '0.00');
                        if (activePair === index) {
                          setActivePair(-1);
                        } else {
                          setActivePair(index);
                        }
                      }}
                    >
                      <span className="mr-1.5 mobile:text-base text-sm">Details</span> <SVG_CARET_DOWN />
                    </h3>
                  </div>
                </div>
              </div>
              {/* NFT BOOST Modal */}
              <div
                className={`${
                  nftboostModal ? 'flex flex-col' : 'hidden'
                } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
              >
                <div
                  className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-10"
                  onClick={() => setNFTBoostModal(false)}
                />
                <div className="w-1/4 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-xl shadow-lg bg-white text-black">
                  <span className="text-xl font-semibold text-black bg-gray-200 py-3 pl-6">
                    NFT Boosts:
                  </span>
                  <div className="px-6 pt-4 pb-4 flex flex-col">
                    <div className="mt-8 px-12 inline-flex justify-center items-center gap-4 text-lg font-semibold">
                      You don’t currently have any NFTs in your wallet.
                    </div>
                    <div className="mt-8 flex flex-row gap-4 mb-8">
                      <button
                        className=" w-1/2 rounded-full bg-white border border-primary text-primary py-3"
                        onClick={() => setNFTBoostModal(false)}
                        
                      >
                        Close
                      </button>
                      <Link
                        href={'/nftmint'}
                        passHref
                      >
                        <button
                          className={`w-1/2 rounded-full bg-primary border border-primary text-white py-3`}
                          
                        >
                          Mint Now!
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {activePair === index && (
                <>
                  <div
                    className={`pt-12 pb-4 mobile:pt-6 mobile:pb-3 border-t-2 border-gray-200 flex flex-row mobile:flex-col  gap-6`}
                  >
                    <div className="p-6 flex flex-col gap-2 rounded-2xl border-2 border-gray-200 w-full">
                    {((index >= 2 && index <= 4) && userChain === 'BSC') || ((index >= 2 && index <= 4) && userChain === 'POLY') || ((index >= 2 && index <= 4) && userChain === 'AVAX') ? (
                      <>
                        <span className="font-bold mobile:text-sm">
                          Withdraw {LP_PAIRS[userChain][activePair].pair[0]}-
                          {LP_PAIRS[userChain][activePair].pair[1]} LP
                        </span>
                        <div className="flex flex-row gap-3">
                          <button
                            className="w-44 h-8 rounded-full border border-primary text-primary hover:bg-primary hover:bg-opacity-20 text-sm mobile:text-sm"
                            onClick={handleWithdrawV1}
                          >
                            Withdraw LP (V1)
                          </button>
                        </div>
                      </> 
                    ) : (
                      <>
                        <span className="font-bold mobile:text-sm">
                          Deposit {LP_PAIRS[userChain][activePair].pair[0]}-
                          {LP_PAIRS[userChain][activePair].pair[1]} LP
                        </span>
                        <div className="flex flex-row gap-3">
                          {lpAllowances[index].length > 3 ?
                          ( 
                            <button
                              //className="w-40 h-8 rounded-full bg-primary hover:bg-opacity-70 text-sm mobile:text-sm text-white"
                              className="w-40 h-8 rounded-full bg-grayBackground hover:bg-opacity-70 text-sm mobile:text-sm text-black"
                              //onClick={() => setDepositLPModal(true)}
                            >
                              Deposit LP
                            </button>
                          ) : 
                          (
                            <button
                              className="w-40 h-8 rounded-full bg-primary hover:bg-opacity-70 text-sm mobile:text-sm text-white"
                              onClick={handleApprove}

                            >
                              Approve LP
                            </button>
                          )}
                          <button
                            className="w-44 h-8 rounded-full mobile:leading-3 border border-primary text-primary hover:bg-primary hover:bg-opacity-20 text-sm mobile:text-sm"
                            onClick={() => setWithdrawLPModal(true)}
                          >
                            Withdraw LP(Unwrap)
                          </button>
                        </div>
                        <div className="flex flex-row gap-3">
                          <button
                            className="w-48 h-8 rounded-full bg-primary hover:bg-opacity-70 text-sm mobile:text-sm text-white"
                            //className="w-48 h-8 rounded-full bg-grayBackground hover:bg-opacity-70 text-sm mobile:text-sm text-black"
                            onClick={handleMigrate}
                            
                          >
                            Migrate LP to V2
                          </button>
                          <button
                            className="w-44 h-8 rounded-full mobile:leading-3 border border-primary text-primary hover:bg-primary hover:bg-opacity-20 text-sm mobile:text-sm"
                            onClick={() => setWithdrawLP_WrapModal(true)}
                            disabled
                          >
                            Withdraw LP(wrap)
                          </button>
                        </div>
                        <div className="flex flex-row gap-3">
                          <button
                            className="w-48 h-8 rounded-full bg-primary hover:bg-opacity-70 text-sm mobile:text-sm text-white mobile:w-40"
                            onClick={handleClaimV1Rewards}
                          >
                            Claim V1 Rewards
                          </button>
                        </div>
                      </>
                    )}
                      {/* Deposit LP Modal */}
                      <div
                        className={`${
                          depositLPModal ? 'flex flex-col' : 'hidden'
                        } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
                      >
                        <div
                          className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40"
                          onClick={() => setDepositLPModal(false)}
                        />
                        <div className="w-1/3 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-lg shadow-lg bg-white text-black">
                          <span className="text-xl font-semibold text-black bg-gray-200 py-3 pl-6">
                            Stake LP tokens
                          </span>
                          <div className="px-6 pt-4 pb-4 flex flex-col">
                            <span className="text-lg font-semibold">
                              Balance: {formatNumber(lpBalancesWallet[index], 2)}{' '}
                              {//LP_PAIRS[userChain][activePair].pair[1]
                              }
                            </span>
                            <span className="text-sm font-medium">
                              {LP_PAIRS[userChain][activePair].pair[0]}-
                              {LP_PAIRS[userChain][activePair].pair[1]} LP
                            </span>
                            <InputBackgroundColor
                              value={depositLPAmount}
                              onChange={(v) => setDepositLPAmount(v)}
                              className="mt-3 mb-3 dark:text-black bg-grayBackground"
                            />
                            <InputRange
                              maxValue={100}
                              minValue={0}
                              value={depositLPPercentage}
                              onChange={(value) =>
                                setDepositLPPercentage(value as number)
                              }
                            />
                            <div className="grid grid-cols-4 gap-2 w-full mt-6 text-sm">
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setDepositLPPercentage(25)}
                              >
                                25%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setDepositLPPercentage(50)}
                              >
                                50%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setDepositLPPercentage(75)}
                              >
                                75%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setDepositLPPercentage(100)}
                              >
                                MAX
                              </button>
                            </div>
                            <div className="mt-6 flex flex-row gap-4">
                              <Button
                                className=" w-full rounded-full"
                                onClick={() => setDepositLPModal(false)}
                                variant="secondary"
                              >
                                Cancel
                              </Button>
                              <Button
                                className=" w-full rounded-full"
                                onClick={handleDepositLP}
                                variant="primary"
                              >
                                Confirm
                              </Button>
                            </div>
                          </div>
                          <div
                            className={'flex flex-col mobile:flex-col pb-4 px-3 font-semibold text-primary justify-center'}
                            >
                              <a
                                href={'/exchange'}
                                className = "flex flex-row items-center justify-center"
                              >
                                <p className = "mr-2">Get {lpPair.pair[0]}-{lpPair.pair[1]} LP </p>
                                
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.833374 9.16667L9.16671 0.833336M9.16671 0.833336H0.833374M9.16671 0.833336V9.16667" stroke="#00B7FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </a>
                          </div>
                        </div>
                      </div>
                      {/* Success Modal */}

                      <div
                        className={`${
                          depositLPSuccessModal ? 'flex flex-col' : 'hidden'
                        } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
                      >
                        <div
                          className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40"
                          onClick={() => setDepositLPSuccessModal(false)}
                        />
                        <div className="w-1/4 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-lg shadow-lg bg-white text-black">
                          <span className="text-xl font-semibold text-black bg-gray-200 py-3 pl-8">
                            Success:
                          </span>
                          <div className="flex flex-col items-ceter gap-2 p-6">
                            <div className="flex justify-center">
                              <SVG_SUCCESS />
                            </div>
                            <span className="flex justify-center text-2xl font-bold">
                              Transaction Submitted
                            </span>
                            <div className="text-center">
                              <a
                                href={
                                  transactionHash
                                    ? `${EXPLORERS[web3ChainId]}/tx/${transactionHash}`
                                    : '#'
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary font-bold"
                              >
                                View on {CHAINS[userChain].explorer}
                              </a>
                            </div>
                            <Button
                              className="mt-6 w-full rounded-full"
                              onClick={() => {
                                setDepositLPSuccessModal(false);
                              }}
                              variant="primary"
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Withdraw LP Modal */}
                      <div
                        className={`${
                          withdrawLPModal ? 'flex flex-col' : 'hidden'
                        } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
                      >
                        <div
                          className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40"
                          onClick={() => setWithdrawLPModal(false)}
                        />
                        <div className="w-1/3 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-lg shadow-lg bg-white text-black">
                          <span className="text-xl font-semibold text-black bg-gray-200 py-3 pl-8">
                            Unstake LP(Unwrap) tokens
                          </span>
                          <div className="px-6 pt-4 pb-4 flex flex-col">
                            <span className="text-lg font-semibold">
                              Balance: {formatNumber(lpBalances[index], 2)}{' '}
                              
                            </span>
                            <span className="text-sm font-medium">
                              {LP_PAIRS[userChain][activePair].pair[0]}-
                              {LP_PAIRS[userChain][activePair].pair[1]}
                            </span>
                            <Input
                              value={withdrawAmount}
                              onChange={(v) => setWithdrawAmount(v)}
                              className="mt-3 mb-3 dark:text-black"
                            />
                            <InputRange
                              maxValue={100}
                              minValue={0}
                              value={withdrawPercentage}
                              onChange={(value) =>
                                setWithdrawPercentage(value as number)
                              }
                            />
                            <div className="grid grid-cols-4 gap-2 w-full mt-6 text-sm">
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(25)}
                              >
                                25%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(50)}
                              >
                                50%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(75)}
                              >
                                75%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(100)}
                              >
                                MAX
                              </button>
                            </div>
                            <div className="mt-6 flex flex-row gap-4">
                              <Button
                                className=" w-full rounded-full"
                                onClick={() => setWithdrawLPModal(false)}
                                variant="secondary"
                              >
                                Cancel
                              </Button>
                              <Button
                                className=" w-full rounded-full"
                                onClick={handleWithdraw}
                                variant="primary"
                              >
                                Confirm
                              </Button>
                            </div>
                            {/*userChain === 'AVAX' && (
                              <Button
                                className="mt-6 w-full"
                                onClick={handleEmergencyWithdraw}
                                variant="secondary"
                              >
                                Emergency Withdraw{' '}
                                {`${LP_PAIRS[userChain][activePair].pair[0]}-${LP_PAIRS[userChain][activePair].pair[1]}`}{' '}
                                LP
                                <br />
                                (From Old Contract)
                              </Button>
                            )*/}
                          </div>
                        </div>
                      </div>
                      {/* Withdraw LP V1 Modal */}
                      <div
                        className={`${
                          withdrawLPV1Modal ? 'flex flex-col' : 'hidden'
                        } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
                      >
                        <div
                          className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40"
                          onClick={() => setWithdrawLPV1Modal(false)}
                        />
                        <div className="w-1/3 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-lg shadow-lg bg-white text-black">
                          <span className="text-xl font-semibold text-black bg-gray-200 py-3 pl-8">
                            Unstake LP(V1) tokens
                          </span>
                          <div className="px-6 pt-4 pb-4 flex flex-col">
                            <span className="text-lg font-semibold">
                              Balance: {formatNumber(lpBalances[index], 2)}{' '}
                              
                            </span>
                            <span className="text-sm font-medium">
                              {LP_PAIRS[userChain][activePair].pair[0]}-
                              {LP_PAIRS[userChain][activePair].pair[1]}
                            </span>
                            <Input
                              value={withdrawAmount}
                              onChange={(v) => setWithdrawAmount(v)}
                              className="mt-3 mb-3 dark:text-black"
                            />
                            <InputRange
                              maxValue={100}
                              minValue={0}
                              value={withdrawPercentage}
                              onChange={(value) =>
                                setWithdrawPercentage(value as number)
                              }
                            />
                            <div className="grid grid-cols-4 gap-2 w-full mt-6 text-sm">
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(25)}
                              >
                                25%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(50)}
                              >
                                50%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(75)}
                              >
                                75%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(100)}
                              >
                                MAX
                              </button>
                            </div>
                            <div className="mt-6 flex flex-row gap-4">
                              <Button
                                className=" w-full rounded-full"
                                onClick={() => setWithdrawLPV1Modal(false)}
                                variant="secondary"
                              >
                                Cancel
                              </Button>
                              <Button
                                className=" w-full rounded-full"
                                onClick={handleWithdrawV1}
                                variant="primary"
                              >
                                Confirm
                              </Button>
                            </div>
                            {/*userChain === 'AVAX' && (
                              <Button
                                className="mt-6 w-full"
                                onClick={handleEmergencyWithdraw}
                                variant="secondary"
                              >
                                Emergency Withdraw{' '}
                                {`${LP_PAIRS[userChain][activePair].pair[0]}-${LP_PAIRS[userChain][activePair].pair[1]}`}{' '}
                                LP
                                <br />
                                (From Old Contract)
                              </Button>
                            )*/}
                          </div>
                        </div>
                      </div>
                      {/* Withdraw LP Wrap Modal */}
                      <div
                        className={`${
                          withdrawLP_WrapModal ? 'flex flex-col' : 'hidden'
                        } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
                      >
                        <div
                          className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40"
                          onClick={() => setWithdrawLP_WrapModal(false)}
                        />
                        <div className="w-1/3 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-lg shadow-lg bg-white text-black">
                          <span className="text-xl font-semibold text-black bg-gray-200 py-3 pl-8">
                            Unstake LP(Wrap) tokens
                          </span>
                          <div className="px-6 pt-4 pb-4 flex flex-col">
                            <span className="text-lg font-semibold">
                              Balance: {formatNumber(lpBalances[index], 2)}{' '}
                              {LP_PAIRS[userChain][activePair].pair[1]}
                            </span>
                            <span className="text-sm font-medium">
                              {LP_PAIRS[userChain][activePair].pair[0]}-
                              {LP_PAIRS[userChain][activePair].pair[1]}
                            </span>
                            <Input
                              value={withdrawAmount}
                              onChange={(v) => setWithdrawAmount(v)}
                              className="mt-3 mb-3 dark:text-black"
                            />
                            <InputRange
                              maxValue={100}
                              minValue={0}
                              value={withdrawPercentage}
                              onChange={(value) =>
                                setWithdrawPercentage(value as number)
                              }
                            />
                            <div className="grid grid-cols-4 gap-2 w-full mt-6 text-sm">
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(25)}
                              >
                                25%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(50)}
                              >
                                50%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(75)}
                              >
                                75%
                              </button>
                              <button
                                className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                onClick={() => setWithdrawPercentage(100)}
                              >
                                MAX
                              </button>
                            </div>
                            <div className="mt-6 flex flex-row gap-4">
                              <Button
                                className=" w-full rounded-full"
                                onClick={() => setWithdrawLP_WrapModal(false)}
                                variant="secondary"
                              >
                                Cancel
                              </Button>
                              <Button
                                className=" w-full rounded-full"
                                onClick={handleWithdrawLP}
                                variant="primary"
                              >
                                Confirm
                              </Button>
                            </div>
                            {/*
                            userChain === 'AVAX' && (
                              <Button
                                className="mt-6 w-full"
                                onClick={handleEmergencyWithdraw}
                                variant="secondary"
                              >
                                Emergency Withdraw{' '}
                                {`${LP_PAIRS[userChain][activePair].pair[0]}-${LP_PAIRS[userChain][activePair].pair[1]}`}{' '}
                                LP
                                <br />
                                (From Old Contract)
                              </Button>
                            )
                            */}
                          </div>
                        </div>
                      </div>
                    </div>
                    {((index >= 2 && index <= 4) && userChain === 'BSC') || ((index >= 2 && index <= 4) && userChain === 'POLY') || ((index >= 2 && index <= 4) && userChain === 'AVAX')  ? (
                      <div className="px-14 w-full">
                        <p className="text-xl">
                          Deposits on this farm are disabled. If you currently
                          have LPs, please withdraw them immediately.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="p-6 flex flex-col gap-3 rounded-2xl border-2 border-gray-200 w-full">
                          <span className="font-bold mobile:text-sm">
                            Deposit {LP_PAIRS[userChain][activePair].pair[1]}{' '}
                            (Single-Asset)
                          </span>
                          <div className="flex flex-row gap-3">
                            <button
                             // className="w-40 h-8 rounded-full bg-primary hover:bg-opacity-70 text-sm mobile:text-sm text-white"
                              className="w-40 h-8 rounded-full bg-grayBackground hover:bg-opacity-70 text-sm mobile:text-sm text-black"
                              //onClick={() => setSingleAssetModal(true)}
                            >
                              Deposit {LP_PAIRS[userChain][activePair].pair[1]}
                            </button>
                          </div>
                        </div>
                        <div
                          className={`${
                            singleAssetModal ? 'flex flex-col' : 'hidden'
                          } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
                        >
                          <div
                            className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40"
                            onClick={() => setSingleAssetModal(false)}
                          />
                          <div className="w-1/3 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-lg shadow-lg bg-white text-black">
                            <span className="text-xl font-semibold text-black bg-gray-100 py-3 px-8">
                              Deposit {LP_PAIRS[userChain][activePair].pair[1]}
                            </span>
                            <div className="px-6 pb-4 flex flex-col">
                              <span className="text-base font-semibold pt-3">
                                Balance: {formatNumber(tokenBalance)}{' '}
                                {LP_PAIRS[userChain][activePair].pair[1]}
                              </span>
                              <span className="text-sm font-semibold">
                                ~{' '}
                                {formatNumber(
                                  parseInt(tokenBalance) *
                                    lunarState[
                                      LP_PAIRS[userChain][activePair].pair[1]
                                    ]
                                )}{' '}
                                USD
                              </span>
                              <input
                                className={`px-3 py-2 bg-gray-300 text-base leading-6 rounded-lg w-full mt-3 dark:text-black bg-grayBackground`}
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                              />
                              <p className="py-1 text-center text-xs font-medium">
                                Example: 1{' '}
                                {LP_PAIRS[userChain][activePair].pair[1]} = 50%{' '}
                                {LP_PAIRS[userChain][activePair].pair[1]} & 50%{' '}
                                {LP_PAIRS[userChain][activePair].pair[0]}
                              </p>
                              <InputRange
                                maxValue={100}
                                minValue={0}
                                value={depositPercentage}
                                step={5}
                                onChange={(value) => {
                                  setDepositPercentage(value as number);
                                }}
                              />
                              <div className="grid grid-cols-4 gap-2 w-full mt-6">
                                <button
                                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                  onClick={() => setDepositPercentage(25)}
                                >
                                  25%
                                </button>
                                <button
                                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                  onClick={() => setDepositPercentage(50)}
                                >
                                  50%
                                </button>
                                <button
                                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                  onClick={() => setDepositPercentage(75)}
                                >
                                  75%
                                </button>
                                <button
                                  className="py-2 rounded bg-grayBackground hover:bg-primary text-gray-800 font-semibold"
                                  onClick={() => setDepositPercentage(100)}
                                >
                                  MAX
                                </button>
                              </div>
                              <div className="text-sm font-semibold mt-3 flex">
                                Slippage Tolerance
                                <div className="mt-0.5 ml-1 cursor-pointer tooltip relative">
                                  <SVG_TOOLTIP />
                                  <div className="tooltip-body">
                                    Setting a high slippage tolerance can help
                                    transactions succeed, but you may not get such
                                    a good price. Use with caution.
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-2 w-full mt-2">
                                <button
                                  className={`py-2 rounded ${
                                    slippage === 5
                                      ? 'bg-primary'
                                      : 'bg-grayBackground'
                                  } hover:bg-primary text-gray-800 font-semibold`}
                                  onClick={() => setSlippage(5)}
                                >
                                  0.5%
                                </button>
                                <button
                                  className={`py-2 rounded ${
                                    slippage === 10
                                      ? 'bg-primary'
                                      : 'bg-grayBackground'
                                  } hover:bg-primary text-gray-800 font-semibold`}
                                  onClick={() => setSlippage(10)}
                                >
                                  1%
                                </button>
                                <button
                                  className={`py-2 rounded ${
                                    slippage === 15
                                      ? 'bg-primary'
                                      : 'bg-grayBackground'
                                  } hover:bg-primary text-gray-800 font-semibold`}
                                  onClick={() => setSlippage(15)}
                                >
                                  1.5%
                                </button>
                                <button
                                  className={`py-2 rounded ${
                                    slippage === 20
                                      ? 'bg-primary'
                                      : 'bg-grayBackground'
                                  } hover:bg-primary text-gray-800 font-semibold`}
                                  onClick={() => setSlippage(20)}
                                >
                                  2%
                                </button>
                              </div>
                              <div className="flex flex row gap-4 mt-3">
                                <Button
                                  className="text-base w-full rounded-full border border-primary text-primary"
                                  onClick={() => setSingleAssetModal(false)}
                                >
                                  Close
                                </Button>
                                <Button
                                  className="text-base w-full rounded-full"
                                  onClick={handleDeposit}
                                  variant="primary"
                                >
                                  Create LP
                                </Button>
                              </div>
                              <p className="mt-2 text-center text-sm font-medium">
                                When you deposit{' '}
                                {LP_PAIRS[userChain][activePair].pair[1]}, half
                                will be converted into the accompanying LP pair
                                token. This LP will then be deposited.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col gap-3 rounded-2xl border-2 border-gray-200 w-full">
                      <span className="font-bold mobile:text-sm">
                        Harvest Rewards
                      </span>
                      <div className="flex flex-row gap-3">
                        <button
                          className={`${
                            Math.floor(Date.now() / 1000) > nextClaimTimes[index]
                              ? 'bg-primary hover:bg-opacity-70 '
                              : 'bg-gray-400'
                          } w-40 h-8 rounded-full text-sm mobile:text-sm text-white`}
                          onClick={() => harvestReward(activePair)}
                          disabled={
                            Math.floor(Date.now() / 1000) < nextClaimTimes[index]
                          }
                        >
                          Harvest Rewards
                        </button>
                      </div>
                      <div
                        className={`${
                          harvestModal ? 'flex flex-col' : 'hidden'
                        } items-center fixed right-0 top-0 w-full h-full z-40 mt-10 mobile:mt-4`}
                      >
                        <div
                          className="fixed justify-center top-0 left-0 h-full w-full bg-black opacity-40"
                          onClick={() => setHarvestModal(false)}
                        />
                        <div className="w-1/4 mobile:w-11/12 flex flex-col relative overflow-hidden rounded-lg shadow-lg bg-white text-black">
                          <span className="text-xl font-semibold text-black bg-gray-200 py-3 pl-8">
                            Success:
                          </span>
                          <div className="flex flex-col items-ceter gap-2 p-6">
                            <div className="flex justify-center">
                              <SVG_SUCCESS />
                            </div>
                            <span className="flex justify-center text-2xl font-bold">
                              Rewards Harvested
                            </span>
                            <span className="text-sm text-center">
                              It will be 7 days until you can harvest your rewards
                              again.
                            </span>
                            <Button
                              className="mt-6 w-full rounded-full"
                              onClick={() => {
                                setHarvestModal(false);
                              }}
                              variant="primary"
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                      </>
                    )}
                    
                  </div>
                  {((index >= 2 && index <= 4) && userChain === 'BSC') || ((index >= 2 && index <= 4) && userChain === 'POLY') || ((index >= 2 && index <= 4) && userChain === 'AVAX')  ? (
                      <></>
                    ) : (
                      <div
                      className={'flex flex-col mobile:flex-col pb-4 px-3 font-semibold text-primary'}
                        >
                          <a
                            href={'/exchange'}
                            className = "flex flex-row items-center"
                          >
                            <p className = "mr-2">Get {lpPair.pair[0]}-{lpPair.pair[1]} LP </p>
                            
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.833374 9.16667L9.16671 0.833336M9.16671 0.833336H0.833374M9.16671 0.833336V9.16667" stroke="#00B7FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                      </div>
                    )}
                </>
              )}
            </div>
          ))}
      </div>
      {isCreatePoolModalOpen && (
        <CreatePoolModal
          isOpen={isCreatePoolModalOpen}
          hide={hideCreatePoolModal}
          activePair={activePair}
          depositAmount={depositAmount}
          slippage={slippage}
          activeLpBalance={lpBalances[activePair]}
          setActiveLpBalance={setActiveLpBalance}
          symbol={LP_PAIRS[userChain][activePair].pair[1]}
        />
      )}
    </PageContainer>
    </>
    
  );
}
