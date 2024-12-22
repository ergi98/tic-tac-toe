import React from 'react';
import { render, screen, act } from '../../../../test_utils';

import userEvent from '@testing-library/user-event';

import GameBoard from './GameBoard';

describe('GameBoard', () => {
  it('should render successfully', () => {
    const cellClickHandler = jest.fn();
    render(
      <GameBoard
        turn="X"
        mySymbol="X"
        winnerState={undefined}
        playMode="local-multiplayer"
        onCellClick={cellClickHandler}
        boardState={['0', '0', '0', '0', '0', '0', '0', '0', '0']}
      />,
    );

    const board = screen.getByRole('grid');
    const boardCells = screen.getAllByRole('button');

    expect(board).toBeInTheDocument();
    expect(boardCells).toHaveLength(9);
  });

  it('should call click event when cell is pressed', async () => {
    const cellClickHandler = jest.fn();
    const user = userEvent.setup();
    render(
      <GameBoard
        turn="X"
        mySymbol="X"
        winnerState={undefined}
        playMode="local-multiplayer"
        onCellClick={cellClickHandler}
        boardState={['0', '0', '0', '0', '0', '0', '0', '0', '0']}
      />,
    );

    const boardCells = screen.getAllByRole('button');

    await act(async () => {
      for (const cell of boardCells) {
        await user.click(cell);
      }
    });

    expect(cellClickHandler).toHaveBeenCalledTimes(9);
  });

  it('should have correct classes for board cells based on occupancy', () => {
    const cellClickHandler = jest.fn();
    render(
      <GameBoard
        turn="X"
        mySymbol="X"
        winnerState={undefined}
        playMode="local-multiplayer"
        onCellClick={cellClickHandler}
        boardState={['X', '0', '0', '0', '0', '0', '0', '0', '0']}
      />,
    );

    const boardCells = screen.getAllByRole('button');

    const freeSymbolDiv = boardCells[1].querySelector('.cell-symbol');

    const occupiedSymbolDiv = boardCells[0].querySelector('.cell-symbol');

    expect(occupiedSymbolDiv).toBeDefined();
    expect(freeSymbolDiv).toBeNull();
  });

  it('should not call click handler when pressing on occupied cell', async () => {
    const cellClickHandler = jest.fn();
    const user = userEvent.setup();
    render(
      <GameBoard
        turn="X"
        mySymbol="X"
        winnerState={undefined}
        playMode="local-multiplayer"
        onCellClick={cellClickHandler}
        boardState={['O', '0', '0', '0', '0', '0', '0', '0', '0']}
      />,
    );

    const boardCells = screen.getAllByRole('button');

    await act(async () => {
      await user.click(boardCells[0]);
    });

    expect(boardCells[0]).toBeDisabled();
    expect(cellClickHandler).toHaveBeenCalledTimes(0);
  });

  describe('VersusComputer', () => {
    it('should not call click handler when it is not your turn', async () => {
      const cellClickHandler = jest.fn();
      const user = userEvent.setup();
      render(
        <GameBoard
          turn="X"
          mySymbol="O"
          winnerState={undefined}
          playMode="versus-computer"
          onCellClick={cellClickHandler}
          boardState={['X', '0', '0', '0', '0', '0', '0', '0', '0']}
        />,
      );

      const boardCells = screen.getAllByRole('button');

      await act(async () => {
        await user.click(boardCells[1]);
      });

      expect(cellClickHandler).toHaveBeenCalledTimes(0);
    });
  });

  describe('OnlineMultiplayer', () => {
    it('should not call click handler when it is not your turn', async () => {
      const cellClickHandler = jest.fn();
      const user = userEvent.setup();
      render(
        <GameBoard
          turn="X"
          mySymbol="O"
          winnerState={undefined}
          playMode="online-multiplayer"
          onCellClick={cellClickHandler}
          boardState={['X', '0', '0', '0', '0', '0', '0', '0', '0']}
        />,
      );

      const boardCells = screen.getAllByRole('button');

      await act(async () => {
        await user.click(boardCells[1]);
      });

      expect(cellClickHandler).toHaveBeenCalledTimes(0);
    });
  });
});
