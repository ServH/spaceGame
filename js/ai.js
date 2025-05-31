// AI Controller - ENERGY AS FUEL SYSTEM V2.1 CONSOLIDATED
// Unified AI system with enhanced strategies and building management
const AI = {
    lastDecision: 0,
    lastBuildingDecision: 0,
    strategy: 'balanced',
    difficulty: 'normal',
    enableBuildingSystem: true,
    
    // Enhanced AI strategies (from enhancedAI.js)
    strategies: {
        blitz: {
            expansion_weight: 0.8,
            aggression: 0.9,
            risk_tolerance: 0.7
        },
        pressure: {
            expansion_weight: 0.3,
            aggression: 1.0,
            risk_tolerance: 0.9
        },
        economic: {
            expansion_weight: 1.0,
            aggression: 0.4,
            risk_tolerance: 0.3
        }
    },
    
    currentStrategy: 'blitz',
    adaptiveTimer: 0,
    
    init() {
        this.lastDecision = Date.now();
        this.lastBuildingDecision = Date.now();
        this.strategy = 'balanced';
        this.currentStrategy = 'blitz';
        console.log('🤖 AI initialized - ENERGY AS FUEL SYSTEM (Enhanced)');
    },

    update() {
        const now = Date.now();
        
        // Adaptive strategy timer
        this.adaptiveTimer += 16;
        if (this.adaptiveTimer >= 5000) {
            this.adaptStrategy();
            this.adaptiveTimer = 0;
        }
        
        // Apply strategy modifiers
        this.applyStrategyModifiers();
        
        // Main decision making
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

    // Enhanced adaptive strategy selection
    adaptStrategy() {
        const gameState = this.analyzeGameState();
        const elapsed = Date.now() - (window.gameStartTime || 0);
        
        // Late game pressure
        if (elapsed > 45000) {
            this.currentStrategy = 'pressure';
        }
        // Early economic if ahead
        else if (gameState.shipRatio > 1.5) {
            this.currentStrategy = 'economic';
        }
        // Default blitz
        else {
            this.currentStrategy = 'blitz';
        }
    },

    // Apply temporary strategy modifiers
    applyStrategyModifiers() {
        const strategy = this.strategies[this.currentStrategy];
        
        if (strategy && CONFIG.AI) {
            const originalAggression = CONFIG.AI.AGGRESSION;
            CONFIG.AI.AGGRESSION = strategy.aggression;
            
            // Restore after AI decision
            setTimeout(() => {
                CONFIG.AI.AGGRESSION = originalAggression;
            }, 100);
        }
    },

    makeDecision() {
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai' && p.ships > 1);
        
        if (aiPlanets.length === 0) return;

        const gameState = this.analyzeGameState();
        this.updateStrategy(gameState);
        
        const action = this.selectBestAction(gameState);
        
        if (action) {
            this.executeAction(action);
        }
    },

    makeBuildingDecision() {
        if (!this.enableBuildingSystem || typeof BuildingManager === 'undefined') return;

        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai');
        const gameState = this.analyzeGameState();
        
        aiPlanets.forEach(planet => {
            const recommendedBuilding = Buildings.getAIRecommendedBuilding(planet, gameState);
            
            if (recommendedBuilding) {
                const building = Buildings.getDefinition(recommendedBuilding);
                
                if (Buildings.canAIAfford(recommendedBuilding, gameState.aiMetal, gameState.aiEnergy)) {
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

    analyzeGameState() {
        const planets = GameEngine.planets;
        const myPlanets = planets.filter(p => p.owner === 'ai');
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const neutralPlanets = planets.filter(p => p.owner === 'neutral');
        
        const myTotalShips = myPlanets.reduce((sum, p) => sum + p.ships, 0);
        const playerTotalShips = playerPlanets.reduce((sum, p) => sum + p.ships, 0);
        
        const aiEnergy = ResourceManager.getAIEnergy();
        const aiMetal = myPlanets.reduce((sum, p) => sum + (p.aiMetal || 0), 0);
        
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

    updateStrategy(gameState) {
        if (gameState.energyHealth === 'poor') {
            this.strategy = 'conservative';
        } else if (!gameState.hasResearchLab && gameState.aiMetal > 40) {
            this.strategy = 'infrastructure';
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
        
        const affordableActions = actions.filter(action => this.canAffordAction(action, gameState));
        
        if (affordableActions.length === 0) {
            return this.generateConservativeAction(gameState);
        }
        
        const scoredActions = affordableActions.map(action => ({
            ...action,
            score: this.scoreAction(action, gameState)
        }));
        
        scoredActions.sort((a, b) => b.score - a.score);
        
        return scoredActions[0];
    },

    canAffordAction(action, gameState) {
        const energyCost = CONFIG.calculateMovementCost(action.ships, action.distance);
        return gameState.aiEnergy >= energyCost;
    },

    generateConservativeAction(gameState) {
        const weakestNeutral = gameState.neutralPlanets
            .filter(p => p.ships <= 3)
            .sort((a, b) => a.ships - b.ships)[0];
        
        if (!weakestNeutral) return null;
        
        const sourcePlanet = gameState.myPlanets
            .filter(p => p.ships > weakestNeutral.ships + 1)
            .sort((a, b) => Utils.distance(a, weakestNeutral) - Utils.distance(b, weakestNeutral))[0];
        
        if (!sourcePlanet) return null;
        
        const distance = Utils.distance(sourcePlanet, weakestNeutral);
        const fleetSize = Math.min(weakestNeutral.ships + 2, 4);
        const energyCost = CONFIG.calculateMovementCost(fleetSize, distance);
        
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
        let targets = [];
        
        switch (this.strategy) {
            case 'infrastructure':
                targets = gameState.neutralPlanets.filter(p => p.ships <= 3);
                break;
            case 'conservative':
                targets = gameState.neutralPlanets.filter(p => p.ships <= 4);
                break;
            case 'aggressive_expansion':
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 8)
                ];
                break;
            case 'expansion':
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 5)
                ];
                break;
            case 'aggressive':
                targets = [
                    ...gameState.playerPlanets,
                    ...gameState.neutralPlanets
                ];
                break;
            default:
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 6)
                ];
        }
        
        gameState.myPlanets.forEach(source => {
            if (source.ships <= 2) return;
            
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

    calculateShipsToSend(source, target, gameState) {
        let needed;
        
        if (target.owner === 'neutral') {
            needed = target.ships + 2;
        } else {
            needed = Math.max(target.ships + 3, Math.ceil(target.ships * 1.3));
        }
        
        const available = source.ships - 2;
        const affordable = Math.min(needed, available);
        
        if (gameState.energyHealth === 'poor') {
            return Math.min(affordable, 3);
        } else if (gameState.energyHealth === 'medium') {
            return Math.min(affordable, Math.floor(affordable * 0.7));
        }
        
        return affordable;
    },

    scoreAction(action, gameState) {
        const { target, distance, ships, energyCost } = action;
        let score = 0;
        
        score += target.capacity * 12;
        
        const energyEfficiency = target.capacity / energyCost;
        score += energyEfficiency * 15;
        
        score -= distance * 0.02;
        
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
        
        let successChance;
        if (target.owner === 'neutral') {
            successChance = ships > target.ships + 1 ? 0.95 : 0.8;
        } else {
            successChance = ships > target.ships + 2 ? 0.85 : ships > target.ships ? 0.7 : 0.4;
        }
        
        score *= successChance;
        
        if (gameState.energyHealth === 'poor' && energyCost <= 8) {
            score += 25;
        }
        
        if (!gameState.hasResearchLab && gameState.strategy === 'infrastructure') {
            score += 30;
        }
        
        return score;
    },

    executeAction(action) {
        const { source, target, ships, distance, energyCost } = action;
        
        if (!source.canSendShips(ships)) return;
        
        if (ResourceManager.payForAIMovement(ships, distance)) {
            FleetManager.createFleet(source, target, ships, 'ai');
            
            if (Math.random() < 0.2) {
                console.log(`🤖 AI ${this.strategy}: ${ships} ships ${source.id} → ${target.id} (${target.owner}) [Cost: ${energyCost} energy]`);
            }
        } else {
            if (Math.random() < 0.1) {
                console.log(`🤖 AI cannot afford movement: ${ships} ships, ${energyCost} energy needed`);
            }
        }
    },

    // Enhanced AI utilities for game mode support
    findBestAttacker(planets, target) {
        return planets
            .filter(p => p.ships > target.ships + 1)
            .sort((a, b) => Utils.distance(a, target) - Utils.distance(b, target))[0];
    },

    findClosestPlanet(planets, target) {
        return planets
            .filter(p => p.ships > 1)
            .sort((a, b) => Utils.distance(a, target) - Utils.distance(b, target))[0];
    }
};

// Legacy EnhancedAI object for backward compatibility
const EnhancedAI = AI;