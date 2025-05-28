// Game Modes System - V1.3
// Modular system to handle different game modes and configurations

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
            description: 'Partidas rápidas de 90 segundos con ritmo acelerado',
            duration: 90000, // 90 seconds
            settings: {
                production: 3.0,
                fleetSpeed: 2.5,
                conquest: 2.0,
                initialShips: 15,
                kingOfHill: false,
                victoryConditions: ['economic', 'domination', 'time', 'total_conquest']
            }
        },
        
        KING_OF_HILL: {
            id: 'kingofhill',
            name: 'Rey de la Colina',
            description: 'Controla el planeta central por 30 segundos para ganar',
            duration: null,
            settings: {
                production: 2.0,
                fleetSpeed: 2.0,
                conquest: 1.5,
                initialShips: 12,
                kingOfHill: true,
                hillControlTime: 30000, // 30 seconds
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
        
        // Update CONFIG with mode multipliers
        CONFIG.BALANCE = {
            PRODUCTION_MULTIPLIER: settings.production,
            FLEET_SPEED_MULTIPLIER: settings.fleetSpeed,
            CONQUEST_SPEED_MULTIPLIER: settings.conquest,
            INITIAL_SHIPS: settings.initialShips
        };

        // Apply to existing config values
        CONFIG.PLANETS.PRODUCTION_BASE *= settings.production;
        CONFIG.FLEET.SPEED *= settings.fleetSpeed;
        CONFIG.PLANETS.CONQUEST_TIME /= settings.conquest;

        console.log(`⚙️ Applied ${this.currentMode.name} settings:`, CONFIG.BALANCE);
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

    // Reset to default mode
    resetToDefault() {
        this.currentMode = this.modes.CLASSIC;
        console.log('🔄 Reset to Classic mode');
    }
};

// Export for use in other modules
window.GameModes = GameModes;