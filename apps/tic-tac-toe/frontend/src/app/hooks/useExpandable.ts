import {
  useRef,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { PressEvent } from 'react-aria';

import { animate, transform, useMotionValue } from 'framer-motion';

interface IExpandableToast {
  maxWidth: number;
  minWidth: number;
  isDisabled?: boolean;
  animationThreshold: number;
  default?: 'collapsed' | 'expanded';
}

export const TOAST_STATE = Object.freeze({
  COLLAPSED: 0,
  EXPANDED: 1,
});

export function useExpandable(props: IExpandableToast) {
  const expandableRef = useRef<HTMLDivElement>(null);

  const transformer = transform(
    [0, props.maxWidth - props.minWidth],
    [TOAST_STATE.EXPANDED, TOAST_STATE.COLLAPSED],
  );

  const expandableState = useMotionValue<number>(
    props.default === 'expanded' ? TOAST_STATE.EXPANDED : TOAST_STATE.COLLAPSED,
  );

  const withIgnoreSwipe = useCallback(
    () =>
      expandableState.get() === TOAST_STATE.COLLAPSED ||
      expandableState.isAnimating() ||
      props.isDisabled,
    [expandableState, props.isDisabled],
  );

  const handlePointerUp = useCallback(() => {
    if (!expandableRef.current || withIgnoreSwipe()) {
      return;
    }
    expandableRef.current.setAttribute('data-move', 'false');
    expandableRef.current.setAttribute('data-x', 'null');
    expandableState.get() >= props.animationThreshold
      ? animate(expandableState, TOAST_STATE.EXPANDED, { duration: 0.3 })
      : animate(expandableState, TOAST_STATE.COLLAPSED, { duration: 0.3 });
  }, [expandableState, withIgnoreSwipe, props.animationThreshold]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement> | PressEvent) => {
      if (!expandableRef.current || withIgnoreSwipe()) {
        return;
      }
      let startingX = 'null';
      if ('clientX' in event) {
        startingX = event.clientX.toString();
      } else {
        startingX = event.target.getBoundingClientRect().x.toString();
      }
      expandableRef.current.setAttribute('data-move', 'true');
      expandableRef.current.setAttribute('data-x', startingX);
    },
    [withIgnoreSwipe],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!expandableRef.current || withIgnoreSwipe()) {
        return;
      }
      const isDragging =
        expandableRef.current.getAttribute('data-move') === 'true';
      const initialX = parseFloat(
        expandableRef.current.getAttribute('data-x') ?? 'null',
      );
      if (!isDragging || isNaN(initialX)) {
        return;
      }
      const delta = Math.min(
        Math.max(event.clientX - initialX, 0),
        props.maxWidth - props.minWidth,
      );
      const transformedDelta = transformer(delta);
      expandableState.set(transformedDelta);
    },
    [
      transformer,
      props.minWidth,
      props.maxWidth,
      withIgnoreSwipe,
      expandableState,
    ],
  );

  useEffect(() => {
    if (props.isDisabled !== true) {
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointermove', handlePointerMove);
    }

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handlePointerUp, handlePointerMove, props.isDisabled]);

  const expand = useCallback(() => {
    if (
      expandableState.get() === TOAST_STATE.COLLAPSED &&
      !expandableState.isAnimating()
    ) {
      animate(expandableState, TOAST_STATE.EXPANDED, { duration: 0.3 });
    }
  }, [expandableState]);

  const collapse = useCallback(() => {
    if (
      expandableState.get() === TOAST_STATE.EXPANDED &&
      !expandableState.isAnimating()
    ) {
      animate(expandableState, TOAST_STATE.COLLAPSED, { duration: 0.3 });
    }
  }, [expandableState]);

  return {
    expand,
    collapse,
    expandableRef,
    expandableState,
    handlePointerUp,
    handlePointerMove,
    handlePointerDown,
  };
}
