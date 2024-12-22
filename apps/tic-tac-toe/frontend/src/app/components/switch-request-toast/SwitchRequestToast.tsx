'use client';

import React, {
  memo,
  useMemo,
  useState,
  useEffect,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  m,
  animate,
  useTransform,
  type Variants,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion';

import { tv } from 'tailwind-variants';

import { PressEvent } from 'react-aria';

import {
  REQUEST_DURATION,
  REQUEST_BUFFER_DURATION,
} from '@projects-nx-mono/tic-tac-toe-shared';
import type { IPendingSwitchLobbyData } from '../../utils/types';

// Animations
import { playInitiatorRequestAnimation } from '../../utils/animations';

// Hooks
import { useExpandable } from '../../hooks/useExpandable';

// SVG
import { ReactComponent as CheckSvg } from '../../../assets/check.svg';
import { ReactComponent as CrossSvg } from '../../../assets/cross.svg';

// Components
import { BaseButton, RippleLoader } from '../';

const MIN_WIDTH = 64;
const MAX_WIDTH = Math.min(window.innerWidth - 32, 343);

const transformInput = [0, 1];
const radiusOutput = ['99px', '8px'];
const widthOutput = [`${MIN_WIDTH}px`, `${MAX_WIDTH}px`];

export interface ISwitchRequestToast {
  isOpen: boolean;
  onClose: () => void;
  isInitiator: boolean | null;
  onExtraTimeFinish: () => void;
  onRegularTimeFinish: () => void;
  status: IPendingSwitchLobbyData['status'];
  validUntil: IPendingSwitchLobbyData['validUntil'];
  onRequestDecision: (a: 'accept' | 'reject') => void;
}

const SwitchRequestToast: React.FC<ISwitchRequestToast> = (props) => {
  return (
    <AnimatePresence>
      {props.isOpen ? (
        props.isInitiator ? (
          <SwitchInitiatorToast
            isOpen={props.isOpen}
            status={props.status}
            onClose={props.onClose}
            validUntil={props.validUntil}
            onExtraTimeFinish={props.onExtraTimeFinish}
            onRegularTimeFinish={props.onRegularTimeFinish}
          />
        ) : (
          <SwitchReceiverToast
            status={props.status}
            validUntil={props.validUntil}
            onRequestDecision={props.onRequestDecision}
            onExtraTimeFinish={props.onExtraTimeFinish}
            onRegularTimeFinish={props.onRegularTimeFinish}
          />
        )
      ) : null}
    </AnimatePresence>
  );
};

type ISwitchReceiverToast = Pick<
  ISwitchRequestToast,
  | 'status'
  | 'validUntil'
  | 'onRequestDecision'
  | 'onExtraTimeFinish'
  | 'onRegularTimeFinish'
>;

const SwitchReceiverToast: React.FC<ISwitchReceiverToast> = (props) => {
  const [withDisabledActions, setWithDisabledActions] = useState(false);

  const { handlePointerDown, expandableState, expandableRef } = useExpandable({
    isDisabled: true,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
    default: 'expanded',
    animationThreshold: 0.75,
  });

  const width = useTransform(expandableState, transformInput, widthOutput);
  const radius = useTransform(expandableState, transformInput, radiusOutput);

  const handleRegularTimeFinish = () => {
    setWithDisabledActions(true);
    props.onRegularTimeFinish();
  };

  const handleAcceptClick = () => {
    setWithDisabledActions(true);
    props.onRequestDecision('accept');
  };

  const handleDeclineClick = () => {
    setWithDisabledActions(true);
    props.onRequestDecision('reject');
  };

  return (
    <div
      role="dialog"
      ref={expandableRef}
      onPointerDown={handlePointerDown}
      className="toast-content-padding absolute inset-0 h-fit w-full cursor-grab touch-none select-none"
    >
      <m.div
        style={{ width, borderRadius: radius }}
        className="receiver-status-toast ml-auto h-fit items-center gap-3 overflow-hidden bg-stone-700 p-2"
      >
        <div className="flex gap-4 pb-3">
          <CircleCountdownMemoized
            status={props.status}
            validUntil={props.validUntil}
            onPressStart={handlePointerDown}
            onExtraTimeFinish={props.onExtraTimeFinish}
            onRegularTimeFinish={handleRegularTimeFinish}
          />
          <div className="h-fit flex-grow pt-1 text-xs">
            <h1 className="pb-1 text-[0.7rem] text-xs font-bold uppercase">
              Request to join!
            </h1>
            <h2>
              A player is requesting to join you in a game. Accept request?
            </h2>
          </div>
        </div>
        <div className="items center flex justify-end gap-2">
          <BaseButton
            onPress={handleAcceptClick}
            pressClasses="bg-green-800"
            focusClasses="border-green-800"
            isDisabled={withDisabledActions}
            buttonClasses="rounded-lg border-2 border-transparent p-2 text-xs uppercase tracking-wider transition-colors data-hovered:bg-green-950 bg-stone-800 disabled:opacity-50"
          >
            <div className="relative z-10">Accept</div>
          </BaseButton>
          <BaseButton
            pressClasses="bg-red-500"
            onPress={handleDeclineClick}
            focusClasses="border-red-500"
            isDisabled={withDisabledActions}
            buttonClasses="rounded-lg border-2 border-transparent p-2 text-xs uppercase tracking-wider transition-colors data-hovered:bg-red-700 bg-stone-700 disabled:opacity-50"
          >
            <div className="relative z-10">Reject</div>
          </BaseButton>
        </div>
      </m.div>
    </div>
  );
};

const initiatorContainerVariants: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: {
    y: -10,
    opacity: 0,
    transition: { duration: 0.3, when: 'afterChildren' },
  },
};

const initiatorContentVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, delay: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const getInitiatorTostData = (status: IPendingSwitchLobbyData['status']) => {
  const data = {
    text: 'Waiting for approval to join game',
    description: 'Your friend needs to accept you request.',
  };
  switch (status) {
    case 'pending':
    case 'overtime':
      data.text = 'Waiting for approval';
      data.description = 'Your friend needs to accept you request.';
      break;
    case 'timeout':
      data.text = 'No answer received!';
      data.description = 'Please try sending a request again.';
      break;
    case 'accepted':
      data.text = 'Request accepted!';
      data.description = 'The game will start shortly.';
      break;
    case 'rejected':
      data.text = 'Request rejected!';
      data.description = 'Your friend denied the request.';
      break;
  }
  return { ...data };
};

const initiatorCloseButton = tv({
  slots: {
    buttonClx:
      'rounded-lg border-2 border-transparent p-2 text-xs uppercase tracking-wider transition-colors',
    pressClx: '',
    focusClx: '',
  },
  variants: {
    status: {
      // Not used since button is not shown
      idle: {},
      pending: {},
      overtime: {},
      // All possible states
      timeout: {
        buttonClx: 'data-hovered:bg-amber-950 bg-amber-900',
        pressClx: 'bg-amber-800',
        focusClx: 'border-amber-800',
      },
      accepted: {
        buttonClx: 'data-hovered:bg-green-950 bg-green-900',
        pressClx: 'bg-green-800',
        focusClx: 'border-green-800',
      },
      rejected: {
        buttonClx: 'data-hovered:bg-red-700 bg-red-600',
        pressClx: 'bg-red-500',
        focusClx: 'border-red-500',
      },
    },
  },
});

type ISwitchInitiatorToast = Pick<
  ISwitchRequestToast,
  | 'isOpen'
  | 'status'
  | 'onClose'
  | 'validUntil'
  | 'onExtraTimeFinish'
  | 'onRegularTimeFinish'
>;

