// Building Definitions - ENERGY AS FUEL SYSTEM V2.0
const Buildings = {
    
    // Building type definitions - REBALANCED FOR ENERGY FUEL
    types: {
        shipyard: {
            id: 'shipyard',
            name: 'Astillero',
            icon: '🏭',
            description: '+50% velocidad de producción de naves',
            cost: {
                metal: 60,  // Reduced cost (metal is scarcer)
                energy: 0
            },
            buildTime: 60000, // 60 seconds
            maxLevel: 1,
            effects: {
                shipProductionRate: 1.5 // 50% faster ship production
            },
            visual: {
                color: '#4a90e2',
                size: 'medium'
            }
        },
        
        research_lab: {
            id: 'research_lab',
            name: 'Laboratorio de Energía',
            icon: '🔬',
            description: '+6 energía/min + puntos de investigación',
            cost: {
                metal: 40,  // Cheaper - very important building
                energy: 15  // Small energy investment
            },
            buildTime: 50000, // Faster build - 50 seconds
            maxLevel: 1,
            effects: {
                energyGeneration: 6.0,     // +6 energy per minute (CRITICAL)
                researchPoints: 1.0        // For future tech tree
            },
            visual: {
                color: '#9b59b6',
                size: 'medium'
            },
            // ENERGY FUEL: Special properties
            priority: 'critical',
            aiPriority: 90,  // AI should prioritize this highly
            description_extended: 'Genera energía adicional para alimentar tus flotas. Esencial para operaciones militares a gran escala.'
        },
        
        mining_complex: {
            id: 'mining_complex',
            name: 'Complejo Minero',
            icon: '⛏️',
            description: '+100% producción de metal del planeta',
            cost: {
                metal: 80,  // Higher cost (metal for construction only)
                energy: 0
            },
            buildTime: 70000, // 70 seconds
            maxLevel: 1,
            effects: {
                metalGeneration: 2.0 // Double metal generation
            },
            visual: {
                color: '#e67e22',
                size: 'large'
            }
        }
    },

    // Get building definition by ID
    getDefinition(buildingId) {
        return this.types[buildingId] || null;
    },

    // Get all available building types
    getAllTypes() {
        return Object.keys(this.types).filter(id => {
            const building = this.types[id];
            return building.unlocked !== false;
        });
    },

    // ENERGY FUEL: Enhanced affordability check
    canAfford(buildingId, playerResources) {
        const building = this.getDefinition(buildingId);
        if (!building) return false;
        
        return playerResources.metal >= building.cost.metal && 
               playerResources.energy >= building.cost.energy;
    },

    // ENERGY FUEL: AI affordability check
    canAIAfford(buildingId, aiMetal, aiEnergy) {
        const building = this.getDefinition(buildingId);
        if (!building) return false;
        
        return aiMetal >= building.cost.metal && 
               aiEnergy >= building.cost.energy;
    },

    // Get building cost as formatted string
    getCostString(buildingId) {
        const building = this.getDefinition(buildingId);
        if (!building) return '';
        
        let costString = `${building.cost.metal} Metal`;
        if (building.cost.energy > 0) {
            costString += ` + ${building.cost.energy} Energy`;
        }
        return costString;
    },

    // Get building time as formatted string
    getBuildTimeString(buildingId) {
        const building = this.getDefinition(buildingId);
        if (!building) return '';
        
        const seconds = Math.ceil(building.buildTime / 1000);
        return `${seconds}s`;
    },

    // Check if building can be built on planet (space limits)
    canBuildOnPlanet(buildingId, planet) {
        const building = this.getDefinition(buildingId);
        if (!building) return false;
        
        // Check if building already exists
        if (planet.buildings && planet.buildings[buildingId] && planet.buildings[buildingId].level > 0) {
            return false; // Already built (max level 1 for now)
        }
        
        // Check building slots
        const currentBuildings = this.getBuiltCount(planet);
        const maxBuildings = CONFIG.BUILDINGS?.MAX_PER_PLANET || 3;
        
        return currentBuildings < maxBuildings;
    },

    // Get count of built buildings on planet
    getBuiltCount(planet) {
        if (!planet.buildings) return 0;
        
        return Object.values(planet.buildings).reduce((count, building) => {
            return count + (building.level > 0 ? 1 : 0);
        }, 0);
    },

    // ENERGY FUEL: Apply building effects to planet
    applyEffects(planet, buildingId) {
        const building = this.getDefinition(buildingId);
        if (!building || !building.effects) return;
        
        console.log(`⚡ Applying ${building.name} effects to planet ${planet.id}`);
        
        // Apply each effect
        Object.keys(building.effects).forEach(effectType => {
            const effectValue = building.effects[effectType];
            
            switch (effectType) {
                case 'shipProductionRate':
                    planet.shipProductionMultiplier = (planet.shipProductionMultiplier || 1.0) * effectValue;
                    break;
                case 'metalGeneration':
                    planet.metalGenerationMultiplier = (planet.metalGenerationMultiplier || 1.0) * effectValue;
                    break;
                case 'energyGeneration':
                    // ENERGY FUEL: This is now critical for movement
                    planet.energyGenerationBonus = (planet.energyGenerationBonus || 0) + effectValue;
                    console.log(`🔬 Planet ${planet.id} now generates +${effectValue} energy/min from Research Lab`);
                    break;
                case 'researchPoints':
                    planet.researchPointsGeneration = (planet.researchPointsGeneration || 0) + effectValue;
                    break;
            }
        });
        
        // Recalculate planet production
        if (typeof planet.updateProduction === 'function') {
            planet.updateProduction();
        }
    },

    // Remove building effects from planet
    removeEffects(planet, buildingId) {
        const building = this.getDefinition(buildingId);
        if (!building || !building.effects) return;
        
        console.log(`⚡ Removing ${building.name} effects from planet ${planet.id}`);
        
        // Remove each effect (reverse of apply)
        Object.keys(building.effects).forEach(effectType => {
            const effectValue = building.effects[effectType];
            
            switch (effectType) {
                case 'shipProductionRate':
                    planet.shipProductionMultiplier = (planet.shipProductionMultiplier || 1.0) / effectValue;
                    break;
                case 'metalGeneration':
                    planet.metalGenerationMultiplier = (planet.metalGenerationMultiplier || 1.0) / effectValue;
                    break;
                case 'energyGeneration':
                    planet.energyGenerationBonus = Math.max(0, (planet.energyGenerationBonus || 0) - effectValue);
                    break;
                case 'researchPoints':
                    planet.researchPointsGeneration = Math.max(0, (planet.researchPointsGeneration || 0) - effectValue);
                    break;
            }
        });
        
        // Recalculate planet production
        if (typeof planet.updateProduction === 'function') {
            planet.updateProduction();
        }
    },

    // ENERGY FUEL: Get building priority for AI
    getAIPriority(buildingId, gameState) {
        const building = this.getDefinition(buildingId);
        if (!building) return 0;
        
        let priority = building.aiPriority || 50;
        
        // ENERGY FUEL: Research Lab is CRITICAL for AI
        if (buildingId === 'research_lab') {
            // Higher priority if AI has low energy
            if (gameState && gameState.aiEnergy < 30) {
                priority = 95;
            }
            return priority;
        }
        
        // Mining complex priority based on metal needs
        if (buildingId === 'mining_complex') {
            if (gameState && gameState.aiMetal < 40) {
                priority = 70;
            }
            return priority;
        }
        
        return priority;
    },

    // ENERGY FUEL: Get recommended building for AI
    getAIRecommendedBuilding(planet, gameState) {
        const availableBuildings = this.getAllTypes().filter(id => {
            return this.canBuildOnPlanet(id, planet);
        });
        
        if (availableBuildings.length === 0) return null;
        
        // Score each building
        const scoredBuildings = availableBuildings.map(id => {
            const building = this.getDefinition(id);
            const priority = this.getAIPriority(id, gameState);
            
            // Can AI afford it?
            const canAfford = this.canAIAfford(id, gameState.aiMetal || 0, gameState.aiEnergy || 0);
            
            return {
                id,
                building,
                priority,
                canAfford,
                score: canAfford ? priority : priority * 0.1 // Heavy penalty if can't afford
            };
        });
        
        // Sort by score
        scoredBuildings.sort((a, b) => b.score - a.score);
        
        return scoredBuildings[0]?.canAfford ? scoredBuildings[0].id : null;
    },

    // Get visual representation for building
    getVisualConfig(buildingId) {
        const building = this.getDefinition(buildingId);
        if (!building) return null;
        
        return {
            icon: building.icon,
            color: building.visual.color,
            size: building.visual.size
        };
    },

    // ENERGY FUEL: Get building effectiveness info
    getBuildingInfo(buildingId) {
        const building = this.getDefinition(buildingId);
        if (!building) return null;
        
        let info = {
            name: building.name,
            description: building.description,
            cost: building.cost,
            buildTime: building.buildTime,
            effects: building.effects
        };
        
        // Add special info for energy fuel system
        if (buildingId === 'research_lab') {
            info.specialNote = 'CRÍTICO: Genera energía para movimiento de flotas';
            info.energyValue = '+6 energy/min = ~40 ships extra de rango medio';
        }
        
        return info;
    },

    // Debug: List all buildings
    debugBuildings() {
        console.table(
            Object.keys(this.types).map(id => {
                const building = this.types[id];
                return {
                    ID: id,
                    Name: building.name,
                    'Metal Cost': building.cost.metal,
                    'Energy Cost': building.cost.energy,
                    'Build Time': this.getBuildTimeString(id),
                    Effects: Object.keys(building.effects).join(', '),
                    Priority: building.priority || 'normal'
                };
            })
        );
    }
};

// Make available globally
window.Buildings = Buildings;