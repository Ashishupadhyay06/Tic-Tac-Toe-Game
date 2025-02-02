const startMenu = document.getElementById('startMenu');
const gameContainer = document.getElementById('gameContainer');
const humanVsHumanButton = document.getElementById('humanVsHuman');
const humanVsComputerButton = document.getElementById('humanVsComputer');
const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('#status');
const resetButton = document.querySelector('#resetButton');
const backButton = document.querySelector('#backButton');
const humanScoreElement = document.querySelector('#humanScore');
const computerScoreElement = document.querySelector('#computerScore');
const drawScoreElement = document.querySelector('#drawScore');
const roundNumberElement = document.querySelector('#roundNumber');

let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let currentPlayer = 'X';
let round = 1;
let humanWins = 0;
let computerWins = 0;
let draws = 0;
let gameMode = null; // 'humanVsHuman' or 'humanVsComputer'

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Start Menu Event Listeners
humanVsHumanButton.addEventListener('click', () => {
    gameMode = 'humanVsHuman';
    startGame();
});

humanVsComputerButton.addEventListener('click', () => {
    gameMode = 'humanVsComputer';
    startGame();
});

backButton.addEventListener('click', () => {
    resetGame(true);
    startMenu.style.display = 'block';
    gameContainer.style.display = 'none';
});

function startGame() {
    startMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    resetGame();
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if the cell is already occupied or the game is inactive
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // Human's turn
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;

    // Check for a winner or draw
    if (checkForWinner()) {
        endRound(`Player ${currentPlayer} wins Round ${round}!`);
        return;
    }

    if (checkForDraw()) {
        endRound(`Round ${round} is a draw!`);
        return;
    }

    // Switch turns
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.textContent = `Player ${currentPlayer}'s turn`;

    // Computer's turn (if in Human vs Computer mode)
    if (gameMode === 'humanVsComputer' && currentPlayer === 'O' && gameActive) {
        setTimeout(computerMove, 1000); // Delay for computer move
    }
}

function computerMove() {
    const bestMove = minimax(gameState, 'O').index;
    gameState[bestMove] = 'O';
    document.querySelector(`.cell[data-index="${bestMove}"]`).textContent = 'O';

    // Check for a winner or draw
    if (checkForWinner()) {
        endRound(`Computer wins Round ${round}!`);
        return;
    }

    if (checkForDraw()) {
        endRound(`Round ${round} is a draw!`);
        return;
    }

    // Switch back to Human's turn
    currentPlayer = 'X';
    statusText.textContent = "Your turn (X)";
}

// Minimax algorithm (same as before)
function minimax(board, player) {
    const availableMoves = getEmptyCells(board);

    // Check for terminal states (win, lose, or draw)
    if (checkWinner(board, 'O')) {
        return { score: 10 };
    } else if (checkWinner(board, 'X')) {
        return { score: -10 };
    } else if (availableMoves.length === 0) {
        return { score: 0 };
    }

    // Array to store all possible moves and their scores
    const moves = [];

    for (let i = 0; i < availableMoves.length; i++) {
        const move = {};
        move.index = availableMoves[i];

        // Make the move for the current player
        board[availableMoves[i]] = player;

        // Recursively call minimax for the opponent
        if (player === 'O') {
            const result = minimax(board, 'X');
            move.score = result.score;
        } else {
            const result = minimax(board, 'O');
            move.score = result.score;
        }

        // Undo the move
        board[availableMoves[i]] = '';

        // Store the move in the moves array
        moves.push(move);
    }

    // Choose the best move
    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    // Return the best move
    return moves[bestMove];
}

function getEmptyCells(board) {
    return board.map((val, index) => val === '' ? index : null).filter(val => val !== null);
}

function checkWinner(board, player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true; // Winner found
        }
    }
    return false; // No winner
}

function checkForWinner() {
    return checkWinner(gameState, currentPlayer);
}

function checkForDraw() {
    return !gameState.includes(''); // All cells are filled
}

function endRound(message) {
    gameActive = false;
    statusText.textContent = message;

    // Update scores
    if (message.includes('Player X')) {
        humanWins++;
        humanScoreElement.textContent = humanWins;
    } else if (message.includes('Computer') || message.includes('Player O')) {
        computerWins++;
        computerScoreElement.textContent = computerWins;
    } else {
        draws++;
        drawScoreElement.textContent = draws;
    }

    // Update round number
    roundNumberElement.textContent = round;

    // Check if all rounds are completed
    if (round >= 5) {
        endGame();
    } else {
        round++;
        setTimeout(resetGame, 2000); // Auto-restart after 2 seconds
    }
}

function endGame() {
    let finalMessage = `Game Over!\n\nFinal Score:\nPlayer X: ${humanWins}\nPlayer O: ${computerWins}\nDraws: ${draws}\n\n`;
    if (humanWins > computerWins) {
        finalMessage += "Player X wins the game!";
    } else if (computerWins > humanWins) {
        finalMessage += "Player O wins the game!";
    } else {
        finalMessage += "The game is a draw!";
    }

    // Display the final message in the status text
    statusText.textContent = finalMessage;

    // Reset the game completely
    resetGame(true);
}

function resetGame(fullReset = false) {
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    statusText.textContent = "Player X's turn";
    cells.forEach(cell => cell.textContent = '');

    if (fullReset) {
        round = 1;
        humanWins = 0;
        computerWins = 0;
        draws = 0;
        humanScoreElement.textContent = humanWins;
        computerScoreElement.textContent = computerWins;
        drawScoreElement.textContent = draws;
        roundNumberElement.textContent = round;
    }
}

// Add event listeners to cells
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

// Initialize game
resetGame();