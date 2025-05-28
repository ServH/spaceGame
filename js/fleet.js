// Fleet class - Moving ships between planets
class Fleet {
    constructor(origin, destination, ships, owner) {
        this.id = Date.now() + Math.random(); // Unique ID
        this.origin = origin;
        this.destination = destination;
        this.ships = ships;
        this.owner = owner;
        
        // Position and movement
        this.x = origin.x;
        this.y = origin.y;
        this.targetX = destination.x;
        this.targetY = destination.y;
        
        // Calculate movement
        this.distance = Utils.distance(origin, destination);
        this.travelTime = this.distance / CONFIG.FLEET.SPEED * 1000; // ms
        this.startTime = Date.now();
        
        // Visual
        this.element = null;
        this.textElement = null;
        this.createVisual();
    }

    createVisual() {
        const svg = document.getElementById('gameCanvas');
        
        // Fleet circle
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.element.setAttribute('cx', this.x);
        this.element.setAttribute('cy', this.y);
        this.element.setAttribute('r', 3);
        this.element.setAttribute('class', 'fleet');
        
        // Color based on owner
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
        
        // Ship count text
        this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textElement.setAttribute('x', this.x + 5);
        this.textElement.setAttribute('y', this.y - 5);
        this.textElement.setAttribute('fill', 'white');
        this.textElement.setAttribute('font-size', '10');
        this.textElement.textContent = this.ships;
        svg.appendChild(this.textElement);
    }

    update() {
        const now = Date.now();
        const elapsed = now - this.startTime;
        const progress = Math.min(elapsed / this.travelTime, 1);
        
        // Update position
        this.x = Utils.lerp(this.origin.x, this.targetX, progress);
        this.y = Utils.lerp(this.origin.y, this.targetY, progress);
        
        // Update visual
        this.element.setAttribute('cx', this.x);
        this.element.setAttribute('cy', this.y);
        this.textElement.setAttribute('x', this.x + 5);
        this.textElement.setAttribute('y', this.y - 5);
        
        // Check if arrived
        if (progress >= 1) {
            this.arrive();
            return false; // Remove from fleets array
        }
        
        return true; // Continue existing
    }

    arrive() {
        // Attack/reinforce destination planet
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

// Fleet manager
const FleetManager = {
    fleets: [],

    createFleet(origin, destination, ships, owner) {
        if (origin.canSendShips(ships)) {
            origin.sendShips(ships);
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
