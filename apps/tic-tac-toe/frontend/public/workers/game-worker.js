var winningBoardCombinations = [
    '100100100',
    '010010010',
    '001001001',
    '111000000',
    '000111000',
    '000000111',
    '100010001',
    '001010100',
];
function getPlayingSymbol(boardState) {
    var crossMoves = boardState.filter(function (el) { return el === 'X'; }).length;
    var circleMoves = boardState.filter(function (el) { return el === 'O'; }).length;
    if ((circleMoves === 0 && crossMoves === 0) || circleMoves >= crossMoves) {
        return 'X';
    }
    else {
        return 'O';
    }
}
function getRemainingPlayerSymbol(symbol) {
    return symbol === 'X' ? 'O' : 'X';
}
function bestMoveInPosition(boardState) {
    var clonedBoardState = boardState.split('');
    var playingSymbol = getPlayingSymbol(clonedBoardState);
    var currentBestCell = -1;
    var currentBestScore = -Infinity;
    for (var i = 0; i < clonedBoardState.length; i++) {
        // No move has been played here yet
        if (clonedBoardState[i] === '0') {
            // Play this move
            clonedBoardState[i] = playingSymbol;
            // Explore
            var foundBestScore = miniMax(clonedBoardState, 0, false, playingSymbol);
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
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function checkForWinner(symbol, boardState) {
    // Go through all winning combinations
    for (var _i = 0, winningBoardCombinations_1 = winningBoardCombinations; _i < winningBoardCombinations_1.length; _i++) {
        var combination = winningBoardCombinations_1[_i];
        // Get winning cell indexes
        var matchingCells = [];
        for (var i = 0; i < combination.length; i++) {
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
function miniMax(state, depth, isMaxing, maxingSymbol) {
    var toPlay = getPlayingSymbol(state);
    // Get previously played symbol
    var prevPlayed = getRemainingPlayerSymbol(toPlay);
    var winner = checkForWinner(prevPlayed, state);
    if (winner) {
        if (winner.winner === 'draw') {
            return 0;
        }
        else
            return winner.winner === maxingSymbol ? 10 - depth : depth - 10;
    }
    // Maximizing turn
    if (isMaxing) {
        var best = -Infinity;
        for (var i = 0; i < state.length; i++) {
            if (state[i] === '0') {
                // Play move
                state[i] = toPlay;
                // Explore
                var foundBest = miniMax(state, depth + 1, !isMaxing, maxingSymbol);
                best = Math.max(foundBest, best);
                // Undo move
                state[i] = '0';
            }
        }
        return best;
    }
    // Minimizer turn
    else {
        var best = Infinity;
        for (var i = 0; i < state.length; i++) {
            if (state[i] === '0') {
                // Play move
                state[i] = toPlay;
                // Explore
                var foundBest = miniMax(state, depth + 1, !isMaxing, maxingSymbol);
                best = Math.min(foundBest, best);
                // Undo move
                state[i] = '0';
            }
        }
        return best;
    }
}
self.onmessage = function (e) {
    switch (e.data.type) {
        case 'best-move': {
            // If the game has already ended in a draw or a winner exit
            if (checkForWinner('X', e.data.boardState) !== undefined ||
                checkForWinner('O', e.data.boardState) !== undefined) {
                return;
            }
            var bestMove_1 = bestMoveInPosition(e.data.boardState);
            if (typeof bestMove_1 === 'number') {
                sleep(1000).then(function () {
                    return postMessage({
                        cell: bestMove_1,
                        type: 'best-move-found',
                    });
                });
            }
            break;
        }
        default:
            break;
    }
};
export {};
