// Input Manager - Handles mouse and keyboard input
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

    init() {
        this.setupMouseEvents();
        this.setupKeyboardEvents();
    },

    setupMouseEvents() {
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        
        // Hover effects
        canvas.addEventListener('mousemove', Utils.debounce((e) => this.handleHover(e), 16));
    },

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    },

    handleMouseDown(e) {
        const pos = Utils.getMousePos(e, e.target);
        const planet = GameEngine.getPlanetAt(pos.x, pos.y);
        
        if (planet && planet.owner === 'player' && planet.ships > 0) {
            this.startDrag(planet, pos);
        }
    },

    handleMouseMove(e) {
        if (this.dragState.isDragging) {
            this.updateDrag(e);
        }
    },

    handleMouseUp(e) {
        if (this.dragState.isDragging) {
            this.endDrag(e);
        }
    },

    handleMouseLeave() {
        if (this.dragState.isDragging) {
            this.cancelDrag();
        }
    },

    handleHover(e) {
        if (this.dragState.isDragging) return;
        
        const pos = Utils.getMousePos(e, e.target);
        const hoveredPlanet = GameEngine.getPlanetAt(pos.x, pos.y);
        
        // Clear previous hovers
        GameEngine.planets.forEach(planet => planet.setHovered(false));
        
        // Set current hover
        if (hoveredPlanet && hoveredPlanet.owner === 'player') {
            hoveredPlanet.setHovered(true);
        }
    },

    startDrag(planet, pos) {
        this.dragState.isDragging = true;
        this.dragState.startPlanet = planet;
        
        // Create drag line
        const svg = document.getElementById('gameCanvas');
        this.dragState.dragLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.dragState.dragLine.setAttribute('x1', planet.x);
        this.dragState.dragLine.setAttribute('y1', planet.y);
        this.dragState.dragLine.setAttribute('x2', planet.x);
        this.dragState.dragLine.setAttribute('y2', planet.y);
        this.dragState.dragLine.setAttribute('stroke', CONFIG.COLORS.PLAYER);
        this.dragState.dragLine.setAttribute('stroke-width', '2');
        this.dragState.dragLine.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(this.dragState.dragLine);
    },

    updateDrag(e) {
        if (!this.dragState.dragLine) return;
        
        const pos = Utils.getMousePos(e, e.target);
        this.dragState.dragLine.setAttribute('x2', pos.x);
        this.dragState.dragLine.setAttribute('y2', pos.y);
    },

    endDrag(e) {
        const pos = Utils.getMousePos(e, e.target);
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
        
        // Check if it's a valid planet key
        if (CONFIG.KEYBOARD.assignments[key] !== undefined) {
            e.preventDefault();
            this.handlePlanetKey(key);
        }
    },

    handlePlanetKey(key) {
        const planetId = CONFIG.KEYBOARD.assignments[key];
        const planet = GameEngine.getPlanetById(planetId);
        
        if (!planet) return;
        
        const now = Date.now();
        
        if (!this.keyboardState.selectedPlanet) {
            // First key press - select origin planet
            if (planet.owner === 'player' && planet.ships > 0) {
                this.keyboardState.selectedPlanet = planet;
                this.keyboardState.lastKeyTime = now;
                this.showPlanetSelection(planet);
                
                // Auto-deselect after 3 seconds
                setTimeout(() => {
                    if (this.keyboardState.selectedPlanet === planet) {
                        this.clearPlanetSelection();
                    }
                }, 3000);
            }
        } else {
            // Second key press - execute command
            const timeDiff = now - this.keyboardState.lastKeyTime;
            
            if (timeDiff < 100) {
                // Too fast, ignore (prevent double-tap)
                return;
            }
            
            if (planet !== this.keyboardState.selectedPlanet) {
                this.executeFleetCommand(this.keyboardState.selectedPlanet, planet);
            }
            
            this.clearPlanetSelection();
        }
    },

    showPlanetSelection(planet) {
        // Add visual indicator for selected planet
        planet.element.setAttribute('stroke', '#ffff00');
        planet.element.setAttribute('stroke-width', '3');
        planet.element.setAttribute('stroke-dasharray', '3,3');
        
        // Update status
        document.getElementById('gameStatus').textContent = 
            `Planeta ${planet.assignedKey} seleccionado. Elige destino.`;
    },

    clearPlanetSelection() {
        if (this.keyboardState.selectedPlanet) {
            // Remove visual indicator
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
        
        // Calculate ships to send based on destination capacity
        const availableSpace = destination.capacity - destination.ships;
        const shipsToSend = Math.min(
            origin.ships, 
            Math.max(availableSpace, CONFIG.FLEET.MIN_SEND)
        );
        
        if (shipsToSend >= CONFIG.FLEET.MIN_SEND) {
            FleetManager.createFleet(origin, destination, shipsToSend, 'player');
            
            // Visual feedback
            this.showFleetLaunch(origin, destination, shipsToSend);
        }
    },

    showFleetLaunch(origin, destination, ships) {
        // Brief visual effect for fleet launch
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', origin.x);
        line.setAttribute('y1', origin.y);
        line.setAttribute('x2', destination.x);
        line.setAttribute('y2', destination.y);
        line.setAttribute('stroke', CONFIG.COLORS.PLAYER);
        line.setAttribute('stroke-width', '3');
        line.setAttribute('opacity', '0.8');
        
        document.getElementById('gameCanvas').appendChild(line);
        
        // Fade out effect
        let opacity = 0.8;
        const fadeInterval = setInterval(() => {
            opacity -= 0.1;
            line.setAttribute('opacity', opacity);
            
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                line.remove();
            }
        }, 50);
        
        // Update status
        document.getElementById('gameStatus').textContent = 
            `${ships} naves enviadas de ${origin.assignedKey} a ${destination.assignedKey}`;
        
        setTimeout(() => {
            document.getElementById('gameStatus').textContent = 'Arrastra para conquistar';
        }, 2000);
    }
};
