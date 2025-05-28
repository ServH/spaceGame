// AI Module - Simple but effective AI opponent
const AI = {
    lastDecision: 0,
    
    init() {
        this.lastDecision = Date.now();
    },

    update() {
        const now = Date.now();
        
        if (now - this.lastDecision >= CONFIG.AI.DECISION_INTERVAL) {
            this.makeDecision();
            this.lastDecision = now;
        }
    },

    makeDecision() {
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai' && p.ships > CONFIG.AI.MIN_ATTACK_FORCE);
        
        if (aiPlanets.length === 0) return;
        
        // Choose strategy based on situation
        const strategy = this.chooseStrategy();
        
        switch (strategy) {
            case 'expand':
                this.expandToNeutral(aiPlanets);
                break;
            case 'attack':
                this.attackPlayer(aiPlanets);
                break;
            case 'reinforce':
                this.reinforceWeakPlanets(aiPlanets);
                break;
        }
    },

    chooseStrategy() {
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai').length;
        const playerPlanets = GameEngine.planets.filter(p => p.owner === 'player').length;
        const neutralPlanets = GameEngine.planets.filter(p => p.owner === 'neutral').length;
        
        // Prioritize expansion if there are neutral planets
        if (neutralPlanets > 0 && Math.random() < 0.6) {
            return 'expand';
        }
        
        // Attack if AI has advantage
        if (aiPlanets > playerPlanets && Math.random() < CONFIG.AI.AGGRESSION) {
            return 'attack';
        }
        
        // Otherwise expand or reinforce
        return neutralPlanets > 0 ? 'expand' : 'reinforce';
    },

    expandToNeutral(aiPlanets) {
        const neutralPlanets = GameEngine.planets.filter(p => p.owner === 'neutral');
        if (neutralPlanets.length === 0) return;
        
        // Find best expansion opportunity
        let bestOption = null;
        let bestScore = -1;
        
        aiPlanets.forEach(origin => {
            neutralPlanets.forEach(target => {
                const score = this.scoreExpansionTarget(origin, target);
                if (score > bestScore) {
                    bestScore = score;
                    bestOption = { origin, target };
                }
            });
        });
        
        if (bestOption) {
            this.sendAIFleet(bestOption.origin, bestOption.target);
        }
    },

    attackPlayer(aiPlanets) {
        const playerPlanets = GameEngine.planets.filter(p => p.owner === 'player');
        if (playerPlanets.length === 0) return;
        
        // Find best attack opportunity
        let bestOption = null;
        let bestScore = -1;
        
        aiPlanets.forEach(origin => {
            playerPlanets.forEach(target => {
                const score = this.scoreAttackTarget(origin, target);
                if (score > bestScore) {
                    bestScore = score;
                    bestOption = { origin, target };
                }
            });
        });
        
        if (bestOption && bestScore > 0) {
            this.sendAIFleet(bestOption.origin, bestOption.target);
        }
    },

    reinforceWeakPlanets(aiPlanets) {
        // Find weakest AI planet that can be reinforced
        const weakPlanets = GameEngine.planets
            .filter(p => p.owner === 'ai' && p.ships < p.capacity * 0.5)
            .sort((a, b) => a.ships - b.ships);
        
        if (weakPlanets.length === 0) return;
        
        const target = weakPlanets[0];
        const reinforcer = aiPlanets
            .filter(p => p !== target && p.ships > p.capacity * 0.7)
            .sort((a, b) => Utils.distance(a, target) - Utils.distance(b, target))[0];
        
        if (reinforcer) {
            this.sendAIFleet(reinforcer, target);
        }
    },

    scoreExpansionTarget(origin, target) {
        const distance = Utils.distance(origin, target);
        const capacity = target.capacity;
        const shipsNeeded = Math.max(1, target.ships + 1);
        
        if (origin.ships < shipsNeeded) return -1;
        
        // Prefer closer, larger planets
        return (capacity / distance) * 100;
    },

    scoreAttackTarget(origin, target) {
        const distance = Utils.distance(origin, target);
        const shipsNeeded = target.ships + 1;
        const advantage = origin.ships - shipsNeeded;
        
        if (advantage <= 0) return -1;
        
        // Prefer attacks where AI has clear advantage
        return (advantage / distance) * target.capacity;
    },

    sendAIFleet(origin, destination) {
        if (!origin || !destination || origin === destination) return;
        
        // Calculate ships to send
        let shipsToSend;
        
        if (destination.owner === 'neutral') {
            // For neutral planets, send just enough to conquer
            shipsToSend = Math.min(origin.ships, destination.ships + 1);
        } else if (destination.owner === 'player') {
            // For player planets, send more aggressive force
            shipsToSend = Math.min(
                origin.ships, 
                Math.max(destination.ships + 2, Math.floor(origin.ships * 0.7))
            );
        } else {
            // Reinforcement
            const needed = destination.capacity - destination.ships;
            shipsToSend = Math.min(origin.ships, needed);
        }
        
        if (shipsToSend >= CONFIG.AI.MIN_ATTACK_FORCE) {
            FleetManager.createFleet(origin, destination, shipsToSend, 'ai');
        }
    },

    // Advanced AI behaviors for future expansion
    
    evaluateStrategicValue(planet) {
        // Higher capacity planets are more valuable
        let value = planet.capacity;
        
        // Central planets are more valuable (closer to average position)
        const center = this.getMapCenter();
        const distanceFromCenter = Utils.distance(planet, center);
        value += (200 - distanceFromCenter) / 10;
        
        // Planets near player are more strategically important
        const playerPlanets = GameEngine.planets.filter(p => p.owner === 'player');
        if (playerPlanets.length > 0) {
            const avgDistanceToPlayer = playerPlanets.reduce((sum, p) => 
                sum + Utils.distance(planet, p), 0) / playerPlanets.length;
            value += (300 - avgDistanceToPlayer) / 20;
        }
        
        return value;
    },

    getMapCenter() {
        const totalX = GameEngine.planets.reduce((sum, p) => sum + p.x, 0);
        const totalY = GameEngine.planets.reduce((sum, p) => sum + p.y, 0);
        return {
            x: totalX / GameEngine.planets.length,
            y: totalY / GameEngine.planets.length
        };
    },

    // Difficulty scaling
    adjustDifficulty(playerAdvantage) {
        if (playerAdvantage > 2) {
            // Player is winning, make AI more aggressive
            CONFIG.AI.AGGRESSION = Math.min(1, CONFIG.AI.AGGRESSION + 0.1);
            CONFIG.AI.DECISION_INTERVAL = Math.max(1500, CONFIG.AI.DECISION_INTERVAL - 200);
        } else if (playerAdvantage < -1) {
            // AI is winning, reduce aggression slightly
            CONFIG.AI.AGGRESSION = Math.max(0.3, CONFIG.AI.AGGRESSION - 0.05);
            CONFIG.AI.DECISION_INTERVAL = Math.min(4000, CONFIG.AI.DECISION_INTERVAL + 100);
        }
    }
};
