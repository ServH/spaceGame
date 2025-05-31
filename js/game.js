// Main Game Controller - V1.4 Classic Evolution Mode + Energy Fuel System
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
            // Ensure CONFIG is loaded before continuing
            this.waitForDependencies().then(() => {
                this.initializeGame();
                this.initialized = true;
                console.log('✅ Game ready in Classic Evolution mode with Energy Fuel System!');
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage(error);
        }
    },

    // Wait for critical dependencies to be available
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (typeof CONFIG !== 'undefined' && 
                    typeof Utils !== 'undefined') {
                    console.log('✅ Core dependencies loaded');
                    resolve();
                } else {
                    console.log('⏳ Waiting for core dependencies...');
                    setTimeout(checkDependencies, 50);
                }
            };
            checkDependencies();
        });
    },

    // Initialize game systems for classic evolution mode
    initializeGame() {
        console.log('⚙️ Starting Classic Evolution game systems...');
        
        // Initialize balance configuration for classic mode (only once)
        if (typeof BalanceConfig !== 'undefined' && !BalanceConfig.appliedSettings) {
            BalanceConfig.init();
            console.log('⚖️ Balance configuration initialized');
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
        
        // Initialize input system - CRITICAL FIX
        if (typeof InputManager !== 'undefined') {
            InputManager.init();
            console.log('🎮 Input system initialized');
        }
        
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
        this.addEnergySystemHelp();
    },

    showWelcomeMessage() {
        setTimeout(() => {
            if (typeof UI !== 'undefined' && UI.setStatus) {
                UI.setStatus('🚀 ¡Sistema de Energía como Combustible activado! Research Labs generan energía crítica', 4000);
            }
        }, 500);

        setTimeout(() => {
            if (typeof UI !== 'undefined' && UI.setStatus) {
                UI.setStatus('⚡ Cada movimiento cuesta energía. Click derecho en planetas VERDES para construir', 4000);
            }
        }, 5000);
    },

    // Add energy system specific help
    addEnergySystemHelp() {
        console.log('⚡ Energy Fuel System Active - Key Points:');
        console.log('  • Ship movement costs energy based on distance');
        console.log('  • Research Labs generate +6 energy/min (CRITICAL)');
        console.log('  • Hover planets to see movement costs');
        console.log('  • Energy formula: (1.5 × ships) + (distance × ships × 0.005)');
        
        // Add help panel
        const helpPanel = document.createElement('div');
        helpPanel.id = 'energyHelp';
        helpPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ffaa00;
            border-radius: 8px;
            padding: 10px;
            color: #ffaa00;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            max-width: 250px;
            z-index: 1500;
            cursor: pointer;
        `;
        helpPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">⚡ ENERGY FUEL SYSTEM</div>
            <div>• Movement costs energy</div>
            <div>• Research Labs = +6 energy/min</div>
            <div>• Distance increases cost</div>
            <div>• Hover planets for cost info</div>
            <div style="margin-top: 5px; font-size: 9px; opacity: 0.8;">Click to hide</div>
        `;
        
        helpPanel.addEventListener('click', () => {
            helpPanel.style.display = 'none';
        });
        
        document.body.appendChild(helpPanel);
        
        // Auto-hide after 15 seconds
        setTimeout(() => {
            if (helpPanel.style.display !== 'none') {
                helpPanel.style.opacity = '0.3';
            }
        }, 15000);
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
                UI.setStatus(`¡${building.name} completado! ${buildingId === 'research_lab' ? '+6 energía/min' : ''}`, 3000);
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
                console.log('- debugBuildings.energy() - Energy system info');
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
                        Buildings: p.buildings ? Object.keys(p.buildings).length : 0,
                        EnergyBonus: p.energyGenerationBonus || 0
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
                    const rates = ResourceManager.getGenerationRates();
                    console.log(`Metal Generation: ${rates.metal.toFixed(1)}/min`);
                    console.log(`Energy Generation: ${rates.energy.toFixed(1)}/min`);
                } else {
                    console.log('❌ ResourceManager not loaded');
                }
            },

            energy: () => {
                console.log('⚡ Energy Fuel System Status:');
                console.log('Formula: (1.5 × ships) + (distance × ships × 0.005)');
                if (typeof CONFIG !== 'undefined') {
                    console.log('Base cost per ship:', CONFIG.SHIP_COST.energy.base);
                    console.log('Distance multiplier:', CONFIG.SHIP_COST.energy.distanceMultiplier);
                }
                
                // Example calculations
                console.log('\nExample costs:');
                console.log('10 ships, 100px distance:', CONFIG?.calculateMovementCost ? CONFIG.calculateMovementCost(10, 100) : 'N/A');
                console.log('20 ships, 200px distance:', CONFIG?.calculateMovementCost ? CONFIG.calculateMovementCost(20, 200) : 'N/A');
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
            <p style="font-size: 12px;">Verifica que todos los archivos estén cargados correctamente</p>
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
        
        // Clear resource state
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.reset();
        }
        
        // Clear input state
        if (typeof InputManager !== 'undefined') {
            InputManager.cleanup();
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