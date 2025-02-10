import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import useAuxiliaryStore from './stores/useAuxiliaryStore';

interface UseDraggableProps {
  dimensionValueModifier: (delta: number) => number;
  direction?: 'horizontal' | 'vertical';
  key: string;
  defaultValue?: number;
}

interface DragHandleProps {
  className?: string;
  style?: React.CSSProperties;
}

type UseDraggableReturn = {
  DragHandle: React.FC<DragHandleProps>;
  dimensionValue: number;
};

export function useDraggable({
  dimensionValueModifier,
  direction = 'vertical',
  key,
  defaultValue = 0,
}: UseDraggableProps): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef(0);
  const { setPanelDimension, getPanelDimension } = useAuxiliaryStore();

  const dimensionValue = getPanelDimension(key, defaultValue);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const currentPosition =
          direction === 'vertical' ? e.clientY : e.clientX;
        const delta = currentPosition - lastPosition.current;
        const newValue = dimensionValueModifier(delta);

        setPanelDimension(key, newValue);
        lastPosition.current = currentPosition;
      }
    },
    [isDragging, dimensionValueModifier, direction, key, setPanelDimension]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      lastPosition.current = direction === 'vertical' ? e.clientY : e.clientX;
      e.preventDefault(); // Prevent text selection during drag
    },
    [direction]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const DragHandle = memo<DragHandleProps>(({ className = '', style = {} }) => {
    const dragHandleClassName = isDragging
      ? 'bg-blue-400'
      : 'hover:bg-blue-400/50 bg-transparent transition-colors duration-200';

    const cursorClassName =
      direction === 'vertical' ? 'cursor-row-resize' : 'cursor-col-resize';

    const defaultClassName = `${cursorClassName} ${dragHandleClassName}`;
    const combinedClassName = className
      ? `${defaultClassName} ${className}`
      : defaultClassName;

    const defaultStyle =
      direction === 'vertical'
        ? { width: '100%', height: '0.5rem' }
        : { width: '0.5rem', height: '100%' };

    return React.createElement('div', {
      className: combinedClassName,
      style: {
        ...defaultStyle,
        ...style,
      },
      onMouseDown: handleMouseDown,
    });
  });

  DragHandle.displayName = 'DragHandle';

  return {
    DragHandle,
    dimensionValue,
  };
}
