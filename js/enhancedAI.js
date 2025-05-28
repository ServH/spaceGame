// Enhanced AI System - V1.3
// Adaptive AI with multiple strategies for different game modes

const EnhancedAI = {
    // AI Strategy types
    strategies: {
        BLITZ: {
            name: 'Blitz',
            description: 'Aggressive early expansion',
            aggression: 0.9,
            expansion: 0.8,
            defense: 0.3,
            economyFocus: 0.4
        },
        ECONOMIC: {
            name: 'Economic',
            description: 'Defensive and economy focused',
            aggression: 0.4,
            expansion: 0.6,
            defense: 0.8,
            economyFocus: 0.9
        },
        PRESSURE: {
            name: 'Pressure',
            description: 'Maximum aggression',
            aggression: 1.0,
            expansion: 0.5,
            defense: 0.2,
            economyFocus: 0.3
        },
        ADAPTIVE: {
            name: 'Adaptive',
            description: 'Changes based on game state',
            aggression: 0.7,
            expansion: 0.7,
            defense: 0.6,
            economyFocus: 0.6
        }
    },

    // Current strategy
    currentStrategy: null,
    
    // Game state analysis
    gameState: {
        playerAdvantage: 0,
        timeRemaining: null,
        kingOfHillControl: null,
        territoryRatio: 0.5
    },

    // Initialize enhanced AI
    init() {
        this.currentStrategy = this.strategies.ADAPTIVE;
        console.log('🤖 Enhanced AI initialized with Adaptive strategy');
    },

    // Analyze current game state
    analyzeGameState() {
        const planets = GameEngine.planets;
        const playerPlanets = planets.filter(p => p.owner === 'player').length;
        const aiPlanets = planets.filter(p => p.owner === 'ai').length;
        const totalPlanets = planets.length;

        // Calculate territory ratio
        this.gameState.territoryRatio = aiPlanets / totalPlanets;
        
        // Calculate player advantage (-1 to 1, negative means AI is behind)
        this.gameState.playerAdvantage = (playerPlanets - aiPlanets) / totalPlanets;

        // Get time remaining if applicable
        if (GameTimer && GameTimer.isActive()) {
            this.gameState.timeRemaining = GameTimer.getTimeRemaining();
        }

        // Check King of Hill status
        if (GameModes.hasFeature('kingOfHill') && KingOfHill) {
            this.gameState.kingOfHillControl = KingOfHill.getCurrentController();
        }

        return this.gameState;
    },

    // Select optimal strategy based on game state
    selectStrategy() {
        this.analyzeGameState();
        
        const mode = GameModes.currentMode;
        const state = this.gameState;

        // Mode-specific strategy selection
        if (mode && mode.id === 'blitz') {
            // In blitz mode, adapt based on time and position
            if (state.timeRemaining > 60000) {
                // Early game - expand aggressively
                this.currentStrategy = this.strategies.BLITZ;
            } else if (state.timeRemaining > 30000) {
                // Mid game - adaptive based on position
                this.currentStrategy = state.playerAdvantage > 0.2 ? 
                    this.strategies.PRESSURE : this.strategies.ECONOMIC;
            } else {
                // End game - maximum pressure
                this.currentStrategy = this.strategies.PRESSURE;
            }
        } else if (mode && mode.id === 'kingofhill') {
            // King of Hill strategy
            if (state.kingOfHillControl === 'player') {
                // Player controls hill - pressure them
                this.currentStrategy = this.strategies.PRESSURE;
            } else if (state.kingOfHillControl === 'ai') {
                // AI controls hill - defend it
                this.currentStrategy = this.strategies.ECONOMIC;
            } else {
                // No one controls hill - race for it
                this.currentStrategy = this.strategies.BLITZ;
            }
        } else {
            // Classic mode - adaptive strategy
            if (state.playerAdvantage < -0.3) {
                // AI is ahead - defend advantage
                this.currentStrategy = this.strategies.ECONOMIC;
            } else if (state.playerAdvantage > 0.3) {
                // AI is behind - increase pressure
                this.currentStrategy = this.strategies.PRESSURE;
            } else {
                // Balanced - use adaptive
                this.currentStrategy = this.strategies.ADAPTIVE;
            }
        }

        return this.currentStrategy;
    },

    // Enhanced decision making
    makeDecision() {
        const strategy = this.selectStrategy();
        const planets = GameEngine.planets;
        const aiPlanets = planets.filter(p => p.owner === 'ai');
        
        if (aiPlanets.length === 0) return null;

        // Strategy-specific decision making
        switch (strategy.name) {
            case 'Blitz':
                return this.makeBlitzDecision(aiPlanets, planets);
            case 'Economic':
                return this.makeEconomicDecision(aiPlanets, planets);
            case 'Pressure':
                return this.makePressureDecision(aiPlanets, planets);
            default:
                return this.makeAdaptiveDecision(aiPlanets, planets);
        }
    },

    // Blitz strategy - aggressive expansion
    makeBlitzDecision(aiPlanets, allPlanets) {
        // Priority: Neutral planets > Weak enemy planets > Reinforcement
        const neutralPlanets = allPlanets.filter(p => p.owner === 'neutral');
        const enemyPlanets = allPlanets.filter(p => p.owner === 'player');

        // Find best source planet (most ships)
        const sourcePlanet = aiPlanets.reduce((best, planet) => 
            planet.ships > best.ships ? planet : best
        );

        if (sourcePlanet.ships < 3) return null;

        // Target priority: Neutral > Weak enemy
        let targets = neutralPlanets.concat(
            enemyPlanets.filter(p => p.ships < sourcePlanet.ships * 0.8)
        );

        if (targets.length === 0) return null;

        // Choose closest target
        const target = targets.reduce((closest, planet) => {
            const dist1 = this.getDistance(sourcePlanet, planet);
            const dist2 = this.getDistance(sourcePlanet, closest);
            return dist1 < dist2 ? planet : closest;
        });

        return {
            source: sourcePlanet,
            target: target,
            ships: Math.floor(sourcePlanet.ships * 0.8),
            strategy: 'Blitz'
        };
    },

    // Economic strategy - defend and build up
    makeEconomicDecision(aiPlanets, allPlanets) {
        // Priority: Reinforce weak planets > Expand safely
        const weakPlanets = aiPlanets.filter(p => p.ships < p.capacity * 0.5);
        const neutralPlanets = allPlanets.filter(p => p.owner === 'neutral');

        if (weakPlanets.length > 0) {
            // Reinforce weak planets
            const strongPlanet = aiPlanets.find(p => p.ships > p.capacity * 0.7);
            if (strongPlanet) {
                const weakPlanet = weakPlanets[0];
                return {
                    source: strongPlanet,
                    target: weakPlanet,
                    ships: Math.floor(strongPlanet.ships * 0.3),
                    strategy: 'Economic-Reinforce'
                };
            }
        }

        // Safe expansion to neutrals
        if (neutralPlanets.length > 0) {
            const sourcePlanet = aiPlanets.reduce((best, planet) => 
                planet.ships > best.ships ? planet : best
            );

            if (sourcePlanet.ships > 5) {
                const target = neutralPlanets[0];
                return {
                    source: sourcePlanet,
                    target: target,
                    ships: Math.floor(sourcePlanet.ships * 0.4),
                    strategy: 'Economic-Expand'
                };
            }
        }

        return null;
    },

    // Pressure strategy - maximum aggression
    makePressureDecision(aiPlanets, allPlanets) {
        // Priority: Attack enemy planets > Expand
        const enemyPlanets = allPlanets.filter(p => p.owner === 'player');
        
        if (enemyPlanets.length === 0) return null;

        // Find strongest AI planet
        const sourcePlanet = aiPlanets.reduce((best, planet) => 
            planet.ships > best.ships ? planet : best
        );

        if (sourcePlanet.ships < 2) return null;

        // Target weakest enemy planet
        const target = enemyPlanets.reduce((weakest, planet) => 
            planet.ships < weakest.ships ? planet : weakest
        );

        return {
            source: sourcePlanet,
            target: target,
            ships: Math.floor(sourcePlanet.ships * 0.9),
            strategy: 'Pressure'
        };
    },

    // Adaptive strategy - balanced approach
    makeAdaptiveDecision(aiPlanets, allPlanets) {
        // Use original AI logic but with current strategy modifiers
        const originalDecision = AI.makeDecision();
        
        if (originalDecision) {
            // Apply strategy modifiers
            const modifier = this.currentStrategy.aggression;
            originalDecision.ships = Math.floor(originalDecision.ships * modifier);
            originalDecision.strategy = 'Adaptive';
        }

        return originalDecision;
    },

    // Utility function to calculate distance
    getDistance(planet1, planet2) {
        const dx = planet1.x - planet2.x;
        const dy = planet1.y - planet2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Get current strategy info for debugging
    getCurrentStrategyInfo() {
        return {
            strategy: this.currentStrategy.name,
            gameState: this.gameState,
            description: this.currentStrategy.description
        };
    }
};

// Export for use in other modules
window.EnhancedAI = EnhancedAI;