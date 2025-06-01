// Animations Manager - Optimized for Performance V2.1
const Animations = {
    activeAnimations: new Map(),
    animationIdCounter: 0,

    init() {
        console.log('✨ Animations system initialized');
    },

    // Create production pulse with memory management
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
        
        // Use PerformanceManager for cleanup timer
        const cleanup = () => {
            if (pulse.parentNode) {
                pulse.parentNode.removeChild(pulse);
            }
        };
        
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.createTimer(cleanup, 1000);
        } else {
            setTimeout(cleanup, 1000);
        }
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

    // Create fleet movement animation with better performance
    createFleetAnimation(fleet) {
        const animationId = `fleet_${this.animationIdCounter++}`;
        
        const animation = {
            id: animationId,
            fleet: fleet,
            element: fleet.element,
            startTime: performance.now(),
            duration: fleet.travelTime
        };
        
        this.activeAnimations.set(animationId, animation);
        
        // Use requestAnimationFrame for smooth animation
        const animate = (currentTime) => {
            if (!this.activeAnimations.has(animationId)) return;
            
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            // Update fleet position
            if (fleet.element && fleet.source && fleet.target) {
                const x = fleet.source.x + (fleet.target.x - fleet.source.x) * progress;
                const y = fleet.source.y + (fleet.target.y - fleet.source.y) * progress;
                
                fleet.element.setAttribute('cx', x);
                fleet.element.setAttribute('cy', y);
            }
            
            // Continue animation or cleanup
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.removeAnimation(animationId);
            }
        };
        
        requestAnimationFrame(animate);
        return animationId;
    },

    // Remove animation with proper cleanup
    removeAnimation(id) {
        if (this.activeAnimations.has(id)) {
            const animation = this.activeAnimations.get(id);
            if (animation.element && animation.element.parentNode) {
                animation.element.parentNode.removeChild(animation.element);
            }
            this.activeAnimations.delete(id);
        }
    },

    // Cleanup all animations (for memory management)
    cleanup() {
        console.log('🧹 Cleaning up Animations...');
        
        // Remove all active animations
        this.activeAnimations.forEach((animation, id) => {
            if (animation.element && animation.element.parentNode) {
                animation.element.parentNode.removeChild(animation.element);
            }
        });
        
        this.activeAnimations.clear();
        this.animationIdCounter = 0;
        
        console.log('✅ Animations cleanup complete');
    },

    // Get animation stats for debugging
    getStats() {
        return {
            activeAnimations: this.activeAnimations.size,
            nextId: this.animationIdCounter
        };
    }
};

// Make Animations globally available
if (typeof window !== 'undefined') {
    window.Animations = Animations;
}