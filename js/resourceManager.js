// Resource Manager - Action 02 BALANCED - Fixed initial resources and balance
// Manages metal and energy resource generation, storage, and consumption

const ResourceManager = {
    // Resource tracking
    resources: {
        metal: 0,
        energy: 0
    },
    
    // Resource generation tracking
    lastUpdate: 0,
    updateInterval: 1000, // Update every second
    
    // Configuration
    config: {
        metal: {
            // Base generation rates by planet capacity - BALANCED for gameplay
            generationRates: {
                small: 6.0,   // 1-10 capacity - Increased for better balance
                medium: 9.0,  // 11-20 capacity
                large: 12.0   // 21+ capacity
            },
            storageMultiplier: 2.0, // 2:1 ratio with planet capacity
            shipCost: 10 // Action 02: Ships cost 10 metal
        },
        energy: {
            // Basic energy generation - 1 energy/min per planet
            generationBase: 1.0,
            storageMultiplier: 0.5, // 0.5:1 ratio with planet capacity
            shipCost: 0 // Ships don't cost energy
        }
    },

    // Initialize resource system with BALANCED starting resources
    init() {
        this.resources.metal = 100; // INCREASED: More starting metal for balanced gameplay
        this.resources.energy = 50; // INCREASED: More starting energy
        this.lastUpdate = Date.now();
        console.log('💎 Resource Manager initialized - BALANCED START');
        console.log('💰 Starting resources - Metal:', this.resources.metal, 'Energy:', this.resources.energy);
        console.log('🏗️ Ship cost: 10 Metal (Action 02)');
    },

    // Main update loop
    update() {
        const now = Date.now();
        if (now - this.lastUpdate >= this.updateInterval) {
            this.generateResources();
            this.lastUpdate = now;
        }
    },

    // Generate resources from all owned planets
    generateResources() {
        if (!GameEngine || !GameEngine.planets) return;

        let totalMetalGeneration = 0;
        let totalEnergyGeneration = 0;
        const ownedPlanets = GameEngine.planets.filter(p => p.owner === 'player');

        ownedPlanets.forEach(planet => {
            // Metal generation
            const metalGeneration = this.getPlanetMetalGeneration(planet);
            const currentMetalStorage = this.resources.metal;
            const maxMetalStorage = this.getTotalMetalStorageCapacity();

            if (currentMetalStorage < maxMetalStorage) {
                const actualMetalGeneration = Math.min(metalGeneration / 60, maxMetalStorage - currentMetalStorage);
                totalMetalGeneration += actualMetalGeneration;
            }

            // Energy generation
            const energyGeneration = this.getPlanetEnergyGeneration(planet);
            const currentEnergyStorage = this.resources.energy;
            const maxEnergyStorage = this.getTotalEnergyStorageCapacity();

            if (currentEnergyStorage < maxEnergyStorage) {
                const actualEnergyGeneration = Math.min(energyGeneration / 60, maxEnergyStorage - currentEnergyStorage);
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

    // Get metal generation rate for a planet (per minute)
    getPlanetMetalGeneration(planet) {
        const capacity = planet.capacity;
        let rate;

        if (capacity <= 10) {
            rate = this.config.metal.generationRates.small;
        } else if (capacity <= 20) {
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

    // Storage capacity methods
    getTotalMetalStorageCapacity() {
        if (!GameEngine || !GameEngine.planets) return 200;

        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => total + (planet.capacity * this.config.metal.storageMultiplier), 0);
    },

    getTotalEnergyStorageCapacity() {
        if (!GameEngine || !GameEngine.planets) return 100;

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

    // Ship cost methods (Action 02)
    canAffordShip(shipCount = 1) {
        const totalCost = this.config.metal.shipCost * shipCount;
        return this.resources.metal >= totalCost;
    },

    payForShips(shipCount = 1) {
        const totalCost = this.config.metal.shipCost * shipCount;
        if (this.canAffordShip(shipCount)) {
            this.spendMetal(totalCost);
            console.log(`💰 Paid ${totalCost} metal for ${shipCount} ship(s) - Remaining: ${this.getMetal()}`);
            return true;
        }
        
        console.log(`❌ Not enough metal for ${shipCount} ship(s). Need: ${totalCost}, Have: ${this.getMetal()}`);
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
        // Update main displays at top
        this.updateMainDisplays();
        
        // Update compact displays if they exist
        const metalCompact = document.getElementById('metalCompact');
        if (metalCompact) {
            metalCompact.textContent = `🔩 ${this.getMetal()}`;
        }

        const energyCompact = document.getElementById('energyCompact');
        if (energyCompact) {
            energyCompact.textContent = `⚡ ${this.getEnergy()}`;
        }

        // Update ResourceUI if available
        if (typeof ResourceUI !== 'undefined' && ResourceUI.update) {
            ResourceUI.update();
        }
    },

    // Update main resource displays in header
    updateMainDisplays() {
        // Find or create main resource display
        let resourceDisplay = document.getElementById('mainResourceDisplay');
        if (!resourceDisplay) {
            // Create main resource display in UI top area
            const uiTop = document.querySelector('.ui-top');
            if (uiTop) {
                resourceDisplay = document.createElement('div');
                resourceDisplay.id = 'mainResourceDisplay';
                resourceDisplay.style.cssText = `
                    color: #00ff88;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    font-weight: bold;
                    text-align: center;
                    margin: 5px 0;
                `;
                uiTop.appendChild(resourceDisplay);
            }
        }
        
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
                const storage = this.resources.metal;
                const maxStorage = this.getTotalMetalStorageCapacity();
                
                // Only count generation if not at capacity
                if (storage < maxStorage) {
                    return total + this.getPlanetMetalGeneration(planet);
                }
                return total;
            }, 0);
    },

    getTotalEnergyGeneration() {
        if (!GameEngine || !GameEngine.planets) return 0;

        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => {
                const storage = this.resources.energy;
                const maxStorage = this.getTotalEnergyStorageCapacity();
                
                // Only count generation if not at capacity
                if (storage < maxStorage) {
                    return total + this.getPlanetEnergyGeneration(planet);
                }
                return total;
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
        this.resources.metal = 100; // BALANCED starting resources
        this.resources.energy = 50;
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