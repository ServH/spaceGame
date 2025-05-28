// Game Balance - V1.3 Fast-paced Galcon-style configuration
const BALANCE = {
    // Fast game settings for 1-2 minute matches
    GAME_SPEED: {
        PRODUCTION_MULTIPLIER: 3.0,  // 3x faster ship production
        FLEET_SPEED_MULTIPLIER: 2.5, // 2.5x faster fleet movement
        CONQUEST_SPEED_MULTIPLIER: 2.0, // 2x faster conquest
        AI_DECISION_MULTIPLIER: 0.7, // 30% faster AI decisions
    },

    // Planet scaling for quick expansion
    PLANET_BALANCE: {
        START_SHIPS: 15,           // More initial ships
        CAPACITY_MULTIPLIER: 0.8,  // Slightly smaller capacities
        MIN_SHIPS_TO_SEND: 2,      // Minimum fleet size
    },

    // Quick victory conditions
    VICTORY: {
        EARLY_ADVANTAGE_THRESHOLD: 0.75, // 75% planets = instant win
        ECONOMIC_VICTORY_RATIO: 3.0,      // 3:1 ship ratio = economic win
        TIME_LIMIT: 120000, // 2 minute time limit (ms)
    },

    // Apply fast-paced settings to CONFIG
    applyFastSettings() {
        // Production speed
        CONFIG.PLANETS.PRODUCTION_BASE *= this.GAME_SPEED.PRODUCTION_MULTIPLIER;
        CONFIG.PLANETS.PRODUCTION_MULTIPLIER *= this.GAME_SPEED.PRODUCTION_MULTIPLIER;
        
        // Fleet speed
        CONFIG.FLEET.SPEED *= this.GAME_SPEED.FLEET_SPEED_MULTIPLIER;
        
        // Conquest speed
        CONFIG.PLANETS.CONQUEST_TIME /= this.GAME_SPEED.CONQUEST_SPEED_MULTIPLIER;
        
        // AI speed
        CONFIG.AI.DECISION_INTERVAL *= this.GAME_SPEED.AI_DECISION_MULTIPLIER;
        
        console.log('⚡ Fast-paced mode activated - 1-2 minute games');
    }
};