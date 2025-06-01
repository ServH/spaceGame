// Main Game Controller - V2.5 Performance Optimized
const Game = {
    initialized: false,

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Starting Space Game V2.5 - Modular Architecture');
        
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
                console.log('✅ Game ready with modular architecture!');
            });
            
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            this.showErrorMessage(error);
        }
    },

    // Wait for critical dependencies to be available
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (typeof CONFIG !== 'undefined' && 
                    typeof Utils !== 'undefined' &&
                    typeof PerformanceManager !== 'undefined') {
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

    // Initialize game systems
    initializeGame() {
        console.log('⚙️ Starting modular game systems...');
        
        // Initialize balance configuration
        if (typeof BalanceConfig !== 'undefined') {
            BalanceConfig.init();
            console.log('⚖️ Balance configuration initialized');
        }
        
        // Initialize performance manager first
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.init();
            console.log('⚡ Performance Manager initialized');
        }
        
        // Initialize core systems
        const systems = [
            { name: 'ResourceManager', module: ResourceManager },
            { name: 'Buildings', module: Buildings },
            { name: 'BuildingManager', module: BuildingManager },
            { name: 'InputManager', module: InputManager },
            { name: 'AI', module: AI },
            { name: 'UI', module: UI },
            { name: 'ResourceUI', module: ResourceUI },
            { name: 'BuildingUI', module: BuildingUI }
        ];
        
        systems.forEach(({ name, module }) => {
            try {
                if (typeof module !== 'undefined' && module.init) {
                    module.init();
                    console.log(`✅ ${name} initialized`);
                }
            } catch (error) {
                console.error(`❌ Failed to initialize ${name}:`, error);
            }
        });
        
        // Initialize game engine last
        if (typeof GameEngine !== 'undefined') {
            GameEngine.init();
            console.log('✅ Game engine initialized');
        }
        
        this.showWelcomeMessage();
    },

    showWelcomeMessage() {
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.createTimer(() => {
                if (typeof UI !== 'undefined' && UI.setStatus) {
                    UI.setStatus('🚀 ¡Sistema de Energía como Combustible activado! Research Labs son críticos', 4000);
                }
            }, 500);

            PerformanceManager.createTimer(() => {
                if (typeof UI !== 'undefined' && UI.setStatus) {
                    UI.setStatus('⚡ Cada movimiento cuesta energía. Click derecho en planetas VERDES para construir', 4000);
                }
            }, 5000);
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
            font-family: 'Courier New', monospace;
            max-width: 400px;
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
        console.log('🔄 Restarting game...');
        
        // Clean up systems
        const systems = [GameEngine, FleetManager, BuildingManager, ResourceManager, InputManager];
        systems.forEach(system => {
            if (typeof system !== 'undefined' && system.cleanup) {
                system.cleanup();
            } else if (typeof system !== 'undefined' && system.reset) {
                system.reset();
            }
        });
        
        // Clean up performance manager
        if (typeof PerformanceManager !== 'undefined' && PerformanceManager.cleanup) {
            PerformanceManager.cleanup();
        }
        
        // Restart
        this.initialized = false;
        
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.createTimer(() => this.init(), 100);
        } else {
            setTimeout(() => this.init(), 100);
        }
    }
};

// Auto-initialize when script loads
Game.init();

// Make available globally
window.Game = Game;

// Debug utilities
window.debugGame = {
    restart: () => Game.restart(),
    
    performance: () => {
        if (typeof PerformanceManager !== 'undefined') {
            console.table(PerformanceManager.getStats());
        }
    },
    
    systems: () => {
        const systems = {
            'CONFIG': typeof CONFIG !== 'undefined',
            'BalanceConfig': typeof BalanceConfig !== 'undefined',
            'Utils': typeof Utils !== 'undefined',
            'PerformanceManager': typeof PerformanceManager !== 'undefined',
            'GameEngine': typeof GameEngine !== 'undefined',
            'ResourceManager': typeof ResourceManager !== 'undefined',
            'Buildings': typeof Buildings !== 'undefined',
            'BuildingManager': typeof BuildingManager !== 'undefined',
            'AI': typeof AI !== 'undefined',
            'Planet': typeof Planet !== 'undefined',
            'Fleet': typeof Fleet !== 'undefined',
            'InputManager': typeof InputManager !== 'undefined',
            'UI': typeof UI !== 'undefined',
            'ResourceUI': typeof ResourceUI !== 'undefined',
            'BuildingUI': typeof BuildingUI !== 'undefined'
        };
        
        console.log('🔍 System Status:');
        Object.entries(systems).forEach(([name, loaded]) => {
            console.log(`  ${name}: ${loaded ? '✅' : '❌'}`);
        });
    }
};