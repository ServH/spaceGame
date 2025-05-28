// Victory Conditions System - V1.3 Revised
// Updated thresholds based on user feedback

const VictoryConditions = {
    // Available victory conditions
    conditions: {
        TOTAL_CONQUEST: {
            id: 'total_conquest',
            name: 'Conquista Total',
            description: 'Controla todos los planetas',
            check: () => VictoryConditions.checkTotalConquest()
        },
        
        ECONOMIC: {
            id: 'economic',
            name: 'Victoria Económica',
            description: 'Ratio 4:1 de naves + mayoría de planetas',
            check: () => VictoryConditions.checkEconomic()
        },
        
        DOMINATION: {
            id: 'domination',
            name: 'Dominación',
            description: 'Control del 85% de planetas',
            check: () => VictoryConditions.checkDomination()
        },
        
        TIME: {
            id: 'time',
            name: 'Victoria por Tiempo',
            description: 'Mayoría de planetas al final del tiempo',
            check: () => VictoryConditions.checkTimeVictory()
        },
        
        KING_OF_HILL: {
            id: 'king_of_hill',
            name: 'Rey de la Colina',
            description: 'Controlar la colina por 45 segundos',
            check: () => VictoryConditions.checkKingOfHill()
        }
    },

    // Last check results to prevent spam
    lastCheckResults: {},

    // Initialize victory system
    init() {
        console.log('🏆 Victory Conditions system initialized');
    },

    // Check all active victory conditions
    checkVictoryConditions() {
        const activeConditions = GameModes.getVictoryConditions();
        
        for (const conditionId of activeConditions) {
            const condition = this.conditions[conditionId.toUpperCase()];
            if (condition) {
                const result = condition.check();
                if (result && result.winner) {
                    console.log(`🏆 Victory by ${condition.name}: ${result.winner} wins!`);
                    return {
                        winner: result.winner,
                        condition: condition.name,
                        details: result.details
                    };
                }
            }
        }

        return null;
    },

    // Check total conquest victory
    checkTotalConquest() {
        const planets = GameEngine.planets;
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const aiPlanets = planets.filter(p => p.owner === 'ai');

        if (playerPlanets.length === planets.length) {
            return { 
                winner: 'player',
                details: 'Conquered all planets'
            };
        }

        if (aiPlanets.length === planets.length) {
            return { 
                winner: 'ai',
                details: 'AI conquered all planets'
            };
        }

        return null;
    },

    // Check economic victory with dynamic ratio
    checkEconomic() {
        const planets = GameEngine.planets;
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const aiPlanets = planets.filter(p => p.owner === 'ai');
        
        const playerShips = playerPlanets.reduce((total, p) => total + p.ships, 0);
        const aiShips = aiPlanets.reduce((total, p) => total + p.ships, 0);

        // Get ratio from game mode (default 3:1, now 4:1 for blitz)
        const requiredRatio = GameModes.getEconomicRatio();

        // Check player economic victory
        if (playerPlanets.length > aiPlanets.length && 
            playerShips >= aiShips * requiredRatio) {
            return { 
                winner: 'player',
                details: `Economic superiority: ${playerShips} vs ${aiShips} ships (${requiredRatio}:1 ratio), ${playerPlanets.length} vs ${aiPlanets.length} planets`
            };
        }

        // Check AI economic victory
        if (aiPlanets.length > playerPlanets.length && 
            aiShips >= playerShips * requiredRatio) {
            return { 
                winner: 'ai',
                details: `AI economic superiority: ${aiShips} vs ${playerShips} ships (${requiredRatio}:1 ratio), ${aiPlanets.length} vs ${playerPlanets.length} planets`
            };
        }

        return null;
    },

    // Check domination victory with dynamic threshold
    checkDomination() {
        const planets = GameEngine.planets;
        const totalPlanets = planets.length;
        
        // Get threshold from game mode (default 75%, now 85% for blitz)
        const thresholdPercentage = GameModes.getDominationThreshold();
        const threshold = Math.ceil(totalPlanets * thresholdPercentage);
        
        const playerPlanets = planets.filter(p => p.owner === 'player').length;
        const aiPlanets = planets.filter(p => p.owner === 'ai').length;

        if (playerPlanets >= threshold) {
            return { 
                winner: 'player',
                details: `Domination: ${playerPlanets}/${totalPlanets} planets (${Math.round(playerPlanets/totalPlanets*100)}%, needed ${Math.round(thresholdPercentage*100)}%)`
            };
        }

        if (aiPlanets >= threshold) {
            return { 
                winner: 'ai',
                details: `AI domination: ${aiPlanets}/${totalPlanets} planets (${Math.round(aiPlanets/totalPlanets*100)}%, needed ${Math.round(thresholdPercentage*100)}%)`
            };
        }

        return null;
    },

    // Check time victory (for timed modes)
    checkTimeVictory() {
        if (!GameTimer || !GameTimer.isActive()) {
            return null;
        }

        const timeRemaining = GameTimer.getTimeRemaining();
        if (timeRemaining > 0) {
            return null;
        }

        const planets = GameEngine.planets;
        const playerPlanets = planets.filter(p => p.owner === 'player').length;
        const aiPlanets = planets.filter(p => p.owner === 'ai').length;

        if (playerPlanets > aiPlanets) {
            return { 
                winner: 'player',
                details: `Time victory: ${playerPlanets} vs ${aiPlanets} planets`
            };
        } else if (aiPlanets > playerPlanets) {
            return { 
                winner: 'ai',
                details: `AI time victory: ${aiPlanets} vs ${playerPlanets} planets`
            };
        } else {
            return { 
                winner: 'tie',
                details: `Draw: ${playerPlanets} vs ${aiPlanets} planets`
            };
        }
    },

    // Check King of Hill victory
    checkKingOfHill() {
        // KingOfHill handles its own victory detection
        return null;
    },

    // Get victory progress for UI display
    getVictoryProgress() {
        const activeConditions = GameModes.getVictoryConditions();
        const progress = {};

        for (const conditionId of activeConditions) {
            const condition = this.conditions[conditionId.toUpperCase()];
            if (condition) {
                progress[conditionId] = this.getConditionProgress(conditionId);
            }
        }

        return progress;
    },

    // Get progress for a specific condition
    getConditionProgress(conditionId) {
        const planets = GameEngine.planets;
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const aiPlanets = planets.filter(p => p.owner === 'ai');
        
        switch (conditionId.toLowerCase()) {
            case 'total_conquest':
                return {
                    player: (playerPlanets.length / planets.length) * 100,
                    ai: (aiPlanets.length / planets.length) * 100
                };

            case 'domination':
                const thresholdPercentage = GameModes.getDominationThreshold();
                const threshold = Math.ceil(planets.length * thresholdPercentage);
                return {
                    player: (playerPlanets.length / threshold) * 100,
                    ai: (aiPlanets.length / threshold) * 100,
                    threshold: threshold,
                    percentage: Math.round(thresholdPercentage * 100)
                };

            case 'economic':
                const playerShips = playerPlanets.reduce((total, p) => total + p.ships, 0);
                const aiShips = aiPlanets.reduce((total, p) => total + p.ships, 0);
                const requiredRatio = GameModes.getEconomicRatio();
                return {
                    player: { ships: playerShips, planets: playerPlanets.length },
                    ai: { ships: aiShips, planets: aiPlanets.length },
                    requiredRatio: requiredRatio,
                    playerRatio: aiShips > 0 ? playerShips / aiShips : 0,
                    aiRatio: playerShips > 0 ? aiShips / playerShips : 0
                };

            case 'time':
                if (GameTimer && GameTimer.isActive()) {
                    return {
                        timeRemaining: GameTimer.getTimeRemaining(),
                        player: playerPlanets.length,
                        ai: aiPlanets.length
                    };
                }
                return null;

            case 'king_of_hill':
                if (KingOfHill) {
                    return {
                        controller: KingOfHill.getCurrentController(),
                        progress: KingOfHill.getControlProgress() * 100,
                        timeNeeded: GameModes.getKingOfHillTime() / 1000
                    };
                }
                return null;

            default:
                return null;
        }
    },

    // Get formatted victory status for UI
    getVictoryStatus() {
        const progress = this.getVictoryProgress();
        const status = [];

        for (const [conditionId, data] of Object.entries(progress)) {
            const condition = this.conditions[conditionId.toUpperCase()];
            if (condition && data) {
                status.push({
                    name: condition.name,
                    description: condition.description,
                    progress: data
                });
            }
        }

        return status;
    }
};

// Export for use in other modules
window.VictoryConditions = VictoryConditions;