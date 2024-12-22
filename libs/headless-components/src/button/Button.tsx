import { type ReactNode, useRef } from 'react';

import {
  m,
  animate,
  useMotionValue,
  type AnimationPlaybackControls,
} from 'framer-motion';

import {
  useHover,
  useButton,
  mergeProps,
  useFocusRing,
  type AriaButtonOptions,
} from 'react-aria';

import { twMerge } from 'tailwind-merge';

type BaseButtonProps = AriaButtonOptions<'button'> & {
  children: ReactNode;
  focusClasses?: string;
  pressClasses?: string;
  buttonClasses?: string;
};

const BaseButton: React.FC<BaseButtonProps> = ({
  children,
  pressClasses,
  focusClasses,
  buttonClasses,
  ...ariaProps
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const pressIndicatorOpacity = useMotionValue(0);

  const currentAnimation = useRef<AnimationPlaybackControls>();

  const { buttonProps } = useButton(
    {
      ...ariaProps,
      onPressStart: (e) => {
        if (!ariaProps.isDisabled) {
          if (currentAnimation.current) {
            currentAnimation.current.stop();
          }
          pressIndicatorOpacity.set(1);
        }
        typeof ariaProps.onPressStart === 'function' &&
          ariaProps.onPressStart(e);
      },
      onPressEnd: (e) => {
        if (!ariaProps.isDisabled) {
          currentAnimation.current = animate(pressIndicatorOpacity, 0, {
            duration: 0.3,
            ease: 'easeInOut',
          });
        }
        typeof ariaProps.onPressEnd === 'function' && ariaProps.onPressEnd(e);
      },
    },
    buttonRef,
  );

  const { hoverProps, isHovered } = useHover({
    isDisabled: ariaProps.isDisabled,
  });

  const { isFocusVisible, focusProps } = useFocusRing({
    autoFocus: false,
    isTextInput: false,
  });

  return (
    <button
      ref={buttonRef}
      data-hovered={isHovered}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      className={twMerge(
        'tap-highlight-transparent relative touch-none select-none overflow-hidden focus:outline-none',
        buttonClasses,
        isFocusVisible ? focusClasses : '',
      )}
    >
      {children}
      {/* Press indicator */}
      <m.div
        data-testid="press-indicator"
        style={{ opacity: pressIndicatorOpacity }}
        className={twMerge(
          'absolute inset-0 h-full w-full touch-none select-none',
          pressClasses,
        )}
      />
    </button>
  );
};

export default BaseButton;
