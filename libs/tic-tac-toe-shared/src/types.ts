import type { WebSocket } from 'ws';

import { GameState } from './game';
import { ERROR_CODE } from './error-codes';

export type PlayerSymbol = 'X' | 'O';

interface Win {
  winner: PlayerSymbol;
  winningCells: Array<number>;
}

interface Draw {
  winner: 'draw';
  winningCells: undefined;
}

export type GameWinnerState = Win | Draw | undefined;

export interface IPlayerState {
  id: string;
  score: number;
  symbol: PlayerSymbol;
}

export interface IExtendedSocket extends WebSocket {
  isAlive?: boolean;
  playerId?: string;
  lobbyId?: string;
}

export interface ILobbyData {
  gameState: GameState;
  players: Array<IExtendedSocket>;
}

export interface ISwitchRequestData {
  playerId: string;
  requestValidUntil: number;
  playerSocket: IExtendedSocket;
}

export interface IExtendedPlayerState extends IPlayerState {
  connectionStatus: 'open' | 'close';
}

export interface IConnectionState {
  id: string;
  state: 'close' | 'open';
}

/** SOCKET TYPES */
export interface ISocketOpenAckData {
  type: 'OPEN_ACK';
  payload:
    | { status: 'error'; code: ISocketKnownError }
    | { status: 'success'; lobbyId: string; playerId: string };
}

export interface ISocketJoinAckData {
  type: 'JOIN_ACK';
  payload:
    | { status: 'error'; code: ISocketKnownError }
    | { status: 'success'; playerId: string };
}

export interface ISocketCloseAckData {
  type: 'CLOSE_ACK';
  payload: { status: 'error' } | { status: 'success'; id: string };
}

export interface ISocketGameStateData {
  type: 'GET_STATE';
  payload: null;
}

export interface ISocketGameStateAckData {
  type: 'GET_STATE_ACK';
  payload:
    | { status: 'error'; code: ISocketKnownError }
    | {
        status: 'success';
        boardState: string;
        winnerState: GameWinnerState;
        playerState: Array<IPlayerState>;
      };
}

export interface ISocketLeaveLobbyData {
  type: 'LEAVE_LOBBY';
  payload: null;
}

export interface ISocketLeaveLobbyAckData {
  type: 'LEAVE_LOBBY_ACK';
  payload: null;
}

export type ISocketMoveData = {
  type: 'MOVE';
  payload: number;
};

export type ISocketMoveAckData = {
  type: 'MOVE_ACK';
  payload:
    | { status: 'error'; cell: number; code: ISocketKnownError }
    | {
        cell: number;
        status: 'success';
        isAcknowledgment: boolean;
      };
};

export type ISocketSwitchLobbyRequestData = {
  type: 'SWITCH_LOBBY_REQUEST';
  payload: { lobbyId: string };
};

export type ISocketSwitchLobbyRequestAckData = {
  type: 'SWITCH_LOBBY_REQUEST_ACK';
  payload:
    | { status: 'error'; code: ISocketKnownError }
    | { status: 'success'; validUntil: number; isInitiator: boolean };
};

export type ISocketSwitchLobbyResponseData = {
  type: 'SWITCH_LOBBY_RESPONSE';
  payload: 'accept' | 'reject';
};

export type ISocketSwitchLobbyResponseAckData = {
  type: 'SWITCH_LOBBY_RESPONSE_ACK';
  payload:
    | { status: 'error'; code: ISocketKnownError }
    | {
        lobbyId: string;
        status: 'accept';
        isInitiator: boolean;
        playerState: Array<IPlayerState>;
      }
    | {
        status: 'reject';
      };
};

export type ISocketKnownError = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export type ISocketData =
  | ISocketMoveData
  | ISocketMoveAckData
  | ISocketOpenAckData
  | ISocketJoinAckData
  | ISocketCloseAckData
  | ISocketGameStateData
  | ISocketGameStateAckData
  | ISocketLeaveLobbyData
  | ISocketLeaveLobbyAckData
  | ISocketSwitchLobbyRequestData
  | ISocketSwitchLobbyRequestAckData
  | ISocketSwitchLobbyResponseData
  | ISocketSwitchLobbyResponseAckData;
