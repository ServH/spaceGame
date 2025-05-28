// Game Engine - V1.3 Enhanced with Multiple Victory Conditions
const GameEngine = {
    planets: [],
    isRunning: false,
    lastUpdate: 0,
    lastAIDecision: 0,
    canvas: null,

    init() {
        console.log('🚀 Initializing Game Engine V1.3...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        // V1.2: Initialize animation system
        if (typeof Animations !== 'undefined') {
            Animations.init();
        }
        
        UI.init();
        InputManager.init();
        AI.init();
        this.start();
    },

    setupCanvas() {
        this.canvas.setAttribute('width', CONFIG.GAME.CANVAS_WIDTH);
        this.canvas.setAttribute('height', CONFIG.GAME.CANVAS_HEIGHT);
        this.canvas.setAttribute('viewBox', `0 0 ${CONFIG.GAME.CANVAS_WIDTH} ${CONFIG.GAME.CANVAS_HEIGHT}`);
    },

    generatePlanets() {
        const capacities = [...CONFIG.PLANETS.CAPACITIES];
        Utils.shuffle(capacities);
        
        for (let i = 0; i < CONFIG.PLANETS.COUNT; i++) {
            let attempts = 0;
            let planet;
            
            do {
                const x = Utils.random(80, CONFIG.GAME.CANVAS_WIDTH - 80);
                const y = Utils.random(80, CONFIG.GAME.CANVAS_HEIGHT - 80);
                planet = { x, y, capacity: capacities[i] };
                attempts++;
            } while (
                !Utils.checkPlanetPlacement(planet, this.planets, CONFIG.PLANETS.MIN_DISTANCE) && 
                attempts < 50
            );
            
            const newPlanet = new Planet(planet.x, planet.y, planet.capacity, i);
            this.planets.push(newPlanet);
        }
        
        console.log(`🪐 Generated ${this.planets.length} planets`);
    },

    assignInitialPlanets() {
        // Get initial ships from game mode settings
        const initialShips = CONFIG.BALANCE ? CONFIG.BALANCE.INITIAL_SHIPS : 10;
        
        this.planets[0].owner = 'player';
        this.planets[0].ships = initialShips;
        this.planets[0].updateVisual();
        
        let furthestPlanet = null;
        let maxDistance = 0;
        
        for (let i = 1; i < this.planets.length; i++) {
            const distance = Utils.distance(this.planets[0], this.planets[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPlanet = this.planets[i];
            }
        }
        
        if (furthestPlanet) {
            furthestPlanet.owner = 'ai';
            furthestPlanet.ships = initialShips;
            furthestPlanet.updateVisual();
        }
        
        console.log('🎯 Initial planets assigned');
    },

    assignKeyboardShortcuts() {
        const availableKeys = [...CONFIG.KEYBOARD.AVAILABLE_KEYS];
        Utils.shuffle(availableKeys);
        
        this.planets.forEach((planet, index) => {
            if (index < availableKeys.length) {
                planet.assignKey(availableKeys[index]);
            }
        });
    },

    start() {
        this.isRunning = true;
        this.lastUpdate = Date.now();
        this.lastAIDecision = Date.now();
        console.log('▶️ Game started');
        this.gameLoop();
    },

    gameLoop() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        this.lastUpdate = now;
        
        this.update(deltaTime);
        
        requestAnimationFrame(() => this.gameLoop());
    },

    update(deltaTime) {
        // Update planets
        this.planets.forEach(planet => planet.update(deltaTime));
        
        // Update fleets
        FleetManager.update();
        
        // V1.2: Update animations
        if (typeof Animations !== 'undefined') {
            Animations.update();
        }
        
        // V1.3: Update AI system (enhanced or regular)
        if (typeof EnhancedAI !== 'undefined' && GameModes.currentMode && GameModes.currentMode.id !== 'classic') {
            // Use enhanced AI for non-classic modes
            if (Date.now() - this.lastAIDecision > CONFIG.AI.DECISION_INTERVAL) {
                const decision = EnhancedAI.makeDecision();
                if (decision) {
                    FleetManager.createFleet(decision.source, decision.target, decision.ships, 'ai');
                    console.log(`🤖 Enhanced AI (${decision.strategy}):`, decision);
                }
                this.lastAIDecision = Date.now();
            }
        } else {
            // Use regular AI for classic mode
            AI.update();
        }
        
        // V1.3: Update King of Hill if active
        if (typeof KingOfHill !== 'undefined' && GameModes.hasFeature('kingOfHill')) {
            KingOfHill.update();
        }
        
        // Update UI stats
        UI.updateStats();
        
        // V1.3: Check multiple victory conditions
        this.checkVictoryConditions();
    },

    // V1.3: Enhanced victory checking
    checkVictoryConditions() {
        // Check if VictoryConditions system is available
        if (typeof VictoryConditions !== 'undefined') {
            const victory = VictoryConditions.checkVictoryConditions();
            if (victory) {
                this.endGame(victory.winner, `${victory.condition}: ${victory.details}`);
                return;
            }
        }
        
        // Fallback to original victory checking
        this.checkGameEnd();
    },

    // Original victory check (fallback)
    checkGameEnd() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player').length;
        const aiPlanets = this.planets.filter(p => p.owner === 'ai').length;
        
        if (playerPlanets === 0) {
            this.endGame('ai', 'Total conquest: AI eliminated all player planets');
        } else if (aiPlanets === 0) {
            this.endGame('player', 'Total conquest: Player eliminated all AI planets');
        }
    },

    // V1.3: Enhanced endGame with victory details
    endGame(winner, details = '') {
        this.isRunning = false;
        
        // Stop timers
        if (typeof GameTimer !== 'undefined') {
            GameTimer.stop();
        }
        
        console.log(`🏁 Game ended. Winner: ${winner}. Details: ${details}`);
        
        // Show enhanced game end screen
        UI.showGameEnd(winner, details);
    },

    getPlanetAt(x, y) {
        return this.planets.find(planet => 
            Utils.pointInCircle({ x, y }, { x: planet.x, y: planet.y, radius: planet.radius })
        );
    },

    getPlanetById(id) {
        return this.planets.find(planet => planet.id === id);
    },

    sendFleet(originId, destinationId) {
        const origin = this.getPlanetById(originId);
        const destination = this.getPlanetById(destinationId);
        
        if (!origin || !destination || origin === destination) return false;
        if (origin.owner !== 'player') return false;
        
        const shipsToSend = Math.min(origin.ships, Math.max(1, destination.capacity - destination.ships));
        
        if (shipsToSend < 1) return false;
        
        return FleetManager.createFleet(origin, destination, shipsToSend, 'player');
    },

    getPlayerStats() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player').length;
        const playerShips = this.planets
            .filter(p => p.owner === 'player')
            .reduce((total, p) => total + p.ships, 0);
        
        return { planets: playerPlanets, ships: playerShips };
    },

    getAIStats() {
        const aiPlanets = this.planets.filter(p => p.owner === 'ai').length;
        const aiShips = this.planets
            .filter(p => p.owner === 'ai')
            .reduce((total, p) => total + p.ships, 0);
        
        return { planets: aiPlanets, ships: aiShips };
    },

    // V1.3: Get comprehensive game stats
    getGameStats() {
        const playerStats = this.getPlayerStats();
        const aiStats = this.getAIStats();
        const neutralPlanets = this.planets.filter(p => p.owner === 'neutral').length;
        
        return {
            player: playerStats,
            ai: aiStats,
            neutral: neutralPlanets,
            total: this.planets.length,
            gameMode: GameModes.currentMode ? GameModes.currentMode.name : 'Classic'
        };
    },

    // V1.3: Force planet ownership (for debugging)
    setPlanetOwner(planetId, owner) {
        const planet = this.getPlanetById(planetId);
        if (planet) {
            planet.owner = owner;
            planet.updateVisual();
            console.log(`Set planet ${planetId} owner to ${owner}`);
        }
    },

    // V1.3: Check if game is in a specific mode
    isGameMode(modeId) {
        return GameModes.currentMode && GameModes.currentMode.id === modeId;
    }
};