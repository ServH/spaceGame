// Animations System - Visual Effects
const Animations = {
    activeAnimations: new Map(),
    
    init() {
        console.log('✨ Animations system initialized');
    },

    createProductionPulse(planet) {
        if (!planet.element) return;
        
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('cx', planet.x);
        pulse.setAttribute('cy', planet.y);
        pulse.setAttribute('r', planet.radius);
        pulse.setAttribute('fill', 'none');
        pulse.setAttribute('stroke', '#00ff88');
        pulse.setAttribute('stroke-width', '2');
        pulse.setAttribute('opacity', '0.8');
        
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'r');
        animate.setAttribute('values', `${planet.radius};${planet.radius + 15}`);
        animate.setAttribute('dur', '1s');
        animate.setAttribute('repeatCount', '1');
        
        const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateOpacity.setAttribute('attributeName', 'opacity');
        animateOpacity.setAttribute('values', '0.8;0');
        animateOpacity.setAttribute('dur', '1s');
        animateOpacity.setAttribute('repeatCount', '1');
        
        pulse.appendChild(animate);
        pulse.appendChild(animateOpacity);
        
        const svg = document.getElementById('gameCanvas');
        svg.appendChild(pulse);
        
        setTimeout(() => {
            if (pulse.parentNode) {
                pulse.parentNode.removeChild(pulse);
            }
        }, 1000);
    },

    createConquestProgress(planet) {
        // Conquest animation implementation
    },

    createBattleEffect(planet) {
        // Battle effect implementation
    },

    createFleetTrail(fleet) {
        // Fleet trail implementation
    },

    updateFleetTrail(fleet) {
        // Update fleet trail
    },

    animateFleetArrival(fleet, destination) {
        // Fleet arrival animation
    },

    removeAnimation(id) {
        if (this.activeAnimations.has(id)) {
            const animation = this.activeAnimations.get(id);
            if (animation.element && animation.element.parentNode) {
                animation.element.parentNode.removeChild(animation.element);
            }
            this.activeAnimations.delete(id);
        }
    }
};

// Make Animations globally available
if (typeof window !== 'undefined') {
    window.Animations = Animations;
}