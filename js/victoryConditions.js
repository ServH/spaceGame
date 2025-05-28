// Victory Conditions System - V1.3
// Multiple ways to win based on game mode

const VictoryConditions = {
    // Victory types
    types: {
        TOTAL_CONQUEST: {
            id: 'total_conquest',
            name: 'Conquista Total',
            description: 'Controla todos los planetas',
            checkFunction: 'checkTotalConquest'
        },
        ECONOMIC: {
            id: 'economic',
            name: 'Victoria Económica',
            description: 'Ratio 3:1 de naves + mayoría de planetas',
            checkFunction: 'checkEconomicVictory'
        },
        DOMINATION: {
            id: 'domination',
            name: 'Dominación',
            description: 'Controla 75% de los planetas',
            checkFunction: 'checkDomination'
        },
        TIME: {
            id: 'time',
            name: 'Victoria por Tiempo',
            description: 'Mayoría de planetas al final del tiempo',
            checkFunction: 'checkTimeVictory'
        },
        KING_OF_HILL: {
            id: 'king_of_hill',
            name: 'Rey de la Colina',
            description: 'Controla la colina por 30 segundos',
            checkFunction: 'checkKingOfHill'
        }
    },

    // Last check time to avoid spam
    lastCheckTime: 0,
    checkInterval: 1000, // Check every second

    // Check all victory conditions
    checkVictoryConditions() {
        const now = Date.now();
        if (now - this.lastCheckTime < this.checkInterval) return null;
        this.lastCheckTime = now;

        const activeConditions = GameModes.getVictoryConditions();
        
        for (const conditionId of activeConditions) {
            const condition = Object.values(this.types).find(t => t.id === conditionId);
            if (condition && this[condition.checkFunction]) {
                const result = this[condition.checkFunction]();
                if (result.victory) {
                    return {
                        winner: result.winner,
                        condition: condition.name,
                        description: result.description || condition.description
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
                victory: true,
                winner: 'player',
                description: '¡Has conquistado todos los planetas!'
            };
        }
        
        if (aiPlanets.length === planets.length) {
            return {
                victory: true,
                winner: 'ai',
                description: 'La IA ha conquistado todos los planetas'
            };
        }

        return { victory: false };
    },

    // Check economic victory (3:1 ship ratio + planet majority)
    checkEconomicVictory() {
        const planets = GameEngine.planets;
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const aiPlanets = planets.filter(p => p.owner === 'ai');
        
        // Calculate total ships
        const playerShips = playerPlanets.reduce((sum, p) => sum + p.ships, 0);
        const aiShips = aiPlanets.reduce((sum, p) => sum + p.ships, 0);
        
        // Check 3:1 ratio and planet majority
        if (playerShips >= aiShips * 3 && playerPlanets.length > aiPlanets.length) {
            return {
                victory: true,
                winner: 'player',
                description: `¡Victoria económica! ${playerShips} vs ${aiShips} naves`
            };
        }
        
        if (aiShips >= playerShips * 3 && aiPlanets.length > playerPlanets.length) {
            return {
                victory: true,
                winner: 'ai',
                description: `Victoria económica de la IA: ${aiShips} vs ${playerShips} naves`
            };
        }

        return { victory: false };
    },

    // Check domination victory (75% of planets)
    checkDomination() {
        const planets = GameEngine.planets;
        const threshold = Math.ceil(planets.length * 0.75);
        
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const aiPlanets = planets.filter(p => p.owner === 'ai');
        
        if (playerPlanets.length >= threshold) {
            return {
                victory: true,
                winner: 'player',
                description: `¡Dominación! Controlas ${playerPlanets.length}/${planets.length} planetas`
            };
        }
        
        if (aiPlanets.length >= threshold) {
            return {
                victory: true,
                winner: 'ai',
                description: `La IA domina con ${aiPlanets.length}/${planets.length} planetas`
            };
        }

        return { victory: false };
    },

    // Check time victory (triggered when time runs out)
    checkTimeVictory() {
        // This is called when timer expires
        if (!GameTimer.isActive()) {
            const planets = GameEngine.planets;
            const playerPlanets = planets.filter(p => p.owner === 'player');
            const aiPlanets = planets.filter(p => p.owner === 'ai');
            
            if (playerPlanets.length > aiPlanets.length) {
                return {
                    victory: true,
                    winner: 'player',
                    description: `¡Victoria por tiempo! ${playerPlanets.length} vs ${aiPlanets.length} planetas`
                };
            } else if (aiPlanets.length > playerPlanets.length) {
                return {
                    victory: true,
                    winner: 'ai',
                    description: `Victoria por tiempo de la IA: ${aiPlanets.length} vs ${playerPlanets.length} planetas`
                };
            } else {
                // Tie - check ships
                const playerShips = playerPlanets.reduce((sum, p) => sum + p.ships, 0);
                const aiShips = aiPlanets.reduce((sum, p) => sum + p.ships, 0);
                
                return {
                    victory: true,
                    winner: playerShips >= aiShips ? 'player' : 'ai',
                    description: `Empate resuelto por naves: ${playerShips} vs ${aiShips}`
                };
            }
        }

        return { victory: false };
    },

    // Check King of Hill victory (handled by KingOfHill system)
    checkKingOfHill() {
        // This condition is handled by the KingOfHill system
        // We return false here as KingOfHill calls GameEngine.endGame directly
        return { victory: false };
    },

    // Get victory progress for UI display
    getVictoryProgress() {
        const planets = GameEngine.planets;
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const aiPlanets = planets.filter(p => p.owner === 'ai');
        
        return {
            totalConquest: {
                player: (playerPlanets.length / planets.length) * 100,
                ai: (aiPlanets.length / planets.length) * 100
            },
            domination: {
                player: Math.min(100, (playerPlanets.length / (planets.length * 0.75)) * 100),
                ai: Math.min(100, (aiPlanets.length / (planets.length * 0.75)) * 100)
            },
            economic: this.getEconomicProgress(),
            kingOfHill: KingOfHill ? KingOfHill.getControlProgress() * 100 : 0
        };
    },

    // Get economic victory progress
    getEconomicProgress() {
        const planets = GameEngine.planets;
        const playerPlanets = planets.filter(p => p.owner === 'player');
        const aiPlanets = planets.filter(p => p.owner === 'ai');
        
        const playerShips = playerPlanets.reduce((sum, p) => sum + p.ships, 0);
        const aiShips = aiPlanets.reduce((sum, p) => sum + p.ships, 0);
        
        // Calculate progress towards 3:1 ratio + planet majority
        const playerRatioProgress = aiShips > 0 ? Math.min(100, (playerShips / (aiShips * 3)) * 100) : 100;
        const playerPlanetProgress = aiPlanets.length > 0 ? 
            Math.min(100, (playerPlanets.length / (aiPlanets.length + 1)) * 100) : 100;
        
        const aiRatioProgress = playerShips > 0 ? Math.min(100, (aiShips / (playerShips * 3)) * 100) : 100;
        const aiPlanetProgress = playerPlanets.length > 0 ? 
            Math.min(100, (aiPlanets.length / (playerPlanets.length + 1)) * 100) : 100;
        
        return {
            player: (playerRatioProgress + playerPlanetProgress) / 2,
            ai: (aiRatioProgress + aiPlanetProgress) / 2
        };
    },

    // Handle time up event
    handleTimeUp() {
        const result = this.checkTimeVictory();
        if (result.victory && GameEngine.endGame) {
            GameEngine.endGame(result.winner, result.description);
        }
    },

    // Get active victory conditions for display
    getActiveConditions() {
        const activeIds = GameModes.getVictoryConditions();
        return activeIds.map(id => 
            Object.values(this.types).find(t => t.id === id)
        ).filter(Boolean);
    },

    // Check if specific victory condition is active
    isConditionActive(conditionId) {
        return GameModes.getVictoryConditions().includes(conditionId);
    }
};

// Export for use in other modules
window.VictoryConditions = VictoryConditions;