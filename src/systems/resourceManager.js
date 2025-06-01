// Resource Manager - ENERGY AS FUEL SYSTEM V2.0 - Refactored Modular
// Metal = Construction, Energy = Movement Fuel
const ResourceManager = {
    // Resource tracking
    resources: {
        metal: 0,
        energy: 0
    },
    
    // AI energy tracking (unified system)
    aiEnergy: 0,
    
    // Resource generation tracking
    lastUpdate: 0,
    updateInterval: 1000,
    
    // ENERGY FUEL SYSTEM: New configuration
    config: {
        metal: {
            // Metal only for construction
            generationRates: {
                small: 18.0,  // Small planets: 18 metal/min
                medium: 27.0, // Medium planets: 27 metal/min
                large: 36.0   // Large planets: 36 metal/min
            },
            storageMultiplier: 3.0, // Less storage needed
            shipCost: 0 // NO cost for movement
        },
        energy: {
            // Energy for movement fuel
            generationRates: {
                small: 9.0,   // Small planets: 9 energy/min
                medium: 12.0, // Medium planets: 12 energy/min
                large: 15.0   // Large planets: 15 energy/min
            },
            storageMultiplier: 4.0, // High storage for fuel
            shipCost: 1.5, // Base energy cost per ship
            researchLabBonus: 6.0 // Research labs generate +6 energy/min
        }
    },

    // ENERGY FUEL: Starting resources rebalanced
    init() {
        this.resources.metal = 75;  // Less metal (construction only)
        this.resources.energy = 90; // More energy (fuel)
        this.aiEnergy = 90;         // AI starts with same energy
        this.lastUpdate = Date.now();
        console.log('⚡ ResourceManager initialized - Energy as Fuel System');
        console.log(`Starting resources: ${this.resources.metal} metal, ${this.resources.energy} energy`);
    },

    // Main update loop
    update() {
        const now = Date.now();
        if (now - this.lastUpdate >= this.updateInterval) {
            this.generateResources();
            this.updateAIEnergy();
            this.lastUpdate = now;
        }
    },

    // ENERGY FUEL: Resource generation
    generateResources() {
        if (!GameEngine || !GameEngine.planets) return;

        let totalMetalGeneration = 0;
        let totalEnergyGeneration = 0;
        const playerPlanets = GameEngine.planets.filter(p => p.owner === 'player');

        playerPlanets.forEach(planet => {
            // Metal generation (construction only)
            const metalGeneration = this.getPlanetMetalGeneration(planet);
            const maxMetalStorage = this.getTotalMetalStorageCapacity();

            if (this.resources.metal < maxMetalStorage) {
                const metalPerSecond = metalGeneration / 60;
                const actualMetalGeneration = Math.min(metalPerSecond, maxMetalStorage - this.resources.metal);
                totalMetalGeneration += actualMetalGeneration;
            }

            // Energy generation (fuel)
            const energyGeneration = this.getPlanetEnergyGeneration(planet);
            const maxEnergyStorage = this.getTotalEnergyStorageCapacity();

            if (this.resources.energy < maxEnergyStorage) {
                const energyPerSecond = energyGeneration / 60;
                const actualEnergyGeneration = Math.min(energyPerSecond, maxEnergyStorage - this.resources.energy);
                totalEnergyGeneration += actualEnergyGeneration;
            }
        });

        // Apply generation
        if (totalMetalGeneration > 0) {
            this.addMetal(totalMetalGeneration);
        }
        
        if (totalEnergyGeneration > 0) {
            this.addEnergy(totalEnergyGeneration);
        }
    },

    // ENERGY FUEL: AI energy generation (same rules as player)
    updateAIEnergy() {
        if (!GameEngine || !GameEngine.planets) return;

        let totalAIEnergyGeneration = 0;
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai');
        const maxAIEnergyStorage = this.getAIEnergyStorageCapacity();

        aiPlanets.forEach(planet => {
            const energyGeneration = this.getPlanetEnergyGeneration(planet);
            if (this.aiEnergy < maxAIEnergyStorage) {
                const energyPerSecond = energyGeneration / 60;
                const actualGeneration = Math.min(energyPerSecond, maxAIEnergyStorage - this.aiEnergy);
                totalAIEnergyGeneration += actualGeneration;
            }
        });

        if (totalAIEnergyGeneration > 0) {
            this.aiEnergy = Math.min(this.aiEnergy + totalAIEnergyGeneration, maxAIEnergyStorage);
        }
    },

    // ENERGY FUEL: Metal generation (construction only)
    getPlanetMetalGeneration(planet) {
        const capacity = planet.capacity;
        let rate;

        if (capacity <= 25) {
            rate = this.config.metal.generationRates.small;
        } else if (capacity <= 45) {
            rate = this.config.metal.generationRates.medium;
        } else {
            rate = this.config.metal.generationRates.large;
        }

        // Apply building multipliers
        const multiplier = planet.metalGenerationMultiplier || 1.0;
        return rate * multiplier;
    },

    // ENERGY FUEL: Energy generation (fuel + research labs)
    getPlanetEnergyGeneration(planet) {
        const capacity = planet.capacity;
        let baseRate;

        if (capacity <= 25) {
            baseRate = this.config.energy.generationRates.small;
        } else if (capacity <= 45) {
            baseRate = this.config.energy.generationRates.medium;
        } else {
            baseRate = this.config.energy.generationRates.large;
        }

        // CRITICAL: Research Lab bonus
        let researchLabBonus = 0;
        if (planet.buildings && planet.buildings.research_lab && !planet.buildings.research_lab.constructing) {
            researchLabBonus = this.config.energy.researchLabBonus;
        }

        return baseRate + researchLabBonus;
    },

    // Storage capacity calculations
    getTotalMetalStorageCapacity() {
        if (!GameEngine || !GameEngine.planets) return 300;
        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => total + (planet.capacity * this.config.metal.storageMultiplier), 0);
    },

    getTotalEnergyStorageCapacity() {
        if (!GameEngine || !GameEngine.planets) return 400;
        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => total + (planet.capacity * this.config.energy.storageMultiplier), 0);
    },

    getAIEnergyStorageCapacity() {
        if (!GameEngine || !GameEngine.planets) return 400;
        return GameEngine.planets
            .filter(p => p.owner === 'ai')
            .reduce((total, planet) => total + (planet.capacity * this.config.energy.storageMultiplier), 0);
    },

    // ENERGY FUEL: Movement cost calculation
    calculateMovementCost(ships, distance) {
        return CONFIG.calculateMovementCost(ships, distance);
    },

    // ENERGY FUEL: Check if player can afford movement
    canAffordMovement(ships, distance) {
        const cost = this.calculateMovementCost(ships, distance);
        return this.resources.energy >= cost;
    },

    // ENERGY FUEL: Check if AI can afford movement
    canAffordAIMovement(ships, distance) {
        const cost = this.calculateMovementCost(ships, distance);
        return this.aiEnergy >= cost;
    },

    // ENERGY FUEL: Pay for player movement
    payForMovement(ships, distance) {
        const cost = this.calculateMovementCost(ships, distance);
        if (this.canAffordMovement(ships, distance)) {
            this.spendEnergy(cost);
            console.log(`⚡ Player movement: ${ships} ships, ${distance.toFixed(0)}px = ${cost} energy`);
            return true;
        }
        return false;
    },

    // ENERGY FUEL: Pay for AI movement
    payForAIMovement(ships, distance) {
        const cost = this.calculateMovementCost(ships, distance);
        if (this.canAffordAIMovement(ships, distance)) {
            this.aiEnergy -= cost;
            console.log(`🤖 AI movement: ${ships} ships, ${distance.toFixed(0)}px = ${cost} energy`);
            return true;
        }
        return false;
    },

    // Resource manipulation methods
    addMetal(amount) {
        const maxCapacity = this.getTotalMetalStorageCapacity();
        this.resources.metal = Math.min(this.resources.metal + amount, maxCapacity);
        this.updateUI();
    },

    spendMetal(amount) {
        if (this.resources.metal >= amount) {
            this.resources.metal -= amount;
            this.updateUI();
            return true;
        }
        return false;
    },

    getMetal() {
        return Math.floor(this.resources.metal);
    },

    addEnergy(amount) {
        const maxCapacity = this.getTotalEnergyStorageCapacity();
        this.resources.energy = Math.min(this.resources.energy + amount, maxCapacity);
        this.updateUI();
    },

    spendEnergy(amount) {
        if (this.resources.energy >= amount) {
            this.resources.energy -= amount;
            this.updateUI();
            return true;
        }
        return false;
    },

    getEnergy() {
        return Math.floor(this.resources.energy);
    },

    getAIEnergy() {
        return Math.floor(this.aiEnergy);
    },

    // Legacy compatibility
    getPlayerMetal() { return this.getMetal(); },
    getPlayerEnergy() { return this.getEnergy(); },
    removeMetal(amount) { return this.spendMetal(amount); },
    canAffordMetal(amount) { return this.resources.metal >= amount; },

    // ENERGY FUEL: Legacy ship cost methods (now free)
    canAffordShip(shipCount = 1) {
        return true; // Ships are free to send (energy cost handled separately)
    },

    payForShips(shipCount = 1) {
        return true; // No metal cost for sending
    },

    // UI Updates
    updateUI() {
        this.updateMainDisplays();
        
        if (typeof ResourceUI !== 'undefined' && ResourceUI.update) {
            ResourceUI.update();
        }
    },

    updateMainDisplays() {
        const resourceDisplay = document.getElementById('mainResourceDisplay');
        
        if (resourceDisplay) {
            const metalRate = this.getTotalMetalGeneration();
            const energyRate = this.getTotalEnergyGeneration();
            
            resourceDisplay.innerHTML = `
                🔩 Metal: ${this.getMetal()} (+${metalRate.toFixed(1)}/min) | 
                ⚡ Energy: ${this.getEnergy()} (+${energyRate.toFixed(1)}/min)
            `;
        }
    },

    // Get total generation rates
    getTotalMetalGeneration() {
        if (!GameEngine || !GameEngine.planets) return 0;
        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => total + this.getPlanetMetalGeneration(planet), 0);
    },

    getTotalEnergyGeneration() {
        if (!GameEngine || !GameEngine.planets) return 0;
        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => total + this.getPlanetEnergyGeneration(planet), 0);
    },

    // Get total generation rates for display
    getGenerationRates() {
        return {
            metal: this.getTotalMetalGeneration(),
            energy: this.getTotalEnergyGeneration()
        };
    },

    // Get movement cost info for UI
    getMovementCostInfo(ships, distance) {
        return CONFIG.getMovementCostInfo(ships, distance);
    },

    // Planet resource info for tooltips
    getPlanetResourceInfo(planet) {
        if (planet.owner !== 'player') return null;

        const metalGeneration = this.getPlanetMetalGeneration(planet);
        const energyGeneration = this.getPlanetEnergyGeneration(planet);
        
        return {
            metal: { generation: metalGeneration.toFixed(1) },
            energy: { generation: energyGeneration.toFixed(1) }
        };
    },

    // Reset
    reset() {
        this.resources.metal = 75;
        this.resources.energy = 90;
        this.aiEnergy = 90;
        this.lastUpdate = Date.now();
        this.updateUI();
        console.log('⚡ Resource Manager reset - ENERGY AS FUEL SYSTEM');
    },

    // Debug methods
    debugInfo() {
        const info = {
            'Player Metal': this.getMetal(),
            'Player Energy': this.getEnergy(),
            'AI Energy': this.getAIEnergy(),
            'Metal Gen/min': this.getTotalMetalGeneration().toFixed(1),
            'Energy Gen/min': this.getTotalEnergyGeneration().toFixed(1),
            'Player Planets': GameEngine.planets ? GameEngine.planets.filter(p => p.owner === 'player').length : 0,
            'AI Planets': GameEngine.planets ? GameEngine.planets.filter(p => p.owner === 'ai').length : 0
        };
        
        console.table(info);
        return info;
    }
};

// Export for global access
window.ResourceManager = ResourceManager;