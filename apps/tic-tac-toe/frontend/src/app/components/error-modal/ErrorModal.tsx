'use client';

import React, { useMemo } from 'react';

import { useOverlayTrigger } from 'react-aria';
import { type OverlayTriggerState } from 'react-stately';

import { m, AnimatePresence, type Variants } from 'framer-motion';

import { type ISocketKnownError } from '@projects-nx-mono/tic-tac-toe-shared';

import {
  getErrorMessageText,
  getErrorMessageTitle,
} from '../../utils/constants';

// Components
import { Modal, Dialog, BaseButton } from '../';

interface IErrorModal {
  modalState: OverlayTriggerState;
  errorCode: ISocketKnownError | null;
}

const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.6, delay: 0.25 } },
};

const errorDialogVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.45, delay: 0.15 },
  },
};

const errorModalContentVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, delay: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const ErrorModal: React.FC<IErrorModal> = (props) => {
  const { overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    props.modalState,
  );

  const errorMessage = useMemo(
    () => getErrorMessageText(props.errorCode),
    [props.errorCode],
  );

  const errorTitle = useMemo(
    () => getErrorMessageTitle(props.errorCode),
    [props.errorCode],
  );

  return (
    <AnimatePresence>
      {props.modalState.isOpen ? (
        <m.div exit="exit" initial="initial" animate="animate">
          <Modal
            overlayClass="z-50"
            state={props.modalState}
            backdropVariants={backdropVariants}
            dialogVariants={errorDialogVariants}
          >
            <Dialog
              {...overlayProps}
              title={errorTitle}
              titleClass="text-xs uppercase"
              titleContainerClass="px-4 py-2"
              onClose={props.modalState.close}
              containerClass="md:max-w-sm mx-auto"
              contentVariants={errorModalContentVariants}
            >
              <div className="px-4 pb-4 pt-2">
                <p className="text-xs">{errorMessage}</p>
              </div>
              <div className="p-2">
                <BaseButton
                  pressClasses="bg-stone-600"
                  onPress={props.modalState.close}
                  focusClasses="border-neutral-700"
                  buttonClasses="bg-stone-800 w-full data-hovered:bg-stone-700 rounded-lg transition-colors p-2 border border-2 border-transparent"
                >
                  <div className="relative z-10 text-xs uppercase">Close</div>
                </BaseButton>
              </div>
            </Dialog>
          </Modal>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ErrorModal;
