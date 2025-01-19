/* eslint-disable react/display-name */
import React, { forwardRef } from 'react';
import classNames from 'classnames';

import styles from './Container.module.scss';
import { Handle } from '../Item/components/Handle';

type BaseProps = {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  unstyled?: boolean;
  headerClassName?: string;
  onRemove?(): void;
};

type AsButton = BaseProps & {
  as: 'button';
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

type AsDiv = BaseProps & {
  as?: 'div';
  onClick?: never;
  ref?: React.Ref<HTMLDivElement>;
};

export type Props = AsButton | AsDiv;

export const Container = forwardRef(
  (
    {
      as: Tag = 'div',
      children,
      columns = 1,
      handleProps,
      horizontal,
      hover,
      onClick,
      onRemove,
      label,
      placeholder,
      style,
      scrollable,
      shadow,
      unstyled,
      headerClassName,
      ...props
    }: Props,
    ref
  ) => {
    return (
      <Tag
        {...props}
        ref={ref as any}
        style={
          {
            ...style,
            '--columns': columns,
          } as React.CSSProperties
        }
        className={classNames(
          styles.Container,
          unstyled && styles.unstyled,
          horizontal && styles.horizontal,
          hover && styles.hover,
          placeholder && styles.placeholder,
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
        onClick={onClick}
      >
        {label ? (
          <div className={classNames(styles.Header, headerClassName)}>
            {label}

            {handleProps ? <Handle {...handleProps} /> : null}

            {onRemove ? (
              <button
                onClick={onRemove}
                className='rounded p-1 hover:bg-gray-100'
                title='Edit semester'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M12 20h9'></path>
                  <path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'></path>
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
        {children}
      </Tag>
    );
  }
);
