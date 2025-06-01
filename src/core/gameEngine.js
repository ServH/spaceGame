// Game Engine - Optimized Core Game Loop V3.0
const GameEngine = {
    planets: [],
    fleets: [],
    gameState: 'menu', // 'menu', 'playing', 'paused', 'ended'
    gameStartTime: 0,
    lastUpdate: 0,
    animationFrame: null,
    isInitialized: false,
    
    // Performance optimization flags
    updateFrequency: {
        ui: 100,        // Update UI every 100ms
        ai: 500,        // Update AI every 500ms  
        resources: 1000, // Update resources every 1s
        physics: 16     // Update physics at 60fps
    },
    lastUpdateTimes: {
        ui: 0,
        ai: 0,
        resources: 0,
        physics: 0
    },
    
    init() {
        if (this.isInitialized) {
            console.warn('⚠️ GameEngine already initialized');
            return;
        }
        
        console.log('🎮 GameEngine V3.0 initializing with performance optimizations...');
        
        // Initialize performance manager first
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.init();
            PerformanceManager.centralizeEventListeners();
        }
        
        // Initialize subsystems
        this.initializeSystems();
        
        // Generate game world
        this.generatePlanets();
        
        // Set up initial state
        this.setupInitialState();
        
        // Start optimized game loop
        this.startOptimizedGameLoop();
        
        this.isInitialized = true;
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        
        console.log('✅ GameEngine V3.0 initialized with performance optimizations');
    },

    initializeSystems() {
        // Initialize core systems in order with error handling
        const systems = [
            { name: 'ResourceManager', module: ResourceManager },
            { name: 'BuildingManager', module: BuildingManager },
            { name: 'InputManager', module: InputManager },
            { name: 'AI', module: AI },
            { name: 'UI', module: UI }
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
    },

    generatePlanets() {
        this.planets = [];
        const canvas = document.getElementById('gameCanvas');
        
        // Batch planet generation for better performance
        const planetsToGenerate = [];
        
        for (let i = 0; i < CONFIG.PLANETS.COUNT; i++) {
            let planet;
            let attempts = 0;
            
            do {
                planet = this.createRandomPlanet(i);
                attempts++;
            } while (!this.isValidPlanetPosition(planet) && attempts < 50);
            
            if (attempts < 50) {
                planetsToGenerate.push(planet);
            }
        }
        
        // Batch DOM operations
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.queueAnimation(() => {
                planetsToGenerate.forEach(planet => {
                    this.planets.push(planet);
                    planet.createElement(canvas);
                });
                
                // Initialize keyboard assignments after all planets created
                CONFIG.initKeyboardAssignments(this.planets);
                console.log(`🌍 Generated ${this.planets.length} planets with batched DOM updates`);
            });
        } else {
            // Fallback without performance manager
            planetsToGenerate.forEach(planet => {
                this.planets.push(planet);
                planet.createElement(canvas);
            });
            CONFIG.initKeyboardAssignments(this.planets);
            console.log(`🌍 Generated ${this.planets.length} planets`);
        }
    },

    createRandomPlanet(id) {
        const margin = 60;
        const x = margin + Math.random() * (CONFIG.CANVAS.WIDTH - 2 * margin);
        const y = margin + Math.random() * (CONFIG.CANVAS.HEIGHT - 2 * margin);
        const radius = CONFIG.PLANETS.RADIUS_MIN + 
                      Math.random() * (CONFIG.PLANETS.RADIUS_MAX - CONFIG.PLANETS.RADIUS_MIN);
        
        return new Planet(id, x, y, radius);
    },

    isValidPlanetPosition(newPlanet) {
        return this.planets.every(existingPlanet => {
            const distance = Utils.distance(newPlanet, existingPlanet);
            return distance >= CONFIG.PLANETS.MIN_DISTANCE;
        });
    },

    setupInitialState() {
        if (this.planets.length < 2) {
            console.error('❌ Not enough planets generated');
            return;
        }
        
        // Player gets first planet
        const playerPlanet = this.planets[0];
        playerPlanet.setOwner('player');
        playerPlanet.ships = BalanceConfig.BASE.START_SHIPS;
        
        // AI gets last planet
        const aiPlanet = this.planets[this.planets.length - 1];
        aiPlanet.setOwner('ai');
        aiPlanet.ships = BalanceConfig.BASE.START_SHIPS;
        
        // Initialize resources
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.setPlayerResources(
                BalanceConfig.BASE.START_METAL, 
                BalanceConfig.BASE.START_ENERGY
            );
        }
        
        console.log('🏁 Initial game state set up');
    },

    // 🎯 OPTIMIZED GAME LOOP
    startOptimizedGameLoop() {
        this.lastUpdate = Date.now();
        
        // Initialize update times
        const now = Date.now();
        Object.keys(this.lastUpdateTimes).forEach(key => {
            this.lastUpdateTimes[key] = now;
        });
        
        this.optimizedGameLoop();
    },

    optimizedGameLoop() {
        if (this.gameState !== 'playing') {
            return;
        }
        
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        
        // Selective updates based on frequency
        this.selectiveUpdate(now, deltaTime);
        
        // Check victory conditions (less frequently)
        if (now - this.lastUpdateTimes.ui > this.updateFrequency.ui) {
            this.checkVictoryConditions();
        }
        
        this.lastUpdate = now;
        this.animationFrame = requestAnimationFrame(() => this.optimizedGameLoop());
    },

    selectiveUpdate(now, deltaTime) {
        // Always update physics (fleets, animations) at 60fps
        if (now - this.lastUpdateTimes.physics >= this.updateFrequency.physics) {
            this.updatePhysics(deltaTime);
            this.lastUpdateTimes.physics = now;
        }
        
        // Update UI less frequently
        if (now - this.lastUpdateTimes.ui >= this.updateFrequency.ui) {
            this.updateUI();
            this.lastUpdateTimes.ui = now;
        }
        
        // Update AI even less frequently
        if (now - this.lastUpdateTimes.ai >= this.updateFrequency.ai) {
            this.updateAI();
            this.lastUpdateTimes.ai = now;
        }
        
        // Update resources least frequently
        if (now - this.lastUpdateTimes.resources >= this.updateFrequency.resources) {
            this.updateResources(deltaTime);
            this.lastUpdateTimes.resources = now;
        }
    },

    updatePhysics(deltaTime) {
        // Update planets (ship generation, visual effects)
        this.planets.forEach(planet => {
            if (planet.update) planet.update(deltaTime);
        });
        
        // Update fleets (movement, collision)
        this.fleets.forEach(fleet => {
            if (fleet.update) fleet.update(deltaTime);
        });
        
        // Remove completed fleets
        this.fleets = this.fleets.filter(fleet => !fleet.hasArrived);
    },

    updateUI() {
        if (typeof UI !== 'undefined' && UI.update) {
            UI.update();
        }
    },

    updateAI() {
        if (typeof AI !== 'undefined' && AI.update) {
            AI.update();
        }
    },

    updateResources(deltaTime) {
        if (typeof ResourceManager !== 'undefined' && ResourceManager.update) {
            ResourceManager.update(deltaTime);
        }
    },

    checkVictoryConditions() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player').length;
        const aiPlanets = this.planets.filter(p => p.owner === 'ai').length;
        const totalPlanets = this.planets.length;
        
        const victory = BalanceConfig.checkVictoryConditions(
            playerPlanets, aiPlanets, totalPlanets, 0, 0
        );
        
        if (victory) {
            this.endGame(victory.winner, victory.condition);
        }
    },

    endGame(winner, condition) {
        this.gameState = 'ended';
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const duration = (Date.now() - this.gameStartTime) / 1000;
        
        console.log(`🏆 Game ended: ${winner} wins by ${condition} in ${duration.toFixed(1)}s`);
        
        // Show victory screen
        if (typeof UI !== 'undefined') {
            UI.showVictoryScreen(winner, condition, duration);
        }
    },

    // Fleet management with pooling
    addFleet(fleet) {
        this.fleets.push(fleet);
    },

    removeFleet(fleet) {
        const index = this.fleets.indexOf(fleet);
        if (index > -1) {
            this.fleets.splice(index, 1);
            
            // Return fleet to pool if available
            if (typeof PerformanceManager !== 'undefined') {
                PerformanceManager.returnToPool('fleets', fleet);
            }
        }
    },

    // Planet utilities with caching
    getPlanetById(id) {
        // Use cached lookup for better performance
        if (!this.planetCache) {
            this.planetCache = new Map();
            this.planets.forEach(planet => {
                this.planetCache.set(planet.id, planet);
            });
        }
        
        return this.planetCache.get(id);
    },

    getPlanetByKey(key) {
        const planetId = CONFIG.KEYBOARD.assignments[key.toLowerCase()];
        return this.getPlanetById(planetId);
    },

    getPlayerPlanets() {
        return this.planets.filter(p => p.owner === 'player');
    },

    getAIPlanets() {
        return this.planets.filter(p => p.owner === 'ai');
    },

    getNeutralPlanets() {
        return this.planets.filter(p => p.owner === 'neutral');
    },

    // Game control
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            console.log('⏸️ Game paused');
        }
    },

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.lastUpdate = Date.now();
            this.optimizedGameLoop();
            console.log('▶️ Game resumed');
        }
    },

    restartGame() {
        // Stop current game
        this.gameState = 'menu';
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Clean up with performance manager
        this.performCleanup();
        
        // Reset and restart
        this.isInitialized = false;
        
        // Use performance manager timer for safer restart
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.createTimer(() => this.init(), 100);
        } else {
            setTimeout(() => this.init(), 100);
        }
        
        console.log('🔄 Game restarting...');
    },

    // 🎯 OPTIMIZED CLEANUP
    performCleanup() {
        // Clear planet cache
        if (this.planetCache) {
            this.planetCache.clear();
            this.planetCache = null;
        }
        
        // Clean up planets
        this.planets.forEach(planet => {
            if (planet.cleanup) planet.cleanup();
        });
        this.planets = [];
        
        // Clean up fleets
        this.fleets.forEach(fleet => {
            if (fleet.cleanup) fleet.cleanup();
        });
        this.fleets = [];
        
        // Clear canvas efficiently
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            // Use performance manager for batched DOM cleanup
            if (typeof PerformanceManager !== 'undefined') {
                PerformanceManager.queueAnimation(() => {
                    const existingPlanets = canvas.querySelectorAll('.planet, .fleet, line[stroke-dasharray]');
                    existingPlanets.forEach(el => el.remove());
                });
            } else {
                const existingPlanets = canvas.querySelectorAll('.planet, .fleet, line[stroke-dasharray]');
                existingPlanets.forEach(el => el.remove());
            }
        }
        
        console.log('🧹 GameEngine cleanup completed');
    },

    // 🎯 PERFORMANCE MONITORING
    getPerformanceStats() {
        const stats = {
            gameState: this.gameState,
            planets: this.planets.length,
            fleets: this.fleets.length,
            playerPlanets: this.getPlayerPlanets().length,
            aiPlanets: this.getAIPlanets().length,
            gameTime: this.gameStartTime ? (Date.now() - this.gameStartTime) / 1000 : 0,
            updateFrequencies: this.updateFrequency
        };
        
        // Add performance manager stats if available
        if (typeof PerformanceManager !== 'undefined') {
            const perfStats = PerformanceManager.getStats();
            stats.fps = perfStats.fps;
            stats.memory = perfStats.memory;
        }
        
        return stats;
    },

    // Adaptive performance adjustment
    adjustPerformance() {
        if (typeof PerformanceManager !== 'undefined') {
            const stats = PerformanceManager.getStats();
            
            // Reduce update frequencies if FPS is low
            if (stats.fps < 30) {
                this.updateFrequency.ui = 200;
                this.updateFrequency.ai = 1000;
                this.updateFrequency.resources = 2000;
                console.log('⚡ Reduced update frequencies due to low FPS');
            }
            
            // Restore normal frequencies if FPS improves
            if (stats.fps > 50) {
                this.updateFrequency.ui = 100;
                this.updateFrequency.ai = 500;
                this.updateFrequency.resources = 1000;
            }
        }
    },

    // Debug utilities
    getGameStats() {
        return this.getPerformanceStats();
    },

    // Complete cleanup
    cleanup() {
        this.gameState = 'menu';
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clean up systems
        if (typeof InputManager !== 'undefined' && InputManager.cleanup) {
            InputManager.cleanup();
        }
        
        if (typeof PerformanceManager !== 'undefined' && PerformanceManager.cleanup) {
            PerformanceManager.cleanup();
        }
        
        this.performCleanup();
        this.isInitialized = false;
        
        console.log('🧹 Complete GameEngine cleanup finished');
    }
};

