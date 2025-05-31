// Main Game Controller - V1.4 Classic Evolution Mode
const Game = {
    initialized: false,

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Space Game Evolution v1.4...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        try {
            // Initialize directly in classic evolution mode
            this.initializeGame();
            
            this.initialized = true;
            console.log('✅ Game ready in Classic Evolution mode!');
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage(error);
        }
    },

    // Initialize game systems for classic evolution mode
    initializeGame() {
        console.log('⚙️ Starting Classic Evolution game systems...');
        
        // Initialize balance configuration for classic mode
        if (typeof BalanceConfig !== 'undefined') {
            BalanceConfig.init();
        }
        
        // Initialize resource system (Action 01)
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.init();
            console.log('💰 Resource system initialized');
        }
        
        // Initialize building system (Action 02) - FIXED INITIALIZATION
        if (typeof Buildings !== 'undefined') {
            console.log('🏗️ Buildings definitions loaded');
        }
        
        if (typeof BuildingManager !== 'undefined') {
            BuildingManager.init();
            console.log('🏗️ Building Manager initialized');
        }
        
        if (typeof BuildingUI !== 'undefined') {
            BuildingUI.init();
            console.log('🖥️ Building UI initialized');
        }
        
        // Initialize game engine
        GameEngine.init();
        console.log('✅ Game engine initialized');
        
        // Initialize UI extensions for classic mode
        if (typeof UIExtensions !== 'undefined') {
            UIExtensions.init();
        }
        
        // Initialize AI with building capabilities
        if (typeof AI !== 'undefined') {
            AI.enableBuildingSystem = true;
            console.log('🤖 AI building system enabled');
        }
        
        this.showWelcomeMessage();
        this.setupConstructionFeedback();
    },

    showWelcomeMessage() {
        setTimeout(() => {
            if (typeof UI !== 'undefined' && UI.setStatus) {
                UI.setStatus('¡Evolution Action 02! Click derecho en planetas VERDES para construir edificios', 4000);
            }
        }, 500);
    },

    // Setup construction feedback system for MVP testing
    setupConstructionFeedback() {
        console.log('🔧 Setting up construction feedback system...');
        
        // Create construction status panel
        const feedbackPanel = document.createElement('div');
        feedbackPanel.id = 'constructionFeedback';
        feedbackPanel.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff88;
            border-radius: 8px;
            padding: 10px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            max-width: 300px;
            z-index: 1500;
            display: none;
        `;
        document.body.appendChild(feedbackPanel);
        
        // Setup construction event listeners for feedback
        this.setupConstructionEventListeners();
        
        // Add debug commands to console
        this.addDebugCommands();
    },

    setupConstructionEventListeners() {
        // Listen for building construction events
        document.addEventListener('buildingStarted', (event) => {
            const { planet, buildingId } = event.detail;
            const building = Buildings.getDefinition(buildingId);
            
            this.showConstructionFeedback(`🏗️ Construcción iniciada: ${building.name} en Planeta ${planet.id}`);
            
            if (typeof UI !== 'undefined' && UI.setStatus) {
                UI.setStatus(`Construyendo ${building.name}...`, 2000);
            }
        });
        
        document.addEventListener('buildingCompleted', (event) => {
            const { planet, buildingId } = event.detail;
            const building = Buildings.getDefinition(buildingId);
            
            this.showConstructionFeedback(`✅ Completado: ${building.name} en Planeta ${planet.id}`, 'success');
            
            if (typeof UI !== 'undefined' && UI.setStatus) {
                UI.setStatus(`¡${building.name} completado!`, 2000);
            }
        });
        
        document.addEventListener('buildingCancelled', (event) => {
            const { planet, buildingId } = event.detail;
            const building = Buildings.getDefinition(buildingId);
            
            this.showConstructionFeedback(`❌ Cancelado: ${building.name} en Planeta ${planet.id}`, 'error');
        });
    },

    showConstructionFeedback(message, type = 'info') {
        const panel = document.getElementById('constructionFeedback');
        if (!panel) return;
        
        const color = type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#ffffff';
        
        panel.innerHTML = `<div style="color: ${color}; margin-bottom: 5px;">${message}</div>${panel.innerHTML}`;
        panel.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (panel.children.length > 0) {
                panel.removeChild(panel.lastChild);
                if (panel.children.length === 0) {
                    panel.style.display = 'none';
                }
            }
        }, 5000);
        
        // Keep only last 3 messages
        while (panel.children.length > 3) {
            panel.removeChild(panel.lastChild);
        }
    },

    addDebugCommands() {
        // Add helpful debug commands for testing
        window.debugBuildings = {
            test: () => {
                console.log('🔧 Building System Test Commands:');
                console.log('- debugBuildings.listAll() - Show all building types');
                console.log('- debugBuildings.playerPlanets() - Show player planets');
                console.log('- debugBuildings.constructions() - Show active constructions');
                console.log('- debugBuildings.resources() - Show current resources');
            },
            
            listAll: () => {
                if (typeof Buildings !== 'undefined') {
                    Buildings.debugBuildings();
                } else {
                    console.log('❌ Buildings system not loaded');
                }
            },
            
            playerPlanets: () => {
                if (GameEngine.planets) {
                    const playerPlanets = GameEngine.planets.filter(p => p.owner === 'player');
                    console.table(playerPlanets.map(p => ({
                        ID: p.id,
                        Ships: `${p.ships}/${p.capacity}`,
                        Buildings: p.buildings ? Object.keys(p.buildings).length : 0
                    })));
                }
            },
            
            constructions: () => {
                if (typeof BuildingManager !== 'undefined') {
                    BuildingManager.debugConstructions();
                } else {
                    console.log('❌ BuildingManager not loaded');
                }
            },
            
            resources: () => {
                if (typeof ResourceManager !== 'undefined') {
                    console.log('💰 Current Resources:');
                    console.log(`Metal: ${ResourceManager.getMetal()}`);
                    console.log(`Energy: ${ResourceManager.getEnergy()}`);
                } else {
                    console.log('❌ ResourceManager not loaded');
                }
            }
        };
        
        console.log('🔧 Debug commands added! Type debugBuildings.test() to see available commands');
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
            font-family: 'Courier New', monospace;
        `;
        errorDiv.innerHTML = `
            <h3>Error al inicializar el juego</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #ff4444;
                border: none;
                padding: 10px 20px;
                margin-top: 10px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Reintentar</button>
        `;
        document.body.appendChild(errorDiv);
    },

    restart() {
        console.log('🔄 Restarting Classic Evolution game...');
        
        // Clear existing game state
        if (typeof FleetManager !== 'undefined') {
            FleetManager.clear();
        }
        
        if (typeof GameEngine !== 'undefined' && GameEngine.planets) {
            GameEngine.planets.forEach(planet => planet.destroy());
            GameEngine.planets = [];
        }
        
        // Clear building state if available
        if (typeof BuildingManager !== 'undefined') {
            BuildingManager.reset();
        }
        
        // Restart
        this.initialized = false;
        this.init();
    }
};

// Auto-initialize when script loads
Game.init();

// Make available globally
window.Game = Game;