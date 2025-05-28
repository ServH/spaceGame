// Input Manager - Fixed hover with pointer-events and positioning
const InputManager = {
    dragState: {
        isDragging: false,
        startPlanet: null,
        dragLine: null
    },
    keyboardState: {
        selectedPlanet: null,
        lastKeyTime: 0
    },
    lastHoveredPlanet: null,

    init() {
        this.setupMouseEvents();
        this.setupKeyboardEvents();
        console.log('🎮 Input Manager initialized');
    },

    setupMouseEvents() {
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e), false);
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e), false);
        canvas.addEventListener('mouseleave', () => this.handleMouseLeave(), false);
    },

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    },

    handleMouseDown(e) {
        e.preventDefault();
        UI.hideTooltip(); // Hide tooltip immediately on click
        
        const pos = this.getCanvasPosition(e);
        const planet = GameEngine.getPlanetAt(pos.x, pos.y);
        
        if (planet && planet.owner === 'player' && planet.ships > 0) {
            this.startDrag(planet, pos);
        }
    },

    handleMouseMove(e) {
        if (this.dragState.isDragging) {
            this.updateDrag(e);
        } else {
            this.handleHover(e);
        }
    },

    handleMouseUp(e) {
        if (this.dragState.isDragging) {
            this.endDrag(e);
        }
    },

    handleMouseLeave() {
        this.clearHoverEffects();
        if (this.dragState.isDragging) {
            this.cancelDrag();
        }
    },

    handleHover(e) {
        const pos = this.getCanvasPosition(e);
        const planet = GameEngine.getPlanetAt(pos.x, pos.y);
        
        // Only update if planet changed
        if (planet !== this.lastHoveredPlanet) {
            // Clear previous hover
            if (this.lastHoveredPlanet) {
                this.lastHoveredPlanet.setHovered(false);
            }
            
            this.lastHoveredPlanet = planet;
            
            if (planet) {
                planet.setHovered(true);
                // Position tooltip away from planet to avoid conflicts
                this.showPlanetTooltip(planet, e.clientX + 20, e.clientY - 10);
            } else {
                UI.hideTooltip();
            }
        }
    },

    clearHoverEffects() {
        if (this.lastHoveredPlanet) {
            this.lastHoveredPlanet.setHovered(false);
            this.lastHoveredPlanet = null;
        }
        UI.hideTooltip();
    },

    getCanvasPosition(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        return {
            x: (e.clientX - rect.left) * (CONFIG.GAME.CANVAS_WIDTH / rect.width),
            y: (e.clientY - rect.top) * (CONFIG.GAME.CANVAS_HEIGHT / rect.height)
        };
    },

    startDrag(planet, pos) {
        this.dragState.isDragging = true;
        this.dragState.startPlanet = planet;
        
        const svg = document.getElementById('gameCanvas');
        this.dragState.dragLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.dragState.dragLine.setAttribute('x1', planet.x);
        this.dragState.dragLine.setAttribute('y1', planet.y);
        this.dragState.dragLine.setAttribute('x2', planet.x);
        this.dragState.dragLine.setAttribute('y2', planet.y);
        this.dragState.dragLine.setAttribute('stroke', CONFIG.COLORS.PLAYER);
        this.dragState.dragLine.setAttribute('stroke-width', '3');
        this.dragState.dragLine.setAttribute('stroke-dasharray', '8,4');
        this.dragState.dragLine.setAttribute('opacity', '0.8');
        this.dragState.dragLine.style.pointerEvents = 'none'; // Prevent interference
        svg.appendChild(this.dragState.dragLine);
    },

    updateDrag(e) {
        if (!this.dragState.dragLine) return;
        
        const pos = this.getCanvasPosition(e);
        this.dragState.dragLine.setAttribute('x2', pos.x);
        this.dragState.dragLine.setAttribute('y2', pos.y);
    },

    endDrag(e) {
        const pos = this.getCanvasPosition(e);
        const targetPlanet = GameEngine.getPlanetAt(pos.x, pos.y);
        
        if (targetPlanet && targetPlanet !== this.dragState.startPlanet) {
            this.executeFleetCommand(this.dragState.startPlanet, targetPlanet);
        }
        
        this.cancelDrag();
    },

    cancelDrag() {
        if (this.dragState.dragLine) {
            this.dragState.dragLine.remove();
            this.dragState.dragLine = null;
        }
        
        this.dragState.isDragging = false;
        this.dragState.startPlanet = null;
    },

    handleKeyDown(e) {
        const key = e.key.toUpperCase();
        
        if (CONFIG.KEYBOARD.assignments[key] !== undefined) {
            e.preventDefault();
            this.handlePlanetKey(key);
        }
    },

    handlePlanetKey(key) {
        const planetId = CONFIG.KEYBOARD.assignments[key];
        const planet = GameEngine.getPlanetById(planetId);
        
        if (!planet) return;
        
        if (!this.keyboardState.selectedPlanet) {
            if (planet.owner === 'player' && planet.ships > 0) {
                this.keyboardState.selectedPlanet = planet;
                this.showPlanetSelection(planet);
                
                setTimeout(() => {
                    if (this.keyboardState.selectedPlanet === planet) {
                        this.clearPlanetSelection();
                    }
                }, 3000);
            }
        } else {
            if (planet !== this.keyboardState.selectedPlanet) {
                this.executeFleetCommand(this.keyboardState.selectedPlanet, planet);
            }
            this.clearPlanetSelection();
        }
    },

    showPlanetSelection(planet) {
        planet.element.setAttribute('stroke', '#ffff00');
        planet.element.setAttribute('stroke-width', '3');
        planet.element.setAttribute('stroke-dasharray', '3,3');
        
        document.getElementById('gameStatus').textContent = 
            `Planeta ${planet.assignedKey} seleccionado. Elige destino.`;
    },

    clearPlanetSelection() {
        if (this.keyboardState.selectedPlanet) {
            const planet = this.keyboardState.selectedPlanet;
            planet.element.removeAttribute('stroke-dasharray');
            if (!planet.isBeingConquered) {
                planet.element.removeAttribute('stroke');
                planet.element.removeAttribute('stroke-width');
            }
            
            this.keyboardState.selectedPlanet = null;
            document.getElementById('gameStatus').textContent = 'Arrastra para conquistar';
        }
    },

    executeFleetCommand(origin, destination) {
        if (!origin || !destination || origin === destination) return;
        if (origin.owner !== 'player') return;
        
        const shipsToSend = Math.min(
            origin.ships,
            Math.max(destination.capacity - destination.ships, 1)
        );
        
        if (shipsToSend >= 1) {
            FleetManager.createFleet(origin, destination, shipsToSend, 'player');
            this.showFleetLaunch(origin, destination, shipsToSend);
        }
    },

    showFleetLaunch(origin, destination, ships) {
        const svg = document.getElementById('gameCanvas');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', origin.x);
        line.setAttribute('y1', origin.y);
        line.setAttribute('x2', destination.x);
        line.setAttribute('y2', destination.y);
        line.setAttribute('stroke', CONFIG.COLORS.PLAYER);
        line.setAttribute('stroke-width', '4');
        line.setAttribute('opacity', '0.8');
        line.style.pointerEvents = 'none';
        svg.appendChild(line);
        
        let opacity = 0.8;
        const fadeInterval = setInterval(() => {
            opacity -= 0.1;
            line.setAttribute('opacity', opacity);
            
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                line.remove();
            }
        }, 50);
        
        document.getElementById('gameStatus').textContent = 
            `${ships} naves de ${origin.assignedKey} → ${destination.assignedKey}`;
        
        setTimeout(() => {
            document.getElementById('gameStatus').textContent = 'Arrastra para conquistar';
        }, 2000);
    },

    showPlanetTooltip(planet, x, y) {
        const info = `
            <div><strong>Planeta ${planet.assignedKey}</strong></div>
            <div>Propietario: ${planet.owner === 'player' ? 'Tuyo' : planet.owner === 'ai' ? 'IA' : 'Neutral'}</div>
            <div>Naves: ${Math.floor(planet.ships)}/${planet.capacity}</div>
            <div>Producción: ${planet.productionRate.toFixed(1)}/s</div>
        `;
        
        UI.showTooltip(info, x, y);
    }
};