// Game Engine - FIXED Animations and Planet Distribution
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
        ai: 3000,  // AI every 3 seconds
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
        if (this.isInitialized) return;
        
        console.log('🎮 GameEngine V3.0 initializing...');
        
        this.initializeSystems();
        this.generatePlanets();
        this.setupInitialState();
        this.startGameLoop();
        
        this.isInitialized = true;
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        window.gameStartTime = this.gameStartTime; // For AI
        
        console.log('✅ GameEngine V3.0 initialized');
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

    // FIXED: Proper planet distribution
    generatePlanets() {
        this.planets = [];
        const attempts = [];
        const minDistance = CONFIG.PLANETS.MIN_DISTANCE;
        
        // Generate planet positions with proper spacing
        for (let i = 0; i < CONFIG.PLANETS.COUNT; i++) {
            let validPosition = false;
            let attempt = 0;
            let x, y, capacity;
            
            while (!validPosition && attempt < 200) {
                x = 80 + Math.random() * (CONFIG.CANVAS.WIDTH - 160);
                y = 80 + Math.random() * (CONFIG.CANVAS.HEIGHT - 160);
                capacity = CONFIG.PLANETS.BASE_CAPACITY + Math.random() * 20;
                
                validPosition = attempts.every(existing => {
                    const dx = x - existing.x;
                    const dy = y - existing.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance >= minDistance;
                });
                
                attempt++;
            }
            
            if (validPosition) {
                attempts.push({ x, y });
                const planet = new Planet(x, y, capacity, i);
                this.planets.push(planet);
            }
        }
        
        // Assign keyboard keys immediately
        CONFIG.initKeyboardAssignments(this.planets);
        this.planets.forEach(planet => {
            if (planet.assignedKey && planet.keyElement) {
                planet.keyElement.textContent = planet.assignedKey.toUpperCase();
            }
        });
        
        console.log(`🌍 Generated ${this.planets.length} planets with proper spacing`);
    },

    setupInitialState() {
        if (this.planets.length < 2) {
            console.error('❌ Not enough planets generated');
            return;
        }
        
        // Player gets first planet
        const playerPlanet = this.planets[0];
        playerPlanet.setOwner('player');
        playerPlanet.ships = 15;
        playerPlanet.updateVisual();
        
        // AI gets last planet
        const aiPlanet = this.planets[this.planets.length - 1];
        aiPlanet.setOwner('ai');
        aiPlanet.ships = 15;
        aiPlanet.updateVisual();
        
        // Initialize resources
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.setPlayerResources(75, 90);
        }
        
        console.log(`🏁 Player: planet ${playerPlanet.id}, AI: planet ${aiPlanet.id}`);
    },

    // FIXED: Simplified game loop
    startGameLoop() {
        this.lastUpdate = Date.now();
        Object.keys(this.lastUpdateTimes).forEach(key => {
            this.lastUpdateTimes[key] = Date.now();
        });
        this.gameLoop();
    },

    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        
        // Update physics every frame (fleets, planets)
        this.updatePhysics(deltaTime);
        
        // Update AI less frequently
        if (now - this.lastUpdateTimes.ai >= this.updateFrequency.ai) {
            this.updateAI();
            this.lastUpdateTimes.ai = now;
        }
        
        // Update UI periodically
        if (now - this.lastUpdateTimes.ui >= this.updateFrequency.ui) {
            this.updateUI();
            this.checkVictoryConditions();
            this.lastUpdateTimes.ui = now;
        }
        
        // Update resources
        if (now - this.lastUpdateTimes.resources >= this.updateFrequency.resources) {
            this.updateResources(deltaTime);
            this.lastUpdateTimes.resources = now;
        }
        
        this.lastUpdate = now;
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    },

    // FIXED: Direct fleet updates
    updatePhysics(deltaTime) {
        // Update planets
        this.planets.forEach(planet => {
            if (planet.update) planet.update(deltaTime);
        });
        
        // Update fleets directly
        this.fleets = this.fleets.filter(fleet => {
            if (fleet.update) {
                return fleet.update(); // Returns false when arrived
            }
            return false;
        });
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
        
        if (playerPlanets === 0) {
            this.endGame('AI', 'conquest');
        } else if (aiPlanets === 0) {
            this.endGame('Player', 'conquest');
        } else if (playerPlanets === this.planets.length) {
            this.endGame('Player', 'total_conquest');
        }
    },

    endGame(winner, condition) {
        this.gameState = 'ended';
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        const duration = (Date.now() - this.gameStartTime) / 1000;
        console.log(`🏆 ${winner} wins by ${condition} in ${duration.toFixed(1)}s`);
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

    restartGame() {
        this.gameState = 'menu';
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.performCleanup();
        this.isInitialized = false;
        
        setTimeout(() => this.init(), 100);
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
            canvas.querySelectorAll('.planet, .fleet').forEach(el => el.remove());
        }
    }
};

// Debug
window.debugGamePerf = {
    stats: () => console.table({
        planets: GameEngine.planets.length,
        fleets: GameEngine.fleets.length,
        gameState: GameEngine.gameState
    }),
    restart: () => GameEngine.restartGame(),
    planets: () => GameEngine.planets.forEach(p => 
        console.log(`${p.id}: ${p.owner} (${p.ships} ships, key: ${p.assignedKey})`)
    )
};
