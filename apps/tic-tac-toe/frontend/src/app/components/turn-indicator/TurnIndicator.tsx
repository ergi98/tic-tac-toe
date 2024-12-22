import React, { useMemo } from 'react';

import { m, AnimatePresence } from 'framer-motion';

import { type PlayerSymbol } from '@projects-nx-mono/tic-tac-toe-shared';

// SVG
import { ReactComponent as CrossSvg } from '../../../assets/cross.svg';
import { ReactComponent as CircleSvg } from '../../../assets/circle.svg';

interface ITurnIndicator {
  turn: PlayerSymbol;
  mySymbol: PlayerSymbol;
}

const TurnIndicator: React.FC<ITurnIndicator> = (props) => {
  const moveSymbol = useMemo(() => {
    switch (props.turn) {
      case 'O':
        return <CircleSvg title="O" />;
      case 'X':
        return <CrossSvg title="X" />;
    }
  }, [props.turn]);

  return (
    <div className="turn-text relative w-fit touch-none select-none px-0.5 text-center text-xs uppercase tracking-wider">
      <h6
        className={`${props.turn === props.mySymbol ? 'text-stone-300' : 'text-stone-500'} relative mx-auto flex w-fit items-center justify-center transition-colors duration-300`}
      >
        <div className="w-4">
          <AnimatePresence mode="wait" key={props.turn}>
            <m.div
              initial={{ scale: 0.3 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.3 }}
            >
              {moveSymbol}
            </m.div>
          </AnimatePresence>
        </div>
        &nbsp;to play
      </h6>
    </div>
  );
};

export default TurnIndicator;
