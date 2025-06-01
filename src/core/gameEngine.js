// Game Engine - Based on working branch logic
const GameEngine = {
    canvas: null,
    planets: [],
    gameLoop: null,
    isRunning: false,
    
    init() {
        console.log('🚀 Initializing Game Engine - Based on working branch...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        
        this.initSystems();
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        this.start();
    },

    initSystems() {
        // Initialize systems in order
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.init();
        }
        
        if (typeof BuildingManager !== 'undefined') {
            BuildingManager.init();
        }
        
        if (typeof InputManager !== 'undefined') {
            InputManager.init();
        }
        
        if (typeof AI !== 'undefined') {
            AI.init();
        }
        
        if (typeof UI !== 'undefined') {
            UI.init();
        }
    },

    setupCanvas() {
        if (!this.canvas) {
            console.error('❌ Canvas not found!');
            return;
        }
        
        this.canvas.setAttribute('viewBox', '0 0 800 600');
        this.canvas.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        console.log('✅ Canvas setup complete');
    },

    // Based exactly on working branch
    generatePlanets() {
        this.planets = [];
        const numPlanets = CONFIG.PLANETS.COUNT;
        const minDistance = CONFIG.PLANETS.MIN_DISTANCE || 120;
        const capacities = CONFIG.PLANETS.CAPACITIES || [20, 25, 30, 40, 50, 60, 70];
        
        for (let i = 0; i < numPlanets; i++) {
            let attempts = 0;
            let planet;
            
            do {
                planet = {
                    x: Utils.randomBetween(80, 720),
                    y: Utils.randomBetween(80, 520),
                    capacity: capacities[Math.floor(Math.random() * capacities.length)]
                };
                attempts++;
            } while (attempts < 50 && this.planets.some(p => Utils.distance(p, planet) < minDistance));
            
            const newPlanet = new Planet(planet.x, planet.y, planet.capacity, i);
            newPlanet.buildings = {};
            newPlanet.shipProductionMultiplier = 1.0;
            newPlanet.metalGenerationMultiplier = 1.0;
            newPlanet.energyGenerationBonus = 0;
            
            this.planets.push(newPlanet);
        }
        
        console.log(`✅ Generated ${numPlanets} planets with proper spacing`);
    },

    assignInitialPlanets() {
        const startShips = 15;
        
        // Player gets first planet
        this.planets[0].owner = 'player';
        this.planets[0].ships = startShips;
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
            furthestPlanet.ships = startShips;
            furthestPlanet.updateVisual();
        }
        
        // Set neutral planets with 3-8 ships
        this.planets.forEach(planet => {
            if (planet.owner === 'neutral') {
                planet.ships = Utils.randomInt(3, 8);
                planet.updateVisual();
            }
        });
        
        console.log(`🎯 Initial planets assigned with ${startShips} ships each`);
    },

    assignKeyboardShortcuts() {
        const shuffledKeys = Utils.shuffle([...CONFIG.KEYBOARD.AVAILABLE_KEYS]);
        
        this.planets.forEach((planet, index) => {
            if (index < shuffledKeys.length) {
                planet.assignKey(shuffledKeys[index]);
            }
        });
        
        console.log('⌨️ Keyboard shortcuts assigned');
    },

    start() {
        console.log('🎮 Starting game loop...');
        this.isRunning = true;
        this.gameLoop = setInterval(() => {
            this.update();
        }, CONFIG.GAME.UPDATE_INTERVAL);
    },

    update() {
        if (!this.isRunning) return;

        // Update planets
        this.planets.forEach(planet => {
            planet.update(CONFIG.GAME.UPDATE_INTERVAL);
        });
        
        // Update fleets
        if (typeof FleetManager !== 'undefined') {
            FleetManager.update();
        }
        
        // Update resources
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.update();
        }
        
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.update();
        }
        
        // Update UI
        if (typeof UI !== 'undefined') {
            UI.update();
        }
        
        // Update AI
        this.updateAI();
        
        // Check victory
        this.checkVictoryConditions();
    },

    updateAI() {
        if (typeof AI !== 'undefined' && AI.update) {
            AI.update();
        }
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
        this.isRunning = false;
        clearInterval(this.gameLoop);
        console.log('🏁 Game ended:', message);
        
        if (typeof UI !== 'undefined' && UI.setStatus) {
            UI.setStatus(message, 5000);
        }
    },

    getPlanetById(id) {
        return this.planets.find(p => p.id === id);
    },

    // For debugging
    getPlayerStats() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player');
        return {
            planets: playerPlanets.length,
            ships: playerPlanets.reduce((total, planet) => total + planet.ships, 0)
        };
    },

    getAIStats() {
        const aiPlanets = this.planets.filter(p => p.owner === 'ai');
        return {
            planets: aiPlanets.length,
            ships: aiPlanets.reduce((total, planet) => total + planet.ships, 0)
        };
    }
};
