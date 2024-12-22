'use client';

import React from 'react';

import { type OverlayTriggerState } from 'react-stately';

import type { PlayMode, JoinLobbyFormData } from '../../utils/types';

import { m, AnimatePresence } from 'framer-motion';

// SVG
import { ReactComponent as VerticalLineSvg } from '../../../assets/vertical-line.svg';

// Components
import { GameMode, OnlinePlay, OnlinePlayFooter } from '../';

interface IGameFooter {
  playMode: PlayMode;
  lobbyId: string | null;
  isJoiningLobby: boolean;
  onDisconnect: () => void;
  isCreatingLobby: boolean;
  isOnlineModalDisabled: boolean;
  onOnlineModalOpenPress: () => void;
  onModeChange: (mode: string) => void;
  onlinePlayModalState: OverlayTriggerState;
  onJoinLobby: (data: JoinLobbyFormData) => void;
}

const GameFooter: React.FC<IGameFooter> = (props) => {
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={(props.playMode === 'online-multiplayer').toString()}
        className="h-fit w-fit self-end justify-self-center landscape:self-end landscape:justify-self-end"
      >
        {props.playMode === 'online-multiplayer' ? (
          <OnlinePlayFooter onDisconnect={props.onDisconnect} />
        ) : (
          <section
            data-testid="game-mode-footer"
            className="flex items-center gap-2"
          >
            <GameMode
              lobbyId={props.lobbyId}
              playMode={props.playMode}
              onModeChange={props.onModeChange}
            />
            <m.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1, transition: { delay: 0.9 } }}
              exit={{ scaleY: 0, transition: { delay: 0.6, duration: 0.3 } }}
              className="mode-separator w-6 text-stone-500"
            >
              <VerticalLineSvg />
            </m.div>
            <OnlinePlay
              lobbyId={props.lobbyId}
              onJoinLobby={props.onJoinLobby}
              isJoiningLobby={props.isJoiningLobby}
              isCreatingLobby={props.isCreatingLobby}
              modalState={props.onlinePlayModalState}
              onModalOpenPress={props.onOnlineModalOpenPress}
              isOnlineModalDisabled={props.isOnlineModalDisabled}
            />
          </section>
        )}
      </m.div>
    </AnimatePresence>
  );
};

export default GameFooter;
