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

    analyzeGameState() {
        const planets = GameEngine.planets;
        const myPlanets = planets.filter(p => p.owner === 'ai');
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const neutralPlanets = planets.filter(p => p.owner === 'neutral');
        
        const myTotalShips = myPlanets.reduce((sum, p) => sum + p.ships, 0);
        const playerTotalShips = playerPlanets.reduce((sum, p) => sum + p.ships, 0);
        
        const aiEnergy = ResourceManager.getAIEnergy();
        const aiMetal = myPlanets.reduce((sum, p) => sum + (p.aiMetal || 0), 0);
        
        return {
            myPlanets,
            playerPlanets,
            neutralPlanets,
            myTotalShips,
            playerTotalShips,
            aiEnergy,
            aiMetal,
            shipRatio: myTotalShips / Math.max(playerTotalShips, 1),
            gamePhase: neutralPlanets.length > 2 ? 'expansion' : 'endgame'
        };
    },

    executeAction(action) {
        const { source, target, ships, distance, energyCost } = action;
        
        if (!source.canSendShips(ships)) return;
        
        if (ResourceManager.payForAIMovement(ships, distance)) {
            FleetManager.createFleet(source, target, ships, 'ai');
            
            if (Math.random() < 0.2) {
                console.log(`🤖 AI ${this.strategy}: ${ships} ships ${source.id} → ${target.id} (${target.owner}) [Cost: ${energyCost} energy]`);
            }
        }
    },

    // Additional AI methods (simplified for space)
    adaptStrategy() {
        // Strategy adaptation logic
    },
    
    applyStrategyModifiers() {
        // Strategy modifier application
    },
    
    makeBuildingDecision() {
        // Building decision logic
    },
    
    updateStrategy() {
        // Strategy update logic
    },
    
    selectBestAction() {
        // Action selection logic
        return null;
    }
};

// Legacy EnhancedAI object for backward compatibility
const EnhancedAI = AI;