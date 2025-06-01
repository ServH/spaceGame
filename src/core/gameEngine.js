// Game Engine - FIXED Planet Generation and Keyboard Assignment
const GameEngine = {
    planets: [],
    fleets: [],
    gameState: 'menu',
    gameStartTime: 0,
    lastUpdate: 0,
    animationFrame: null,
    isInitialized: false,
    
    updateFrequency: {
        ui: 100,
        ai: 500,
        resources: 1000,
        physics: 16
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
        
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.init();
            PerformanceManager.centralizeEventListeners();
        }
        
        this.initializeSystems();
        this.generatePlanets();
        this.setupInitialState();
        this.startOptimizedGameLoop();
        
        this.isInitialized = true;
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        
        console.log('✅ GameEngine V3.0 initialized with performance optimizations');
    },

    initializeSystems() {
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
        const planetsToGenerate = [];
        const margin = 60;
        
        // Generate planets with proper distribution
        for (let i = 0; i < CONFIG.PLANETS.COUNT; i++) {
            let planet;
            let attempts = 0;
            let validPosition = false;
            
            while (!validPosition && attempts < 100) {
                const x = margin + Math.random() * (CONFIG.CANVAS.WIDTH - 2 * margin);
                const y = margin + Math.random() * (CONFIG.CANVAS.HEIGHT - 2 * margin);
                const capacity = CONFIG.PLANETS.BASE_CAPACITY + Math.random() * 20;
                
                planet = new Planet(x, y, capacity, i);
                
                // Check distance from existing planets
                validPosition = planetsToGenerate.every(existingPlanet => {
                    const distance = Utils.distance(planet, existingPlanet);
                    return distance >= CONFIG.PLANETS.MIN_DISTANCE;
                });
                
                attempts++;
            }
            
            if (validPosition) {
                planetsToGenerate.push(planet);
            }
        }
        
        // Add all valid planets to game
        this.planets = planetsToGenerate;
        
        // CRITICAL: Initialize keyboard assignments AFTER planets are created
        setTimeout(() => {
            CONFIG.initKeyboardAssignments(this.planets);
            
            // Ensure planet elements show assigned keys
            this.planets.forEach(planet => {
                if (planet.assignedKey && planet.keyElement) {
                    planet.keyElement.textContent = planet.assignedKey.toUpperCase();
                }
            });
        }, 100);
        
        console.log(`🌍 Generated ${this.planets.length} planets with proper distribution`);
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

    startOptimizedGameLoop() {
        this.lastUpdate = Date.now();
        
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
        
        this.selectiveUpdate(now, deltaTime);
        
        if (now - this.lastUpdateTimes.ui > this.updateFrequency.ui) {
            this.checkVictoryConditions();
        }
        
        this.lastUpdate = now;
        this.animationFrame = requestAnimationFrame(() => this.optimizedGameLoop());
    },

    selectiveUpdate(now, deltaTime) {
        if (now - this.lastUpdateTimes.physics >= this.updateFrequency.physics) {
            this.updatePhysics(deltaTime);
            this.lastUpdateTimes.physics = now;
        }
        
        if (now - this.lastUpdateTimes.ui >= this.updateFrequency.ui) {
            this.updateUI();
            this.lastUpdateTimes.ui = now;
        }
        
        if (now - this.lastUpdateTimes.ai >= this.updateFrequency.ai) {
            this.updateAI();
            this.lastUpdateTimes.ai = now;
        }
        
        if (now - this.lastUpdateTimes.resources >= this.updateFrequency.resources) {
            this.updateResources(deltaTime);
            this.lastUpdateTimes.resources = now;
        }
    },

    updatePhysics(deltaTime) {
        this.planets.forEach(planet => {
            if (planet.update) planet.update(deltaTime);
        });
        
        this.fleets.forEach(fleet => {
            if (fleet.update) fleet.update(deltaTime);
        });
        
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
        
        if (typeof UI !== 'undefined') {
            UI.showVictoryScreen(winner, condition, duration);
        }
    },

    // Fleet management
    addFleet(fleet) {
        this.fleets.push(fleet);
    },

    removeFleet(fleet) {
        const index = this.fleets.indexOf(fleet);
        if (index > -1) {
            this.fleets.splice(index, 1);
        }
    },

    // Planet utilities
    getPlanetById(id) {
        return this.planets.find(planet => planet.id === id);
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
        this.gameState = 'menu';
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.performCleanup();
        this.isInitialized = false;
        
        setTimeout(() => this.init(), 100);
        console.log('🔄 Game restarting...');
    },

    performCleanup() {
        this.planets.forEach(planet => {
            if (planet.cleanup) planet.cleanup();
        });
        this.planets = [];
        
        this.fleets.forEach(fleet => {
            if (fleet.cleanup) fleet.cleanup();
        });
        this.fleets = [];
        
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const existingElements = canvas.querySelectorAll('.planet, .fleet, line[stroke-dasharray]');
            existingElements.forEach(el => el.remove());
        }
        
        console.log('🧹 GameEngine cleanup completed');
    },

    getPerformanceStats() {
        return {
            gameState: this.gameState,
            planets: this.planets.length,
            fleets: this.fleets.length,
            playerPlanets: this.getPlayerPlanets().length,
            aiPlanets: this.getAIPlanets().length,
            gameTime: this.gameStartTime ? (Date.now() - this.gameStartTime) / 1000 : 0
        };
    },

    cleanup() {
        this.gameState = 'menu';
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.performCleanup();
        this.isInitialized = false;
        
        console.log('🧹 Complete GameEngine cleanup finished');
    }
};

// Debug commands
window.debugGamePerf = {
    stats: () => console.table(GameEngine.getPerformanceStats()),
    restart: () => GameEngine.restartGame(),
    pause: () => GameEngine.pauseGame(),
    resume: () => GameEngine.resumeGame(),
    planets: () => {
        console.log('🌍 Planets:');
        GameEngine.planets.forEach(p => {
            console.log(`  ${p.id}: ${p.owner} (${p.ships} ships, key: ${p.assignedKey})`);
        });
    }
};
