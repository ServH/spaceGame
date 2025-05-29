// Balance Config - V1.4 Testing-optimized metal generation
const BalanceConfig = {
    // Base values - normal gameplay
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

    // Mode-specific multipliers and overrides
    MODES: {
        classic: {
            name: 'Clásico',
            multipliers: {
                production: 1.0,
                fleetSpeed: 1.0,
                conquest: 1.0,
                aiSpeed: 1.0
            },
            settings: {
                startShips: 10,
                capacityMultiplier: 1.0,
                minShipsToSend: 1
            },
            victory: {
                timeLimit: 0,
                earlyAdvantageThreshold: 1.0, // 100% = disabled
                economicRatio: 0, // disabled
                condition: 'total_control'
            }
        },

        blitz: {
            name: 'Blitz',
            multipliers: {
                production: 2.0,        // 2x production (más balanceado)
                fleetSpeed: 2.0,        // 2x speed
                conquest: 1.5,          // 1.5x conquest
                aiSpeed: 0.8            // 20% faster AI
            },
            settings: {
                startShips: 12,         // Menos inicial
                capacityMultiplier: 0.9, // Capacidades ligeramente menores
                minShipsToSend: 2
            },
            victory: {
                timeLimit: 120000,      // 2 minutos
                earlyAdvantageThreshold: 0.85, // 85% planetas (más balanceado)
                economicRatio: 4.0,     // 4:1 ratio (más difícil)
                condition: 'time_or_control'
            }
        },

        kingOfHill: {
            name: 'Rey de la Colina',
            multipliers: {
                production: 1.5,        // Producción moderada
                fleetSpeed: 1.8,        // Movimiento rápido
                conquest: 1.2,          // Conquista ligeramente más rápida
                aiSpeed: 0.9            // AI un poco más rápida
            },
            settings: {
                startShips: 15,         // Más naves para luchar por la colina
                capacityMultiplier: 1.1, // Capacidades ligeramente mayores
                minShipsToSend: 1
            },
            victory: {
                timeLimit: 180000,      // 3 minutos
                earlyAdvantageThreshold: 0.9, // 90% planetas
                economicRatio: 0,       // Disabled
                hillControlTime: 45000, // 45 segundos (más balanceado)
                condition: 'king_of_hill'
            }
        }
    },

    currentMode: 'classic',
    appliedSettings: null,

    // Apply mode settings to CONFIG
    applyMode(mode) {
        this.currentMode = mode;
        const modeConfig = this.MODES[mode];
        
        if (!modeConfig) {
            console.error(`Unknown mode: ${mode}`);
            return;
        }

        // Calculate final values
        this.appliedSettings = {
            startShips: modeConfig.settings.startShips,
            productionBase: this.BASE.PRODUCTION_BASE * modeConfig.multipliers.production,
            productionMultiplier: this.BASE.PRODUCTION_MULTIPLIER * modeConfig.multipliers.production,
            fleetSpeed: this.BASE.FLEET_SPEED * modeConfig.multipliers.fleetSpeed,
            conquestTime: this.BASE.CONQUEST_TIME / modeConfig.multipliers.conquest,
            aiDecisionInterval: this.BASE.AI_DECISION_INTERVAL * modeConfig.multipliers.aiSpeed,
            capacityMultiplier: modeConfig.settings.capacityMultiplier,
            minShipsToSend: modeConfig.settings.minShipsToSend,
            victory: modeConfig.victory,
            testingMode: this.BASE.TESTING_MODE
        };

        // Apply to CONFIG
        CONFIG.PLANETS.PRODUCTION_BASE = this.appliedSettings.productionBase;
        CONFIG.PLANETS.PRODUCTION_MULTIPLIER = this.appliedSettings.productionMultiplier;
        CONFIG.FLEET.SPEED = this.appliedSettings.fleetSpeed;
        CONFIG.PLANETS.CONQUEST_TIME = this.appliedSettings.conquestTime;
        CONFIG.AI.DECISION_INTERVAL = this.appliedSettings.aiDecisionInterval;

        console.log(`⚖️ Balance applied for ${modeConfig.name} mode:`, {
            production: `${modeConfig.multipliers.production}x`,
            speed: `${modeConfig.multipliers.fleetSpeed}x`,
            conquest: `${modeConfig.multipliers.conquest}x`,
            startShips: this.appliedSettings.startShips,
            testingMode: this.BASE.TESTING_MODE ? 'ENABLED (3x metal)' : 'DISABLED'
        });
    },

    // Get current mode settings
    getCurrentSettings() {
        return this.appliedSettings || this.MODES[this.currentMode];
    },

    // Get mode configuration for UI
    getModeInfo(mode) {
        return this.MODES[mode];
    },

    // Debug: List all settings
    debugCurrentSettings() {
        console.table({
            Mode: this.currentMode,
            'Start Ships': this.appliedSettings.startShips,
            'Production': `${this.MODES[this.currentMode].multipliers.production}x`,
            'Fleet Speed': `${this.MODES[this.currentMode].multipliers.fleetSpeed}x`,
            'Conquest Speed': `${this.MODES[this.currentMode].multipliers.conquest}x`,
            'Time Limit': this.appliedSettings.victory.timeLimit / 1000 + 's',
            'Early Victory': `${this.appliedSettings.victory.earlyAdvantageThreshold * 100}%`,
            'Testing Mode': this.BASE.TESTING_MODE ? 'ON (3x metal)' : 'OFF'
        });
    }
};