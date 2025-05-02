/**
 * Block definitions and tetromino shapes for Tetris Crush
 */

// Define block types (Tetrominos)
const SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};

// Define standard Tetris colors for each block type
const BLOCK_COLORS = {
    I: '#00FFFF', // Cyan
    J: '#0000FF', // Blue
    L: '#FF7F00', // Orange
    O: '#FFFF00', // Yellow
    S: '#00FF00', // Green
    T: '#7F00FF', // Purple
    Z: '#FF0000'  // Red
};

// Block class representing a Tetromino
class Block {
    constructor(shape, color) {
        this.matrix = SHAPES[shape];
        this.color = color || BLOCK_COLORS[shape];
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.type = shape;
        this.isSpecial = false;
        this.flashEffect = 0;
        
        // Center the block at spawn
        this.x = Math.floor((10 - this.matrix[0].length) / 2);
        this.y = -this.getHeight();
    }
    
    // Get width of the current rotation
    getWidth() {
        return this.matrix[0].length;
    }
    
    // Get height of the current rotation
    getHeight() {
        return this.matrix.length;
    }
    
    // Rotate the block clockwise
    rotate() {
        const oldMatrix = this.matrix;
        const m = this.matrix.length;
        const n = this.matrix[0].length;
        
        // Create a new matrix for the rotated block
        const rotated = Array(n).fill().map(() => Array(m).fill(0));
        
        // Perform the rotation (90 degrees clockwise)
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                rotated[j][m - 1 - i] = this.matrix[i][j];
            }
        }
        
        this.matrix = rotated;
        this.rotation = (this.rotation + 1) % 4;
        
        return this.matrix;
    }
    
    // Move the block left
    moveLeft() {
        this.x--;
    }
    
    // Move the block right
    moveRight() {
        this.x++;
    }
    
    // Move the block down
    moveDown() {
        this.y++;
    }
    
    // Get points covered by the block in its current position
    getPoints() {
        const points = [];
        
        for (let y = 0; y < this.matrix.length; y++) {
            for (let x = 0; x < this.matrix[y].length; x++) {
                if (this.matrix[y][x]) {
                    points.push({
                        x: this.x + x,
                        y: this.y + y,
                        color: this.color,
                        blockType: this.type
                    });
                }
            }
        }
        
        return points;
    }
    
    // Draw the block on the canvas
    draw(ctx, blockSize) {
        const points = this.getPoints();
        
        points.forEach(point => {
            const x = point.x * blockSize;
            const y = point.y * blockSize;
            
            if (y >= 0) { // Only draw if visible on screen
                this.drawTetrisBlock(ctx, x, y, blockSize, this.color, this.flashEffect);
            }
        });
        
        // Update flash effect (if active)
        if (this.flashEffect > 0) {
            this.flashEffect -= 0.05;
            if (this.flashEffect < 0) this.flashEffect = 0;
        }
    }
    
    // Draw a Tetris block
    drawTetrisBlock(ctx, x, y, size, color, flashEffect = 0) {
        // Apply flash effect to color
        const blockColor = flashEffect > 0 
            ? lightenColor(color, flashEffect * 50)
            : color;
        
        const shadowColor = darkenColor(color, 30);
        const highlightColor = lightenColor(color, 20);
        
        // Draw main square - ensure it fills the entire block with no gaps
        ctx.fillStyle = blockColor;
        ctx.fillRect(x, y, size, size);
        
        // Draw highlights (top and left edges)
        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size - size/10, y + size/10);
        ctx.lineTo(x + size/10, y + size/10);
        ctx.lineTo(x + size/10, y + size - size/10);
        ctx.lineTo(x, y + size);
        ctx.closePath();
        ctx.fill();
        
        // Draw shadows (bottom and right edges)
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        ctx.moveTo(x + size, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size/10, y + size - size/10);
        ctx.lineTo(x + size - size/10, y + size - size/10);
        ctx.lineTo(x + size - size/10, y + size/10);
        ctx.closePath();
        ctx.fill();
        
        // Draw inner square
        ctx.fillStyle = blockColor;
        ctx.fillRect(
            x + size/10, 
            y + size/10, 
            size - size/5, 
            size - size/5
        );
    }
    
    // Trigger flash effect (when block locks in place)
    flash() {
        this.flashEffect = 1;
    }
}

// Create a random block
function createRandomBlock() {
    // Select random shape
    const shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const shape = shapes[randomInt(0, shapes.length - 1)];
    
    // Use the standard color for this shape
    const color = BLOCK_COLORS[shape];
    
    return new Block(shape, color);
} 