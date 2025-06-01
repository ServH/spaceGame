// Fleet system - Based on working branch
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
        this.travelTime = this.distance / CONFIG.FLEET.SPEED * 1000;
        this.startTime = Date.now();
        
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
                fill = CONFIG.COLORS.PLAYER;
                break;
            case 'ai':
                fill = CONFIG.COLORS.AI;
                break;
            default:
                fill = CONFIG.COLORS.NEUTRAL;
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
        if (this.destination.owner === 'neutral') {
            this.destination.startConquest(this.owner, this.ships);
        } else {
            this.destination.attack(this.ships, this.owner);
        }
        
        this.destroy();
    }

    destroy() {
        if (this.element) this.element.remove();
        if (this.textElement) this.textElement.remove();
    }
}

// FleetManager - Based on working branch logic
const FleetManager = {
    fleets: [],

    createFleet(origin, destination, ships, owner) {
        if (!origin.canSendShips(ships)) {
            console.log(`🚫 Cannot send fleet: insufficient ships on planet ${origin.id}`);
            return null;
        }

        // Energy cost calculation for player
        if (owner === 'player') {
            const distance = Utils.distance(origin, destination);
            const energyCost = CONFIG.calculateMovementCost(ships, distance);
            
            if (!ResourceManager.canAffordMovement(ships, distance)) {
                console.log(`🚫 Player cannot afford movement: ${energyCost} energy needed`);
                return null;
            }
            ResourceManager.spendEnergy(energyCost);
        }

        if (origin.sendShips(ships)) {
            const fleet = new Fleet(origin, destination, ships, owner);
            this.fleets.push(fleet);
            return fleet;
        }
        
        return null;
    },

    update() {
        this.fleets = this.fleets.filter(fleet => fleet.update());
    },

    clear() {
        this.fleets.forEach(fleet => fleet.destroy());
        this.fleets = [];
    }
};
