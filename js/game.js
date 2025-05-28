// Main Game Controller - V1.3 with Mode Selection
const Game = {
    initialized: false,

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Space Game V1.3...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        try {
            console.log('⚙️ Starting game systems...');
            
            // Show game mode selection menu
            GameMenu.show();
            console.log('🎮 Mode selection menu displayed');
            
            this.initialized = true;
            console.log('✅ Space Game V1.3 ready!');
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage(error);
        }
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
        
        // Clear existing game state if exists
        if (window.FleetManager) FleetManager.clear();
        if (window.GameEngine && GameEngine.planets) {
            GameEngine.planets.forEach(planet => planet.destroy && planet.destroy());
            GameEngine.planets = [];
        }
        
        // Show menu again
        GameMenu.show();
    },

    // Debug and development helpers
    debug: {
        logPlanetStats() {
            if (!GameEngine.planets) return console.log('No planets initialized');
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
            if (!FleetManager.fleets) return console.log('No fleets active');
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
            const planet = GameEngine.getPlanetById && GameEngine.getPlanetById(planetId);
            if (planet && planet.owner === 'player') {
                planet.ships = Math.min(planet.capacity, planet.ships + amount);
                planet.updateVisual();
                console.log(`Added ${amount} ships to planet ${planetId}`);
            }
        },

        winGame() {
            if (!GameEngine.planets) return console.log('No game running');
            GameEngine.planets.forEach(planet => {
                if (planet.owner === 'ai') {
                    planet.owner = 'player';
                    planet.updateVisual();
                }
            });
            console.log('Debug: Player wins!');
        },

        showMenu() {
            GameMenu.show();
        },

        testModes() {
            console.log('Available modes:', Object.keys(GameMenu.modes));
            Object.entries(GameMenu.modes).forEach(([key, mode]) => {
                console.log(`${key}: ${mode.name} - ${mode.description}`);
            });
        }
    }
};

// Auto-initialize when script loads
Game.init();

// Make debug tools available in console
window.GameDebug = Game.debug;
window.Game = Game;