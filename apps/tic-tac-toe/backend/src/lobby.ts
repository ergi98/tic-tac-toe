import {
  GameState,
  ERROR_CODE,
  LOCAL_PLAYER_ID,
  ONLINE_PLAYER_ID,
  REQUEST_DURATION,
  REQUEST_BUFFER_DURATION,
  type ILobbyData,
  type ISocketData,
  type IPlayerState,
  type IExtendedSocket,
  type ISocketKnownError,
  type ISwitchRequestData,
} from '@projects-nx-mono/tic-tac-toe-shared';

export class Lobby {
  // KEY = LobbyId
  // Holds information on what WS are connected with each other and the respective game state
  #lobbies: Map<string, ILobbyData> = new Map();

  // KEY = LobbyId
  // Holds all WS playerIds that are currently requesting to switch lobbies
  #switchRequests: Map<string, ISwitchRequestData> = new Map();

  // Constants
  #LETTER_RANGE_ASCII = { LOWER: 65, UPPER: 90 };
  #NUMBER_RANGE_ASCII = { LOWER: 48, UPPER: 57 };
  #MAX_LOBBIES = parseInt(process.env.TTT_MAX_LOBBIES ?? '1000');

  constructor() {
    this.#lobbies = new Map();
    this.#switchRequests = new Map();
  }

  #isSwitchRequestValid(request: ISwitchRequestData) {
    const nowInMS = new Date().getTime();
    const validUntil = request.requestValidUntil + REQUEST_BUFFER_DURATION;

