// Resource Manager - Classic Evolution Action 01 - TESTING OPTIMIZED
// Manages metal resource generation, storage, and consumption

const ResourceManager = {
    // Resource tracking
    resources: {
        metal: 0
    },
    
    // Resource generation tracking
    lastUpdate: 0,
    updateInterval: 1000, // Update every second
    
    // Configuration
    config: {
        metal: {
            // Base generation rates by planet capacity - TESTING: 3x faster
            generationRates: {
                small: 4.5,   // 1-10 capacity (was 1.5)
                medium: 7.5,  // 11-20 capacity (was 2.5)
                large: 10.5   // 21+ capacity (was 3.5)
            },
            // Storage is based on planet capacity
            storageMultiplier: 1.0, // 1:1 ratio with planet capacity
            // Ship costs
            shipCost: 1
        }
    },

    // Initialize resource system
    init() {
        this.resources.metal = CONFIG.BALANCE ? CONFIG.BALANCE.STARTING_METAL || 25 : 25; // More starting metal for testing
        this.lastUpdate = Date.now();
        console.log('💎 Resource Manager initialized with', this.resources.metal, 'metal (TESTING MODE: 3x generation)');
        
        // Add starting metal to config if not exists
        if (!CONFIG.BALANCE) {
            CONFIG.BALANCE = {};
        }
        if (!CONFIG.BALANCE.STARTING_METAL) {
            CONFIG.BALANCE.STARTING_METAL = 25; // Increased for testing
        }
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

        let totalGeneration = 0;
        const ownedPlanets = GameEngine.planets.filter(p => p.owner === 'player');

        ownedPlanets.forEach(planet => {
            const generation = this.getPlanetMetalGeneration(planet);
            const currentStorage = this.getPlanetMetalStorage(planet);
            const maxStorage = this.getPlanetMaxStorage(planet);

            // Only generate if not at capacity
            if (currentStorage < maxStorage) {
                const actualGeneration = Math.min(generation / 60, maxStorage - currentStorage); // Per second
                totalGeneration += actualGeneration;
                
                // Visual feedback for generation - FIXED: Check if function exists
                if (actualGeneration > 0 && typeof Animations !== 'undefined' && 
                    typeof Animations.createResourcePulse === 'function') {
                    Animations.createResourcePulse(planet, 'metal', actualGeneration);
                }
            }
        });

        if (totalGeneration > 0) {
            this.addMetal(totalGeneration);
            
            // Show generation feedback in UI
            if (typeof ResourceUI !== 'undefined' && ResourceUI.showGenerationPulse) {
                ResourceUI.showGenerationPulse();
            }
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

        // Apply testing mode multiplier if enabled
        if (BalanceConfig && BalanceConfig.BASE && BalanceConfig.BASE.TESTING_MODE) {
            return rate; // Already 3x in config
        }

        return rate;
    },

    // Get current metal storage for a planet
    getPlanetMetalStorage(planet) {
        // For now, we use empire-wide storage
        // Later this could be per-planet when trade system is implemented
        return this.resources.metal;
    },

    // Get maximum storage for a planet
    getPlanetMaxStorage(planet) {
        return planet.capacity * this.config.metal.storageMultiplier;
    },

    // Get total empire storage capacity
    getTotalStorageCapacity() {
        if (!GameEngine || !GameEngine.planets) return 100;

        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => total + this.getPlanetMaxStorage(planet), 0);
    },

    // Resource manipulation methods
    addMetal(amount) {
        const maxCapacity = this.getTotalStorageCapacity();
        const newAmount = Math.min(this.resources.metal + amount, maxCapacity);
        this.resources.metal = newAmount;
        
        // Update UI
        this.updateUI();
    },

    // Remove metal (for ship building, etc.)
    removeMetal(amount) {
        if (this.resources.metal >= amount) {
            this.resources.metal -= amount;
            this.updateUI();
            return true;
        }
        
        // Show insufficient resources feedback
        if (typeof ResourceUI !== 'undefined' && ResourceUI.showInsufficientResources) {
            ResourceUI.showInsufficientResources();
        }
        
        return false;
    },

    // Check if enough metal available
    canAffordMetal(amount) {
        return this.resources.metal >= amount;
    },

    // Get current metal amount
    getMetal() {
        return Math.floor(this.resources.metal);
    },

    // Check if can afford ship
    canAffordShip(shipCount = 1) {
        return this.canAffordMetal(this.config.metal.shipCost * shipCount);
    },

    // Pay for ships
    payForShips(shipCount = 1) {
        const cost = this.config.metal.shipCost * shipCount;
        return this.removeMetal(cost);
    },

    // Update UI elements
    updateUI() {
        // Update main resource display
        const metalDisplay = document.getElementById('metalDisplay');
        if (metalDisplay) {
            const current = this.getMetal();
            const capacity = this.getTotalStorageCapacity();
            const rate = this.getTotalMetalGeneration();
            
            metalDisplay.textContent = `Metal: ${current}/${capacity} (+${rate.toFixed(1)}/min)`;
        }

        // Update compact display if exists
        const compactDisplay = document.getElementById('metalCompact');
        if (compactDisplay) {
            compactDisplay.textContent = `🔩 ${this.getMetal()}`;
        }

        // Update ResourceUI if available
        if (typeof ResourceUI !== 'undefined' && ResourceUI.update) {
            ResourceUI.update();
        }
    },

    // Get total metal generation rate (per minute)
    getTotalMetalGeneration() {
        if (!GameEngine || !GameEngine.planets) return 0;

        return GameEngine.planets
            .filter(p => p.owner === 'player')
            .reduce((total, planet) => {
                const storage = this.getPlanetMetalStorage(planet);
                const maxStorage = this.getPlanetMaxStorage(planet);
                
                // Only count generation if not at capacity
                if (storage < maxStorage) {
                    return total + this.getPlanetMetalGeneration(planet);
                }
                return total;
            }, 0);
    },

    // Get resource info for planet tooltip
    getPlanetResourceInfo(planet) {
        if (planet.owner !== 'player') return null;

        const generation = this.getPlanetMetalGeneration(planet);
        const storage = this.getPlanetMetalStorage(planet);
        const maxStorage = this.getPlanetMaxStorage(planet);
        
        return {
            metal: {
                current: Math.floor(storage),
                max: maxStorage,
                generation: generation.toFixed(1)
            }
        };
    },

    // Reset resource system
    reset() {
        this.resources.metal = CONFIG.BALANCE.STARTING_METAL || 25;
        this.lastUpdate = Date.now();
        this.updateUI();
        console.log('💎 Resource Manager reset (TESTING MODE)');
    },

    // Debug methods
    debugAddMetal(amount) {
        this.addMetal(amount);
        console.log(`Debug: Added ${amount} metal, total: ${this.getMetal()}`);
    },

    debugInfo() {
        const info = {
            metal: this.getMetal(),
            capacity: this.getTotalStorageCapacity(),
            generation: this.getTotalMetalGeneration(),
            ownedPlanets: GameEngine.planets.filter(p => p.owner === 'player').length,
            testingMode: BalanceConfig && BalanceConfig.BASE && BalanceConfig.BASE.TESTING_MODE
        };
        
        console.table(info);
        return info;
    }
};

// Export for global access
window.ResourceManager = ResourceManager;