/* eslint-disable react/display-name */
import React, { forwardRef } from 'react';
import classNames from 'classnames';

import styles from './Container.module.scss';

type BaseProps = {
  children: React.ReactNode;
  columns?: number;
  label?:
    | React.ReactNode
    | ((props: { isHovered: boolean }) => React.ReactNode);
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
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
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
      isHovered = false,
      onMouseEnter,
      onMouseLeave,
      ...props
    }: Props,
    ref
  ) => {
    return (
      <div
        {...props}
        ref={ref as any}
        style={{ ...style }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {label && (
          <div className={classNames(styles.Header, headerClassName, 'w-full')}>
            {/*
              TODO: THIS IS VERY VERY WEIRD WAY OF DOING IT.
              Works for now, but needs to be refactored.
             */}
            {typeof label === 'function' ? label({ isHovered }) : label}
          </div>
        )}
        {children}
      </div>
    );
  }
);
