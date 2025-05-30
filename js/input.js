// Input Manager - ENHANCED with full UI integration and resource feedback
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
        console.log('🎮 Input Manager initialized with Evolution features');
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
        if (UI && UI.hideTooltip) UI.hideTooltip();
        
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
        
        if (planet !== this.lastHoveredPlanet) {
            if (this.lastHoveredPlanet) {
                this.lastHoveredPlanet.setHovered(false);
            }
            
            this.lastHoveredPlanet = planet;
            
            if (planet) {
                planet.setHovered(true);
                this.showPlanetTooltip(planet, e.clientX + 20, e.clientY - 10);
            } else {
                if (UI && UI.hideTooltip) UI.hideTooltip();
            }
        }
    },

    clearHoverEffects() {
        if (this.lastHoveredPlanet) {
            this.lastHoveredPlanet.setHovered(false);
            this.lastHoveredPlanet = null;
        }
        if (UI && UI.hideTooltip) UI.hideTooltip();
    },

    getCanvasPosition(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        return {
            x: (e.clientX - rect.left) * (800 / rect.width),
            y: (e.clientY - rect.top) * (600 / rect.height)
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
        this.dragState.dragLine.setAttribute('stroke', '#00ff88');
        this.dragState.dragLine.setAttribute('stroke-width', '3');
        this.dragState.dragLine.setAttribute('stroke-dasharray', '8,4');
        this.dragState.dragLine.setAttribute('opacity', '0.8');
        this.dragState.dragLine.style.pointerEvents = 'none';
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
        const key = e.key.toLowerCase();
        
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
        
        const statusEl = document.getElementById('gameStatus');
        if (statusEl) {
            statusEl.textContent = `Planeta ${planet.assignedKey} seleccionado. Elige destino.`;
        }
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
            const statusEl = document.getElementById('gameStatus');
            if (statusEl) {
                statusEl.textContent = 'Evolution Action 01! Drag & Drop para enviar naves';
            }
        }
    },

    executeFleetCommand(origin, destination) {
        if (!origin || !destination || origin === destination) return;
        if (origin.owner !== 'player') return;
        
        const shipsToSend = Math.floor(origin.ships * 0.5);
        
        if (shipsToSend >= 1) {
            // Check if fleet can be created (including resource costs)
            const canCreate = FleetManager.canCreateFleet(origin, destination, shipsToSend, 'player');
            
            if (!canCreate.canCreate) {
                // Show appropriate error message
                if (canCreate.reason === 'insufficient_resources') {
                    if (UI && UI.showResourceInsufficient) {
                        UI.showResourceInsufficient('Metal', canCreate.need, canCreate.have);
                    }
                } else if (canCreate.reason === 'insufficient_ships') {
                    if (UI && UI.showNotification) {
                        UI.showNotification(
                            `No hay suficientes naves en planeta ${origin.assignedKey}`,
                            'warning',
                            3000
                        );
                    }
                }
                return;
            }
            
            // Create the fleet
            const fleet = FleetManager.createFleet(origin, destination, shipsToSend, 'player');
            if (fleet) {
                this.showFleetLaunch(origin, destination, shipsToSend);
                
                // Show fleet launched notification
                if (UI && UI.showFleetLaunched) {
                    UI.showFleetLaunched(
                        origin.assignedKey || `P${origin.id}`,
                        destination.assignedKey || `P${destination.id}`,
                        shipsToSend
                    );
                }
            }
        }
    },

    showFleetLaunch(origin, destination, ships) {
        const svg = document.getElementById('gameCanvas');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', origin.x);
        line.setAttribute('y1', origin.y);
        line.setAttribute('x2', destination.x);
        line.setAttribute('y2', destination.y);
        line.setAttribute('stroke', '#00ff88');
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
        
        const statusEl = document.getElementById('gameStatus');
        if (statusEl) {
            statusEl.textContent = `${ships} naves de ${origin.assignedKey} → ${destination.assignedKey}`;
            
            setTimeout(() => {
                statusEl.textContent = 'Evolution Action 01! Drag & Drop para enviar naves';
            }, 2000);
        }
    },

    showPlanetTooltip(planet, x, y) {
        // Enhanced tooltip with resource information
        let info = '';
        
        if (planet.getTooltipInfo) {
            info = planet.getTooltipInfo();
        } else {
            const ownerName = planet.owner === 'player' ? 'Jugador' : 
                             planet.owner === 'ai' ? 'IA' : 'Neutral';
            info = `<strong>${ownerName}</strong><br>Naves: ${Math.floor(planet.ships)}/${planet.capacity}`;
        }
        
        // Add resource cost information for player planets
        if (planet.owner === 'player' && typeof ResourceManager !== 'undefined') {
            const shipsToSend = Math.floor(planet.ships * 0.5);
            if (shipsToSend > 0) {
                const cost = FleetManager.getShipCost(shipsToSend);
                const canAfford = ResourceManager.canAffordShip(shipsToSend);
                const costColor = canAfford ? '#00cc88' : '#cc4400';
                info += `<br><span style="color: ${costColor}">Costo envío: ${cost} metal</span>`;
            }
        }
        
        if (UI && UI.showTooltip) {
            UI.showTooltip(info, x, y);
        }
    }
};