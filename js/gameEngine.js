// Game Engine - V1.3 Polish Enhanced with Integrated Systems
const GameEngine = {
    planets: [],
    isRunning: false,
    lastUpdate: 0,
    lastAIDecision: 0,
    canvas: null,
    gameStartTime: null,

    init() {
        console.log('🚀 Initializing Game Engine V1.3 Polish...');
        this.canvas = document.getElementById('gameCanvas');
        this.gameStartTime = Date.now();
        
        this.setupCanvas();
        
        // V1.3 Polish: Initialize all polish systems BEFORE game setup
        this.initPolishSystems();
        
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        // V1.2: Initialize animation system
        if (typeof Animations !== 'undefined') {
            Animations.init();
        }
        
        UI.init();
        InputManager.init();
        AI.init();
        
        // V1.3 Polish: Final system initializations
        this.finalizePolishSystems();
        
        this.start();
    },

    // V1.3 Polish: Initialize all polish enhancement systems
    initPolishSystems() {
        console.log('✨ Initializing V1.3 Polish Systems...');
        
        // Initialize Balance Tuner first (affects game setup)
        if (typeof BalanceTuner !== 'undefined') {
            BalanceTuner.init();
        }
        
        // Initialize AI Personality (affects AI behavior)
        if (typeof AIPersonalitySystem !== 'undefined') {
            AIPersonalitySystem.init();
        }
        
        // Initialize Notification System
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.init();
        }
        
        // Initialize Smart Fleet System
        if (typeof SmartFleetSystem !== 'undefined') {
            SmartFleetSystem.init();
        }
        
        // Initialize Victory Monitor
        if (typeof VictoryMonitor !== 'undefined') {
            VictoryMonitor.init();
        }
    },

    // V1.3 Polish: Finalize systems after game setup
    finalizePolishSystems() {
        // Show personality notification
        if (typeof AIPersonalitySystem !== 'undefined') {
            setTimeout(() => {
                AIPersonalitySystem.showPersonalityNotification();
            }, 1000);
        }
        
        // Show balance notification (if changed)
        setTimeout(() => {
            if (typeof BalanceTuner !== 'undefined') {
                const balanceInfo = BalanceTuner.getBalanceInfo();
                if (balanceInfo && !balanceInfo.isOriginal) {
                    // Balance notification already shown in BalanceTuner.init()
                }
            }
        }, 1500);
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
        // Get initial ships from game mode settings (may be modified by BalanceTuner)
        const initialShips = CONFIG.BALANCE ? CONFIG.BALANCE.INITIAL_SHIPS : 10;
        
        this.planets[0].owner = 'player';
        this.planets[0].ships = initialShips;
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
            furthestPlanet.ships = initialShips;
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
        this.lastAIDecision = Date.now();
        console.log('▶️ Game started with V1.3 Polish enhancements');
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
        if (typeof Animations !== 'undefined') {
            Animations.update();
        }
        
        // V1.3 Polish: Update Victory Monitor
        if (typeof VictoryMonitor !== 'undefined') {
            VictoryMonitor.update();
        }
        
        // V1.3 Polish: Update Balance Tuner (dynamic adjustments)
        if (typeof BalanceTuner !== 'undefined') {
            BalanceTuner.adjustForGameplay(this.getGameState());
        }
        
        // V1.3: Update AI system with personality integration
        this.updateAISystem();
        
        // V1.3: Update King of Hill if active
        if (typeof KingOfHill !== 'undefined' && GameModes.hasFeature('kingOfHill')) {
            KingOfHill.update();
        }
        
        // Update UI stats
        UI.updateStats();
        
        // V1.3: Check multiple victory conditions
        this.checkVictoryConditions();
    },

    // V1.3 Polish: Enhanced AI update with personality integration
    updateAISystem() {
        if (Date.now() - this.lastAIDecision < CONFIG.AI.DECISION_INTERVAL) return;

        let decision = null;

        if (typeof EnhancedAI !== 'undefined' && GameModes.currentMode && GameModes.currentMode.id !== 'classic') {
            // Use enhanced AI for non-classic modes
            decision = EnhancedAI.makeDecision();
            
            // V1.3 Polish: Apply personality modifications
            if (decision && typeof AIPersonalitySystem !== 'undefined') {
                decision = AIPersonalitySystem.modifyDecision(decision, this.getGameState());
            }
            
            if (decision) {
                FleetManager.createFleet(decision.source, decision.target, decision.ships, 'ai');
                console.log(`🤖 Enhanced AI (${decision.strategy}):`, decision);
            }
        } else {
            // Use regular AI for classic mode with personality modifications
            const originalDecision = AI.makeDecision();
            
            if (originalDecision && typeof AIPersonalitySystem !== 'undefined') {
                decision = AIPersonalitySystem.modifyDecision(originalDecision, this.getGameState());
            } else {
                decision = originalDecision;
            }
            
            if (decision) {
                FleetManager.createFleet(decision.source, decision.target, decision.ships, 'ai');
            } else {
                // Fallback to regular AI update
                AI.update();
                return;
            }
        }
        
        this.lastAIDecision = Date.now();
    },

    // V1.3: Enhanced victory checking
    checkVictoryConditions() {
        // Check if VictoryConditions system is available
        if (typeof VictoryConditions !== 'undefined') {
            const victory = VictoryConditions.checkVictoryConditions();
            if (victory) {
                this.endGame(victory.winner, `${victory.condition}: ${victory.details}`);
                return;
            }
        }
        
        // Fallback to original victory checking
        this.checkGameEnd();
    },

    // Original victory check (fallback)
    checkGameEnd() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player').length;
        const aiPlanets = this.planets.filter(p => p.owner === 'ai').length;
        
        if (playerPlanets === 0) {
            this.endGame('ai', 'Total conquest: AI eliminated all player planets');
        } else if (aiPlanets === 0) {
            this.endGame('player', 'Total conquest: Player eliminated all AI planets');
        }
    },

    // V1.3: Enhanced endGame with victory details
    endGame(winner, details = '') {
        this.isRunning = false;
        
        // Stop timers
        if (typeof GameTimer !== 'undefined') {
            GameTimer.stop();
        }
        
        // V1.3 Polish: Clear notifications and reset systems
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.clearAll();
        }
        
        console.log(`🏁 Game ended. Winner: ${winner}. Details: ${details}`);
        
        // Show enhanced game end screen
        UI.showGameEnd(winner, details);
    },

    // V1.3 Polish: Get comprehensive game state for systems
    getGameState() {
        const playerStats = this.getPlayerStats();
        const aiStats = this.getAIStats();
        
        return {
            startTime: this.gameStartTime,
            currentTime: Date.now(),
            gameTime: Date.now() - this.gameStartTime,
            playerStats,
            aiStats,
            playerAdvantage: this.calculatePlayerAdvantage(playerStats, aiStats),
            totalPlanets: this.planets.length,
            neutralPlanets: this.planets.filter(p => p.owner === 'neutral').length
        };
    },

    // V1.3 Polish: Calculate player advantage metric
    calculatePlayerAdvantage(playerStats, aiStats) {
        if (aiStats.planets === 0) return 1.0;
        if (playerStats.planets === 0) return -1.0;
        
        // Calculate advantage based on planets and ships
        const planetRatio = playerStats.planets / aiStats.planets;
        const shipRatio = playerStats.ships / Math.max(aiStats.ships, 1);
        
        // Combined advantage score (-1 to 1)
        const advantage = (planetRatio + shipRatio) / 2 - 1;
        return Math.max(-1, Math.min(1, advantage));
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
        
        // V1.3 Polish: Use smart fleet system if available
        if (typeof SmartFleetSystem !== 'undefined') {
            return SmartFleetSystem.executeSmartSend(origin, destination);
        }
        
        // Fallback to original system
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
    },

    // V1.3: Get comprehensive game stats
    getGameStats() {
        const playerStats = this.getPlayerStats();
        const aiStats = this.getAIStats();
        const neutralPlanets = this.planets.filter(p => p.owner === 'neutral').length;
        
        return {
            player: playerStats,
            ai: aiStats,
            neutral: neutralPlanets,
            total: this.planets.length,
            gameMode: GameModes.currentMode ? GameModes.currentMode.name : 'Classic'
        };
    },

    // V1.3: Force planet ownership (for debugging)
    setPlanetOwner(planetId, owner) {
        const planet = this.getPlanetById(planetId);
        if (planet) {
            planet.owner = owner;
            planet.updateVisual();
            console.log(`Set planet ${planetId} owner to ${owner}`);
        }
    },

    // V1.3: Check if game is in a specific mode
    isGameMode(modeId) {
        return GameModes.currentMode && GameModes.currentMode.id === modeId;
    },

    // V1.3 Polish: Reset all polish systems
    resetPolishSystems() {
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.clearAll();
        }
        
        if (typeof SmartFleetSystem !== 'undefined') {
            SmartFleetSystem.resetSmartSend();
        }
        
        if (typeof VictoryMonitor !== 'undefined') {
            VictoryMonitor.reset();
        }
        
        if (typeof AIPersonalitySystem !== 'undefined') {
            AIPersonalitySystem.reset();
        }
        
        if (typeof BalanceTuner !== 'undefined') {
            BalanceTuner.reset();
        }
    }
};