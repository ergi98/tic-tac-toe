import { animate, type AnimationSequence } from 'framer-motion';

import type { IPendingSwitchLobbyData } from './types';

const playWinnerAnimation = async (cells: Array<number>) => {
  const backgroundShowSequence = cells.map((index) => {
    return [`div.cell-${index}`, { opacity: 1 }, { at: '<', duration: 0.45 }];
  });
  await animate(backgroundShowSequence as AnimationSequence);
  const backgroundHideSequence = cells.map((index) => {
    return [`div.cell-${index}`, { opacity: 0 }, { at: '<', duration: 0.45 }];
  });
  await animate(backgroundHideSequence as AnimationSequence);
};

const playBoardResetAnimation = async () => {
  await animate([
    ['div.cell-symbol', { scale: 1.3 }, { duration: 0.45 }],
    ['div.cell-symbol', { scale: 0 }, { duration: 0.45 }],
  ]);
};

const playInitialSetupAnimation = async () => {
  await animate([
    // Animate board
    [
      'div.line-y-1',
      { scaleY: [0, 1], x: '-0.15rem' },
      { at: '<', duration: 0.45 },
    ],
    [
      'div.line-y-2',
      { scaleY: [0, 1], x: '0.15rem' },
      { at: '<', duration: 0.45 },
    ],
    'verticals-animated',
    [
      'div.line-x-1',
      { scaleX: [0, 1], y: '-0.15rem' },
      { at: 'verticals-animated', duration: 0.45 },
    ],
    [
      'div.line-x-2',
      { scaleX: [0, 1], y: '0.15rem' },
      { at: 'verticals-animated', duration: 0.45 },
    ],
    'horizontals-animated',
    [
      'div.cell-symbol',
      { scale: [0, 1] },
      { type: 'spring', at: 'horizontals-animated' },
    ],
    // Animate game score
    [
      'div.score-separator',
      { scaleY: [0, 1] },
      { duration: 0.15, at: 'horizontals-animated' },
    ],
    'separator-animated',
    [
      'div.score-plus',
      { x: [4, 0], opacity: [0, 1] },
      { duration: 0.3, at: 'separator-animated' },
    ],
    [
      'div.my-score-plus',
      { x: [-4, 0], opacity: [0, 1] },
      { duration: 0.3, at: 'separator-animated' },
    ],
    'plus-animated',
    [
      'div.score',
      { x: [4, 0], opacity: [0, 1] },
      { duration: 0.3, at: 'plus-animated' },
    ],
    [
      'div.my-score',
      { x: [-4, 0], opacity: [0, 1] },
      { duration: 0.3, at: 'plus-animated' },
    ],
    'score-animated',
    [
      'div.my-player-symbol',
      { x: [-4, 0], opacity: [0, 1] },
      { duration: 0.3, at: 'score-animated' },
    ],
    [
      'div.player-symbol',
      { x: [4, 0], opacity: [0, 1] },
      { duration: 0.3, at: 'score-animated' },
    ],
    'player-symbol-animated',
    [
      'div.connection-status',
      { scale: [0, 1] },
      {
        type: 'spring',
        at: 'player-symbol-animated',
      },
    ],
    [
      'div.turn-indicator',
      { scaleX: [0, 1] },
      {
        type: 'spring',
        at: 'player-symbol-animated',
      },
    ],
    // Animate game footer
    [
      'div.mode-group',
      { scaleX: [0, 1], x: ['50%', 0] },
      {
        scaleX: { duration: 0.3 },
        x: { delay: 0.6 },
        at: 'horizontals-animated',
      },
    ],
    [
      'div.online-btn',
      { scale: [0, 1], x: ['-90%', 0] },
      {
        scaleX: { duration: 0.3 },
        x: { delay: 0.6 },
        at: 'horizontals-animated',
      },
    ],
    'mode-group-animated',
    [
      'div.mode-separator',
      { scaleY: [0, 1] },
      { duration: 0.2, at: 'mode-group-animated' },
    ],
    'mode-separator-animated',
    [
      'div.mode-button',
      { opacity: [0, 1] },
      {
        duration: 0.3,
        at: 'mode-separator-animated',
      },
    ],
    'mode-button-animated',
    [
      'div.mode-icon',
      { scale: [0, 1] },
      {
        duration: 0.3,
        at: 'mode-button-animated',
      },
    ],
    [
      'div.online-btn-icon',
      { scale: [0, 1] },
      { duration: 0.3, at: 'mode-button-animated' },
    ],
    [
      'div.disconnect-btn',
      { scaleX: [0, 1] },
      {
        duration: 0.3,
        at: 'horizontals-animated',
      },
    ],
    'disconnect-btn-animated',
    [
      'div.disconnect-btn-icon',
      { scale: [0, 1] },
      {
        duration: 0.3,
        at: 'disconnect-btn-animated',
      },
    ],
    // Animating turn indicator
    [
      'div.turn-text',
      { opacity: [0, 1] },
      {
        duration: 0.3,
        at: 'horizontals-animated',
      },
    ],
  ]);
};

const playInitiatorRequestAnimation = (
  state: IPendingSwitchLobbyData['status'],
) => {
  let toColor = '#b45309';
  switch (state) {
    case 'pending':
    case 'overtime':
      toColor = '#44403c'; // stone-700
      break;
    case 'timeout':
      toColor = '#b45309'; // amber-700
      break;
    case 'accepted':
      toColor = '#15803d'; // green-700
      break;
    case 'rejected':
      toColor = '#7f1d1d'; // red-900
      break;
  }

  return animate(
    'div.initiator-status-toast',
    { backgroundColor: toColor },
    { duration: 0.45 },
  );
};

export {
  playWinnerAnimation,
  playBoardResetAnimation,
  playInitialSetupAnimation,
  playInitiatorRequestAnimation,
};
