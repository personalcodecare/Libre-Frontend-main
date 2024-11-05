import { useState, Fragment, useRef, useEffect } from 'react';
import { Input } from 'components';

type InputComponent = {
  amount?: string;
  setAmount?: any;
  onChangeAmount?: (value: string) => void;
  checkAllowance?: any;
  className?: string;
};

const InputComponent: React.FC<InputComponent> = ({
  amount,
  setAmount,
  onChangeAmount,
  checkAllowance,
  className = '',
}) => {
  return (
    <Input
      className={`flex-grow text-base text-black bg-white outline-none ${className}`}
      type="number"
      value={amount}
      onChange={(value) => {
        setAmount(value);
        checkAllowance;
        onChangeAmount(value);
      }}
      placeholder="0.0"
    />
  );
};
export default InputComponent;
