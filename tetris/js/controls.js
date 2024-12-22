class Controls {
    constructor(game) {
        this.game = game;
        this.touchStartX = null;
        this.touchStartY = null;
        this.swipeThreshold = 30;
        this.setupKeyboardControls();
        this.setupTouchControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            if (this.game.isPaused && event.key !== 'p' && event.key !== 'P') return;
            
            switch (event.key) {
                case 'ArrowLeft':
                    this.game.moveLeft();
                    break;
                case 'ArrowRight':
                    this.game.moveRight();
                    break;
                case 'ArrowDown':
                    this.game.moveDown();
                    break;
                case 'ArrowUp':
                    this.game.rotate();
                    break;
                case ' ':
                    event.preventDefault();
                    this.game.hardDrop();
                    break;
                case 'c':
                case 'C':
                    this.game.holdPiece();
                    break;
                case 'p':
                case 'P':
                    this.game.togglePause();
                    break;
                case 'Enter':
                    if (this.game.gameOver) {
                        this.game.reset();
                    }
                    break;
            }
        });
    }

    setupTouchControls() {
        document.addEventListener('touchstart', (event) => {
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
        }, false);

        document.addEventListener('touchmove', (event) => {
            if (!this.touchStartX || !this.touchStartY || this.game.isPaused) return;

            event.preventDefault();
            
            const touchX = event.touches[0].clientX;
            const touchY = event.touches[0].clientY;
            const diffX = touchX - this.touchStartX;
            const diffY = touchY - this.touchStartY;

            // Determine if it's a horizontal or vertical swipe
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > this.swipeThreshold) {
                    if (diffX > 0) {
                        this.game.moveRight();
                    } else {
                        this.game.moveLeft();
                    }
                    this.touchStartX = touchX;
                    this.touchStartY = touchY;
                }
            } else {
                if (Math.abs(diffY) > this.swipeThreshold) {
                    if (diffY > 0) {
                        this.game.moveDown();
                    } else {
                        this.game.hardDrop();
                    }
                    this.touchStartX = touchX;
                    this.touchStartY = touchY;
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            this.touchStartX = null;
            this.touchStartY = null;
        }, false);

        // Add mobile control buttons
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            const buttons = {
                'rotate': () => this.game.rotate(),
                'left': () => this.game.moveLeft(),
                'right': () => this.game.moveRight(),
                'down': () => this.game.moveDown(),
                'hold': () => this.game.holdPiece(),
                'drop': () => this.game.hardDrop()
            };

            Object.entries(buttons).forEach(([action, handler]) => {
                const button = mobileControls.querySelector(`[data-action="${action}"]`);
                if (button) {
                    button.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        handler();
                    });
                }
            });
        }
    }
}
