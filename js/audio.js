/**
 * Audio system for Tetris Crush
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.bgMusic = null;
        this.initialized = false;
    }
    
    // Initialize the audio system
    init() {
        if (this.initialized) return;
        
        // Load mute preference
        this.muted = getFromLocalStorage('tetrisCrush_muted', false);
        
        // Define sounds
        const soundDefinitions = {
            move: { url: 'assets/sounds/move.mp3', volume: 0.4 },
            rotate: { url: 'assets/sounds/rotate.mp3', volume: 0.4 },
            drop: { url: 'assets/sounds/drop.mp3', volume: 0.5 },
            match: { url: 'assets/sounds/match.mp3', volume: 0.6 },
            rowClear: { url: 'assets/sounds/rowclear.mp3', volume: 0.7 },
            levelUp: { url: 'assets/sounds/levelup.mp3', volume: 0.8 },
            gameOver: { url: 'assets/sounds/gameover.mp3', volume: 0.7 },
            bomb: { url: 'assets/sounds/bomb.mp3', volume: 0.8 },
            colorWipe: { url: 'assets/sounds/colorwipe.mp3', volume: 0.7 },
            combo: { url: 'assets/sounds/combo.mp3', volume: 0.6 }
        };
        
        // Create placeholder sounds until real ones are loaded
        for (const [name, definition] of Object.entries(soundDefinitions)) {
            this.createPlaceholderSound(name, definition.volume);
        }
        
        // Create background music
        this.bgMusic = this.createPlaceholderMusic();
        
        // Setup mute button
        const muteButton = document.getElementById('mute-button');
        muteButton.addEventListener('click', () => this.toggleMute());
        
        // Update mute button display
        muteButton.textContent = this.muted ? '🔇' : '🔊';
        
        // Try to load real sounds
        this.loadRealSounds(soundDefinitions);
        
        this.initialized = true;
    }
    
    // Create a placeholder sound using Web Audio API
    createPlaceholderSound(name, volume = 0.5) {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        
        this.sounds[name] = {
            play: () => {
                if (this.muted) return;
                
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                // Different sound types for different actions
                switch (name) {
                    case 'move':
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 200;
                        gainNode.gain.value = volume * 0.3;
                        oscillator.start();
                        oscillator.stop(ctx.currentTime + 0.1);
                        break;
                    case 'rotate':
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 300;
                        gainNode.gain.value = volume * 0.3;
                        oscillator.start();
                        oscillator.stop(ctx.currentTime + 0.15);
                        break;
                    case 'drop':
                        oscillator.type = 'square';
                        oscillator.frequency.value = 150;
                        gainNode.gain.value = volume * 0.5;
                        oscillator.start();
                        gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                        oscillator.stop(ctx.currentTime + 0.3);
                        break;
                    case 'match':
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 440;
                        gainNode.gain.value = volume * 0.5;
                        oscillator.start();
                        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
                        gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                        oscillator.stop(ctx.currentTime + 0.3);
                        break;
                    case 'rowClear':
                        oscillator.type = 'square';
                        oscillator.frequency.value = 440;
                        gainNode.gain.value = volume * 0.6;
                        oscillator.start();
                        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
                        gainNode.gain.setValueAtTime(volume * 0.6, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                        oscillator.stop(ctx.currentTime + 0.4);
                        break;
                    case 'levelUp':
                        oscillator.type = 'sawtooth';
                        oscillator.frequency.value = 220;
                        gainNode.gain.value = volume * 0.5;
                        oscillator.start();
                        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
                        gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                        oscillator.stop(ctx.currentTime + 0.6);
                        break;
                    case 'gameOver':
                        oscillator.type = 'sawtooth';
                        oscillator.frequency.value = 880;
                        gainNode.gain.value = volume * 0.5;
                        oscillator.start();
                        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
                        gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                        oscillator.stop(ctx.currentTime + 0.6);
                        break;
                    case 'bomb':
                        oscillator.type = 'square';
                        oscillator.frequency.value = 100;
                        gainNode.gain.value = volume * 0.6;
                        oscillator.start();
                        oscillator.frequency.setValueAtTime(100, ctx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
                        gainNode.gain.setValueAtTime(volume * 0.6, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                        oscillator.stop(ctx.currentTime + 0.5);
                        break;
                    case 'colorWipe':
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 1000;
                        gainNode.gain.value = volume * 0.3;
                        oscillator.start();
                        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
                        gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                        oscillator.stop(ctx.currentTime + 0.5);
                        break;
                    case 'combo':
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 440;
                        gainNode.gain.value = volume * 0.4;
                        oscillator.start();
                        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
                        oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.2);
                        gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                        oscillator.stop(ctx.currentTime + 0.3);
                        break;
                    default:
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 440;
                        gainNode.gain.value = volume * 0.5;
                        oscillator.start();
                        oscillator.stop(ctx.currentTime + 0.2);
                }
            }
        };
    }
    
    // Create placeholder background music
    createPlaceholderMusic() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        
        let isPlaying = false;
        let nodes = [];
        
        const playNote = (freq, duration, delay, volume) => {
            setTimeout(() => {
                if (!isPlaying || this.muted) return;
                
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = freq;
                gainNode.gain.value = volume;
                
                oscillator.start(ctx.currentTime);
                gainNode.gain.setValueAtTime(volume, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                oscillator.stop(ctx.currentTime + duration);
                
                nodes.push({ oscillator, gainNode });
                
                // Remove from nodes array once done
                setTimeout(() => {
                    const index = nodes.findIndex(n => n.oscillator === oscillator);
                    if (index !== -1) nodes.splice(index, 1);
                }, duration * 1000);
            }, delay * 1000);
        };
        
        const playMusicPattern = () => {
            if (!isPlaying) return;
            
            const baseVolume = 0.1;
            const noteDuration = 0.2;
            const noteGap = 0.05;
            let time = 0;
            
            // Simple melody
            [440, 440, 660, 660, 880, 880, 660].forEach((freq, i) => {
                playNote(freq, noteDuration, time, baseVolume);
                time += noteDuration + noteGap;
            });
            
            // Restart the pattern
            setTimeout(playMusicPattern, time * 1000);
        };
        
        return {
            play: () => {
                if (!isPlaying && !this.muted) {
                    isPlaying = true;
                    playMusicPattern();
                }
            },
            stop: () => {
                isPlaying = false;
                nodes.forEach(({ oscillator, gainNode }) => {
                    gainNode.gain.cancelScheduledValues(ctx.currentTime);
                    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                    setTimeout(() => oscillator.stop(), 100);
                });
                nodes = [];
            },
            pause: () => {
                isPlaying = false;
            },
            resume: () => {
                if (!this.muted) {
                    isPlaying = true;
                    playMusicPattern();
                }
            }
        };
    }
    
    // Load real sound files if available
    loadRealSounds(soundDefinitions) {
        // Check if audio files directory exists
        fetch('assets/sounds/music.mp3')
            .then(response => {
                if (response.ok) {
                    // Load background music
                    this.loadBackgroundMusic('assets/sounds/music.mp3');
                    
                    // Load sound effects
                    for (const [name, definition] of Object.entries(soundDefinitions)) {
                        this.loadSound(name, definition.url, definition.volume);
                    }
                } else {
                    console.log('Using placeholder sounds - sound files not found');
                }
            })
            .catch(error => {
                console.log('Using placeholder sounds - error loading sounds:', error);
            });
    }
    
    // Load a single sound effect
    loadSound(name, url, volume) {
        const audio = new Audio();
        audio.src = url;
        audio.volume = volume;
        
        this.sounds[name] = {
            play: () => {
                if (this.muted) return;
                
                // Clone the audio to allow overlapping sounds
                const sound = audio.cloneNode();
                sound.volume = volume;
                sound.play().catch(e => console.log('Error playing sound:', e));
            }
        };
    }
    
    // Load background music
    loadBackgroundMusic(url) {
        const audio = new Audio();
        audio.src = url;
        audio.loop = true;
        audio.volume = 0.3;
        
        let isPlaying = false;
        
        this.bgMusic = {
            play: () => {
                if (!isPlaying && !this.muted) {
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log('Error playing music:', e));
                    isPlaying = true;
                }
            },
            stop: () => {
                audio.pause();
                audio.currentTime = 0;
                isPlaying = false;
            },
            pause: () => {
                audio.pause();
                isPlaying = false;
            },
            resume: () => {
                if (!this.muted) {
                    audio.play().catch(e => console.log('Error resuming music:', e));
                    isPlaying = true;
                }
            }
        };
    }
    
    // Play a sound
    play(name) {
        if (this.sounds[name]) {
            this.sounds[name].play();
        }
    }
    
    // Start background music
    startMusic() {
        if (this.bgMusic) {
            this.bgMusic.play();
        }
    }
    
    // Stop background music
    stopMusic() {
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
    }
    
    // Pause background music
    pauseMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    }
    
    // Resume background music
    resumeMusic() {
        if (this.bgMusic) {
            this.bgMusic.resume();
        }
    }
    
    // Toggle mute state
    toggleMute() {
        this.muted = !this.muted;
        
        const muteButton = document.getElementById('mute-button');
        muteButton.textContent = this.muted ? '🔇' : '🔊';
        
        if (this.muted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
        
        // Save mute preference to localStorage
        saveToLocalStorage('tetrisCrush_muted', this.muted);
    }
}

// Create and export a single instance
const audioManager = new AudioManager();