'use client';

import React, { type ReactNode } from 'react';

import { useHover } from 'react-aria';

import { m } from 'framer-motion';

import { tv } from 'tailwind-variants';

// Types
import type { PlayMode } from '../../utils/types';

// SVG
import { ReactComponent as RobotSvg } from '../../../assets/robot.svg';
import { ReactComponent as HumanSvg } from '../../../assets/human-player.svg';

// Components
import { Radio, RadioGroup } from '../';

interface IGameMode {
  playMode: PlayMode;
  lobbyId: string | null;
  onModeChange: (a: string) => void;
}

const GameMode: React.FC<IGameMode> = (props) => {
  const isDisabled = props.playMode === 'online-multiplayer';
  return (
    <RadioGroup
      label="Game Mode"
      value={props.playMode}
      isDisabled={isDisabled}
      orientation="horizontal"
      aria-describedby="Game Mode"
      onChange={props.onModeChange}
    >
      <m.div
        exit={{ x: '40%', transition: { delay: 1.2, duration: 0.3 } }}
        className="mode-group flex origin-center overflow-hidden rounded-lg bg-stone-900 border border-transparent"
      >
        <Radio
          isDisabled={isDisabled}
          value="local-multiplayer"
          aria-label="Local Multiplayer"
        >
          <GameModeOption>
            <HumanSvg />
          </GameModeOption>
        </Radio>
        <Radio
          isDisabled={isDisabled}
          value="versus-computer"
          aria-label="Versus Computer"
        >
          <GameModeOption>
            <RobotSvg />
          </GameModeOption>
        </Radio>
      </m.div>
    </RadioGroup>
  );
};

interface IGameModeOption {
  children: ReactNode;
  isSelected?: boolean;
  isFocusVisible?: boolean;
}

const radioOption = tv({
  slots: {
    icon: 'mode-icon w-6 transition-colors',
    option:
      'mode-button cursor-pointer touch-none select-none px-4 py-2 outline outline-2 -outline-offset-8 transition-colors',
  },
  variants: {
    isSelected: {
      true: { option: 'bg-stone-700', icon: 'fill-stone-300 text-stone-300' },
      false: { option: 'bg-stone-900', icon: 'fill-stone-500 text-stone-500' },
    },
    isHovered: { true: '', false: '' },
    isFocused: {
      true: { option: 'outline-stone-500' },
      false: { option: 'outline-transparent' },
    },
  },
  compoundVariants: [
    {
      isHovered: true,
      isSelected: true,
      class: {
        option: 'bg-stone-600',
      },
    },
    {
      isHovered: true,
      isSelected: false,
      class: {
        option: 'bg-stone-800',
      },
    },
  ],
});
const GameModeOption: React.FC<IGameModeOption> = (props) => {
  const { hoverProps, isHovered } = useHover({});

  const { option, icon } = radioOption({
    isHovered: isHovered,
    isSelected: props.isSelected,
    isFocused: props.isFocusVisible,
  });

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.3 } }}
      exit={{ opacity: 0, transition: { delay: 1.2, duration: 0.3 } }}
      className={option()}
    >
      <div {...hoverProps}>
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: { delay: 0.6 } }}
          exit={{ scale: 0, transition: { delay: 0.9, duration: 0.3 } }}
          className={icon()}
        >
          {props.children}
        </m.div>
      </div>
    </m.div>
  );
};

export default GameMode;
