// Enhanced CONFIG for Energy as Fuel System - V2.0 FUEL UPDATE
const CONFIG = {
    // Game settings
    GAME: {
        CANVAS_WIDTH: 800,
        CANVAS_HEIGHT: 600,
        TARGET_FPS: 60,
        UPDATE_INTERVAL: 16,
    },

    // Planet settings - ENERGY FUEL SYSTEM
    PLANETS: {
        COUNT: 8,
        MIN_CAPACITY: 20,
        MAX_CAPACITY: 60,
        MIN_DISTANCE: 120,
        PRODUCTION_BASE: 0.5,      // FREE ship regeneration
        PRODUCTION_MULTIPLIER: 0.2,
        CONQUEST_TIME: 2000,
        
        // ENERGY FUEL: Better starting resources
        INITIAL_RESOURCES: {
            metal: { min: 50, max: 100 },   // Less starting metal (construction only)
            energy: { min: 60, max: 120 }   // More starting energy (fuel)
        },
        
        // ENERGY FUEL: Resource generation rebalanced
        BASE_METAL_PRODUCTION: 0.3,  // 18 metal/min per planet (construction only)
        BASE_ENERGY_PRODUCTION: 0.15, // 9 energy/min per planet (fuel)
        MAX_RESOURCE_STORAGE: 300,   // Higher energy storage needed
        
        // Larger planet capacities for more strategic play
        CAPACITIES: [20, 25, 30, 40, 50, 60, 70],
        
        // FREE ship regeneration (unchanged)
        SHIP_PRODUCTION_RATE: 0.5,   // 1 ship every 2 seconds (FREE)
    },

    // Fleet settings
    FLEET: {
        SPEED: 80,
        MIN_SEND: 1,
    },

    // AI settings
    AI: {
        DECISION_INTERVAL: 3000,  // Slightly slower for energy management
        AGGRESSION: 0.7,          // Reduced due to energy constraints
        MIN_ATTACK_FORCE: 2,
    },

    // Visual settings
    VISUAL: {
        PLANET_MIN_RADIUS: 15,
        PLANET_MAX_RADIUS: 40,
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

    // ENERGY FUEL SYSTEM: New ship movement costs
    SHIP_COST: {
        metal: 0,   // FREE to move ships (they regenerate free)
        energy: {
            base: 1.5,              // Base energy cost per ship
            distanceMultiplier: 0.005, // Additional cost per pixel distance
            // Formula: cost = (base * ships) + (distance * ships * distanceMultiplier)
        }
    },

    // ENERGY FUEL: Updated resource system
    RESOURCES: {
        METAL: {
            generationBase: 1.0,      // Reduced: only for buildings
            shipCost: 0,              // No metal cost for movement
            storageMultiplier: 3.0    // Less storage needed
        },
        ENERGY: {
            generationBase: 1.5,      // Increased: critical for movement
            shipCost: 1.5,            // Base energy cost per ship
            storageMultiplier: 4.0    // More storage for energy
        }
    },

    // Building system (Action 02) - ENERGY FUEL COMPATIBLE
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
    },

    // ENERGY FUEL SYSTEM: New utility functions
    FUEL: {
        // Calculate energy cost for ship movement
        calculateMovementCost(ships, distance) {
            const baseCost = this.SHIP_COST.energy.base * ships;
            const distanceCost = distance * ships * this.SHIP_COST.energy.distanceMultiplier;
            return Math.ceil(baseCost + distanceCost);
        },
        
        // Check if player/AI can afford movement
        canAffordMovement(ships, distance, availableEnergy) {
            const cost = this.calculateMovementCost(ships, distance);
            return availableEnergy >= cost;
        },
        
        // Get movement cost info for UI
        getMovementCostInfo(ships, distance) {
            const cost = this.calculateMovementCost(ships, distance);
            const baseCost = this.SHIP_COST.energy.base * ships;
            const distanceCost = cost - baseCost;
            
            return {
                total: cost,
                base: Math.ceil(baseCost),
                distance: Math.ceil(distanceCost),
                perShip: (cost / ships).toFixed(1)
            };
        }
    }
};

// Make FUEL functions available at CONFIG level
CONFIG.calculateMovementCost = function(ships, distance) {
    const baseCost = this.SHIP_COST.energy.base * ships;
    const distanceCost = distance * ships * this.SHIP_COST.energy.distanceMultiplier;
    return Math.ceil(baseCost + distanceCost);
};

CONFIG.canAffordMovement = function(ships, distance, availableEnergy) {
    const cost = this.calculateMovementCost(ships, distance);
    return availableEnergy >= cost;
};

CONFIG.getMovementCostInfo = function(ships, distance) {
    const cost = this.calculateMovementCost(ships, distance);
    const baseCost = this.SHIP_COST.energy.base * ships;
    const distanceCost = cost - baseCost;
    
    return {
        total: cost,
        base: Math.ceil(baseCost),
        distance: Math.ceil(distanceCost),
        perShip: (cost / ships).toFixed(1)
    };
};