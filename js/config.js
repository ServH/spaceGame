// Game configuration - V1.3 with defaults
const CONFIG = {
    // Game settings
    GAME: {
        CANVAS_WIDTH: 800,
        CANVAS_HEIGHT: 600,
        TARGET_FPS: 60,
        UPDATE_INTERVAL: 16,
    },

    // Planet settings
    PLANETS: {
        COUNT: 8,
        MIN_CAPACITY: 8,
        MAX_CAPACITY: 25,
        MIN_DISTANCE: 120,
        PRODUCTION_BASE: 0.8,
        PRODUCTION_MULTIPLIER: 0.15,
        CONQUEST_TIME: 2000,
    },

    // Fleet settings
    FLEET: {
        SPEED: 80,
        MIN_SEND: 1,
    },

    // AI settings
    AI: {
        DECISION_INTERVAL: 3000,
        AGGRESSION: 0.7,
        MIN_ATTACK_FORCE: 3,
    },

    // Visual settings
    VISUAL: {
        PLANET_MIN_RADIUS: 15,
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
        AVAILABLE_KEYS: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k'],
        assignments: {},
    }
};