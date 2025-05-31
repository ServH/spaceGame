// Building Manager - Action 02 Building System Core with Event System
const BuildingManager = {
    
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        console.log('🏗️ Initializing Building Manager...');
        this.initialized = true;
        
        // Start update loop
        this.startUpdateLoop();
    },

    // Emit building events for feedback system
    emitBuildingEvent(eventType, planet, buildingId) {
        const event = new CustomEvent(eventType, {
            detail: { planet, buildingId }
        });
        document.dispatchEvent(event);
    },

    // Start construction of a building
    startConstruction(planet, buildingId) {
        if (!planet || !buildingId) {
            console.error('Invalid planet or building ID');
            return false;
        }

        const building = Buildings.getDefinition(buildingId);
        if (!building) {
            console.error(`Unknown building: ${buildingId}`);
            return false;
        }

        // Check if player owns the planet
        if (planet.owner !== 'player') {
            console.log('Can only build on player planets');
            return false;
        }

        // Check if building can be built on this planet
        if (!Buildings.canBuildOnPlanet(buildingId, planet)) {
            console.log(`Cannot build ${building.name} on this planet`);
            return false;
        }

        // Check resources
        const playerResources = this.getPlayerResources();
        if (!Buildings.canAfford(buildingId, playerResources)) {
            console.log(`Not enough resources for ${building.name}`);
            return false;
        }

        // Initialize planet buildings if needed
        if (!planet.buildings) {
            planet.buildings = {};
        }

        // Check if already building this type
        if (planet.buildings[buildingId] && planet.buildings[buildingId].constructing) {
            console.log(`Already constructing ${building.name}`);
            return false;
        }

        // Deduct resources
        this.payForBuilding(buildingId);

        // Start construction
        planet.buildings[buildingId] = {
            level: 0,
            constructing: true,
            progress: 0,
            startTime: Date.now(),
            buildTime: building.buildTime
        };

        console.log(`🏗️ Started construction of ${building.name} on planet ${planet.id}`);
        
        // Emit event for feedback system
        this.emitBuildingEvent('buildingStarted', planet, buildingId);
        
        // Update UI
        this.updateBuildingUI(planet);
        
        return true;
    },

    // Cancel construction
    cancelConstruction(planet, buildingId) {
        if (!planet || !planet.buildings || !planet.buildings[buildingId]) {
            return false;
        }

        const buildingData = planet.buildings[buildingId];
        if (!buildingData.constructing) {
            return false;
        }

        const building = Buildings.getDefinition(buildingId);
        if (!building) return false;

        // Refund 50% of resources
        const refund = {
            metal: Math.floor(building.cost.metal * 0.5),
            energy: Math.floor(building.cost.energy * 0.5)
        };

        this.refundResources(refund);

        // Remove construction
        delete planet.buildings[buildingId];

        console.log(`🏗️ Cancelled construction of ${building.name}, refunded 50%`);
        
        // Emit event for feedback system
        this.emitBuildingEvent('buildingCancelled', planet, buildingId);
        
        // Update UI
        this.updateBuildingUI(planet);
        
        return true;
    },

    // Complete construction
    completeConstruction(planet, buildingId) {
        if (!planet || !planet.buildings || !planet.buildings[buildingId]) {
            return false;
        }

        const buildingData = planet.buildings[buildingId];
        if (!buildingData.constructing) {
            return false;
        }

        const building = Buildings.getDefinition(buildingId);
        if (!building) return false;

        // Complete building
        buildingData.constructing = false;
        buildingData.progress = 100;
        buildingData.level = 1;
        buildingData.completedAt = Date.now();

        // Apply building effects
        Buildings.applyEffects(planet, buildingId);

        console.log(`✅ Completed construction of ${building.name} on planet ${planet.id}`);
        
        // Emit event for feedback system
        this.emitBuildingEvent('buildingCompleted', planet, buildingId);
        
        // Show completion effect
        this.showCompletionEffect(planet, buildingId);
        
        // Update UI
        this.updateBuildingUI(planet);
        
        return true;
    },

    // Update construction progress
    updateConstructions() {
        if (!GameEngine.planets) return;

        const now = Date.now();

        GameEngine.planets.forEach(planet => {
            if (!planet.buildings) return;

            Object.keys(planet.buildings).forEach(buildingId => {
                const buildingData = planet.buildings[buildingId];
                
                if (buildingData.constructing) {
                    const elapsed = now - buildingData.startTime;
                    const progress = Math.min(100, (elapsed / buildingData.buildTime) * 100);
                    
                    buildingData.progress = progress;

                    // Check if construction is complete
                    if (progress >= 100) {
                        this.completeConstruction(planet, buildingId);
                    }
                }
            });
        });
    },

    // Get player resources (interface with ResourceManager)
    getPlayerResources() {
        if (typeof ResourceManager !== 'undefined') {
            return {
                metal: ResourceManager.getMetal(),
                energy: ResourceManager.getEnergy()
            };
        }
        
        // Fallback if ResourceManager not available
        return { metal: 100, energy: 50 };
    },

    // Pay for building construction
    payForBuilding(buildingId) {
        const building = Buildings.getDefinition(buildingId);
        if (!building) return;

        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.spendMetal(building.cost.metal);
            ResourceManager.spendEnergy(building.cost.energy);
        }
        
        console.log(`💰 Paid ${Buildings.getCostString(buildingId)} for ${building.name}`);
    },

    // Refund resources
    refundResources(refund) {
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.addMetal(refund.metal);
            ResourceManager.addEnergy(refund.energy);
        }
        
        console.log(`💰 Refunded ${refund.metal} Metal + ${refund.energy} Energy`);
    },

    // Get construction queue for planet
    getConstructionQueue(planet) {
        if (!planet.buildings) return [];

        return Object.keys(planet.buildings)
            .filter(buildingId => planet.buildings[buildingId].constructing)
            .map(buildingId => ({
                buildingId,
                ...planet.buildings[buildingId],
                definition: Buildings.getDefinition(buildingId)
            }));
    },

    // Get completed buildings for planet
    getCompletedBuildings(planet) {
        if (!planet.buildings) return [];

        return Object.keys(planet.buildings)
            .filter(buildingId => planet.buildings[buildingId].level > 0)
            .map(buildingId => ({
                buildingId,
                ...planet.buildings[buildingId],
                definition: Buildings.getDefinition(buildingId)
            }));
    },

    // Show construction completion effect
    showCompletionEffect(planet, buildingId) {
        const building = Buildings.getDefinition(buildingId);
        if (!building) return;

        // Create visual completion effect
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        const effect = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        effect.setAttribute('cx', planet.x);
        effect.setAttribute('cy', planet.y);
        effect.setAttribute('r', planet.radius);
        effect.setAttribute('fill', 'none');
        effect.setAttribute('stroke', building.visual.color);
        effect.setAttribute('stroke-width', '3');
        effect.setAttribute('opacity', '0');
        
        canvas.appendChild(effect);

        // Animate effect
        let opacity = 1;
        let radius = planet.radius;
        const animate = () => {
            opacity -= 0.05;
            radius += 2;
            
            effect.setAttribute('opacity', opacity);
            effect.setAttribute('r', radius);
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                canvas.removeChild(effect);
            }
        };
        
        requestAnimationFrame(animate);
    },

    // Update building UI (placeholder - will be implemented in buildingUI.js)
    updateBuildingUI(planet) {
        if (typeof BuildingUI !== 'undefined') {
            BuildingUI.updatePlanetBuildings(planet);
        }
    },

    // Start update loop
    startUpdateLoop() {
        const update = () => {
            this.updateConstructions();
            setTimeout(update, 100); // Update every 100ms
        };
        update();
    },

    // Reset all buildings (for game restart)
    reset() {
        console.log('🏗️ Resetting Building Manager...');
        
        if (GameEngine.planets) {
            GameEngine.planets.forEach(planet => {
                if (planet.buildings) {
                    // Remove all building effects
                    Object.keys(planet.buildings).forEach(buildingId => {
                        if (planet.buildings[buildingId].level > 0) {
                            Buildings.removeEffects(planet, buildingId);
                        }
                    });
                    
                    // Clear buildings
                    planet.buildings = {};
                }
            });
        }
    },

    // AI building methods for balanced gameplay
    evaluateBuildingForAI(planet, buildingId) {
        const building = Buildings.getDefinition(buildingId);
        if (!building) return 0;

        let priority = 0;

        // Base priority by building type
        switch (buildingId) {
            case 'shipyard':
                // Higher priority if planet has many ships
                priority = (planet.ships / planet.capacity) * 50 + 30;
                break;
            case 'mining_complex':
                // Higher priority early game or if low on metal
                if (planet.aiMetal < 150) priority = 70;
                else priority = 40;
                break;
            case 'research_lab':
                // Lower priority initially, higher in late game
                priority = 25;
                break;
        }

        // Reduce priority if already exists
        if (planet.buildings && planet.buildings[buildingId]) {
            priority = 0;
        }

        return priority;
    },

    // AI decides what to build
    getAIBuildingChoice(planet) {
        if (!planet || planet.owner !== 'ai') return null;
        if (!Buildings.canBuildOnPlanet('shipyard', planet)) return null; // Already at max buildings

        const aiResources = { metal: planet.aiMetal || 0, energy: 100 }; // AI has infinite energy for now
        const choices = [];

        Buildings.getAllTypes().forEach(buildingId => {
            if (Buildings.canAfford(buildingId, aiResources) && Buildings.canBuildOnPlanet(buildingId, planet)) {
                const priority = this.evaluateBuildingForAI(planet, buildingId);
                if (priority > 0) {
                    choices.push({ buildingId, priority });
                }
            }
        });

        if (choices.length === 0) return null;

        // Sort by priority and add some randomness
        choices.sort((a, b) => b.priority - a.priority);
        
        // Pick from top 2 choices with some randomness
        const topChoices = choices.slice(0, 2);
        return topChoices[Math.floor(Math.random() * topChoices.length)];
    },

    // AI construction logic
    tryAIConstruction(planet) {
        if (!planet || planet.owner !== 'ai') return false;

        const choice = this.getAIBuildingChoice(planet);
        if (!choice) return false;

        const building = Buildings.getDefinition(choice.buildingId);
        if (!building) return false;

        // Check if AI can afford (simplified - just metal cost)
        if (planet.aiMetal < building.cost.metal) return false;

        // Start AI construction
        if (!planet.buildings) planet.buildings = {};

        planet.buildings[choice.buildingId] = {
            level: 0,
            constructing: true,
            progress: 0,
            startTime: Date.now(),
            buildTime: building.buildTime * 0.8 // AI builds 20% faster
        };

        // Pay cost
        planet.aiMetal -= building.cost.metal;

        console.log(`🤖 AI started construction of ${building.name} on planet ${planet.id}`);
        return true;
    },

    // Debug: Show all constructions
    debugConstructions() {
        if (!GameEngine.planets) return;

        const constructions = [];
        GameEngine.planets.forEach(planet => {
            if (planet.buildings) {
                Object.keys(planet.buildings).forEach(buildingId => {
                    const buildingData = planet.buildings[buildingId];
                    const building = Buildings.getDefinition(buildingId);
                    
                    constructions.push({
                        Planet: planet.id,
                        Owner: planet.owner,
                        Building: building.name,
                        Status: buildingData.constructing ? 'Building' : 'Complete',
                        Progress: `${Math.round(buildingData.progress)}%`,
                        Level: buildingData.level
                    });
                });
            }
        });

        if (constructions.length > 0) {
            console.table(constructions);
        } else {
            console.log('No buildings found');
        }
    }
};

// Make available globally
window.BuildingManager = BuildingManager;