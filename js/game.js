/**
 * Main game controller for Tetris Crush
 */

class Game {
    constructor(canvas) {
        // Canvas setup
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game config
        this.blockSize = 30; // Each block is 30x30 pixels
        this.boardWidth = 10; // 10 blocks wide
        this.boardHeight = 20; // 20 blocks tall
        
        // Ensure canvas matches board dimensions exactly
        this.canvas.width = this.boardWidth * this.blockSize;
        this.canvas.height = this.boardHeight * this.blockSize;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropSpeed = 1000; // ms
        this.lastDropTime = 0;
        
        // Input tracking
        this.keys = {
            left: false,
            right: false,
            down: false,
            rotate: false,
            hardDrop: false
        };
        
        // Initialize particle system
        this.particles = new ParticleSystem(canvas, this.ctx);
        
        // Initialize game board
        this.board = new GameBoard(
            this.boardWidth, 
            this.boardHeight, 
            this.blockSize, 
            this.ctx,
            this.particles
        );
        
        // Current and next blocks
        this.currentBlock = null;
        this.nextBlock = null;
        
        // Animation
        this.animationId = null;
        this.lastTime = 0;
        
        // Setup input handlers
        this.setupInputHandlers();
        
        // Load high score
        this.loadHighScore();
    }
    
    // Initialize a new game
    init() {
        // Reset game state
        this.board.reset();
        this.particles.clear();
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropSpeed = 1000;
        this.lastDropTime = 0;
        
        // Reset score display
        document.getElementById('current-score').textContent = '0';
        document.getElementById('level').textContent = '1';
        
        // Create initial blocks
        this.currentBlock = createRandomBlock();
        this.nextBlock = createRandomBlock();
        
        // Initialize audio
        audioManager.init();
    }
    
