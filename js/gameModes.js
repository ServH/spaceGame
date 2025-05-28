// Game Modes System - V1.3 Revised
// Fixed balance and mechanics based on user feedback

const GameModes = {
    // Available game modes
    modes: {
        CLASSIC: {
            id: 'classic',
            name: 'Clásico',
            description: 'Modo original de juego estándar',
            duration: null, // No time limit
            settings: {
                production: 1.0,
                fleetSpeed: 1.0,
                conquest: 1.0,
                initialShips: 10,
                kingOfHill: false,
                victoryConditions: ['total_conquest']
            }
        },
        
        BLITZ: {
            id: 'blitz',
            name: 'Blitz',
            description: 'Partidas rápidas de 2 minutos con ritmo acelerado',
            duration: 120000, // 2 minutes (was 90 seconds)
            settings: {
                production: 3.0,
                fleetSpeed: 2.5,
                conquest: 2.0,
                initialShips: 15,
                kingOfHill: false,
                victoryConditions: ['economic', 'domination', 'time', 'total_conquest'],
                // Revised thresholds
                dominationThreshold: 0.85, // 85% instead of 75%
                economicRatio: 4.0 // 4:1 instead of 3:1
            }
        },
        
        KING_OF_HILL: {
            id: 'kingofhill',
            name: 'Rey de la Colina',
            description: 'Controla el planeta central fortificado por 45 segundos',
            duration: null,
            settings: {
                production: 2.0,
                fleetSpeed: 2.0,
                conquest: 1.5,
                initialShips: 12,
                kingOfHill: true,
                hillControlTime: 45000, // 45 seconds instead of 30
                hillProductionBonus: 1.5, // Hill planet produces 50% faster
                hillCapacityBonus: 1.3, // Hill planet 30% larger capacity
                victoryConditions: ['king_of_hill', 'total_conquest']
            }
        }
    },

    // Current active mode
    currentMode: null,

    // Initialize game mode system
    init() {
        this.currentMode = this.modes.CLASSIC;
        console.log('🎮 Game Modes system initialized');
    },

    // Set active game mode
    setMode(modeId) {
        if (!this.modes[modeId.toUpperCase()]) {
            console.error(`Game mode ${modeId} not found`);
            return false;
        }

        this.currentMode = this.modes[modeId.toUpperCase()];
        console.log(`🎯 Game mode set to: ${this.currentMode.name}`);
        return true;
    },

    // Get current mode settings
    getCurrentSettings() {
        return this.currentMode ? this.currentMode.settings : this.modes.CLASSIC.settings;
    },

    // Get all available modes for UI
    getAvailableModes() {
        return Object.values(this.modes).map(mode => ({
            id: mode.id,
            name: mode.name,
            description: mode.description,
            duration: mode.duration
        }));
    },

    // Apply mode settings to game config
    applyModeSettings() {
        if (!this.currentMode) return;

        const settings = this.currentMode.settings;
        
        // Create balance settings object
        const balanceSettings = {
            PRODUCTION_MULTIPLIER: settings.production,
            FLEET_SPEED_MULTIPLIER: settings.fleetSpeed,
            CONQUEST_SPEED_MULTIPLIER: settings.conquest,
            INITIAL_SHIPS: settings.initialShips
        };

        // Apply to CONFIG
        CONFIG.applyBalance(balanceSettings);

        console.log(`⚙️ Applied ${this.currentMode.name} settings:`, balanceSettings);
    },

    // Check if current mode supports a feature
    hasFeature(feature) {
        if (!this.currentMode) return false;
        
        switch (feature) {
            case 'timer':
                return this.currentMode.duration !== null;
            case 'kingOfHill':
                return this.currentMode.settings.kingOfHill;
            case 'multipleVictoryConditions':
                return this.currentMode.settings.victoryConditions.length > 1;
            default:
                return false;
        }
    },

    // Get victory conditions for current mode
    getVictoryConditions() {
        return this.currentMode ? this.currentMode.settings.victoryConditions : ['total_conquest'];
    },

    // Get mode duration
    getDuration() {
        return this.currentMode ? this.currentMode.duration : null;
    },

    // Get King of Hill control time
    getKingOfHillTime() {
        return this.currentMode && this.currentMode.settings.hillControlTime ? 
               this.currentMode.settings.hillControlTime : 45000;
    },

    // Get domination threshold for current mode
    getDominationThreshold() {
        return this.currentMode && this.currentMode.settings.dominationThreshold ?
               this.currentMode.settings.dominationThreshold : 0.75;
    },

    // Get economic victory ratio for current mode
    getEconomicRatio() {
        return this.currentMode && this.currentMode.settings.economicRatio ?
               this.currentMode.settings.economicRatio : 3.0;
    },

    // Get hill bonuses
    getHillBonuses() {
        if (!this.currentMode || !this.currentMode.settings.kingOfHill) {
            return { production: 1.0, capacity: 1.0 };
        }
        
        return {
            production: this.currentMode.settings.hillProductionBonus || 1.0,
            capacity: this.currentMode.settings.hillCapacityBonus || 1.0
        };
    },

    // Reset to default mode
    resetToDefault() {
        this.currentMode = this.modes.CLASSIC;
        CONFIG.resetBalance();
        console.log('🔄 Reset to Classic mode');
    },

    // Get mode info for debugging
    getModeInfo() {
        if (!this.currentMode) return null;
        
        return {
            id: this.currentMode.id,
            name: this.currentMode.name,
            settings: this.currentMode.settings,
            hasTimer: this.hasFeature('timer'),
            hasKingOfHill: this.hasFeature('kingOfHill'),
            victoryConditions: this.getVictoryConditions(),
            dominationThreshold: this.getDominationThreshold(),
            economicRatio: this.getEconomicRatio()
        };
    }
};

// Export for use in other modules
window.GameModes = GameModes;