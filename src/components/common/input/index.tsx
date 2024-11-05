import { ReactNode, FC } from 'react';

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: string;
  placeholder?: string;
};

export const Input: FC<InputProps> = ({
  value,
  onChange,
  className,
  type = '',
  placeholder = '',
}) => {
  return (
    <input
      className={`px-7 py-4 bg-gray-300 text-lg leading-6 rounded-lg w-full ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
    />
  );
};

export const InputBackgroundColor: FC<InputProps> = ({
  value,
  onChange,
  className,
  type = '',
  placeholder = '',
}) => {
  return (
    <input
      className={`px-7 py-4 text-lg leading-6 rounded-lg w-full ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
    />
  );
};
