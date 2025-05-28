// Game Engine - Enhanced with V1.2 animations
const GameEngine = {
    planets: [],
    isRunning: false,
    lastUpdate: 0,
    canvas: null,

    init() {
        console.log('🚀 Initializing Game Engine...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        // V1.2: Initialize animation system
        Animations.init();
        
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
        this.planets[0].owner = 'player';
        this.planets[0].ships = 10;
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
            furthestPlanet.ships = 10;
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
        Animations.update();
        
        // Update AI
        AI.update();
        
        // Update UI stats
        UI.updateStats();
        
        // Check game end
        this.checkGameEnd();
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
        console.log(`🏁 Game ended. Winner: ${winner}`);
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
    }
};