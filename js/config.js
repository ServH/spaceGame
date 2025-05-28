// Game configuration - Updated for full screen
const CONFIG = {
    // Game settings - Dynamic canvas size
    GAME: {
        CANVAS_WIDTH: window.innerWidth,
        CANVAS_HEIGHT: window.innerHeight,
        TARGET_FPS: 60,
        UPDATE_INTERVAL: 16,
    },

    // Planet settings
    PLANETS: {
        COUNT: 7,
        CAPACITIES: [8, 10, 12, 15, 18, 20, 25],
        MIN_DISTANCE: Math.min(window.innerWidth, window.innerHeight) * 0.15, // 15% of screen
        PRODUCTION_BASE: 0.8,
        PRODUCTION_MULTIPLIER: 0.15,
        CONQUEST_TIME: 2000,
    },

    // Fleet settings
    FLEET: {
        SPEED: Math.min(window.innerWidth, window.innerHeight) * 0.15, // Scale with screen
        MIN_SEND: 1,
    },

    // AI settings
    AI: {
        DECISION_INTERVAL: 3000,
        AGGRESSION: 0.7,
        MIN_ATTACK_FORCE: 3,
    },

    // Visual settings - Scale with screen size
    VISUAL: {
        PLANET_MIN_RADIUS: Math.min(window.innerWidth, window.innerHeight) * 0.025, // 2.5% of screen
        PLANET_MAX_RADIUS: Math.min(window.innerWidth, window.innerHeight) * 0.045, // 4.5% of screen
        SHIP_TRAIL_LENGTH: 8,
        HOVER_GLOW: '#ffff00',
    },

    // Colors
    COLORS: {
        PLAYER: '#00ff88',
        AI: '#ff4444', 
        NEUTRAL: '#888888',
        BACKGROUND: '#0a0a1a',
        UI_TEXT: '#ffffff',
    },

    // Keyboard assignments
    KEYBOARD: {
        AVAILABLE_KEYS: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Q', 'W', 'E', 'R', 'T', 'Y'],
        assignments: {},
    },

    // Update dimensions on window resize
    updateDimensions() {
        this.GAME.CANVAS_WIDTH = window.innerWidth;
        this.GAME.CANVAS_HEIGHT = window.innerHeight;
        this.PLANETS.MIN_DISTANCE = Math.min(window.innerWidth, window.innerHeight) * 0.15;
        this.FLEET.SPEED = Math.min(window.innerWidth, window.innerHeight) * 0.15;
        this.VISUAL.PLANET_MIN_RADIUS = Math.min(window.innerWidth, window.innerHeight) * 0.025;
        this.VISUAL.PLANET_MAX_RADIUS = Math.min(window.innerWidth, window.innerHeight) * 0.045;
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    CONFIG.updateDimensions();
    if (GameEngine && GameEngine.canvas) {
        GameEngine.setupCanvas();
    }
});