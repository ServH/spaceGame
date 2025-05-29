// Game Engine - Classic Evolution Action 01 - FIXED COMPATIBILITY
const GameEngine = {
    canvas: null,
    planets: [],
    gameLoop: null,
    isRunning: false,
    
    init() {
        console.log('🚀 Initializing Game Engine with Evolution Systems...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        
        // Evolution: Initialize resource systems first
        this.initEvolutionSystems();
        
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        // Initialize available systems (check existence first)
        if (typeof Animations !== 'undefined') {
            Animations.init();
        }
        
        if (typeof AI !== 'undefined') {
            AI.init();
        }
        
        if (typeof UI !== 'undefined') {
            UI.init();
        }
        
        if (typeof InputManager !== 'undefined') {
            InputManager.init();
        }
        
        this.start();
    },

    initEvolutionSystems() {
        console.log('✨ Initializing Evolution Systems...');
        
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.init();
        }
        
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.init();
        }
        
        console.log('✅ Evolution Systems initialized');
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
        const startShips = 10; // Fixed value for testing
        
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
        console.log('🎮 Starting enhanced game loop...');
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
        
        // Evolution: Update resource systems
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
        
        // Basic AI decisions
        this.updateAI();
        
        // Check victory conditions
        this.checkVictoryConditions();
    },

    // FIXED: Simple AI update
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

    // Essential functions for Input system
    getPlanetAt(x, y) {
        return this.planets.find(planet => 
            Utils.pointInCircle({ x, y }, { x: planet.x, y: planet.y, radius: planet.radius })
        );
    },

    getPlanetById(id) {
        return this.planets.find(p => p.id === id);
    },

    // Debug methods
    debugAddMetal(amount) {
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.debugAddMetal(amount);
        }
    },

    debugResourceInfo() {
        if (typeof ResourceManager !== 'undefined') {
            return ResourceManager.debugInfo();
        }
        return null;
    }
};