    // Start the game
    start() {
        if (this.isRunning) return;
        
        this.init();
        this.isRunning = true;
        this.gameOver = false;
        
        // Hide start screen, game over screen
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        
        // Start music
        audioManager.startMusic();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    // Pause/resume the game
    togglePause() {
        if (!this.isRunning || this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        
        const pauseButton = document.getElementById('pause-button');
        pauseButton.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        if (this.isPaused) {
            audioManager.pauseMusic();
        } else {
            audioManager.resumeMusic();
        }
    }
    
    // End the game
    endGame() {
        this.isRunning = false;
        this.gameOver = true;
        
        // Update final score
        document.getElementById('final-score').textContent = this.score;
        
        // Show game over screen
        document.getElementById('game-over').classList.remove('hidden');
        
        // Play game over sound
        audioManager.play('gameOver');
        audioManager.stopMusic();
        
        // Save high score
        this.saveHighScore();
        
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // Main game loop
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update and draw the game
        if (this.isRunning && !this.isPaused) {
            this.update(timestamp);
            this.draw();
        }
        
        // Continue the loop
        if (this.isRunning) {
            this.animationId = requestAnimationFrame(time => this.gameLoop(time));
        }
    }
    
    // Update game state
    update(timestamp) {
        // Handle block movement
        if (this.currentBlock) {
            this.handleInput();
            
            // Auto drop based on level speed
            const dropDelay = this.dropSpeed / (1 + (this.level - 1) * 0.2);
            
            if (timestamp - this.lastDropTime >= dropDelay) {
                this.lastDropTime = timestamp;
                this.moveBlockDown();
            }
        }
        
        // Update particles
        this.particles.update(timestamp);
    }
    
    // Draw the game
    draw() {
        // Clear the canvas first
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fill the entire canvas with a solid gray background
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.board.draw();
        
        // Draw current block
        if (this.currentBlock) {
            this.currentBlock.draw(this.ctx, this.blockSize);
            
            // Draw ghost piece (preview of where the block will land)
            this.drawGhostPiece();
        }
        
        // Draw particles
        this.particles.draw();
    }
    
    // Handle keyboard input
    handleInput() {
        if (this.keys.left) {
            this.moveBlockLeft();
            this.keys.left = false;
        }
        
        if (this.keys.right) {
            this.moveBlockRight();
            this.keys.right = false;
        }
        
        if (this.keys.rotate) {
            this.rotateBlock();
            this.keys.rotate = false;
        }
        
        if (this.keys.down) {
            this.moveBlockDown();
            this.keys.down = false;
        }
        
        if (this.keys.hardDrop) {
            this.hardDrop();
            this.keys.hardDrop = false;
        }
    }
    
    // Move block left
    moveBlockLeft() {
        if (!this.currentBlock || this.isPaused || this.gameOver) return;
        
        this.currentBlock.moveLeft();
        
        if (!this.board.isValidPosition(this.currentBlock)) {
            this.currentBlock.moveRight(); // Undo if invalid
        } else {
            audioManager.play('move');
        }
    }
    
    // Move block right
    moveBlockRight() {
        if (!this.currentBlock || this.isPaused || this.gameOver) return;
        
        this.currentBlock.moveRight();
        
        if (!this.board.isValidPosition(this.currentBlock)) {
            this.currentBlock.moveLeft(); // Undo if invalid
        } else {
            audioManager.play('move');
        }
    }
    
    // Move block down
    moveBlockDown() {
        if (!this.currentBlock || this.isPaused || this.gameOver) return;
        
        this.currentBlock.moveDown();
        
        if (!this.board.isValidPosition(this.currentBlock)) {
            this.currentBlock.y--; // Undo if invalid
            this.lockBlock();      // Lock block in place
        }
    }
    
    // Rotate block
    rotateBlock() {
        if (!this.currentBlock || this.isPaused || this.gameOver) return;
        
        const originalMatrix = [...this.currentBlock.matrix];
        const originalX = this.currentBlock.x;
        const originalY = this.currentBlock.y;
        
        this.currentBlock.rotate();
        
        // Wall kicks - try to adjust position if rotation would cause collision
        const kicks = [
            {x: 0, y: 0},   // Original position
            {x: -1, y: 0},  // Left
            {x: 1, y: 0},   // Right
            {x: 0, y: -1},  // Up
            {x: -1, y: -1}, // Left+Up
            {x: 1, y: -1}   // Right+Up
        ];
        
        let validKickFound = false;
        
        for (const kick of kicks) {
            this.currentBlock.x = originalX + kick.x;
            this.currentBlock.y = originalY + kick.y;
            
            if (this.board.isValidPosition(this.currentBlock)) {
                validKickFound = true;
                audioManager.play('rotate');
                break;
            }
        }
        
        // If no valid kick found, revert rotation
        if (!validKickFound) {
            this.currentBlock.matrix = originalMatrix;
            this.currentBlock.x = originalX;
            this.currentBlock.y = originalY;
        }
    }
    
    // Hard drop - move block all the way down
    hardDrop() {
        if (!this.currentBlock || this.isPaused || this.gameOver) return;
        
        // Find how far the block can fall
        let dropDistance = 0;
        
        while (true) {
            this.currentBlock.y++;
            
            if (this.board.isValidPosition(this.currentBlock)) {
                dropDistance++;
            } else {
                this.currentBlock.y--;
                break;
            }
        }
        
        // Award points for hard drop
        this.addScore(dropDistance * 2);
        
        // Lock the block
        audioManager.play('drop');
        this.lockBlock();
    }
    
    // Lock block in place and spawn a new one
    lockBlock() {
        if (!this.currentBlock) return;
        
        // Place the block on the board
        const result = this.board.placeBlock(this.currentBlock);
        
        // Add score for the placement
        if (result.matches > 0) {
            // Add score for completed rows
            this.addScore(result.score);
            
            // Play row clear sound
            audioManager.play('rowClear');
            
            // Update lines cleared and check for level up
            this.linesCleared += result.matches;
            this.checkLevelUp();
        } else {
            // Just play drop sound if no rows were cleared
            audioManager.play('drop');
        }
        
        // Spawn the next block
        this.currentBlock = this.nextBlock;
        this.nextBlock = createRandomBlock();
        
        // Reset the position of the new block
        this.currentBlock.x = Math.floor((this.boardWidth - this.currentBlock.getWidth()) / 2);
        this.currentBlock.y = -this.currentBlock.getHeight();
        
        // Check for game over - if new block can't be placed
        if (!this.board.isValidPosition(this.currentBlock)) {
            this.endGame();
        }
    }
    
    // Draw ghost piece (preview of where the block will land)
    drawGhostPiece() {
        if (!this.currentBlock) return;
        
        // Create a ghost copy of the current block
        const ghostBlock = new Block(this.currentBlock.type, this.currentBlock.color);
        ghostBlock.matrix = [...this.currentBlock.matrix];
        ghostBlock.x = this.currentBlock.x;
        ghostBlock.y = this.currentBlock.y;
        
        // Move ghost down until it collides
        while (this.board.isValidPosition(ghostBlock)) {
            ghostBlock.y++;
        }
        
        // Move back up one square (to last valid position)
        ghostBlock.y--;
        
        // Skip if ghost is at same position as current block
        if (ghostBlock.y === this.currentBlock.y) return;
        
        // Draw ghost block with transparency
        this.ctx.globalAlpha = 0.3;
        ghostBlock.draw(this.ctx, this.blockSize);
        this.ctx.globalAlpha = 1.0;
    }
    
    // Check if level should increase
    checkLevelUp() {
        const newLevel = Math.floor(this.linesCleared / 10) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            document.getElementById('level').textContent = this.level;
            
            // Play level up sound
            audioManager.play('levelUp');
            
            // Create level up effect
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                this.particles.createExplosion(x, y, randomCandyColor(), 5, 150);
            }
        }
    }
    
