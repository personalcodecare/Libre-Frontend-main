/* eslint-disable @next/next/no-img-element */
import { useState, Fragment, useRef, useEffect } from 'react';
import ImportModal from './ImportModal';
import { useExchangeFacade } from 'state';

type Props = {
  showModal: boolean;
  setShowModal: any;
  token: any;
  setToken: any;
};
const CurrencyModal: React.FC<Props> = ({
  showModal,
  setShowModal,
  token,
  setToken,
}) => {
  // const [listData, setListData] = useState<[]>([])
  const { exchangeState } = useExchangeFacade();
  const { tokens } = exchangeState;

  const [showImport, setShowImport] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  const defaultTokenData = tokens.map(
    ({ name, symbol, logoURI, chainId, decimals, address }) => {
      return (
        <li
          className="flex justify-between border-t border-gray-300 cursor-pointer"
          onClick={() => {
            setShowModal(false);
            setToken({ name, symbol, logoURI, chainId, decimals, address });
          }}
          key={address}
        >
          <div className="flex items-center p-4">
            <img className="mr-4 w-7 h-7" alt={symbol} src={logoURI}></img>{' '}
            {symbol}
          </div>
        </li>
      );
    }
  );

  return (
    <>
      {showModal ? (
        <div className="fixed z-50 flex justify-center w-full h-4/6 modal-active top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/*content*/}
          <div className="flex flex-col bg-white border rounded-lg shadow-lg outline-none w-96 focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between p-5 bg-gray-100 border-b border-solid rounded-t border-blueGray-200">
              <h4 className="text-2xl font-semibold">Select a Token</h4>
              <div
                className="top-0 bg-transparent cursor-pointer"
                onClick={() => {
                  setShowModal(false);
                  setToken(token);
                }}
              >
                <svg
                  className="text-black fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                >
                  <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                </svg>
              </div>
            </div>
            <div className="flex">
              {/*  */}
              <input
                type="text"
                placeholder="Search name or paste address"
                className="w-full p-3 m-3 border border-primary focus:outline-none rounded-3xl"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              ></input>
            </div>
            {/*body*/}
            <div className="overflow-x-hidden bg-white lg:w-1/3">
              <ul className="border-b border-gray-300">
                {/* {searchTerm !='' ?   TokenData : defaultTokenData} */}
                {defaultTokenData}
              </ul>
            </div>
            {/* Import token  modal button */}
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <button
                type="button"
                className="p-2 font-semibold text-white rounded bg-primary"
                onClick={() => {
                  setShowImport(true);
                }}
              >
                Import Tokens
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* import token modal */}
      <ImportModal
        showImportModal={showImport}
        setShowImportModal={setShowImport}
      />
    </>
  );
};
export default CurrencyModal;
