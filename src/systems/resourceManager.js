// Resource Manager - FIXED with missing AI methods
const ResourceManager = {
    resources: {
        metal: 0,
        energy: 0
    },
    
    aiEnergy: 0,
    lastUpdate: 0,
    updateInterval: 1000,
    
    init() {
        this.resources.metal = 75;
        this.resources.energy = 90;
        this.aiEnergy = 90;
        this.lastUpdate = Date.now();
        console.log('⚡ ResourceManager initialized - Energy as Fuel System');
    },

    update() {
        const now = Date.now();
        if (now - this.lastUpdate >= this.updateInterval) {
            this.generateResources();
            this.updateAIEnergy();
            this.lastUpdate = now;
        }
    },

    generateResources() {
        if (!GameEngine?.planets) return;

        const playerPlanets = GameEngine.planets.filter(p => p.owner === 'player');
        let totalMetalGen = 0;
        let totalEnergyGen = 0;

        playerPlanets.forEach(planet => {
            totalMetalGen += this.getPlanetMetalGeneration(planet);
            totalEnergyGen += this.getPlanetEnergyGeneration(planet);
        });

        this.addMetal(totalMetalGen / 60);
        this.addEnergy(totalEnergyGen / 60);
    },

    updateAIEnergy() {
        if (!GameEngine?.planets) return;

        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai');
        let totalEnergyGen = 0;

        aiPlanets.forEach(planet => {
            totalEnergyGen += this.getPlanetEnergyGeneration(planet);
        });

        this.aiEnergy = Math.min(this.aiEnergy + (totalEnergyGen / 60), 400);
    },

    getPlanetMetalGeneration(planet) {
        const baseRate = 1.0;
        return baseRate * (planet.metalGenerationMultiplier || 1.0);
    },

    getPlanetEnergyGeneration(planet) {
        const baseRate = 1.5;
        let bonus = 0;
        
        if (planet.buildings?.research_lab && !planet.buildings.research_lab.constructing) {
            bonus = 6.0;
        }
        
        return baseRate + bonus;
    },

    // MISSING METHODS for AI
    getAIEnergy() {
        return Math.floor(this.aiEnergy);
    },

    canAffordAIMovement(ships, distance) {
        const cost = CONFIG.calculateMovementCost(ships, distance);
        return this.aiEnergy >= cost;
    },

    payForAIMovement(ships, distance) {
        const cost = CONFIG.calculateMovementCost(ships, distance);
        if (this.canAffordAIMovement(ships, distance)) {
            this.aiEnergy -= cost;
            console.log(`⚡ Paid ${cost} energy for ${ships} ships moving ${distance.toFixed(0)}px`);
            return true;
        }
        return false;
    },

    // Player methods
    canAffordMovement(ships, distance) {
        const cost = CONFIG.calculateMovementCost(ships, distance);
        return this.resources.energy >= cost;
    },

    spendEnergy(amount) {
        if (this.resources.energy >= amount) {
            this.resources.energy -= amount;
            this.updateUI();
            return true;
        }
        return false;
    },

    addMetal(amount) {
        this.resources.metal = Math.min(this.resources.metal + amount, 300);
        this.updateUI();
    },

    addEnergy(amount) {
        this.resources.energy = Math.min(this.resources.energy + amount, 400);
        this.updateUI();
    },

    getMetal() {
        return Math.floor(this.resources.metal);
    },

    getEnergy() {
        return Math.floor(this.resources.energy);
    },

    spendMetal(amount) {
        if (this.resources.metal >= amount) {
            this.resources.metal -= amount;
            this.updateUI();
            return true;
        }
        return false;
    },

    canAffordMetal(amount) {
        return this.resources.metal >= amount;
    },

    setPlayerResources(metal, energy) {
        this.resources.metal = metal;
        this.resources.energy = energy;
        this.updateUI();
    },

    updateUI() {
        const resourceDisplay = document.getElementById('mainResourceDisplay');
        if (resourceDisplay) {
            resourceDisplay.innerHTML = `🔩 Metal: ${this.getMetal()} (+1.0/min) | ⚡ Energy: ${this.getEnergy()} (+1.5/min)`;
        }
    }
};
