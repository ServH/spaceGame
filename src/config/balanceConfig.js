// Balance Config - V2.5 CONSOLIDATED - Energy Fuel System + Classic Conquest
const BalanceConfig = {
    // Base values for energy fuel system
    BASE: {
        START_SHIPS: 15,
        START_METAL: 75,
        START_ENERGY: 90,
        PRODUCTION_BASE: 0.5,
        PRODUCTION_MULTIPLIER: 0.2,
        FLEET_SPEED: 80,
        CONQUEST_TIME: 2000,
        AI_DECISION_INTERVAL: 3000,
        CAPACITY_MULTIPLIER: 1.0
    },

    // Energy Fuel System - Current Implementation
    ENERGY_FUEL: {
        name: 'Energy as Fuel System',
        settings: {
            startShips: 15,
            startMetal: 75,
            startEnergy: 90,
            metalGeneration: 18,     // per minute per planet
            energyGeneration: 9,     // per minute per planet
            shipGeneration: 30,      // ships per minute (FREE)
            fleetEnergyFormula: '(1.5 × ships) + (distance × ships × 0.005)',
            researchLabBonus: 6,     // +6 energy/min per lab
            miningComplexMultiplier: 2.0,  // 2x metal production
            shipyardBonus: 1.5       // 1.5x ship production
        },
        victory: {
            condition: 'conquest_only',
            totalControlRequired: true
        }
    },

    // Fast-paced mode (from legacy balance.js)
    FAST_GAME: {
        PRODUCTION_MULTIPLIER: 3.0,
        FLEET_SPEED_MULTIPLIER: 2.5,
        CONQUEST_SPEED_MULTIPLIER: 2.0,
        AI_DECISION_MULTIPLIER: 0.7,
    },

    // Applied settings (initialized with energy fuel defaults)
    appliedSettings: null,

    // Initialize balance for energy fuel system
    init() {
        if (typeof CONFIG === 'undefined') {
            console.warn('⚠️ CONFIG not available yet, deferring BalanceConfig initialization...');
            setTimeout(() => this.init(), 100);
            return;
        }

        this.appliedSettings = {
            ...this.ENERGY_FUEL.settings,
            victory: this.ENERGY_FUEL.victory
        };

        // Apply to CONFIG safely
        if (CONFIG && CONFIG.PLANETS) {
            CONFIG.PLANETS.PRODUCTION_BASE = this.BASE.PRODUCTION_BASE;
            CONFIG.PLANETS.PRODUCTION_MULTIPLIER = this.BASE.PRODUCTION_MULTIPLIER;
            CONFIG.FLEET.SPEED = this.BASE.FLEET_SPEED;
            CONFIG.PLANETS.CONQUEST_TIME = this.BASE.CONQUEST_TIME;
            CONFIG.AI.DECISION_INTERVAL = this.BASE.AI_DECISION_INTERVAL;

            console.log('⚖️ Balance initialized for Energy Fuel System:', {
                startMetal: this.appliedSettings.startMetal,
                startEnergy: this.appliedSettings.startEnergy,
                victoryCondition: 'CONQUEST ONLY',
                energyFormula: this.appliedSettings.fleetEnergyFormula
            });
        } else {
            console.error('❌ CONFIG object structure not as expected');
        }
    },

    // Apply fast-paced settings (legacy function)
    applyFastSettings() {
        if (CONFIG) {
            CONFIG.PLANETS.PRODUCTION_BASE *= this.FAST_GAME.PRODUCTION_MULTIPLIER;
            CONFIG.PLANETS.PRODUCTION_MULTIPLIER *= this.FAST_GAME.PRODUCTION_MULTIPLIER;
            CONFIG.FLEET.SPEED *= this.FAST_GAME.FLEET_SPEED_MULTIPLIER;
            CONFIG.PLANETS.CONQUEST_TIME /= this.FAST_GAME.CONQUEST_SPEED_MULTIPLIER;
            CONFIG.AI.DECISION_INTERVAL *= this.FAST_GAME.AI_DECISION_MULTIPLIER;
            
            console.log('⚡ Fast-paced mode activated - 1-2 minute games');
        }
    },

    // Get current settings
    getCurrentSettings() {
        return this.appliedSettings;
    },

    // Check victory conditions - ONLY CONQUEST
    checkVictoryConditions(playerPlanets, aiPlanets, totalPlanets, playerShips, aiShips) {
        if (playerPlanets === totalPlanets) {
            return { winner: 'player', condition: 'total_conquest' };
        }
        if (aiPlanets === totalPlanets) {
            return { winner: 'ai', condition: 'total_conquest' };
        }
        return null; // Game continues until total conquest
    },

    // Debug: Show current settings
    debugCurrentSettings() {
        console.table({
            'Mode': 'Energy Fuel System - CONQUEST ONLY',
            'Start Metal': this.appliedSettings?.startMetal || 'Not initialized',
            'Start Energy': this.appliedSettings?.startEnergy || 'Not initialized',
            'Metal Generation': this.appliedSettings?.metalGeneration + '/min' || 'Not initialized',
            'Energy Generation': this.appliedSettings?.energyGeneration + '/min' || 'Not initialized',
            'Victory Condition': 'TOTAL CONQUEST ONLY',
            'Energy Formula': this.appliedSettings?.fleetEnergyFormula || 'Not initialized'
        });
    }
};

// Legacy BALANCE object for backward compatibility
const BALANCE = BalanceConfig;