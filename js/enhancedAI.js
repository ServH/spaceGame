// Enhanced AI - V1.3 Fast-paced and adaptive
const EnhancedAI = {
    // Extend existing AI with fast-paced behaviors
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
        AI.init();
        this.currentStrategy = 'blitz';
        console.log('🤖 Enhanced AI initialized for fast gameplay');
    },

    update() {
        this.adaptiveTimer += 16;
        
        // Adapt strategy every 5 seconds
        if (this.adaptiveTimer >= 5000) {
            this.adaptStrategy();
            this.adaptiveTimer = 0;
        }
        
        // Apply current strategy modifiers
        this.applyStrategyModifiers();
        
        // Call original AI update
        AI.update();
    },

    adaptStrategy() {
        const gameState = AI.analyzeGameState();
        const elapsed = Date.now() - GameModes.startTime;
        
        // Late game pressure
        if (elapsed > 45000) { // After 45 seconds
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

    applyStrategyModifiers() {
        const strategy = this.strategies[this.currentStrategy];
        
        // Temporarily modify AI behavior
        const originalAggression = CONFIG.AI.AGGRESSION;
        CONFIG.AI.AGGRESSION = strategy.aggression;
        
        // Restore after AI decision
        setTimeout(() => {
            CONFIG.AI.AGGRESSION = originalAggression;
        }, 100);
    },

    // Override AI decision making for game modes
    makeDecision() {
        if (GameModes.current === 'kingOfHill') {
            return this.makeKingOfHillDecision();
        }
        
        return AI.makeDecision();
    },

    makeKingOfHillDecision() {
        const hill = GameModes.modes.kingOfHill.hillPlanet;
        if (!hill) return AI.makeDecision();
        
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai' && p.ships > 2);
        
        // Priority 1: Take the hill if enemy controls it
        if (hill.owner === 'player') {
            const attacker = this.findBestAttacker(aiPlanets, hill);
            if (attacker) {
                const ships = Math.min(attacker.ships, hill.ships + 3);
                FleetManager.createFleet(attacker, hill, ships, 'ai');
                console.log('🤖 AI attacking hill');
                return;
            }
        }
        
        // Priority 2: Reinforce hill if we control it
        if (hill.owner === 'ai' && hill.ships < hill.capacity * 0.7) {
            const reinforcer = this.findClosestPlanet(aiPlanets, hill);
            if (reinforcer) {
                const ships = Math.min(reinforcer.ships - 1, hill.capacity - hill.ships);
                if (ships > 0) {
                    FleetManager.createFleet(reinforcer, hill, ships, 'ai');
                    console.log('🤖 AI reinforcing hill');
                    return;
                }
            }
        }
        
        // Fallback to normal AI
        AI.makeDecision();
    },

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