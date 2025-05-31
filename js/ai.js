// AI Controller - ENERGY AS FUEL SYSTEM V2.0
// AI uses same energy rules as player
const AI = {
    lastDecision: 0,
    lastBuildingDecision: 0,
    strategy: 'balanced',
    difficulty: 'normal',
    enableBuildingSystem: true, // Always enabled now
    
    init() {
        this.lastDecision = Date.now();
        this.lastBuildingDecision = Date.now();
        this.strategy = 'balanced';
        console.log('🤖 AI initialized - ENERGY AS FUEL SYSTEM');
    },

    update() {
        const now = Date.now();
        
        // ENERGY FUEL: Slightly slower decisions for energy management
        const decisionInterval = CONFIG.AI?.DECISION_INTERVAL || 3000;
        
        if (now - this.lastDecision >= decisionInterval) {
            this.makeDecision();
            this.lastDecision = now;
        }

        // Building decisions every 8 seconds
        if (now - this.lastBuildingDecision >= 8000) {
            this.makeBuildingDecision();
            this.lastBuildingDecision = now;
        }
    },

    makeDecision() {
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai' && p.ships > 1);
        
        if (aiPlanets.length === 0) {
            return;
        }

        // ENERGY FUEL: Analyze game state including energy situation
        const gameState = this.analyzeGameState();
        
        // Update strategy based on energy availability
        this.updateStrategy(gameState);
        
        // Find best action considering energy constraints
        const action = this.selectBestAction(gameState);
        
        if (action) {
            this.executeAction(action);
        }
    },

    // ENERGY FUEL: Enhanced building decision making
    makeBuildingDecision() {
        if (!this.enableBuildingSystem || typeof BuildingManager === 'undefined') return;

        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai');
        const gameState = this.analyzeGameState();
        
        aiPlanets.forEach(planet => {
            // ENERGY FUEL: Intelligent building selection
            const recommendedBuilding = Buildings.getAIRecommendedBuilding(planet, gameState);
            
            if (recommendedBuilding) {
                const building = Buildings.getDefinition(recommendedBuilding);
                
                // Check if AI can afford it
                if (Buildings.canAIAfford(recommendedBuilding, gameState.aiMetal, gameState.aiEnergy)) {
                    // 40% chance to build per cycle
                    if (Math.random() < 0.4) {
                        const buildAttempt = BuildingManager.tryAIConstruction(planet, recommendedBuilding);
                        if (buildAttempt) {
                            console.log(`🤖 AI built ${building.name} on planet ${planet.id}`);
                        }
                    }
                }
            }
        });
    },

    // ENERGY FUEL: Enhanced game state analysis
    analyzeGameState() {
        const planets = GameEngine.planets;
        const myPlanets = planets.filter(p => p.owner === 'ai');
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const neutralPlanets = planets.filter(p => p.owner === 'neutral');
        
        const myTotalShips = myPlanets.reduce((sum, p) => sum + p.ships, 0);
        const playerTotalShips = playerPlanets.reduce((sum, p) => sum + p.ships, 0);
        
        // ENERGY FUEL: AI energy from ResourceManager (unified system)
        const aiEnergy = ResourceManager.getAIEnergy();
        const aiMetal = myPlanets.reduce((sum, p) => sum + (p.aiMetal || 0), 0);
        
        // Calculate energy efficiency
        const avgEnergyPerPlanet = aiEnergy / Math.max(myPlanets.length, 1);
        const hasResearchLab = myPlanets.some(p => 
            p.buildings && p.buildings.research_lab && !p.buildings.research_lab.constructing
        );
        
        return {
            myPlanets,
            playerPlanets,
            neutralPlanets,
            myTotalShips,
            playerTotalShips,
            aiEnergy,
            aiMetal,
            avgEnergyPerPlanet,
            hasResearchLab,
            shipRatio: myTotalShips / Math.max(playerTotalShips, 1),
            gamePhase: neutralPlanets.length > 2 ? 'expansion' : 'endgame',
            energyHealth: avgEnergyPerPlanet > 30 ? 'excellent' : 
                         avgEnergyPerPlanet > 15 ? 'good' : 
                         avgEnergyPerPlanet > 8 ? 'medium' : 'poor',
            metalHealth: aiMetal > 80 ? 'excellent' : 
                        aiMetal > 40 ? 'good' : 
                        aiMetal > 20 ? 'medium' : 'poor'
        };
    },

    // ENERGY FUEL: Strategy based on energy availability
    updateStrategy(gameState) {
        // Energy is now the limiting factor
        if (gameState.energyHealth === 'poor') {
            this.strategy = 'conservative'; // Very small, local movements only
        } else if (!gameState.hasResearchLab && gameState.aiMetal > 40) {
            this.strategy = 'infrastructure'; // Focus on getting Research Lab
        } else if (gameState.gamePhase === 'expansion' && gameState.neutralPlanets.length > 0) {
            if (gameState.energyHealth === 'excellent') {
                this.strategy = 'aggressive_expansion';
            } else {
                this.strategy = 'expansion';
            }
        } else if (gameState.shipRatio < 0.7) {
            this.strategy = 'defensive';
        } else if (gameState.shipRatio > 1.5 && gameState.energyHealth === 'excellent') {
            this.strategy = 'aggressive';
        } else {
            this.strategy = 'balanced';
        }
    },

    selectBestAction(gameState) {
        const actions = this.generatePossibleActions(gameState);
        
        if (actions.length === 0) return null;
        
        // ENERGY FUEL: Filter actions by energy constraints
        const affordableActions = actions.filter(action => this.canAffordAction(action, gameState));
        
        if (affordableActions.length === 0) {
            // Try very conservative actions
            return this.generateConservativeAction(gameState);
        }
        
        // Score actions based on energy efficiency
        const scoredActions = affordableActions.map(action => ({
            ...action,
            score: this.scoreAction(action, gameState)
        }));
        
        // Sort by score
        scoredActions.sort((a, b) => b.score - a.score);
        
        return scoredActions[0];
    },

    // ENERGY FUEL: Check if AI can afford an action
    canAffordAction(action, gameState) {
        const energyCost = CONFIG.calculateMovementCost(action.ships, action.distance);
        return gameState.aiEnergy >= energyCost;
    },

    // ENERGY FUEL: Generate conservative action when energy is low
    generateConservativeAction(gameState) {
        // Find very close targets only
        const weakestNeutral = gameState.neutralPlanets
            .filter(p => p.ships <= 3)
            .sort((a, b) => a.ships - b.ships)[0];
        
        if (!weakestNeutral) return null;
        
        // Find closest AI planet
        const sourcePlanet = gameState.myPlanets
            .filter(p => p.ships > weakestNeutral.ships + 1)
            .sort((a, b) => Utils.distance(a, weakestNeutral) - Utils.distance(b, weakestNeutral))[0];
        
        if (!sourcePlanet) return null;
        
        const distance = Utils.distance(sourcePlanet, weakestNeutral);
        const fleetSize = Math.min(weakestNeutral.ships + 2, 4); // Very small fleets
        const energyCost = CONFIG.calculateMovementCost(fleetSize, distance);
        
        // Only if very cheap
        if (energyCost <= Math.max(5, gameState.aiEnergy * 0.1)) {
            return {
                type: 'conservative_attack',
                source: sourcePlanet,
                target: weakestNeutral,
                ships: fleetSize,
                distance,
                energyCost
            };
        }
        
        return null;
    },

    generatePossibleActions(gameState) {
        const actions = [];
        
        // ENERGY FUEL: Target selection based on strategy and energy
        let targets = [];
        
        switch (this.strategy) {
            case 'infrastructure':
                // Only very safe, close targets while building economy
                targets = gameState.neutralPlanets.filter(p => p.ships <= 3);
                break;
                
            case 'conservative':
                // Only attack very weak, close neutrals
                targets = gameState.neutralPlanets.filter(p => p.ships <= 4);
                break;
                
            case 'aggressive_expansion':
                // Target all neutrals first, then weak player planets
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 8)
                ];
                break;
                
            case 'expansion':
                // Prioritize neutrals
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 5)
                ];
                break;
                
            case 'aggressive':
                // Attack everything
                targets = [
                    ...gameState.playerPlanets,
                    ...gameState.neutralPlanets
                ];
                break;
                
            default:
                // Balanced approach
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 6)
                ];
        }
        
        gameState.myPlanets.forEach(source => {
            if (source.ships <= 2) return; // Need ships for attack
            
            targets.forEach(target => {
                const distance = Utils.distance(source, target);
                const shipsToSend = this.calculateShipsToSend(source, target, gameState);
                
                if (shipsToSend > 0) {
                    const energyCost = CONFIG.calculateMovementCost(shipsToSend, distance);
                    
                    actions.push({
                        type: 'attack',
                        source,
                        target,
                        ships: shipsToSend,
                        distance,
                        energyCost
                    });
                }
            });
        });
        
        return actions;
    },

    // ENERGY FUEL: Better ship calculation considering energy efficiency
    calculateShipsToSend(source, target, gameState) {
        let needed;
        
        if (target.owner === 'neutral') {
            needed = target.ships + 2;
        } else {
            needed = Math.max(target.ships + 3, Math.ceil(target.ships * 1.3));
        }
        
        const available = source.ships - 2; // Keep 2 for defense
        const affordable = Math.min(needed, available);
        
        // ENERGY FUEL: Scale based on energy health
        if (gameState.energyHealth === 'poor') {
            return Math.min(affordable, 3); // Very small fleets
        } else if (gameState.energyHealth === 'medium') {
            return Math.min(affordable, Math.floor(affordable * 0.7));
        }
        
        return affordable;
    },

    // ENERGY FUEL: Score action based on energy efficiency
    scoreAction(action, gameState) {
        const { target, distance, ships, energyCost } = action;
        let score = 0;
        
        // Base value of target planet
        score += target.capacity * 12;
        
        // ENERGY FUEL: Energy efficiency is critical
        const energyEfficiency = target.capacity / energyCost;
        score += energyEfficiency * 15;
        
        // Distance penalty (energy cost already factors this)
        score -= distance * 0.02;
        
        // Strategy modifiers
        switch (this.strategy) {
            case 'infrastructure':
                score += target.owner === 'neutral' && target.ships <= 3 ? 100 : -50;
                break;
            case 'conservative':
                score += target.owner === 'neutral' && target.ships <= 4 ? 80 : -30;
                break;
            case 'aggressive_expansion':
                score += target.owner === 'neutral' ? 60 : 25;
                score += target.capacity > 40 ? 30 : 0;
                break;
            case 'expansion':
                score += target.owner === 'neutral' ? 50 : 20;
                break;
            case 'aggressive':
                score += target.owner === 'player' ? 60 : 30;
                break;
            default:
                score += target.owner === 'neutral' ? 40 : 25;
        }
        
        // Success probability
        let successChance;
        if (target.owner === 'neutral') {
            successChance = ships > target.ships + 1 ? 0.95 : 0.8;
        } else {
            successChance = ships > target.ships + 2 ? 0.85 : ships > target.ships ? 0.7 : 0.4;
        }
        
        score *= successChance;
        
        // ENERGY FUEL: Bonus for energy conservation
        if (gameState.energyHealth === 'poor' && energyCost <= 8) {
            score += 25;
        }
        
        // Research Lab priority bonus
        if (!gameState.hasResearchLab && gameState.strategy === 'infrastructure') {
            score += 30; // Bonus for actions that help secure resources for Research Lab
        }
        
        return score;
    },

    executeAction(action) {
        const { source, target, ships, distance, energyCost } = action;
        
        if (!source.canSendShips(ships)) {
            return;
        }
        
        // ENERGY FUEL: Pay energy cost through ResourceManager
        if (ResourceManager.payForAIMovement(ships, distance)) {
            // Create fleet
            FleetManager.createFleet(source, target, ships, 'ai');
            
            // Logging with energy cost info
            if (Math.random() < 0.2) {
                console.log(`🤖 AI ${this.strategy}: ${ships} ships ${source.id} → ${target.id} (${target.owner}) [Cost: ${energyCost} energy]`);
            }
        } else {
            // Not enough energy
            if (Math.random() < 0.1) {
                console.log(`🤖 AI cannot afford movement: ${ships} ships, ${energyCost} energy needed`);
            }
        }
    }
};