// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Game dimensions
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Scale for drawing tetrominoes
const scale = 20;
context.scale(scale, scale);

// Create the arena (game board)
const arenaWidth = canvasWidth / scale;
const arenaHeight = canvasHeight / scale;
const arena = createMatrix(arenaWidth, arenaHeight);

// Player properties
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    dy: 0,
    speed: 0.01, // Adjust as needed
};

// Paddle properties
const paddle = {
    width: 3,
    height: 0.5,
    x: (arenaWidth - 3) / 2,
    y: arenaHeight - 1,
    speed: 0.2, // Adjust as needed
    dx: 0,
};

// Gravity
const gravity = 0.0005; // Adjust as needed

// Tetromino colors
const colors = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // O
    '#0DFF72', // L
    '#F538FF', // J
    '#FF8E0D', // I
    '#FFE138', // S
    '#3877FF', // Z
];

// Create the arena matrix
function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

// Create tetrominoes
function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        case 'O':
            return [
                [2, 2],
                [2, 2],
            ];
        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        case 'J':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        case 'I':
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
    }
}

// Draw functions
function draw() {
    // Clear the canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, arenaWidth, arenaHeight);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
    drawPaddle();
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(
                    x + offset.x,
                    y + offset.y,
                    1, 1
                );
            }
        });
    });
}

function drawPaddle() {
    context.fillStyle = '#fff';
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Collision detection
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (
                m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

// Merge tetromino into arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Clear filled lines
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// Player functions
function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(
        pieces[(pieces.length * Math.random()) | 0]
    );
    player.pos.y = 0;
    player.pos.x =
        ((arena[0].length / 2) | 0) -
        ((player.matrix[0].length / 2) | 0);

    player.dy = 0;

    if (collide(arena, player)) {
        // Game over
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerRotate(dir) {
    rotate(player.matrix, dir);
    const pos = player.pos.x;
    let offset = 1;
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(
            offset + (offset > 0 ? 1 : -1)
        );
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Rotate matrix
function rotate(matrix, dir) {
    // Transpose the matrix
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }

    // Reverse the rows to rotate
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Update score
function updateScore() {
    document.getElementById('score').innerText =
        'Score: ' + player.score;
}

// Check collision with paddle
function checkPaddleCollision() {
    const tetrominoBottomY = player.pos.y + player.matrix.length;
    const paddleY = paddle.y;

    if (tetrominoBottomY >= paddleY && player.dy > 0) {
        for (let y = 0; y < player.matrix.length; y++) {
            for (let x = 0; x < player.matrix[y].length; x++) {
                if (player.matrix[y][x] !== 0) {
                    const tetrominoX = player.pos.x + x;

                    if (
                        tetrominoX >= paddle.x &&
                        tetrominoX <= paddle.x + paddle.width
                    ) {
                        // Reflect the tetromino upwards
                        player.dy = -player.speed * 20; // Adjust multiplier as needed
                        return;
                    }
                }
            }
        }
    }
}

// Game loop variables
let dropCounter = 0;
let dropInterval = 1000; // Not used in this hybrid version

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    // Apply gravity
    player.dy += gravity * deltaTime;

    // Update player position
    player.pos.y += player.dy * deltaTime;

    // Update paddle position
    paddle.x += paddle.dx * deltaTime;

    // Keep paddle within boundaries
    if (paddle.x < 0) {
        paddle.x = 0;
    } else if (paddle.x + paddle.width > arenaWidth) {
        paddle.x = arenaWidth - paddle.width;
    }

    // Collision with arena
    if (collide(arena, player)) {
        player.pos.y -= player.dy * deltaTime;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        player.dy = 0;
    }

    // Collision with paddle
    checkPaddleCollision();

    draw();
    requestAnimationFrame(update);
}

// Event listeners
// Player 1 controls (Tetrominoes)
document.addEventListener('keydown', event => {
    switch (event.code) {
        case 'ArrowLeft':
            playerMove(-1);
            break;
        case 'ArrowRight':
            playerMove(1);
            break;
        case 'ArrowDown':
            playerDrop();
            break;
        case 'KeyQ':
            playerRotate(-1);
            break;
        case 'KeyW':
            playerRotate(1);
            break;
    }
});

// Player 2 controls (Paddle)
document.addEventListener('keydown', event => {
    if (event.code === 'KeyA') {
        paddle.dx = -paddle.speed;
    } else if (event.code === 'KeyD') {
        paddle.dx = paddle.speed;
    }
});

document.addEventListener('keyup', event => {
    if (event.code === 'KeyA' || event.code === 'KeyD') {
        paddle.dx = 0;
    }
});

// Initialize the game
playerReset();
updateScore();
update();
