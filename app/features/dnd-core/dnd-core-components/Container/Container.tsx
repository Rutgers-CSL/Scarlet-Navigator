/* eslint-disable react/display-name */
import React, { forwardRef } from 'react';
import classNames from 'classnames';

import styles from './Container.module.scss';

type BaseProps = {
  children: React.ReactNode;
  columns?: number;
  label?: React.ReactNode;
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
          'shadow-base-300 shadow-md',
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
          onRemove ? (
            <button
              onClick={onRemove}
              className={classNames(
                styles.Header,
                headerClassName,
                'group relative w-full cursor-pointer'
              )}
              title='Edit semester'
            >
              <div className='flex w-full items-center justify-between'>
                <div className='flex-grow'>{label}</div>
              </div>
              <div className='bg-base-200 absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 ease-out group-hover:w-full'></div>
            </button>
          ) : (
            <div
              className={classNames(styles.Header, headerClassName, 'w-full')}
            >
              {label}
            </div>
          )
        ) : null}
        {children}
      </Tag>
    );
  }
);
