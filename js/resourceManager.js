// Resource Manager - Action 02 CRITICAL FIX - Proper production rates and balance
const ResourceManager = {
    // Resource tracking
    resources: {
        metal: 0,
        energy: 0
    },
    
    // Resource generation tracking
    lastUpdate: 0,
    updateInterval: 1000, // Update every second
    
    // Configuration - BALANCED for 60x faster gameplay
    config: {
        metal: {
            // MUCH BETTER generation rates - per minute
            generationRates: {
                small: 24.0,  // Small planets: 24 metal/min (was 8)
                medium: 36.0, // Medium planets: 36 metal/min (was 12) 
                large: 48.0   // Large planets: 48 metal/min (was 16)
            },
            storageMultiplier: 4.0, // Even more storage
            shipCost: 2 // REDUCED from 10 to 2
        },
        energy: {
            generationBase: 6.0, // 6 energy/min per planet (was 1.0)
            storageMultiplier: 2.0,
            shipCost: 0
        }
    },

    // Initialize with EXCELLENT starting resources
    init() {
        this.resources.metal = 200; // MUCH MORE starting metal
        this.resources.energy = 100; // MORE starting energy
        this.lastUpdate = Date.now();
        console.log('💎 Resource Manager initialized - BALANCED & FAST');
    },

    // Main update loop - CORRECTED TIME CALCULATION
    update() {
        const now = Date.now();
        if (now - this.lastUpdate >= this.updateInterval) {
            this.generateResources();
            this.lastUpdate = now;
        }
    },

    // CRITICAL FIX: Proper resource generation calculation
    generateResources() {
        if (!GameEngine || !GameEngine.planets) return;

        let totalMetalGeneration = 0;
        let totalEnergyGeneration = 0;
        const ownedPlanets = GameEngine.planets.filter(p => p.owner === 'player');

        ownedPlanets.forEach(planet => {
            // Metal generation - FIXED CALCULATION
            const metalGeneration = this.getPlanetMetalGeneration(planet);
            const currentMetalStorage = this.resources.metal;
            const maxMetalStorage = this.getTotalMetalStorageCapacity();

            if (currentMetalStorage < maxMetalStorage) {
                // CORRECT: Generate per second (metalGeneration is per minute, so divide by 60)
                const metalPerSecond = metalGeneration / 60;
                const actualMetalGeneration = Math.min(metalPerSecond, maxMetalStorage - currentMetalStorage);
                totalMetalGeneration += actualMetalGeneration;
            }

            // Energy generation - FIXED CALCULATION
            const energyGeneration = this.getPlanetEnergyGeneration(planet);
            const currentEnergyStorage = this.resources.energy;
            const maxEnergyStorage = this.getTotalEnergyStorageCapacity();

            if (currentEnergyStorage < maxEnergyStorage) {
                // CORRECT: Generate per second (energyGeneration is per minute, so divide by 60)
                const energyPerSecond = energyGeneration / 60;
                const actualEnergyGeneration = Math.min(energyPerSecond, maxEnergyStorage - currentEnergyStorage);
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

    // IMPROVED: Get metal generation rate for a planet (per minute)
    getPlanetMetalGeneration(planet) {
        const capacity = planet.capacity;
        let rate;

        if (capacity <= 20) {
            rate = this.config.metal.generationRates.small;
        } else if (capacity <= 30) {
            rate = this.config.metal.generationRates.medium;
        } else {
            rate = this.config.metal.generationRates.large;
        }

        // Apply building multipliers if any
        const multiplier = planet.metalGenerationMultiplier || 1.0;
        return rate * multiplier;
    },

    // Get energy generation rate for a planet (per minute)
    getPlanetEnergyGeneration(planet) {
        let baseGeneration = this.config.energy.generationBase;
        
        // Apply building bonuses
        const bonus = planet.energyGenerationBonus || 0;
        
        return baseGeneration + bonus;
    },

    // IMPROVED: Storage capacity methods
    getTotalMetalStorageCapacity() {
        if (!GameEngine || !GameEngine.planets) return 400;

        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => total + (planet.capacity * this.config.metal.storageMultiplier), 0);
    },

    getTotalEnergyStorageCapacity() {
        if (!GameEngine || !GameEngine.planets) return 200;

        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => total + (planet.capacity * this.config.energy.storageMultiplier), 0);
    },

    // LEGACY COMPATIBILITY
    getTotalStorageCapacity() {
        return this.getTotalMetalStorageCapacity();
    },

    // Metal manipulation methods
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

    getPlayerMetal() {
        return this.getMetal();
    },

    // Energy manipulation methods
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

    getPlayerEnergy() {
        return this.getEnergy();
    },

    // CRITICAL FIX: Ship cost methods - MUCH CHEAPER
    canAffordShip(shipCount = 1) {
        const totalCost = this.config.metal.shipCost * shipCount;
        return this.resources.metal >= totalCost;
    },

    payForShips(shipCount = 1) {
        const totalCost = this.config.metal.shipCost * shipCount;
        if (this.canAffordShip(shipCount)) {
            this.spendMetal(totalCost);
            return true;
        }
        return false;
    },

    // Legacy methods for compatibility
    removeMetal(amount) {
        return this.spendMetal(amount);
    },

    canAffordMetal(amount) {
        return this.resources.metal >= amount;
    },

    // Update UI elements
    updateUI() {
        this.updateMainDisplays();
        
        // Update ResourceUI if available
        if (typeof ResourceUI !== 'undefined' && ResourceUI.update) {
            ResourceUI.update();
        }
    },

    // IMPROVED: Update main resource displays in header
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
            .reduce((total, planet) => {
                return total + this.getPlanetMetalGeneration(planet);
            }, 0);
    },

    getTotalEnergyGeneration() {
        if (!GameEngine || !GameEngine.planets) return 0;

        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => {
                return total + this.getPlanetEnergyGeneration(planet);
            }, 0);
    },

    // Get resource info for planet tooltip
    getPlanetResourceInfo(planet) {
        if (planet.owner !== 'player') return null;

        const metalGeneration = this.getPlanetMetalGeneration(planet);
        const energyGeneration = this.getPlanetEnergyGeneration(planet);
        
        return {
            metal: {
                generation: metalGeneration.toFixed(1)
            },
            energy: {
                generation: energyGeneration.toFixed(1)
            }
        };
    },

    // Reset resource system
    reset() {
        this.resources.metal = 200;
        this.resources.energy = 100;
        this.lastUpdate = Date.now();
        this.updateUI();
        console.log('💎 Resource Manager reset - BALANCED MODE');
    },

    // Debug methods
    debugAddMetal(amount) {
        this.addMetal(amount);
        console.log(`Debug: Added ${amount} metal, total: ${this.getMetal()}`);
    },

    debugAddEnergy(amount) {
        this.addEnergy(amount);
        console.log(`Debug: Added ${amount} energy, total: ${this.getEnergy()}`);
    },

    debugInfo() {
        const info = {
            metal: this.getMetal(),
            metalCapacity: this.getTotalMetalStorageCapacity(),
            metalGeneration: this.getTotalMetalGeneration(),
            energy: this.getEnergy(),
            energyCapacity: this.getTotalEnergyStorageCapacity(),
            energyGeneration: this.getTotalEnergyGeneration(),
            ownedPlanets: GameEngine.planets ? GameEngine.planets.filter(p => p.owner === 'player').length : 0,
            shipCost: this.config.metal.shipCost
        };
        
        console.table(info);
        return info;
    }
};

// Export for global access
window.ResourceManager = ResourceManager;