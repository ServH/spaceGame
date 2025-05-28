// Game Engine - V1.3 Core game mechanics with mode support
const GameEngine = {
    canvas: null,
    planets: [],
    gameState: 'menu', // menu, playing, paused, ended
    
    init(selectedMode = 'classic') {
        console.log(`🚀 Initializing Game Engine V1.3 - ${selectedMode} mode`);
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        
        // Apply mode-specific balance
        BalanceConfig.applyMode(selectedMode);
        
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        // Initialize subsystems
        if (window.Animations) Animations.init();
        if (window.GameModes) GameModes.init(selectedMode);
        if (window.EnhancedAI) EnhancedAI.init();
        
        UI.init();
        if (window.InputManager) InputManager.init();
        if (window.UIExtensions) UI.initModeUI();
        
        this.gameState = 'playing';
        this.start();
    },

    setupCanvas() {
        if (!this.canvas) return;
        
        // Set canvas size
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.setAttribute('viewBox', '0 0 800 600');
        
        console.log('Canvas setup complete');
    },

    generatePlanets() {
        this.planets = [];
        const numPlanets = CONFIG.PLANETS.COUNT || 8;
        
        for (let i = 0; i < numPlanets; i++) {
            const planet = new Planet(
                Utils.randomBetween(80, 720),  // x
                Utils.randomBetween(80, 520),  // y
                Utils.randomBetween(CONFIG.PLANETS.MIN_CAPACITY, CONFIG.PLANETS.MAX_CAPACITY)
            );
            planet.id = i;
            this.planets.push(planet);
        }
        
        console.log(`Generated ${numPlanets} planets`);
    },

    assignInitialPlanets() {
        const settings = BalanceConfig.getCurrentSettings();
        
        if (this.planets.length === 0) return;
        
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
        
        console.log(`🎯 ${BalanceConfig.currentMode} mode initialized - ${settings.startShips} starting ships`);
    },

    assignKeyboardShortcuts() {
        const availableKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
        const shuffledKeys = Utils.shuffle([...availableKeys]);
        
        this.planets.forEach((planet, index) => {
            if (index < shuffledKeys.length) {
                planet.assignedKey = shuffledKeys[index];
            }
        });
        
        console.log('Keyboard shortcuts assigned');
    },

    start() {
        this.gameState = 'playing';
        this.gameLoop();
    },

    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        // Update game state
        this.updatePlanets();
        this.updateFleets();
        this.checkVictoryConditions();
        
        // Update UI
        if (window.UI) UI.update();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    },

    updatePlanets() {
        this.planets.forEach(planet => {
            if (planet.update) planet.update();
        });
    },

    updateFleets() {
        if (window.FleetManager) {
            FleetManager.update();
        }
    },

    checkVictoryConditions() {
        if (window.GameModes && GameModes.checkVictory) {
            const result = GameModes.checkVictory();
            if (result) {
                this.endGame(result);
            }
        }
    },

    endGame(result) {
        this.gameState = 'ended';
        console.log('Game ended:', result);
        
        if (window.UI) {
            UI.setStatus(`¡${result.winner === 'player' ? 'Victoria' : 'Derrota'}! ${result.reason}`, 5000);
        }
    },

    getPlanetById(id) {
        return this.planets.find(p => p.id === id);
    },

    getPlanetByKey(key) {
        return this.planets.find(p => p.assignedKey === key);
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
    },

    reset() {
        this.gameState = 'menu';
        this.planets.forEach(planet => {
            if (planet.destroy) planet.destroy();
        });
        this.planets = [];
        
        if (window.FleetManager) FleetManager.clear();
        
        console.log('Game engine reset');
    }
};

// Make available globally
window.GameEngine = GameEngine;