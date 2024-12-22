export {};

const winningBoardCombinations = [
  '100100100',
  '010010010',
  '001001001',
  '111000000',
  '000111000',
  '000000111',
  '100010001',
  '001010100',
];

function getPlayingSymbol(boardState: Array<string>): 'X' | 'O' {
  const crossMoves = boardState.filter((el) => el === 'X').length;
  const circleMoves = boardState.filter((el) => el === 'O').length;
  if ((circleMoves === 0 && crossMoves === 0) || circleMoves >= crossMoves) {
    return 'X';
  } else {
    return 'O';
  }
}

function getRemainingPlayerSymbol(symbol: 'X' | 'O') {
  return symbol === 'X' ? 'O' : 'X';
}

function bestMoveInPosition(boardState: string): number {
  const clonedBoardState = boardState.split('');
  const playingSymbol = getPlayingSymbol(clonedBoardState);

  let currentBestCell = -1;
  let currentBestScore = -Infinity;

  for (let i = 0; i < clonedBoardState.length; i++) {
    // No move has been played here yet
    if (clonedBoardState[i] === '0') {
      // Play this move
      clonedBoardState[i] = playingSymbol;
      // Explore
      const foundBestScore = miniMax(clonedBoardState, 0, false, playingSymbol);
      if (foundBestScore > currentBestScore) {
        currentBestCell = i;
        currentBestScore = foundBestScore;
      }
      // Undo move
      clonedBoardState[i] = '0';
    }
  }

  return currentBestCell;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkForWinner(symbol: 'X' | 'O', boardState: Array<string>) {
  // Go through all winning combinations
  for (const combination of winningBoardCombinations) {
    // Get winning cell indexes
    const matchingCells = [];
    for (let i = 0; i < combination.length; i++) {
      if (combination[i] === '1' && boardState[i] === symbol) {
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
  if (!boardState.includes('0')) {
    return { winner: 'draw', winningCells: undefined };
  }

  return;
}

function miniMax(
  state: Array<string>,
  depth: number,
  isMaxing: boolean,
  maxingSymbol: 'X' | 'O',
): number {
  const toPlay = getPlayingSymbol(state);
  // Get previously played symbol
  const prevPlayed = getRemainingPlayerSymbol(toPlay);

  const winner = checkForWinner(prevPlayed, state);

  if (winner) {
    if (winner.winner === 'draw') {
      return 0;
    } else return winner.winner === maxingSymbol ? 10 - depth : depth - 10;
  }

  // Maximizing turn
  if (isMaxing) {
    let best = -Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i] === '0') {
        // Play move
        state[i] = toPlay;
        // Explore
        const foundBest = miniMax(state, depth + 1, !isMaxing, maxingSymbol);
        best = Math.max(foundBest, best);
        // Undo move
        state[i] = '0';
      }
    }
    return best;
  }
  // Minimizer turn
  else {
    let best = Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i] === '0') {
        // Play move
        state[i] = toPlay;
        // Explore
        const foundBest = miniMax(state, depth + 1, !isMaxing, maxingSymbol);
        best = Math.min(foundBest, best);
        // Undo move
        state[i] = '0';
      }
    }
    return best;
  }
}

self.onmessage = (e: MessageEvent<any>) => {
  switch (e.data.type) {
    case 'best-move': {
      // If the game has already ended in a draw or a winner exit
      if (
        checkForWinner('X', e.data.boardState) !== undefined ||
        checkForWinner('O', e.data.boardState) !== undefined
      ) {
        return;
      }
      const bestMove = bestMoveInPosition(e.data.boardState);
      if (typeof bestMove === 'number') {
        sleep(1000).then(() =>
          postMessage({
            cell: bestMove,
            type: 'best-move-found',
          }),
        );
      }
      break;
    }
    default:
      break;
  }
};
