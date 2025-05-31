// Resource Manager - ENERGY AS FUEL SYSTEM V2.4
const ResourceManager = {
    playerMetal: 75,
    playerEnergy: 90,
    aiEnergy: 90,
    lastUpdate: Date.now(),
    
    init() {
        this.playerMetal = BalanceConfig.BASE.START_METAL;
        this.playerEnergy = BalanceConfig.BASE.START_ENERGY;
        this.aiEnergy = BalanceConfig.BASE.START_ENERGY;
        this.lastUpdate = Date.now();
        console.log('⚡ ResourceManager initialized - Energy as Fuel System');
    },

    update(deltaTime) {
        const now = Date.now();
        if (now - this.lastUpdate >= 1000) { // Update every second
            this.updatePlayerResources();
            this.updateAIResources();
            this.lastUpdate = now;
            
            if (typeof ResourceUI !== 'undefined') {
                ResourceUI.update();
            }
        }
    },

    updatePlayerResources() {
        const playerPlanets = GameEngine.getPlayerPlanets();
        
        // Calculate metal generation
        let totalMetalGeneration = 0;
        playerPlanets.forEach(planet => {
            totalMetalGeneration += this.getPlanetMetalGeneration(planet);
        });
        
        // Calculate energy generation
        let totalEnergyGeneration = 0;
        playerPlanets.forEach(planet => {
            totalEnergyGeneration += this.getPlanetEnergyGeneration(planet);
        });
        
        // Apply per-second generation (divide by 60 for per-minute rates)
        this.playerMetal += totalMetalGeneration / 60;
        this.playerEnergy += totalEnergyGeneration / 60;
    },

    updateAIResources() {
        const aiPlanets = GameEngine.getAIPlanets();
        
        // AI energy generation (same rules as player)
        let totalEnergyGeneration = 0;
        aiPlanets.forEach(planet => {
            totalEnergyGeneration += this.getPlanetEnergyGeneration(planet);
        });
        
        this.aiEnergy += totalEnergyGeneration / 60;
    },

    getPlanetMetalGeneration(planet) {
        const baseGeneration = BalanceConfig.ENERGY_FUEL.settings.metalGeneration;
        return baseGeneration * planet.metalGenerationMultiplier;
    },

    getPlanetEnergyGeneration(planet) {
        const baseGeneration = BalanceConfig.ENERGY_FUEL.settings.energyGeneration;
        return baseGeneration + planet.energyGenerationBonus;
    },

    // Player resource management
    getMetal() {
        return Math.floor(this.playerMetal);
    },

    getEnergy() {
        return Math.floor(this.playerEnergy);
    },

    canAffordMovement(ships, distance) {
        const cost = CONFIG.calculateMovementCost(ships, distance);
        return this.playerEnergy >= cost;
    },

    payForMovement(ships, distance) {
        const cost = CONFIG.calculateMovementCost(ships, distance);
        if (this.playerEnergy >= cost) {
            this.playerEnergy -= cost;
            return true;
        }
        return false;
    },

    // AI resource management
    getAIEnergy() {
        return Math.floor(this.aiEnergy);
    },

    payForAIMovement(ships, distance) {
        const cost = CONFIG.calculateMovementCost(ships, distance);
        if (this.aiEnergy >= cost) {
            this.aiEnergy -= cost;
            return true;
        }
        return false;
    },

    // Building costs
    canAffordBuilding(buildingType) {
        const building = Buildings.getDefinition(buildingType);
        if (!building) return false;
        
        return this.playerMetal >= building.cost.metal && 
               this.playerEnergy >= building.cost.energy;
    },

    payForBuilding(buildingType) {
        const building = Buildings.getDefinition(buildingType);
        if (!building) return false;
        
        if (this.canAffordBuilding(buildingType)) {
            this.playerMetal -= building.cost.metal;
            this.playerEnergy -= building.cost.energy;
            return true;
        }
        return false;
    },

    // Debug functions
    debugInfo() {
        console.log('⚡ Resource Status:', {
            playerMetal: this.getMetal(),
            playerEnergy: this.getEnergy(),
            aiEnergy: this.getAIEnergy()
        });
    },

    debugAddEnergy(amount) {
        this.playerEnergy += amount;
        console.log(`⚡ Added ${amount} energy. Total: ${this.getEnergy()}`);
    },

    setPlayerResources(metal, energy) {
        this.playerMetal = metal;
        this.playerEnergy = energy;
    }
};