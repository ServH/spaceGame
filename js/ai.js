// AI Controller - CRITICAL FIX - Resource-aware AI for balanced economy
const AI = {
    lastDecision: 0,
    strategy: 'balanced',
    difficulty: 'normal',
    
    init() {
        this.lastDecision = Date.now();
        this.strategy = 'balanced';
        console.log('🤖 AI initialized with resource awareness');
    },

    update() {
        const now = Date.now();
        
        // BALANCED: Faster AI decisions for more dynamic gameplay
        const decisionInterval = CONFIG.AI?.DECISION_INTERVAL || 2500;
        
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

        // Analyze game state including resource situation
        const gameState = this.analyzeGameState();
        
        // Update strategy based on resources
        this.updateStrategy(gameState);
        
        // Find best action considering resource constraints
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
        
        // CRITICAL: Analyze AI resource situation
        const myTotalMetal = myPlanets.reduce((sum, p) => sum + (p.aiMetal || 0), 0);
        const avgMetalPerPlanet = myTotalMetal / Math.max(myPlanets.length, 1);
        
        // Calculate metal generation capacity
        const metalGeneration = myPlanets.reduce((sum, p) => sum + (p.getAIMetalGeneration ? p.getAIMetalGeneration() : 0), 0);
        
        return {
            myPlanets,
            playerPlanets,
            neutralPlanets,
            myTotalShips,
            playerTotalShips,
            myTotalMetal,
            avgMetalPerPlanet,
            metalGeneration,
            shipRatio: myTotalShips / Math.max(playerTotalShips, 1),
            gamePhase: neutralPlanets.length > 2 ? 'expansion' : 'endgame',
            resourceHealth: avgMetalPerPlanet > 20 ? 'good' : avgMetalPerPlanet > 10 ? 'medium' : 'poor'
        };
    },

    updateStrategy(gameState) {
        // IMPROVED: Resource-aware strategy selection
        if (gameState.resourceHealth === 'poor') {
            this.strategy = 'conservative'; // New strategy for low resources
        } else if (gameState.shipRatio < 0.6) {
            this.strategy = 'defensive';
        } else if (gameState.gamePhase === 'expansion' && gameState.neutralPlanets.length > 0) {
            this.strategy = 'expansion';
        } else if (gameState.shipRatio > 1.5 && gameState.resourceHealth === 'good') {
            this.strategy = 'aggressive';
        } else {
            this.strategy = 'balanced';
        }
    },

    selectBestAction(gameState) {
        const actions = this.generatePossibleActions(gameState);
        
        if (actions.length === 0) return null;
        
        // CRITICAL: Filter actions by resource constraints
        const affordableActions = actions.filter(action => this.canAffordAction(action, gameState));
        
        if (affordableActions.length === 0) {
            // If no actions are affordable, try smaller forces
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

    // CRITICAL: Check if AI can afford an action
    canAffordAction(action, gameState) {
        // No direct cost for sending ships (they cost metal to CREATE, not SEND)
        // But check if the source planet has enough ships
        return action.source.ships >= action.ships + 1; // Keep 1 for defense
    },

    // NEW: Generate a conservative action when resources are low
    generateConservativeAction(gameState) {
        // Find the weakest neutral target
        const weakestNeutral = gameState.neutralPlanets
            .filter(p => p.ships <= 5)
            .sort((a, b) => a.ships - b.ships)[0];
        
        if (!weakestNeutral) return null;
        
        // Find closest AI planet with enough ships
        const sourcePlanet = gameState.myPlanets
            .filter(p => p.ships > weakestNeutral.ships + 1)
            .sort((a, b) => Utils.distance(a, weakestNeutral) - Utils.distance(b, weakestNeutral))[0];
        
        if (!sourcePlanet) return null;
        
        return {
            type: 'conservative_attack',
            source: sourcePlanet,
            target: weakestNeutral,
            ships: weakestNeutral.ships + 1,
            distance: Utils.distance(sourcePlanet, weakestNeutral)
        };
    },

    generatePossibleActions(gameState) {
        const actions = [];
        
        // IMPROVED: Prioritize targets based on strategy and resources
        let targets = [];
        
        switch (this.strategy) {
            case 'conservative':
                // Only attack weakest neutrals
                targets = gameState.neutralPlanets.filter(p => p.ships <= 6);
                break;
                
            case 'expansion':
                // Prioritize neutrals, then weak player planets
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets.filter(p => p.ships <= 8)
                ];
                break;
                
            case 'aggressive':
                // Attack everything, prioritize player planets
                targets = [
                    ...gameState.playerPlanets,
                    ...gameState.neutralPlanets
                ];
                break;
                
            default:
                // Balanced approach
                targets = [
                    ...gameState.neutralPlanets,
                    ...gameState.playerPlanets
                ];
        }
        
        gameState.myPlanets.forEach(source => {
            if (source.ships <= 2) return; // Need more ships for conservative play
            
            targets.forEach(target => {
                const distance = Utils.distance(source, target);
                const shipsToSend = this.calculateShipsToSend(source, target, gameState);
                
                if (shipsToSend > 0) {
                    actions.push({
                        type: 'attack',
                        source,
                        target,
                        ships: shipsToSend,
                        distance
                    });
                }
            });
        });
        
        return actions;
    },

    // IMPROVED: Better ship calculation considering resources
    calculateShipsToSend(source, target, gameState) {
        let needed;
        
        if (target.owner === 'neutral') {
            // Against neutrals: just enough to win + buffer
            needed = target.ships + 2;
        } else {
            // Against player: more force needed
            needed = Math.max(target.ships + 3, Math.ceil(target.ships * 1.3));
        }
        
        const available = source.ships - 2; // Keep 2 for defense (was 1)
        const affordable = Math.min(needed, available);
        
        // BALANCED: Scale down if resource health is poor
        if (gameState.resourceHealth === 'poor') {
            return Math.min(affordable, Math.floor(affordable * 0.7));
        } else if (gameState.resourceHealth === 'medium') {
            return Math.min(affordable, Math.floor(affordable * 0.85));
        }
        
        return affordable;
    },

    scoreAction(action, gameState) {
        const { target, distance, ships } = action;
        let score = 0;
        
        // Base value of target planet - IMPROVED
        score += target.capacity * 12; // Increased base value
        
        // Resource value bonus
        if (target.owner === 'neutral' && target.aiMetal) {
            score += target.aiMetal * 0.5; // Bonus for metal on neutral planets
        }
        
        // Distance penalty - REDUCED for more action
        score -= distance * 0.05; // Was 0.1
        
        // Strategy modifiers - IMPROVED
        switch (this.strategy) {
            case 'conservative':
                score += target.owner === 'neutral' && target.ships <= 5 ? 60 : -20;
                break;
            case 'expansion':
                score += target.owner === 'neutral' ? 45 : 15;
                score += target.capacity > 25 ? 20 : 0; // Bonus for large planets
                break;
            case 'aggressive':
                score += target.owner === 'player' ? 55 : 25;
                score += target.ships > 10 ? 15 : 0; // Bonus for taking down strong targets
                break;
            case 'defensive':
                // Prefer close targets and neutrals
                score += target.owner === 'player' ? 25 : 35;
                score -= distance * 0.1; // Extra distance penalty
                break;
            default:
                score += target.owner === 'neutral' ? 35 : 25;
        }
        
        // Success probability - IMPROVED
        let successChance;
        if (target.owner === 'neutral') {
            successChance = ships > target.ships + 1 ? 0.95 : 0.7;
        } else {
            successChance = ships > target.ships + 2 ? 0.8 : ships > target.ships ? 0.6 : 0.3;
        }
        
        score *= successChance;
        
        // Resource efficiency bonus
        const efficiency = target.capacity / Math.max(ships, 1);
        score += efficiency * 5;
        
        return score;
    },

    executeAction(action) {
        const { source, target, ships } = action;
        
        if (!source.canSendShips(ships)) {
            return;
        }
        
        // Create fleet - ships are FREE to send, only cost metal when created
        FleetManager.createFleet(source, target, ships, 'ai');
        
        // Occasional logging for debugging
        if (Math.random() < 0.1) {
            console.log(`🤖 AI ${this.strategy}: ${ships} ships ${source.id} → ${target.id} (${target.owner})`);
        }
    }
};