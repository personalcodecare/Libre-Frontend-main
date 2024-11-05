/* eslint-disable @next/next/no-img-element */
import { ethers } from 'ethers';
import { useState, Fragment, useRef, useEffect } from 'react';
import Web3 from 'web3';
import { Bep20ABI } from '../../../constants/abis/bep20';
import { useWeb3Facade, useLiquidityFacade } from 'state';

type ImportModal = {
  showImportModal: boolean;
  setShowImportModal: any;
};
interface EToken {
  name: string;
  symbol: string;
  chainId: any;
  decimal: number;
  logoURI: string;
  address: string;
}

const logoURI =
  'https://img.icons8.com/external-bearicons-glyph-bearicons/64/000000/external-question-call-to-action-bearicons-glyph-bearicons.png';
const ImportModal: React.FC<ImportModal> = ({
  showImportModal,
  setShowImportModal,
}) => {
  const { web3, chainId: web3ChainId } = useWeb3Facade();
  const { liquidityState, addLiquidityToken } = useLiquidityFacade();
  const { tokens: tokenList } = liquidityState;

  const [searchAddress, setsearchAddress] = useState<string>();
  const [token, setToken] = useState<EToken>();

  async function getTokenInfo(tokenAddress: string) {
    try {
      const tokenInst = await new web3.eth.Contract(Bep20ABI, tokenAddress);
      const tokenDecimal = await tokenInst.methods.decimals().call();
      const tokenName = await tokenInst.methods.name().call();
      const tokenSymbol = await tokenInst.methods.symbol().call();
      const chainId = web3ChainId;
      const tempToken = {
        name: tokenName,
        symbol: tokenSymbol,
        address: tokenAddress,
        chainId: chainId,
        decimal: tokenDecimal,
        logoURI: logoURI,
      };
      setToken(tempToken);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (searchAddress) getTokenInfo(searchAddress);
  }, [searchAddress]);

  useEffect(() => {
    if (!showImportModal) setsearchAddress('');
  }, [showImportModal]);

  return (
    <>
      {showImportModal ? (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full text-black modal-active">
          <div
            className="absolute w-full h-full bg-gray-900 opacity-50 modal-overlay"
            onClick={() => setShowImportModal(false)}
          ></div>

          <div className="z-50 mx-auto overflow-y-auto bg-white rounded shadow-lg w-96 modal-container md:max-w-md">
            <div className="relative px-6 py-4 text-left h-80 modal-content">
              <div
                onClick={() => {
                  setShowImportModal(false);
                }}
                className="absolute top-0 right-0 z-50 flex flex-col items-center mt-4 mr-4 text-sm text-black cursor-pointer "
              >
                <svg
                  className="fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                >
                  <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                </svg>
              </div>
              <h2 className="mb-4 text-xl font-bold text-center">
                Import Tokens By Address
              </h2>
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-3 mb-3 border rounded-lg focus:outline-none"
                onChange={(e) => {
                  setsearchAddress(e.target.value);
                }}
              ></input>
              {token && token.name && (
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    addLiquidityToken(token);
                    setShowImportModal(false);
                  }}
                >
                  <img
                    alt="token"
                    src={token.logoURI}
                    className="w-10 h-10 mr-4"
                  />
                  <p> {token.symbol} </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
export default ImportModal;
