// Game Engine - V1.3 Enhanced with fast-paced gameplay
const GameEngine = {
    planets: [],
    isRunning: false,
    lastUpdate: 0,
    canvas: null,

    init() {
        console.log('🚀 Initializing Game Engine V1.3...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        
        // V1.3: Apply fast-paced balance
        BALANCE.applyFastSettings();
        
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        Animations.init();
        
        // V1.3: Initialize game mode and enhanced AI
        GameModes.init('blitz');
        EnhancedAI.init();
        
        UI.init();
        InputManager.init();
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
                planet = { x, y, capacity: Math.floor(capacities[i] * BALANCE.PLANET_BALANCE.CAPACITY_MULTIPLIER) };
                attempts++;
            } while (
                !Utils.checkPlanetPlacement(planet, this.planets, CONFIG.PLANETS.MIN_DISTANCE) && 
                attempts < 50
            );
            
            const newPlanet = new Planet(planet.x, planet.y, planet.capacity, i);
            this.planets.push(newPlanet);
        }
        
        console.log(`🪐 Generated ${this.planets.length} planets with V1.3 balance`);
    },

    assignInitialPlanets() {
        // V1.3: More starting ships for fast gameplay
        this.planets[0].owner = 'player';
        this.planets[0].ships = BALANCE.PLANET_BALANCE.START_SHIPS;
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
            furthestPlanet.ships = BALANCE.PLANET_BALANCE.START_SHIPS;
            furthestPlanet.updateVisual();
        }
        
        console.log('🎯 Initial planets assigned with fast-game balance');
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
        console.log('▶️ Fast-paced game started');
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
        this.planets.forEach(planet => planet.update(deltaTime));
        FleetManager.update();
        Animations.update();
        
        // V1.3: Enhanced AI and game modes
        EnhancedAI.update();
        GameModes.update();
        
        UI.updateStats();
        
        // V1.3: Enhanced win conditions
        if (!GameModes.checkWinConditions()) {
            this.checkGameEnd();
        }
    },

    checkGameEnd() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player').length;
        const aiPlanets = this.planets.filter(p => p.owner === 'ai').length;
        
        if (playerPlanets === 0) {
            this.endGame('ai');
        } else if (aiPlanets === 0) {
            this.endGame('player');
        }
    },

    endGame(winner) {
        this.isRunning = false;
        console.log(`🏁 Fast game ended. Winner: ${winner}`);
        UI.showGameEnd(winner);
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
        
        const shipsToSend = Math.min(origin.ships, Math.max(BALANCE.PLANET_BALANCE.MIN_SHIPS_TO_SEND, destination.capacity - destination.ships));
        
        if (shipsToSend < BALANCE.PLANET_BALANCE.MIN_SHIPS_TO_SEND) return false;
        
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
    }
};