'use client';

import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { useOverlayTriggerState } from 'react-stately';

// Framer
import { LazyMotion, domMax } from 'framer-motion';

// Types
import type {
  PlayMode,
  WebWorkerEvent,
  JoinLobbyFormData,
  IPendingSwitchLobbyData,
} from '../utils/types';
import {
  GameState,
  ERROR_CODE,
  LOCAL_PLAYER_ID,
  HEARTBEAT_VALUE,
  HEARTBEAT_OFFSET,
  HEARTBEAT_INTERVAL,
  type ISocketData,
  type IPlayerState,
  type GameWinnerState,
  type ISocketMoveData,
  type IConnectionState,
  type ISocketKnownError,
  type ISocketJoinAckData,
  type ISocketOpenAckData,
  type ISocketMoveAckData,
  type ISocketCloseAckData,
  type ISocketGameStateData,
  type ISocketGameStateAckData,
  type ISocketSwitchLobbyRequestAckData,
  type ISocketSwitchLobbyResponseAckData,
} from '@projects-nx-mono/tic-tac-toe-shared';

// Animations
import {
  playWinnerAnimation,
  playBoardResetAnimation,
  playInitialSetupAnimation,
} from '../utils/animations';

// Components
import {
  GameScore,
  GameBoard,
  ErrorModal,
  GameFooter,
  TurnReminder,
  TurnIndicator,
  SwitchRequestToast,
  InternetConnectionStatus,
} from '../components';

const MOVE_SYNC_ERRORS: ISocketKnownError[] = [
  ERROR_CODE.NOT_MY_TURN,
  ERROR_CODE.MOVE_IN_INVALID_CELL,
  ERROR_CODE.MOVE_IN_FINISHED_GAME,
];

let serverPingTimeout: NodeJS.Timeout;

interface IOnlinePlayData {
  lobbyId: string | null;
  playerId: string | null;
}

