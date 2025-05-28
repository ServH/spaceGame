// Game configuration - V1.3 Enhanced with Balance System
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

    // V1.3: Balance multipliers (applied by game modes)
    BALANCE: {
        PRODUCTION_MULTIPLIER: 1.0,
        FLEET_SPEED_MULTIPLIER: 1.0,
        CONQUEST_SPEED_MULTIPLIER: 1.0,
        INITIAL_SHIPS: 10
    },

    // V1.3: Get effective values with balance multipliers
    getEffectiveProductionBase() {
        return this.PLANETS.PRODUCTION_BASE * this.BALANCE.PRODUCTION_MULTIPLIER;
    },

    getEffectiveFleetSpeed() {
        return this.FLEET.SPEED * this.BALANCE.FLEET_SPEED_MULTIPLIER;
    },

    getEffectiveConquestTime() {
        return this.PLANETS.CONQUEST_TIME / this.BALANCE.CONQUEST_SPEED_MULTIPLIER;
    },

    getInitialShips() {
        return this.BALANCE.INITIAL_SHIPS;
    },

    // Update dimensions on window resize
    updateDimensions() {
        this.GAME.CANVAS_WIDTH = window.innerWidth;
        this.GAME.CANVAS_HEIGHT = window.innerHeight;
        this.PLANETS.MIN_DISTANCE = Math.min(window.innerWidth, window.innerHeight) * 0.15;
        this.FLEET.SPEED = Math.min(window.innerWidth, window.innerHeight) * 0.15;
        this.VISUAL.PLANET_MIN_RADIUS = Math.min(window.innerWidth, window.innerHeight) * 0.025;
        this.VISUAL.PLANET_MAX_RADIUS = Math.min(window.innerWidth, window.innerHeight) * 0.045;
    },

    // V1.3: Apply balance settings from game mode
    applyBalance(balanceSettings) {
        if (!balanceSettings) return;
        
        // Store original values if not already stored
        if (!this._originalValues) {
            this._originalValues = {
                PRODUCTION_BASE: this.PLANETS.PRODUCTION_BASE,
                FLEET_SPEED: this.FLEET.SPEED,
                CONQUEST_TIME: this.PLANETS.CONQUEST_TIME
            };
        }

        // Apply multipliers
        this.BALANCE = { ...this.BALANCE, ...balanceSettings };
        
        // Update actual config values
        this.PLANETS.PRODUCTION_BASE = this._originalValues.PRODUCTION_BASE * this.BALANCE.PRODUCTION_MULTIPLIER;
        this.FLEET.SPEED = this._originalValues.FLEET_SPEED * this.BALANCE.FLEET_SPEED_MULTIPLIER;
        this.PLANETS.CONQUEST_TIME = this._originalValues.CONQUEST_TIME / this.BALANCE.CONQUEST_SPEED_MULTIPLIER;

        console.log('⚙️ Applied balance settings:', this.BALANCE);
    },

    // V1.3: Reset to original values
    resetBalance() {
        if (this._originalValues) {
            this.PLANETS.PRODUCTION_BASE = this._originalValues.PRODUCTION_BASE;
            this.FLEET.SPEED = this._originalValues.FLEET_SPEED;
            this.PLANETS.CONQUEST_TIME = this._originalValues.CONQUEST_TIME;
        }
        
        this.BALANCE = {
            PRODUCTION_MULTIPLIER: 1.0,
            FLEET_SPEED_MULTIPLIER: 1.0,
            CONQUEST_SPEED_MULTIPLIER: 1.0,
            INITIAL_SHIPS: 10
        };
        
        console.log('🔄 Reset balance to defaults');
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    CONFIG.updateDimensions();
    if (typeof GameEngine !== 'undefined' && GameEngine.canvas) {
        GameEngine.setupCanvas();
    }
});