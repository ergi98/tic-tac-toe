import { z } from 'zod';
import { joinLobbyValidator } from './validators';

export type PlayMode =
  | 'online-multiplayer'
  | 'versus-computer'
  | 'local-multiplayer';

type WebWorkerBestMove = {
  type: 'best-move';
  boardState: string;
};

type WebWorkerBestMoveFound = {
  type: 'best-move-found';
  cell?: number | undefined;
};

export type CopyErrorType = 'generic' | 'copy' | 'share';

export type WebWorkerEvent = WebWorkerBestMove | WebWorkerBestMoveFound;

export interface IRequestState {
  errorMessage: string;
  status: 'loading' | 'error' | 'success';
}

export type JoinLobbyFormData = z.infer<typeof joinLobbyValidator>;

export interface IPendingSwitchLobbyData {
  validUntil: number | null;
  isInitiator: boolean | null;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'overtime' | 'idle';
}
