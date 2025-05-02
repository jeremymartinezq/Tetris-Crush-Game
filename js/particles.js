/**
 * Particle system for explosions and visual effects
 */

class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.lastTime = 0;
    }
    
    // Create explosion at a specific position
    createExplosion(x, y, color, count = 30, spread = 100) {
        for (let i = 0; i < count; i++) {
            const particle = {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * spread / 10,  // Velocity X
                vy: (Math.random() - 0.5) * spread / 10,  // Velocity Y
                radius: randomInt(3, 8),
                color: color,
                alpha: 1,
                life: randomInt(30, 60), // Lifetime in frames
                maxLife: randomInt(30, 60),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                shape: Math.random() < 0.3 ? 'star' : 'circle',
                gravity: Math.random() * 0.2
            };
            this.particles.push(particle);
        }
    }
    
    // Create matching effect at specific positions
    createMatchEffect(positions, color, blockSize) {
        // Sparkle particles at each position
        positions.forEach(pos => {
            const x = pos.x * blockSize + blockSize / 2;
            const y = pos.y * blockSize + blockSize / 2;
            
            // Create a burst of particles
            this.createExplosion(x, y, color, 10, 50);
            
            // Add a few star particles
            for (let i = 0; i < 3; i++) {
                const particle = {
                    x: x + (Math.random() - 0.5) * blockSize * 0.8,
                    y: y + (Math.random() - 0.5) * blockSize * 0.8,
                    vx: (Math.random() - 0.5) * 1,
                    vy: -1 - Math.random() * 2,
                    radius: randomInt(2, 4),
                    color: lightenColor(color, 30),
                    alpha: 1,
                    life: randomInt(20, 40),
                    maxLife: randomInt(20, 40),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    shape: 'star',
                    gravity: 0.03
                };
                this.particles.push(particle);
            }
        });
    }
    
    // Create row clear effect
    createRowClearEffect(row, width, blockSize) {
        for (let x = 0; x < width; x++) {
            const posX = x * blockSize + blockSize / 2;
            const posY = row * blockSize + blockSize / 2;
            
            // Randomize the color for each position
            const color = randomCandyColor();
            
            for (let i = 0; i < 5; i++) {
                const particle = {
                    x: posX,
                    y: posY,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    radius: randomInt(2, 5),
                    color: color,
                    alpha: 1,
                    life: randomInt(30, 60),
                    maxLife: randomInt(30, 60),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2,
                    shape: Math.random() < 0.5 ? 'circle' : 'star',
                    gravity: 0.05
                };
                this.particles.push(particle);
            }
        }
    }
    
    // Create power-up effect
    createPowerUpEffect(x, y, blockSize) {
        const centerX = x * blockSize + blockSize / 2;
        const centerY = y * blockSize + blockSize / 2;
        
        // Create a swirling effect
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const distance = blockSize * 0.8;
            
            const particle = {
                x: centerX + Math.cos(angle) * distance * Math.random(),
                y: centerY + Math.sin(angle) * distance * Math.random(),
                vx: Math.cos(angle) * 1.5,
                vy: Math.sin(angle) * 1.5,
                radius: randomInt(2, 4),
                color: '#FFFFFF',
                alpha: 1,
                life: randomInt(20, 40),
                maxLife: randomInt(20, 40),
                rotation: angle,
                rotationSpeed: 0.1,
                shape: 'circle',
                gravity: -0.05, // Negative gravity makes particles float up
                shrink: true
            };
            this.particles.push(particle);
        }
        
        // Add a few larger sparkles
        for (let i = 0; i < 5; i++) {
            const particle = {
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: randomInt(5, 8),
                color: '#FFFFFF',
                alpha: 1,
                life: randomInt(30, 50),
                maxLife: randomInt(30, 50),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                shape: 'star',
                gravity: 0,
                shrink: true
            };
            this.particles.push(particle);
        }
    }
    
    // Update particles based on time elapsed
    update(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx * (deltaTime / 16);
            p.y += p.vy * (deltaTime / 16);
            
            // Apply gravity
            p.vy += p.gravity || 0;
            
            // Update rotation
            p.rotation += p.rotationSpeed || 0;
            
            // Update alpha (fade out)
            p.alpha = p.life / p.maxLife;
            
            // Shrink if specified
            if (p.shrink) {
                p.radius *= 0.95;
            }
            
            // Decrease life
            p.life--;
            
            // Remove dead particles
            if (p.life <= 0 || p.radius < 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // Draw all particles
    draw() {
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            
            // Translate to particle position for rotation
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            
            // Draw based on shape
            if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            } else if (p.shape === 'star') {
                this.drawStar(0, 0, p.radius, p.color);
            }
            
            this.ctx.restore();
        });
    }
    
    // Draw a star shape
    drawStar(x, y, radius, color) {
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius / 2;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * i;
            const drawX = Math.cos(angle) * r;
            const drawY = Math.sin(angle) * r;
            
            if (i === 0) {
                this.ctx.moveTo(drawX, drawY);
            } else {
                this.ctx.lineTo(drawX, drawY);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    
    // Clear all particles
    clear() {
        this.particles = [];
    }
} 