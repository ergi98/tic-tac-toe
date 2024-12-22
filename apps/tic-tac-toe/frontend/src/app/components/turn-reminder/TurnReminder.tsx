import React, { useEffect, useState } from 'react';

import { m, type Variants, AnimatePresence } from 'framer-motion';

// Types
import type { PlayMode } from '../../utils/types';
import type { PlayerSymbol } from '@projects-nx-mono/tic-tac-toe-shared';

interface ITurnReminder {
  playMode: PlayMode;
  mySymbol: PlayerSymbol;
  playingSymbol: PlayerSymbol;
}

export let SHOW_TIMEOUT_DURATION = 15_000;
export const SHOW_TIMEOUT_MAX_DURATION = 30_000;
export const SHOW_TIMEOUT_INCREMENT_AMOUNT = 5_000;

export const HIDE_TIMEOUT_DURATION = 10_000;

let showReminderTimeout: NodeJS.Timeout;
let hideReminderTimeout: NodeJS.Timeout;

const TurnReminder: React.FC<ITurnReminder> = (props) => {
  const [showReminder, setShowReminder] = useState(false);
  useEffect(() => {
    const handlePointerUp = () => {
      // If dismissing the reminder, next time reminder less often
      if (showReminder) {
        SHOW_TIMEOUT_DURATION = Math.min(
          SHOW_TIMEOUT_DURATION + SHOW_TIMEOUT_INCREMENT_AMOUNT,
          SHOW_TIMEOUT_MAX_DURATION,
        );
      }
      setShowReminder(false);
      clearTimeout(hideReminderTimeout);
      clearTimeout(showReminderTimeout);
    };

    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [showReminder]);

  useEffect(() => {
    if (
      props.mySymbol === props.playingSymbol &&
      props.playMode !== 'local-multiplayer'
    ) {
      showReminderTimeout = setTimeout(() => {
        setShowReminder(true);
        clearTimeout(hideReminderTimeout);
        hideReminderTimeout = setTimeout(() => {
          setShowReminder(false);
        }, HIDE_TIMEOUT_DURATION);
      }, SHOW_TIMEOUT_DURATION);
    }

    return () => {
      clearTimeout(showReminderTimeout);
    };
  }, [props.playMode, props.mySymbol, props.playingSymbol]);

  return <ReminderText isVisible={showReminder} />;
};

const containerVariants: Variants = {
  initial: {
    y: -25,
    x: '-50%',
    width: '8px',
    height: '8px',
    borderRadius: '99px',
  },
  animate: {
    y: 0,
    x: '-50%',
    height: '42px',
    width: '145px',
    borderRadius: '0.5rem',
    transition: {
      ease: 'easeInOut',
      when: 'beforeChildren',
      y: { duration: 0.3 },
      width: { delay: 0.3, duration: 0.3 },
      height: { delay: 0.3, duration: 0.3 },
      borderRadius: { delay: 0.3, duration: 0.3 },
    },
  },
  exit: {
    scale: 0,
    width: '8px',
    height: '8px',
    transition: {
      ease: 'easeInOut',
      when: 'afterChildren',
      width: { duration: 0.3 },
      height: { duration: 0.3 },
      scale: { duration: 0.3, delay: 0.3 },
    },
  },
};

const textVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const ReminderText: React.FC<{ isVisible: boolean }> = (props) => {
  return (
    <AnimatePresence>
      {props.isVisible && (
        <m.div
          exit="exit"
          role="dialog"
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="fixed left-1/2 top-8 -translate-x-1/2 rounded-lg bg-green-800 p-3"
        >
          <m.div variants={textVariants} className="text-[0.7rem] uppercase">
            Your turn to play!
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default TurnReminder;
