import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, disabled, ...props }: Props) {
  return (
    <button
      className={classNames(
        'rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all',
        'hover:bg-gray-200 active:bg-gray-300',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
