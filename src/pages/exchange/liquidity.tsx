/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import AddLiquidity from './LiquidityComponents/AddLiquidity';
import { useUserFacade, useWeb3Facade } from 'state';

type Props = {
  tabState: boolean;
  tabFunc: any;
};
const Liquidity: React.FC<Props> = ({ tabState, tabFunc }) => {
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { userState, updateBalance, updateUserInfo } = useUserFacade();
  const {
    address,
    balance,
    chainId: userChainId,
    chain: userChain,
  } = userState;

  const [activeTab, setActiveTab] = useState<boolean>(true);
  return (
    <>
      <div className="relative flex flex-col items-center justify-between w-auto dark:text-white mobile:flex-col mobile:justify-center">
        <div className=" mobile:static mobile:transform-none mobile:mt-6">
          <nav className="flex flex-row my-3 tabs sm:flex-row border border-primary rounded-3xl">
            <button
              type="button"
              onClick={() => tabFunc(true)}
              data-target="panel-1"
              className="block px-6 py-2  tab hover:text-blue-500 focus:outline-none font-semibold text-primary dark:text-white"
            >
              Exchange
            </button>
            <button
              type="button"
              onClick={() => tabFunc(false)}
              data-target="panel-2"
              className="block px-6 py-2 tab active  focus:outline-none font-semibold border border-primary text-white bg-primary rounded-3xl"
            >
              Liquidity
            </button>
          </nav>
        </div>
        <div className="w-auto px-4 py-6 mx-auto bg-white border border-solid h-3/4 rounded-xl dark:bg-secondary dark:text-white xmobile:w-full">
          {/* tabs */}
          {/* <div className="flex justify-center gap-2 mx-10">
            <div className="flex items-center justify-center w-full my-2">
              <button
                type="button"
                className={`w-full block p-2 font-medium  ${
                  activeTab && 'border-primary border-b-2'
                }`}
                onClick={() => {
                  setActiveTab(true);
                }}
              >
                Add Liquidity
              </button>
            </div>
            <div className="flex items-center justify-center w-full my-2">
              <button
                type="button"
                className={`w-full block p-2 font-medium   ${
                  !activeTab && 'border-primary border-b-2'
                }`}
                onClick={() => {
                  setActiveTab(false);
                }}
              >
                Remove Liquidity
              </button>
            </div>
          </div> */}

          {/* tab content */}
          <div className="h-auto">
            <h1 className="font-semibold text-2xl text-center text-black dark:text-white">
              Add Liquidity
            </h1>
            {activeTab && <AddLiquidity />}
          </div>
        </div>
        {activeTab ? (
          <div
            className="p-4 my-3 rounded-lg box-content mobile:w-auto"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              width: '500px',
            }}
          >
            <p className="text-black dark:text-white text-base text-center">
              Liquidity providers <strong>earn 0.2% </strong> of each
              transaction fee on LibreSwap
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
};
export default Liquidity;
