// Planet class - Action 02 CRITICAL FIX - Consistent resource costs and better balance
class Planet {
    constructor(x, y, capacity, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.capacity = capacity;
        this.ships = 0;
        this.owner = 'neutral';
        this.radius = Utils.lerp(CONFIG.VISUAL.PLANET_MIN_RADIUS, CONFIG.VISUAL.PLANET_MAX_RADIUS, capacity / 45); // Updated for new max capacity
        
        // Conquest system
        this.conquestTimer = 0;
        this.isBeingConquered = false;
        this.conqueror = null;
        
        // Production - BALANCED for new system
        this.lastProduction = Date.now();
        this.productionRate = (CONFIG.PLANETS.PRODUCTION_BASE + (capacity * CONFIG.PLANETS.PRODUCTION_MULTIPLIER));
        
        // Action 02: Building system properties
        this.buildings = {};
        this.shipProductionMultiplier = 1.0;
        this.metalGenerationMultiplier = 1.0;
        this.energyGenerationBonus = 0;
        this.researchPointsGeneration = 0;
        
        // Action 02: AI Resource tracking - IMPROVED
        this.aiMetal = CONFIG.PLANETS?.INITIAL_RESOURCES?.metal?.max || 150;
        this.lastAIMetalUpdate = Date.now();
        
        // Initialize with starting resources if defined in CONFIG
        if (CONFIG.PLANETS?.INITIAL_RESOURCES) {
            const metalRange = CONFIG.PLANETS.INITIAL_RESOURCES.metal;
            this.aiMetal = Utils.randomInt(metalRange.min, metalRange.max);
        }
        
        // Visual
        this.element = null;
        this.textElement = null;
        this.keyElement = null;
        this.assignedKey = null;
        this._currentlyHovered = false;
        
        this.createVisual();
    }

    createVisual() {
        const svg = document.getElementById('gameCanvas');
        
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.element.setAttribute('cx', this.x);
        this.element.setAttribute('cy', this.y);
        this.element.setAttribute('r', this.radius);
        this.element.setAttribute('class', 'planet');
        this.element.setAttribute('data-planet-id', this.id);
        svg.appendChild(this.element);
        
        this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textElement.setAttribute('x', this.x);
        this.textElement.setAttribute('y', this.y + 5);
        this.textElement.setAttribute('text-anchor', 'middle');
        this.textElement.setAttribute('fill', 'white');
        this.textElement.setAttribute('font-size', '14');
        this.textElement.setAttribute('font-weight', 'bold');
        this.textElement.setAttribute('class', 'planet-text');
        this.textElement.textContent = Math.floor(this.ships);
        svg.appendChild(this.textElement);
        
        this.keyElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.keyElement.setAttribute('x', this.x);
        this.keyElement.setAttribute('y', this.y - this.radius - 15);
        this.keyElement.setAttribute('text-anchor', 'middle');
        this.keyElement.setAttribute('fill', '#ffff00');
        this.keyElement.setAttribute('font-size', '12');
        this.keyElement.setAttribute('font-weight', 'bold');
        this.keyElement.setAttribute('class', 'planet-letter-text');
        svg.appendChild(this.keyElement);
        
        this.updateVisual();
    }

    assignKey(key) {
        this.assignedKey = key;
        this.keyElement.textContent = key.toUpperCase();
        CONFIG.KEYBOARD.assignments[key] = this.id;
    }

    updateVisual() {
        if (!this.element) return;
        
        let fill;
        switch (this.owner) {
            case 'player':
                fill = 'url(#playerGradient)';
                break;
            case 'ai':
                fill = 'url(#aiGradient)';
                break;
            default:
                fill = 'url(#neutralGradient)';
        }
        
        this.element.setAttribute('fill', fill);
        this.textElement.textContent = Math.floor(this.ships);
        
        if (this.isBeingConquered) {
            this.element.setAttribute('stroke', '#ffff00');
            this.element.setAttribute('stroke-width', '2');
        } else if (!this._currentlyHovered) {
            this.element.removeAttribute('stroke');
            this.element.removeAttribute('stroke-width');
        }
    }

