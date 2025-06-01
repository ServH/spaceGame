// Fleet Entity - Enhanced for Energy Fuel System
class Fleet {
    constructor(source, destination, ships, owner) {
        this.id = 'fleet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.source = source;
        this.destination = destination;
        this.ships = ships;
        this.owner = owner;
        this.x = source.x;
        this.y = source.y;
        this.hasArrived = false;
        this.element = null;
        
        // Calculate journey
        this.totalDistance = Utils.distance(source, destination);
        this.travelTime = this.calculateTravelTime();
        this.startTime = Date.now();
        this.endTime = this.startTime + this.travelTime;
        
        // Visual properties
        this.radius = Math.max(3, Math.min(8, Math.sqrt(ships) * 0.8));
        
        console.log(`🚀 Fleet created: ${ships} ships from ${source.id} to ${destination.id} (${this.travelTime}ms)`);
    }
    
    calculateTravelTime() {
        const baseSpeed = CONFIG.FLEETS.SPEED;
        const distance = this.totalDistance;
        return (distance / baseSpeed) * 1000; // Convert to milliseconds
    }
    
    createElement(canvas) {
        if (this.element) return;
        
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.element.setAttribute('cx', this.x);
        this.element.setAttribute('cy', this.y);
        this.element.setAttribute('r', this.radius);
        this.element.setAttribute('fill', this.getColor());
        this.element.setAttribute('stroke', 'white');
        this.element.setAttribute('stroke-width', '1');
        this.element.classList.add('fleet');
        
        canvas.appendChild(this.element);
    }
    
    getColor() {
        switch (this.owner) {
            case 'player': return '#00ff88';
            case 'ai': return '#ff4444';
            default: return '#888888';
        }
    }
    
    update(deltaTime) {
        if (this.hasArrived) return;
        
        const now = Date.now();
        const elapsed = now - this.startTime;
        const progress = Math.min(1, elapsed / this.travelTime);
        
        // Update position
        this.x = this.source.x + (this.destination.x - this.source.x) * progress;
        this.y = this.source.y + (this.destination.y - this.source.y) * progress;
        
        // Update visual
        if (this.element) {
            this.element.setAttribute('cx', this.x);
            this.element.setAttribute('cy', this.y);
        }
        
        // Check arrival
        if (progress >= 1) {
            this.arrive();
        }
    }
    
    arrive() {
        if (this.hasArrived) return;
        
        this.hasArrived = true;
        console.log(`🎯 Fleet arrived: ${this.ships} ships at planet ${this.destination.id}`);
        
        // Handle planet takeover/reinforcement
        if (this.destination.owner === this.owner) {
            // Reinforcement
            this.destination.ships += this.ships;
            console.log(`📈 Reinforced planet ${this.destination.id}: +${this.ships} ships`);
        } else {
            // Combat
            this.handleCombat();
        }
        
        // Remove visual element
        this.cleanup();
        
        // Remove from fleet manager
        if (typeof GameEngine !== 'undefined' && GameEngine.removeFleet) {
            GameEngine.removeFleet(this);
        }
    }
    
    handleCombat() {
        const attackingShips = this.ships;
        const defendingShips = this.destination.ships;
        
        console.log(`⚔️ Combat: ${attackingShips} vs ${defendingShips} at planet ${this.destination.id}`);
        
        if (attackingShips > defendingShips) {
            // Successful invasion
            const remainingShips = attackingShips - defendingShips;
            const previousOwner = this.destination.owner;
            
            this.destination.setOwner(this.owner);
            this.destination.ships = remainingShips;
            
            console.log(`🏆 Planet ${this.destination.id} conquered by ${this.owner}`);
            
            // Show conquest notification
            if (typeof UI !== 'undefined' && UI.showPlanetConquered) {
                UI.showPlanetConquered(this.destination, this.owner);
            }
            
            // Create conquest effect
            this.createConquestEffect();
        } else {
            // Failed invasion
            this.destination.ships = defendingShips - attackingShips;
            console.log(`🛡️ Invasion failed: ${this.destination.ships} defenders remain`);
        }
    }
    
    createConquestEffect() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Create expanding ring effect
        const effect = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        effect.setAttribute('cx', this.destination.x);
        effect.setAttribute('cy', this.destination.y);
        effect.setAttribute('r', this.destination.radius);
        effect.setAttribute('fill', 'none');
        effect.setAttribute('stroke', this.getColor());
        effect.setAttribute('stroke-width', '3');
        effect.setAttribute('opacity', '1');
        
        canvas.appendChild(effect);
        
        // Animate effect
        let opacity = 1;
        let radius = this.destination.radius;
        
        const animate = () => {
            opacity -= 0.05;
            radius += 3;
            
            effect.setAttribute('opacity', opacity);
            effect.setAttribute('r', radius);
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                canvas.removeChild(effect);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    cleanup() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Fleet Manager for handling multiple fleets
const FleetManager = {
    fleets: [],
    
    createFleet(source, destination, ships, owner) {
        const fleet = new Fleet(source, destination, ships, owner);
        this.fleets.push(fleet);
        
        // Create visual element
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            fleet.createElement(canvas);
        }
        
        // Add to GameEngine if available
        if (typeof GameEngine !== 'undefined' && GameEngine.addFleet) {
            GameEngine.addFleet(fleet);
        }
        
        return fleet;
    },
    
    update(deltaTime) {
        this.fleets.forEach(fleet => fleet.update(deltaTime));
        
        // Remove arrived fleets
        this.fleets = this.fleets.filter(fleet => !fleet.hasArrived);
    },
    
    clear() {
        this.fleets.forEach(fleet => fleet.cleanup());
        this.fleets = [];
    },
    
    getActiveFleets() {
        return this.fleets.filter(fleet => !fleet.hasArrived);
    }
};

// Make available globally
window.Fleet = Fleet;
window.FleetManager = FleetManager;