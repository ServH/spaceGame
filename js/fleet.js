// Fleet class - Enhanced with V1.2 trail animations + CRITICAL FIX - Ships are FREE to send
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
        
        // V1.2: Create trail animation
        if (typeof Animations !== 'undefined') {
            Animations.createFleetTrail(this);
        }
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
        
        // V1.2: Update trail
        if (typeof Animations !== 'undefined') {
            Animations.updateFleetTrail(this);
        }
        
        if (progress >= 1) {
            this.arrive();
            return false;
        }
        
        return true;
    }

    arrive() {
        // V1.2: Fleet arrival animation
        if (typeof Animations !== 'undefined') {
            Animations.animateFleetArrival(this, this.destination);
        }
        
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
        
        // V1.2: Remove trail animation
        if (typeof Animations !== 'undefined') {
            Animations.removeAnimation(`trail_${this.id}`);
        }
    }
}

// Fleet manager - CRITICAL FIX - Ships are FREE to send, only cost metal when CREATED
const FleetManager = {
    fleets: [],

    // CRITICAL FIX: Ships are FREE to send - no resource cost for sending
    createFleet(origin, destination, ships, owner) {
        // FIXED: No resource cost for SENDING ships
        // Ships only cost metal when CREATED by planets, not when SENT
        
        // Only check if planet has enough ships to send
        if (origin.canSendShips(ships)) {
            origin.sendShips(ships);
            const fleet = new Fleet(origin, destination, ships, owner);
            this.fleets.push(fleet);
            
            console.log(`🚀 Created fleet: ${ships} ships from ${origin.id} to ${destination.id} (${owner})`);
            return fleet;
        } else {
            console.log(`🚫 Cannot send fleet: insufficient ships on planet ${origin.id}`);
            return null;
        }
    },

    // FIXED: Simplified validation - only check ship availability
    canCreateFleet(origin, destination, ships, owner) {
        // Only check if planet has enough ships to send
        if (!origin.canSendShips(ships)) {
            return { 
                canCreate: false, 
                reason: 'insufficient_ships',
                have: origin.ships,
                need: ships
            };
        }
        
        return { canCreate: true };
    },

    // REMOVED: No ship cost for sending (only for creating)
    getShipCost(ships = 1) {
        return 0; // FREE to send ships
    },

    update() {
        this.fleets = this.fleets.filter(fleet => fleet.update());
    },

    clear() {
        this.fleets.forEach(fleet => fleet.destroy());
        this.fleets = [];
    },

    // Get fleet count for specific owner
    getFleetCount(owner) {
        return this.fleets.filter(fleet => fleet.owner === owner).length;
    },

    // Get total ships in transit for owner
    getShipsInTransit(owner) {
        return this.fleets
            .filter(fleet => fleet.owner === owner)
            .reduce((total, fleet) => total + fleet.ships, 0);
    }
};