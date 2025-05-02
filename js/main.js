/**
 * Main entry point for Tetris Crush
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('game-canvas');
    
    // Create game instance
    const game = new Game(canvas);
    
    // Add CSS class for hidden elements
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .hidden {
                display: none !important;
            }
        </style>
    `);
    
    // Add resize handler for mobile responsiveness
    window.addEventListener('resize', () => {
        adjustForMobile();
    });
    
    // Adjust for mobile initially
    adjustForMobile();
    
    // Add swipe controls for mobile
    if (isMobileDevice()) {
        setupSwipeControls(game);
    }
    
    // Set up event listener for start button
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', () => {
        // Start with a button animation
        startButton.classList.add('animate-pulse-fast');
        
        // Create initial explosion effect
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            game.particles.createExplosion(x, y, randomCandyColor(), 10);
        }
        
        // Start the game after a short delay
        setTimeout(() => {
            game.start();
        }, 300);
    });
    
    // Apply candy styling
    applyCandyStyling();
});

// Adjust layout for mobile devices
function adjustForMobile() {
    const isMobile = window.innerWidth < 768;
    const touchControls = document.querySelector('.flex.md\\:hidden');
    
    if (touchControls) {
        touchControls.style.display = isMobile ? 'flex' : 'none';
    }
}

// Set up swipe controls for mobile
function setupSwipeControls(game) {
    const canvas = document.getElementById('game-canvas');
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    canvas.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const horizontalDiff = touchEndX - touchStartX;
        const verticalDiff = touchEndY - touchStartY;
        
        // Detect a tap (for rotation)
        if (Math.abs(horizontalDiff) < 20 && Math.abs(verticalDiff) < 20) {
            game.keys.rotate = true;
            return;
        }
        
        // Horizontal swipe
        if (Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
            if (horizontalDiff > 50) {
                game.keys.right = true;
            } else if (horizontalDiff < -50) {
                game.keys.left = true;
            }
        } 
        // Vertical swipe
        else {
            if (verticalDiff > 50) {
                game.keys.down = true;
            } else if (verticalDiff < -50) {
                game.keys.hardDrop = true;
            }
        }
    }
}

// Apply candy-like styling to UI elements dynamically
function applyCandyStyling() {
    // Add shine effects to buttons
    const buttons = document.querySelectorAll('.game-button');
    
    buttons.forEach(button => {
        // Add shine animation
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        
        const shine = document.createElement('div');
        shine.style.position = 'absolute';
        shine.style.top = '0';
        shine.style.left = '-100%';
        shine.style.width = '50%';
        shine.style.height = '100%';
        shine.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)';
        shine.style.animation = 'shine 3s infinite';
        
        button.appendChild(shine);
    });
    
    // Add keyframe animation for shine
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes shine {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Call candy styling
applyCandyStyling(); 