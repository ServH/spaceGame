// Planet class - FIXED for refactored architecture  
class Planet {
    constructor(x, y, capacity, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.capacity = capacity;
        this.ships = 0;
        this.owner = 'neutral';
        
        const minRadius = CONFIG.PLANETS?.RADIUS_MIN || 20;
        const maxRadius = CONFIG.PLANETS?.RADIUS_MAX || 35;
        this.radius = Utils.lerp(minRadius, maxRadius, capacity / 70);
        
        // Conquest system
        this.conquestTimer = 0;
        this.isBeingConquered = false;
        this.conqueror = null;
        
        // Ship production
        this.lastProduction = Date.now();
        this.shipProductionRate = CONFIG.PLANETS?.SHIP_PRODUCTION_RATE || 0.8;
        
        // Building system
        this.buildings = {};
        this.shipProductionMultiplier = 1.0;
        this.metalGenerationMultiplier = 1.0;
        this.energyGenerationBonus = 0;
        
        // AI resources
        this.aiMetal = CONFIG.PLANETS?.BASE_AI_METAL || 120;
        this.lastAIMetalUpdate = Date.now();
        
        // Visual elements
        this.element = null;
        this.textElement = null;
        this.keyElement = null;
        this.buildingIndicators = [];
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

        this.updateBuildingIndicators();
    }

    updateBuildingIndicators() {
        this.buildingIndicators.forEach(indicator => indicator.remove());
        this.buildingIndicators = [];

        if (!this.buildings || Object.keys(this.buildings).length === 0) return;

        const svg = document.getElementById('gameCanvas');
        if (!svg) return;

        let indicatorIndex = 0;
        const indicatorSize = 6;
        const indicatorDistance = this.radius + 12;

        Object.keys(this.buildings).forEach(buildingId => {
            const buildingData = this.buildings[buildingId];
            const building = Buildings ? Buildings.getDefinition(buildingId) : null;

            if (!building) return;

            const angle = (indicatorIndex * 120) * (Math.PI / 180);
            const indicatorX = this.x + Math.cos(angle) * indicatorDistance;
            const indicatorY = this.y + Math.sin(angle) * indicatorDistance;

            const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            indicator.setAttribute('cx', indicatorX);
            indicator.setAttribute('cy', indicatorY);
            indicator.setAttribute('r', indicatorSize);
            
            if (buildingData.constructing) {
                indicator.setAttribute('fill', '#ffaa00');
                indicator.setAttribute('stroke', '#ffffff');
                indicator.setAttribute('stroke-width', '1');
                indicator.setAttribute('opacity', '0.8');
            } else {
                indicator.setAttribute('fill', building.visual.color);
                indicator.setAttribute('stroke', '#ffffff');
                indicator.setAttribute('stroke-width', '1');
                indicator.setAttribute('opacity', '1.0');
            }

            const iconText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            iconText.setAttribute('x', indicatorX);
            iconText.setAttribute('y', indicatorY + 2);
            iconText.setAttribute('text-anchor', 'middle');
            iconText.setAttribute('font-size', '8');
            iconText.setAttribute('fill', 'white');
            iconText.textContent = building.icon;
            
            svg.appendChild(indicator);
            svg.appendChild(iconText);
            
            this.buildingIndicators.push(indicator);
            this.buildingIndicators.push(iconText);

            indicatorIndex++;
        });
    }

    update(deltaTime) {
        if (this.owner !== 'neutral' && this.ships < this.capacity) {
            const now = Date.now();
            const effectiveProductionRate = this.shipProductionRate * this.shipProductionMultiplier;
            const timeDiff = (now - this.lastProduction) / 1000;
            
            if (timeDiff >= 1 / effectiveProductionRate) {
                this.ships = Math.min(this.capacity, this.ships + 1);
                this.lastProduction = now;
                this.updateVisual();
            }
        }
        
        if (this.owner === 'ai') {
            this.updateAIMetal();
        }
        
        if (this.isBeingConquered) {
            this.conquestTimer -= deltaTime;
            if (this.conquestTimer <= 0) {
                this.completeConquest();
            }
        }
    }

    updateAIMetal() {
        const now = Date.now();
        if (now - this.lastAIMetalUpdate > 6000) {
            const generation = this.getAIMetalGeneration();
            this.aiMetal = Math.min(this.aiMetal + generation, this.getAIMetalCapacity());
            this.lastAIMetalUpdate = now;
        }
    }

