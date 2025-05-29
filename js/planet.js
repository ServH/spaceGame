// Planet class - V1.3 Enhanced with Notification Integration
class Planet {
    constructor(x, y, capacity, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.capacity = capacity;
        this.ships = 0;
        this.owner = 'neutral';
        this.radius = Utils.lerp(CONFIG.VISUAL.PLANET_MIN_RADIUS, CONFIG.VISUAL.PLANET_MAX_RADIUS, capacity / 25);
        
        // Conquest system
        this.conquestTimer = 0;
        this.isBeingConquered = false;
        this.conqueror = null;
        
        // Production
        this.lastProduction = Date.now();
        this.productionRate = CONFIG.PLANETS.PRODUCTION_BASE + (capacity * CONFIG.PLANETS.PRODUCTION_MULTIPLIER);
        
        // V1.3: King of Hill properties
        this.isHill = false;
        this.hillProductionBonus = 1.0;
        
        // V1.3 Polish: Attack tracking
        this.lastAttackTime = 0;
        this.attackCooldown = 2000; // 2 seconds between attack notifications
        
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
        this.textElement.textContent = this.ships;
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
        this.keyElement.textContent = key;
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
        this.textElement.textContent = Utils.formatNumber(this.ships);
        
        // V1.3: Special styling for hill planets
        if (this.isHill) {
            this.element.setAttribute('stroke', '#ffd700');
            this.element.setAttribute('stroke-width', '2');
            this.element.setAttribute('stroke-opacity', '0.7');
        } else if (this.isBeingConquered) {
            this.element.setAttribute('stroke', '#ffff00');
            this.element.setAttribute('stroke-width', '2');
            this.element.removeAttribute('stroke-opacity');
        } else if (!this._currentlyHovered) {
            this.element.removeAttribute('stroke');
            this.element.removeAttribute('stroke-width');
            this.element.removeAttribute('stroke-opacity');
        }
    }

    // V1.3: Get effective production rate with hill bonus
    getEffectiveProductionRate() {
        let rate = this.productionRate;
        
        // Apply hill bonus if this is a hill planet
        if (this.isHill && this.hillProductionBonus) {
            rate *= this.hillProductionBonus;
        }
        
        return rate;
    }

