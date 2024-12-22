'use client';

import React from 'react';

import { useOverlayTrigger, type OverlayTriggerAria } from 'react-aria';
import {
  useOverlayTriggerState,
  type OverlayTriggerState,
} from 'react-stately';

import { m, AnimatePresence, type Variants } from 'framer-motion';

// Components
import { Modal, Dialog, BaseButton } from '../';

interface IOnlinePlayFooter {
  onDisconnect: () => void;
}

const OnlinePlayFooter: React.FC<IOnlinePlayFooter> = (props) => {
  const warningModalState = useOverlayTriggerState({});

  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    warningModalState,
  );

  return (
    <div data-testid="online-player-footer" className="landscape:self-end">
      <m.div
        exit={{ x: '-40%', transition: { duration: 0.3 } }}
        className="disconnect-btn"
      >
        <BaseButton
          {...triggerProps}
          pressClasses="bg-stone-700"
          onPress={warningModalState.open}
          focusClasses="border-stone-500"
          buttonClasses="bg-stone-900 px-4 py-3 rounded-lg data-hovered:bg-stone-800 transition-colors border border-transparent"
        >
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="disconnect-btn-icon relative z-10 text-xs uppercase text-stone-500"
          >
            Disconnect
          </m.div>
        </BaseButton>
      </m.div>
      <WarningModal
        overlayProps={overlayProps}
        onConfirm={props.onDisconnect}
        modalState={warningModalState}
      />
    </div>
  );
};

interface IWarningModal {
  onConfirm: () => void;
  modalState: OverlayTriggerState;
  overlayProps: OverlayTriggerAria['overlayProps'];
}

const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.6, delay: 0.25 } },
};

const warningDialogVariants: Variants = {
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

const warningModalContentVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, delay: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const WarningModal: React.FC<IWarningModal> = (props) => {
  let withConfirm = false;

  const handleConfirmPress = () => {
    withConfirm = true;
    props.modalState.close();
  };

  const handleAnimationComplete = (definition: string) => {
    if (withConfirm && definition === 'exit') {
      props.onConfirm();
    }
    withConfirm = false;
  };

  return (
    <AnimatePresence>
      {props.modalState.isOpen ? (
        <m.div
          initial="initial"
          animate="animate"
          exit="exit"
          onAnimationComplete={handleAnimationComplete}
        >
          <Modal
            state={props.modalState}
            backdropVariants={backdropVariants}
            dialogVariants={warningDialogVariants}
          >
            <Dialog
              title="Leave party"
              titleClass="text-sm"
              {...props.overlayProps}
              titleContainerClass="px-4 py-2"
              onClose={props.modalState.close}
              containerClass="md:max-w-sm mx-auto"
              contentVariants={warningModalContentVariants}
            >
              <div className="px-4 pb-4 pt-2 text-xs">
                <p className="pb-4">
                  Are you sure you want to leave this party?
                  <br />
                  <br />
                  <span className="text-red-600">
                    If you decide to leave all the game progress will be lost.
                  </span>
                </p>
                <BaseButton
                  pressClasses="bg-red-700"
                  onPress={handleConfirmPress}
                  focusClasses="border-red-500"
                  buttonClasses="bg-red-900 px-4 py-3 rounded-lg data-hovered:bg-red-800 transition-colors border border-transparent w-full"
                >
                  <div className="relative z-10 text-center text-xs uppercase">
                    Leave party
                  </div>
                </BaseButton>
              </div>
            </Dialog>
          </Modal>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
};

export default OnlinePlayFooter;
