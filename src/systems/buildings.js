// Buildings System - Action 02 Implementation
const Buildings = {
    types: {
        research_lab: {
            name: 'Research Lab',
            icon: '🔬',
            cost: { metal: 40, energy: 15 },
            buildTime: 90000, // 90 seconds
            effects: { energyGeneration: 6.0 },
            description: 'Generates +6 energy per minute',
            visual: { color: '#4a90e2' }
        },
        mining_complex: {
            name: 'Mining Complex',
            icon: '⛏️',
            cost: { metal: 80, energy: 0 },
            buildTime: 75000, // 75 seconds
            effects: { metalGeneration: 2.0 },
            description: 'Doubles metal production',
            visual: { color: '#ff9500' }
        },
        shipyard: {
            name: 'Shipyard',
            icon: '🏭',
            cost: { metal: 60, energy: 0 },
            buildTime: 60000, // 60 seconds
            effects: { shipProductionRate: 1.5 },
            description: '+50% ship production rate',
            visual: { color: '#50c878' }
        }
    },

    getDefinition(buildingType) {
        return this.types[buildingType];
    },

    getAvailableBuildings() {
        return Object.keys(this.types);
    },

    canBuild(planet, buildingType) {
        if (!planet || planet.owner !== 'player') return false;
        
        const building = this.getDefinition(buildingType);
        if (!building) return false;
        
        // Check if already has this building
        if (planet.buildings && planet.buildings[buildingType]) {
            return false;
        }
        
        // Check building slots
        const currentBuildings = planet.buildings ? Object.keys(planet.buildings).length : 0;
        const maxBuildings = CONFIG.BUILDINGS?.MAX_PER_PLANET || 3;
        
        return currentBuildings < maxBuildings;
    },

    getAIRecommendedBuilding(planet, gameState) {
        if (!planet || planet.owner !== 'ai') return null;
        
        const availableBuildings = this.getAvailableBuildings();
        const currentBuildings = planet.buildings ? Object.keys(planet.buildings) : [];
        
        // Priority system for AI
        const priorities = [
            { type: 'mining_complex', priority: 70 },
            { type: 'research_lab', priority: 60 },
            { type: 'shipyard', priority: 50 }
        ];
        
        for (const { type, priority } of priorities) {
            if (!currentBuildings.includes(type) && this.canAIBuild(planet, type)) {
                return type;
            }
        }
        
        return null;
    },

    canAIBuild(planet, buildingType) {
        const building = this.getDefinition(buildingType);
        if (!building) return false;
        
        // Check building slots
        const currentBuildings = planet.buildings ? Object.keys(planet.buildings).length : 0;
        const maxBuildings = CONFIG.BUILDINGS?.MAX_PER_PLANET || 3;
        
        return currentBuildings < maxBuildings;
    },

    canAIAfford(buildingType, aiMetal, aiEnergy) {
        const building = this.getDefinition(buildingType);
        if (!building) return false;
        
        // AI simplified costs (no energy cost)
        return aiMetal >= building.cost.metal;
    }
};

// Make Buildings globally available
if (typeof window !== 'undefined') {
    window.Buildings = Buildings;
}