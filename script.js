const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');
const gameOverMessage = document.getElementById('gameOverMessage');

const grid = 20;
let count = 0;
let score = 0;
let level = 1;
let speed = 8;

let snake = {
    x: grid * 5,
    y: grid * 5,
    cells: [],
    maxCells: 4,
    dx: grid,
    dy: 0
};

let apple = {
    x: grid * 10,
    y: grid * 10
};

let gamePaused = false;
let animationId = null; // Variabile per memorizzare l'ID dell'animazione corrente

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetGame() {
    cancelAnimationFrame(animationId); // Fermare l'animazione corrente se presente

    snake.x = grid * 5;
    snake.y = grid * 5;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;
    apple.x = getRandomInt(0, Math.floor(canvas.width / grid)) * grid;
    apple.y = getRandomInt(0, Math.floor(canvas.height / grid)) * grid;
    score = 0;
    level = 1;
    speed = 8;
    updateScore();
    
    // Nascondere il messaggio di game over
    gameOverMessage.style.display = 'none';

    // Mostrare il pulsante di pausa e avviare il game loop
    pauseButton.style.display = 'inline-block';
    animationId = requestAnimationFrame(gameLoop);
}

function updateScore() {
    scoreElement.textContent = `Score: ${score} | Level: ${level}`;
}

function drawSnakePart(x, y) {
    ctx.fillStyle = '#009246'; // Verde
    ctx.fillRect(x, y, grid - 1, grid - 1);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(x, y, grid - 1, grid - 1);
}

function drawApple(x, y) {
    ctx.fillStyle = '#f44336'; // Rosso
    ctx.beginPath();
    ctx.arc(x + grid / 2, y + grid / 2, grid / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
}

function gameLoop() {
    animationId = requestAnimationFrame(gameLoop);

    if (++count < speed || gamePaused) {
        return;
    }

    count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.x += snake.dx;
    snake.y += snake.dy;

    if (snake.x < 0) {
        snake.x = canvas.width - grid;
    } else if (snake.x >= canvas.width) {
        snake.x = 0;
    }

    if (snake.y < 0) {
        snake.y = canvas.height - grid;
    } else if (snake.y >= canvas.height) {
        snake.y = 0;
    }

    snake.cells.unshift({ x: snake.x, y: snake.y });

    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    drawApple(apple.x, apple.y);

    ctx.fillStyle = '#009246'; // Colore del serpente
    snake.cells.forEach(function (cell, index) {
        drawSnakePart(cell.x, cell.y);

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score++;
            apple.x = getRandomInt(0, Math.floor(canvas.width / grid)) * grid;
            apple.y = getRandomInt(0, Math.floor(canvas.height / grid)) * grid;
            if (score % 5 === 0) {
                level++;
                speed = Math.max(speed - 1, 1);
            }
            updateScore();
        }

        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                cancelAnimationFrame(animationId);
                showGameOver();
                return;
            }
        }
    });
}

function showGameOver() {
    gameOverMessage.textContent = `Game Over Score: ${score}`;
    gameOverMessage.style.display = 'block';
}

// Gestione degli eventi touch per dispositivi mobili
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', function(e) {
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // Controllo della direzione del movimento del serpente
    if (Math.abs(dx) > Math.abs(dy)) {
        // Movimento orizzontale
        if (dx > 0 && snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
        } else if (dx < 0 && snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
        }
    } else {
        // Movimento verticale
        if (dy > 0 && snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
        } else if (dy < 0 && snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
        }
    }

    // Aggiornamento delle coordinate di inizio del tocco
    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    } else if (e.key === 'ArrowUp' && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
    } else if (e.key === 'ArrowRight' && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    } else if (e.key === 'ArrowDown' && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
    } else if (e.key === ' ') { // Spazio per mettere in pausa
        e.preventDefault(); // Evita che lo spazio faccia scorrere la pagina
        gamePaused = !gamePaused;

        if (gamePaused) {
            cancelAnimationFrame(animationId);
        } else {
            animationId = requestAnimationFrame(gameLoop);
        }
    }
});

restartButton.addEventListener('click', resetGame);

pauseButton.addEventListener('click', function () {
    gamePaused = !gamePaused;

    if (gamePaused) {
        cancelAnimationFrame(animationId);
    } else {
        animationId = requestAnimationFrame(gameLoop);
    }
});

resetGame(); // Inizializza il gioco
