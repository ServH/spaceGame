// Game Engine - Core Game Loop and State Management V2.4
const GameEngine = {
    planets: [],
    fleets: [],
    gameState: 'menu', // 'menu', 'playing', 'paused', 'ended'
    gameStartTime: 0,
    lastUpdate: 0,
    animationFrame: null,
    isInitialized: false,
    
    init() {
        if (this.isInitialized) {
            console.warn('⚠️ GameEngine already initialized');
            return;
        }
        
        console.log('🎮 GameEngine V2.4 initializing...');
        
        // Initialize subsystems
        this.initializeSystems();
        
        // Generate game world
        this.generatePlanets();
        
        // Set up initial state
        this.setupInitialState();
        
        // Start game loop
        this.startGameLoop();
        
        this.isInitialized = true;
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        
        console.log('✅ GameEngine initialized successfully');
    },

    initializeSystems() {
        // Initialize core systems in order
        if (typeof ResourceManager !== 'undefined') ResourceManager.init();
        if (typeof BuildingManager !== 'undefined') BuildingManager.init();
        if (typeof InputManager !== 'undefined') InputManager.init();
        if (typeof AI !== 'undefined') AI.init();
        if (typeof UI !== 'undefined') UI.init();
    },

    generatePlanets() {
        this.planets = [];
        const canvas = document.getElementById('gameCanvas');
        
        for (let i = 0; i < CONFIG.PLANETS.COUNT; i++) {
            let planet;
            let attempts = 0;
            
            do {
                planet = this.createRandomPlanet(i);
                attempts++;
            } while (!this.isValidPlanetPosition(planet) && attempts < 50);
            
            if (attempts < 50) {
                this.planets.push(planet);
                planet.createElement(canvas);
            }
        }
        
        // Initialize keyboard assignments
        CONFIG.initKeyboardAssignments(this.planets);
        
        console.log(`🌍 Generated ${this.planets.length} planets`);
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

    startGameLoop() {
        this.lastUpdate = Date.now();
        this.gameLoop();
    },

    gameLoop() {
        if (this.gameState !== 'playing') {
            return;
        }
        
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        
        // Update systems
        this.update(deltaTime);
        
        // Check victory conditions
        this.checkVictoryConditions();
        
        this.lastUpdate = now;
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    },

    update(deltaTime) {
        // Update planets
        this.planets.forEach(planet => planet.update(deltaTime));
        
        // Update fleets
        this.fleets.forEach(fleet => fleet.update(deltaTime));
        
        // Remove completed fleets
        this.fleets = this.fleets.filter(fleet => !fleet.hasArrived);
        
        // Update AI
        if (typeof AI !== 'undefined') AI.update();
        
        // Update resources
        if (typeof ResourceManager !== 'undefined') ResourceManager.update(deltaTime);
        
        // Update UI
        if (typeof UI !== 'undefined') UI.update();
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
        }
    },

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.lastUpdate = Date.now();
            this.gameLoop();
        }
    },

    restartGame() {
        // Stop current game
        this.gameState = 'menu';
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Clean up
        this.planets.forEach(planet => planet.cleanup());
        this.planets = [];
        this.fleets = [];
        
        // Clear canvas
        const canvas = document.getElementById('gameCanvas');
        const existingPlanets = canvas.querySelectorAll('.planet');
        existingPlanets.forEach(el => el.remove());
        
        // Reset and restart
        this.isInitialized = false;
        setTimeout(() => this.init(), 100);
    },

    // Debug utilities
    getGameStats() {
        return {
            gameState: this.gameState,
            planets: this.planets.length,
            fleets: this.fleets.length,
            playerPlanets: this.getPlayerPlanets().length,
            aiPlanets: this.getAIPlanets().length,
            gameTime: this.gameStartTime ? (Date.now() - this.gameStartTime) / 1000 : 0
        };
    },

    // Cleanup
    cleanup() {
        this.gameState = 'menu';
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clean up systems
        if (typeof InputManager !== 'undefined') InputManager.cleanup();
        
        this.planets.forEach(planet => planet.cleanup());
        this.planets = [];
        this.fleets = [];
        this.isInitialized = false;
    }
};

// Debug commands
window.debugGame = {
    stats: () => console.table(GameEngine.getGameStats()),
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