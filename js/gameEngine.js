// Game Engine - Core game mechanics (original working version)
const GameEngine = {
    canvas: null,
    planets: [],
    gameLoop: null,
    
    init() {
        console.log('🚀 Initializing Game Engine...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        // Initialize original systems
        Animations.init();
        EnhancedAI.init();
        
        UI.init();
        InputManager.init();
        this.start();
    },

    setupCanvas() {
        if (!this.canvas) return;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.setAttribute('viewBox', '0 0 800 600');
    },

    generatePlanets() {
        this.planets = [];
        const numPlanets = CONFIG.PLANETS.COUNT;
        const minDistance = CONFIG.PLANETS.MIN_DISTANCE || 100;
        
        for (let i = 0; i < numPlanets; i++) {
            let attempts = 0;
            let planet;
            
            do {
                planet = {
                    x: Utils.randomBetween(80, 720),
                    y: Utils.randomBetween(80, 520),
                    capacity: Utils.randomBetween(CONFIG.PLANETS.MIN_CAPACITY, CONFIG.PLANETS.MAX_CAPACITY)
                };
                attempts++;
            } while (attempts < 50 && this.planets.some(p => Utils.distance(p, planet) < minDistance));
            
            const newPlanet = new Planet(planet.x, planet.y, planet.capacity, i);
            this.planets.push(newPlanet);
        }
        
        console.log(`Generated ${numPlanets} planets`);
    },

    assignInitialPlanets() {
        const settings = BalanceConfig ? BalanceConfig.getCurrentSettings() : { startShips: 10 };
        
        // Player gets first planet
        this.planets[0].owner = 'player';
        this.planets[0].ships = settings.startShips;
        this.planets[0].updateVisual();
        
        // AI gets furthest planet
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
            furthestPlanet.ships = settings.startShips;
            furthestPlanet.updateVisual();
        }
        
        console.log(`🎯 Initial planets assigned`);
    },

    assignKeyboardShortcuts() {
        const shuffledKeys = Utils.shuffle([...CONFIG.KEYBOARD.AVAILABLE_KEYS]);
        
        this.planets.forEach((planet, index) => {
            if (index < shuffledKeys.length) {
                planet.assignKey(shuffledKeys[index]);
            }
        });
        
        console.log('Keyboard shortcuts assigned');
    },

    start() {
        console.log('🎮 Starting game loop...');
        this.gameLoop = setInterval(() => {
            this.update();
        }, CONFIG.GAME.UPDATE_INTERVAL);
    },

    update() {
        // Update planets
        this.planets.forEach(planet => {
            planet.update(CONFIG.GAME.UPDATE_INTERVAL);
        });
        
        // Update fleets
        FleetManager.update();
        
        // Update UI
        UI.update();
        
        // Check victory conditions
        this.checkVictoryConditions();
    },

    checkVictoryConditions() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player').length;
        const aiPlanets = this.planets.filter(p => p.owner === 'ai').length;
        const totalPlanets = this.planets.length;
        
        if (playerPlanets === totalPlanets) {
            this.endGame('¡Victoria! Has conquistado todos los planetas');
        } else if (aiPlanets === totalPlanets) {
            this.endGame('¡Derrota! La IA ha conquistado todos los planetas');
        }
    },

    endGame(message) {
        clearInterval(this.gameLoop);
        console.log('Game ended:', message);
        UI.setStatus(message, 5000);
    },

    getPlanetById(id) {
        return this.planets.find(p => p.id === id);
    },

    getPlanetByKey(key) {
        return this.planets.find(p => p.assignedKey === key.toLowerCase());
    },

    sendFleet(fromPlanet, toPlanet, shipCount) {
        if (!fromPlanet || !toPlanet || fromPlanet === toPlanet) return false;
        if (fromPlanet.owner !== 'player') return false;
        
        const shipsToSend = shipCount || Math.floor(fromPlanet.ships * 0.5);
        if (shipsToSend < 1 || fromPlanet.ships <= shipsToSend) return false;
        
        fromPlanet.ships -= shipsToSend;
        fromPlanet.updateVisual();
        
        FleetManager.createFleet(fromPlanet, toPlanet, shipsToSend, 'player');
        return true;
    }
};