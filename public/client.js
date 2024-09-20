class Tetris {
    constructor(element, playerId, ws) {
        this.playerId = playerId;
        this.ws = ws;

        this.element = element;
        this.canvas = element.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.context.scale(20, 20);

        this.arena = this.createMatrix(12, 20);
        this.player = {
            pos: { x: 0, y: 0 },
            matrix: null,
            score: 0,
            lines: 0,
            level: 0,
        };

        this.colors = {
            'T': '#A843E4',
            'O': '#E5D549',
            'L': '#E58A31',
            'J': '#4172E0',
            'I': '#3FDFFF',
            'S': '#5EDC2D',
            'Z': '#FF4136',
        };

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.gameOver = false;

        this.otherPlayers = {};

        this.isRunning = false; // New flag to control the game state

        this.initUI();
        // this.playerReset(); // Remove this line
        // this.updateScore(); // Remove this line
        // this.update(); // Remove this line
    }

    initUI() {
        // Add score display
        this.scoreElem = this.element.querySelector('.score');
        // Add game over display
        this.gameOverElem = this.element.querySelector('.game-over');

        // Add start button
        this.startButton = document.createElement('button');
        this.startButton.classList.add('start-button');
        this.startButton.innerText = 'Start Game';
        this.element.appendChild(this.startButton);

        // Event listener for start button
        this.startButton.addEventListener('click', () => {
            this.startButton.style.display = 'none';
            this.gameOverElem.style.display = 'none';
            this.isRunning = true;
            this.playerReset();
            this.updateScore();
            this.update();
        });

        // Modify game over click event to show start button
        this.gameOverElem.addEventListener('click', () => {
            this.gameOverElem.style.display = 'none';
            this.startButton.style.display = 'block';
        });
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = this.colors[value];
                    this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawMatrix(this.arena, { x: 0, y: 0 });
        this.drawMatrix(this.player.matrix, this.player.pos);

        // Draw other players
        for (let id in this.otherPlayers) {
            if (id !== this.playerId) {
                const opponent = this.otherPlayers[id];
                this.drawMatrix(opponent.matrix, opponent.pos);
            }
        }
    }

    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    collide(arena, player) {
        const m = player.matrix;
        const o = player.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (
                    m[y][x] !== 0 &&
                    (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    playerReset() {
        const pieces = 'TJLOSZI';
        this.player.matrix = this.createPiece(
            pieces[(pieces.length * Math.random()) | 0]
        );
        this.player.pos.y = 0;
        this.player.pos.x =
            ((this.arena[0].length / 2) | 0) -
            ((this.player.matrix[0].length / 2) | 0);

        if (this.collide(this.arena, this.player)) {
            this.arena.forEach((row) => row.fill(0));
            this.player.score = 0;
            this.player.lines = 0;
            this.player.level = 0;
            this.updateScore();
            this.gameOver = true;
            this.isRunning = false; // Stop the game loop
            this.gameOverElem.style.display = 'block';
            this.sendStateUpdate(); // Notify others of the game over state
        }
    }

    createPiece(type) {
        if (type === 'T') {
            return [
                [0, 'T', 0],
                ['T', 'T', 'T'],
                [0, 0, 0],
            ];
        } else if (type === 'O') {
            return [
                ['O', 'O'],
                ['O', 'O'],
            ];
        } else if (type === 'L') {
            return [
                [0, 0, 'L'],
                ['L', 'L', 'L'],
                [0, 0, 0],
            ];
        } else if (type === 'J') {
            return [
                ['J', 0, 0],
                ['J', 'J', 'J'],
                [0, 0, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 0, 0, 0],
                ['I', 'I', 'I', 'I'],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 'S', 'S'],
                ['S', 'S', 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                ['Z', 'Z', 0],
                [0, 'Z', 'Z'],
                [0, 0, 0],
            ];
        }
    }

    playerMove(dir) {
        this.player.pos.x += dir;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.x -= dir;
        } else {
            this.sendStateUpdate();
        }
    }

    playerDrop() {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.y--;
            this.merge(this.arena, this.player);
            this.arenaSweep();
            this.playerReset();
            this.updateScore();
        }
        this.dropCounter = 0;
        this.sendStateUpdate();
    }

    playerRotate(dir) {
        const pos = this.player.pos.x;
        let offset = 1;
        this.rotate(this.player.matrix, dir);
        while (this.collide(this.arena, this.player)) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix[0].length) {
                this.rotate(this.player.matrix, -dir);
                this.player.pos.x = pos;
                return;
            }
        }
        this.sendStateUpdate();
    }

    rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }

        if (dir > 0) {
            matrix.forEach((row) => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    arenaSweep() {
        let rowCount = 1;
        outer: for (let y = this.arena.length - 1; y >= 0; --y) {
            for (let x = 0; x < this.arena[y].length; ++x) {
                if (this.arena[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
            ++y;

            this.player.score += rowCount * 100;
            this.player.lines += 1;
            rowCount *= 2;
        }

        // Increase level every 10 lines
        if (this.player.lines >= (this.player.level + 1) * 10) {
            this.player.level++;
            this.dropInterval *= 0.9; // Increase speed
        }
    }

    updateScore() {
        this.scoreElem.innerText = `Score: ${this.player.score}\nLines: ${this.player.lines}\nLevel: ${this.player.level}`;
    }

    update(time = 0) {
        if (!this.isRunning) return; // Check if the game is running

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.playerDrop();
        }

        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    sendStateUpdate() {
        const state = {
            pos: this.player.pos,
            matrix: this.player.matrix,
            score: this.player.score,
        };
        this.ws.send(
            JSON.stringify({
                type: 'stateUpdate',
                playerId: this.playerId,
                state,
            })
        );
    }

    receiveStateUpdate(playerId, state) {
        this.otherPlayers[playerId] = state;
    }

    removePlayer(playerId) {
        delete this.otherPlayers[playerId];
    }
}

// Main code
const ws = new WebSocket('ws://' + window.location.host);
let playerId;
let tetris;

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'init') {
        playerId = message.playerId;

        // Create the game area
        const gameArea = document.getElementById('gameArea');

        const playerElement = document.createElement('div');
        playerElement.classList.add('game');
        playerElement.innerHTML = `
            <canvas width="240" height="400"></canvas>
            <div class="score">Score: 0\nLines: 0\nLevel: 0</div>
            <div class="game-over">Game Over</div>
        `;
        gameArea.appendChild(playerElement);

        tetris = new Tetris(playerElement, playerId, ws);

        // Input handling
        document.addEventListener('keydown', (event) => {
            if (tetris.gameOver) return;

            if (event.keyCode === 37) {
                // Left arrow
                tetris.playerMove(-1);
            } else if (event.keyCode === 39) {
                // Right arrow
                tetris.playerMove(1);
            } else if (event.keyCode === 40) {
                // Down arrow
                tetris.playerDrop();
            } else if (event.keyCode === 81) {
                // Q key
                tetris.playerRotate(-1);
            } else if (event.keyCode === 87) {
                // W key
                tetris.playerRotate(1);
            }
        });

        // Restart game on game over
        tetris.gameOverElem.addEventListener('click', () => {
            tetris.gameOverElem.style.display = 'none';
            tetris.gameOver = false;
            tetris.playerReset();
            tetris.update();
        });
    } else if (message.type === 'stateUpdate') {
        if (tetris) {
            tetris.receiveStateUpdate(message.playerId, message.state);
        }
    } else if (message.type === 'playerDisconnected') {
        if (tetris) {
            tetris.removePlayer(message.playerId);
        }
    }
};
