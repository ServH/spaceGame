// Balance Configuration - Energy Fuel System
const BalanceConfig = {
    appliedSettings: false,
    
    // Core balance settings for Energy Fuel System
    BASE: {
        START_METAL: 75,
        START_ENERGY: 90,
        START_SHIPS: 15,
        
        // Generation rates (per minute)
        METAL_GENERATION: 1.0,
        ENERGY_GENERATION: 1.5,
        
        // Energy costs for movement
        ENERGY_BASE_COST: 1.5,        // per ship
        ENERGY_DISTANCE_COST: 0.005,  // per ship per pixel
        
        // Building costs and effects
        RESEARCH_LAB_COST: { metal: 40, energy: 15 },
        RESEARCH_LAB_ENERGY_BONUS: 6.0,  // +6 energy/min
        
        MINING_COMPLEX_COST: { metal: 80, energy: 0 },
        MINING_COMPLEX_METAL_BONUS: 2.0, // 2x metal generation
        
        SHIPYARD_COST: { metal: 60, energy: 0 },
        SHIPYARD_SPEED_BONUS: 1.5 // 1.5x ship production
    },
    
    // Victory conditions
    VICTORY: {
        PLANET_CONTROL: 0.75,    // Control 75% of planets
        SHIP_DOMINANCE: 2.0,     // Have 2x more ships than opponent
        TIME_LIMIT: 900,         // 15 minutes max game time
        ELIMINATION: true        // Win by eliminating opponent
    },
    
    // Difficulty scaling
    DIFFICULTY: {
        AI_BONUS_SHIPS: 0,       // No bonus ships for AI
        AI_BONUS_PRODUCTION: 0,  // No production bonus
        AI_BONUS_ENERGY: 0,      // No energy bonus
        PLAYER_HANDICAP: 1.0     // No handicap
    },
    
    init() {
        if (this.appliedSettings) return;
        
        // Apply settings to CONFIG
        if (typeof CONFIG !== 'undefined') {
            CONFIG.RESOURCES.STARTING_METAL = this.BASE.START_METAL;
            CONFIG.RESOURCES.STARTING_ENERGY = this.BASE.START_ENERGY;
            CONFIG.PLANETS.BASE_SHIPS = this.BASE.START_SHIPS;
            CONFIG.RESOURCES.BASE_GENERATION.metal = this.BASE.METAL_GENERATION;
            CONFIG.RESOURCES.BASE_GENERATION.energy = this.BASE.ENERGY_GENERATION;
            CONFIG.SHIP_COST.energy.base = this.BASE.ENERGY_BASE_COST;
            CONFIG.SHIP_COST.energy.distanceMultiplier = this.BASE.ENERGY_DISTANCE_COST;
        }
        
        this.appliedSettings = true;
        console.log('⚖️ Balance initialized for Energy Fuel System:', this.BASE);
    },
    
    // Check victory conditions
    checkVictoryConditions(playerPlanets, aiPlanets, totalPlanets, playerShips, aiShips) {
        const planetControlThreshold = Math.ceil(totalPlanets * this.VICTORY.PLANET_CONTROL);
        
        // Planet control victory
        if (playerPlanets >= planetControlThreshold) {
            return { winner: 'player', condition: 'planet control' };
        }
        if (aiPlanets >= planetControlThreshold) {
            return { winner: 'ai', condition: 'planet control' };
        }
        
        // Elimination victory
        if (this.VICTORY.ELIMINATION) {
            if (aiPlanets === 0) {
                return { winner: 'player', condition: 'elimination' };
            }
            if (playerPlanets === 0) {
                return { winner: 'ai', condition: 'elimination' };
            }
        }
        
        // Ship dominance (if ship counts are provided)
        if (playerShips > 0 && aiShips > 0) {
            if (playerShips >= aiShips * this.VICTORY.SHIP_DOMINANCE) {
                return { winner: 'player', condition: 'ship dominance' };
            }
            if (aiShips >= playerShips * this.VICTORY.SHIP_DOMINANCE) {
                return { winner: 'ai', condition: 'ship dominance' };
            }
        }
        
        return null; // No victory yet
    },
    
    // Get building cost
    getBuildingCost(buildingId) {
        switch (buildingId) {
            case 'research_lab':
                return this.BASE.RESEARCH_LAB_COST;
            case 'mining_complex':
                return this.BASE.MINING_COMPLEX_COST;
            case 'shipyard':
                return this.BASE.SHIPYARD_COST;
            default:
                return { metal: 0, energy: 0 };
        }
    },
    
    // Get building effect
    getBuildingEffect(buildingId) {
        switch (buildingId) {
            case 'research_lab':
                return { energyGeneration: this.BASE.RESEARCH_LAB_ENERGY_BONUS };
            case 'mining_complex':
                return { metalGeneration: this.BASE.MINING_COMPLEX_METAL_BONUS };
            case 'shipyard':
                return { shipProductionRate: this.BASE.SHIPYARD_SPEED_BONUS };
            default:
                return {};
        }
    },
    
    // Calculate energy cost for movement
    calculateEnergyCost(ships, distance) {
        const baseCost = ships * this.BASE.ENERGY_BASE_COST;
        const distanceCost = distance * ships * this.BASE.ENERGY_DISTANCE_COST;
        return Math.ceil(baseCost + distanceCost);
    },
    
    // Adjust difficulty
    setDifficulty(level) {
        switch (level) {
            case 'easy':
                this.DIFFICULTY.AI_BONUS_SHIPS = -2;
                this.DIFFICULTY.AI_BONUS_PRODUCTION = -0.2;
                this.DIFFICULTY.PLAYER_HANDICAP = 1.2;
                break;
            case 'normal':
                this.DIFFICULTY.AI_BONUS_SHIPS = 0;
                this.DIFFICULTY.AI_BONUS_PRODUCTION = 0;
                this.DIFFICULTY.PLAYER_HANDICAP = 1.0;
                break;
            case 'hard':
                this.DIFFICULTY.AI_BONUS_SHIPS = 3;
                this.DIFFICULTY.AI_BONUS_PRODUCTION = 0.3;
                this.DIFFICULTY.PLAYER_HANDICAP = 0.8;
                break;
        }
        console.log(`🎯 Difficulty set to ${level}:`, this.DIFFICULTY);
    },
    
    // Debug: Show current balance
    debugBalance() {
        console.table({
            'Starting Metal': this.BASE.START_METAL,
            'Starting Energy': this.BASE.START_ENERGY,
            'Starting Ships': this.BASE.START_SHIPS,
            'Metal Generation': this.BASE.METAL_GENERATION + '/min',
            'Energy Generation': this.BASE.ENERGY_GENERATION + '/min',
            'Energy Base Cost': this.BASE.ENERGY_BASE_COST + '/ship',
            'Energy Distance Cost': this.BASE.ENERGY_DISTANCE_COST + '/ship/pixel'
        });
    }
};

// Make available globally
window.BalanceConfig = BalanceConfig;