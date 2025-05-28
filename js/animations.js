// Animation System - Smooth visual effects for V1.2
const Animations = {
    activeAnimations: new Map(),
    animationId: 0,

    init() {
        console.log('✨ Animation system initialized');
    },

    // Create smooth conquest progress animation
    createConquestProgress(planet) {
        const id = `conquest_${planet.id}`;
        if (this.activeAnimations.has(id)) return;

        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', planet.x);
        progressCircle.setAttribute('cy', planet.y);
        progressCircle.setAttribute('r', planet.radius + 5);
        progressCircle.setAttribute('fill', 'none');
        progressCircle.setAttribute('stroke', '#ffaa00');
        progressCircle.setAttribute('stroke-width', '3');
        progressCircle.setAttribute('opacity', '0.8');
        progressCircle.setAttribute('stroke-dasharray', `${2 * Math.PI * (planet.radius + 5)}`);
        progressCircle.setAttribute('stroke-dashoffset', `${2 * Math.PI * (planet.radius + 5)}`);
        progressCircle.style.transform = 'rotate(-90deg)';
        progressCircle.style.transformOrigin = `${planet.x}px ${planet.y}px`;

        document.getElementById('gameCanvas').appendChild(progressCircle);

        this.activeAnimations.set(id, {
            element: progressCircle,
            type: 'conquest',
            planet: planet,
            startTime: Date.now()
        });
    },

    // Update conquest progress
    updateConquestProgress(planet) {
        const id = `conquest_${planet.id}`;
        const animation = this.activeAnimations.get(id);
        
        if (!animation || !planet.isBeingConquered) {
            this.removeAnimation(id);
            return;
        }

        const progress = 1 - (planet.conquestTimer / CONFIG.PLANETS.CONQUEST_TIME);
        const circumference = 2 * Math.PI * (planet.radius + 5);
        const dashOffset = circumference * (1 - progress);
        
        animation.element.setAttribute('stroke-dashoffset', dashOffset);
    },

    // Fleet trail animation
    createFleetTrail(fleet) {
        const id = `trail_${fleet.id}`;
        
        const trail = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        trail.setAttribute('class', 'fleet-trail');
        
        // Create multiple trail dots
        for (let i = 0; i < 4; i++) {
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('r', 2 - i * 0.3);
            dot.setAttribute('fill', fleet.owner === 'player' ? CONFIG.COLORS.PLAYER : CONFIG.COLORS.AI);
            dot.setAttribute('opacity', 0.8 - i * 0.2);
            trail.appendChild(dot);
        }

        document.getElementById('gameCanvas').appendChild(trail);

        this.activeAnimations.set(id, {
            element: trail,
            type: 'trail',
            fleet: fleet,
            positions: []
        });
    },

    // Update fleet trail
    updateFleetTrail(fleet) {
        const id = `trail_${fleet.id}`;
        const animation = this.activeAnimations.get(id);
        
        if (!animation) return;

        // Store position history
        animation.positions.unshift({ x: fleet.x, y: fleet.y });
        if (animation.positions.length > 4) {
            animation.positions.pop();
        }

        // Update trail dots
        const dots = animation.element.querySelectorAll('circle');
        dots.forEach((dot, i) => {
            if (animation.positions[i]) {
                dot.setAttribute('cx', animation.positions[i].x);
                dot.setAttribute('cy', animation.positions[i].y);
            }
        });
    },

    // Planet production pulse
    createProductionPulse(planet) {
        if (planet.owner === 'neutral') return;
        
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('cx', planet.x);
        pulse.setAttribute('cy', planet.y);
        pulse.setAttribute('r', planet.radius);
        pulse.setAttribute('fill', 'none');
        pulse.setAttribute('stroke', planet.owner === 'player' ? CONFIG.COLORS.PLAYER : CONFIG.COLORS.AI);
        pulse.setAttribute('stroke-width', '2');
        pulse.setAttribute('opacity', '0.6');
        pulse.style.pointerEvents = 'none';

        document.getElementById('gameCanvas').appendChild(pulse);

        // Animate pulse
        let scale = 1;
        let opacity = 0.6;
        
        const animate = () => {
            scale += 0.03;
            opacity -= 0.03;
            
            pulse.setAttribute('r', planet.radius * scale);
            pulse.setAttribute('opacity', opacity);
            
            if (opacity <= 0) {
                pulse.remove();
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    // Battle explosion effect
    createBattleEffect(planet) {
        const explosion = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Create multiple particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const angle = (i / 8) * Math.PI * 2;
            const distance = planet.radius + 10;
            
            particle.setAttribute('cx', planet.x);
            particle.setAttribute('cy', planet.y);
            particle.setAttribute('r', 3);
            particle.setAttribute('fill', '#ff6600');
            particle.setAttribute('opacity', '0.8');
            particle.style.pointerEvents = 'none';
            
            explosion.appendChild(particle);
        }

        document.getElementById('gameCanvas').appendChild(explosion);

        // Animate explosion
        let frame = 0;
        const animate = () => {
            frame++;
            const particles = explosion.querySelectorAll('circle');
            
            particles.forEach((particle, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const distance = frame * 2;
                const x = planet.x + Math.cos(angle) * distance;
                const y = planet.y + Math.sin(angle) * distance;
                const opacity = Math.max(0, 0.8 - frame * 0.05);
                
                particle.setAttribute('cx', x);
                particle.setAttribute('cy', y);
                particle.setAttribute('opacity', opacity);
            });
            
            if (frame < 20) {
                requestAnimationFrame(animate);
            } else {
                explosion.remove();
            }
        };
        
        requestAnimationFrame(animate);
    },

    // Smooth fleet arrival
    animateFleetArrival(fleet, destination) {
        this.createBattleEffect(destination);
        this.removeAnimation(`trail_${fleet.id}`);
    },

    // Remove animation
    removeAnimation(id) {
        const animation = this.activeAnimations.get(id);
        if (animation && animation.element) {
            animation.element.remove();
        }
        this.activeAnimations.delete(id);
    },

    // Update all animations
    update() {
        for (const [id, animation] of this.activeAnimations.entries()) {
            switch (animation.type) {
                case 'conquest':
                    this.updateConquestProgress(animation.planet);
                    break;
                case 'trail':
                    this.updateFleetTrail(animation.fleet);
                    break;
            }
        }
    },

    // Clear all animations
    clear() {
        for (const [id, animation] of this.activeAnimations.entries()) {
            if (animation.element) {
                animation.element.remove();
            }
        }
        this.activeAnimations.clear();
    }
};