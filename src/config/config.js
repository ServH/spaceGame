// Game Configuration - Energy as Fuel System V2.4
const CONFIG = {
    // Canvas dimensions
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600
    },
    
    // Planet configuration
    PLANETS: {
        COUNT: 8,
        RADIUS_MIN: 20,
        RADIUS_MAX: 35,
        MIN_DISTANCE: 80,
        BASE_CAPACITY: 50,
        BASE_SHIPS: 15,
        SHIP_PRODUCTION_RATE: 0.8, // ships per second
        BASE_METAL_RATE: 1.0, // per minute
        BASE_AI_METAL: 100,
        BASE_AI_ENERGY: 50
    },
    
    // Fleet configuration
    FLEETS: {
        SPEED: 60 // pixels per second
    },
    
    // ENERGY AS FUEL SYSTEM
    SHIP_COST: {
        energy: {
            base: 1.5,              // Base energy cost per ship
            distanceMultiplier: 0.005 // Additional cost per pixel of distance
        }
    },
    
    // Resource system
    RESOURCES: {
        STARTING_METAL: 75,
        STARTING_ENERGY: 90,
        BASE_GENERATION: {
            metal: 1.0,    // per minute
            energy: 1.5    // per minute
        }
    },
    
    // Building system
    BUILDINGS: {
        MAX_PER_PLANET: 3
    },
    
    // Keyboard assignments
    KEYBOARD: {
        assignments: {}
    },
    
    // Calculate movement cost using energy fuel formula
    calculateMovementCost(ships, distance) {
        const baseCost = ships * this.SHIP_COST.energy.base;
        const distanceCost = distance * ships * this.SHIP_COST.energy.distanceMultiplier;
        return Math.ceil(baseCost + distanceCost);
    },
    
    // Get detailed cost breakdown
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
    
    // Initialize keyboard assignments for planets
    initKeyboardAssignments(planets) {
        this.KEYBOARD.assignments = {};
        
        const keys = ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];
        
        planets.forEach((planet, index) => {
            if (index < keys.length) {
                const key = keys[index];
                this.KEYBOARD.assignments[key] = planet.id;
                planet.assignedKey = key;
            }
        });
        
        console.log('⌨️ Keyboard assignments:', this.KEYBOARD.assignments);
    },
    
    // Get planet by assigned key
    getPlanetByKey(key) {
        const planetId = this.KEYBOARD.assignments[key.toLowerCase()];
        if (typeof GameEngine !== 'undefined' && GameEngine.getPlanetById) {
            return GameEngine.getPlanetById(planetId);
        }
        return null;
    }
};

// Export for global use
window.CONFIG = CONFIG;

console.log('⚙️ CONFIG loaded - Energy as Fuel System V2.4');