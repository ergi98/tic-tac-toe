import React, { useRef } from 'react';
import { useDialog, type AriaDialogProps } from 'react-aria';

import { m, type Variants } from 'framer-motion';

import { twMerge } from 'tailwind-merge';

// Components
import BaseButton from '../button';

const CrossSvg: React.FC = () => {
  return (
    <svg
      fill="none"
      role="img"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 6 L18 18 M6 18 L18 6" />
    </svg>
  );
};

interface IDialog extends AriaDialogProps {
  titleClass?: string;
  onClose?: () => void;
  title?: React.ReactNode;
  containerClass?: string;
  children: React.ReactNode;
  contentVariants?: Variants;
  titleContainerClass?: string;
}

const Dialog: React.FC<IDialog> = ({
  title,
  onClose,
  children,
  contentVariants,
  ...props
}) => {
  const dialogRef = useRef(null);
  const { dialogProps, titleProps } = useDialog(props, dialogRef);

  return (
    <div
      ref={dialogRef}
      className={twMerge(
        'relative max-h-full w-full overflow-auto rounded-lg bg-stone-900 focus:outline-none focus-visible:outline-none',
        props.containerClass,
      )}
      {...dialogProps}
    >
      <m.div inherit variants={contentVariants}>
        {title ? (
          <div
            data-testid="title-container"
            className={twMerge(
              'sticky top-0 z-20 flex items-center justify-between gap-2 bg-stone-900 px-6 py-4',
              props.titleContainerClass,
            )}
          >
            <h1
              {...titleProps}
              className={twMerge('text-lg tracking-wider', props.titleClass)}
            >
              {title}
            </h1>
            <BaseButton
              onPress={onClose}
              aria-label="close"
              pressClasses="bg-stone-600"
              focusClasses="border-stone-600"
              buttonClasses="bg-stone-800 data-hovered:bg-stone-700 rounded-lg transition-colors p-2 border-2 border-transparent"
            >
              <div className="relative z-10 w-4">{<CrossSvg />}</div>
            </BaseButton>
          </div>
        ) : null}
        {children}
      </m.div>
    </div>
  );
};

export default Dialog;
