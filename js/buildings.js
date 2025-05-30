// Building Definitions - Action 02 Building System
const Buildings = {
    
    // Building type definitions
    types: {
        shipyard: {
            id: 'shipyard',
            name: 'Astillero',
            icon: '🏭',
            description: '+50% velocidad de producción de naves',
            cost: {
                metal: 75,
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
            name: 'Laboratorio',
            icon: '🔬',
            description: 'Genera puntos de investigación + energía',
            cost: {
                metal: 50,
                energy: 25
            },
            buildTime: 90000, // 90 seconds
            maxLevel: 1,
            effects: {
                energyGeneration: 2.0, // +2 energy per minute
                researchPoints: 1.0    // For future tech tree (Action 03)
            },
            visual: {
                color: '#9b59b6',
                size: 'medium'
            }
        },
        
        mining_complex: {
            id: 'mining_complex',
            name: 'Complejo Minero',
            icon: '⛏️',
            description: '+100% producción de metal del planeta',
            cost: {
                metal: 100,
                energy: 0
            },
            buildTime: 75000, // 75 seconds
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
        return Object.keys(this.types);
    },

    // Check if player can afford building
    canAfford(buildingId, playerResources) {
        const building = this.getDefinition(buildingId);
        if (!building) return false;
        
        return playerResources.metal >= building.cost.metal && 
               playerResources.energy >= building.cost.energy;
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
            return false; // Already built (max level 1 for Action 02)
        }
        
        // Check building slots (max 3 buildings per planet for Action 02)
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

    // Apply building effects to planet
    applyEffects(planet, buildingId) {
        const building = this.getDefinition(buildingId);
        if (!building || !building.effects) return;
        
        console.log(`🏗️ Applying ${building.name} effects to planet ${planet.id}`);
        
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
                    planet.energyGenerationBonus = (planet.energyGenerationBonus || 0) + effectValue;
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
        
        console.log(`🏗️ Removing ${building.name} effects from planet ${planet.id}`);
        
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
                    Effects: Object.keys(building.effects).join(', ')
                };
            })
        );
    }
};

// Make available globally
window.Buildings = Buildings;