// AI Controller - Fixed and functional AI based on SpaceIndustry
const AI = {
    lastDecision: 0,
    strategy: 'balanced',
    difficulty: 'normal',
    
    init() {
        this.lastDecision = Date.now();
        this.strategy = 'balanced';
        console.log('🤖 AI initialized');
    },

    update() {
        const now = Date.now();
        
        if (now - this.lastDecision >= CONFIG.AI.DECISION_INTERVAL) {
            this.makeDecision();
            this.lastDecision = now;
        }
    },

    makeDecision() {
        console.log('🤖 AI making decision...');
        
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai' && p.ships > 1);
        
        if (aiPlanets.length === 0) {
            console.log('🤖 AI has no planets with ships');
            return;
        }

        // Analyze game state
        const gameState = this.analyzeGameState();
        
        // Update strategy
        this.updateStrategy(gameState);
        
        // Find best action
        const action = this.selectBestAction(gameState);
        
        if (action) {
            this.executeAction(action);
            console.log(`🤖 AI action: ${action.ships} ships from planet ${action.source.id} to ${action.target.id}`);
        } else {
            console.log('🤖 AI found no good actions');
        }
    },

    analyzeGameState() {
        const planets = GameEngine.planets;
        const myPlanets = planets.filter(p => p.owner === 'ai');
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const neutralPlanets = planets.filter(p => p.owner === 'neutral');
        
        const myTotalShips = myPlanets.reduce((sum, p) => sum + p.ships, 0);
        const playerTotalShips = playerPlanets.reduce((sum, p) => sum + p.ships, 0);
        
        return {
            myPlanets,
            playerPlanets,
            neutralPlanets,
            myTotalShips,
            playerTotalShips,
            shipRatio: myTotalShips / Math.max(playerTotalShips, 1),
            gamePhase: neutralPlanets.length > 0 ? 'expansion' : 'endgame'
        };
    },

    updateStrategy(gameState) {
        if (gameState.shipRatio < 0.7) {
            this.strategy = 'defensive';
        } else if (gameState.gamePhase === 'expansion' && gameState.neutralPlanets.length > 0) {
            this.strategy = 'expansion';
        } else if (gameState.shipRatio > 1.3) {
            this.strategy = 'aggressive';
        } else {
            this.strategy = 'balanced';
        }
    },

    selectBestAction(gameState) {
        const actions = this.generatePossibleActions(gameState);
        
        if (actions.length === 0) return null;
        
        // Score actions
        const scoredActions = actions.map(action => ({
            ...action,
            score: this.scoreAction(action, gameState)
        }));
        
        // Sort by score
        scoredActions.sort((a, b) => b.score - a.score);
        
        return scoredActions[0];
    },

    generatePossibleActions(gameState) {
        const actions = [];
        const targets = [...gameState.playerPlanets, ...gameState.neutralPlanets];
        
        gameState.myPlanets.forEach(source => {
            if (source.ships <= 1) return; // Keep 1 ship for defense
            
            targets.forEach(target => {
                const distance = Utils.distance(source, target);
                const shipsToSend = this.calculateShipsToSend(source, target);
                
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

    calculateShipsToSend(source, target) {
        let needed;
        
        if (target.owner === 'neutral') {
            needed = Math.max(1, target.ships + 1);
        } else {
            // Against player, send overwhelming force
            needed = Math.max(target.ships + 2, Math.ceil(target.ships * 1.5));
        }
        
        const available = source.ships - 1; // Keep 1 for defense
        return Math.min(needed, available);
    },

    scoreAction(action, gameState) {
        const { target, distance, ships } = action;
        let score = 0;
        
        // Base value of target planet
        score += target.capacity * 10;
        
        // Distance penalty
        score -= distance * 0.1;
        
        // Strategy modifiers
        switch (this.strategy) {
            case 'expansion':
                score += target.owner === 'neutral' ? 50 : 10;
                break;
            case 'aggressive':
                score += target.owner === 'player' ? 50 : 20;
                break;
            case 'defensive':
                score += target.owner === 'player' ? 30 : 40;
                break;
            default:
                score += target.owner === 'neutral' ? 35 : 25;
        }
        
        // Success probability
        const successChance = target.owner === 'neutral' ? 0.9 : 
                             ships > target.ships ? 0.8 : 0.4;
        score *= successChance;
        
        return score;
    },

    executeAction(action) {
        const { source, target, ships } = action;
        
        if (!source.canSendShips(ships)) {
            console.log(`🤖 AI cannot send ${ships} ships from planet ${source.id}`);
            return;
        }
        
        // Create fleet
        FleetManager.createFleet(source, target, ships, 'ai');
    }
};