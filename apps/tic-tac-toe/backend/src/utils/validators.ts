import { z } from 'zod';

import {
  USER_ID_LEN,
  LOBBY_ID_LEN,
} from '@projects-nx-mono/tic-tac-toe-shared';

export const userIdValidator = z
  .string()
  .length(USER_ID_LEN)
  .trim()
  .toUpperCase();

export const lobbyIdValidator = z
  .string()
  .length(LOBBY_ID_LEN)
  .trim()
  .toUpperCase();
