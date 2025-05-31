// Game Configuration - Core Settings V2.4
const CONFIG = {
    // Core game dimensions and settings
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600,
        VIEWBOX: '0 0 800 600'
    },

    // Planet generation and behavior
    PLANETS: {
        COUNT: 8,
        MIN_DISTANCE: 80,
        RADIUS_MIN: 15,
        RADIUS_MAX: 35,
        PRODUCTION_BASE: 0.5,
        PRODUCTION_MULTIPLIER: 0.2,
        CONQUEST_TIME: 2000,
        CAPACITY_MULTIPLIER: 2.5
    },

    // Visual settings
    VISUAL: {
        PLANET_MIN_RADIUS: 15,
        PLANET_MAX_RADIUS: 35,
        HOVER_GLOW: '#ffffff'
    },

    // Fleet mechanics
    FLEET: {
        SPEED: 80,
        MIN_SHIPS: 1
    },

    // AI configuration
    AI: {
        DECISION_INTERVAL: 3000,
        AGGRESSION: 0.7,
        BUILDING_CHECK_INTERVAL: 8000
    },

    // Resource system - ENERGY AS FUEL
    RESOURCES: {
        STARTING_METAL: 75,
        STARTING_ENERGY: 90,
        METAL_GENERATION_BASE: 18, // per minute
        ENERGY_GENERATION_BASE: 9, // per minute
        SHIP_GENERATION_RATE: 30   // ships per minute (FREE)
    },

    // ENERGY AS FUEL - Movement cost calculation
    ENERGY_FUEL: {
        BASE_COST_PER_SHIP: 1.5,
        DISTANCE_MULTIPLIER: 0.005,
        // Formula: (1.5 × ships) + (distance × ships × 0.005)
    },

    // Calculate movement cost
    calculateMovementCost(ships, distance) {
        const baseCost = this.ENERGY_FUEL.BASE_COST_PER_SHIP * ships;
        const distanceCost = distance * ships * this.ENERGY_FUEL.DISTANCE_MULTIPLIER;
        return Math.ceil(baseCost + distanceCost);
    },

    // Get detailed cost breakdown
    getMovementCostInfo(ships, distance) {
        const baseCost = this.ENERGY_FUEL.BASE_COST_PER_SHIP * ships;
        const distanceCost = distance * ships * this.ENERGY_FUEL.DISTANCE_MULTIPLIER;
        const total = Math.ceil(baseCost + distanceCost);
        
        return {
            ships,
            distance: Math.round(distance),
            baseCost: Math.round(baseCost * 10) / 10,
            distanceCost: Math.round(distanceCost * 10) / 10,
            total
        };
    },

    // Colors and visual settings
    COLORS: {
        PLAYER: '#00ff88',
        AI: '#ff4444',
        NEUTRAL: '#888888',
        BACKGROUND: '#0a0a0a'
    },

    // Keyboard assignments for planets
    KEYBOARD: {
        assignments: {}
    },

    // Initialize keyboard assignments
    initKeyboardAssignments(planets) {
        const keys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
        
        this.KEYBOARD.assignments = {};
        
        planets.forEach((planet, index) => {
            if (index < keys.length) {
                const key = keys[index];
                this.KEYBOARD.assignments[key] = planet.id;
                planet.assignedKey = key;
            }
        });
        
        console.log('⌨️ Keyboard assignments initialized:', this.KEYBOARD.assignments);
    },

    // Debug utilities
    debug: {
        showConfig() {
            console.table({
                'Canvas Size': `${CONFIG.CANVAS.WIDTH}x${CONFIG.CANVAS.HEIGHT}`,
                'Planet Count': CONFIG.PLANETS.COUNT,
                'Fleet Speed': CONFIG.FLEET.SPEED,
                'AI Interval': CONFIG.AI.DECISION_INTERVAL + 'ms',
                'Starting Metal': CONFIG.RESOURCES.STARTING_METAL,
                'Starting Energy': CONFIG.RESOURCES.STARTING_ENERGY
            });
        },
        
        testEnergyCalculation() {
            console.log('🧪 Energy Cost Tests:');
            const tests = [
                { ships: 5, distance: 100 },
                { ships: 10, distance: 200 },
                { ships: 15, distance: 300 }
            ];
            
            tests.forEach(test => {
                const cost = CONFIG.getMovementCostInfo(test.ships, test.distance);
                console.log(`${test.ships} ships, ${test.distance}px:`, cost);
            });
        }
    }
};

// Make CONFIG available globally
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Log initialization
console.log('⚙️ CONFIG loaded - Energy as Fuel System V2.4');