// Enhanced debug commands with performance monitoring
window.debugGamePerf = {
    stats: () => console.table(GameEngine.getPerformanceStats()),
    
    restart: () => GameEngine.restartGame(),
    
    pause: () => GameEngine.pauseGame(),
    
    resume: () => GameEngine.resumeGame(),
    
    performance: () => {
        if (typeof PerformanceManager !== 'undefined') {
            console.table(PerformanceManager.getStats());
        } else {
            console.log('PerformanceManager not available');
        }
    },
    
    adjustPerf: () => {
        GameEngine.adjustPerformance();
        console.log('Performance adjusted based on current FPS');
    },
    
    planets: () => {
        console.log('🌍 Planets:');
        GameEngine.planets.forEach(p => {
            console.log(`  ${p.id}: ${p.owner} (${p.ships} ships, key: ${p.assignedKey})`);
        });
    },
    
    monitor: () => {
        if (typeof debugPerformance !== 'undefined') {
            debugPerformance.startMonitor();
        }
    },
    
    benchmark: () => {
        console.log('🏃 Running GameEngine benchmark...');
        const start = performance.now();
        
        // Simulate game operations
        for (let i = 0; i < 1000; i++) {
            GameEngine.selectiveUpdate(Date.now(), 16);
        }
        
        const duration = performance.now() - start;
        console.log(`⏱️ GameEngine benchmark: ${duration.toFixed(2)}ms for 1000 updates`);
        
        return duration;
    }
};