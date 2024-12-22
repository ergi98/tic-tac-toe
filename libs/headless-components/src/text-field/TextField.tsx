import React, { useRef } from 'react';
import {
  mergeProps,
  useFocusRing,
  useTextField,
  type AriaTextFieldOptions,
} from 'react-aria';

import { m, AnimatePresence } from 'framer-motion';

import { twMerge } from 'tailwind-merge';

type BaseTextFieldProps = AriaTextFieldOptions<'input'> & {
  inputClasses?: string;
  labelClasses?: string;
  focusClasses?: string;
  errorMessage?: string;
  containerClasses?: string;
  descriptionClasses?: string;
};

const BaseTextField: React.FC<BaseTextFieldProps> = ({
  focusClasses,
  inputClasses,
  labelClasses,
  containerClasses,
  descriptionClasses,
  ...ariaProps
}) => {
  const textFieldRef = useRef<HTMLInputElement | null>(null);

  const isInputInvalid = !!ariaProps.errorMessage;

  const {
    isInvalid,
    inputProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
  } = useTextField({ ...ariaProps, isInvalid: isInputInvalid }, textFieldRef);

  const { isFocusVisible, focusProps } = useFocusRing({
    autoFocus: false,
    isTextInput: true,
  });

  return (
    <m.div layout className={twMerge('rounded-lg', containerClasses)}>
      <label
        {...labelProps}
        className={twMerge(
          'block touch-none select-none pb-1 pl-1 text-xs',
          labelClasses,
        )}
      >
        {ariaProps.label}
      </label>
      <input
        ref={textFieldRef}
        {...mergeProps(inputProps, focusProps)}
        className={twMerge(
          'w-full rounded-lg border border-stone-700 bg-stone-900 p-3 text-xs placeholder:text-stone-600 focus:outline-none',
          inputClasses,
          isFocusVisible ? focusClasses : '',
        )}
      />
      {ariaProps.description && (
        <div
          {...descriptionProps}
          className={twMerge(
            'block touch-none select-none pb-1 pl-1 pt-1 text-[0.7rem] text-stone-400',
            descriptionClasses,
          )}
        >
          {ariaProps.description}
        </div>
      )}
      <AnimatePresence>
        {isInvalid && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.25 },
                opacity: { duration: 0.15 + 0.25, delay: 0.25 },
                ease: 'easeIn',
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.25 + 0.15, delay: 0.15 },
                opacity: { duration: 0.15 },
                ease: 'easeOut',
              },
            }}
            className="text-[0.7rem] text-red-600"
          >
            <div {...errorMessageProps} className="pl-2 pt-2">
              {ariaProps.errorMessage}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

export default BaseTextField;
