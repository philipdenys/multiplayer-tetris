const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

const arena = createMatrix(12, 20);

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

const player = {
    pos: { x: 5, y: 0 },
    matrix: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
};

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = value;  // Use the value as the color
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}


function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(player.matrix, player.pos);
}

function update() {
    draw();
}

setInterval(update, 1000 / 60);

// WebSocket connection
const ws = new WebSocket('ws://localhost:8080');

// Send the player position to the server
function sendPosition() {
    ws.send(JSON.stringify({
        type: 'position',
        data: player.pos
    }));
}

// Capture input and send it to the server
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // Move left
        player.pos.x--;
        sendPosition();
    } else if (event.keyCode === 39) { // Move right
        player.pos.x++;
        sendPosition();
    } else if (event.keyCode === 40) { // Move down
        player.pos.y++;
        sendPosition();
    }
});

// Handle incoming messages (other players' positions)
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'position') {
        // Update the position of another player
        // Here you'd update their state in your game logic
    }
};


let dropCounter = 0;
let dropInterval = 1000; // Drop a piece every second
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

function playerDrop() {
    player.pos.y++;  // Move the player down by one row
    if (collide(arena, player)) {
        player.pos.y--;  // Undo the move if there's a collision
        merge(arena, player);  // Merge the block into the arena (fix it in place)
        playerReset();  // Generate the next piece and reset the player's position
        arenaSweep();  // Check and clear completed lines
    }
    dropCounter = 0;  // Reset the drop counter
}


function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            // If the block cell is not 0 (i.e., it's a filled part of the piece)
            if (m[y][x] !== 0 &&
                // Check that the arena has either reached the bottom (arena[y + o.y] is undefined)
                // or has another block already in that position (arena[y + o.y][x + o.x] !== 0)
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;  // Store the color in the arena
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1); // Move left
    } else if (event.keyCode === 39) {
        playerMove(1); // Move right
    } else if (event.keyCode === 40) {
        playerDrop(); // Drop faster
    } else if (event.keyCode === 38) {
        playerRotate(1); // Rotate
    }
});

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
    }
}

const pieces = 'TJLOSZI';

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 'purple', 0],
            ['purple', 'purple', 'purple'],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            ['yellow', 'yellow'],
            ['yellow', 'yellow'],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 'orange'],
            ['orange', 'orange', 'orange'],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            ['blue', 0, 0],
            ['blue', 'blue', 'blue'],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            ['cyan', 'cyan', 'cyan', 'cyan'],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 'green', 'green'],
            ['green', 'green', 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            ['red', 'red', 0],
            [0, 'red', 'red'],
            [0, 0, 0],
        ];
    }
}


function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);  // Get a random piece
    player.pos.y = 0;  // Start at the top
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);  // Center horizontally

    // If the new piece collides immediately, it's game over (reset the arena)
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));  // Clear the arena (for now, this means game over)
    }
}
