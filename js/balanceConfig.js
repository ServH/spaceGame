// Balance Config - V1.4 FIXED - Only total conquest victory for classic mode
const BalanceConfig = {
    // Base values for classic gameplay
    BASE: {
        START_SHIPS: 15,  // Increased from 10
        PRODUCTION_BASE: 0.5,
        PRODUCTION_MULTIPLIER: 0.2,
        FLEET_SPEED: 80,
        CONQUEST_TIME: 2000,
        AI_DECISION_INTERVAL: 2500,
        CAPACITY_MULTIPLIER: 1.0,
        // Testing optimization - 3x faster metal for gameplay testing
        TESTING_MODE: true
    },

    // Classic mode configuration - ONLY CONQUEST VICTORY
    CLASSIC: {
        name: 'Clásico Evolucionado',
        settings: {
            startShips: 15,  // Increased
            capacityMultiplier: 1.0,
            minShipsToSend: 1,
            productionBase: 0.5,
            productionMultiplier: 0.2,
            fleetSpeed: 80,
            conquestTime: 2000,
            aiDecisionInterval: 2500
        },
        victory: {
            condition: 'conquest_only',  // ONLY conquest victory
            totalControlRequired: true   // Must control ALL planets
        }
    },

    // Applied settings (initialized with classic defaults)
    appliedSettings: null,

    // Initialize balance for classic mode
    init() {
        this.appliedSettings = {
            startShips: this.CLASSIC.settings.startShips,
            productionBase: this.CLASSIC.settings.productionBase,
            productionMultiplier: this.CLASSIC.settings.productionMultiplier,
            fleetSpeed: this.CLASSIC.settings.fleetSpeed,
            conquestTime: this.CLASSIC.settings.conquestTime,
            aiDecisionInterval: this.CLASSIC.settings.aiDecisionInterval,
            capacityMultiplier: this.CLASSIC.settings.capacityMultiplier,
            minShipsToSend: this.CLASSIC.settings.minShipsToSend,
            victory: this.CLASSIC.victory,
            testingMode: this.BASE.TESTING_MODE
        };

        // Apply to CONFIG
        CONFIG.PLANETS.PRODUCTION_BASE = this.appliedSettings.productionBase;
        CONFIG.PLANETS.PRODUCTION_MULTIPLIER = this.appliedSettings.productionMultiplier;
        CONFIG.FLEET.SPEED = this.appliedSettings.fleetSpeed;
        CONFIG.PLANETS.CONQUEST_TIME = this.appliedSettings.conquestTime;
        CONFIG.AI.DECISION_INTERVAL = this.appliedSettings.aiDecisionInterval;

        console.log('⚖️ Balance initialized for CONQUEST ONLY mode:', {
            startShips: this.appliedSettings.startShips,
            victoryCondition: 'CONQUEST ONLY - No economic victory',
            testingMode: this.BASE.TESTING_MODE ? 'ENABLED' : 'DISABLED'
        });
    },

    // Get current settings
    getCurrentSettings() {
        return this.appliedSettings;
    },

    // FIXED: Check victory conditions - ONLY CONQUEST
    checkVictoryConditions(playerPlanets, aiPlanets, totalPlanets, playerShips, aiShips) {
        // ONLY conquest victory allowed in classic mode
        if (playerPlanets === totalPlanets) {
            return { winner: 'player', condition: 'total_conquest' };
        }
        if (aiPlanets === totalPlanets) {
            return { winner: 'ai', condition: 'total_conquest' };
        }
        
        // NO OTHER VICTORY CONDITIONS
        return null; // Game continues until total conquest
    },

    // Debug: Show current settings
    debugCurrentSettings() {
        console.table({
            'Mode': 'Classic Evolution - CONQUEST ONLY',
            'Start Ships': this.appliedSettings.startShips,
            'Production Base': this.appliedSettings.productionBase,
            'Fleet Speed': this.appliedSettings.fleetSpeed,
            'Conquest Time': this.appliedSettings.conquestTime + 'ms',
            'Victory Condition': 'TOTAL CONQUEST ONLY',
            'Testing Mode': this.BASE.TESTING_MODE ? 'ON' : 'OFF'
        });
    }
};