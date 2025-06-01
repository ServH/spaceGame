// Resource Manager - Energy as Fuel System V2.0
const ResourceManager = {
    playerResources: {
        metal: 75,
        energy: 90
    },
    
    lastUpdate: Date.now(),
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        // Initialize with balance config values
        if (typeof BalanceConfig !== 'undefined') {
            this.playerResources.metal = BalanceConfig.BASE.START_METAL;
            this.playerResources.energy = BalanceConfig.BASE.START_ENERGY;
        }
        
        this.lastUpdate = Date.now();
        this.initialized = true;
        
        console.log('⚡ ResourceManager initialized - Energy as Fuel System');
    },
    
    // Get current resources
    getMetal() {
        return Math.floor(this.playerResources.metal);
    },
    
    getEnergy() {
        return Math.floor(this.playerResources.energy);
    },
    
    // Set resources (for initialization)
    setPlayerResources(metal, energy) {
        this.playerResources.metal = metal;
        this.playerResources.energy = energy;
    },
    
    // Resource spending
    spendMetal(amount) {
        this.playerResources.metal = Math.max(0, this.playerResources.metal - amount);
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.showResourceChange('metal', amount, false);
        }
    },
    
    spendEnergy(amount) {
        this.playerResources.energy = Math.max(0, this.playerResources.energy - amount);
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.showResourceChange('energy', amount, false);
        }
    },
    
    // Resource adding
    addMetal(amount) {
        this.playerResources.metal += amount;
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.showResourceChange('metal', amount, true);
        }
    },
    
    addEnergy(amount) {
        this.playerResources.energy += amount;
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.showResourceChange('energy', amount, true);
        }
    },
    
    // ENERGY FUEL SYSTEM: Check if player can afford movement
    canAffordMovement(ships, distance) {
        const energyCost = CONFIG.calculateMovementCost(ships, distance);
        return this.playerResources.energy >= energyCost;
    },
    
    // ENERGY FUEL SYSTEM: Pay for fleet movement
    payForMovement(ships, distance) {
        const energyCost = CONFIG.calculateMovementCost(ships, distance);
        
        if (this.playerResources.energy >= energyCost) {
            this.spendEnergy(energyCost);
            console.log(`⚡ Paid ${energyCost} energy for ${ships} ships moving ${Math.round(distance)}px`);
            return true;
        }
        
        console.log(`❌ Insufficient energy: need ${energyCost}, have ${this.playerResources.energy}`);
        return false;
    },
    
    // Resource generation
    update(deltaTime) {
        const now = Date.now();
        const timeDelta = now - this.lastUpdate;
        
        if (timeDelta >= 1000) { // Update every second
            this.generateResources(timeDelta / 1000);
            this.lastUpdate = now;
        }
    },
    
    generateResources(seconds) {
        const rates = this.getGenerationRates();
        
        // Generate per second from per minute rates
        const metalToAdd = (rates.metal / 60) * seconds;
        const energyToAdd = (rates.energy / 60) * seconds;
        
        this.playerResources.metal += metalToAdd;
        this.playerResources.energy += energyToAdd;
    },
    
    // Calculate current generation rates
    getGenerationRates() {
        let metalRate = BalanceConfig?.BASE.METAL_GENERATION || 1.0;
        let energyRate = BalanceConfig?.BASE.ENERGY_GENERATION || 1.5;
        
        // Add bonuses from buildings
        if (typeof GameEngine !== 'undefined' && GameEngine.planets) {
            GameEngine.planets.forEach(planet => {
                if (planet.owner === 'player') {
                    // Metal generation from mining complexes
                    if (planet.metalGenerationMultiplier) {
                        metalRate *= planet.metalGenerationMultiplier;
                    }
                    
                    // Energy generation from research labs
                    if (planet.energyGenerationBonus) {
                        energyRate += planet.energyGenerationBonus;
                    }
                }
            });
        }
        
        return { metal: metalRate, energy: energyRate };
    },
    
    // Check affordability
    canAfford(cost) {
        return this.playerResources.metal >= cost.metal && 
               this.playerResources.energy >= cost.energy;
    },
    
    // Reset resources (for game restart)
    reset() {
        this.playerResources.metal = BalanceConfig?.BASE.START_METAL || 75;
        this.playerResources.energy = BalanceConfig?.BASE.START_ENERGY || 90;
        this.lastUpdate = Date.now();
        console.log('🔄 Resources reset to starting values');
    },
    
    // Debug info
    debug() {
        const rates = this.getGenerationRates();
        console.table({
            'Current Metal': this.getMetal(),
            'Current Energy': this.getEnergy(),
            'Metal Rate': rates.metal.toFixed(1) + '/min',
            'Energy Rate': rates.energy.toFixed(1) + '/min'
        });
    }
};

// Make available globally
window.ResourceManager = ResourceManager;