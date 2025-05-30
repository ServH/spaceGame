// Game configuration - V1.4 OPCIÓN A GALCON - Ships regenerate FREE, sending costs metal
const CONFIG = {
    // Game settings
    GAME: {
        CANVAS_WIDTH: 800,
        CANVAS_HEIGHT: 600,
        TARGET_FPS: 60,
        UPDATE_INTERVAL: 16,
    },

    // Planet settings - OPCIÓN A GALCON BALANCE
    PLANETS: {
        COUNT: 8,
        MIN_CAPACITY: 20,  // Increased for larger planets
        MAX_CAPACITY: 60,  // Much larger planets for more action
        MIN_DISTANCE: 120,
        PRODUCTION_BASE: 0.5,      // Fast ship regeneration (FREE)
        PRODUCTION_MULTIPLIER: 0.2,
        CONQUEST_TIME: 2000,
        
        // OPCIÓN A: Better starting resources for immediate action
        INITIAL_RESOURCES: {
            metal: { min: 80, max: 150 },  // Much more starting metal
            energy: { min: 40, max: 80 }
        },
        
        // Metal production for SENDING ships (not creating them)
        BASE_METAL_PRODUCTION: 0.5,  // 30 metal/min per planet
        BASE_ENERGY_PRODUCTION: 0.1, // 6 energy/min per planet
        MAX_RESOURCE_STORAGE: 250,   // Higher storage for big armies
        
        // OPCIÓN A: Larger planet capacities for more action
        CAPACITIES: [20, 25, 30, 40, 50, 60, 70], // 2-3x larger than before
        
        // OPCIÓN A: Fast ship regeneration (FREE ships on planets)
        SHIP_PRODUCTION_RATE: 0.5,   // 1 ship every 2 seconds (FREE)
    },

    // Fleet settings
    FLEET: {
        SPEED: 80,
        MIN_SEND: 1,
    },

    // AI settings - More aggressive for faster gameplay
    AI: {
        DECISION_INTERVAL: 2000,  // Faster decisions
        AGGRESSION: 0.8,          // More aggressive
        MIN_ATTACK_FORCE: 2,      // Lower threshold
    },

    // Visual settings
    VISUAL: {
        PLANET_MIN_RADIUS: 15,
        PLANET_MAX_RADIUS: 40,    // Larger planets visually
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

    // OPCIÓN A: CHEAP metal cost for sending ships (ships regenerate FREE)
    SHIP_COST: {
        metal: 1,   // VERY CHEAP - only 1 metal per ship sent
        energy: 0
    },

    // Resource system - OPCIÓN A GALCON BALANCED
    RESOURCES: {
        METAL: {
            generationBase: 1.5,      // Good generation for ship sending
            shipCost: 1,              // CHEAP sending cost
            storageMultiplier: 4.0    // High storage for big fleets
        },
        ENERGY: {
            generationBase: 1.0,      
            shipCost: 0,          
            storageMultiplier: 2.0    
        }
    },

    // Building system (Action 02)
    BUILDINGS: {
        MAX_PER_PLANET: 3,
        CONSTRUCTION_UPDATE_INTERVAL: 100,
        REFUND_PERCENTAGE: 0.5,
        
        SLOT_POSITIONS: [
            { angle: 0, distance: 45 },
            { angle: 120, distance: 45 },
            { angle: 240, distance: 45 }
        ]
    },

    // Keyboard assignments
    KEYBOARD: {
        AVAILABLE_KEYS: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k'],
        assignments: {},
    }
};