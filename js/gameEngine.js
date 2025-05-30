// Game Engine - Action 02 CRITICAL FIX - Better balanced planet generation
const GameEngine = {
    canvas: null,
    planets: [],
    gameLoop: null,
    isRunning: false,
    
    init() {
        console.log('🚀 Initializing Game Engine with BALANCED Action 02 Building System...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        
        // Action 02: Initialize all evolution systems
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
        
        // IMPORTANT: Initialize InputManager AFTER planets are created
        if (typeof InputManager !== 'undefined') {
            console.log('🎮 Initializing InputManager...');
            InputManager.init();
        }
        
        this.start();
    },

    initEvolutionSystems() {
        console.log('✨ Initializing Action 02 BALANCED Evolution Systems...');
        
        // Action 01: Resource system
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.init();
        }
        
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.init();
        }
        
        // Action 02: Building system
        if (typeof BuildingManager !== 'undefined') {
            BuildingManager.init();
            console.log('🏗️ Building Manager initialized');
        }
        
        if (typeof BuildingUI !== 'undefined') {
            BuildingUI.init();
            console.log('🖥️ Building UI initialized');
        }
        
        // Initialize balance config for classic mode
        if (typeof BalanceConfig !== 'undefined') {
            BalanceConfig.init();
        }
        
        console.log('✅ Action 02 BALANCED Evolution Systems initialized');
    },

    setupCanvas() {
        if (!this.canvas) {
            console.error('❌ Canvas not found!');
            return;
        }
        
        // Make sure viewBox is set correctly
        this.canvas.setAttribute('viewBox', '0 0 800 600');
        this.canvas.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        console.log('✅ Canvas setup complete with viewBox:', this.canvas.getAttribute('viewBox'));
    },

    generatePlanets() {
        this.planets = [];
        const numPlanets = CONFIG.PLANETS.COUNT;
        const minDistance = CONFIG.PLANETS.MIN_DISTANCE || 100;
        
        // Use new capacity ranges from CONFIG
        const capacities = CONFIG.PLANETS.CAPACITIES || [15, 18, 22, 25, 30, 35, 40, 45];
        
        for (let i = 0; i < numPlanets; i++) {
            let attempts = 0;
            let planet;
            
            do {
                planet = {
                    x: Utils.randomBetween(80, 720),
                    y: Utils.randomBetween(80, 520),
                    capacity: capacities[Math.floor(Math.random() * capacities.length)] // Use predefined capacities
                };
                attempts++;
            } while (attempts < 50 && this.planets.some(p => Utils.distance(p, planet) < minDistance));
            
            const newPlanet = new Planet(planet.x, planet.y, planet.capacity, i);
            
            // Action 02: Initialize building properties
            newPlanet.buildings = {};
            newPlanet.shipProductionMultiplier = 1.0;
            newPlanet.metalGenerationMultiplier = 1.0;
            newPlanet.energyGenerationBonus = 0;
            newPlanet.researchPointsGeneration = 0;
            
            this.planets.push(newPlanet);
        }
        
        console.log(`✅ Generated ${numPlanets} planets with BALANCED capacities and building support`);
    },

    assignInitialPlanets() {
        // BALANCED: Use better starting ships from BalanceConfig
        const startShips = (typeof BalanceConfig !== 'undefined' && BalanceConfig.getCurrentSettings) ? 
                          BalanceConfig.getCurrentSettings().startShips : 15;
        
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
        
        // CRITICAL FIX: Set neutral planets with MUCH FEWER ships for easier conquest
        this.planets.forEach(planet => {
            if (planet.owner === 'neutral') {
                // BALANCED: Neutral planets have 3-8 ships (was 5-15)
                planet.ships = Utils.randomInt(3, 8);
                
                // Give neutral planets some starting metal if they get conquered
                if (CONFIG.PLANETS?.INITIAL_RESOURCES?.metal) {
                    const metalRange = CONFIG.PLANETS.INITIAL_RESOURCES.metal;
                    planet.aiMetal = Utils.randomInt(
                        Math.floor(metalRange.min * 0.3), 
                        Math.floor(metalRange.max * 0.5)
                    ); // 30-50% of player starting metal
                }
                
                planet.updateVisual();
            }
        });
        
        console.log(`🎯 Initial planets assigned with ${startShips} ships each`);
        console.log(`🎯 Neutral planets have 3-8 ships for easier conquest`);
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
        console.log('🎮 Starting BALANCED Action 02 enhanced game loop...');
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
        
        // Action 01: Update resource systems
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.update();
        }
        
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.update();
        }
        
        // Action 02: Update building system (handled internally by BuildingManager)
        // BuildingManager has its own update loop, so no need to call here
        
        // Update UI
        if (typeof UI !== 'undefined') {
            UI.update();
        }
        
        // Basic AI decisions
        this.updateAI();
        
        // Check victory conditions using BalanceConfig
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
        
        // Get player and AI ship counts
        const playerShips = this.getPlayerStats().ships;
        const aiShips = this.getAIStats().ships;
        
        // Use BalanceConfig for victory conditions if available
        if (typeof BalanceConfig !== 'undefined' && BalanceConfig.checkVictoryConditions) {
            const victory = BalanceConfig.checkVictoryConditions(
                playerPlanets, aiPlanets, totalPlanets, playerShips, aiShips
            );
            
            if (victory) {
                let message = '';
                switch (victory.condition) {
                    case 'total_control':
                        message = victory.winner === 'player' ? 
                            '¡Victoria Total! Has conquistado todos los planetas' :
                            '¡Derrota! La IA ha conquistado todos los planetas';
                        break;
                    case 'early_advantage':
                        message = victory.winner === 'player' ?
                            '¡Victoria por Dominio! Controlas la mayoría de planetas' :
                            '¡Derrota! La IA domina la galaxia';
                        break;
                    case 'economic':
                        message = victory.winner === 'player' ?
                            '¡Victoria Económica! Tu flota es dominante' :
                            '¡Derrota! La flota IA es superior';
                        break;
                }
                this.endGame(message);
                return;
            }
        }
        
        // Fallback to simple victory conditions
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

    // Get player statistics
    getPlayerStats() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player');
        const ships = playerPlanets.reduce((total, planet) => total + planet.ships, 0);
        
        return {
            planets: playerPlanets.length,
            ships: ships,
            planetsData: playerPlanets
        };
    },

    // Get AI statistics  
    getAIStats() {
        const aiPlanets = this.planets.filter(p => p.owner === 'ai');
        const ships = aiPlanets.reduce((total, planet) => total + planet.ships, 0);
        
        return {
            planets: aiPlanets.length,
            ships: ships,
            planetsData: aiPlanets
        };
    },

    getPlanetById(id) {
        return this.planets.find(p => p.id === id);
    },

    // Action 02: Building-related methods
    getBuildingStats() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player');
        let buildingCount = 0;
        let constructing = 0;
        
        playerPlanets.forEach(planet => {
            if (planet.buildings) {
                Object.values(planet.buildings).forEach(building => {
                    if (building.level > 0) buildingCount++;
                    if (building.constructing) constructing++;
                });
            }
        });
        
        return {
            completed: buildingCount,
            constructing: constructing,
            playerPlanets: playerPlanets.length
        };
    },

    // Debug methods
    debugAddMetal(amount) {
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.debugAddMetal(amount);
        }
    },

    debugAddEnergy(amount) {
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.debugAddEnergy(amount);
        }
    },

    debugResourceInfo() {
        if (typeof ResourceManager !== 'undefined') {
            return ResourceManager.debugInfo();
        }
        return null;
    },

    debugBuildingInfo() {
        if (typeof BuildingManager !== 'undefined') {
            BuildingManager.debugConstructions();
        }
        
        if (typeof Buildings !== 'undefined') {
            Buildings.debugBuildings();
        }
        
        return this.getBuildingStats();
    },

    // Debug coordinate system
    debugCoordinates(e) {
        if (e) {
            const svg = document.getElementById('gameCanvas');
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
            
            console.log('🎯 Debug Coordinates:', {
                screen: { x: e.clientX, y: e.clientY },
                svg: { x: svgP.x.toFixed(1), y: svgP.y.toFixed(1) },
                planets: this.planets.map(p => ({
                    id: p.id,
                    pos: { x: p.x, y: p.y },
                    radius: p.radius,
                    owner: p.owner,
                    buildings: Object.keys(p.buildings || {}).length
                }))
            });
        }
    }
};