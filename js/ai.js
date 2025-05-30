// AI Controller - OPCIÓN A GALCON - Resource-aware AI optimized for 1 metal ship sending cost
const AI = {
    lastDecision: 0,
    strategy: 'balanced',
    difficulty: 'normal',
    
    init() {
        this.lastDecision = Date.now();
        this.strategy = 'balanced';
        console.log('🤖 AI initialized - OPCIÓN A GALCON with 1 metal ship costs');
    },

    update() {
        const now = Date.now();
        
        // OPCIÓN A: Faster AI decisions for more dynamic gameplay
        const decisionInterval = CONFIG.AI?.DECISION_INTERVAL || 2000;
        
        if (now - this.lastDecision >= decisionInterval) {
            this.makeDecision();
            this.lastDecision = now;
        }
    },

    makeDecision() {
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai' && p.ships > 1);
        
        if (aiPlanets.length === 0) {
            return;
        }

        // Analyze game state including OPCIÓN A resource situation
        const gameState = this.analyzeGameState();
        
        // Update strategy based on resources
        this.updateStrategy(gameState);
        
        // Find best action considering OPCIÓN A resource constraints
        const action = this.selectBestAction(gameState);
        
        if (action) {
            this.executeAction(action);
        }
    },

    analyzeGameState() {
        const planets = GameEngine.planets;
        const myPlanets = planets.filter(p => p.owner === 'ai');
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const neutralPlanets = planets.filter(p => p.owner === 'neutral');
        
        const myTotalShips = myPlanets.reduce((sum, p) => sum + p.ships, 0);
        const playerTotalShips = playerPlanets.reduce((sum, p) => sum + p.ships, 0);
        
        // OPCIÓN A: Analyze AI metal for sending ships (1 metal each)
        const myTotalMetal = myPlanets.reduce((sum, p) => sum + (p.aiMetal || 0), 0);
        const avgMetalPerPlanet = myTotalMetal / Math.max(myPlanets.length, 1);
        
        // Calculate potential fleet size based on metal
        const maxAffordableFleetSize = Math.floor(myTotalMetal);
        
        return {
            myPlanets,
            playerPlanets,
            neutralPlanets,
            myTotalShips,
            playerTotalShips,
            myTotalMetal,
            avgMetalPerPlanet,
            maxAffordableFleetSize,
            shipRatio: myTotalShips / Math.max(playerTotalShips, 1),
            gamePhase: neutralPlanets.length > 2 ? 'expansion' : 'endgame',
            resourceHealth: avgMetalPerPlanet > 50 ? 'excellent' : 
                           avgMetalPerPlanet > 25 ? 'good' : 
                           avgMetalPerPlanet > 10 ? 'medium' : 'poor'
        };
    },

    updateStrategy(gameState) {
        // OPCIÓN A: Strategy based on metal availability and ship costs
        if (gameState.resourceHealth === 'poor') {
            this.strategy = 'conservative'; // Very small fleets only
        } else if (gameState.gamePhase === 'expansion' && gameState.neutralPlanets.length > 0) {
            if (gameState.resourceHealth === 'excellent') {
                this.strategy = 'aggressive_expansion'; // Target neutrals aggressively
            } else {
                this.strategy = 'expansion';
            }
        } else if (gameState.shipRatio < 0.7) {
            this.strategy = 'defensive';
        } else if (gameState.shipRatio > 1.5 && gameState.resourceHealth === 'excellent') {
            this.strategy = 'aggressive';
        } else {
            this.strategy = 'balanced';
        }
    },

    selectBestAction(gameState) {
        const actions = this.generatePossibleActions(gameState);
        
        if (actions.length === 0) return null;
        
        // OPCIÓN A: Filter actions by metal constraints (1 metal per ship)
        const affordableActions = actions.filter(action => this.canAffordAction(action, gameState));
        
        if (affordableActions.length === 0) {
            // If no actions are affordable, try very small fleets
            return this.generateConservativeAction(gameState);
        }
        
        // Score actions
        const scoredActions = affordableActions.map(action => ({
            ...action,
            score: this.scoreAction(action, gameState)
        }));
        
        // Sort by score
        scoredActions.sort((a, b) => b.score - a.score);
        
        return scoredActions[0];
    },

    // OPCIÓN A: Check if AI can afford an action (1 metal per ship)
    canAffordAction(action, gameState) {
        const metalCost = action.ships; // 1 metal per ship
        return action.source.aiMetal >= metalCost;
    },

    // OPCIÓN A: Generate conservative action when resources are tight
    generateConservativeAction(gameState) {
        // Find the weakest neutral target
        const weakestNeutral = gameState.neutralPlanets
            .filter(p => p.ships <= 5)
            .sort((a, b) => a.ships - b.ships)[0];
        
        if (!weakestNeutral) return null;
        
        // Find closest AI planet with enough metal for a small fleet
        const sourcePlanet = gameState.myPlanets
            .filter(p => p.ships > weakestNeutral.ships + 1 && p.aiMetal >= weakestNeutral.ships + 2)
            .sort((a, b) => Utils.distance(a, weakestNeutral) - Utils.distance(b, weakestNeutral))[0];
        
        if (!sourcePlanet) return null;
        
        const fleetSize = Math.min(weakestNeutral.ships + 2, sourcePlanet.aiMetal);
        
        return {
            type: 'conservative_attack',
            source: sourcePlanet,
            target: weakestNeutral,
            ships: fleetSize,
            distance: Utils.distance(sourcePlanet, weakestNeutral)
        };
    },

    generatePossibleActions(gameState) {
        const actions = [];
        
        // OPCIÓN A: Target selection based on strategy and metal availability
        let targets = [];
        
        switch (this.strategy) {
            case 'conservative':
                // Only attack very weak neutrals
                targets = gameState.neutralPlanets.filter(p => p.ships <= 4);
                break;
                
            case 'aggressive_expansion':
                // Target all neutrals first, then weak player planets
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 10)
                ];
                break;
                
            case 'expansion':
                // Prioritize neutrals
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 6)
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
                    ...gameState.playerPlanets.filter(p => p.ships <= 8)
                ];
        }
        
        gameState.myPlanets.forEach(source => {
            if (source.ships <= 2 || source.aiMetal < 3) return; // Need ships and metal
            
            targets.forEach(target => {
                const distance = Utils.distance(source, target);
                const shipsToSend = this.calculateShipsToSend(source, target, gameState);
                
                if (shipsToSend > 0 && source.aiMetal >= shipsToSend) {
                    actions.push({
                        type: 'attack',
                        source,
                        target,
                        ships: shipsToSend,
                        distance,
                        metalCost: shipsToSend
                    });
                }
            });
        });
        
        return actions;
    },

    // OPCIÓN A: Better ship calculation considering 1 metal per ship cost
    calculateShipsToSend(source, target, gameState) {
        let needed;
        
        if (target.owner === 'neutral') {
            // Against neutrals: enough to win + small buffer
            needed = target.ships + 2;
        } else {
            // Against player: more force needed
            needed = Math.max(target.ships + 3, Math.ceil(target.ships * 1.4));
        }
        
        const available = source.ships - 2; // Keep 2 for defense
        const affordable = Math.min(needed, available, source.aiMetal); // Limited by metal
        
        // OPCIÓN A: Scale based on resource health
        if (gameState.resourceHealth === 'poor') {
            return Math.min(affordable, 3); // Very small fleets only
        } else if (gameState.resourceHealth === 'medium') {
            return Math.min(affordable, Math.floor(affordable * 0.8));
        }
        
        return affordable;
    },

    scoreAction(action, gameState) {
        const { target, distance, ships, metalCost } = action;
        let score = 0;
        
        // Base value of target planet - IMPROVED for OPCIÓN A
        score += target.capacity * 15; // Higher base value
        
        // OPCIÓN A: Metal efficiency bonus (value per metal spent)
        const metalEfficiency = target.capacity / metalCost;
        score += metalEfficiency * 10;
        
        // Distance penalty - REDUCED for more action
        score -= distance * 0.03;
        
        // Strategy modifiers - OPCIÓN A specific
        switch (this.strategy) {
            case 'conservative':
                score += target.owner === 'neutral' && target.ships <= 4 ? 80 : -30;
                break;
            case 'aggressive_expansion':
                score += target.owner === 'neutral' ? 60 : 20;
                score += target.capacity > 40 ? 25 : 0; // Bonus for large planets
                break;
            case 'expansion':
                score += target.owner === 'neutral' ? 50 : 15;
                break;
            case 'aggressive':
                score += target.owner === 'player' ? 60 : 30;
                break;
            default:
                score += target.owner === 'neutral' ? 40 : 25;
        }
        
        // Success probability - IMPROVED
        let successChance;
        if (target.owner === 'neutral') {
            successChance = ships > target.ships + 1 ? 0.95 : 0.8;
        } else {
            successChance = ships > target.ships + 2 ? 0.85 : ships > target.ships ? 0.7 : 0.4;
        }
        
        score *= successChance;
        
        // OPCIÓN A: Resource conservation bonus
        if (gameState.resourceHealth === 'poor' && metalCost <= 5) {
            score += 20; // Bonus for small, affordable actions
        }
        
        return score;
    },

    executeAction(action) {
        const { source, target, ships } = action;
        
        if (!source.canSendShips(ships)) {
            return;
        }
        
        // OPCIÓN A: Pay metal cost for sending (1 metal per ship)
        const metalCost = ships;
        if (source.aiMetal >= metalCost) {
            source.aiMetal -= metalCost;
            
            // Create fleet
            FleetManager.createFleet(source, target, ships, 'ai');
            
            // Occasional logging for debugging
            if (Math.random() < 0.15) {
                console.log(`🤖 AI ${this.strategy}: ${ships} ships ${source.id} → ${target.id} (${target.owner}) [Cost: ${metalCost} metal]`);
            }
        }
    }
};