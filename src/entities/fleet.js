// Fleet class - FIXED for refactored architecture
class Fleet {
    constructor(origin, destination, ships, owner) {
        this.id = Date.now() + Math.random();
        this.origin = origin;
        this.destination = destination;
        this.ships = ships;
        this.owner = owner;
        
        this.x = origin.x;
        this.y = origin.y;
        this.targetX = destination.x;
        this.targetY = destination.y;
        
        this.distance = Utils.distance(origin, destination);
        this.speed = CONFIG.FLEETS?.SPEED || 60;
        this.travelTime = this.distance / this.speed * 1000;
        this.startTime = Date.now();
        this.hasArrived = false;
        
        this.element = null;
        this.textElement = null;
        this.createVisual();
        
        console.log(`🚀 Fleet created: ${ships} ships from ${origin.id} to ${destination.id} (${this.travelTime.toFixed(1)}ms)`);
    }

    createVisual() {
        const svg = document.getElementById('gameCanvas');
        
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.element.setAttribute('cx', this.x);
        this.element.setAttribute('cy', this.y);
        this.element.setAttribute('r', 3);
        this.element.setAttribute('class', 'fleet');
        this.element.style.pointerEvents = 'none';
        
        let fill;
        switch (this.owner) {
            case 'player':
                fill = '#00ff88';
                break;
            case 'ai':
                fill = '#ff4444';
                break;
            default:
                fill = '#888888';
        }
        this.element.setAttribute('fill', fill);
        svg.appendChild(this.element);
        
        this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textElement.setAttribute('x', this.x + 5);
        this.textElement.setAttribute('y', this.y - 5);
        this.textElement.setAttribute('fill', 'white');
        this.textElement.setAttribute('font-size', '10');
        this.textElement.textContent = this.ships;
        this.textElement.style.pointerEvents = 'none';
        svg.appendChild(this.textElement);
    }

    update() {
        if (this.hasArrived) return false;
        
        const now = Date.now();
        const elapsed = now - this.startTime;
        const progress = Math.min(elapsed / this.travelTime, 1);
        
        this.x = Utils.lerp(this.origin.x, this.targetX, progress);
        this.y = Utils.lerp(this.origin.y, this.targetY, progress);
        
        this.element.setAttribute('cx', this.x);
        this.element.setAttribute('cy', this.y);
        this.textElement.setAttribute('x', this.x + 5);
        this.textElement.setAttribute('y', this.y - 5);
        
        if (progress >= 1) {
            this.arrive();
            return false;
        }
        
        return true;
    }

    arrive() {
        this.hasArrived = true;
        this.destination.attack(this.ships, this.owner);
        this.cleanup();
    }

    cleanup() {
        if (this.element) this.element.remove();
        if (this.textElement) this.textElement.remove();
    }
}

// FleetManager - Compatible with energy costs
const FleetManager = {
    createFleet(origin, destination, ships, owner) {
        if (!origin.canSendShips(ships)) {
            console.log(`🚫 Cannot send fleet: insufficient ships on planet ${origin.id}`);
            return null;
        }

        // Check energy cost for movement
        const distance = Utils.distance(origin, destination);
        const energyCost = CONFIG.calculateMovementCost(ships, distance);
        
        // For AI, use AI energy payment system
        if (owner === 'ai') {
            if (!ResourceManager.payForAIMovement(ships, distance)) {
                console.log(`🚫 AI cannot afford movement: ${energyCost} energy needed`);
                return null;
            }
        } else if (owner === 'player') {
            // For player, check energy availability
            if (!ResourceManager.canAffordMovement(ships, distance)) {
                console.log(`🚫 Player cannot afford movement: ${energyCost} energy needed`);
                return null;
            }
            ResourceManager.spendEnergy(energyCost);
        }

        // Send ships and create fleet
        if (origin.sendShips(ships)) {
            const fleet = new Fleet(origin, destination, ships, owner);
            GameEngine.addFleet(fleet);
            return fleet;
        }
        
        return null;
    },

    canCreateFleet(origin, destination, ships, owner) {
        if (!origin.canSendShips(ships)) {
            return { 
                canCreate: false, 
                reason: 'insufficient_ships',
                have: origin.ships,
                need: ships
            };
        }
        
        const distance = Utils.distance(origin, destination);
        if (owner === 'player' && !ResourceManager.canAffordMovement(ships, distance)) {
            return {
                canCreate: false,
                reason: 'insufficient_energy',
                cost: CONFIG.calculateMovementCost(ships, distance)
            };
        }
        
        return { canCreate: true };
    }
};