    update(deltaTime) {
        // Action 02: Ship production with BALANCED resource costs
        if (this.owner !== 'neutral' && this.ships < this.capacity) {
            const now = Date.now();
            const effectiveProductionRate = this.productionRate * this.shipProductionMultiplier;
            const timeDiff = (now - this.lastProduction) / 1000;
            
            if (timeDiff >= 1 / effectiveProductionRate) {
                // Try to create a ship
                if (this.tryCreateShip()) {
                    this.ships = Math.min(this.capacity, this.ships + 1);
                    this.lastProduction = now;
                    this.updateVisual();
                    
                    if (window.Animations) Animations.createProductionPulse(this);
                }
            }
        }
        
        // Update AI metal generation - IMPROVED
        if (this.owner === 'ai') {
            this.updateAIMetal();
        }
        
        // Conquest progress
        if (this.isBeingConquered) {
            this.conquestTimer -= deltaTime;
            if (this.conquestTimer <= 0) {
                this.completeConquest();
            }
        }
    }

    // CRITICAL FIX: Consistent ship costs across player and AI
    tryCreateShip() {
        const shipCost = CONFIG.SHIP_COST?.metal || 2; // Use new cheaper cost
        
        if (this.owner === 'player') {
            // Player ships cost metal from ResourceManager
            if (typeof ResourceManager !== 'undefined') {
                if (ResourceManager.canAffordShip(1)) {
                    ResourceManager.payForShips(1);
                    return true;
                } else {
                    // Reduced logging for performance
                    if (Math.random() < 0.05) {
                        console.log(`Player planet ${this.id}: No metal for ship (need ${shipCost})`);
                    }
                    return false;
                }
            }
            return true;
        } else if (this.owner === 'ai') {
            // AI ships cost metal from planet's local AI economy
            if (this.aiMetal >= shipCost) {
                this.aiMetal -= shipCost;
                return true;
            } else {
                // Reduced logging for performance
                if (Math.random() < 0.05) {
                    console.log(`🤖 AI Planet ${this.id}: No metal for ship (need ${shipCost}, have ${this.aiMetal})`);
                }
                return false;
            }
        }
        return false;
    }

    // IMPROVED AI metal generation - much more frequent and better balanced
    updateAIMetal() {
        const now = Date.now();
        if (now - this.lastAIMetalUpdate > 8000) { // Every 8 seconds (was 15)
            // MUCH BETTER AI metal generation to match new costs
            const generation = this.getAIMetalGeneration();
            this.aiMetal = Math.min(this.aiMetal + generation, this.getAIMetalCapacity());
            this.lastAIMetalUpdate = now;
        }
    }

    // Calculate AI metal generation based on planet capacity
    getAIMetalGeneration() {
        if (this.capacity <= 20) {
            return 12; // Small planets generate 12 metal every 8s = 90/min
        } else if (this.capacity <= 30) {
            return 18; // Medium planets generate 18 metal every 8s = 135/min  
        } else {
            return 24; // Large planets generate 24 metal every 8s = 180/min
        }
    }

    // AI metal storage capacity
    getAIMetalCapacity() {
        return this.capacity * 8; // AI can store 8 metal per capacity point
    }

    startConquest(newOwner, ships) {
        if (this.owner === 'neutral') {
            this.isBeingConquered = true;
            this.conqueror = newOwner;
            this.ships = ships;
            this.conquestTimer = CONFIG.PLANETS.CONQUEST_TIME;
            this.updateVisual();
            
            if (window.Animations) Animations.createConquestProgress(this);
        }
    }

    completeConquest() {
        this.owner = this.conqueror;
        this.isBeingConquered = false;
        this.conqueror = null;
        this.conquestTimer = 0;
        this.lastProduction = Date.now();
        
        // Initialize AI metal when AI conquers a planet
        if (this.owner === 'ai') {
            const metalRange = CONFIG.PLANETS?.INITIAL_RESOURCES?.metal;
            if (metalRange) {
                this.aiMetal = Utils.randomInt(metalRange.min, metalRange.max);
            } else {
                this.aiMetal = 150;
            }
            this.lastAIMetalUpdate = Date.now();
        }
        
        this.updateVisual();
        
        if (window.Animations) Animations.removeAnimation(`conquest_${this.id}`);
        if (window.UI) UI.updateStats();
    }

