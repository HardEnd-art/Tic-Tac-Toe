const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset');

let currentPlayer = 'X'; // Human is 'X', Computer is 'O'
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let isComputerTurn = false; // Flag to block user input during computer's turn

// Sound effects
const clickSound = new Audio('sounds/click.wav');
const computerMoveSound = new Audio('sounds/computer-move.wav');
const winSound = new Audio('sounds/win.wav');
const drawSound = new Audio('sounds/draw.wav');
const backgroundMusic = new Audio('sounds/background-music.mp3');

// Winning conditions
const winningConditions = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal
    [2, 4, 6]  // Diagonal
];

// Initialize background music
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

// Play background music when the game starts
window.addEventListener('load', () => {
    backgroundMusic.play();
});

// Add a button to toggle background music
const musicButton = document.createElement('button');
musicButton.textContent = 'Toggle Music';
musicButton.style.position = 'absolute';
musicButton.style.top = '10px';
musicButton.style.right = '10px';
musicButton.style.padding = '10px 20px';
musicButton.style.fontSize = '1rem';
musicButton.style.cursor = 'pointer';
musicButton.style.backgroundColor = '#007bff';
musicButton.style.color = '#fff';
musicButton.style.border = 'none';
musicButton.style.borderRadius = '5px';
musicButton.style.transition = 'background-color 0.3s, transform 0.2s';

musicButton.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        musicButton.textContent = 'Pause Music';
    } else {
        backgroundMusic.pause();
        musicButton.textContent = 'Play Music';
    }
});

document.body.appendChild(musicButton);

// Handle cell clicks
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Disable clicks during the computer's turn or if the cell is already occupied
    if (gameState[clickedCellIndex] !== '' || !gameActive || isComputerTurn) {
        return;
    }

    // Play click sound for human move
    clickSound.play();

    // Human's move
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.setAttribute('data-value', currentPlayer); // Add data-value for styling
    clickedCell.classList.add('disabled');

    checkForWinner();

    if (gameActive) {
        // Switch to computer's turn
        currentPlayer = 'O';
        isComputerTurn = true; // Set the flag to block user input
        resetButton.disabled = true; // Disable the reset button during the computer's turn
        setTimeout(computerMove, 1000); // Computer waits 1 second before moving
    }
}

// Computer's move
function computerMove() {
    if (!gameActive) return;

    // Play computer move sound
    computerMoveSound.play();

    // Use Minimax with alpha-beta pruning to find the best move
    const bestMove = getBestMove();
    gameState[bestMove] = currentPlayer;
    cells[bestMove].textContent = currentPlayer;
    cells[bestMove].setAttribute('data-value', currentPlayer); // Add data-value for styling
    cells[bestMove].classList.add('disabled', 'fade-in');

    checkForWinner();

    // Switch back to human's turn
    currentPlayer = 'X';
    isComputerTurn = false; // Re-enable user input
    resetButton.disabled = false; // Re-enable the reset button
}

// Minimax algorithm with alpha-beta pruning
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O'; // Computer's move
            let score = minimax(gameState, 0, -Infinity, Infinity, false);
            gameState[i] = ''; // Undo move

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(board, depth, alpha, beta, isMaximizing) {
    const result = checkWinner(board);

    if (result !== null) {
        return result === 'O' ? 10 - depth : result === 'X' ? depth - 10 : 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, alpha, beta, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, alpha, beta, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return bestScore;
    }
}

// Check for a winner or draw
function checkWinner(board) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] !== '' && board[a] === board[b] && board[b] === board[c]) {
            return board[a]; // Return the winner ('X' or 'O')
        }
    }
    if (!board.includes('')) return 'draw'; // Return 'draw' if the board is full
    return null; // No winner yet
}

function checkForWinner() {
    const result = checkWinner(gameState);

    if (result === 'X') {
        statusText.textContent = 'You win! 🎉';
        statusText.classList.add('show', 'celebrate');
        winSound.play(); // Play win sound
        createConfetti();
        gameActive = false;
    } else if (result === 'O') {
        statusText.textContent = 'Computer wins! 🤖';
        statusText.classList.add('show', 'celebrate');
        winSound.play(); // Play win sound
        createConfetti();
        gameActive = false;
    } else if (result === 'draw') {
        statusText.textContent = 'Draw! 😐';
        statusText.classList.add('show', 'celebrate');
        drawSound.play(); // Play draw sound
        createConfetti();
        gameActive = false;
    }
}

// Create confetti effect
function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti');

    for (let i = 0; i < 100; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.classList.add('confetti-piece');
        confettiPiece.style.left = `${Math.random() * 100}vw`;
        confettiPiece.style.animationDelay = `${Math.random() * 2}s`;
        confettiContainer.appendChild(confettiPiece);
    }

    document.body.appendChild(confettiContainer);

    setTimeout(() => {
        confettiContainer.remove();
    }, 2000); // Remove confetti after 2 seconds
}

// Reset the game
function resetGame() {
    // Fade out the board
    board.classList.add('fade-out');
    statusText.classList.remove('show', 'celebrate');

    setTimeout(() => {
        // Reset game state
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        statusText.textContent = `It's ${currentPlayer}'s turn`;

        // Clear cells
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('disabled', 'fade-in');
            cell.removeAttribute('data-value');
        });

        // Fade in the board
        board.classList.remove('fade-out');
        board.classList.add('fade-in');
    }, 500); // Match the duration of the fade-out animation
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);

// Initialize game status
statusText.textContent = `It's ${currentPlayer}'s turn`;