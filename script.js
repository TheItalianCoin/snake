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
let speed = 12;

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
let animationId;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetGame() {
    snake.x = grid * 5;
    snake.y = grid * 5;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;
    apple.x = getRandomInt(0, 20) * grid;
    apple.y = getRandomInt(0, 20) * grid;
    score = 0;
    level = 1;
    speed = 12;
    updateScore();
    
    // Nascondi il messaggio di game over inizialmente
    gameOverMessage.style.display = 'none';

    // Avvia il gioco
    animationId = requestAnimationFrame(gameLoop);
}

function updateScore() {
    scoreElement.textContent = `Score: ${score} | Level: ${level}`;
}

function drawSnakePart(x, y) {
    // Colore verde, bianco e rosso
    ctx.fillStyle = '#009246'; // Verde
    ctx.fillRect(x, y, grid - 1, grid - 1);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(x, y, grid - 1, grid - 1);
}

function drawApple(x, y) {
    ctx.fillStyle = '#f44336';
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

    ctx.fillStyle = '#009246'; // Setta il colore del serpente
    snake.cells.forEach(function (cell, index) {
        drawSnakePart(cell.x, cell.y);

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score++;
            apple.x = getRandomInt(0, 20) * grid;
            apple.y = getRandomInt(0, 20) * grid;
            if (score % 5 === 0) {
                level++;
                speed = Math.max(speed - 1, 1);
            }
            updateScore();
        }

        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                cancelAnimationFrame(animationId); // Cancella l'animazione
                showGameOver(); // Mostra il messaggio di game over
                return;
            }
        }
    });
}

function showGameOver() {
    gameOverMessage.textContent = `Game Over Score: ${score}`; // Aggiorna il testo con il punteggio corrente senza trattino
    gameOverMessage.style.display = 'block'; // Mostra il messaggio di game over
}

document.addEventListener('keydown', function (e) {
    if (e.which === 37 && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    } else if (e.which === 38 && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
    } else if (e.which === 39 && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    } else if (e.which === 40 && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
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

resetGame(); // Chiamata a resetGame all'inizio per inizializzare il gioco
