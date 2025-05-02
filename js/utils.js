/**
 * Utility functions for Tetris Crush
 */

// Random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random color from our candy colors
function randomCandyColor() {
    const colors = ['#FF427F', '#4285F4', '#0F9D58', '#FFBC00', '#7C4DFF', '#00E5FF'];
    return colors[randomInt(0, colors.length - 1)];
}

// Check if an array of points contains a specific point
function containsPoint(array, x, y) {
    return array.some(point => point.x === x && point.y === y);
}

// Darken a hex color for shadow effects
function darkenColor(hex, percent) {
    // Remove hash
    hex = hex.replace('#', '');
    
    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Darken
    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Lighten a hex color for highlight effects
function lightenColor(hex, percent) {
    // Remove hash
    hex = hex.replace('#', '');
    
    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Lighten
    r = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
    g = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
    b = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Easing functions for animations
const Easing = {
    // Quadratic ease out
    easeOutQuad: t => t * (2 - t),
    
    // Elastic bounce
    elasticBounce: t => {
        return t === 0 || t === 1 
            ? t 
            : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    },
    
    // Bounce effect
    bounce: t => {
        if (t < 0.5) return 4 * t * t * t;
        return (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
};

// Detect mobile device
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0);
}

// Save data to localStorage
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("Error saving to localStorage:", e);
    }
}

// Get data from localStorage
function getFromLocalStorage(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.error("Error reading from localStorage:", e);
        return defaultValue;
    }
}

// Create and return a throttled version of a function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
} 