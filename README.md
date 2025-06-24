# Modern Tetris Game

A modern implementation of the classic Tetris game with enhanced features and responsive design.

## Features

- 🎮 Modern, responsive UI that works on both desktop and mobile
- 👻 Ghost piece preview
- 🔄 Hold piece functionality
- 🎯 Next piece preview
- 🏆 High score system
- 📱 Touch controls for mobile devices
- ⚡ Progressive difficulty
- ⏸️ Pause functionality
- 🎵 Sound effects
- 🌈 Beautiful animations

## Controls

### Desktop
- ⬅️ ➡️ Arrow keys: Move piece
- ⬆️ Up Arrow: Rotate piece
- ⬇️ Down Arrow: Soft drop
- Space: Hard drop
- C: Hold piece
- P: Pause game
- Enter: Restart after game over

### Mobile
- Swipe left/right: Move piece
- Tap: Rotate piece
- Swipe down: Soft drop
- Swipe up: Hard drop
- Hold button: Store/swap piece
- Pause button: Pause game

## How to Play

1. Open `index.html` in your web browser
2. Use the controls to move and rotate pieces
3. Clear lines to score points
4. Level up by clearing more lines
5. Try to beat your high score!

## Scoring System

- Single line: 40 × level
- Double line: 100 × level
- Triple line: 300 × level
- Tetris (4 lines): 1200 × level

## Technical Details


The game is built using:
- HTML5 Canvas for rendering
- CSS3 for styling and animations
- JavaScript for game logic
- Local Storage for high score persistence


## File Structure

```
tetris/
├── index.html          # Main game file
├── css/
│   └── styles.css      # Game styling
├── js/
│   ├── game.js         # Core game logic
│   ├── pieces.js       # Tetromino definitions
│   ├── controls.js     # Input handling
│   └── sound.js        # Sound management
└── assets/
    └── sounds/         # Game sound effects
```