    return validUntil >= nowInMS;
  }

  #isLobbyIdCharacterInRange(ascii: number) {
    const isInNumberRange =
      ascii >= this.#NUMBER_RANGE_ASCII.LOWER &&
      ascii <= this.#NUMBER_RANGE_ASCII.UPPER;
    const isInLetterRange =
      ascii >= this.#LETTER_RANGE_ASCII.LOWER &&
      ascii <= this.#LETTER_RANGE_ASCII.UPPER;
    return isInLetterRange || isInNumberRange;
  }

  #generateLoobyIdCharacter() {
    const max = this.#LETTER_RANGE_ASCII.UPPER;
    const min = this.#NUMBER_RANGE_ASCII.LOWER;
    let ascii: number;
    do {
      ascii = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (this.#isLobbyIdCharacterInRange(ascii) === false);
    return String.fromCharCode(ascii);
  }

  #isPlayerPartOfLobby(lobby: ILobbyData | undefined, playerId: string) {
    return (
      lobby && lobby.gameState.playerState().find((p) => p.id === playerId)
    );
  }

  #isLobbyIdUnique(id: string | null) {
    return id ? this.#lobbies.get(id) === undefined : false;
  }

  #getMappedPlayerState(playerState: Array<IPlayerState>, playerId?: string) {
    return playerState.map((data) => ({
      ...data,
      id: data.id === playerId ? LOCAL_PLAYER_ID : ONLINE_PLAYER_ID,
    }));
  }

  generateRandomID(length: number) {
    let id: string | null = null;
    do {
      id = null;
      const digits: Array<string> = [];
      for (let i = 0; i < length; i++) {
        digits[i] = this.#generateLoobyIdCharacter();
      }
      id = digits.join('');
    } while (this.#isLobbyIdUnique(id) === false);
    return id;
  }

  createLobbyAndGame(ws: IExtendedSocket) {
    const { playerId, lobbyId } = ws;
    // No identifiers
    if (!playerId || !lobbyId) {
      const data: ISocketData = {
        type: 'OPEN_ACK',
        payload: { status: 'error', code: ERROR_CODE.OTHER },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    const lobbyData = this.#lobbies.get(lobbyId);
    // Lobby already exists
    if (lobbyData) {
      const data: ISocketData = {
        type: 'OPEN_ACK',
        payload: { status: 'error', code: ERROR_CODE.OTHER },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    // Lobby limit reached
    if (this.#lobbies.size >= this.#MAX_LOBBIES) {
      const data: ISocketData = {
        type: 'OPEN_ACK',
        payload: {
          status: 'error',
          code: ERROR_CODE.LOBBY_LIMIT_REACHED,
        },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    // Creating new lobby and game
    const newLobbyData: ILobbyData = {
      players: [ws],
      gameState: new GameState(undefined, undefined, []),
    };
    // Adding player to game
    let errorCode: ISocketKnownError | null = null;
    try {
      newLobbyData.gameState.registerPlayer(playerId);
    } catch (err) {
      errorCode =
        err instanceof Error
          ? (err.message as ISocketKnownError)
          : ERROR_CODE.OTHER;
    }
    // Could not add player to game
    if (errorCode) {
      const data: ISocketData = {
        type: 'OPEN_ACK',
        payload: { status: 'error', code: errorCode },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    // Success
    this.#lobbies.set(lobbyId, newLobbyData);
    const data: ISocketData = {
      type: 'OPEN_ACK',
      payload: { status: 'success', lobbyId, playerId },
    };
    ws.send(JSON.stringify(data));
  }

  removePlayerFromLobby(ws: IExtendedSocket) {
    const { playerId, lobbyId } = ws;
    if (!playerId || !lobbyId) {
      // Close the faulty websocket connection
      ws.close();
      return;
    }
    const lobbyData = this.#lobbies.get(lobbyId);
    if (!lobbyData || !this.#isPlayerPartOfLobby(lobbyData, playerId)) {
      const data: ISocketData = {
        type: 'CLOSE_ACK',
        payload: { status: 'success', id: LOCAL_PLAYER_ID },
      };
      ws.send(JSON.stringify(data));
      return;
    }
    lobbyData.players = lobbyData.players.filter(
      (p) => p.playerId !== playerId,
    );
    lobbyData.players.forEach((player) => {
      const payload = {
        type: 'CLOSE_ACK',
        payload: {
          status: 'success',
          id: player.playerId === playerId ? LOCAL_PLAYER_ID : '2',
        },
      };
      player.send(JSON.stringify(payload));
    });
  }

  removePlayerFromLobbyAndGame(ws: IExtendedSocket) {
    const { lobbyId, playerId } = ws;
    if (!playerId || !lobbyId) {
      // Close the faulty websocket connection
      ws.close();
      return;
    }
    const lobbyData = this.#lobbies.get(lobbyId);
    const data: ISocketData = {
      type: 'LEAVE_LOBBY_ACK',
      payload: null,
    };
    if (!lobbyData || !this.#isPlayerPartOfLobby(lobbyData, playerId)) {
      ws.send(JSON.stringify(data));
      return;
    }
    this.#lobbies.delete(lobbyId);
    lobbyData.players
      .filter((p) => p.playerId !== ws.playerId)
      .forEach((p) => p.send(JSON.stringify(data)));
  }

  sendConnectionAcknowledgment(ws: IExtendedSocket) {
    const { playerId, lobbyId } = ws;
    // No identifiers
    if (!playerId || !lobbyId) {
      const data: ISocketData = {
        type: 'OPEN_ACK',
        payload: { status: 'error', code: ERROR_CODE.OTHER },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    const lobbyData = this.#lobbies.get(lobbyId);
    // Not part of the lobby or lobby does not exist
    if (!lobbyData || !this.#isPlayerPartOfLobby(lobbyData, playerId)) {
      const data: ISocketData = {
        type: 'OPEN_ACK',
        payload: { status: 'error', code: ERROR_CODE.LOBBY_NOT_FOUND },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    // Add to lobby
    lobbyData.players.push(ws);
    // Check if game is in progress
    if (lobbyData.gameState.playerState().length === 2) {
      this.sendCurrentGameState(ws);
    } else {
      const data: ISocketData = {
        type: 'OPEN_ACK',
        payload: { lobbyId, playerId, status: 'success' },
      };
      ws.send(JSON.stringify(data));
    }
    // Send ONLINE_PLAYER_ID since this event will only be received from partner
    const data: ISocketData = {
      type: 'JOIN_ACK',
      payload: { status: 'success', playerId: ONLINE_PLAYER_ID },
    };
    lobbyData.players
      .filter((player) => player.playerId !== playerId)
      .forEach((player) => player.send(JSON.stringify(data)));
  }

  sendCurrentGameState(ws: IExtendedSocket) {
    const { playerId, lobbyId } = ws;
    // No identifiers
    if (!playerId || !lobbyId) {
      const data: ISocketData = {
        type: 'GET_STATE_ACK',
        payload: { status: 'error', code: ERROR_CODE.OTHER },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    const lobbyData = this.#lobbies.get(lobbyId);
    if (!lobbyData || !this.#isPlayerPartOfLobby(lobbyData, playerId)) {
      const data: ISocketData = {
        type: 'GET_STATE_ACK',
        payload: { status: 'error', code: ERROR_CODE.LOBBY_NOT_FOUND },
      };
      ws.send(JSON.stringify(data));
      return;
    }
    const playerState = lobbyData.gameState.playerState();
    const winnerState = lobbyData.gameState.winnerState();
    const boardState = lobbyData.gameState.boardState();
    const data: ISocketData = {
      type: 'GET_STATE_ACK',
      payload: {
        winnerState,
        status: 'success',
        boardState: boardState.join(''),
        playerState: this.#getMappedPlayerState(playerState, playerId),
      },
    };
    ws.send(JSON.stringify(data));
  }

  registerSwitchLobbyRequest(
    ws: IExtendedSocket,
    switchData: { lobbyId: string },
  ) {
    const { playerId, lobbyId: oldLobbyId } = ws;
    // No identifiers
    if (!playerId || !oldLobbyId) {
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_REQUEST_ACK',
        payload: { status: 'error', code: ERROR_CODE.OTHER },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    // Joining current lobby
    if (oldLobbyId === switchData.lobbyId) {
      const errorData: ISocketData = {
        type: 'SWITCH_LOBBY_REQUEST_ACK',
        payload: {
          status: 'error',
          code: ERROR_CODE.SWITCHED_LOBBY_SAME_AS_ORIGINAL,
        },
      };
      ws.send(JSON.stringify(errorData));
      return;
    }
    const oldLobbyData = this.#lobbies.get(oldLobbyId);
    // Leaving lobby with a game in progress
    if (oldLobbyData && oldLobbyData.gameState.playerState.length === 2) {
      const errorData: ISocketData = {
        type: 'SWITCH_LOBBY_REQUEST_ACK',
        payload: {
          status: 'error',
          code: ERROR_CODE.CAN_NOT_LEAVE_GAME_IN_PROGRESS,
        },
      };
      ws.send(JSON.stringify(errorData));
      return;
    }
    const newLobbyData = this.#lobbies.get(switchData.lobbyId);
    // Lobby not found
    if (!newLobbyData) {
      const errorData: ISocketData = {
        type: 'SWITCH_LOBBY_REQUEST_ACK',
        payload: {
          status: 'error',
          code: ERROR_CODE.LOBBY_NOT_FOUND,
        },
      };
      ws.send(JSON.stringify(errorData));
      return;
    }
    // New lobby is full
    if (newLobbyData.gameState.playerState.length === 2) {
      const errorData: ISocketData = {
        type: 'SWITCH_LOBBY_REQUEST_ACK',
        payload: {
          status: 'error',
          code: ERROR_CODE.GAME_ALREADY_FULL,
        },
      };
      ws.send(JSON.stringify(errorData));
      return;
    }
    const activeRequest = this.#switchRequests.get(switchData.lobbyId);
    // No existing request
    if (!activeRequest) {
      // Valid 10 seconds from now
      const requestValidUntil = new Date().getTime() + REQUEST_DURATION;
      // Create request
      const requestData: ISwitchRequestData = {
        playerId,
        playerSocket: ws,
        requestValidUntil,
      };
      this.#switchRequests.set(switchData.lobbyId, requestData);
      // Send request to join
      [ws, ...newLobbyData.players].forEach((player) => {
        const data: ISocketData = {
          type: 'SWITCH_LOBBY_REQUEST_ACK',
          payload: {
            status: 'success',
            validUntil: requestValidUntil,
            isInitiator: player.playerId === requestData.playerId,
          },
        };
        player.send(JSON.stringify(data));
      });
      return;
    }
    // Existing switch request is in time limit
    if (this.#isSwitchRequestValid(activeRequest)) {
      if (activeRequest.playerId !== playerId) {
        // Another player is requesting at the moment
        const errorData: ISocketData = {
          type: 'SWITCH_LOBBY_REQUEST_ACK',
          payload: {
            status: 'error',
            code: ERROR_CODE.ANOTHER_REQUEST_PENDING,
          },
        };
        ws.send(JSON.stringify(errorData));
        return;
      }
      // The active request is yours, send it back
      // No need to notify the admin of the other lobby since he has been notified before
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_REQUEST_ACK',
        payload: {
          status: 'success',
          isInitiator: true,
          validUntil: activeRequest.requestValidUntil,
        },
      };
      ws.send(JSON.stringify(data));
    }
    // Current request has timed out
    // Delete previous request
    this.#switchRequests.delete(switchData.lobbyId);
    // Log new one
    // Valid 10 seconds from now
    const requestValidUntil = new Date().getTime() + REQUEST_DURATION;
    const newSwitchData = {
      playerId,
      playerSocket: ws,
      requestValidUntil,
    };
    this.#switchRequests.set(switchData.lobbyId, newSwitchData);
    [ws, ...newLobbyData.players].forEach((player) => {
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_REQUEST_ACK',
        payload: {
          status: 'success',
          validUntil: requestValidUntil,
          isInitiator: player.playerId === newSwitchData.playerId,
        },
      };
      player.send(JSON.stringify(data));
    });
  }

  processSwitchLobbyDecline(ws: IExtendedSocket) {
    const { playerId, lobbyId } = ws;
    // No identifiers
    if (!playerId || !lobbyId) {
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_RESPONSE_ACK',
        payload: { status: 'error', code: ERROR_CODE.OTHER },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    const activeSwitchRequest = this.#switchRequests.get(lobbyId);
    this.#switchRequests.delete(lobbyId);
    // If no request is present or time has expired do nothing
    if (
      !activeSwitchRequest ||
      !this.#isSwitchRequestValid(activeSwitchRequest)
    ) {
      return;
    }
    const data: ISocketData = {
      type: 'SWITCH_LOBBY_RESPONSE_ACK',
      payload: { status: 'reject' },
    };
    // Send decline notification to requester
    activeSwitchRequest.playerSocket.send(JSON.stringify(data));
  }

  processSwitchLobbyAccept(ws: IExtendedSocket) {
    const { playerId, lobbyId } = ws;
    // No identifiers
    if (!playerId || !lobbyId) {
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_RESPONSE_ACK',
        payload: { status: 'error', code: ERROR_CODE.OTHER },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    const activeSwitchRequest = this.#switchRequests.get(lobbyId);
    // Could not find any active requests to join this lobby
    if (
      !activeSwitchRequest ||
      !this.#isSwitchRequestValid(activeSwitchRequest)
    ) {
      this.#switchRequests.delete(lobbyId);
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_RESPONSE_ACK',
        payload: {
          status: 'error',
          code: ERROR_CODE.SWITCH_LOBBY_REQUEST_NOT_VALID,
        },
      };
      ws.send(JSON.stringify(data));
      return;
    }
    const lobbyData = this.#lobbies.get(lobbyId);
    // Lobby is not valid for switching
    if (!lobbyData || lobbyData.gameState.playerState.length === 2) {
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_RESPONSE_ACK',
        payload: {
          status: 'error',
          code: ERROR_CODE.SWITCH_LOBBY_REQUEST_NOT_VALID,
        },
      };
      ws.send(JSON.stringify(data));
      return;
    }
    // Add player to the game
    lobbyData.gameState.registerPlayer(activeSwitchRequest.playerId);
    lobbyData.players.push(activeSwitchRequest.playerSocket);

    // Delete this request
    this.#switchRequests.delete(lobbyId);

    lobbyData.players.forEach((player) => {
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_RESPONSE_ACK',
        payload: {
          lobbyId,
          status: 'accept',
          isInitiator: player.playerId === activeSwitchRequest.playerId,
          playerState: this.#getMappedPlayerState(
            lobbyData.gameState.playerState(),
            player.playerId,
          ),
        },
      };
      player.send(JSON.stringify(data));
    });
  }

  registerPlayerMove(ws: IExtendedSocket, cell: number) {
    const { playerId, lobbyId } = ws;
    // No identifiers
    if (!playerId || !lobbyId) {
      const data: ISocketData = {
        type: 'MOVE_ACK',
        payload: { status: 'error', cell, code: ERROR_CODE.OTHER },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    const lobbyData = this.#lobbies.get(lobbyId);
    if (!lobbyData || !this.#isPlayerPartOfLobby(lobbyData, playerId)) {
      const data: ISocketData = {
        type: 'MOVE_ACK',
        payload: { status: 'error', code: ERROR_CODE.LOBBY_NOT_FOUND, cell },
      };
      ws.send(JSON.stringify(data));
      ws.terminate();
      return;
    }
    try {
      const mySymbol = lobbyData.gameState.me(playerId).symbol;
      const playingSymbol = lobbyData.gameState.playingSymbol();
      if (mySymbol !== playingSymbol) {
        throw new Error(ERROR_CODE.NOT_MY_TURN);
      }
      lobbyData.gameState.registerMove(cell);
    } catch (err) {
      let errorCode: ISocketKnownError = ERROR_CODE.OTHER;
      if (err instanceof Error) {
        errorCode = err.message as ISocketKnownError;
      }
      const data: ISocketData = {
        type: 'MOVE_ACK',
        payload: { status: 'error', cell, code: errorCode },
      };
      ws.send(JSON.stringify(data));
      return;
    }
    const winnerState = lobbyData.gameState.winnerState();
    if (winnerState) {
      lobbyData.gameState.startNewGame();
    }
    lobbyData.players.forEach((p) => {
      const data: ISocketData = {
        type: 'MOVE_ACK',
        payload: {
          cell,
          status: 'success',
          isAcknowledgment: p.playerId === playerId,
        },
      };
      p.send(JSON.stringify(data));
    });
  }

  // Remove all saved data of this client
  removeClientData(ws: IExtendedSocket) {
    const { playerId, lobbyId } = ws;
    if (!playerId || !lobbyId) {
      return;
    }
    const lobbyData = this.#lobbies.get(lobbyId);
    if (lobbyData) {
      lobbyData.players.forEach((player) => player.close());
      this.#lobbies.delete(lobbyId);
    }
    // Remove any switch request made from this player or made to join this lobby
    this.#switchRequests.forEach((requestData, requestKey) => {
      if (requestData.playerId === playerId || requestKey === lobbyId) {
        this.#switchRequests.delete(requestKey);
      }
    });
  }
}
