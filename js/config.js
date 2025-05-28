// Game configuration - Central config for easy tweaking
const CONFIG = {
    // Game settings
    GAME: {
        CANVAS_WIDTH: 800,
        CANVAS_HEIGHT: 600,
        TARGET_FPS: 60,
        UPDATE_INTERVAL: 16, // ~60fps
    },

    // Planet settings
    PLANETS: {
        COUNT: 7, // Total planets (2 controlled + 5 neutral)
        CAPACITIES: [8, 10, 12, 15, 18, 20, 25], // Ship capacities
        MIN_DISTANCE: 120, // Min distance between planets
        PRODUCTION_BASE: 0.8, // Ships per second base rate
        PRODUCTION_MULTIPLIER: 0.15, // Multiplier based on planet size
        CONQUEST_TIME: 2000, // Time to conquer neutral planet (ms)
    },

    // Fleet settings
    FLEET: {
        SPEED: 80, // Pixels per second
        MIN_SEND: 1, // Minimum ships to send
    },

    // AI settings
    AI: {
        DECISION_INTERVAL: 3000, // AI decides every 3 seconds
        AGGRESSION: 0.7, // How aggressive (0-1)
        MIN_ATTACK_FORCE: 3, // Min ships to attack
    },

    // Visual settings
    VISUAL: {
        PLANET_MIN_RADIUS: 20,
        PLANET_MAX_RADIUS: 35,
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
        assignments: {}, // Will be populated at game start
    }
};
