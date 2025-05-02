/**
 * Game board logic for Tetris Crush
 */

class GameBoard {
    constructor(width, height, blockSize, ctx, particleSystem) {
        this.width = width;
        this.height = height;
        this.blockSize = blockSize;
        this.ctx = ctx;
        this.particleSystem = particleSystem;
        this.grid = this.createEmptyGrid();
        this.animations = [];
        this.comboCount = 0;
        this.comboTimer = 0;
    }
    
    // Create an empty grid
    createEmptyGrid() {
        return Array(this.height).fill().map(() => Array(this.width).fill(null));
    }
    
    // Reset the board
    reset() {
        this.grid = this.createEmptyGrid();
        this.animations = [];
        this.comboCount = 0;
        this.comboTimer = 0;
    }
    
    // Check if a position is valid (in bounds and not occupied)
    isValidPosition(block) {
        const points = block.getPoints();
        
        return points.every(point => {
            const { x, y } = point;
            
            // Check bounds
            if (x < 0 || x >= this.width || y >= this.height) {
                return false;
            }
            
            // Check collision with existing blocks (only if the point is on the board)
            if (y >= 0 && this.grid[y][x] !== null) {
                return false;
            }
            
            return true;
        });
    }
    
    // Place a block on the grid
    placeBlock(block) {
        block.flash(); // Flash effect when placing
        const points = block.getPoints();
        
        points.forEach(point => {
            const { x, y } = point;
            if (y >= 0 && y < this.height) {
                this.grid[y][x] = {
                    color: point.color,
                    blockType: point.blockType
                };
            }
        });
        
        // Check for special blocks
        if (block.isSpecial) {
            this.activateSpecialBlock(block);
        }
        
        // Process matches and clear rows
        return this.processBoard();
    }
    
    // Activate special block effects
    activateSpecialBlock(block) {
        const points = block.getPoints();
        
        points.forEach(point => {
            const { x, y, blockType } = point;
            
            // Skip if not on board
            if (y < 0 || y >= this.height) return;
            
            if (blockType === 'BOMB') {
                // Bomb: clear 3x3 area
                this.activateBomb(x, y);
            } else if (blockType === 'COLOR_WIPE') {
                // Color Wipe: clear all blocks of a specific color
                this.activateColorWipe(x, y);
            }
        });
    }
    
    // Bomb: clear 3x3 area
    activateBomb(centerX, centerY) {
        const affectedPositions = [];
        
        // Check 3x3 area
        for (let y = Math.max(0, centerY - 1); y <= Math.min(this.height - 1, centerY + 1); y++) {
            for (let x = Math.max(0, centerX - 1); x <= Math.min(this.width - 1, centerX + 1); x++) {
                if (this.grid[y][x] !== null) {
                    affectedPositions.push({ x, y, color: this.grid[y][x].color });
                    this.grid[y][x] = null;
                }
            }
        }
        
        // Create explosion effect
        if (affectedPositions.length > 0) {
            this.particleSystem.createExplosion(
                centerX * this.blockSize + this.blockSize / 2,
                centerY * this.blockSize + this.blockSize / 2,
                '#FFBC00',
                50,
                150
            );
            
            // Add score
            const points = affectedPositions.length * 100;
            this.addScore(points);
            
            // Create floating score text
            this.createScoreAnimation(
                centerX * this.blockSize + this.blockSize / 2,
                centerY * this.blockSize + this.blockSize / 2,
                points
            );
        }
    }
    