const SwitchInitiatorToast: React.FC<ISwitchInitiatorToast> = (props) => {
  const [displayData, setDisplayData] = useState(() =>
    getInitiatorTostData(props.status),
  );

  const hideCloseButton = ['idle', 'pending', 'overtime'].includes(
    props.status,
  );

  const { buttonClx, pressClx, focusClx } = initiatorCloseButton({
    status: props.status,
  });

  const { expand, handlePointerDown, expandableState, expandableRef } =
    useExpandable({
      minWidth: MIN_WIDTH,
      maxWidth: MAX_WIDTH,
      default: 'collapsed',
      animationThreshold: 0.75,
    });

  const width = useTransform(expandableState, transformInput, widthOutput);
  const radius = useTransform(expandableState, transformInput, radiusOutput);

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }
    setDisplayData(getInitiatorTostData(props.status));

    playInitiatorRequestAnimation(props.status).then(() => {
      if (['accepted', 'rejected', 'timeout'].includes(props.status)) {
        expand();
        // Auto close after 2.3s
        setTimeout(props.onClose, 2300);
      }
    });
  }, [expand, props.status, props.isOpen, props.onClose]);

  return (
    <div
      role="dialog"
      ref={expandableRef}
      onPointerDown={handlePointerDown}
      className="toast-content-padding absolute inset-0 h-fit w-full cursor-grab touch-none select-none"
    >
      <m.div
        exit="exit"
        initial="initial"
        animate="animate"
        variants={initiatorContainerVariants}
        style={{ width, borderRadius: radius }}
        className="initiator-status-toast ml-auto h-fit overflow-hidden bg-stone-700"
      >
        <m.div
          variants={initiatorContentVariants}
          className="flex items-center justify-between p-1 pr-2"
        >
          <div className="flex w-full items-center gap-1">
            <CircleCountdownMemoized
              onPress={expand}
              status={props.status}
              validUntil={props.validUntil}
              onPressStart={handlePointerDown}
              onExtraTimeFinish={props.onExtraTimeFinish}
              onRegularTimeFinish={props.onRegularTimeFinish}
            />
            <m.div
              key={props.status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-fit flex-shrink-0 flex-grow pl-2 text-xs"
            >
              <h1>{displayData.text}</h1>
              <h2>{displayData.description}</h2>
            </m.div>
            <AnimatePresence>
              {hideCloseButton ? null : (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <BaseButton
                    aria-label="close"
                    onPress={props.onClose}
                    pressClasses={pressClx()}
                    focusClasses={focusClx()}
                    buttonClasses={buttonClx()}
                  >
                    <div className="relative z-10">Close</div>
                  </BaseButton>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </m.div>
      </m.div>
    </div>
  );
};

type ICircleCountdown = Pick<
  ISwitchRequestToast,
  'onExtraTimeFinish' | 'onRegularTimeFinish' | 'status' | 'validUntil'
> & {
  onPress?: () => void;
  onPressStart?: (
    event: ReactPointerEvent<HTMLDivElement> | PressEvent,
  ) => void;
};

const CircleCountdown: React.FC<ICircleCountdown> = ({
  onExtraTimeFinish,
  onRegularTimeFinish,
  ...props
}) => {
  const DASH_ARRAY = 289;

  const REQUEST_DURATION_IN_S = REQUEST_DURATION / 1_000;

  const countdownState = useMotionValue(REQUEST_DURATION_IN_S);
  const [timeLeft, setTimeLeft] = useState(REQUEST_DURATION_IN_S);

  const dashOffset = useTransform(
    countdownState,
    [0, REQUEST_DURATION_IN_S],
    [DASH_ARRAY, 0],
  );

  useEffect(() => {
    if (props.status !== 'pending') {
      return;
    }

    const validUntil =
      typeof props.validUntil === 'number'
        ? props.validUntil
        : new Date().getTime();
    const now = new Date().getTime();

    const differenceInMS = Math.min(
      Math.max(validUntil - now, 0),
      REQUEST_DURATION,
    );

    const differenceInS = differenceInMS / 1_000;

    const animation = animate(countdownState, [differenceInS, 0], {
      duration: differenceInS,
      ease: 'linear',
    });

    countdownState.on('change', (latest) => {
      const parsed = Math.round(latest);
      setTimeLeft(parsed);

      // When the time has finished wait some extra time before displaying result
      if (latest === 0) {
        onRegularTimeFinish();
        setTimeout(onExtraTimeFinish, REQUEST_BUFFER_DURATION + 1_000);
      }
    });

    return () => {
      if (animation) {
        animation.stop();
      }
      countdownState.clearListeners();
    };
  }, [
    props.status,
    countdownState,
    props.validUntil,
    onExtraTimeFinish,
    onRegularTimeFinish,
  ]);

  const buttonContent = useMemo(() => {
    switch (props.status) {
      case 'pending':
        return timeLeft;
      case 'accepted':
        return <CheckSvg />;
      case 'rejected':
        return <CrossSvg className="scale-75" />;
      case 'overtime':
        return (
          <div className="h-6 w-6">
            <RippleLoader />
          </div>
        );
      case 'timeout':
        return <CrossSvg className="scale-75" />;
    }
  }, [props.status, timeLeft]);

  return (
    <div className="relative">
      <BaseButton
        aria-label="expand"
        onPress={props.onPress}
        onPressStart={props.onPressStart}
        buttonClasses="flex-shrink-0 p-1 rounded-full relative z-10 w-14 aspect-square flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <m.div
            key={props.status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex w-9 items-center justify-center text-center">
              {buttonContent}
            </div>
          </m.div>
        </AnimatePresence>
      </BaseButton>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 touch-none select-none">
        <svg viewBox="0 0 100 100" width="56" height="56">
          <m.circle
            r="46"
            cx="50"
            cy="50"
            fill="none"
            strokeWidth="4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeDashoffset={dashOffset}
            strokeDasharray={DASH_ARRAY + 'px'}
          />
        </svg>
      </div>
    </div>
  );
};

const CircleCountdownMemoized = memo(
  CircleCountdown,
  (prev, next) =>
    prev.validUntil === next.validUntil && prev.status === next.status,
);

export default SwitchRequestToast;
