// Main game canvas
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

// Hold canvas
const holdCanvas = document.getElementById('holdCanvas');
const holdContext = holdCanvas.getContext('2d');
holdContext.scale(20, 20);

// Hold variables
let holdPiece = null;
let holdUsed = false;

// Create the arena (game board)
const arena = createMatrix(12, 20);

// Create the player
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

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

// Function to create the arena matrix
function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

// Function to create tetrominoes
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

// Function to draw the game
function draw() {
    // Clear the main canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the arena and the player
    drawMatrix(arena, context, { x: 0, y: 0 });
    drawMatrix(player.matrix, context, player.pos);

    // Draw the hold area
    drawHold();
}

// Function to draw a matrix (tetromino or arena)
function drawMatrix(matrix, context, offset) {
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

// Function to draw the held tetromino
function drawHold() {
    // Clear the hold canvas
    holdContext.fillStyle = '#000';
    holdContext.fillRect(0, 0, holdCanvas.width, holdCanvas.height);

    if (holdPiece) {
        drawMatrix(holdPiece, holdContext, { x: 0, y: 0 });
    }
}

// Function to merge the player into the arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Function to check for collisions
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

// Player movement functions
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

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(
        pieces[(pieces.length * Math.random()) | 0]
    );
    player.pos.y = 0;
    player.pos.x =
        ((arena[0].length / 2) | 0) -
        ((player.matrix[0].length / 2) | 0);

    // Reset hold usage
    holdUsed = false;

    if (collide(arena, player)) {
        // Game over
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
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

function playerHold() {
    if (!holdUsed) {
        if (holdPiece) {
            // Swap the current piece with the held piece
            [player.matrix, holdPiece] = [holdPiece, player.matrix];
            player.pos.y = 0;
            player.pos.x =
                ((arena[0].length / 2) | 0) -
                ((player.matrix[0].length / 2) | 0);
        } else {
            // Hold the current piece and generate a new one
            holdPiece = player.matrix;
            playerReset();
        }
        holdUsed = true;
    }
}

// Function to rotate a matrix
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

// Function to clear filled lines
function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;

        player.score += 10;
    }
}

// Game loop variables
let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Update the score display
function updateScore() {
    document.getElementById('score').innerText =
        'Score: ' + player.score;
}

// Event listeners for player input
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        // Left arrow
        playerMove(-1);
    } else if (event.keyCode === 39) {
        // Right arrow
        playerMove(1);
    } else if (event.keyCode === 40) {
        // Down arrow
        playerDrop();
    } else if (event.keyCode === 81) {
        // Q key
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        // W key
        playerRotate(1);
    } else if (event.keyCode === 16) {
        // Shift key
        playerHold();
    }
});

// Initialize the game
playerReset();
updateScore();
update();
