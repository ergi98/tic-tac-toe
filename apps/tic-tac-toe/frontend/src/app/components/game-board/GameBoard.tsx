'use client';

import { useCallback } from 'react';

import { tv } from 'tailwind-variants';

import { type AriaButtonOptions } from 'react-aria';

import { m } from 'framer-motion';

// Types
import type {
  PlayerSymbol,
  GameWinnerState,
} from '@projects-nx-mono/tic-tac-toe-shared';
import type { PlayMode } from '../../utils/types';

// Components
import { BaseButton } from '../';

// SVG
import { ReactComponent as CrossSvg } from '../../../assets/cross.svg';
import { ReactComponent as CircleSvg } from '../../../assets/circle.svg';

interface IGameBoard {
  playMode: PlayMode;
  turn?: PlayerSymbol;
  mySymbol: PlayerSymbol;
  boardState: Array<string>;
  winnerState: GameWinnerState;
  onCellClick: (
    cell: number,
    playMode: PlayMode,
    withBroadcast?: boolean,
  ) => void;
}

const GameBoard: React.FC<IGameBoard> = (props) => {
  const handleCellClick = (cellIndex: number) => {
    if (
      props.turn === props.mySymbol ||
      props.playMode === 'local-multiplayer'
    ) {
      props.onCellClick(cellIndex, props.playMode, true);
    }
  };
  return (
    <div
      role="grid"
      className="relative grid aspect-square w-full max-w-[225px] grid-cols-3 gap-2 sm:max-w-sm"
    >
      {props.boardState.map((symbol, index) => (
        <GameBoardCell
          index={index}
          mySymbol={props.mySymbol}
          key={`${symbol}-${index}`}
          symbol={symbol as PlayerSymbol | '0'}
          onPress={() => handleCellClick(index)}
          isDisabled={props.winnerState !== undefined || symbol !== '0'}
        />
      ))}
      <GameBoardLines />
    </div>
  );
};

type GameBoardCellProps = AriaButtonOptions<'button'> & {
  index: number;
  mySymbol: PlayerSymbol;
  symbol: PlayerSymbol | '0';
};

const cell = tv({
  slots: {
    button: [
      'flex',
      'w-full',
      'rounded-lg',
      'items-center',
      'bg-stone-950',
      'duration-300',
      'aspect-square',
      'justify-center',
      'border border-2',
      'transition-colors',
      'border-transparent',
      'data-hovered:bg-stone-900',
    ],
    icon: 'z-10 w-1/2 min-w-6 max-w-12',
  },
  variants: {
    isMySymbol: {
      true: { icon: 'text-stone-300' },
      false: { icon: 'text-stone-500' },
    },
  },
});

const GameBoardCell: React.FC<GameBoardCellProps> = ({
  index,
  symbol,
  mySymbol,
  ...buttonProps
}) => {
  const { button, icon } = cell({ isMySymbol: symbol === mySymbol });

  const getCellSymbol = useCallback(() => {
    switch (symbol) {
      case 'X':
        return <CrossSvg />;
      case 'O':
        return <CircleSvg />;
      default:
        return null;
    }
  }, [symbol]);

  return (
    <BaseButton
      {...buttonProps}
      buttonClasses={button()}
      pressClasses="bg-stone-800"
      focusClasses="border-neutral-300"
    >
      <div className={icon()}>
        <m.div
          key={symbol}
          initial={{ scale: 0.2 }}
          className={['X', 'O'].includes(symbol) ? 'cell-symbol' : ''}
          animate={{ scale: 1, transition: { type: 'spring' } }}
        >
          {getCellSymbol()}
        </m.div>
      </div>
      <div
        className={`cell-${index} absolute left-0 top-0 h-full w-full rounded-md bg-stone-800 opacity-0`}
      />
    </BaseButton>
  );
};

const GameBoardLines: React.FC = () => {
  return (
    <>
      <div className="line-y-1 absolute left-1/3 h-full w-0.5 touch-none select-none rounded-full bg-stone-600" />
      <div className="line-y-2 absolute right-1/3 h-full w-0.5 touch-none select-none rounded-full bg-stone-600" />
      <div className="line-x-1 absolute top-1/3 h-0.5 w-full touch-none select-none rounded-full bg-stone-600" />
      <div className="line-x-2 absolute bottom-1/3 h-0.5 w-full touch-none select-none rounded-full bg-stone-600" />
    </>
  );
};

export default GameBoard;
