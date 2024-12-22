'use client';

import React, { useMemo, useCallback } from 'react';

import type { PlayMode } from '../../utils/types';
import { MAX_DISPLAY_SCORE } from '../../utils/constants';

import { tv } from 'tailwind-variants';

import { m, AnimatePresence } from 'framer-motion';

// Types
import {
  LOCAL_PLAYER_ID,
  type IPlayerState,
  type PlayerSymbol,
  type IConnectionState,
} from '@projects-nx-mono/tic-tac-toe-shared';

// SVG
import { ReactComponent as PlusSvg } from '../../../assets/plus.svg';
import { ReactComponent as RobotSvg } from '../../../assets/robot.svg';
import { ReactComponent as HumanSvg } from '../../../assets/human-player.svg';
import { ReactComponent as OnlinePlaySvg } from '../../../assets/online-play.svg';
import { ReactComponent as VerticalLineSvg } from '../../../assets/vertical-line.svg';
import { ReactComponent as HorizontalLineSvg } from '../../../assets/horizontal-line.svg';

interface IGameScore {
  playMode: PlayMode;
  turn?: PlayerSymbol;
  players: Array<IPlayerState>;
  connectionState: Array<IConnectionState>;
}

const GameScore: React.FC<IGameScore> = (props) => {
  const playerOne = props.players.find((p) => p.id === LOCAL_PLAYER_ID);
  const playerTwo = props.players.find((p) => p.id !== LOCAL_PLAYER_ID);

  return (
    <section className="landscape:flex-grow-1 flex h-fit items-center gap-2 self-start justify-self-center landscape:self-start landscape:justify-self-start">
      <PlayerScore
        turn={props.turn}
        player={playerOne}
        playMode={props.playMode}
        connectionState={props.connectionState.find(
          (state) => state.id === playerOne?.id,
        )}
      />
      <div className="score-separator w-6 text-stone-500">
        <VerticalLineSvg />
      </div>
      <PlayerScore
        turn={props.turn}
        player={playerTwo}
        playMode={props.playMode}
        connectionState={props.connectionState.find(
          (state) => state.id === playerTwo?.id,
        )}
      />
    </section>
  );
};

interface IPlayerScore {
  playMode: PlayMode;
  turn?: PlayerSymbol;
  player?: IPlayerState;
  connectionState?: IConnectionState;
}

const score = tv({
  slots: {
    container:
      'pointer-events-none relative flex touch-none select-none items-center gap-1',
    connection:
      'connection-status absolute -top-1 h-2 w-2 animate-pulse rounded-full transition-colors duration-300',
  },
  variants: {
    isMe: {
      true: {
        container: 'fill-stone-300 text-stone-300',
        connection: '-left-1',
      },
      false: {
        container: 'flex-row-reverse fill-stone-500 text-stone-500',
        connection: '-right-1',
      },
    },
    connectionStatus: {
      open: { connection: 'bg-green-500' },
      close: { connection: 'bg-red-500' },
    },
  },
});

const PlayerScore: React.FC<IPlayerScore> = (props) => {
  const isMe = props.player?.id === LOCAL_PLAYER_ID;

  const animationDir = isMe ? -1 : 1;

  const withTurn = props.turn === props.player?.symbol;

  const withConnectionStatus = props.playMode === 'online-multiplayer';

  const playerScore = props.player?.score ?? 0;

  const currentScore = Math.min(playerScore, MAX_DISPLAY_SCORE);

  const { container, connection } = score({
    isMe,
    connectionStatus: props.connectionState?.state ?? 'close',
  });

  const playMode = useMemo(() => {
    return props.player?.id === LOCAL_PLAYER_ID
      ? 'local-multiplayer'
      : props.playMode;
  }, [props.playMode, props.player]);

  const getPlayerSymbol = useCallback(() => {
    switch (playMode) {
      case 'local-multiplayer':
        return <HumanSvg title="human" />;
      case 'online-multiplayer':
        return <OnlinePlaySvg title="online" />;
      case 'versus-computer':
        return <RobotSvg title="robot" />;
    }
  }, [playMode]);

  return (
    <m.div
      layout
      className={container()}
      data-testid={isMe ? 'my-score' : 'opponent-score'}
    >
      {/* Connection status */}
      <AnimatePresence>
        {withConnectionStatus ? (
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { type: 'spring' } }}
            exit={{ scale: 0 }}
            className={connection()}
          />
        ) : null}
      </AnimatePresence>
      <div className="relative w-6">
        {/* Player Symbol */}
        <AnimatePresence mode="wait">
          <m.div
            key={playMode}
            initial={{ x: animationDir * 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: animationDir * 10, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`${isMe ? 'my-player-symbol' : 'player-symbol'}`}
          >
            {getPlayerSymbol()}
          </m.div>
        </AnimatePresence>
        {/* Turn Indicator */}
        <AnimatePresence>
          {withTurn ? (
            <m.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.3 }}
              className="turn-indicator absolute -bottom-1/2 w-6 fill-stone-300"
            >
              <HorizontalLineSvg title="turn-line" />
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
      {/* Player Score */}
      <AnimatePresence mode="wait">
        <m.h3
          id="score"
          key={currentScore}
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: { type: 'spring' } }}
          exit={{ scale: 0, transition: { duration: 0.3 } }}
          className={`w-5 text-center ${isMe ? 'my-score' : 'score'}`}
        >
          {currentScore}
        </m.h3>
      </AnimatePresence>
      {/*  Plus icon when exceeding max score */}
      <AnimatePresence>
        {playerScore > MAX_DISPLAY_SCORE ? (
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.3 } }}
            className={`${isMe ? 'my-score-plus' : 'score-plus'} aspect-square h-3`}
          >
            <PlusSvg />
          </m.div>
        ) : null}
      </AnimatePresence>
    </m.div>
  );
};

export default GameScore;
