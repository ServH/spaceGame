// Game Engine - Classic Evolution Action 01 Integration
// Enhanced with Resource Management System

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
        
        // Initialize original systems
        if (typeof Animations !== 'undefined') {
            Animations.init();
        }
        
        if (typeof EnhancedAI !== 'undefined') {
            EnhancedAI.init();
        }
        
        UI.init();
        InputManager.init();
        this.start();
    },

    // Evolution: Initialize all evolution systems
    initEvolutionSystems() {
        console.log('✨ Initializing Evolution Systems...');
        
        // Initialize ResourceManager first
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.init();
        }
        
        // Initialize ResourceUI
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
        // Evolution: Use ResourceManager starting metal or fallback
        const startShips = (typeof ResourceManager !== 'undefined' && CONFIG.BALANCE) ? 
                          CONFIG.BALANCE.STARTING_METAL || 10 : 10;
        
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
        FleetManager.update();
        
        // Evolution: Update resource systems
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.update();
        }
        
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.update();
        }
        
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
        this.isRunning = false;
        clearInterval(this.gameLoop);
        console.log('🏁 Game ended:', message);
        UI.setStatus(message, 5000);
    },

    getPlanetById(id) {
        return this.planets.find(p => p.id === id);
    },

    getPlanetByKey(key) {
        return this.planets.find(p => p.assignedKey === key.toLowerCase());
    },

    // Evolution: Enhanced sendFleet with resource integration
    sendFleet(fromPlanet, toPlanet, shipCount) {
        if (!fromPlanet || !toPlanet || fromPlanet === toPlanet) return false;
        if (fromPlanet.owner !== 'player') return false;
        
        const shipsToSend = shipCount || Math.floor(fromPlanet.ships * 0.5);
        if (shipsToSend < 1) return false;
        
        // Evolution: Check resource costs for player fleets
        if (typeof ResourceManager !== 'undefined') {
            const canAfford = FleetManager.canCreateFleet(fromPlanet, toPlanet, shipsToSend, 'player');
            if (!canAfford.canCreate) {
                console.log(`🚫 Cannot send fleet: ${canAfford.reason}`);
                if (canAfford.reason === 'insufficient_resources') {
                    console.log(`💰 Need ${canAfford.need} metal, have ${canAfford.have}`);
                }
                return false;
            }
        }
        
        // Use FleetManager which handles resource costs
        const fleet = FleetManager.createFleet(fromPlanet, toPlanet, shipsToSend, 'player');
        return fleet !== null;
    },

    // Evolution: Get game statistics including resources
    getGameStats() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player');
        const aiPlanets = this.planets.filter(p => p.owner === 'ai');
        const neutralPlanets = this.planets.filter(p => p.owner === 'neutral');
        
        const stats = {
            player: {
                planets: playerPlanets.length,
                ships: playerPlanets.reduce((sum, p) => sum + p.ships, 0),
                inTransit: FleetManager.getShipsInTransit('player')
            },
            ai: {
                planets: aiPlanets.length,
                ships: aiPlanets.reduce((sum, p) => sum + p.ships, 0),
                inTransit: FleetManager.getShipsInTransit('ai')
            },
            neutral: neutralPlanets.length,
            total: this.planets.length
        };
        
        // Evolution: Add resource information
        if (typeof ResourceManager !== 'undefined') {
            stats.player.metal = ResourceManager.getMetal();
            stats.player.metalCapacity = ResourceManager.getTotalStorageCapacity();
            stats.player.metalGeneration = ResourceManager.getTotalMetalGeneration();
        }
        
        return stats;
    },

    // Evolution: Reset game with resource systems
    reset() {
        this.isRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // Clear fleets
        FleetManager.clear();
        
        // Clear planets
        this.planets.forEach(planet => planet.destroy());
        this.planets = [];
        
        // Evolution: Reset resource systems
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.reset();
        }
        
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.update();
        }
        
        console.log('🔄 Game reset with evolution systems');
    },

    // Evolution: Debug methods for testing
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
    },

    debugGameStats() {
        const stats = this.getGameStats();
        console.table(stats);
        return stats;
    }
};