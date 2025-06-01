// Main Game Controller - V2.5 Modular Architecture V2.2
const Game = {
    initialized: false,
    dependencies: null,

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Starting Space Game V2.5 - Modular Architecture V2.2');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        try {
            // Ensure core dependencies are loaded
            this.waitForDependencies().then(() => {
                this.initializeArchitecture();
                this.initializeGame();
                this.setupEventListeners();
                this.initialized = true;
                console.log('✅ Game ready with modular architecture V2.2!');
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
                    typeof PerformanceManager !== 'undefined' &&
                    typeof EventSystem !== 'undefined' &&
                    typeof StateManager !== 'undefined' &&
                    typeof DependencyInjector !== 'undefined') {
                    console.log('✅ Core architecture dependencies loaded');
                    resolve();
                } else {
                    console.log('⏳ Waiting for core architecture dependencies...');
                    setTimeout(checkDependencies, 50);
                }
            };
            checkDependencies();
        });
    },

    // Initialize modular architecture systems
    initializeArchitecture() {
        console.log('🏗️ Initializing modular architecture...');
        
        // Get dependency injector reference
        this.dependencies = DependencyInjector;
        
        // Register game systems with dependency injector
        this.registerGameSystems();
        
        // Initialize state management
        this.initializeGameState();
        
        console.log('✅ Modular architecture initialized');
    },

    // Register all game systems with dependency injector
    registerGameSystems() {
        // First, ensure core dependencies are registered
        const coreModules = [
            { name: 'CONFIG', module: CONFIG },
            { name: 'Utils', module: Utils },
            { name: 'PerformanceManager', module: PerformanceManager },
            { name: 'EventSystem', module: EventSystem },
            { name: 'StateManager', module: StateManager }
        ];
        
        coreModules.forEach(({ name, module }) => {
            if (typeof module !== 'undefined') {
                this.dependencies.register(name, module, {
                    singleton: true,
                    lazy: false
                });
                console.log(`📦 Registered core module: ${name}`);
            } else {
                console.warn(`⚠️ Core module '${name}' not available`);
            }
        });
        
        // Then register game systems
        const systems = [
            { name: 'ResourceManager', module: ResourceManager },
            { name: 'Buildings', module: Buildings },
            { name: 'BuildingManager', module: BuildingManager },
            { name: 'AI', module: AI },
            { name: 'GameEngine', module: GameEngine },
            { name: 'InputManager', module: InputManager },
            { name: 'UI', module: UI },
            { name: 'ResourceUI', module: ResourceUI },
            { name: 'BuildingUI', module: BuildingUI },
            { name: 'Animations', module: Animations },
            { name: 'UIFeedback', module: UIFeedback }
        ];
        
        systems.forEach(({ name, module }) => {
            if (typeof module !== 'undefined') {
                this.dependencies.register(name, module, {
                    singleton: true,
                    lazy: false
                });
                console.log(`📦 Registered game system: ${name}`);
            } else {
                console.warn(`⚠️ Game system '${name}' not available`);
            }
        });
        
        console.log('📦 All game systems registered with dependency injector');
    },

    // Initialize game state
    initializeGameState() {
        // Set initial game state
        StateManager.update({
            'game.status': 'initializing',
            'game.mode': 'classic',
            'game.startTime': performance.now(),
            'game.difficulty': 'normal'
        });
        
        // Watch for game state changes
        StateManager.watch('game.status', (newStatus, oldStatus) => {
            console.log(`🎮 Game status changed: ${oldStatus} → ${newStatus}`);
            
            if (newStatus === 'playing') {
                this.onGameStart();
            } else if (newStatus === 'ended') {
                this.onGameEnd();
            }
        });
        
        console.log('🗃️ Game state initialized');
    },

    // Setup event listeners for modular communication
    setupEventListeners() {
        // Listen for system events
        EventSystem.on(EventSystem.EVENTS.SYSTEM_ERROR, (event) => {
            console.error('🚨 System error:', event.data);
        });
        
        EventSystem.on(EventSystem.EVENTS.GAME_END, (event) => {
            StateManager.set('game.status', 'ended');
            StateManager.set('game.endTime', performance.now());
            StateManager.set('game.winner', event.data.winner);
        });
        
        EventSystem.on(EventSystem.EVENTS.PLANET_CONQUERED, (event) => {
            this.onPlanetConquered(event.data);
        });
        
        console.log('📡 Event listeners setup complete');
    },

    // Initialize game systems
    initializeGame() {
        console.log('⚙️ Starting modular game systems...');
        
        // Initialize balance configuration
        if (typeof BalanceConfig !== 'undefined') {
            BalanceConfig.init();
            console.log('⚖️ Balance configuration initialized');
        }
        
        // Initialize systems through dependency injector
        const systemsToInit = [
            'ResourceManager',
            'Buildings', 
            'BuildingManager',
            'InputManager',
            'AI',
            'UI',
            'ResourceUI',
            'BuildingUI',
            'Animations',
            'UIFeedback'
        ];
        
        systemsToInit.forEach(systemName => {
            try {
                const system = this.dependencies.get(systemName);
                if (system && system.init) {
                    // Auto-wire dependencies
                    this.dependencies.autoWire(system);
                    system.init();
                    console.log(`✅ ${systemName} initialized`);
                }
            } catch (error) {
                console.error(`❌ Failed to initialize ${systemName}:`, error);
            }
        });
        
        // Initialize game engine last
        try {
            const gameEngine = this.dependencies.get('GameEngine');
            if (gameEngine) {
                this.dependencies.autoWire(gameEngine);
                gameEngine.init();
                console.log('✅ Game engine initialized');
                
                // Update state to playing
                StateManager.set('game.status', 'playing');
            }
        } catch (error) {
            console.error('❌ Failed to initialize GameEngine:', error);
        }
        
        this.showWelcomeMessage();
    },

    // Game start handler
    onGameStart() {
        console.log('🎮 Game started!');
        
        // Emit game start event
        EventSystem.emit(EventSystem.EVENTS.GAME_START, {
            startTime: StateManager.get('game.startTime'),
            mode: StateManager.get('game.mode')
        });
    },

    // Game end handler
    onGameEnd() {
        const winner = StateManager.get('game.winner');
        const duration = StateManager.getGameDuration();
        
        console.log(`🏁 Game ended! Winner: ${winner}, Duration: ${duration.toFixed(1)}s`);
        
        // Show victory screen through UI
        const ui = this.dependencies.get('UI');
        if (ui && ui.showVictoryScreen) {
            ui.showVictoryScreen(winner, 'Conquest Victory', duration);
        }
    },

    // Planet conquered handler
    onPlanetConquered(data) {
        const { planet, newOwner, oldOwner } = data;
        
        // Update state
        const playerPlanets = StateManager.get('player.planets') || [];
        const aiPlanets = StateManager.get('ai.planets') || [];
        
        if (newOwner === 'player') {
            playerPlanets.push(planet.id);
            const aiIndex = aiPlanets.indexOf(planet.id);
            if (aiIndex !== -1) aiPlanets.splice(aiIndex, 1);
        } else if (newOwner === 'ai') {
            aiPlanets.push(planet.id);
            const playerIndex = playerPlanets.indexOf(planet.id);
            if (playerIndex !== -1) playerPlanets.splice(playerIndex, 1);
        }
        
        StateManager.update({
            'player.planets': playerPlanets,
            'ai.planets': aiPlanets
        });
        
        // Show notification
        const ui = this.dependencies.get('UI');
        if (ui && ui.showPlanetConquered) {
            ui.showPlanetConquered(planet, newOwner);
        }
    },

    showWelcomeMessage() {
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.createTimer(() => {
                EventSystem.emit(EventSystem.EVENTS.UI_NOTIFICATION, {
                    message: '🚀 ¡Sistema de Energía como Combustible activado! Research Labs son críticos',
                    type: 'info',
                    duration: 4000
                });
            }, 500);

            PerformanceManager.createTimer(() => {
                EventSystem.emit(EventSystem.EVENTS.UI_NOTIFICATION, {
                    message: '⚡ Cada movimiento cuesta energía. Click derecho en planetas VERDES para construir',
                    type: 'info', 
                    duration: 4000
                });
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
        console.log('🔄 Restarting game with modular architecture...');
        
        // Emit restart event
        EventSystem.emit(EventSystem.EVENTS.GAME_RESTART);
        
        // Reset state
        StateManager.reset();
        
        // Reset dependency injector
        this.dependencies.reset();
        
        // Clean up all systems through dependency injector
        this.dependencies.cleanup();
        
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

// Enhanced debug utilities for modular architecture
window.debugGame = {
    restart: () => Game.restart(),
    
    state: () => StateManager.debugState(),
    
    events: () => EventSystem.debugListeners(),
    
    dependencies: () => DependencyInjector.debugDependencies(),
    
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
            'EventSystem': typeof EventSystem !== 'undefined',
            'StateManager': typeof StateManager !== 'undefined',
            'DependencyInjector': typeof DependencyInjector !== 'undefined',
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
    },
    
    // New modular architecture debug commands
    architecture: () => {
        console.log('🏗️ Modular Architecture Status:');
        console.log('📡 Events:', EventSystem.getStats());
        console.log('🗃️ State watchers:', StateManager.watchers.size);
        console.log('🔌 Dependencies:', DependencyInjector.getDependencyGraph());
    },
    
    // Code quality metrics
    codeQuality: () => {
        console.log('📊 Code Quality Metrics:');
        console.log('- Modules loaded:', Object.keys(window).filter(k => k.match(/^[A-Z]/)).length);
        console.log('- Event listeners:', EventSystem.getStats().totalListeners);
        console.log('- State watchers:', StateManager.watchers.size);
        console.log('- Dependencies:', DependencyInjector.dependencies.size);
        console.log('- Performance timers:', typeof PerformanceManager !== 'undefined' ? PerformanceManager.pools.timers.size : 'N/A');
        console.log('- Active animations:', typeof Animations !== 'undefined' ? Animations.activeAnimations.size : 'N/A');
    }
};