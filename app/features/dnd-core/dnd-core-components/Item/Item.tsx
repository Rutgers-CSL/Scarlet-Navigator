import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';

import { Handle, Remove } from './components';

import styles from './Item.module.scss';
import useAuxiliaryStore from '@/lib/hooks/stores/useAuxiliaryStore';
import { useSettingsStore } from '@/lib/hooks/stores/useSettingsStore';
import { CourseID, Course } from '@/lib/types/models';
import CoreList from '@/app/components/CoreList';
import { SEARCH_ITEM_DELIMITER } from '@/lib/constants';

export interface Props {
  id: CourseID;
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  showCores?: boolean;
  course?: Course;
  error?: boolean;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLElement>;
    style: React.CSSProperties | undefined;
    transform: Props['transform'];
    transition: Props['transition'];
    value: Props['value'];
  }): React.ReactElement<any>;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        id,
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        showCores = true,
        course,
        error = false,
        ...props
      },
      ref
    ) => {
      const setCurrentInfo = useAuxiliaryStore((state) => state.setCurrentInfo);
      const showGrades = useSettingsStore((state) => state.visuals.showGrades);
      const showCreditCountOnCourseTitles = useSettingsStore(
        useCallback((state) => state.visuals.showCreditCountOnCourseTitles, [])
      );

      const rawID = useMemo(
        () => (id as string).replace(SEARCH_ITEM_DELIMITER, ''),
        [id]
      );

      const isSearchItem = (id as string).endsWith(SEARCH_ITEM_DELIMITER);

      const currentInfoID = useAuxiliaryStore((state) => state.currentInfoID);

      const isActive = useMemo(
        () =>
          currentInfoID === id ||
          (isSearchItem && currentInfoID === rawID) ||
          (!isSearchItem && currentInfoID === `${id}${SEARCH_ITEM_DELIMITER}`),
        [currentInfoID, id, isSearchItem, rawID]
      );

      const cores = useMemo(() => {
        if (!course) return null;
        return <CoreList cores={course.cores} />;
        //eslint-disable-next-line react-hooks/exhaustive-deps
      }, [course?.cores]);

      return (
        <li
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay
          )}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition]
                .filter(Boolean)
                .join(', '),
              '--translate-x': transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              '--translate-y': transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              '--scale-x': transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              '--scale-y': transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              // '--index': index,
              '--color': color,
            } as React.CSSProperties
          }
          ref={ref}
        >
          <div
            className={classNames(
              styles.Item,
              dragging && styles.dragging,
              handle && styles.withHandle,
              dragOverlay && styles.dragOverlay,
              disabled && styles.disabled,
              color && styles.color,
              error && 'border-2 border-red-500',
              'bg-base-200 text-md relative mx-3 my-2 overflow-hidden rounded-md p-3 font-bold'
            )}
            style={style}
            data-cypress='draggable-item'
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
            onClick={() => {
              if (value) setCurrentInfo(id as string, 'course');
            }}
          >
            <div
              className={`bg-neutral absolute bottom-0 left-0 z-10 w-1 rounded-l-sm transition-all duration-300 ease-out ${isActive ? 'h-full' : 'h-0'}`}
            />
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2 text-wrap'>
                <div className='pr-1'>
                  {typeof value === 'string' ? value.toUpperCase() : value}
                  {disabled && (
                    <div className='text-info text-sm'>(Already Saved)</div>
                  )}
                </div>

                {course?.credits && showCreditCountOnCourseTitles && (
                  <div className='text-base-content text-sm'>
                    ({course.credits} cr)
                  </div>
                )}
              </div>

              <div className='text-sm text-gray-500'>{rawID}</div>

              {course?.mainCampus && isSearchItem && (
                <div className='badge bg-red-400 text-xs font-bold text-white'>
                  {course.mainCampus}
                </div>
              )}

              {course?.grade && showGrades && (
                <div className='text-base-content text-sm font-medium'>
                  Grade: {course.grade}
                </div>
              )}

              {showCores && course && course.cores.length > 0 && (
                <div>{cores}</div>
              )}
            </div>
            <span className={styles.Actions}>
              {onRemove ? (
                <Remove className={styles.Remove} onClick={onRemove} />
              ) : null}

              {handle ? <Handle {...handleProps} {...listeners} /> : null}
            </span>
          </div>
        </li>
      );
    }
  )
);
