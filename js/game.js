// Main Game Controller - Restored original functionality
const Game = {
    initialized: false,

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Space Game...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        try {
            // Show mode selection first, then initialize game
            if (window.GameMenu) {
                GameMenu.show();
            } else {
                this.initializeGame();
            }
            
            this.initialized = true;
            console.log('✅ Game ready!');
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage(error);
        }
    },

    // Called by GameMenu or directly if no menu
    initializeGame(selectedMode = 'classic') {
        console.log('⚙️ Starting game systems...');
        
        // Apply balance if available
        if (window.BalanceConfig) {
            BalanceConfig.applyMode(selectedMode);
        }
        
        // Initialize original game systems
        GameEngine.init();
        console.log('✅ Game engine initialized');
        
        this.showWelcomeMessage();
    },

    showWelcomeMessage() {
        setTimeout(() => {
            UI.setStatus('¡Bienvenido! Conquista todos los planetas para ganar', 3000);
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

    restart() {
        console.log('🔄 Restarting game...');
        
        // Clear existing game state
        FleetManager.clear();
        GameEngine.planets.forEach(planet => planet.destroy());
        GameEngine.planets = [];
        
        // Restart
        this.initialized = false;
        this.init();
    },

    // Debug helpers
    debug: {
        logPlanetStats() {
            console.table(GameEngine.planets.map(p => ({
                id: p.id,
                key: p.assignedKey,
                owner: p.owner,
                ships: p.ships,
                capacity: p.capacity,
                position: `${Math.round(p.x)}, ${Math.round(p.y)}`
            })));
        },

        logFleetStats() {
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
                planet.updateVisual();
                console.log(`Added ${amount} ships to planet ${planetId}`);
            }
        },

        winGame() {
            GameEngine.planets.forEach(planet => {
                if (planet.owner === 'ai') {
                    planet.owner = 'player';
                    planet.updateVisual();
                }
            });
            console.log('Debug: Player wins!');
        }
    }
};

// Auto-initialize when script loads
Game.init();

// Make debug tools available in console
window.GameDebug = Game.debug;
window.Game = Game;