    attack(attackerShips, attacker) {
        if (this.isBeingConquered && this.conqueror !== attacker) {
            this.isBeingConquered = false;
            this.conqueror = null;
            this.conquestTimer = 0;
            if (window.Animations) Animations.removeAnimation(`conquest_${this.id}`);
        }
        
        if (this.owner === attacker) {
            this.ships = Math.min(this.capacity, this.ships + attackerShips);
        } else {
            if (window.Animations) Animations.createBattleEffect(this);
            
            if (attackerShips > this.ships) {
                const oldOwner = this.owner;
                this.owner = attacker;
                this.ships = attackerShips - this.ships;
                this.lastProduction = Date.now();
                
                // Initialize AI metal when AI conquers a planet
                if (this.owner === 'ai' && oldOwner !== 'ai') {
                    const metalRange = CONFIG.PLANETS?.INITIAL_RESOURCES?.metal;
                    if (metalRange) {
                        this.aiMetal = Utils.randomInt(metalRange.min, metalRange.max);
                    } else {
                        this.aiMetal = 150;
                    }
                    this.lastAIMetalUpdate = Date.now();
                }
            } else {
                this.ships -= attackerShips;
            }
        }
        
        this.updateVisual();
        if (window.UI) UI.updateStats();
    }

    canSendShips(amount) {
        return this.ships >= amount && this.owner !== 'neutral';
    }

    sendShips(amount) {
        if (this.canSendShips(amount)) {
            this.ships -= amount;
            this.updateVisual();
            return true;
        }
        return false;
    }

    setHovered(hovered) {
        if (this._currentlyHovered === hovered) return;
        this._currentlyHovered = hovered;
        
        if (hovered) {
            this.element.setAttribute('stroke', CONFIG.VISUAL.HOVER_GLOW);
            this.element.setAttribute('stroke-width', '2');
        } else if (!this.isBeingConquered) {
            this.element.removeAttribute('stroke');
            this.element.removeAttribute('stroke-width');
        }
    }

    // ENHANCED: Tooltip with better resource info
    getTooltipInfo() {
        const ownerName = this.owner === 'player' ? 'Jugador' : 
                         this.owner === 'ai' ? 'IA' : 'Neutral';
        
        let info = `<strong>${ownerName}</strong>`;
        if (this.assignedKey) {
            info = `<strong>${ownerName} [${this.assignedKey.toUpperCase()}]</strong>`;
        }
        
        info += `<br>Naves: ${Math.floor(this.ships)}/${this.capacity}`;
        
        if (this.owner !== 'neutral') {
            const effectiveRate = (this.productionRate * this.shipProductionMultiplier).toFixed(1);
            info += `<br>Producción: ${effectiveRate}/s`;
        }

        // Enhanced resource generation info for player planets
        if (this.owner === 'player' && typeof ResourceManager !== 'undefined') {
            const metalGeneration = ResourceManager.getPlanetMetalGeneration(this);
            info += `<br>Metal: +${metalGeneration.toFixed(1)}/min`;
            
            const energyGeneration = ResourceManager.getPlanetEnergyGeneration(this);
            if (energyGeneration > 0) {
                info += `<br>Energy: +${energyGeneration.toFixed(1)}/min`;
            }
        }

        // Show AI metal for debugging
        if (this.owner === 'ai') {
            info += `<br><small>AI Metal: ${Math.floor(this.aiMetal)}/${this.getAIMetalCapacity()}</small>`;
        }

        // Ship cost info - UPDATED for new costs
        if (this.owner !== 'neutral') {
            const shipCost = CONFIG.SHIP_COST?.metal || 2;
            info += `<br><span style="color: #ffa500">Costo nave: ${shipCost} metal</span>`;
        }
        
        // Building hint for player
        if (this.owner === 'player') {
            info += `<br><small style="color: #00ff88">Click derecho para construir</small>`;
        }
        
        return info;
    }

    // Action 02: Update production rates when buildings change
    updateProduction() {
        // Minimal logging for performance
        if (Math.random() < 0.02) {
            console.log(`Planet ${this.id} production updated - multiplier: ${this.shipProductionMultiplier}x`);
        }
    }

    destroy() {
        if (this.element) this.element.remove();
        if (this.textElement) this.textElement.remove();
        if (this.keyElement) this.keyElement.remove();
        if (window.Animations) Animations.removeAnimation(`conquest_${this.id}`);
    }
}