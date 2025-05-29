// Victory Monitor - V1.3 Polish
// Monitors victory conditions and sends contextual notifications

const VictoryMonitor = {
    // Monitoring state
    lastCheckTime: 0,
    checkInterval: 2000, // Check every 2 seconds
    lastNotifications: {},

    // Thresholds for warnings
    thresholds: {
        economic: {
            close: 0.8,    // 80% towards victory
            warning: 0.9   // 90% towards victory
        },
        domination: {
            close: 0.85,   // 85% towards victory
            warning: 0.95  // 95% towards victory
        },
        time: {
            warning: 30000, // 30 seconds remaining
            critical: 10000 // 10 seconds remaining
        }
    },

    // Initialize victory monitor
    init() {
        console.log('📊 Victory Monitor initialized');
    },

    // Main update function
    update() {
        const now = Date.now();
        if (now - this.lastCheckTime < this.checkInterval) return;
        
        this.lastCheckTime = now;
        
        // Check all active victory conditions
        this.checkEconomicVictory();
        this.checkDominationVictory();
        this.checkTimeWarnings();
        this.checkKingOfHillProgress();
    },

    // Check economic victory progress
    checkEconomicVictory() {
        if (!GameModes.getVictoryConditions().includes('economic')) return;
        if (typeof VictoryConditions === 'undefined') return;

        const progress = VictoryConditions.getConditionProgress('economic');
        if (!progress) return;

        const requiredRatio = progress.requiredRatio;
        const playerRatio = progress.playerRatio;
        const aiRatio = progress.aiRatio;

        // Check player economic progress
        if (playerRatio >= requiredRatio * this.thresholds.economic.warning && 
            progress.player.planets > progress.ai.planets) {
            this.notifyIfNew('player_economic_warning', 
                `¡Victoria económica cercana! Ratio: ${playerRatio.toFixed(1)}:1 (necesitas ${requiredRatio}:1)`,
                'warning'
            );
        }

        // Check AI economic threat
        if (aiRatio >= requiredRatio * this.thresholds.economic.close && 
            progress.ai.planets > progress.player.planets) {
            this.notifyIfNew('ai_economic_threat',
                `¡IA cerca de victoria económica! Ratio: ${aiRatio.toFixed(1)}:1`,
                'danger'
            );
        }
    },

    // Check domination victory progress
    checkDominationVictory() {
        if (!GameModes.getVictoryConditions().includes('domination')) return;
        if (typeof VictoryConditions === 'undefined') return;

        const progress = VictoryConditions.getConditionProgress('domination');
        if (!progress) return;

        const playerProgress = progress.player / 100;
        const aiProgress = progress.ai / 100;

        // Check player domination progress
        if (playerProgress >= this.thresholds.domination.warning) {
            this.notifyIfNew('player_domination_warning',
                `¡Dominación cercana! ${Math.round(playerProgress * 100)}% conseguido`,
                'warning'
            );
        }

        // Check AI domination threat
        if (aiProgress >= this.thresholds.domination.close) {
            this.notifyIfNew('ai_domination_threat',
                `¡IA cerca de dominación! ${Math.round(aiProgress * 100)}% conseguido`,
                'danger'
            );
        }
    },

    // Check time warnings for timed modes
    checkTimeWarnings() {
        if (!GameModes.hasFeature('timer')) return;
        if (typeof GameTimer === 'undefined' || !GameTimer.isActive()) return;

        const timeRemaining = GameTimer.getTimeRemaining();

        if (timeRemaining <= this.thresholds.time.critical) {
            this.notifyIfNew('time_critical',
                `¡Solo quedan ${Math.ceil(timeRemaining / 1000)} segundos!`,
                'danger'
            );
        } else if (timeRemaining <= this.thresholds.time.warning) {
            this.notifyIfNew('time_warning',
                `¡Quedan ${Math.ceil(timeRemaining / 1000)} segundos!`,
                'warning'
            );
        }
    },

    // Check King of Hill progress
    checkKingOfHillProgress() {
        if (!GameModes.hasFeature('kingOfHill')) return;
        if (typeof KingOfHill === 'undefined') return;

        const controller = KingOfHill.getCurrentController();
        const progress = KingOfHill.getControlProgress();

        if (controller && controller !== 'neutral' && progress > 0.7) {
            const timeNeeded = GameModes.getKingOfHillTime();
            const remaining = Math.ceil((1 - progress) * timeNeeded / 1000);
            
            const controllerName = controller === 'player' ? 'Tú' : 'La IA';
            this.notifyIfNew(`hill_progress_${controller}`,
                `¡${controllerName} ${remaining}s de ganar la colina!`,
                controller === 'player' ? 'success' : 'danger'
            );
        }
    },

    // Notify only if not recently sent
    notifyIfNew(key, message, type, duration = 3000) {
        const now = Date.now();
        const cooldown = 10000; // 10 seconds between same notifications

        if (this.lastNotifications[key] && 
            now - this.lastNotifications[key] < cooldown) {
            return;
        }

        this.lastNotifications[key] = now;

        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.showNotification(message, type, duration);
        }
    },

    // Get current victory progress summary
    getProgressSummary() {
        const summary = {};
        const activeConditions = GameModes.getVictoryConditions();

        if (typeof VictoryConditions !== 'undefined') {
            activeConditions.forEach(condition => {
                const progress = VictoryConditions.getConditionProgress(condition);
                if (progress) {
                    summary[condition] = progress;
                }
            });
        }

        return summary;
    },

    // Reset notification cooldowns
    reset() {
        this.lastNotifications = {};
        console.log('📊 Victory Monitor reset');
    }
};

// Export for use in other modules
window.VictoryMonitor = VictoryMonitor;