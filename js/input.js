// Input Manager - FIXED with SVG native coordinate system for perfect alignment
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
    initialized: false,

    init() {
        if (this.initialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEvents());
        } else {
            this.setupEvents();
        }
    },

    setupEvents() {
        this.setupMouseEvents();
        this.setupKeyboardEvents();
        this.initialized = true;
        console.log('🎮 Input Manager initialized with PERFECT SVG coordinate system');
    },

    setupMouseEvents() {
        const canvas = document.getElementById('gameCanvas');
        
        if (!canvas) {
            console.error('❌ Canvas not found for InputManager');
            return;
        }
        
        console.log('🖱️ Setting up mouse events with native SVG coordinates');
        
        canvas.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        }, false);
        
        canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        }, false);
        
        canvas.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        }, false);
        
        canvas.addEventListener('mouseleave', () => {
            this.handleMouseLeave();
        }, false);
        
        console.log('✅ Mouse events setup complete with SVG coordinate fix');
    },

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        console.log('⌨️ Keyboard events setup complete');
    },

    handleMouseDown(e) {
        e.preventDefault();
        if (UI && UI.hideTooltip) UI.hideTooltip();
        
        const pos = this.getSVGCoordinates(e);
        console.log('🖱️ Mouse down at SVG coords:', pos);
        
        const planet = this.getPlanetAt(pos.x, pos.y);
        console.log('🪐 Planet found:', planet ? `ID: ${planet.id}, Owner: ${planet.owner}, Ships: ${planet.ships}` : 'None');
        
        if (planet && planet.owner === 'player' && planet.ships > 0) {
            console.log('🚀 Starting drag from planet', planet.id);
            this.startDrag(planet);
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
            console.log('🖱️ Mouse up - ending drag');
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
        const pos = this.getSVGCoordinates(e);
        const planet = this.getPlanetAt(pos.x, pos.y);
        
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

    // CRITICAL FIX: Use SVG's native coordinate transformation
    getSVGCoordinates(e) {
        const svg = document.getElementById('gameCanvas');
        
        // Create SVG point for proper coordinate transformation
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        
        // Transform using SVG's own coordinate system
        const transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
        
        // Log for debugging alignment
        if (this.dragState.isDragging) {
            console.log('🎯 SVG Coordinates:', {
                screen: { x: e.clientX, y: e.clientY },
                svg: { x: transformed.x.toFixed(1), y: transformed.y.toFixed(1) }
            });
        }
        
        return {
            x: transformed.x,
            y: transformed.y
        };
    },

    // Enhanced planet detection with better tolerance
    getPlanetAt(x, y) {
        if (!GameEngine || !GameEngine.planets) {
            return null;
        }
        
        let closestPlanet = null;
        let closestDistance = Infinity;
        
        for (let planet of GameEngine.planets) {
            const dx = planet.x - x;
            const dy = planet.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Use generous tolerance for easier interaction
            const tolerance = Math.max(planet.radius + 15, 30);
            
            if (distance <= tolerance && distance < closestDistance) {
                closestDistance = distance;
                closestPlanet = planet;
            }
        }
        
        if (closestPlanet) {
            console.log(`✅ Found planet ${closestPlanet.id} at distance ${closestDistance.toFixed(1)}px`);
        }
        
        return closestPlanet;
    },

    startDrag(planet) {
        console.log('🚀 Starting drag from planet', planet.id, 'at', planet.x, planet.y);
        this.dragState.isDragging = true;
        this.dragState.startPlanet = planet;
        
        const svg = document.getElementById('gameCanvas');
        this.dragState.dragLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.dragState.dragLine.setAttribute('x1', planet.x);
        this.dragState.dragLine.setAttribute('y1', planet.y);
        this.dragState.dragLine.setAttribute('x2', planet.x);
        this.dragState.dragLine.setAttribute('y2', planet.y);
        this.dragState.dragLine.setAttribute('stroke', '#00ff88');
        this.dragState.dragLine.setAttribute('stroke-width', '4');
        this.dragState.dragLine.setAttribute('stroke-dasharray', '12,6');
        this.dragState.dragLine.setAttribute('opacity', '0.9');
        this.dragState.dragLine.style.pointerEvents = 'none';
        
        // Add animation class for moving dashes
        this.dragState.dragLine.setAttribute('class', 'drag-line');
        
        svg.appendChild(this.dragState.dragLine);
        
        console.log('✅ Drag line created with enhanced visuals');
    },

    updateDrag(e) {
        if (!this.dragState.dragLine) return;
        
        const pos = this.getSVGCoordinates(e);
        this.dragState.dragLine.setAttribute('x2', pos.x);
        this.dragState.dragLine.setAttribute('y2', pos.y);
    },

    endDrag(e) {
        const pos = this.getSVGCoordinates(e);
        const targetPlanet = this.getPlanetAt(pos.x, pos.y);
        
        console.log('🎯 Drag ended at coords:', pos, 'target planet:', targetPlanet ? targetPlanet.id : 'None');
        
        if (targetPlanet && targetPlanet !== this.dragState.startPlanet) {
            console.log('🚀 Executing fleet command:', this.dragState.startPlanet.id, '→', targetPlanet.id);
            this.executeFleetCommand(this.dragState.startPlanet, targetPlanet);
        } else {
            console.log('❌ Invalid drop target');
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
        console.log('🚫 Drag cancelled');
    },

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        if (CONFIG.KEYBOARD && CONFIG.KEYBOARD.assignments && CONFIG.KEYBOARD.assignments[key] !== undefined) {
            e.preventDefault();
            this.handlePlanetKey(key);
        }
    },

    handlePlanetKey(key) {
        const planetId = CONFIG.KEYBOARD.assignments[key];
        const planet = this.getPlanetById(planetId);
        
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

    getPlanetById(id) {
        if (!GameEngine || !GameEngine.planets) return null;
        return GameEngine.planets.find(p => p.id === id);
    },

    showPlanetSelection(planet) {
        planet.element.setAttribute('stroke', '#ffff00');
        planet.element.setAttribute('stroke-width', '4');
        planet.element.setAttribute('stroke-dasharray', '6,6');
        
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
        
        console.log(`🚀 Executing fleet command: ${shipsToSend} ships from ${origin.id} to ${destination.id}`);
        
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
        line.setAttribute('stroke-width', '6');
        line.setAttribute('opacity', '0.9');
        line.style.pointerEvents = 'none';
        svg.appendChild(line);
        
        let opacity = 0.9;
        const fadeInterval = setInterval(() => {
            opacity -= 0.1;
            line.setAttribute('opacity', opacity);
            
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                line.remove();
            }
        }, 80);
        
        const statusEl = document.getElementById('gameStatus');
        if (statusEl) {
            statusEl.textContent = `✅ ${ships} naves enviadas: ${origin.assignedKey} → ${destination.assignedKey}`;
            
            setTimeout(() => {
                statusEl.textContent = 'Evolution Action 01! Drag & Drop para enviar naves';
            }, 3000);
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
            
            if (planet.assignedKey) {
                info = `<strong>${ownerName} [${planet.assignedKey.toUpperCase()}]</strong><br>Naves: ${Math.floor(planet.ships)}/${planet.capacity}`;
            }
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