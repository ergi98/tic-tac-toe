import { z } from 'zod';

import { LOBBY_ID_LEN } from '@projects-nx-mono/tic-tac-toe-shared';

export const lobbyIdValidator = z
  .string({
    required_error: 'Lobby identifier is required!',
    invalid_type_error: 'Lobby identifier is not in the correct format!',
  })
  .length(LOBBY_ID_LEN, 'Lobby identifier is not in the correct format!')
  .trim()
  .toUpperCase();

export const joinLobbyValidator = z.object({ id: lobbyIdValidator }).strict();
