// Game Configuration - Based on working branch structure
const CONFIG = {
    // Game settings
    GAME: {
        CANVAS_WIDTH: 800,
        CANVAS_HEIGHT: 600,
        TARGET_FPS: 60,
        UPDATE_INTERVAL: 16
    },

    // Planet settings
    PLANETS: {
        COUNT: 8,
        MIN_CAPACITY: 20,
        MAX_CAPACITY: 60,
        MIN_DISTANCE: 120,
        PRODUCTION_BASE: 0.5,
        PRODUCTION_MULTIPLIER: 0.2,
        CONQUEST_TIME: 2000,
        CAPACITIES: [20, 25, 30, 40, 50, 60, 70],
        SHIP_PRODUCTION_RATE: 0.5,
        
        // For compatibility with new structure
        RADIUS_MIN: 15,
        RADIUS_MAX: 40,
        BASE_CAPACITY: 50,
        BASE_SHIPS: 15,
        BASE_AI_METAL: 120
    },

    // Fleet settings
    FLEET: {
        SPEED: 80,
        MIN_SEND: 1
    },
    
    // For compatibility
    FLEETS: {
        SPEED: 80
    },

    // AI settings
    AI: {
        DECISION_INTERVAL: 3000,
        AGGRESSION: 0.7,
        MIN_ATTACK_FORCE: 2
    },

    // Visual settings
    VISUAL: {
        PLANET_MIN_RADIUS: 15,
        PLANET_MAX_RADIUS: 40,
        SHIP_TRAIL_LENGTH: 8,
        HOVER_GLOW: '#ffff00'
    },

    // Colors
    COLORS: {
        PLAYER: '#00ff88',
        AI: '#ff4444', 
        NEUTRAL: '#888888',
        BACKGROUND: '#0a0a1a',
        UI_TEXT: '#ffffff'
    },

    // Energy system
    SHIP_COST: {
        energy: {
            base: 1.5,
            distanceMultiplier: 0.005
        }
    },

    // Resources
    RESOURCES: {
        STARTING_METAL: 75,
        STARTING_ENERGY: 90,
        BASE_GENERATION: {
            metal: 1.0,
            energy: 1.5
        }
    },

    // Canvas dimensions for compatibility
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600
    },

    // Buildings
    BUILDINGS: {
        MAX_PER_PLANET: 3
    },

    // Keyboard
    KEYBOARD: {
        AVAILABLE_KEYS: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k'],
        assignments: {}
    },

    // Energy cost calculation
    calculateMovementCost(ships, distance) {
        const baseCost = ships * this.SHIP_COST.energy.base;
        const distanceCost = distance * ships * this.SHIP_COST.energy.distanceMultiplier;
        return Math.ceil(baseCost + distanceCost);
    },

    getMovementCostInfo(ships, distance) {
        const baseCost = ships * this.SHIP_COST.energy.base;
        const distanceCost = distance * ships * this.SHIP_COST.energy.distanceMultiplier;
        const total = Math.ceil(baseCost + distanceCost);
        
        return {
            ships,
            distance: Math.round(distance),
            baseCost: Math.round(baseCost * 10) / 10,
            distanceCost: Math.round(distanceCost * 10) / 10,
            total
        };
    },

    initKeyboardAssignments(planets) {
        this.KEYBOARD.assignments = {};
        
        const keys = ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];
        
        planets.forEach((planet, index) => {
            if (index < keys.length) {
                const key = keys[index];
                this.KEYBOARD.assignments[key] = planet.id;
                planet.assignedKey = key;
                planet.assignKey(key);
            }
        });
        
        console.log('⌨️ Keyboard assignments:', this.KEYBOARD.assignments);
    },

    getPlanetByKey(key) {
        const planetId = this.KEYBOARD.assignments[key.toLowerCase()];
        if (typeof GameEngine !== 'undefined' && GameEngine.getPlanetById) {
            return GameEngine.getPlanetById(planetId);
        }
        return null;
    }
};

window.CONFIG = CONFIG;
console.log('⚙️ CONFIG loaded - Energy as Fuel System V2.4');