    // Color Wipe: clear all blocks of the same color
    activateColorWipe(x, y) {
        // Find a neighbor block with color
        let targetColor = null;
        
        // Check adjacent blocks
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                if (this.grid[ny][nx] !== null) {
                    targetColor = this.grid[ny][nx].color;
                    break;
                }
            }
        }
        
        // If no color found, pick random position
        if (!targetColor) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.grid[y][x] !== null) {
                        targetColor = this.grid[y][x].color;
                        break;
                    }
                }
                if (targetColor) break;
            }
        }
        
        // If still no color, do nothing
        if (!targetColor) return;
        
        // Clear all blocks of the same color
        const affectedPositions = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== null && this.grid[y][x].color === targetColor) {
                    affectedPositions.push({ x, y, color: targetColor });
                    this.grid[y][x] = null;
                }
            }
        }
        
        // Create effect for all cleared blocks
        affectedPositions.forEach(pos => {
            this.particleSystem.createExplosion(
                pos.x * this.blockSize + this.blockSize / 2,
                pos.y * this.blockSize + this.blockSize / 2,
                pos.color,
                10,
                50
            );
        });
        
        // Add score
        const points = affectedPositions.length * 150;
        this.addScore(points);
        
        // Create floating score text
        if (affectedPositions.length > 0) {
            this.createScoreAnimation(
                x * this.blockSize + this.blockSize / 2,
                y * this.blockSize + this.blockSize / 2,
                points
            );
        }
    }
    
    // Process the board (match3, clear rows, etc)
    processBoard() {
        let score = 0;
        let hasChanges = true;
        let totalMatches = 0;
        
        // Apply gravity first to make blocks fall
        this.applyGravity();
        
        // Check for complete rows (Tetris style)
        const completeRows = this.findCompleteRows();
        
        if (completeRows.length > 0) {
            // Clear complete rows and award score
            completeRows.forEach(row => {
                // Create particle effect for row clear
                this.particleSystem.createRowClearEffect(row, this.width, this.blockSize);
                
                // Clear the row
                for (let x = 0; x < this.width; x++) {
                    this.grid[row][x] = null;
                }
                
                // Calculate score for this row clear
                const rowScore = 1000 * completeRows.length;
                score += rowScore;
                
                // Create floating score text
                this.createScoreAnimation(
                    this.width * this.blockSize / 2,
                    row * this.blockSize + this.blockSize / 2,
                    Math.round(rowScore)
                );
            });
            
            // Apply gravity again after clearing rows
            this.applyGravity();
            
            totalMatches = completeRows.length;
        }
        
        return {
            score: Math.round(score),
            matches: totalMatches
        };
    }
    
    // Find match-3+ patterns (horizontal, vertical, L-shape)
    findMatches() {
        const matches = [];
        const visited = Array(this.height).fill().map(() => Array(this.width).fill(false));
        
        // Check each cell
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Skip empty cells or already visited
                if (this.grid[y][x] === null || visited[y][x]) continue;
                
                const color = this.grid[y][x].color;
                const match = this.findConnectedBlocks(x, y, color, visited);
                
                // If we have 3+ blocks, it's a match
                if (match.length >= 3) {
                    matches.push(match);
                }
            }
        }
        
        return matches;
    }
    
    // Find connected blocks of the same color using flood fill
    findConnectedBlocks(startX, startY, color, visited) {
        const match = [];
        const queue = [{ x: startX, y: startY }];
        
        while (queue.length > 0) {
            const { x, y } = queue.shift();
            
            // Skip if out of bounds, already visited, empty, or different color
            if (x < 0 || x >= this.width || y < 0 || y >= this.height || 
                visited[y][x] || this.grid[y][x] === null || 
                this.grid[y][x].color !== color) {
                continue;
            }
            
            // Mark as visited and add to match
            visited[y][x] = true;
            match.push({ x, y });
            
            // Check neighbors (4-way connectivity)
            queue.push({ x: x - 1, y }); // Left
            queue.push({ x: x + 1, y }); // Right
            queue.push({ x, y: y - 1 }); // Up
            queue.push({ x, y: y + 1 }); // Down
        }
        
        return match;
    }
    
    // Find complete rows (Tetris style)
    findCompleteRows() {
        const completeRows = [];
        
        for (let y = 0; y < this.height; y++) {
            if (this.grid[y].every(cell => cell !== null)) {
                completeRows.push(y);
            }
        }
        
        return completeRows;
    }
    
    // Apply gravity to make blocks fall down
    applyGravity() {
        let moved = false;
        
        // Start from the bottom row and work upwards
        for (let y = this.height - 2; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== null) {
                    // Check if there's empty space below
                    let newY = y;
                    while (newY + 1 < this.height && this.grid[newY + 1][x] === null) {
                        newY++;
                    }
                    
                    // If the block can fall
                    if (newY !== y) {
                        this.grid[newY][x] = this.grid[y][x];
                        this.grid[y][x] = null;
                        moved = true;
                    }
                }
            }
        }
        
        return moved;
    }
    
    // Draw the grid
    draw() {
        // Calculate board dimensions
        const boardWidth = this.width * this.blockSize;
        const boardHeight = this.height * this.blockSize;
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, boardHeight);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(boardWidth, y * this.blockSize);
            this.ctx.stroke();
        }
        
        // Draw blocks
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== null) {
                    this.drawBlock(x, y, this.grid[y][x].color);
                }
            }
        }
        
        // Draw animations
        this.updateAnimations();
    }
    
    // Draw a single block
    drawBlock(x, y, color) {
        const blockSize = this.blockSize;
        
        // Apply same style as in Block class
        // Draw main square - fill entire block cell with no gaps
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        // Draw highlights (top and left edges)
        this.ctx.fillStyle = lightenColor(color, 20);
        this.ctx.beginPath();
        this.ctx.moveTo(x * blockSize, y * blockSize);
        this.ctx.lineTo((x + 1) * blockSize, y * blockSize);
        this.ctx.lineTo((x + 1) * blockSize - blockSize/10, y * blockSize + blockSize/10);
        this.ctx.lineTo(x * blockSize + blockSize/10, y * blockSize + blockSize/10);
        this.ctx.lineTo(x * blockSize + blockSize/10, (y + 1) * blockSize - blockSize/10);
        this.ctx.lineTo(x * blockSize, (y + 1) * blockSize);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw shadows (bottom and right edges)
        this.ctx.fillStyle = darkenColor(color, 30);
        this.ctx.beginPath();
        this.ctx.moveTo((x + 1) * blockSize, y * blockSize);
        this.ctx.lineTo((x + 1) * blockSize, (y + 1) * blockSize);
        this.ctx.lineTo(x * blockSize, (y + 1) * blockSize);
        this.ctx.lineTo(x * blockSize + blockSize/10, (y + 1) * blockSize - blockSize/10);
        this.ctx.lineTo((x + 1) * blockSize - blockSize/10, (y + 1) * blockSize - blockSize/10);
        this.ctx.lineTo((x + 1) * blockSize - blockSize/10, y * blockSize + blockSize/10);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw inner square
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * blockSize + blockSize/10, 
            y * blockSize + blockSize/10, 
            blockSize - blockSize/5, 
            blockSize - blockSize/5
        );
    }
    
    // Create a floating score animation
    createScoreAnimation(x, y, score) {
        this.animations.push({
            type: 'score',
            x: x,
            y: y,
            score: score,
            opacity: 1,
            scale: 1,
            life: 60 // 1 second at 60fps
        });
    }
    
    // Update and draw animations
    updateAnimations() {
        // Process each animation
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            
            if (anim.type === 'score') {
                // Draw score text
                this.ctx.save();
                this.ctx.translate(anim.x, anim.y);
                this.ctx.scale(anim.scale, anim.scale);
                this.ctx.globalAlpha = anim.opacity;
                
                this.ctx.font = 'bold 20px "Fredoka One", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // Outline
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.lineWidth = 4;
                this.ctx.strokeText(`+${anim.score}`, 0, 0);
                
                // Text
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillText(`+${anim.score}`, 0, 0);
                
                this.ctx.restore();
                
                // Update animation
                anim.y -= 1;
                anim.opacity -= 0.02;
                anim.scale += 0.01;
                anim.life--;
                
                // Remove finished animations
                if (anim.life <= 0) {
                    this.animations.splice(i, 1);
                }
            }
        }
        
        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) {
                this.comboCount = 0;
            }
        }
    }
    
    // Add score to the game
    addScore(points) {
        const scoreElement = document.getElementById('current-score');
        const currentScore = parseInt(scoreElement.textContent);
        const newScore = currentScore + points;
        
        scoreElement.textContent = newScore;
        
        // Update best score if needed
        const bestScoreElement = document.getElementById('best-score');
        const bestScore = parseInt(bestScoreElement.textContent);
        
        if (newScore > bestScore) {
            bestScoreElement.textContent = newScore;
            saveToLocalStorage('tetrisCrush_bestScore', newScore);
        }
    }
}