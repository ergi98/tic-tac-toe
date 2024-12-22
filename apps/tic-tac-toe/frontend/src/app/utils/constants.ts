import {
  ERROR_CODE,
  type ISocketKnownError,
} from '@projects-nx-mono/tic-tac-toe-shared';

export const MAX_DISPLAY_SCORE = 999;

export const getErrorMessageText = (code: ISocketKnownError | null) => {
  switch (code) {
    case ERROR_CODE.LOBBY_LIMIT_REACHED:
      return 'At the moment we are experiencing a surge of players. Please try again later. Sorry for the inconvenience!';
    case ERROR_CODE.LOBBY_NOT_FOUND:
      return 'The lobby you are attempting to access is no longer available. Please try creating a new one!';
    case ERROR_CODE.GAME_ALREADY_FULL:
      return 'There are already 2 players playing at this lobby. You can create a new one to play with your friend!';
    case ERROR_CODE.SOCKET_TERMINATED:
      return 'The connection to the server was abruptly closed. Please try refreshing your window if you wish to play online.';
    case ERROR_CODE.USER_IS_OFFLINE:
      return 'You are not connected to the internet at the moment. Please check your internet connection and retry again!';
    case ERROR_CODE.ANOTHER_REQUEST_PENDING:
      return 'There is another player pending to join this lobby. Please try again after a while!';
    case ERROR_CODE.SWITCH_LOBBY_REQUEST_NOT_VALID:
      return 'This request is no longer valid. Please try again!';
    case ERROR_CODE.SWITCHED_LOBBY_SAME_AS_ORIGINAL:
      return 'You are already part of the lobby.';
    case ERROR_CODE.CAN_NOT_LEAVE_GAME_IN_PROGRESS:
      return 'You can not switch when a game is in progress. Please leave current lobby before requesting to join a new one.';
    case ERROR_CODE.PLAYER_LEFT_GAME:
      return 'Your friend has left the game! You can still share the same game link and hop on another game!';
    default:
      return 'Something went wrong! Please try again later.';
  }
};

export const getErrorMessageTitle = (code: ISocketKnownError | null) => {
  switch (code) {
    case ERROR_CODE.LOBBY_LIMIT_REACHED:
      return 'Server is full!';
    case ERROR_CODE.LOBBY_NOT_FOUND:
      return 'Lobby not found!';
    case ERROR_CODE.GAME_ALREADY_FULL:
      return 'Game is full!';
    case ERROR_CODE.SOCKET_TERMINATED:
      return 'Connection closed!';
    case ERROR_CODE.USER_IS_OFFLINE:
      return 'Offline warning!';
    case ERROR_CODE.ANOTHER_REQUEST_PENDING:
      return 'Pending Join Request';
    case ERROR_CODE.SWITCH_LOBBY_REQUEST_NOT_VALID:
    case ERROR_CODE.CAN_NOT_LEAVE_GAME_IN_PROGRESS:
    case ERROR_CODE.SWITCHED_LOBBY_SAME_AS_ORIGINAL:
      return 'Invalid Join Request!';
    case ERROR_CODE.PLAYER_LEFT_GAME:
      return 'Partner left!';
    default:
      return 'Something went wrong!';
  }
};
