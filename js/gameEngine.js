// Game Engine - Core game mechanics (restored original structure)
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
        
        // Initialize subsystems
        if (window.Animations) Animations.init();
        if (window.GameModes) GameModes.init(BalanceConfig.currentMode);
        if (window.EnhancedAI) EnhancedAI.init();
        
        UI.init();
        if (window.InputManager) InputManager.init();
        
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
        
        for (let i = 0; i < numPlanets; i++) {
            const planet = new Planet(
                Utils.randomBetween(80, 720),
                Utils.randomBetween(80, 520),
                Utils.randomBetween(CONFIG.PLANETS.MIN_CAPACITY, CONFIG.PLANETS.MAX_CAPACITY),
                i
            );
            this.planets.push(planet);
        }
        
        console.log(`Generated ${numPlanets} planets`);
    },

    assignInitialPlanets() {
        const settings = BalanceConfig.getCurrentSettings();
        
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
        
        console.log(`🎯 ${BalanceConfig.currentMode || 'default'} mode - ${settings.startShips} starting ships`);
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
            if (planet.update) planet.update(CONFIG.GAME.UPDATE_INTERVAL);
        });
        
        // Update fleets
        if (window.FleetManager) FleetManager.update();
        
        // Update UI
        if (window.UI) UI.update();
        
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
        if (window.UI) UI.setStatus(message, 5000);
    },

    getPlanetById(id) {
        return this.planets.find(p => p.id === id);
    },

    getPlanetByKey(key) {
        return this.planets.find(p => p.assignedKey === key.toLowerCase());
    },

    sendFleet(fromPlanet, toPlanet, shipCount = null) {
        if (!fromPlanet || !toPlanet || fromPlanet === toPlanet) return false;
        if (fromPlanet.owner !== 'player') return false;
        
        const shipsToSend = shipCount || Math.floor(fromPlanet.ships * 0.5);
        const settings = BalanceConfig.getCurrentSettings();
        const minShips = settings.minShipsToSend || 1;
        
        if (shipsToSend < minShips || fromPlanet.ships <= shipsToSend) return false;
        
        fromPlanet.ships -= shipsToSend;
        fromPlanet.updateVisual();
        
        if (window.FleetManager) {
            FleetManager.createFleet(fromPlanet, toPlanet, shipsToSend, 'player');
        }
        
        return true;
    }
};