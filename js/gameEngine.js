// Game Engine - Core game loop and management
const GameEngine = {
    planets: [],
    isRunning: false,
    lastUpdate: 0,
    canvas: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        UI.init();
        InputManager.init();
        AI.init();
        this.start();
    },

    setupCanvas() {
        this.canvas.setAttribute('width', CONFIG.GAME.CANVAS_WIDTH);
        this.canvas.setAttribute('height', CONFIG.GAME.CANVAS_HEIGHT);
    },

    generatePlanets() {
        const capacities = [...CONFIG.PLANETS.CAPACITIES];
        Utils.shuffle(capacities);
        
        for (let i = 0; i < CONFIG.PLANETS.COUNT; i++) {
            let attempts = 0;
            let planet;
            
            do {
                const x = Utils.random(50, CONFIG.GAME.CANVAS_WIDTH - 50);
                const y = Utils.random(50, CONFIG.GAME.CANVAS_HEIGHT - 50);
                planet = { x, y, capacity: capacities[i] };
                attempts++;
            } while (
                !Utils.checkPlanetPlacement(planet, this.planets, CONFIG.PLANETS.MIN_DISTANCE) && 
                attempts < 100
            );
            
            const newPlanet = new Planet(planet.x, planet.y, planet.capacity, i);
            this.planets.push(newPlanet);
        }
    },

    assignInitialPlanets() {
        // Player gets first planet
        this.planets[0].owner = 'player';
        this.planets[0].ships = 10;
        this.planets[0].updateVisual();
        
        // AI gets last planet (furthest from player)
        const aiPlanet = this.planets.reduce((furthest, planet, index) => {
            if (index === 0) return furthest; // Skip player planet
            const distanceToPlayer = Utils.distance(planet, this.planets[0]);
            const furthestDistance = furthest ? Utils.distance(furthest, this.planets[0]) : 0;
            return distanceToPlayer > furthestDistance ? planet : furthest;
        }, null);
        
        if (aiPlanet) {
            aiPlanet.owner = 'ai';
            aiPlanet.ships = 10;
            aiPlanet.updateVisual();
        }
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
        
        // Update AI
        AI.update();
        
        // Check win condition
        this.checkGameEnd();
    },

    checkGameEnd() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player').length;
        const aiPlanets = this.planets.filter(p => p.owner === 'ai').length;
        const neutralPlanets = this.planets.filter(p => p.owner === 'neutral').length;
        
        if (playerPlanets === 0) {
            this.endGame('AI gana!');
        } else if (aiPlanets === 0) {
            this.endGame('¡Jugador gana!');
        } else if (neutralPlanets === 0 && playerPlanets > aiPlanets) {
            this.endGame('¡Jugador domina el espacio!');
        } else if (neutralPlanets === 0 && aiPlanets > playerPlanets) {
            this.endGame('¡La IA domina el espacio!');
        }
    },

    endGame(message) {
        this.isRunning = false;
        alert(message + ' Recargando página...');
        setTimeout(() => location.reload(), 1000);
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
        
        // Calculate ships to send
        const availableSpace = destination.capacity - destination.ships;
        const shipsToSend = Math.min(origin.ships, Math.max(availableSpace, 1));
        
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
