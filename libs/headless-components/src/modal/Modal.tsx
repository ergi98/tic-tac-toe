import React, { useRef, type ReactNode } from 'react';

import type { OverlayTriggerState } from 'react-stately';

import {
  Overlay,
  useModalOverlay,
  type AriaModalOverlayProps,
} from 'react-aria';

import { twMerge } from 'tailwind-merge';

import { m, type Variants } from 'framer-motion';

interface IModal extends AriaModalOverlayProps {
  children: ReactNode;
  overlayClass?: string;
  dialogVariants?: Variants;
  state: OverlayTriggerState;
  backdropVariants?: Variants;
}

const Modal: React.FC<IModal> = ({
  state,
  children,
  dialogVariants,
  backdropVariants,
  ...props
}) => {
  const modalRef = useRef(null);

  const { modalProps, underlayProps } = useModalOverlay(props, state, modalRef);

  return (
    <Overlay>
      <m.div
        inherit
        variants={backdropVariants}
        className={twMerge(
          'overlay-content-padding overlay-content-padding fixed inset-0 z-40 flex items-start justify-center bg-black/50 md:items-center',
          props.overlayClass,
        )}
      >
        <div className="h-full w-full" {...underlayProps}>
          <m.div inherit variants={dialogVariants} className="h-full w-full">
            <div className="h-full w-full" {...modalProps} ref={modalRef}>
              {children}
            </div>
          </m.div>
        </div>
      </m.div>
    </Overlay>
  );
};

export default Modal;