    update(deltaTime) {
        // Ship production with hill bonus
        if (this.owner !== 'neutral' && this.ships < this.capacity) {
            const now = Date.now();
            const timeDiff = (now - this.lastProduction) / 1000;
            
            // Use effective production rate
            const effectiveRate = this.getEffectiveProductionRate();
            
            if (timeDiff >= 1 / effectiveRate) {
                this.ships = Math.min(this.capacity, this.ships + 1);
                this.lastProduction = now;
                this.updateVisual();
                
                // V1.2: Production pulse animation (enhanced for hill)
                if (typeof Animations !== 'undefined') {
                    if (this.isHill) {
                        Animations.createHillProductionPulse(this);
                    } else {
                        Animations.createProductionPulse(this);
                    }
                }
            }
        }
        
        // Conquest progress
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
            
            // V1.2: Add conquest animation
            if (typeof Animations !== 'undefined') {
                Animations.createConquestProgress(this);
            }

            // V1.3 Polish: Notify if player planet being conquered by AI
            if (this.owner === 'player' && newOwner === 'ai') {
                this.notifyAttack(newOwner);
            }
        }
    }

    completeConquest() {
        const previousOwner = this.owner;
        this.owner = this.conqueror;
        this.isBeingConquered = false;
        this.conqueror = null;
        this.conquestTimer = 0;
        this.lastProduction = Date.now();
        this.updateVisual();
        
        // V1.2: Remove conquest animation
        if (typeof Animations !== 'undefined') {
            Animations.removeAnimation(`conquest_${this.id}`);
        }

        // V1.3 Polish: Notify important captures
        if (this.isHill && typeof NotificationSystem !== 'undefined') {
            NotificationSystem.notifyEvent('hill_captured', {
                controller: this.owner,
                planet: this
            });
        }
        
        UI.updateStats();
    }

    attack(attackerShips, attacker) {
        const wasPlayerPlanet = this.owner === 'player';
        const isAIAttacking = attacker === 'ai';

        if (this.isBeingConquered && this.conqueror !== attacker) {
            this.isBeingConquered = false;
            this.conqueror = null;
            this.conquestTimer = 0;
            if (typeof Animations !== 'undefined') {
                Animations.removeAnimation(`conquest_${this.id}`);
            }
        }
        
        if (this.owner === attacker) {
            // Reinforcement
            this.ships = Math.min(this.capacity, this.ships + attackerShips);
        } else {
            // V1.3 Polish: Notify player planet under attack
            if (wasPlayerPlanet && isAIAttacking) {
                this.notifyAttack(attacker);
            }

            // V1.2: Add battle animation
            if (typeof Animations !== 'undefined') {
                Animations.createBattleEffect(this);
            }
            
            if (attackerShips > this.ships) {
                this.owner = attacker;
                this.ships = attackerShips - this.ships;
                this.lastProduction = Date.now();

                // V1.3 Polish: Special notification for hill capture
                if (this.isHill && typeof NotificationSystem !== 'undefined') {
                    NotificationSystem.notifyEvent('hill_captured', {
                        controller: attacker,
                        planet: this
                    });
                }
            } else {
                this.ships -= attackerShips;
            }
        }
        
        this.updateVisual();
        UI.updateStats();
    }

    // V1.3 Polish: Notify attack with cooldown
    notifyAttack(attacker) {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) {
            return; // Still in cooldown
        }

        this.lastAttackTime = now;

        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.notifyPlanetAttack(this, attacker);
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

    setHovered(hovered) {
        if (this._currentlyHovered === hovered) return;
        this._currentlyHovered = hovered;
        
        if (hovered) {
            this.element.setAttribute('stroke', CONFIG.VISUAL.HOVER_GLOW);
            this.element.setAttribute('stroke-width', '3');
            this.element.removeAttribute('stroke-opacity');
        } else if (this.isHill) {
            // Restore hill styling
            this.element.setAttribute('stroke', '#ffd700');
            this.element.setAttribute('stroke-width', '2');
            this.element.setAttribute('stroke-opacity', '0.7');
        } else if (this.isBeingConquered) {
            this.element.setAttribute('stroke', '#ffff00');
            this.element.setAttribute('stroke-width', '2');
            this.element.removeAttribute('stroke-opacity');
        } else {
            this.element.removeAttribute('stroke');
            this.element.removeAttribute('stroke-width');
            this.element.removeAttribute('stroke-opacity');
        }
    }

    // V1.3 Polish: Enhanced tooltip with incoming fleets
    getTooltipInfo() {
        const ownerName = this.owner === 'player' ? 'Jugador' : 
                         this.owner === 'ai' ? 'IA' : 'Neutral';
        
        let info = `<strong>${ownerName}</strong><br>`;
        info += `Naves: ${this.ships}/${this.capacity}<br>`;
        
        if (this.owner !== 'neutral') {
            const effectiveRate = this.getEffectiveProductionRate();
            info += `Producción: ${effectiveRate.toFixed(1)}/s<br>`;
            
            // Time to fill capacity
            if (this.ships < this.capacity) {
                const timeToFill = (this.capacity - this.ships) / effectiveRate;
                info += `Llenar en: ${Math.ceil(timeToFill)}s<br>`;
            }
        }

        // Show conquest progress
        if (this.isBeingConquered) {
            const progress = Math.round((1 - this.conquestTimer / CONFIG.PLANETS.CONQUEST_TIME) * 100);
            const conquerorName = this.conqueror === 'player' ? 'Jugador' : 'IA';
            info += `<span style="color: #ffff00;">Conquistando: ${progress}% (${conquerorName})</span><br>`;
        }

        // Show incoming fleets
        const incomingFleets = this.getIncomingFleets();
        if (incomingFleets.player > 0 || incomingFleets.ai > 0) {
            info += `<strong>En camino:</strong><br>`;
            if (incomingFleets.player > 0) {
                info += `🟢 ${incomingFleets.player} naves<br>`;
            }
            if (incomingFleets.ai > 0) {
                info += `🔴 ${incomingFleets.ai} naves<br>`;
            }
        }
        
        if (this.isHill) {
            const bonus = Math.round((this.hillProductionBonus - 1) * 100);
            info += `<span style="color: #ffd700;">👑 COLINA</span><br>`;
            info += `<span style="color: #ffd700;">+${bonus}% producción</span>`;
        }
        
        return info;
    }

    // V1.3 Polish: Get incoming fleets count
    getIncomingFleets() {
        const incoming = { player: 0, ai: 0 };
        
        if (typeof FleetManager !== 'undefined' && FleetManager.fleets) {
            FleetManager.fleets.forEach(fleet => {
                if (fleet.destination && fleet.destination.id === this.id) {
                    incoming[fleet.owner] += fleet.ships;
                }
            });
        }
        
        return incoming;
    }

    destroy() {
        if (this.element) this.element.remove();
        if (this.textElement) this.textElement.remove();
        if (this.keyElement) this.keyElement.remove();
        if (typeof Animations !== 'undefined') {
            Animations.removeAnimation(`conquest_${this.id}`);
        }
    }
}