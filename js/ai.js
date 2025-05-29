// AI Controller - V1.3 Polish Enhanced with Personality Integration
const AI = {
    lastDecision: 0,
    strategy: 'balanced',
    difficulty: 'normal',
    
    init() {
        this.lastDecision = Date.now();
        this.strategy = 'balanced';
        console.log('🤖 AI initialized with personality support');
    },

    update() {
        const now = Date.now();
        
        if (now - this.lastDecision >= CONFIG.AI.DECISION_INTERVAL) {
            this.makeDecision();
            this.lastDecision = now;
        }
    },

    // V1.3 Polish: Enhanced makeDecision that can return decision object
    makeDecision() {
        console.log('🤖 AI making decision...');
        
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai' && p.ships > 1);
        
        if (aiPlanets.length === 0) {
            console.log('🤖 AI has no planets with ships');
            return null;
        }

        // Analyze game state
        const gameState = this.analyzeGameState();
        
        // Update strategy based on personality if available
        this.updateStrategy(gameState);
        
        // Find best action
        const action = this.selectBestAction(gameState);
        
        if (action) {
            // V1.3 Polish: Return decision object for personality modification
            return {
                source: action.source,
                target: action.target,
                ships: action.ships,
                strategy: this.strategy,
                type: action.type
            };
        } else {
            console.log('🤖 AI found no good actions');
            return null;
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

    // V1.3 Polish: Enhanced strategy update with personality consideration
    updateStrategy(gameState) {
        let baseStrategy;
        
        if (gameState.shipRatio < 0.7) {
            baseStrategy = 'defensive';
        } else if (gameState.gamePhase === 'expansion' && gameState.neutralPlanets.length > 0) {
            baseStrategy = 'expansion';
        } else if (gameState.shipRatio > 1.3) {
            baseStrategy = 'aggressive';
        } else {
            baseStrategy = 'balanced';
        }
        
        // V1.3 Polish: Modify strategy based on AI personality
        if (typeof AIPersonalitySystem !== 'undefined') {
            const personality = AIPersonalitySystem.getCurrentPersonality();
            
            if (personality) {
                switch (personality.key) {
                    case 'AGGRESSIVE':
                    case 'BLITZER':
                        // Always lean towards aggressive
                        if (baseStrategy !== 'defensive') {
                            baseStrategy = 'aggressive';
                        }
                        break;
                        
                    case 'DEFENSIVE':
                        // Always lean towards defensive unless overwhelming advantage
                        if (gameState.shipRatio < 1.5) {
                            baseStrategy = 'defensive';
                        }
                        break;
                        
                    case 'ECONOMIC':
                        // Prefer expansion when possible
                        if (gameState.neutralPlanets.length > 0) {
                            baseStrategy = 'expansion';
                        }
                        break;
                        
                    case 'OPPORTUNIST':
                        // Use default strategy but modify execution
                        break;
                }
            }
        }
        
        this.strategy = baseStrategy;
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
            const minShipsToKeep = this.getMinimumShipsToKeep(source, gameState);
            
            if (source.ships <= minShipsToKeep) return;
            
            targets.forEach(target => {
                const distance = Utils.distance(source, target);
                const shipsToSend = this.calculateShipsToSend(source, target, gameState);
                
                if (shipsToSend > 0) {
                    actions.push({
                        type: target.owner === 'neutral' ? 'expand' : 'attack',
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

    // V1.3 Polish: Dynamic minimum ships based on personality
    getMinimumShipsToKeep(planet, gameState) {
        let baseMinimum = 1;
        
        // V1.3 Polish: Adjust based on personality
        if (typeof AIPersonalitySystem !== 'undefined') {
            const personality = AIPersonalitySystem.getCurrentPersonality();
            
            if (personality) {
                switch (personality.key) {
                    case 'DEFENSIVE':
                        baseMinimum = Math.min(planet.ships * 0.3, 3);
                        break;
                    case 'AGGRESSIVE':
                    case 'BLITZER':
                        baseMinimum = Math.max(1, planet.ships * 0.1);
                        break;
                    case 'ECONOMIC':
                        baseMinimum = Math.min(planet.ships * 0.2, 2);
                        break;
                    default:
                        baseMinimum = 1;
                }
            }
        }
        
        return Math.ceil(baseMinimum);
    },

    calculateShipsToSend(source, target, gameState) {
        const minKeep = this.getMinimumShipsToKeep(source, gameState);
        const available = source.ships - minKeep;
        
        if (available <= 0) return 0;
        
        let needed;
        
        if (target.owner === 'neutral') {
            needed = Math.max(1, target.ships + 1);
        } else {
            // Against player, calculate based on strategy and personality
            let multiplier = 1.5; // Base multiplier
            
            // Adjust multiplier based on strategy
            switch (this.strategy) {
                case 'aggressive':
                    multiplier = 1.8;
                    break;
                case 'defensive':
                    multiplier = 2.0; // Send overwhelming force when attacking
                    break;
                case 'expansion':
                    multiplier = 1.3;
                    break;
            }
            
            // V1.3 Polish: Further adjust based on personality
            if (typeof AIPersonalitySystem !== 'undefined') {
                const personality = AIPersonalitySystem.getCurrentPersonality();
                
                if (personality) {
                    multiplier *= personality.multipliers.riskTaking;
                }
            }
            
            needed = Math.max(target.ships + 2, Math.ceil(target.ships * multiplier));
        }
        
        return Math.min(needed, available);
    },

    // V1.3 Polish: Enhanced scoring with personality influence
    scoreAction(action, gameState) {
        const { target, distance, ships } = action;
        let score = 0;
        
        // Base value of target planet
        score += target.capacity * 10;
        
        // Distance penalty (adjusted by personality)
        let distancePenalty = distance * 0.1;
        
        if (typeof AIPersonalitySystem !== 'undefined') {
            const personality = AIPersonalitySystem.getCurrentPersonality();
            
            if (personality) {
                // Aggressive personalities care less about distance
                if (['AGGRESSIVE', 'BLITZER'].includes(personality.key)) {
                    distancePenalty *= 0.7;
                }
                // Defensive personalities care more about distance
                else if (personality.key === 'DEFENSIVE') {
                    distancePenalty *= 1.3;
                }
            }
        }
        
        score -= distancePenalty;
        
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
        
        // V1.3 Polish: Personality-based scoring adjustments
        if (typeof AIPersonalitySystem !== 'undefined') {
            const personality = AIPersonalitySystem.getCurrentPersonality();
            
            if (personality) {
                switch (personality.key) {
                    case 'ECONOMIC':
                        // Prefer higher capacity planets
                        score += target.capacity * 5;
                        break;
                    case 'OPPORTUNIST':
                        // Prefer weak targets
                        if (target.ships < ships * 0.5) {
                            score += 25;
                        }
                        break;
                    case 'BLITZER':
                        // Prefer any action over no action
                        score += 15;
                        break;
                }
            }
        }
        
        // Success probability
        const successChance = target.owner === 'neutral' ? 0.9 : 
                             ships > target.ships ? 0.8 : 0.4;
        score *= successChance;
        
        return score;
    },

    // V1.3 Polish: Execute action directly or return for GameEngine
    executeAction(action) {
        const { source, target, ships } = action;
        
        if (!source.canSendShips(ships)) {
            console.log(`🤖 AI cannot send ${ships} ships from planet ${source.id}`);
            return false;
        }
        
        // Create fleet
        return FleetManager.createFleet(source, target, ships, 'ai');
    }
};