    getAIMetalGeneration() {
        let baseGeneration = this.capacity <= 30 ? 15 : this.capacity <= 50 ? 20 : 25;
        return Math.floor(baseGeneration * this.metalGenerationMultiplier);
    }

    getAIMetalCapacity() {
        return this.capacity * 6;
    }

    // FIXED tooltip method - compatible with new architecture
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
            if (this.shipProductionMultiplier > 1) {
                info += ` 🏭`;
            }
        }

        // FIXED: Use direct calculation instead of missing ResourceManager methods
        if (this.owner === 'player') {
            const baseMetalGeneration = 1.0; // Base from CONFIG.RESOURCES.BASE_GENERATION.metal
            const metalGeneration = baseMetalGeneration * this.metalGenerationMultiplier;
            info += `<br>Metal: +${metalGeneration.toFixed(1)}/min`;
            if (this.metalGenerationMultiplier > 1) {
                info += ` ⛏️`;
            }
            
            if (this.energyGenerationBonus > 0) {
                info += `<br>Energy: +${this.energyGenerationBonus.toFixed(1)}/min 🔬`;
            }
        }

        if (this.owner === 'ai') {
            info += `<br><small>AI Metal: ${Math.floor(this.aiMetal)}/${this.getAIMetalCapacity()}</small>`;
        }

        if (this.buildings && Object.keys(this.buildings).length > 0) {
            info += `<br><strong>Edificios:</strong>`;
            Object.keys(this.buildings).forEach(buildingId => {
                const buildingData = this.buildings[buildingId];
                const building = Buildings ? Buildings.getDefinition(buildingId) : null;
                if (building) {
                    if (buildingData.constructing) {
                        const progress = Math.round(buildingData.progress);
                        info += `<br>${building.icon} ${building.name} (${progress}%)`;
                    } else {
                        info += `<br>${building.icon} ${building.name} ✅`;
                    }
                }
            });
        }
        
        if (this.owner === 'player') {
            const currentBuildings = this.buildings ? Object.keys(this.buildings).length : 0;
            const maxBuildings = CONFIG.BUILDINGS?.MAX_PER_PLANET || 3;
            if (currentBuildings < maxBuildings) {
                info += `<br><small style="color: #00ff88">Click derecho para construir (${currentBuildings}/${maxBuildings})</small>`;
            } else {
                info += `<br><small style="color: #ffaa00">Máximo de edificios alcanzado</small>`;
            }
        }
        
        return info;
    }

    attack(attackerShips, attacker) {
        if (this.owner === attacker) {
            this.ships = Math.min(this.capacity, this.ships + attackerShips);
        } else {
            if (attackerShips > this.ships) {
                this.owner = attacker;
                this.ships = attackerShips - this.ships;
                this.lastProduction = Date.now();
                
                if (this.owner === 'ai') {
                    this.aiMetal = 120;
                    this.lastAIMetalUpdate = Date.now();
                }
            } else {
                this.ships -= attackerShips;
            }
        }
        
        this.updateVisual();
    }

    setOwner(newOwner) {
        this.owner = newOwner;
        this.updateVisual();
    }

    setHovered(hovered) {
        if (this._currentlyHovered === hovered) return;
        this._currentlyHovered = hovered;
        
        if (hovered) {
            this.element.setAttribute('stroke', '#ffffff');
            this.element.setAttribute('stroke-width', '2');
        } else if (!this.isBeingConquered) {
            this.element.removeAttribute('stroke');
            this.element.removeAttribute('stroke-width');
        }
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

    startConquest(conqueror, fleetSize) {
        this.isBeingConquered = true;
        this.conqueror = conqueror;
        this.conquestTimer = 1000;
        this.updateVisual();
    }

    completeConquest() {
        if (this.conqueror) {
            this.setOwner(this.conqueror);
            this.ships = 1;
        }
        this.isBeingConquered = false;
        this.conqueror = null;
        this.conquestTimer = 0;
        this.updateVisual();
    }

    cleanup() {
        if (this.element) this.element.remove();
        if (this.textElement) this.textElement.remove();
        if (this.keyElement) this.keyElement.remove();
        
        this.buildingIndicators.forEach(indicator => indicator.remove());
        this.buildingIndicators = [];
    }
}
