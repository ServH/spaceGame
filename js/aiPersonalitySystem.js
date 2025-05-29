// AI Personality System - V1.3 Polish
// Randomized AI personalities for varied gameplay experience

const AIPersonalitySystem = {
    // Available personality traits
    personalities: {
        AGGRESSIVE: {
            name: 'Agresivo',
            description: 'Ataca constantemente y toma riesgos',
            multipliers: {
                aggression: 1.3,
                expansion: 0.9,
                defense: 0.7,
                riskTaking: 1.4
            },
            decisionInterval: 2500,
            minAttackForce: 2
        },

        ECONOMIC: {
            name: 'Económico',
            description: 'Se enfoca en expansión y producción',
            multipliers: {
                aggression: 0.7,
                expansion: 1.4,
                defense: 1.1,
                riskTaking: 0.6
            },
            decisionInterval: 3500,
            minAttackForce: 4
        },

        DEFENSIVE: {
            name: 'Defensivo',
            description: 'Prioriza consolidación y defensa',
            multipliers: {
                aggression: 0.6,
                expansion: 0.8,
                defense: 1.5,
                riskTaking: 0.4
            },
            decisionInterval: 4000,
            minAttackForce: 5
        },

        OPPORTUNIST: {
            name: 'Oportunista',
            description: 'Aprovecha debilidades del enemigo',
            multipliers: {
                aggression: 1.1,
                expansion: 1.1,
                defense: 0.9,
                riskTaking: 1.2
            },
            decisionInterval: 2800,
            minAttackForce: 3
        },

        BALANCED: {
            name: 'Equilibrado',
            description: 'Estrategia mixta y adaptable',
            multipliers: {
                aggression: 1.0,
                expansion: 1.0,
                defense: 1.0,
                riskTaking: 1.0
            },
            decisionInterval: 3000,
            minAttackForce: 3
        },

        BLITZER: {
            name: 'Blitz',
            description: 'Decisiones rápidas y ataques constantes',
            multipliers: {
                aggression: 1.5,
                expansion: 1.2,
                defense: 0.5,
                riskTaking: 1.6
            },
            decisionInterval: 1800,
            minAttackForce: 1
        }
    },

    // Current personality
    currentPersonality: null,
    originalAIConfig: null,

    // Initialize personality system
    init() {
        this.originalAIConfig = {
            DECISION_INTERVAL: CONFIG.AI.DECISION_INTERVAL,
            AGGRESSION: CONFIG.AI.AGGRESSION,
            MIN_ATTACK_FORCE: CONFIG.AI.MIN_ATTACK_FORCE
        };

        this.selectRandomPersonality();
        console.log(`🤖 AI Personality: ${this.currentPersonality.name} - ${this.currentPersonality.description}`);
    },

    // Select random personality based on game mode
    selectRandomPersonality() {
        const mode = GameModes.currentMode;
        let availablePersonalities = Object.keys(this.personalities);

        // Filter personalities based on game mode
        if (mode && mode.id === 'blitz') {
            // In blitz mode, favor aggressive personalities
            availablePersonalities = availablePersonalities.filter(p => 
                ['AGGRESSIVE', 'BLITZER', 'OPPORTUNIST'].includes(p)
            );
        } else if (mode && mode.id === 'kingofhill') {
            // In king of hill, favor aggressive and opportunistic
            availablePersonalities = availablePersonalities.filter(p => 
                ['AGGRESSIVE', 'OPPORTUNIST', 'BLITZER', 'BALANCED'].includes(p)
            );
        }

        // Add some randomness while weighting certain personalities
        const weights = this.getPersonalityWeights(availablePersonalities);
        const selectedKey = this.weightedRandomSelect(availablePersonalities, weights);
        
        this.currentPersonality = {
            key: selectedKey,
            ...this.personalities[selectedKey]
        };

        this.applyPersonality();
    },

    // Get personality weights based on context
    getPersonalityWeights(personalities) {
        const weights = {};
        const mode = GameModes.currentMode;

        personalities.forEach(p => {
            weights[p] = 1.0; // Base weight

            // Adjust weights based on mode
            if (mode && mode.id === 'blitz') {
                if (['AGGRESSIVE', 'BLITZER'].includes(p)) weights[p] = 2.0;
                if (p === 'DEFENSIVE') weights[p] = 0.3;
            } else if (mode && mode.id === 'kingofhill') {
                if (['OPPORTUNIST', 'AGGRESSIVE'].includes(p)) weights[p] = 1.8;
                if (p === 'ECONOMIC') weights[p] = 0.6;
            } else {
                // Classic mode - balanced distribution
                weights[p] = 1.0;
            }
        });

        return weights;
    },

    // Weighted random selection
    weightedRandomSelect(items, weights) {
        const totalWeight = items.reduce((sum, item) => sum + weights[item], 0);
        let random = Math.random() * totalWeight;

        for (const item of items) {
            random -= weights[item];
            if (random <= 0) {
                return item;
            }
        }

        return items[0]; // Fallback
    },

    // Apply personality to AI configuration
    applyPersonality() {
        if (!this.currentPersonality) return;

        const personality = this.currentPersonality;

        // Apply decision interval
        CONFIG.AI.DECISION_INTERVAL = personality.decisionInterval;

        // Apply aggression multiplier
        CONFIG.AI.AGGRESSION = this.originalAIConfig.AGGRESSION * personality.multipliers.aggression;

        // Apply minimum attack force
        CONFIG.AI.MIN_ATTACK_FORCE = personality.minAttackForce;

        // Store personality multipliers for use by AI systems
        CONFIG.AI.PERSONALITY = {
            ...personality.multipliers,
            name: personality.name,
            description: personality.description
        };

        console.log(`🧠 Applied ${personality.name} personality:`, CONFIG.AI.PERSONALITY);
    },

    // Get current personality info
    getCurrentPersonality() {
        return this.currentPersonality;
    },

    // Modify AI decision based on personality
    modifyDecision(decision, gameState) {
        if (!decision || !this.currentPersonality) return decision;

        const personality = this.currentPersonality;
        const multipliers = personality.multipliers;

        // Adjust ship count based on risk taking
        if (decision.ships) {
            decision.ships = Math.floor(decision.ships * multipliers.riskTaking);
        }

        // Modify strategy based on personality
        if (personality.key === 'AGGRESSIVE' || personality.key === 'BLITZER') {
            // Aggressive personalities attack with fewer ships
            decision.ships = Math.max(1, Math.floor(decision.ships * 0.8));
        } else if (personality.key === 'DEFENSIVE') {
            // Defensive personalities send more ships for security
            decision.ships = Math.floor(decision.ships * 1.2);
        } else if (personality.key === 'OPPORTUNIST') {
            // Opportunists adjust based on target strength
            if (decision.target && decision.target.ships < decision.ships * 0.5) {
                // Weak target - send minimal force
                decision.ships = Math.max(1, decision.target.ships + 1);
            }
        }

        return decision;
    },

    // Check if personality should react to game state
    shouldReactToState(gameState) {
        if (!this.currentPersonality) return false;

        const personality = this.currentPersonality;
        const playerAdvantage = gameState.playerAdvantage || 0;

        // Different personalities react differently to being behind/ahead
        if (personality.key === 'AGGRESSIVE' || personality.key === 'BLITZER') {
            // Always reactive
            return true;
        } else if (personality.key === 'DEFENSIVE') {
            // Only react when significantly behind
            return playerAdvantage > 0.3;
        } else if (personality.key === 'OPPORTUNIST') {
            // React to any significant advantage change
            return Math.abs(playerAdvantage) > 0.2;
        }

        return Math.abs(playerAdvantage) > 0.25;
    },

    // Get personality-based strategy preference
    getStrategyPreference(availableStrategies) {
        if (!this.currentPersonality || !availableStrategies) return null;

        const personality = this.currentPersonality;

        switch (personality.key) {
            case 'AGGRESSIVE':
            case 'BLITZER':
                return availableStrategies.find(s => s.name === 'Pressure') || 
                       availableStrategies.find(s => s.name === 'Blitz');

            case 'ECONOMIC':
                return availableStrategies.find(s => s.name === 'Economic');

            case 'DEFENSIVE':
                return availableStrategies.find(s => s.name === 'Economic') ||
                       availableStrategies.find(s => s.name === 'Adaptive');

            case 'OPPORTUNIST':
                // Changes strategy based on situation
                return null; // Let enhanced AI choose

            default:
                return availableStrategies.find(s => s.name === 'Adaptive');
        }
    },

    // Reset to original configuration
    reset() {
        if (this.originalAIConfig) {
            CONFIG.AI.DECISION_INTERVAL = this.originalAIConfig.DECISION_INTERVAL;
            CONFIG.AI.AGGRESSION = this.originalAIConfig.AGGRESSION;
            CONFIG.AI.MIN_ATTACK_FORCE = this.originalAIConfig.MIN_ATTACK_FORCE;
        }

        delete CONFIG.AI.PERSONALITY;
        this.currentPersonality = null;
        console.log('🤖 AI Personality reset to defaults');
    },

    // Show personality notification
    showPersonalityNotification() {
        if (!this.currentPersonality) return;

        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.showNotification(
                `IA ${this.currentPersonality.name}: ${this.currentPersonality.description}`,
                'info',
                4000
            );
        }
    }
};

// Export for use in other modules
window.AIPersonalitySystem = AIPersonalitySystem;