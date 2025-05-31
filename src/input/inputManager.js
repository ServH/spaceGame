// Input Manager - Refactored Modular Architecture V3.0
const InputManager = {
    selectedPlanet: null,
    hoveredPlanet: null,
    mouseX: 0,
    mouseY: 0,
    isInitialized: false,
    
    init() {
        if (this.isInitialized) return;
        
        // Initialize sub-modules
        if (typeof UIFeedback !== 'undefined') UIFeedback.init();
        if (typeof MouseHandler !== 'undefined') MouseHandler.init();
        if (typeof KeyboardHandler !== 'undefined') KeyboardHandler.init();
        
        this.isInitialized = true;
        console.log('🎮 Input Manager V3.0 - Modular Architecture initialized');
    },

    // Coordinate conversion utilities
    getSVGCoordinates(e) {
        const svg = document.getElementById('gameCanvas');
        if (!svg) return { x: e.offsetX, y: e.offsetY };
        
        try {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
            return { x: svgP.x, y: svgP.y };
        } catch (error) {
            return { x: e.offsetX, y: e.offsetY };
        }
    },

    // Planet interaction utilities
    getPlanetAtPosition(x, y) {
        if (typeof GameEngine === 'undefined' || !GameEngine.planets) {
            return null;
        }
        
        let closestPlanet = null;
        let closestDistance = Infinity;
        
        for (const planet of GameEngine.planets) {
            if (!planet) continue;
            
            const distance = Math.sqrt(
                Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2)
            );
            
            if (distance <= planet.radius && distance < closestDistance) {
                closestPlanet = planet;
                closestDistance = distance;
            }
        }
        
        return closestPlanet;
    },

    // Planet selection management
    selectPlanet(planet) {
        if (!planet) return;
        
        if (this.selectedPlanet) {
            this.selectedPlanet.element.style.strokeWidth = '';
            this.selectedPlanet.element.style.stroke = '';
        }
        
        this.selectedPlanet = planet;
        
        if (planet) {
            planet.element.style.stroke = '#ffff00';
            planet.element.style.strokeWidth = '3';
            
            if (planet.owner === 'player' && typeof UIFeedback !== 'undefined') {
                UIFeedback.showFeedback(
                    `📍 Planeta ${planet.id} [${planet.assignedKey?.toUpperCase() || '?'}] seleccionado`, 
                    'info'
                );
            }
        }
    },

    deselectPlanet() {
        if (this.selectedPlanet) {
            this.selectedPlanet.element.style.strokeWidth = '';
            this.selectedPlanet.element.style.stroke = '';
            this.selectedPlanet = null;
        }
    },

    // Hover management
    updateHover(planet, pageX, pageY) {
        if (planet !== this.hoveredPlanet) {
            if (this.hoveredPlanet) {
                this.hoveredPlanet.setHovered(false);
            }
            
            this.hoveredPlanet = planet;
            
            if (planet) {
                planet.setHovered(true);
                if (typeof UIFeedback !== 'undefined') {
                    UIFeedback.showTooltip(planet, pageX, pageY);
                }
            } else {
                if (typeof UIFeedback !== 'undefined') {
                    UIFeedback.hideTooltip();
                }
            }
        }
        
        if (planet && typeof UIFeedback !== 'undefined') {
            UIFeedback.updateTooltipPosition(pageX, pageY);
        }
    },

    // Fleet sending logic
    attemptFleetSend(source, target) {
        if (source.ships <= 1) {
            if (typeof UIFeedback !== 'undefined') {
                UIFeedback.showFeedback('No hay suficientes naves para enviar', 'warning');
            }
            return;
        }
        
        const distance = Utils.distance(source, target);
        const shipsToSend = Math.floor(source.ships / 2);
        
        const energyCost = CONFIG.calculateMovementCost(shipsToSend, distance);
        const canAfford = ResourceManager.canAffordMovement(shipsToSend, distance);
        
        if (!canAfford) {
            const currentEnergy = ResourceManager.getEnergy();
            if (typeof UIFeedback !== 'undefined') {
                UIFeedback.showEnergyInsufficientFeedback(energyCost, currentEnergy, shipsToSend, distance);
            }
            return;
        }
        
        if (ResourceManager.payForMovement(shipsToSend, distance)) {
            FleetManager.createFleet(source, target, shipsToSend, 'player');
            
            const costInfo = CONFIG.getMovementCostInfo(shipsToSend, distance);
            if (typeof UIFeedback !== 'undefined') {
                UIFeedback.showFeedback(
                    `⚡ ${shipsToSend} naves enviadas | Coste: ${costInfo.total} energía`, 
                    'success'
                );
            }
        }
    },

    // Building menu integration
    showBuildingMenu(planet, x, y) {
        if (typeof BuildingUI !== 'undefined') {
            BuildingUI.showBuildingMenu(planet, x, y);
        }
    },

    // Feedback proxy methods for backward compatibility
    showFeedback(message, type) {
        if (typeof UIFeedback !== 'undefined') {
            UIFeedback.showFeedback(message, type);
        }
    },

    // Cleanup
    cleanup() {
        if (typeof UIFeedback !== 'undefined') UIFeedback.cleanup();
        if (typeof MouseHandler !== 'undefined') MouseHandler.cleanup();
        
        this.selectedPlanet = null;
        this.hoveredPlanet = null;
        this.isInitialized = false;
    }
};

// Debug utilities
window.debugInput = {
    status: () => {
        console.log('🎮 Input Status:', {
            initialized: InputManager.isInitialized,
            selectedPlanet: InputManager.selectedPlanet?.id,
            selectedKey: InputManager.selectedPlanet?.assignedKey,
            modules: {
                UIFeedback: typeof UIFeedback !== 'undefined',
                MouseHandler: typeof MouseHandler !== 'undefined',
                KeyboardHandler: typeof KeyboardHandler !== 'undefined'
            }
        });
    },
    keyboard: () => {
        console.log('⌨️ Keyboard Test - SELECT + TARGET System:');
        if (GameEngine?.planets) {
            GameEngine.planets.forEach(p => {
                if (p.assignedKey) {
                    const owner = p.owner === 'player' ? '🟢 Player' : p.owner === 'ai' ? '🔴 AI' : '⚪ Neutral';
                    console.log(`  ${p.assignedKey.toUpperCase()} → Planet ${p.id} (${owner})`);
                }
            });
        }
    },
    moduleStats: () => {
        console.log('📊 Modular Refactor Stats:');
        console.log('✅ Much better maintainability and separation of concerns');
    }
};