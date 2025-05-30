// Planet class - OPCIÓN A GALCON - Ships regenerate FREE, sending costs metal
class Planet {
    constructor(x, y, capacity, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.capacity = capacity;
        this.ships = 0;
        this.owner = 'neutral';
        this.radius = Utils.lerp(CONFIG.VISUAL.PLANET_MIN_RADIUS, CONFIG.VISUAL.PLANET_MAX_RADIUS, capacity / 70); // Updated for larger planets
        
        // Conquest system
        this.conquestTimer = 0;
        this.isBeingConquered = false;
        this.conqueror = null;
        
        // OPCIÓN A: FREE ship regeneration - fast and consistent
        this.lastProduction = Date.now();
        this.shipProductionRate = CONFIG.PLANETS?.SHIP_PRODUCTION_RATE || 0.5; // 1 ship every 2 seconds (FREE)
        
        // Action 02: Building system properties
        this.buildings = {};
        this.shipProductionMultiplier = 1.0;
        this.metalGenerationMultiplier = 1.0;
        this.energyGenerationBonus = 0;
        this.researchPointsGeneration = 0;
        
        // OPCIÓN A: AI Resource tracking - scaled for new costs
        this.aiMetal = CONFIG.PLANETS?.INITIAL_RESOURCES?.metal?.max || 120;
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
        // OPCIÓN A: FREE ship regeneration - no resource cost for ship creation
        if (this.owner !== 'neutral' && this.ships < this.capacity) {
            const now = Date.now();
            const effectiveProductionRate = this.shipProductionRate * this.shipProductionMultiplier;
            const timeDiff = (now - this.lastProduction) / 1000;
            
            if (timeDiff >= 1 / effectiveProductionRate) {
                // OPCIÓN A: Ships regenerate for FREE
                this.ships = Math.min(this.capacity, this.ships + 1);
                this.lastProduction = now;
                this.updateVisual();
                
                if (window.Animations) Animations.createProductionPulse(this);
            }
        }
        
        // Update AI metal generation - OPCIÓN A balanced
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

    // OPCIÓN A: AI metal generation for sending ships (not creating)
    updateAIMetal() {
        const now = Date.now();
        if (now - this.lastAIMetalUpdate > 6000) { // Every 6 seconds
            // OPCIÓN A: AI metal generation for ship sending costs
            const generation = this.getAIMetalGeneration();
            this.aiMetal = Math.min(this.aiMetal + generation, this.getAIMetalCapacity());
            this.lastAIMetalUpdate = now;
        }
    }

    // OPCIÓN A: AI metal generation scaled for 1 metal per ship cost
    getAIMetalGeneration() {
        if (this.capacity <= 30) {
            return 15; // Small planets: 15 metal every 6s = 150/min
        } else if (this.capacity <= 50) {
            return 20; // Medium planets: 20 metal every 6s = 200/min  
        } else {
            return 25; // Large planets: 25 metal every 6s = 250/min
        }
    }

    // AI metal storage capacity
    getAIMetalCapacity() {
        return this.capacity * 6; // AI can store 6 metal per capacity point
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
                this.aiMetal = 120;
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
                        this.aiMetal = 120;
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

    // OPCIÓN A: Enhanced tooltip with free ship regeneration info
    getTooltipInfo() {
        const ownerName = this.owner === 'player' ? 'Jugador' : 
                         this.owner === 'ai' ? 'IA' : 'Neutral';
        
        let info = `<strong>${ownerName}</strong>`;
        if (this.assignedKey) {
            info = `<strong>${ownerName} [${this.assignedKey.toUpperCase()}]</strong>`;
        }
        
        info += `<br>Naves: ${Math.floor(this.ships)}/${this.capacity}`;
        
        if (this.owner !== 'neutral') {
            const effectiveRate = (this.shipProductionRate * this.shipProductionMultiplier).toFixed(1);
            info += `<br>Regeneración: ${effectiveRate}/s (GRATIS)`;
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

        // OPCIÓN A: Ship sending cost info
        if (this.owner !== 'neutral') {
            const shipCost = CONFIG.SHIP_COST?.metal || 1;
            info += `<br><span style="color: #ffa500">Envío: ${shipCost} metal/nave</span>`;
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