// Game configuration - V1.4 with Building System - BALANCED
const CONFIG = {
    // Game settings
    GAME: {
        CANVAS_WIDTH: 800,
        CANVAS_HEIGHT: 600,
        TARGET_FPS: 60,
        UPDATE_INTERVAL: 16,
    },

    // Planet settings - IMPROVED BALANCE
    PLANETS: {
        COUNT: 8,
        MIN_CAPACITY: 15,  // Increased from 8
        MAX_CAPACITY: 40,  // Increased from 25
        MIN_DISTANCE: 120,
        PRODUCTION_BASE: 0.5,      // Increased from 0.8 for faster ship production
        PRODUCTION_MULTIPLIER: 0.2, // Increased from 0.15
        CONQUEST_TIME: 2000,
        
        // BALANCED RESOURCES - Better starting conditions
        INITIAL_RESOURCES: {
            metal: { min: 80, max: 150 },  // Much better starting metal
            energy: { min: 40, max: 80 }
        },
        
        // IMPROVED PRODUCTION - More sustainable
        BASE_METAL_PRODUCTION: 0.4,  // 0.4 metal per second = 24/min
        BASE_ENERGY_PRODUCTION: 0.1, // 0.1 energy per second = 6/min
        MAX_RESOURCE_STORAGE: 250,   // Increased storage capacity
        
        // Better planet capacities for more action
        CAPACITIES: [15, 18, 22, 25, 30, 35, 40, 45]  // 2x the original values
    },

    // Fleet settings
    FLEET: {
        SPEED: 80,
        MIN_SEND: 1,
    },

    // AI settings
    AI: {
        DECISION_INTERVAL: 2500,  // Slightly faster decisions
        AGGRESSION: 0.8,          // More aggressive
        MIN_ATTACK_FORCE: 2,      // Lower threshold
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

    // CRITICAL FIX: Ship costs - MUCH CHEAPER
    SHIP_COST: {
        metal: 2,   // Reduced from 10 to 2 - much more affordable
        energy: 0
    },

    // Resource system - BALANCED for gameplay
    RESOURCES: {
        METAL: {
            generationBase: 1.5,      // Increased from 1.0
            shipCost: 2,              // Matches SHIP_COST
            storageMultiplier: 3.0    // Increased from 2.0
        },
        ENERGY: {
            generationBase: 1.0,      
            shipCost: 0,          
            storageMultiplier: 1.0    
        }
    },

    // Building system (Action 02)
    BUILDINGS: {
        MAX_PER_PLANET: 3,
        CONSTRUCTION_UPDATE_INTERVAL: 100, // ms
        REFUND_PERCENTAGE: 0.5, // 50% refund on cancellation
        
        // Building slot visual positions around planet
        SLOT_POSITIONS: [
            { angle: 0, distance: 45 },     // Right
            { angle: 120, distance: 45 },   // Bottom-left  
            { angle: 240, distance: 45 }    // Top-left
        ]
    },

    // Keyboard assignments
    KEYBOARD: {
        AVAILABLE_KEYS: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k'],
        assignments: {},
    }
};