import React from 'react';
import { render, screen } from '../../../../test_utils';

import GameScore from './GameScore';
import {
  LOCAL_PLAYER_ID,
  ONLINE_PLAYER_ID,
} from '@projects-nx-mono/tic-tac-toe-shared';
import { MAX_DISPLAY_SCORE } from '../../utils/constants';

describe('GameScore', () => {
  it('should render correctly for local multiplayer game mode', () => {
    render(
      <GameScore
        playMode="local-multiplayer"
        turn="O"
        players={[
          { id: LOCAL_PLAYER_ID, score: 0, symbol: 'X' },
          { id: ONLINE_PLAYER_ID, score: 0, symbol: 'O' },
        ]}
        connectionState={[]}
      />,
    );

    const players = screen.getAllByTitle('human');

    expect(players).toHaveLength(2);
  });

  it('should render correctly for versus computer game mode', () => {
    render(
      <GameScore
        playMode="versus-computer"
        turn="O"
        players={[
          { id: LOCAL_PLAYER_ID, score: 0, symbol: 'X' },
          { id: ONLINE_PLAYER_ID, score: 0, symbol: 'O' },
        ]}
        connectionState={[]}
      />,
    );

    const playerOne = screen.getByTitle('human');
    const playerTwo = screen.getByTitle('robot');

    expect(playerOne).toBeInTheDocument();
    expect(playerTwo).toBeInTheDocument();
  });

  it('should render correctly for online multiplayer game mode', () => {
    render(
      <GameScore
        playMode="online-multiplayer"
        turn="O"
        players={[
          { id: LOCAL_PLAYER_ID, score: 0, symbol: 'X' },
          { id: ONLINE_PLAYER_ID, score: 0, symbol: 'O' },
        ]}
        connectionState={[]}
      />,
    );

    const playerOne = screen.getByTitle('human');
    const playerTwo = screen.getByTitle('online');

    expect(playerOne).toBeInTheDocument();
    expect(playerTwo).toBeInTheDocument();
  });

  it('should display player turn correctly', () => {
    render(
      <GameScore
        playMode="online-multiplayer"
        turn="X"
        players={[
          { id: LOCAL_PLAYER_ID, score: 0, symbol: 'X' },
          { id: ONLINE_PLAYER_ID, score: 0, symbol: 'O' },
        ]}
        connectionState={[]}
      />,
    );

    const playerOne = screen.getByTestId('my-score');
    const playerTwo = screen.getByTestId('opponent-score');

    const playerOneTurnIndicator = playerOne.querySelector('.turn-indicator');
    const playerTwoTurnIndicator = playerTwo.querySelector('.turn-indicator');

    expect(playerOneTurnIndicator).toBeDefined();
    expect(playerTwoTurnIndicator).toBeNull();
  });

  it('should display + if score is more than max score', () => {
    render(
      <GameScore
        playMode="online-multiplayer"
        turn="X"
        players={[
          { id: LOCAL_PLAYER_ID, score: MAX_DISPLAY_SCORE + 1, symbol: 'X' },
          { id: ONLINE_PLAYER_ID, score: 0, symbol: 'O' },
        ]}
        connectionState={[]}
      />,
    );

    const playerOne = screen.getByTestId('my-score');

    const score = playerOne.querySelector('.my-score');
    const plusSVG = playerOne.querySelector('.my-score-plus');

    expect(score).toHaveTextContent(MAX_DISPLAY_SCORE.toString());
    expect(plusSVG).toBeDefined();
  });

  it('should display connection status if playing online', () => {
    render(
      <GameScore
        playMode="online-multiplayer"
        turn="X"
        players={[
          { id: LOCAL_PLAYER_ID, score: 0, symbol: 'X' },
          { id: ONLINE_PLAYER_ID, score: 0, symbol: 'O' },
        ]}
        connectionState={[
          { id: LOCAL_PLAYER_ID, state: 'open' },
          { id: ONLINE_PLAYER_ID, state: 'open' },
        ]}
      />,
    );

    const playerOne = screen.getByTestId('my-score');
    const playerTwo = screen.getByTestId('opponent-score');

    const playerOneConnection = playerOne.querySelector('.connection-status');
    const playerTwoConnection = playerTwo.querySelector('.connection-status');

    expect(playerOneConnection).toBeDefined();
    expect(playerTwoConnection).toBeDefined();
  });
});
