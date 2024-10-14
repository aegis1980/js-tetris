// Main game canvas
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

// Next piece canvas
const nextCanvas = document.getElementById('nextCanvas');
const nextContext = nextCanvas.getContext('2d');
nextContext.scale(20, 20);

// Bonus variables
let bonusCount = 0; // Number of bonus pieces available
const maxBonusPieces = 3; // Maximum number of bonus pieces

// Level and speed variables
let level = 1; // Starting level
let linesCleared = 0; // Track the total number of lines cleared

// Next piece variable
let nextPiece = null; // Track the upcoming piece

// Pause state
let isPaused = false; // Game starts in unpaused state

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
    '#FF0D00', // Single block piece (.)
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
        case '.':
            return [
                [1]
            ];
        case 'T':
            return [
                [0, 2, 0],
                [2, 2, 2],
                [0, 0, 0],
            ];
        case 'O':
            return [
                [3, 3],
                [3, 3],
            ];
        case 'L':
            return [
                [0, 0, 4],
                [4, 4, 4],
                [0, 0, 0],
            ];
        case 'J':
            return [
                [5, 0, 0],
                [5, 5, 5],
                [0, 0, 0],
            ];
        case 'I':
            return [
                [0, 0, 0, 0],
                [6, 6, 6, 6],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
        case 'S':
            return [
                [0, 7, 7],
                [7, 7, 0],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [8, 8, 0],
                [0, 8, 8],
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

    // Show "Paused" message if the game is paused
    if (isPaused) {
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width / 20, canvas.height / 20); // Semi-transparent overlay
        context.fillStyle = '#FFF';
        context.font = '1px Arial';
 
