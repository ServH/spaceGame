// Input Manager - Fixed hover conflicts and canvas positioning
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
    hoverTimeout: null,

    init() {
        this.setupMouseEvents();
        this.setupKeyboardEvents();
        console.log('🎮 Input Manager initialized');
    },

    setupMouseEvents() {
        const canvas = document.getElementById('gameCanvas');
        
        // Mouse events for drag & drop
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e), false);
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e), false);
        canvas.addEventListener('mouseleave', () => this.handleMouseLeave(), false);
        
        // Separate hover handling with debounce to prevent conflicts
        canvas.addEventListener('mouseenter', () => this.clearHoverEffects());
        canvas.addEventListener('mouseleave', () => this.clearHoverEffects());
    },

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    },

    handleMouseDown(e) {
        e.preventDefault();
        this.clearHoverEffects(); // Clear hover when starting drag
        
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
            // Only handle hover when not dragging
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
        // Clear existing timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }

        // Debounce hover to prevent conflicts
        this.hoverTimeout = setTimeout(() => {
            const pos = this.getCanvasPosition(e);
            const planet = GameEngine.getPlanetAt(pos.x, pos.y);
            
            // Clear all hover effects first
            GameEngine.planets.forEach(p => p.setHovered(false));
            
            if (planet) {
                planet.setHovered(true);
                this.showPlanetTooltip(planet, e.clientX, e.clientY);
            } else {
                this.hideTooltip();
            }
        }, 50); // 50ms debounce
    },

    clearHoverEffects() {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        GameEngine.planets.forEach(p => p.setHovered(false));
        this.hideTooltip();
    },

    getCanvasPosition(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        // Use actual window dimensions for scaling
        const scaleX = CONFIG.GAME.CANVAS_WIDTH / rect.width;
        const scaleY = CONFIG.GAME.CANVAS_HEIGHT / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },

    startDrag(planet, pos) {
        console.log(`Starting drag from planet ${planet.id}`);
        this.dragState.isDragging = true;
        this.dragState.startPlanet = planet;
        
        // Create visual drag line
        const svg = document.getElementById('gameCanvas');
        this.dragState.dragLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.dragState.dragLine.setAttribute('x1', planet.x);
        this.dragState.dragLine.setAttribute('y1', planet.y);
        this.dragState.dragLine.setAttribute('x2', planet.x);
        this.dragState.dragLine.setAttribute('y2', planet.y);
        this.dragState.dragLine.setAttribute('stroke', CONFIG.COLORS.PLAYER);
        this.dragState.dragLine.setAttribute('stroke-width', '3');
        this.dragState.dragLine.setAttribute('stroke-dasharray', '5,5');
        this.dragState.dragLine.setAttribute('opacity', '0.8');
        this.dragState.dragLine.classList.add('drag-line');
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
        
        const now = Date.now();
        
        if (!this.keyboardState.selectedPlanet) {
            if (planet.owner === 'player' && planet.ships > 0) {
                this.keyboardState.selectedPlanet = planet;
                this.keyboardState.lastKeyTime = now;
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
            `${ships} naves enviadas de ${origin.assignedKey} a ${destination.assignedKey}`;
        
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
    },

    hideTooltip() {
        UI.hideTooltip();
    }
};