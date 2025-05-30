// Balance Config - V1.4 Simplified for Classic Mode Only
const BalanceConfig = {
    // Base values for classic gameplay
    BASE: {
        START_SHIPS: 10,
        PRODUCTION_BASE: 0.8,
        PRODUCTION_MULTIPLIER: 0.15,
        FLEET_SPEED: 80,
        CONQUEST_TIME: 2000,
        AI_DECISION_INTERVAL: 3000,
        CAPACITY_MULTIPLIER: 1.0,
        // Testing optimization - 3x faster metal for gameplay testing
        TESTING_MODE: true
    },

    // Classic mode configuration (only mode supported)
    CLASSIC: {
        name: 'Clásico Evolucionado',
        settings: {
            startShips: 10,
            capacityMultiplier: 1.0,
            minShipsToSend: 1,
            productionBase: 0.8,
            productionMultiplier: 0.15,
            fleetSpeed: 80,
            conquestTime: 2000,
            aiDecisionInterval: 3000
        },
        victory: {
            condition: 'total_control',
            earlyAdvantageThreshold: 0.85, // 85% of planets for early victory
            economicRatio: 3.0 // 3:1 ship ratio for economic victory
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

        console.log('⚖️ Balance initialized for Classic Evolution mode:', {
            startShips: this.appliedSettings.startShips,
            testingMode: this.BASE.TESTING_MODE ? 'ENABLED (3x metal)' : 'DISABLED',
            victory: this.appliedSettings.victory
        });
    },

    // Get current settings
    getCurrentSettings() {
        return this.appliedSettings;
    },

    // Check victory conditions
    checkVictoryConditions(playerPlanets, aiPlanets, totalPlanets, playerShips, aiShips) {
        const victory = this.appliedSettings.victory;
        
        // Total control victory (main condition)
        if (playerPlanets === totalPlanets) {
            return { winner: 'player', condition: 'total_control' };
        }
        if (aiPlanets === totalPlanets) {
            return { winner: 'ai', condition: 'total_control' };
        }
        
        // Early advantage victory
        const playerAdvantage = playerPlanets / totalPlanets;
        const aiAdvantage = aiPlanets / totalPlanets;
        
        if (playerAdvantage >= victory.earlyAdvantageThreshold) {
            return { winner: 'player', condition: 'early_advantage' };
        }
        if (aiAdvantage >= victory.earlyAdvantageThreshold) {
            return { winner: 'ai', condition: 'early_advantage' };
        }
        
        // Economic victory
        const shipRatio = playerShips / Math.max(aiShips, 1);
        const aiShipRatio = aiShips / Math.max(playerShips, 1);
        
        if (shipRatio >= victory.economicRatio && playerPlanets > aiPlanets) {
            return { winner: 'player', condition: 'economic' };
        }
        if (aiShipRatio >= victory.economicRatio && aiPlanets > playerPlanets) {
            return { winner: 'ai', condition: 'economic' };
        }
        
        return null; // No victory yet
    },

    // Debug: Show current settings
    debugCurrentSettings() {
        console.table({
            'Mode': 'Classic Evolution',
            'Start Ships': this.appliedSettings.startShips,
            'Production Base': this.appliedSettings.productionBase,
            'Fleet Speed': this.appliedSettings.fleetSpeed,
            'Conquest Time': this.appliedSettings.conquestTime + 'ms',
            'Early Victory': `${this.appliedSettings.victory.earlyAdvantageThreshold * 100}%`,
            'Economic Ratio': `${this.appliedSettings.victory.economicRatio}:1`,
            'Testing Mode': this.BASE.TESTING_MODE ? 'ON (3x metal)' : 'OFF'
        });
    }
};