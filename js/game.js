// Main Game Controller - V1.3 Enhanced with Mode Selection
const Game = {
    initialized: false,
    currentGameMode: null,

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Space Game V1.3...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeSystems());
        } else {
            this.initializeSystems();
        }
    },

    // Initialize all systems before showing mode selector
    initializeSystems() {
        try {
            // Initialize v1.3 systems
            console.log('⚙️ Initializing v1.3 systems...');
            
            // Core systems
            GameModes.init();
            VictoryConditions.init();
            EnhancedAI.init();
            GameTimer.init();
            ModeSelector.init();
            
            console.log('✅ All v1.3 systems initialized');
            
            // Show mode selector instead of starting directly
            this.showModeSelector();
            
        } catch (error) {
            console.error('❌ Failed to initialize v1.3 systems:', error);
            this.showErrorMessage(error);
        }
    },

    // Show mode selector
    showModeSelector() {
        console.log('🎯 Showing mode selector...');
        ModeSelector.show();
    },

    // Start game with selected mode
    startWithMode(modeId) {
        console.log(`🚀 Starting game with mode: ${modeId}`);
        
        this.currentGameMode = modeId;
        
        // Apply mode settings
        GameModes.applyModeSettings();
        
        // Initialize game engine with mode settings
        this.start();
        
        // Setup mode-specific features
        this.setupModeFeatures();
    },

    // Original start method (now enhanced)
    start() {
        try {
            console.log('⚙️ Starting game engine...');
            
            GameEngine.init();
            console.log('✅ Game engine initialized');
            
            this.initialized = true;
            console.log('🎮 Space Game ready to play!');
            
            // Show welcome message based on mode
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage(error);
        }
    },

    // Setup mode-specific features
    setupModeFeatures() {
        const mode = GameModes.currentMode;
        if (!mode) return;

        console.log(`🎯 Setting up features for ${mode.name} mode`);

        // Setup timer for timed modes
        if (mode.duration) {
            GameTimer.start(mode.duration, () => {
                this.handleTimeUp();
            });
        }

        // Setup King of Hill mode
        if (mode.settings.kingOfHill) {
            // Wait for planets to be created
            setTimeout(() => {
                KingOfHill.init();
            }, 100);
        }

        // Setup enhanced AI for the mode
        if (EnhancedAI) {
            EnhancedAI.init();
        }
    },

    // Handle time up in timed modes
    handleTimeUp() {
        console.log('⏰ Time up! Checking victory conditions...');
        
        const victory = VictoryConditions.checkVictoryConditions();
        if (victory) {
            GameEngine.endGame(victory.winner, `${victory.condition}: ${victory.details}`);
        } else {
            // Fallback to basic planet count
            const planets = GameEngine.planets;
            const playerPlanets = planets.filter(p => p.owner === 'player').length;
            const aiPlanets = planets.filter(p => p.owner === 'ai').length;
            
            let winner = 'tie';
            if (playerPlanets > aiPlanets) winner = 'player';
            else if (aiPlanets > playerPlanets) winner = 'ai';
            
            GameEngine.endGame(winner, `Time victory: ${playerPlanets} vs ${aiPlanets} planets`);
        }
    },

    // Enhanced welcome message
    showWelcomeMessage() {
        const mode = GameModes.currentMode;
        const modeName = mode ? mode.name : 'Clásico';
        
        setTimeout(() => {
            if (mode && mode.id === 'blitz') {
                UI.setStatus(`¡Modo ${modeName}! ⚡ Partida rápida de 90 segundos`, 4000);
            } else if (mode && mode.id === 'kingofhill') {
                UI.setStatus(`¡Modo ${modeName}! 👑 Controla la colina por 30 segundos`, 4000);
            } else {
                UI.setStatus(`¡Modo ${modeName}! Conquista todos los planetas para ganar`, 3000);
            }
        }, 500);
    },

    showErrorMessage(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>Error al inicializar el juego</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()">Reintentar</button>
        `;
        document.body.appendChild(errorDiv);
    },

    // Enhanced restart with mode selection
    restart() {
        console.log('🔄 Restarting game...');
        
        // Stop timers and cleanup
        if (GameTimer) GameTimer.stop();
        if (KingOfHill) KingOfHill.destroy();
        
        // Clear existing game state
        if (FleetManager) FleetManager.clear();
        if (GameEngine.planets) {
            GameEngine.planets.forEach(planet => {
                if (planet.destroy) planet.destroy();
            });
            GameEngine.planets = [];
        }

        // Reset to mode selection
        this.initialized = false;
        this.currentGameMode = null;
        
        // Show mode selector again
        this.showModeSelector();
    },

    // Get current game info
    getCurrentGameInfo() {
        return {
            mode: this.currentGameMode,
            modeDetails: GameModes.currentMode,
            isTimedMode: GameModes.hasFeature('timer'),
            hasKingOfHill: GameModes.hasFeature('kingOfHill'),
            victoryConditions: GameModes.getVictoryConditions()
        };
    },

    // Enhanced debug tools for v1.3
    debug: {
        // Original debug methods
        logPlanetStats() {
            if (!GameEngine.planets) return;
            console.table(GameEngine.planets.map(p => ({
                id: p.id,
                key: p.assignedKey,
                owner: p.owner,
                ships: p.ships,
                capacity: p.capacity,
                position: `${Math.round(p.x)}, ${Math.round(p.y)}`,
                isHill: p.isHill || false
            })));
        },

        logFleetStats() {
            if (!FleetManager || !FleetManager.fleets) return;
            console.table(FleetManager.fleets.map(f => ({
                ships: f.ships,
                owner: f.owner,
                progress: `${Math.round((Date.now() - f.startTime) / f.travelTime * 100)}%`
            })));
        },

        setAISpeed(intervalMs) {
            CONFIG.AI.DECISION_INTERVAL = intervalMs;
            console.log(`AI decision interval set to ${intervalMs}ms`);
        },

        givePlayerShips(planetId, amount) {
            const planet = GameEngine.getPlanetById(planetId);
            if (planet && planet.owner === 'player') {
                planet.ships = Math.min(planet.capacity, planet.ships + amount);
                if (planet.updateVisual) planet.updateVisual();
                console.log(`Added ${amount} ships to planet ${planetId}`);
            }
        },

        winGame() {
            if (!GameEngine.planets) return;
            GameEngine.planets.forEach(planet => {
                if (planet.owner === 'ai') {
                    planet.owner = 'player';
                    if (planet.updateVisual) planet.updateVisual();
                }
            });
            console.log('Debug: Player wins!');
        },

        // New v1.3 debug methods
        logGameMode() {
            console.log('Current Game Mode:', Game.getCurrentGameInfo());
        },

        logAIStrategy() {
            if (EnhancedAI) {
                console.log('AI Strategy:', EnhancedAI.getCurrentStrategyInfo());
            }
        },

        logVictoryConditions() {
            if (VictoryConditions) {
                console.log('Victory Status:', VictoryConditions.getVictoryStatus());
            }
        },

        switchMode(modeId) {
            GameModes.setMode(modeId);
            Game.restart();
            console.log(`Switched to ${modeId} mode`);
        },

        forceTimeUp() {
            if (GameTimer && GameTimer.isActive()) {
                GameTimer.timeUp();
                console.log('Forced time up');
            }
        },

        setKingOfHillControl(owner) {
            if (KingOfHill && KingOfHill.hillPlanet) {
                KingOfHill.hillPlanet.owner = owner;
                if (KingOfHill.hillPlanet.updateVisual) {
                    KingOfHill.hillPlanet.updateVisual();
                }
                console.log(`Set hill control to ${owner}`);
            }
        }
    }
};

// Auto-initialize when script loads
Game.init();

// Make tools available in console
window.GameDebug = Game.debug;
window.Game = Game;