class TetrisGame {
    constructor(config = {}) {
        this.initializeConfig(config);
        this.initializeCanvas();
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeConfig(config) {
        this.config = {
            blockSize: config.blockSize || 30,
            cols: config.cols || 10,
            rows: config.rows || 20,
            dropInterval: config.dropInterval || 1000,
            ghostPieceEnabled: config.ghostPieceEnabled !== false,
            holdEnabled: config.holdEnabled !== false
        };
    }

    initializeCanvas() {
        this.canvas = document.getElementById('game');
        this.context = this.canvas.getContext('2d');
        this.holdCanvas = document.getElementById('hold-piece');
        this.holdContext = this.holdCanvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextContext = this.nextCanvas.getContext('2d');

        this.canvas.width = this.config.blockSize * this.config.cols;
        this.canvas.height = this.config.blockSize * this.config.rows;
        this.holdCanvas.width = this.holdCanvas.height = 100;
        this.nextCanvas.width = this.nextCanvas.height = 100;
    }

    initializeGame() {
        this.arena = this.createMatrix(this.config.cols, this.config.rows);
        this.player = {
            pos: {x: 0, y: 0},
            matrix: null,
            score: 0,
            level: 1,
            lines: 0
        };
        this.holdPiece = null;
        this.canHold = true;
        this.nextPiece = null;
        this.dropCounter = 0;
        this.lastTime = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.soundManager = new SoundManager();
        this.controls = new Controls(this);
        
        this.loadHighScores();
        this.playerReset();
    }

    createMatrix(width, height) {
        return Array(height).fill().map(() => Array(width).fill(0));
    }

    loadHighScores() {
        this.highScores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];
        this.updateHighScoreDisplay();
    }

    updateHighScoreDisplay() {
        const highScoresList = document.getElementById('high-scores-list');
        if (highScoresList) {
            highScoresList.innerHTML = '';
            this.highScores.forEach(score => {
                const li = document.createElement('li');
                li.textContent = score;
                highScoresList.appendChild(li);
            });
        }
        
        const highScoreDisplay = document.getElementById('highScore');
        if (highScoreDisplay) {
            highScoreDisplay.textContent = this.highScores[0] || 0;
        }
    }

    draw() {
        // Clear canvas
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ghost piece
        if (this.config.ghostPieceEnabled && !this.gameOver && !this.isPaused) {
            this.drawGhostPiece();
        }

        // Draw game board
        this.drawMatrix(this.arena, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);

        // Update preview windows
        this.drawHoldPiece();
        this.drawNextPiece();
    }