    // Add score and update display
    addScore(points) {
        this.score += points;
        document.getElementById('current-score').textContent = this.score;
        
        // Update best score if needed
        const bestScore = parseInt(document.getElementById('best-score').textContent);
        if (this.score > bestScore) {
            document.getElementById('best-score').textContent = this.score;
        }
    }
    
    // Save high score to localStorage
    saveHighScore() {
        const bestScore = Math.max(
            this.score,
            parseInt(document.getElementById('best-score').textContent)
        );
        saveToLocalStorage('tetrisCrush_bestScore', bestScore);
    }
    
    // Load high score from localStorage
    loadHighScore() {
        const bestScore = getFromLocalStorage('tetrisCrush_bestScore', 0);
        document.getElementById('best-score').textContent = bestScore;
    }
    
    // Setup keyboard and touch input handlers
    setupInputHandlers() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.gameOver) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.keys.left = true;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.keys.right = true;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.keys.down = true;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.keys.rotate = true;
                    e.preventDefault();
                    break;
                case ' ': // Space
                    this.keys.hardDrop = true;
                    e.preventDefault();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    e.preventDefault();
                    break;
            }
        });
        
        // Touch controls
        const touchLeft = document.getElementById('touch-left');
        const touchRight = document.getElementById('touch-right');
        const touchRotate = document.getElementById('touch-rotate');
        const touchDrop = document.getElementById('touch-drop');
        
        // Add touch handlers if elements exist
        if (touchLeft) touchLeft.addEventListener('click', () => this.keys.left = true);
        if (touchRight) touchRight.addEventListener('click', () => this.keys.right = true);
        if (touchRotate) touchRotate.addEventListener('click', () => this.keys.rotate = true);
        if (touchDrop) touchDrop.addEventListener('click', () => this.keys.hardDrop = true);
        
        // Pause button
        const pauseButton = document.getElementById('pause-button');
        pauseButton.addEventListener('click', () => this.togglePause());
        
        // Start button
        const startButton = document.getElementById('start-button');
        startButton.addEventListener('click', () => this.start());
        
        // Restart button
        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => this.start());
    }
} 