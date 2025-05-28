// Planet class - Core game entity
class Planet {
    constructor(x, y, capacity, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.capacity = capacity;
        this.ships = 0;
        this.owner = 'neutral'; // 'player', 'ai', 'neutral'
        this.radius = Utils.lerp(CONFIG.VISUAL.PLANET_MIN_RADIUS, CONFIG.VISUAL.PLANET_MAX_RADIUS, capacity / 25);
        
        // Conquest system
        this.conquestTimer = 0;
        this.isBeingConquered = false;
        this.conqueror = null;
        
        // Production
        this.lastProduction = Date.now();
        this.productionRate = CONFIG.PLANETS.PRODUCTION_BASE + (capacity * CONFIG.PLANETS.PRODUCTION_MULTIPLIER);
        
        // Visual
        this.element = null;
        this.textElement = null;
        this.keyElement = null;
        this.assignedKey = null;
        
        this.createVisual();
    }

    createVisual() {
        const svg = document.getElementById('gameCanvas');
        
        // Planet circle
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.element.setAttribute('cx', this.x);
        this.element.setAttribute('cy', this.y);
        this.element.setAttribute('r', this.radius);
        this.element.setAttribute('class', 'planet');
        this.element.setAttribute('data-planet-id', this.id);
        svg.appendChild(this.element);
        
        // Ship count text
        this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textElement.setAttribute('x', this.x);
        this.textElement.setAttribute('y', this.y + 5);
        this.textElement.setAttribute('text-anchor', 'middle');
        this.textElement.setAttribute('fill', 'white');
        this.textElement.setAttribute('font-size', '14');
        this.textElement.setAttribute('font-weight', 'bold');
        this.textElement.textContent = this.ships;
        svg.appendChild(this.textElement);
        
        // Keyboard key indicator
        this.keyElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.keyElement.setAttribute('x', this.x);
        this.keyElement.setAttribute('y', this.y - this.radius - 10);
        this.keyElement.setAttribute('text-anchor', 'middle');
        this.keyElement.setAttribute('fill', '#ffff00');
        this.keyElement.setAttribute('font-size', '12');
        this.keyElement.setAttribute('font-weight', 'bold');
        svg.appendChild(this.keyElement);
        
        this.updateVisual();
    }

    assignKey(key) {
        this.assignedKey = key;
        this.keyElement.textContent = key;
        CONFIG.KEYBOARD.assignments[key] = this.id;
    }

    updateVisual() {
        if (!this.element) return;
        
        // Update color based on owner
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
        this.textElement.textContent = Utils.formatNumber(this.ships);
        
        // Update stroke for conquest status
        if (this.isBeingConquered) {
            this.element.setAttribute('stroke', '#ffff00');
            this.element.setAttribute('stroke-width', '2');
        } else {
            this.element.removeAttribute('stroke');
            this.element.removeAttribute('stroke-width');
        }
    }

    update(deltaTime) {
        // Produce ships if owned
        if (this.owner !== 'neutral' && this.ships < this.capacity) {
            const now = Date.now();
            const timeDiff = (now - this.lastProduction) / 1000;
            
            if (timeDiff >= 1 / this.productionRate) {
                this.ships = Math.min(this.capacity, this.ships + 1);
                this.lastProduction = now;
                this.updateVisual();
            }
        }
        
        // Handle conquest timer
        if (this.isBeingConquered) {
            this.conquestTimer -= deltaTime;
            if (this.conquestTimer <= 0) {
                this.completeConquest();
            }
        }
    }

    startConquest(newOwner, ships) {
        if (this.owner === 'neutral') {
            this.isBeingConquered = true;
            this.conqueror = newOwner;
            this.ships = ships;
            this.conquestTimer = CONFIG.PLANETS.CONQUEST_TIME;
            this.updateVisual();
        }
    }

    completeConquest() {
        this.owner = this.conqueror;
        this.isBeingConquered = false;
        this.conqueror = null;
        this.conquestTimer = 0;
        this.lastProduction = Date.now();
        this.updateVisual();
        
        // Update UI stats
        UI.updateStats();
    }

    attack(attackerShips, attacker) {
        if (this.isBeingConquered && this.conqueror !== attacker) {
            // Interrupt conquest
            this.isBeingConquered = false;
            this.conqueror = null;
            this.conquestTimer = 0;
        }
        
        if (this.owner === attacker) {
            // Reinforcement
            this.ships = Math.min(this.capacity, this.ships + attackerShips);
        } else {
            // Battle
            if (attackerShips > this.ships) {
                // Attacker wins
                this.owner = attacker;
                this.ships = attackerShips - this.ships;
                this.lastProduction = Date.now();
            } else {
                // Defender wins
                this.ships -= attackerShips;
            }
        }
        
        this.updateVisual();
        UI.updateStats();
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
        if (hovered) {
            this.element.setAttribute('stroke', CONFIG.VISUAL.HOVER_GLOW);
            this.element.setAttribute('stroke-width', '2');
        } else if (!this.isBeingConquered) {
            this.element.removeAttribute('stroke');
            this.element.removeAttribute('stroke-width');
        }
    }

    destroy() {
        if (this.element) this.element.remove();
        if (this.textElement) this.textElement.remove();
        if (this.keyElement) this.keyElement.remove();
    }
}
