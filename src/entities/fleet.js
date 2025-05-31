// Fleet Manager - OPCIÓN A GALCON with metal cost for sending ships
const FleetManager = {
    fleets: [],
    
    createFleet(source, target, ships, owner) {
        if (!source.canSendShips(ships)) {
            console.warn(`Cannot send ${ships} ships from planet ${source.id}`);
            return null;
        }
        
        // OPCIÓN A: Pay metal cost for sending ships
        if (owner === 'player') {
            const metalCost = ships * (CONFIG.SHIP_COST?.metal || 1);
            if (!ResourceManager.canSpendMetal(metalCost)) {
                console.warn(`Not enough metal to send ${ships} ships (need ${metalCost})`);
                return null;
            }
            ResourceManager.spendMetal(metalCost);
        } else if (owner === 'ai') {
            // AI pays from planet's metal storage
            const metalCost = ships * (CONFIG.SHIP_COST?.metal || 1);
            if (source.aiMetal < metalCost) {
                console.warn(`AI planet ${source.id} doesn't have enough metal (${source.aiMetal} < ${metalCost})`);
                return null;
            }
            source.aiMetal -= metalCost;
        }
        
        if (source.sendShips(ships)) {
            const fleet = new Fleet(source, target, ships, owner);
            this.fleets.push(fleet);
            
            if (GameEngine) {
                GameEngine.addFleet(fleet);
            }
            
            return fleet;
        }
        
        return null;
    },
    
    update(deltaTime) {
        this.fleets.forEach(fleet => {
            fleet.update(deltaTime);
        });
        
        // Remove completed fleets
        this.fleets = this.fleets.filter(fleet => !fleet.hasArrived);
    },
    
    removeFleet(fleet) {
        const index = this.fleets.indexOf(fleet);
        if (index > -1) {
            this.fleets.splice(index, 1);
        }
    }
};

class Fleet {
    constructor(source, target, ships, owner) {
        this.source = source;
        this.target = target;
        this.ships = ships;
        this.owner = owner;
        this.x = source.x;
        this.y = source.y;
        this.hasArrived = false;
        
        // Calculate movement
        const distance = Utils.distance(source, target);
        const speed = CONFIG.FLEET.SPEED;
        this.travelTime = distance / speed * 1000; // Convert to milliseconds
        this.startTime = Date.now();
        
        // Visual representation
        this.element = null;
        this.createVisual();
        
        if (window.Animations) {
            Animations.createFleetTrail(this);
        }
    }
    
    createVisual() {
        const svg = document.getElementById('gameCanvas');
        
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.element.setAttribute('cx', this.x);
        this.element.setAttribute('cy', this.y);
        this.element.setAttribute('r', '3');
        this.element.setAttribute('class', 'fleet');
        
        // Color based on owner
        const color = this.owner === 'player' ? CONFIG.COLORS.PLAYER : CONFIG.COLORS.AI;
        this.element.setAttribute('fill', color);
        this.element.setAttribute('stroke', 'white');
        this.element.setAttribute('stroke-width', '1');
        
        svg.appendChild(this.element);
    }
    
    update(deltaTime) {
        if (this.hasArrived) return;
        
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.travelTime, 1);
        
        // Interpolate position
        this.x = Utils.lerp(this.source.x, this.target.x, progress);
        this.y = Utils.lerp(this.source.y, this.target.y, progress);
        
        // Update visual position
        if (this.element) {
            this.element.setAttribute('cx', this.x);
            this.element.setAttribute('cy', this.y);
        }
        
        if (window.Animations) {
            Animations.updateFleetTrail(this);
        }
        
        // Check if arrived
        if (progress >= 1) {
            this.arrive();
        }
    }
    
    arrive() {
        if (this.hasArrived) return;
        
        this.hasArrived = true;
        
        // Attack or reinforce target
        this.target.attack(this.ships, this.owner);
        
        // Visual effects
        if (window.Animations) {
            Animations.animateFleetArrival(this, this.target);
        }
        
        // Clean up
        this.destroy();
        
        // Remove from fleet manager
        FleetManager.removeFleet(this);
        
        if (GameEngine) {
            GameEngine.removeFleet(this);
        }
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Make FleetManager globally available
if (typeof window !== 'undefined') {
    window.FleetManager = FleetManager;
    window.Fleet = Fleet;
}