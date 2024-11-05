import React, { FC, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

import { SVG_CLOSE } from 'assets/icons';
import styles from './modal.module.css';

type ModalProps = {
  children?: any;
  hide: () => void;
  isOpen: boolean;
  hideClose?: boolean;
  title: string;
};

export const Modal: FC<ModalProps> = ({
  children,
  hide,
  isOpen,
  hideClose = false,
  title,
}) => {
  const modalRoot = document && document.getElementById('modal');

  const handleEscape = useCallback(
    (event) => {
      if (event.keyCode === 27) hide();
    },
    [hide]
  );

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleEscape, false);
    return () => {
      document.removeEventListener('keydown', handleEscape, false);
    };
  }, [handleEscape, isOpen]);

  if (!modalRoot || !isOpen) return null;

  return createPortal(
    <>
      <div className="flex justify-center items-center overflow-hidden fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-60">
        <div
          onClick={hide}
          className="absolute w-full h-full top-0 left-0"
        ></div>
        <div
          className={`${styles.modalContainer} relative w-auto my-6 mx-auto flex flex-col`}
        >
          {/*content*/}
          <div className="shadow-lg relative w-full h-full outline-none focus:outline-none flex-grow flex flex-col">
            {/*header*/}
            <div className="flex items-center justify-between p-5 mobile:p-3 rounded-t-lg bg-gray-200">
              <h3 className="text-lg mobile:text-base font-semibold">
                {title}
              </h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black float-right leading-none font-semibold outline-none focus:outline-none"
                onClick={hide}
              >
                <SVG_CLOSE className="w-5 mobile:w-3 w-5 mobile:h-3" />
              </button>
            </div>
            {/*body*/}
            <div className="relative p-6 mobile:p-3 flex-auto bg-white rounded-b-lg flex-grow">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>,
    modalRoot
  );
};