const Game: React.FC = () => {
  const webWorker = useRef<Worker>();
  const webSocket = useRef<WebSocket>();

  const gameState = useRef<GameState>(new GameState());
  const [connectionState, setConnectionState] = useState<IConnectionState[]>(
    [],
  );
  const [reactiveGameState, setReactiveGameState] = useState(
    structuredClone(gameState.current.state()),
  );
  const [onlinePlayData, setOnlinePlayData] = useState<IOnlinePlayData>({
    lobbyId: localStorage.getItem('lobby'),
    playerId: localStorage.getItem('player'),
  });
  const [playMode, setPlayMode] = useState<PlayMode>('local-multiplayer');

  // General state
  const [switchRequestData, setSwitchRequestData] =
    useState<IPendingSwitchLobbyData>({
      status: 'idle',
      validUntil: null,
      isInitiator: null,
    });
  const [isJoiningLobby, setIsJoiningLobby] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isInitiatingConnection, setIsInitiatingConnection] = useState(
    () => typeof localStorage.getItem('lobby') === 'string',
  );
  const [isCreatingLobby, setIsCreatingLobby] = useState(false);
  const [errorCode, setErrorCode] = useState<ISocketKnownError | null>(null);

  // Modals
  const onlinePlayModalState = useOverlayTriggerState({});
  const errorModalState = useOverlayTriggerState({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openErrorModal = useCallback(errorModalState.open, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openOnlinePlayModal = useCallback(onlinePlayModalState.open, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const closeOnlinePlayModal = useCallback(onlinePlayModalState.close, []);

  const handleWebSocketKnownError = useCallback(
    (code: ISocketKnownError) => {
      setErrorCode(code);
      switch (code) {
        case ERROR_CODE.USER_IS_OFFLINE:
        case ERROR_CODE.LOBBY_NOT_FOUND:
        case ERROR_CODE.PLAYER_LEFT_GAME:
        case ERROR_CODE.GAME_ALREADY_FULL:
        case ERROR_CODE.SOCKET_TERMINATED:
        case ERROR_CODE.LOBBY_LIMIT_REACHED:
        case ERROR_CODE.ANOTHER_REQUEST_PENDING:
        case ERROR_CODE.SWITCH_LOBBY_REQUEST_NOT_VALID:
        case ERROR_CODE.CAN_NOT_LEAVE_GAME_IN_PROGRESS:
        case ERROR_CODE.SWITCHED_LOBBY_SAME_AS_ORIGINAL:
          openErrorModal();
          break;
        default:
          break;
      }
    },
    [openErrorModal],
  );

  const isSwitchRequestToastOpen = useMemo(
    () =>
      switchRequestData.status !== 'idle' &&
      typeof switchRequestData.validUntil === 'number',
    [switchRequestData.status, switchRequestData.validUntil],
  );

  const restartGame = useCallback(() => {
    gameState.current = new GameState();
    setReactiveGameState(structuredClone(gameState.current.state()));
    setPlayMode((prev) =>
      prev === 'online-multiplayer' ? 'local-multiplayer' : prev,
    );
  }, []);

  const unsetLocalIdentifiers = useCallback(() => {
    setOnlinePlayData({ lobbyId: null, playerId: null });
    localStorage.removeItem('lobby');
    localStorage.removeItem('player');
  }, []);

  const setLocalIdentifiers = useCallback((data: Partial<IOnlinePlayData>) => {
    setOnlinePlayData((prev) => ({ ...prev, ...data }));
    if (typeof data.lobbyId === 'string') {
      localStorage.setItem('lobby', data.lobbyId);
    }
    if (typeof data.playerId === 'string') {
      localStorage.setItem('player', data.playerId);
    }
  }, []);

  const closeWS = useCallback(() => {
    if (webSocket.current) {
      const socket = webSocket.current;
      socket.readyState === WebSocket.CONNECTING
        ? socket.addEventListener('open', () => socket.close())
        : socket.close();
    }
    webSocket.current = undefined;
  }, []);

  const updateConnectionStatus = useCallback(
    (playerId: string, state: 'open' | 'close') => {
      setConnectionState((prev) => {
        let isFound = false;
        const newState: Array<IConnectionState> = prev.map((item) => {
          if (item.id === playerId) {
            isFound = true;
            return { ...item, state: state };
          }
          return { ...item };
        });
        if (!isFound) {
          newState.push({ id: playerId, state: state });
        }
        return newState;
      });
    },
    [],
  );

  const broadCastCellClick = useCallback((cell: number) => {
    const data: ISocketMoveData = { type: 'MOVE', payload: cell };
    webSocket.current && webSocket.current.send(JSON.stringify(data));
    return;
  }, []);

  const handleCellClick = useCallback(
    async (cell: number, playMode: PlayMode, withBroadcast?: boolean) => {
      // Playing online
      if (playMode === 'online-multiplayer') {
        if (!navigator.onLine) {
          handleWebSocketKnownError(ERROR_CODE.USER_IS_OFFLINE);
          return;
        }
        if (
          !webSocket.current ||
          webSocket.current.readyState !== WebSocket.OPEN
        ) {
          handleWebSocketKnownError(ERROR_CODE.OTHER);
          return;
        }
        if (withBroadcast) {
          broadCastCellClick(cell);
        }
      }
      // PvP and PvC
      try {
        gameState.current.registerMove(cell);
        setReactiveGameState(structuredClone(gameState.current.state()));
      } catch (err) {
        console.error('Cell click error');
      }
    },
    [broadCastCellClick, handleWebSocketKnownError],
  );

  const joinOnlineGame = useCallback(
    (
      boardState?: string,
      winnerState?: GameWinnerState,
      playerState?: Array<IPlayerState>,
    ) => {
      gameState.current = new GameState(boardState, winnerState, playerState);
      setReactiveGameState(structuredClone(gameState.current.state()));
      if (Array.isArray(playerState)) {
        setConnectionState(
          playerState.map((player) => ({ id: player.id, state: 'open' })),
        );
      }
      setPlayMode('online-multiplayer');
    },
    [],
  );

  const handleGameStateSync = useCallback(
    (payload: ISocketGameStateAckData['payload']) => {
      setIsInitiatingConnection(false);
      if (payload.status === 'error') {
        restartGame();
        handleWebSocketKnownError(payload.code);
        return;
      }
      joinOnlineGame(
        payload.boardState,
        payload.winnerState,
        payload.playerState,
      );
      return;
    },
    [restartGame, joinOnlineGame, handleWebSocketKnownError],
  );

  // Sets local identifiers (playerId and lobbyId)
  const handleFirstTimeConnect = useCallback(
    (payload: ISocketOpenAckData['payload']) => {
      setIsCreatingLobby(false);
      setIsInitiatingConnection(false);
      if (payload.status === 'error') {
        // If lobby is not found and this event is received it means that the user is not yet part of a game.
        // If he was he would receive GET_STATE_ACK
        // So fail silently
        if (payload.code !== ERROR_CODE.LOBBY_NOT_FOUND) {
          handleWebSocketKnownError(payload.code);
        }
        unsetLocalIdentifiers();
        closeWS();
        return;
      }
      const storedLobbyId = localStorage.getItem('lobby');
      setLocalIdentifiers({
        lobbyId: payload.lobbyId,
        playerId: payload.playerId,
      });
      if (!storedLobbyId) {
        openOnlinePlayModal();
      }
    },
    [
      closeWS,
      openOnlinePlayModal,
      setLocalIdentifiers,
      unsetLocalIdentifiers,
      handleWebSocketKnownError,
    ],
  );

  // Sets the connection status of every player (the dot on top)
  const handlePlayerJoinGame = useCallback(
    (payload: ISocketJoinAckData['payload']) => {
      setIsInitiatingConnection(false);
      if (payload.status === 'error') {
        handleWebSocketKnownError(payload.code);
        setConnectionState([]);
        unsetLocalIdentifiers();
        closeWS();
        return;
      }
      updateConnectionStatus(payload.playerId, 'open');
    },
    [
      closeWS,
      unsetLocalIdentifiers,
      updateConnectionStatus,
      handleWebSocketKnownError,
    ],
  );

  const handleLobbySwitchAcknowledgment = useCallback(
    (payload: ISocketSwitchLobbyRequestAckData['payload']) => {
      setIsJoiningLobby(false);
      if (payload.status === 'error') {
        closeOnlinePlayModal();
        handleWebSocketKnownError(payload.code);
        if (payload.code === ERROR_CODE.OTHER) {
          unsetLocalIdentifiers();
          closeWS();
          return;
        }
        return;
      }
      setSwitchRequestData({
        status: 'pending',
        validUntil: payload.validUntil,
        isInitiator: payload.isInitiator,
      });
      closeOnlinePlayModal();
    },
    [
      closeWS,
      closeOnlinePlayModal,
      unsetLocalIdentifiers,
      handleWebSocketKnownError,
    ],
  );

  const handleLobbySwitchResponse = useCallback(
    (payload: ISocketSwitchLobbyResponseAckData['payload']) => {
      switch (payload.status) {
        case 'error':
          handleWebSocketKnownError(payload.code);
          setSwitchRequestData((prev) => ({
            ...prev,
            status: 'rejected',
          }));
          break;
        case 'reject':
          setSwitchRequestData((prev) => ({
            ...prev,
            status: 'rejected',
          }));
          break;
        case 'accept':
          // If I am the one that will be switched to new lobby
          if (payload.isInitiator) {
            closeWS();
            setLocalIdentifiers({ lobbyId: payload.lobbyId });
            setSwitchRequestData((prev) => ({
              ...prev,
              status: 'accepted',
            }));
            return;
          }
          // Close current websocket so another one can be opened with the correct identifiers
          joinOnlineGame(undefined, undefined, payload.playerState);
          break;
      }
    },
    [closeWS, joinOnlineGame, setLocalIdentifiers, handleWebSocketKnownError],
  );

  const handlePlayerMove = useCallback(
    (payload: ISocketMoveAckData['payload']) => {
      if (payload.status === 'error') {
        if (
          navigator.onLine &&
          webSocket.current &&
          MOVE_SYNC_ERRORS.includes(payload.code) &&
          webSocket.current.readyState === WebSocket.OPEN
        ) {
          const data: ISocketGameStateData = {
            type: 'GET_STATE',
            payload: null,
          };
          webSocket.current.send(JSON.stringify(data));
        } else if (payload.code === ERROR_CODE.OTHER) {
          unsetLocalIdentifiers();
          closeWS();
          setConnectionState([]);
          restartGame();
          handleWebSocketKnownError(payload.code);
        }
        return;
      }
      // isAcknowledgment - Server sends a acknowledgment that your move has been registered
      if (!payload.isAcknowledgment) {
        // Whatever the case may be, do not rebroadcast this click
        handleCellClick(payload.cell, 'online-multiplayer', false);
      }
    },
    [
      closeWS,
      restartGame,
      handleCellClick,
      unsetLocalIdentifiers,
      handleWebSocketKnownError,
    ],
  );

  const handlePlayerDisconnect = useCallback(
    (payload: ISocketCloseAckData['payload']) => {
      // Can never fail
      if (payload.status === 'error') {
        return;
      }
      setConnectionState((prev) =>
        prev.map((item) => ({
          ...item,
          state: item.id === payload.id ? 'close' : item.state,
        })),
      );
    },
    [],
  );

  const requeueServerPing = useCallback(() => {
    if (serverPingTimeout) {
      clearTimeout(serverPingTimeout);
    }
    serverPingTimeout = setTimeout(() => {
      webSocket.current?.close();
      setPlayMode((prev) => {
        if (prev === 'online-multiplayer') {
          handleWebSocketKnownError(ERROR_CODE.SOCKET_TERMINATED);
        }
        return prev === 'online-multiplayer' ? 'local-multiplayer' : prev;
      });
    }, HEARTBEAT_INTERVAL + HEARTBEAT_OFFSET);
  }, [handleWebSocketKnownError]);

  const handleWebSocketOpen = useCallback(() => {
    requeueServerPing();
    setConnectionState((prev) =>
      prev.map((item) => ({
        ...item,
        state: item.id === LOCAL_PLAYER_ID ? 'open' : item.state,
      })),
    );
  }, [requeueServerPing]);

  const handleWebSocketError = useCallback(
    (error: unknown) => {
      console.info(error);
      restartGame();
      unsetLocalIdentifiers();
      setIsInitiatingConnection(false);
    },
    [restartGame, unsetLocalIdentifiers],
  );

  const handleWebSocketClose = useCallback(() => {
    if (serverPingTimeout) {
      clearTimeout(serverPingTimeout);
    }
    setConnectionState((prev) =>
      prev.map((item) => ({
        ...item,
        state: item.id === LOCAL_PLAYER_ID ? 'close' : item.state,
      })),
    );
  }, []);

  const handlePlayerLeaveGame = useCallback(() => {
    restartGame();
    unsetLocalIdentifiers();
    handleWebSocketKnownError(ERROR_CODE.PLAYER_LEFT_GAME);
  }, [restartGame, unsetLocalIdentifiers, handleWebSocketKnownError]);

  const handleServerAlivePing = useCallback(
    async (data: Blob) => {
      const parsedData = JSON.parse(await data.text());
      if (parsedData !== HEARTBEAT_VALUE) {
        return;
      }
      requeueServerPing();
      // Send pong
      const pongData = new Uint8Array(1);
      pongData[0] = HEARTBEAT_VALUE;
      if (
        navigator.onLine &&
        webSocket.current &&
        webSocket.current.readyState === WebSocket.OPEN
      ) {
        webSocket.current.send(pongData);
      }
    },
    [requeueServerPing],
  );

  const handleWebSocketMessage = useCallback(
    async (message: MessageEvent<string | Blob>) => {
      if (message.data instanceof Blob) {
        handleServerAlivePing(message.data);
        return;
      }
      const messageData = JSON.parse(message.data) as ISocketData;
      switch (messageData.type) {
        case 'OPEN_ACK':
          handleFirstTimeConnect(messageData.payload);
          break;
        case 'JOIN_ACK':
          handlePlayerJoinGame(messageData.payload);
          break;
        case 'SWITCH_LOBBY_REQUEST_ACK':
          handleLobbySwitchAcknowledgment(messageData.payload);
          break;
        case 'SWITCH_LOBBY_RESPONSE_ACK':
          handleLobbySwitchResponse(messageData.payload);
          break;
        case 'MOVE_ACK':
          handlePlayerMove(messageData.payload);
          break;
        case 'GET_STATE_ACK':
          handleGameStateSync(messageData.payload);
          break;
        case 'LEAVE_LOBBY_ACK':
          handlePlayerLeaveGame();
          break;
        case 'CLOSE_ACK':
          handlePlayerDisconnect(messageData.payload);
          break;
        default:
          break;
      }
    },
    [
      handlePlayerMove,
      handleGameStateSync,
      handlePlayerJoinGame,
      handleServerAlivePing,
      handlePlayerLeaveGame,
      handleFirstTimeConnect,
      handlePlayerDisconnect,
      handleLobbySwitchResponse,
      handleLobbySwitchAcknowledgment,
    ],
  );

  const handleWebWorkerMessage = useCallback(
    (event: MessageEvent<WebWorkerEvent>) => {
      switch (event.data.type) {
        case 'best-move-found':
          if (typeof event.data.cell === 'number') {
            handleCellClick(event.data.cell, 'versus-computer');
          }
      }
    },
    [handleCellClick],
  );

  const handleWebWorkerError = useCallback((error: ErrorEvent) => {
    console.log(error.message);
  }, []);

  const connectToWS = useCallback(() => {
    // Close current WS if any
    closeWS();

    if (!process.env.NEXT_PUBLIC_WS_URL) {
      throw new Error('Invalid env config');
    }

    const wsURL = new URL(process.env.NEXT_PUBLIC_WS_URL);

    if (typeof onlinePlayData.lobbyId === 'string') {
      wsURL.searchParams.append('lobby', onlinePlayData.lobbyId);
    }

    if (typeof onlinePlayData.playerId === 'string') {
      wsURL.searchParams.append('player', onlinePlayData.playerId);
    }

    webSocket.current = new WebSocket(wsURL.href);

    webSocket.current.addEventListener('open', handleWebSocketOpen);
    webSocket.current.addEventListener('error', handleWebSocketError);
    webSocket.current.addEventListener('close', handleWebSocketClose);
    webSocket.current.addEventListener('message', handleWebSocketMessage);
  }, [
    closeWS,
    handleWebSocketOpen,
    handleWebSocketClose,
    handleWebSocketError,
    handleWebSocketMessage,
    onlinePlayData.lobbyId,
    onlinePlayData.playerId,
  ]);

  // Versus-computer move logic
  useEffect(() => {
    if (playMode !== 'versus-computer') {
      return;
    }
    const mySymbol = reactiveGameState.mySymbol;
    const playingSymbol = reactiveGameState.playingSymbol;
    if (mySymbol !== playingSymbol && webWorker.current) {
      const webWorkerMessage: WebWorkerEvent = {
        type: 'best-move',
        boardState: reactiveGameState.stringifiedBoardState,
      };
      webWorker.current.postMessage(webWorkerMessage);
    }
  }, [
    playMode,
    reactiveGameState.mySymbol,
    reactiveGameState.playingSymbol,
    reactiveGameState.stringifiedBoardState,
  ]);

  // Initial animation
  useEffect(() => {
    if (!isInitiatingConnection) {
      playInitialSetupAnimation();
    }
  }, [isInitiatingConnection]);

  // Winner state logic
  useEffect(() => {
    async function handleGameEnd() {
      if (!reactiveGameState.winnerState) {
        return;
      }
      if (reactiveGameState.winnerState.winner !== 'draw') {
        await playWinnerAnimation(reactiveGameState.winnerState.winningCells);
      }
      await playBoardResetAnimation();
      gameState.current.startNewGame();
      setReactiveGameState(structuredClone(gameState.current.state()));
    }
    handleGameEnd();
  }, [reactiveGameState.winnerState]);

  // WebSocket
  useEffect(() => {
    // Open Websocket by default if user is part of a game lobby
    const withDefaultOpen =
      onlinePlayData.lobbyId && onlinePlayData.playerId && !webSocket.current;
    if (withDefaultOpen) {
      connectToWS();
    }
    return () => {
      // Only close the websocket here if it was opened by this effect
      if (withDefaultOpen) {
        closeWS();
      }
    };
  }, [onlinePlayData.lobbyId, onlinePlayData.playerId, connectToWS, closeWS]);

  // WebWorker
  useEffect(() => {
    webWorker.current = new Worker('/workers/game-worker.js', {
      type: 'module',
    });
    webWorker.current.addEventListener('error', handleWebWorkerError);
    webWorker.current.addEventListener('message', handleWebWorkerMessage);

    return () => {
      if (webWorker.current) {
        webWorker.current.removeEventListener(
          'message',
          handleWebWorkerMessage,
        );
        webWorker.current.removeEventListener('error', handleWebWorkerError);
        webWorker.current.terminate();
      }
    };
  }, [handleWebWorkerMessage, handleWebWorkerError]);

  // Online Indicator
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (
        !webSocket.current ||
        webSocket.current.readyState === WebSocket.CLOSED ||
        webSocket.current.readyState === WebSocket.CLOSING
      ) {
        connectToWS();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [connectToWS]);

  const isPlayMode = (mode: string): mode is PlayMode => {
    return [
      'versus-computer',
      'local-multiplayer',
      'online-multiplayer',
    ].includes(mode);
  };

  const handleModeChange = (mode: string) => {
    if (!isPlayMode(mode) || mode === playMode) {
      return;
    }
    setPlayMode(mode);
    gameState.current = new GameState();
    setReactiveGameState(structuredClone(gameState.current.state()));
  };

  const handleJoinLobby = (formData: JoinLobbyFormData) => {
    if (!navigator.onLine) {
      handleWebSocketKnownError(ERROR_CODE.USER_IS_OFFLINE);
      return;
    }
    if (!webSocket.current || webSocket.current.readyState !== WebSocket.OPEN) {
      handleWebSocketKnownError(ERROR_CODE.OTHER);
      return;
    }
    setIsJoiningLobby(true);
    const data: ISocketData = {
      type: 'SWITCH_LOBBY_REQUEST',
      payload: { lobbyId: formData.id },
    };
    webSocket.current.send(JSON.stringify(data));
  };

  const handleOnlineModalOpen = async () => {
    if (isSwitchRequestToastOpen) {
      return;
    }
    if (!navigator.onLine) {
      handleWebSocketKnownError(ERROR_CODE.USER_IS_OFFLINE);
      return;
    }
    if (
      webSocket.current &&
      onlinePlayData.lobbyId &&
      onlinePlayData.playerId &&
      webSocket.current.readyState === WebSocket.OPEN
    ) {
      openOnlinePlayModal();
      return;
    }
    setIsCreatingLobby(true);
    connectToWS();
  };

  const handleOnlinePlayDisconnect = () => {
    if (
      navigator.onLine &&
      webSocket.current &&
      webSocket.current.readyState === WebSocket.OPEN
    ) {
      const data: ISocketData = { type: 'LEAVE_LOBBY', payload: null };
      webSocket.current.send(JSON.stringify(data));
    }
    unsetLocalIdentifiers();
    restartGame();
  };

  // Switch request has finished the entire waiting duration without getting a response
  const handleSwitchRequestExtraTimeFinish = () => {
    setSwitchRequestData((prev) => ({
      ...prev,
      // If this status has been set to a different one (maybe from an event from WS) do not overwrite it
      status: prev.status === 'overtime' ? 'timeout' : prev.status,
    }));
  };

  // Switch request has waiting for the regular time and now it has entered the buffer time
  const handleSwitchRequestRegularTimeFinish = () => {
    setSwitchRequestData((prev) => {
      // If I am the initiator
      if (prev.isInitiator) {
        return {
          ...prev,
          // If this status has been set to a different one (maybe from an event from WS) do not overwrite it
          status: prev.status === 'pending' ? 'overtime' : prev.status,
        };
      }
      // If I am the receiver
      // On regular time finish the request is no longer valid. Close the toast
      return {
        status: 'idle',
        validUntil: null,
        isInitiator: false,
      };
    });
  };

  const handleSwitchRequestDecision = (decision: 'accept' | 'reject') => {
    handleSwitchRequestClose();
    if (!navigator.onLine) {
      handleWebSocketKnownError(ERROR_CODE.USER_IS_OFFLINE);
      return;
    }
    if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
      const data: ISocketData = {
        type: 'SWITCH_LOBBY_RESPONSE',
        payload: decision,
      };
      webSocket.current.send(JSON.stringify(data));
    }
    handleWebSocketKnownError(ERROR_CODE.OTHER);
  };

  const handleSwitchRequestClose = () => {
    setSwitchRequestData({
      status: 'idle',
      isInitiator: false,
      validUntil: null,
    });
  };

  const isOnlinePlayDisabled = useMemo(
    () => isCreatingLobby || errorModalState.isOpen || isSwitchRequestToastOpen,
    [errorModalState.isOpen, isCreatingLobby, isSwitchRequestToastOpen],
  );

  if (isInitiatingConnection) {
    return null;
  }

  return (
    <LazyMotion features={domMax} strict>
      <div className="grid h-full w-full grid-cols-1 gap-4 p-6 landscape:grid-cols-3">
        <InternetConnectionStatus isOnline={isOnline} />
        <GameScore
          playMode={playMode}
          connectionState={connectionState}
          turn={reactiveGameState.playingSymbol}
          players={reactiveGameState.playerState}
        />
        <section className="flex w-full flex-col items-center justify-center gap-12 pt-12">
          <GameBoard
            playMode={playMode}
            onCellClick={handleCellClick}
            mySymbol={reactiveGameState.mySymbol}
            turn={reactiveGameState.playingSymbol}
            boardState={reactiveGameState.boardState}
            winnerState={reactiveGameState.winnerState}
          />
          <TurnIndicator
            mySymbol={reactiveGameState.mySymbol}
            turn={reactiveGameState.playingSymbol}
          />
        </section>
        <GameFooter
          playMode={playMode}
          onJoinLobby={handleJoinLobby}
          isJoiningLobby={isJoiningLobby}
          onModeChange={handleModeChange}
          lobbyId={onlinePlayData.lobbyId}
          isCreatingLobby={isCreatingLobby}
          onDisconnect={handleOnlinePlayDisconnect}
          onlinePlayModalState={onlinePlayModalState}
          isOnlineModalDisabled={isOnlinePlayDisabled}
          onOnlineModalOpenPress={handleOnlineModalOpen}
        />
      </div>
      <TurnReminder
        playMode={playMode}
        mySymbol={reactiveGameState.mySymbol}
        playingSymbol={reactiveGameState.playingSymbol}
      />
      <ErrorModal errorCode={errorCode} modalState={errorModalState} />
      <SwitchRequestToast
        status={switchRequestData.status}
        isOpen={isSwitchRequestToastOpen}
        onClose={handleSwitchRequestClose}
        validUntil={switchRequestData.validUntil}
        isInitiator={switchRequestData.isInitiator}
        onRequestDecision={handleSwitchRequestDecision}
        onExtraTimeFinish={handleSwitchRequestExtraTimeFinish}
        onRegularTimeFinish={handleSwitchRequestRegularTimeFinish}
      />
    </LazyMotion>
  );
};

export default Game;
