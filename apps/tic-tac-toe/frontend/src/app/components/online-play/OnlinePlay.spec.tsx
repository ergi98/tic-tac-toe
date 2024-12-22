import React from 'react';
import { render, screen, act } from '../../../../test_utils';

import userEvent from '@testing-library/user-event';

import type { OverlayTriggerState } from 'react-stately';

import OnlinePlay from './OnlinePlay';

const useOverlayTriggerState = jest.fn();
useOverlayTriggerState.mockImplementation(
  ({ isOpen }) =>
    ({
      isOpen,
      open: jest.fn(),
      close: jest.fn(),
      toggle: jest.fn(),
      setOpen: jest.fn(),
    }) as OverlayTriggerState,
);

describe('OnlinePlay', () => {
  beforeAll(() => {
    Object.defineProperty(navigator, 'share', {
      value: jest.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'group').mockImplementation(() => null);
    jest.spyOn(console, 'groupEnd').mockImplementation(() => null);
  });
  it('should render successfully', () => {
    const modalState = useOverlayTriggerState({ isOpen: false });

    render(
      <OnlinePlay
        lobbyId={null}
        //
        modalState={modalState}
        //
        isJoiningLobby={false}
        isCreatingLobby={false}
        isOnlineModalDisabled={false}
        //
        onJoinLobby={jest.fn()}
        onModalOpenPress={jest.fn()}
      />,
    );

    const onlineButton = screen.getByRole('button');

    expect(onlineButton).toBeInTheDocument();
  });

  it('should be disabled when passing it as a prop', () => {
    const modalState = useOverlayTriggerState({ isOpen: false });

    render(
      <OnlinePlay
        lobbyId={null}
        //
        modalState={modalState}
        //
        isJoiningLobby={false}
        isCreatingLobby={false}
        isOnlineModalDisabled={true}
        //
        onJoinLobby={jest.fn()}
        onModalOpenPress={jest.fn()}
      />,
    );

    const onlineButton = screen.getByRole('button');

    expect(onlineButton).toBeDisabled();
  });

  it('should be loading when creating lobby', () => {
    const modalState = useOverlayTriggerState({ isOpen: false });

    render(
      <OnlinePlay
        lobbyId={null}
        //
        modalState={modalState}
        //
        isJoiningLobby={false}
        isCreatingLobby={true}
        isOnlineModalDisabled={true}
        //
        onJoinLobby={jest.fn()}
        onModalOpenPress={jest.fn()}
      />,
    );

    const loadingImage = screen.getByRole('img');

    expect(loadingImage).toBeInTheDocument();
  });

  it('should show online play modal', () => {
    const modalState = useOverlayTriggerState({ isOpen: true });

    render(
      <OnlinePlay
        lobbyId={null}
        //
        modalState={modalState}
        //
        isJoiningLobby={false}
        isCreatingLobby={true}
        isOnlineModalDisabled={true}
        //
        onJoinLobby={jest.fn()}
        onModalOpenPress={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeInTheDocument();
  });

  it('should call the open callback when user clicks open button', async () => {
    const modalState = useOverlayTriggerState({ isOpen: false });
    const user = userEvent.setup();

    const openPressHandler = jest.fn();

    render(
      <OnlinePlay
        lobbyId={null}
        //
        modalState={modalState}
        //
        isJoiningLobby={false}
        isCreatingLobby={false}
        isOnlineModalDisabled={false}
        //
        onJoinLobby={jest.fn()}
        onModalOpenPress={openPressHandler}
      />,
    );

    const onlineButton = screen.getByRole('button');

    await act(async () => {
      await user.click(onlineButton);
    });

    expect(openPressHandler).toHaveBeenCalledTimes(1);
  });

  describe('JoinLobby', () => {
    it('should call join callback with correct data', async () => {
      const modalState = useOverlayTriggerState({ isOpen: true });
      const user = userEvent.setup();

      const joinLobbyHandler = jest.fn();

      render(
        <OnlinePlay
          lobbyId={null}
          //
          modalState={modalState}
          //
          isJoiningLobby={false}
          isCreatingLobby={false}
          isOnlineModalDisabled={false}
          //
          onModalOpenPress={jest.fn()}
          onJoinLobby={joinLobbyHandler}
        />,
      );

      const lobbyIdField = screen.getByRole('textbox', {
        name: 'Lobby Identifier',
      });

      const joinButton = screen.getByRole('button', {
        name: 'Join Lobby',
      });

      await act(async () => {
        await user.type(lobbyIdField, '123456');
        await user.click(joinButton);
      });

      expect(joinLobbyHandler).toHaveBeenCalledWith({
        id: '123456',
      });
    });

    it('should display loader when clicking join', async () => {
      const modalState = useOverlayTriggerState({ isOpen: true });

      const joinLobbyHandler = jest.fn();

      render(
        <OnlinePlay
          lobbyId={null}
          //
          modalState={modalState}
          //
          isJoiningLobby={true}
          isCreatingLobby={false}
          isOnlineModalDisabled={false}
          //
          onModalOpenPress={jest.fn()}
          onJoinLobby={joinLobbyHandler}
        />,
      );

      const loadingImage = screen.getByRole('img');

      expect(loadingImage).toBeInTheDocument();
    });

    it('should display error if form data is incorrect', async () => {
      const modalState = useOverlayTriggerState({ isOpen: true });
      const user = userEvent.setup();

      const joinLobbyHandler = jest.fn();

      render(
        <OnlinePlay
          lobbyId={null}
          //
          modalState={modalState}
          //
          isJoiningLobby={false}
          isCreatingLobby={false}
          isOnlineModalDisabled={false}
          //
          onModalOpenPress={jest.fn()}
          onJoinLobby={joinLobbyHandler}
        />,
      );

      const lobbyIdField = screen.getByRole('textbox', {
        name: 'Lobby Identifier',
      });

      const joinButton = screen.getByRole('button', {
        name: 'Join Lobby',
      });

      await act(async () => {
        await user.type(lobbyIdField, '123');
        await user.click(joinButton);
      });

      const lobbyError = screen.getByText(
        /identifier is not in the correct format!/i,
      );

      expect(lobbyError).toBeInTheDocument();
    });

    it('should display error if trying to join a lobby you are already part of', async () => {
      const modalState = useOverlayTriggerState({ isOpen: true });
      const user = userEvent.setup();

      const joinLobbyHandler = jest.fn();

      render(
        <OnlinePlay
          lobbyId={'123456'}
          //
          modalState={modalState}
          //
          isJoiningLobby={false}
          isCreatingLobby={false}
          isOnlineModalDisabled={false}
          //
          onModalOpenPress={jest.fn()}
          onJoinLobby={joinLobbyHandler}
        />,
      );

      const lobbyIdField = screen.getByRole('textbox', {
        name: 'Lobby Identifier',
      });

      const joinButton = screen.getByRole('button', {
        name: 'Join Lobby',
      });

      await act(async () => {
        await user.type(lobbyIdField, '123456');
        await user.click(joinButton);
      });

      const lobbyError = screen.getByText(
        /you are already part of this game!/i,
      );
      expect(lobbyError).toBeInTheDocument();
    });
  });

  describe('InviteToLobby', () => {
    it('shows copy error message correctly', async () => {
      const modalState = useOverlayTriggerState({ isOpen: true });

      jest
        .spyOn(navigator.clipboard, 'writeText')
        .mockRejectedValue(new Error());

      const user = userEvent.setup();

      const joinLobbyHandler = jest.fn();

      render(
        <OnlinePlay
          lobbyId="123456"
          //
          modalState={modalState}
          //
          isJoiningLobby={false}
          isCreatingLobby={false}
          isOnlineModalDisabled={false}
          //
          onModalOpenPress={jest.fn()}
          onJoinLobby={joinLobbyHandler}
        />,
      );

      const copyButton = screen.getByRole('button', {
        name: 'Copy Identifier',
      });

      await act(async () => {
        await user.click(copyButton);
      });

      const errorMessage = screen.getByText(
        /could not copy lobby identifiers!/i,
      );

      expect(errorMessage).toBeInTheDocument();
    });
  });
});
