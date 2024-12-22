import React from 'react';
import { render, screen } from '../../../../test_utils';

import { type OverlayTriggerState } from 'react-stately';

import GameFooter from './GameFooter';

const useOverlayTriggerState = jest.fn();
useOverlayTriggerState.mockReturnValue({
  isOpen: false,
  open: jest.fn(),
  close: jest.fn(),
  toggle: jest.fn(),
  setOpen: jest.fn(),
} as OverlayTriggerState);

describe('GameFooter', () => {
  it('should render correct footer for local multiplayer', () => {
    const modalState = useOverlayTriggerState();
    render(
      <GameFooter
        lobbyId={null}
        isJoiningLobby={false}
        isCreatingLobby={false}
        onJoinLobby={jest.fn()}
        onDisconnect={jest.fn()}
        onModeChange={jest.fn()}
        isOnlineModalDisabled={false}
        onOnlineModalOpenPress={jest.fn()}
        onlinePlayModalState={modalState}
        playMode="local-multiplayer"
      />,
    );

    const footer = screen.getByTestId('game-mode-footer');

    expect(footer).toBeInTheDocument();
  });

  it('should render correct footer for versus computer', () => {
    const modalState = useOverlayTriggerState();
    render(
      <GameFooter
        lobbyId={null}
        isJoiningLobby={false}
        isCreatingLobby={false}
        onJoinLobby={jest.fn()}
        onDisconnect={jest.fn()}
        onModeChange={jest.fn()}
        isOnlineModalDisabled={false}
        onOnlineModalOpenPress={jest.fn()}
        onlinePlayModalState={modalState}
        playMode="versus-computer"
      />,
    );

    const footer = screen.getByTestId('game-mode-footer');

    expect(footer).toBeInTheDocument();
  });

  it('should render correct footer for online multiplayer', () => {
    const modalState = useOverlayTriggerState();
    render(
      <GameFooter
        lobbyId={null}
        isJoiningLobby={false}
        isCreatingLobby={false}
        onJoinLobby={jest.fn()}
        onDisconnect={jest.fn()}
        onModeChange={jest.fn()}
        isOnlineModalDisabled={false}
        onOnlineModalOpenPress={jest.fn()}
        onlinePlayModalState={modalState}
        playMode="online-multiplayer"
      />,
    );

    const footer = screen.getByTestId('online-player-footer');

    expect(footer).toBeInTheDocument();
  });
});
