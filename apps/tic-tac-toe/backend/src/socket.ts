import { Duplex } from 'stream';
import { WebSocketServer } from 'ws';
import type { IncomingMessage, Server } from 'http';

import { Lobby } from './lobby';

// Types
import {
  ISocketData,
  USER_ID_LEN,
  LOBBY_ID_LEN,
  IExtendedSocket,
  HEARTBEAT_VALUE,
  HEARTBEAT_INTERVAL,
} from '@projects-nx-mono/tic-tac-toe-shared';

import { lobbyIdValidator, userIdValidator } from './utils/validators';

const SOCKET = new WebSocketServer({ noServer: true });

const IP_CON_CNT = new Map<string, number>();

const LOBBIES = new Lobby();

if (
  !process.env.TTT_MAX_LOBBIES ||
  !process.env.TTT_MAX_CONNECTIONS ||
  !process.env.TTT_MAX_CONNECTIONS_PER_IP
) {
  throw new Error('Invalid env config');
}

const MAX_CONNECTIONS = parseInt(process.env.TTT_MAX_CONNECTIONS);
const MAX_CONNECTIONS_PER_IP = parseInt(process.env.TTT_MAX_CONNECTIONS_PER_IP);

(function terminateDeadClientsInterval() {
  setInterval(() => {
    SOCKET.clients.forEach((client: IExtendedSocket) => {
      if (!client.isAlive) {
        client.terminate();
        // Remove this clients requests and lobbies
        LOBBIES.removeClientData(client);
        return;
      }
      client.isAlive = false;
      // Ping client
      client.send(HEARTBEAT_VALUE, { binary: true });
    });
  }, HEARTBEAT_INTERVAL);
})();

function handleSocketUpgradeError(error: Error) {
  console.error(error);
}

function handleSocketConnectionError(error: Error) {
  console.error(error);
}

async function handleServerUpgrade(
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
) {
  socket.on('error', handleSocketUpgradeError);

  const socketIP = req.socket.remoteAddress ?? '';

  const ipConnCount = IP_CON_CNT.get(socketIP);

  const isIPLimitReached =
    typeof ipConnCount === 'number' && ipConnCount >= MAX_CONNECTIONS_PER_IP;
  const isConnLimitReached = SOCKET.clients.size >= MAX_CONNECTIONS;

  if (isConnLimitReached || isIPLimitReached) {
    socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
    socket.destroy();
    return;
  }

  let searchParamPlayerId: string | null = null;
  let searchParamLobbyId: string | null = null;

  if (req.url) {
    const url = new URL(req.url, `ws://${req.headers.host}`);
    searchParamPlayerId = url.searchParams.get('player');
    searchParamLobbyId = url.searchParams.get('lobby');
  }

  const parsedPlayerId = userIdValidator.safeParse(searchParamPlayerId);
  const parsedLobbyId = lobbyIdValidator.safeParse(searchParamLobbyId);

  SOCKET.handleUpgrade(req, socket, head, (ws: IExtendedSocket) => {
    socket.removeListener('error', handleSocketUpgradeError);
    if (parsedPlayerId.success) {
      ws.playerId = parsedPlayerId.data;
    }
    if (parsedLobbyId.success) {
      ws.lobbyId = parsedLobbyId.data;
    }
    SOCKET.emit('connection', ws, req);
  });
}

SOCKET.on('connection', (ws: IExtendedSocket, req: IncomingMessage) => {
  ws.isAlive = true;

  const withOnlyLobbyId = ws.lobbyId && !ws.playerId;
  const withOnlyPlayerId = ws.playerId && !ws.lobbyId;

  // If a WS only has one of identifiers present it is in a bad state, terminate it.
  if (withOnlyLobbyId || withOnlyPlayerId) {
    ws.terminate();
    return;
  }

  // Assigning identifiers for first time connections
  if (!ws.playerId && !ws.lobbyId) {
    ws.playerId = LOBBIES.generateRandomID(USER_ID_LEN);
    ws.lobbyId = LOBBIES.generateRandomID(LOBBY_ID_LEN);
    LOBBIES.createLobbyAndGame(ws);
  }
  // Guaranteed that WS has both identifiers at this point
  else {
    LOBBIES.sendConnectionAcknowledgment(ws);
  }

  // Incrementing connection count (per IP)
  const socketIP = req.socket.remoteAddress ?? '';
  IP_CON_CNT.set(socketIP, (IP_CON_CNT.get(socketIP) ?? 0) + 1);

  ws.on('error', handleSocketConnectionError);
  ws.on('message', function onMessageReceived(data, isBinary) {
    // Heartbeat
    if (isBinary && (data as never)[0] === HEARTBEAT_VALUE) {
      ws.isAlive = true;
      return;
    }
    const parsedData = JSON.parse(data.toString()) as ISocketData;
    switch (parsedData.type) {
      case 'MOVE':
        LOBBIES.registerPlayerMove(ws, parsedData.payload);
        break;
      case 'SWITCH_LOBBY_REQUEST':
        LOBBIES.registerSwitchLobbyRequest(ws, parsedData.payload);
        break;
      case 'SWITCH_LOBBY_RESPONSE':
        parsedData.payload === 'reject'
          ? LOBBIES.processSwitchLobbyDecline(ws)
          : LOBBIES.processSwitchLobbyAccept(ws);
        break;
      case 'LEAVE_LOBBY':
        LOBBIES.removePlayerFromLobbyAndGame(ws);
        break;
      case 'GET_STATE':
        LOBBIES.sendCurrentGameState(ws);
    }
  });
  ws.on('close', () => {
    // Decrementing the connection count (per IP)
    IP_CON_CNT.set(socketIP, (IP_CON_CNT.get(socketIP) ?? 1) - 1);
    IP_CON_CNT.get(socketIP) === 0 && IP_CON_CNT.delete(socketIP);
    LOBBIES.removePlayerFromLobby(ws);
  });
});

export function configureWebSocket(server: Server) {
  server.on('upgrade', handleServerUpgrade);
}