    drawMatrix(matrix, offset, context = this.context, ghost = false) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = ghost ? '#ffffff33' : Piece.PIECES[Object.keys(Piece.PIECES)[value - 1]].color;
                    context.fillRect(
                        (x + offset.x) * this.config.blockSize,
                        (y + offset.y) * this.config.blockSize,
                        this.config.blockSize - 1,
                        this.config.blockSize - 1
                    );
                }
            });
        });
    }

    drawGhostPiece() {
        const ghost = {
            pos: {x: this.player.pos.x, y: this.player.pos.y},
            matrix: this.player.matrix
        };

        while (!this.collide(this.arena, ghost)) {
            ghost.pos.y++;
        }
        ghost.pos.y--;

        this.drawMatrix(ghost.matrix, ghost.pos, this.context, true);
    }

    drawHoldPiece() {
        this.holdContext.fillStyle = '#000';
        this.holdContext.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        
        if (this.holdPiece) {
            const offset = {
                x: (this.holdCanvas.width / this.config.blockSize - this.holdPiece.length) / 2,
                y: (this.holdCanvas.height / this.config.blockSize - this.holdPiece.length) / 2
            };
            this.drawMatrix(this.holdPiece, offset, this.holdContext);
        }
    }

    drawNextPiece() {
        this.nextContext.fillStyle = '#000';
        this.nextContext.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const offset = {
                x: (this.nextCanvas.width / this.config.blockSize - this.nextPiece.matrix.length) / 2,
                y: (this.nextCanvas.height / this.config.blockSize - this.nextPiece.matrix.length) / 2
            };
            this.drawMatrix(this.nextPiece.matrix, offset, this.nextContext);
        }
    }

    collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
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

    moveLeft() {
        this.player.pos.x--;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.x++;
        } else {
            this.soundManager.play('move');
        }
    }

    moveRight() {
        this.player.pos.x++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.x--;
        } else {
            this.soundManager.play('move');
        }
    }

    moveDown() {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.y--;
            this.merge(this.arena, this.player);
            this.soundManager.play('drop');
            this.playerReset();
            this.arenaSweep();
        }
        this.dropCounter = 0;
    }

    hardDrop() {
        while (!this.collide(this.arena, this.player)) {
            this.player.pos.y++;
        }
        this.player.pos.y--;
        this.merge(this.arena, this.player);
        this.soundManager.play('drop');
        this.playerReset();
        this.arenaSweep();
    }

    rotate() {
        const pos = this.player.pos.x;
        let offset = 1;
        this.player.matrix = Piece.rotate(this.player.matrix);
        
        while (this.collide(this.arena, this.player)) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix[0].length) {
                this.player.matrix = Piece.rotate(this.player.matrix, -1);
                this.player.pos.x = pos;
                return;
            }
        }
        this.soundManager.play('rotate');
    }

    holdPiece() {
        if (!this.config.holdEnabled || !this.canHold) return;
        
        if (this.holdPiece === null) {
            this.holdPiece = this.player.matrix;
            this.playerReset();
        } else {
            const temp = this.holdPiece;
            this.holdPiece = this.player.matrix;
            this.player.matrix = temp;
            this.player.pos = Piece.getInitialPosition(this.player.matrix, this.config.cols);
        }
        
        this.canHold = false;
        this.soundManager.play('move');
        this.drawHoldPiece();
    }

    playerReset() {
        if (!this.nextPiece) {
            this.nextPiece = Piece.getRandomPiece();
        }
        
        this.player.matrix = this.nextPiece.matrix;
        this.nextPiece = Piece.getRandomPiece();
        this.player.pos = Piece.getInitialPosition(this.player.matrix, this.config.cols);
        
        if (this.collide(this.arena, this.player)) {
            this.gameOver = true;
            this.soundManager.play('gameOver');
            document.getElementById('game-over').style.display = 'block';
            document.getElementById('final-score').textContent = this.player.score;
            this.updateHighScores();
        }
        
        this.canHold = true;
        this.drawNextPiece();
    }

    updateScore(linesCleared) {
        const linePoints = [40, 100, 300, 1200];
        if (linesCleared > 0) {
            this.player.score += linePoints[linesCleared - 1] * this.player.level;
            this.player.lines += linesCleared;
            
            if (this.player.lines >= this.player.level * 10) {
                this.player.level++;
                this.soundManager.play('levelUp');
                this.config.dropInterval = Math.max(100, 1000 - (this.player.level - 1) * 100);
            }
            
            document.getElementById('score').textContent = this.player.score;
            document.getElementById('level').textContent = this.player.level;
            document.getElementById('lines').textContent = this.player.lines;
        }
    }

    updateHighScores() {
        this.highScores.push(this.player.score);
        this.highScores.sort((a, b) => b - a);
        this.highScores = this.highScores.slice(0, 5);
        localStorage.setItem('tetrisHighScores', JSON.stringify(this.highScores));
        this.updateHighScoreDisplay();
    }

    arenaSweep() {
        let linesCleared = 0;
        outer: for (let y = this.arena.length - 1; y >= 0; --y) {
            for (let x = 0; x < this.arena[y].length; ++x) {
                if (this.arena[y][x] === 0) continue outer;
            }
            
            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
            ++y;
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            this.soundManager.play('clear');
            this.updateScore(linesCleared);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-menu').style.display = this.isPaused ? 'block' : 'none';
    }

    reset() {
        this.arena.forEach(row => row.fill(0));
        this.player.score = 0;
        this.player.level = 1;
        this.player.lines = 0;
        this.config.dropInterval = 1000;
        this.gameOver = false;
        this.holdPiece = null;
        this.nextPiece = null;
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('score').textContent = '0';
        document.getElementById('level').textContent = '1';
        document.getElementById('lines').textContent = '0';
        this.playerReset();
    }

    update(time = 0) {
        if (!this.isPaused) {
            const deltaTime = time - this.lastTime;
            this.lastTime = time;
            this.dropCounter += deltaTime;
            
            if (this.dropCounter > this.config.dropInterval) {
                this.moveDown();
            }
            
            this.draw();
        }
        requestAnimationFrame(this.update.bind(this));
    }

    setupEventListeners() {
        // Volume control
        const volumeControl = document.getElementById('volume');
        if (volumeControl) {
            volumeControl.addEventListener('input', (e) => {
                this.soundManager.setVolume(e.target.value / 100);
            });
        }

        // Mute toggle
        const muteButton = document.getElementById('mute');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                const isMuted = this.soundManager.toggleMute();
                muteButton.textContent = isMuted ? '🔇' : '🔊';
            });
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new TetrisGame();
    game.update();
});
