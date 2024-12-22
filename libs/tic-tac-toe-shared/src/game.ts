import { ERROR_CODE } from './error-codes';
import {
  LOCAL_PLAYER_ID,
  ONLINE_PLAYER_ID,
  winningBoardCombinations,
} from './constants';
import type { IPlayerState, PlayerSymbol, GameWinnerState } from './types';

export class GameState {
  #startingBoardState = '000000000';
  #boardState: Array<string> = this.#startingBoardState.split('');
  #winnerState?: GameWinnerState;
  #playerState: Array<IPlayerState> = [
    { id: LOCAL_PLAYER_ID, score: 0, symbol: 'X' },
    { id: ONLINE_PLAYER_ID, score: 0, symbol: 'O' },
  ];

  constructor(
    boardState?: string,
    winnerState?: GameWinnerState,
    playerState?: Array<IPlayerState>,
  ) {
    if (boardState) {
      if (!new RegExp(/^[0XO]{9}$/).test(boardState)) {
        throw new Error('Invalid game state');
      }
      this.#boardState = boardState.split('');
    }
    if (Array.isArray(playerState)) {
      if (playerState?.length > 2) {
        throw new Error('Invalid player state');
      }
      this.#playerState = structuredClone(playerState);
    }
    if (winnerState) {
      this.#winnerState = structuredClone(winnerState);
    }
  }

  state() {
    return {
      mySymbol: this.me().symbol,
      boardState: this.boardState(),
      playerState: this.playerState(),
      winnerState: this.winnerState(),
      playingSymbol: this.playingSymbol(),
      stringifiedBoardState: this.boardState().join(''),
    };
  }

  winnerState() {
    return this.#winnerState;
  }

  isStartingBoardState() {
    return this.#startingBoardState === this.#boardState.join('');
  }

  startingBoardState() {
    return this.#startingBoardState;
  }

  boardState() {
    return this.#boardState;
  }

  playerState() {
    return this.#playerState;
  }

  me(id?: string) {
    const myData = this.#playerState.find(
      (player) => player.id === (id ?? LOCAL_PLAYER_ID),
    );
    if (!myData) {
      throw new Error(ERROR_CODE.PLAYER_NOT_FOUND);
    }
    return myData;
  }

  playingSymbol(state?: Array<string>): PlayerSymbol {
    const board = state ? state : this.#boardState;
    const crossMoves = board.filter((el) => el === 'X').length;
    const circleMoves = board.filter((el) => el === 'O').length;
    if ((circleMoves === 0 && crossMoves === 0) || circleMoves >= crossMoves) {
      return 'X';
    } else {
      return 'O';
    }
  }

  registerPlayer(id: string) {
    // Already part of game. Do nothing
    if (this.#playerState.find((player) => player.id === id)) {
      return;
    }
    // Game is already full
    if (this.#playerState?.length === 2) {
      throw new Error(ERROR_CODE.GAME_ALREADY_FULL);
    }
    // Generate random symbol for player and add to game
    const symbol =
      this.#playerState.length === 0
        ? this.#getRandomPlayerSymbol()
        : this.#getRemainingPlayerSymbol(this.#playerState[0].symbol);
    this.#playerState.push({ id, score: 0, symbol });
  }

  removePlayer(id: string) {
    this.#playerState = this.#playerState.filter((p) => p.id !== id);
    // Since the player has been removed the previous game state should not be relevant anymore
    this.startNewGame();
    this.resetPlayerScores();
  }

  resetPlayerScores() {
    this.#playerState = this.#playerState.map((p) => ({ ...p, score: 0 }));
  }

  registerMove(cell: number) {
    if (this.#winnerState) {
      // Move in a finished game
      throw new Error(ERROR_CODE.MOVE_IN_FINISHED_GAME);
    }
    if (
      this.#boardState[cell] === undefined ||
      this.#boardState[cell] !== '0'
    ) {
      // Move in an invalid cell
      throw new Error(ERROR_CODE.MOVE_IN_INVALID_CELL);
    }
    const symbol = this.playingSymbol();
    this.#boardState[cell] = symbol;
    const winnerState = this.#checkForWinner(symbol);
    if (winnerState) {
      this.#winnerState = winnerState;
      this.#updateScoreIfWinner();
    }
  }

  startNewGame() {
    this.#winnerState = undefined;
    this.#boardState = '000000000'.split('');
    // Swapping player symbols
    this.#playerState = this.#playerState.map((player) => ({
      ...player,
      symbol: this.#getRemainingPlayerSymbol(player.symbol),
    }));
  }

  #updateScoreIfWinner() {
    if (!this.#winnerState || this.#winnerState.winner === 'draw') {
      return;
    }
    for (let i = 0; i < this.#playerState.length; i++) {
      if (this.#playerState[i].symbol === this.#winnerState.winner) {
        this.#playerState[i].score += 1;
      }
    }
  }

  #getRandomPlayerSymbol(): PlayerSymbol {
    return Math.random() > 0.5 ? 'X' : 'O';
  }

  #getRemainingPlayerSymbol(symbol: PlayerSymbol): PlayerSymbol {
    return symbol === 'X' ? 'O' : 'X';
  }

  #checkForWinner(
    symbol: PlayerSymbol,
    state?: Array<string>,
  ): GameWinnerState {
    const board = state ? state : this.#boardState;
    if (this.#winnerState) {
      throw new Error('Winner already decided');
    }
    // Go through all winning combinations
    for (const combination of winningBoardCombinations) {
      // Get winning cell indexes
      const matchingCells = [];
      for (let i = 0; i < combination.length; i++) {
        if (combination[i] === '1' && board[i] === symbol) {
          matchingCells.push(i);
        }
      }
      if (matchingCells.length === 3) {
        return {
          winner: symbol,
          winningCells: matchingCells,
        };
      }
    }
    // If all cells are filled and no winner is found that means the game is a draw
    if (!board.includes('0')) {
      return { winner: 'draw', winningCells: undefined };
    }
    return;
  }
}
