const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');
const musicButton = document.getElementById('musicButton');
const soundButton = document.getElementById('soundButton');
const gameOverMessage = document.getElementById('gameOverMessage');

const backgroundMusic = document.getElementById('backgroundMusic');
const eatSound = document.getElementById('eatSound');
const deathSound = document.getElementById('deathSound');

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
    dy: 0,
    nextDirection: null
};

let apple = {
    x: grid * 10,
    y: grid * 10
};

let yellowApple = {
    x: -grid, // inizialmente fuori dallo schermo
    y: -grid,
    visible: false,
    timer: null
};

let gamePaused = false;
let gameOver = false;
let animationId = null;
let musicOn = true;
let soundOn = true;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetGame() {
    cancelAnimationFrame(animationId);

    snake.x = grid * 5;
    snake.y = grid * 5;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;
    snake.nextDirection = null;

    apple.x = getRandomInt(0, Math.floor(canvas.width / grid)) * grid;
    apple.y = getRandomInt(0, Math.floor(canvas.height / grid)) * grid;

    score = 0;
    level = 1;
    speed = 8;

    yellowApple.visible = false;
    gamePaused = false;
    gameOver = false;

    if (yellowApple.timer) {
        clearTimeout(yellowApple.timer);
    }

    updateScore();
    gameOverMessage.style.display = 'none';
    pauseButton.disabled = false;

    if (!gamePaused) {
        pauseButton.style.display = 'inline-block';
        animationId = requestAnimationFrame(gameLoop);
    }

    updateMusicButton();
    toggleBackgroundMusic();
    updateSoundButton();
}

function toggleBackgroundMusic() {
    if (musicOn) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}

function toggleSound() {
    soundOn = !soundOn;
    updateSoundButton();
}

function playEatSound() {
    if (soundOn) {
        eatSound.currentTime = 0;
        eatSound.play();
    }
}

function playDeathSound() {
    if (soundOn) {
        deathSound.currentTime = 0;
        deathSound.play();
    }
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

function drawYellowApple(x, y) {
    ctx.fillStyle = '#FFEB3B'; // Giallo
    ctx.beginPath();
    ctx.arc(x + grid / 2, y + grid / 2, grid / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
}

function generateYellowApple() {
    yellowApple.x = getRandomInt(0, Math.floor(canvas.width / grid)) * grid;
    yellowApple.y = getRandomInt(0, Math.floor(canvas.height / grid)) * grid;
    yellowApple.visible = true;
    yellowApple.timer = setTimeout(function() {
        yellowApple.visible = false;
        yellowApple.x = -grid;
        yellowApple.y = -grid;
    }, 3000); // 3 secondi
}

function gameLoop() {
    if (!gamePaused && !gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }

    if (++count < speed) {
        return;
    }

    count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update snake direction if there's a pending nextDirection
    if (snake.nextDirection) {
        snake.dx = snake.nextDirection.dx;
        snake.dy = snake.nextDirection.dy;
        snake.nextDirection = null;
    }

    snake.x += snake.dx;
    snake.y += snake.dy;

    // Wrap snake around canvas edges
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

    if (yellowApple.visible) {
        drawYellowApple(yellowApple.x, yellowApple.y);
    }

    ctx.fillStyle = '#009246';
    snake.cells.forEach(function (cell, index) {
        drawSnakePart(cell.x, cell.y);

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score++;
            playEatSound();
            apple.x = getRandomInt(0, Math.floor(canvas.width / grid)) * grid;
            apple.y = getRandomInt(0, Math.floor(canvas.height / grid)) * grid;

            if (score % 5 === 0) {
                level++;
                speed = Math.max(speed - 1, 1);
                generateYellowApple();
            }
            updateScore();
        }

        if (yellowApple.visible && cell.x === yellowApple.x && cell.y === yellowApple.y) {
            yellowApple.visible = false;
            clearTimeout(yellowApple.timer);
            snake.maxCells++;
            score += 5;
            playEatSound();
            updateScore();
        }

        // Check collision with itself
        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                cancelAnimationFrame(animationId);
                playDeathSound();
                showGameOver();
                return;
            }
        }
    });
}

function showGameOver() {
    gameOver = true;
    gameOverMessage.textContent = `Game Over Score: ${score}`;
    gameOverMessage.style.display = 'block';
    pauseButton.disabled = true;
}

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

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && snake.dx === 0) {
            snake.nextDirection = { dx: grid, dy: 0 };
        } else if (dx < 0 && snake.dx === 0) {
            snake.nextDirection = { dx: -grid, dy: 0 };
        }
    } else {
        if (dy > 0 && snake.dy === 0) {
            snake.nextDirection = { dx: 0, dy: grid };
        } else if (dy < 0 && snake.dy === 0) {
            snake.nextDirection = { dx: 0, dy: -grid };
        }
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' && snake.dx === 0) {
        snake.nextDirection = { dx: -grid, dy: 0 };
    } else if (e.key === 'ArrowUp' && snake.dy === 0) {
        snake.nextDirection = { dx: 0, dy: -grid };
    } else if (e.key === 'ArrowRight' && snake.dx === 0) {
        snake.nextDirection = { dx: grid, dy: 0 };
    } else if (e.key === 'ArrowDown' && snake.dy === 0) {
        snake.nextDirection = { dx: 0, dy: grid };
    } else if (e.key === ' ') {
        togglePause();
    }
});

restartButton.addEventListener('click', function () {
    resetGame();
});

pauseButton.addEventListener('click', function () {
    if (gamePaused) {
        gamePaused = false;
        animationId = requestAnimationFrame(gameLoop);
    } else {
        gamePaused = true;
        cancelAnimationFrame(animationId);
    }
});

musicButton.addEventListener('click', function () {
    musicOn = !musicOn;
    updateMusicButton();
    toggleBackgroundMusic();
});

soundButton.addEventListener('click', toggleSound);

function updateMusicButton() {
    musicButton.textContent = musicOn ? 'Music: On' : 'Music: Off';
}

function updateSoundButton() {
    soundButton.textContent = soundOn ? 'Sound: On' : 'Sound: Off';
}

resetGame();
