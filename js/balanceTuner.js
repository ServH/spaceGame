// Balance Tuner - V1.3 Polish
// Dynamic balance adjustments for improved gameplay flow

const BalanceTuner = {
    // Balance profiles
    profiles: {
        CLASSIC_ORIGINAL: {
            name: 'Clásico Original',
            description: 'Balance original sin cambios',
            multipliers: {
                production: 1.0,
                initialShips: 1.0,
                capacity: 1.0,
                aiSpeed: 1.0
            }
        },

        CLASSIC_DYNAMIC: {
            name: 'Clásico Dinámico',
            description: 'Inicio más ágil, mantiene estrategia',
            multipliers: {
                production: 1.3,
                initialShips: 1.5,
                capacity: 1.2,
                aiSpeed: 1.1
            }
        },

        CLASSIC_FAST: {
            name: 'Clásico Rápido',
            description: 'Partidas más cortas y dinámicas',
            multipliers: {
                production: 1.6,
                initialShips: 2.0,
                capacity: 1.4,
                aiSpeed: 1.3
            }
        }
    },

    // Current profile
    currentProfile: null,
    originalConfig: null,

    // Initialize balance tuner
    init() {
        this.storeOriginalConfig();
        this.selectBalanceProfile();
        console.log(`⚖️ Balance Tuner: ${this.currentProfile.name}`);
    },

    // Store original configuration
    storeOriginalConfig() {
        this.originalConfig = {
            PRODUCTION_BASE: CONFIG.PLANETS.PRODUCTION_BASE,
            CAPACITIES: [...CONFIG.PLANETS.CAPACITIES],
            INITIAL_SHIPS: CONFIG.BALANCE ? CONFIG.BALANCE.INITIAL_SHIPS : 10,
            AI_DECISION_INTERVAL: CONFIG.AI.DECISION_INTERVAL
        };
    },

    // Select balance profile based on game mode and preferences
    selectBalanceProfile() {
        const mode = GameModes.currentMode;
        
        if (!mode || mode.id === 'classic') {
            // For classic mode, use dynamic balance to improve flow
            this.currentProfile = this.profiles.CLASSIC_DYNAMIC;
        } else {
            // Other modes use their own balance
            this.currentProfile = this.profiles.CLASSIC_ORIGINAL;
            return; // Don't apply changes to non-classic modes
        }

        this.applyProfile();
    },

    // Apply selected balance profile
    applyProfile() {
        if (!this.currentProfile || !this.originalConfig) return;

        const multipliers = this.currentProfile.multipliers;

        // Apply production multiplier
        CONFIG.PLANETS.PRODUCTION_BASE = this.originalConfig.PRODUCTION_BASE * multipliers.production;

        // Apply capacity multiplier
        CONFIG.PLANETS.CAPACITIES = this.originalConfig.CAPACITIES.map(cap => 
            Math.floor(cap * multipliers.capacity)
        );

        // Apply initial ships multiplier
        const newInitialShips = Math.floor(this.originalConfig.INITIAL_SHIPS * multipliers.initialShips);
        if (CONFIG.BALANCE) {
            CONFIG.BALANCE.INITIAL_SHIPS = newInitialShips;
        }

        // Apply AI speed multiplier
        CONFIG.AI.DECISION_INTERVAL = Math.floor(this.originalConfig.AI_DECISION_INTERVAL / multipliers.aiSpeed);

        console.log(`⚖️ Applied ${this.currentProfile.name} balance:`, {
            production: `${multipliers.production}x`,
            capacity: `${multipliers.capacity}x`,
            initialShips: newInitialShips,
            aiSpeed: `${multipliers.aiSpeed}x`
        });

        // Show notification about balance changes
        this.showBalanceNotification();
    },

    // Show balance notification
    showBalanceNotification() {
        if (!this.currentProfile || this.currentProfile === this.profiles.CLASSIC_ORIGINAL) return;

        if (typeof NotificationSystem !== 'undefined') {
            const changes = [];
            const m = this.currentProfile.multipliers;

            if (m.production > 1.0) changes.push(`+${Math.round((m.production - 1) * 100)}% producción`);
            if (m.initialShips > 1.0) changes.push(`+${Math.round((m.initialShips - 1) * 100)}% naves iniciales`);
            if (m.capacity > 1.0) changes.push(`+${Math.round((m.capacity - 1) * 100)}% capacidad`);

            if (changes.length > 0) {
                NotificationSystem.showNotification(
                    `Balance Dinámico: ${changes.join(', ')}`,
                    'info',
                    4000
                );
            }
        }
    },

    // Dynamic balance adjustments during gameplay
    adjustForGameplay(gameState) {
        if (!this.shouldAdjust(gameState)) return;

        const mode = GameModes.currentMode;
        if (!mode || mode.id !== 'classic') return;

        // Adjust based on game length and state
        this.adjustForGameLength(gameState);
        this.adjustForPlayerStuggle(gameState);
    },

    // Adjust balance for game length
    adjustForGameLength(gameState) {
        const gameTime = Date.now() - gameState.startTime;
        const longGameThreshold = 10 * 60 * 1000; // 10 minutes

        if (gameTime > longGameThreshold) {
            // Game is taking too long - boost production slightly
            const currentBoost = CONFIG.PLANETS.PRODUCTION_BASE / this.originalConfig.PRODUCTION_BASE;
            if (currentBoost < 2.0) {
                CONFIG.PLANETS.PRODUCTION_BASE *= 1.1;
                console.log('⚖️ Long game detected - boosting production by 10%');
            }
        }
    },

    // Adjust balance if player is struggling
    adjustForPlayerStuggle(gameState) {
        const playerAdvantage = gameState.playerAdvantage || 0;
        const severeDisadvantage = -0.4; // Player has 40% fewer planets

        if (playerAdvantage < severeDisadvantage) {
            // Player is struggling - slightly nerf AI decision speed
            if (CONFIG.AI.DECISION_INTERVAL < this.originalConfig.AI_DECISION_INTERVAL * 1.5) {
                CONFIG.AI.DECISION_INTERVAL = Math.floor(CONFIG.AI.DECISION_INTERVAL * 1.2);
                console.log('⚖️ Player struggling - slowing AI decisions by 20%');
            }
        }
    },

    // Check if adjustments should be made
    shouldAdjust(gameState) {
        return gameState && 
               gameState.startTime && 
               this.currentProfile !== this.profiles.CLASSIC_ORIGINAL;
    },

    // Get current balance info
    getBalanceInfo() {
        if (!this.currentProfile) return null;

        return {
            profile: this.currentProfile.name,
            description: this.currentProfile.description,
            changes: this.getBalanceChanges(),
            isOriginal: this.currentProfile === this.profiles.CLASSIC_ORIGINAL
        };
    },

    // Get balance changes summary
    getBalanceChanges() {
        if (!this.currentProfile || !this.originalConfig) return {};

        const current = {
            production: CONFIG.PLANETS.PRODUCTION_BASE,
            capacity: CONFIG.PLANETS.CAPACITIES[0], // Use first capacity as example
            initialShips: CONFIG.BALANCE ? CONFIG.BALANCE.INITIAL_SHIPS : 10,
            aiInterval: CONFIG.AI.DECISION_INTERVAL
        };

        const original = {
            production: this.originalConfig.PRODUCTION_BASE,
            capacity: this.originalConfig.CAPACITIES[0],
            initialShips: this.originalConfig.INITIAL_SHIPS,
            aiInterval: this.originalConfig.AI_DECISION_INTERVAL
        };

        return {
            productionChange: Math.round((current.production / original.production - 1) * 100),
            capacityChange: Math.round((current.capacity / original.capacity - 1) * 100),
            initialShipsChange: Math.round((current.initialShips / original.initialShips - 1) * 100),
            aiSpeedChange: Math.round((original.aiInterval / current.aiInterval - 1) * 100)
        };
    },

    // Reset to original balance
    reset() {
        if (!this.originalConfig) return;

        CONFIG.PLANETS.PRODUCTION_BASE = this.originalConfig.PRODUCTION_BASE;
        CONFIG.PLANETS.CAPACITIES = [...this.originalConfig.CAPACITIES];
        CONFIG.AI.DECISION_INTERVAL = this.originalConfig.AI_DECISION_INTERVAL;

        if (CONFIG.BALANCE) {
            CONFIG.BALANCE.INITIAL_SHIPS = this.originalConfig.INITIAL_SHIPS;
        }

        this.currentProfile = null;
        console.log('⚖️ Balance reset to original values');
    },

    // Force a specific profile (for testing)
    setProfile(profileKey) {
        if (!this.profiles[profileKey]) {
            console.error(`Unknown balance profile: ${profileKey}`);
            return false;
        }

        this.currentProfile = this.profiles[profileKey];
        this.applyProfile();
        return true;
    }
};

// Export for use in other modules
window.BalanceTuner = BalanceTuner;