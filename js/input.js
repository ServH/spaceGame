// Input Manager - FIXED COORDINATES & KEYBOARD - V2.2
const InputManager = {
    selectedPlanet: null,
    hoveredPlanet: null,
    mouseX: 0,
    mouseY: 0,
    tooltip: null,
    isRightClickHeld: false,
    rightClickStartTime: 0,
    isInitialized: false,
    isDragging: false,
    dragStartPlanet: null,
    
    init() {
        this.setupEventListeners();
        this.createTooltip();
        this.isInitialized = true;
        console.log('🎮 Input Manager V2.2 initialized - FIXED COORDINATES & KEYBOARD');
    },

    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('❌ Canvas not found - retrying in 100ms');
            setTimeout(() => this.setupEventListeners(), 100);
            return;
        }
        
        // Mouse events with proper SVG coordinate conversion
        canvas.addEventListener('click', (e) => this.handleClick(e));
        canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Keyboard events with proper game focus
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Prevent context menu
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        console.log('🎮 Event listeners attached with SVG coordinate support');
    },

    // FIXED: Proper SVG coordinate conversion
    getSVGCoordinates(e) {
        const svg = document.getElementById('gameCanvas');
        if (!svg) return { x: e.offsetX, y: e.offsetY };
        
        try {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
            
            // Debug occasionally
            if (Math.random() < 0.01) {
                console.log('🎯 Coordinates:', {
                    client: { x: e.clientX, y: e.clientY },
                    svg: { x: svgP.x.toFixed(1), y: svgP.y.toFixed(1) }
                });
            }
            
            return { x: svgP.x, y: svgP.y };
        } catch (error) {
            console.warn('SVG coordinate conversion failed, using offset:', error);
            return { x: e.offsetX, y: e.offsetY };
        }
    },

    createTooltip() {
        if (this.tooltip) return;
        
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'game-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            max-width: 300px;
            border: 1px solid #444;
            display: none;
        `;
        document.body.appendChild(this.tooltip);
    },

    handleClick(e) {
        if (!this.isInitialized || e.button !== 0) return;
        
        const coords = this.getSVGCoordinates(e);
        const planet = this.getPlanetAtPosition(coords.x, coords.y);
        
        if (planet) {
            this.selectPlanet(planet);
            console.log(`🎯 Planet ${planet.id} selected at SVG(${coords.x.toFixed(1)}, ${coords.y.toFixed(1)})`);
        } else {
            this.deselectPlanet();
        }
    },

    handleRightClick(e) {
        if (!this.isInitialized) return;
        e.preventDefault();
        
        const coords = this.getSVGCoordinates(e);
        const targetPlanet = this.getPlanetAtPosition(coords.x, coords.y);
        
        if (!targetPlanet) {
            console.log('🎯 No planet at SVG coordinates:', coords);
            return;
        }
        
        console.log(`🎯 Right click on planet ${targetPlanet.id} (${targetPlanet.owner})`);
        
        // Building menu for owned planets
        if (targetPlanet.owner === 'player') {
            this.showBuildingMenu(targetPlanet, coords.x, coords.y);
            return;
        }
        
        // Fleet sending for attacks
        if (this.selectedPlanet && this.selectedPlanet.owner === 'player' && 
            targetPlanet !== this.selectedPlanet) {
            this.attemptFleetSend(this.selectedPlanet, targetPlanet);
        }
    },

    // FIXED: Drag and drop system
    handleMouseDown(e) {
        if (e.button === 0) { // Left button - start potential drag
            const coords = this.getSVGCoordinates(e);
            const planet = this.getPlanetAtPosition(coords.x, coords.y);
            
            if (planet && planet.owner === 'player') {
                this.dragStartPlanet = planet;
                this.isDragging = false; // Will become true on mousemove
            }
        } else if (e.button === 2) { // Right button
            this.isRightClickHeld = true;
            this.rightClickStartTime = Date.now();
        }
    },

    handleMouseUp(e) {
        if (e.button === 0 && this.dragStartPlanet) {
            if (this.isDragging) {
                // Complete drag operation
                const coords = this.getSVGCoordinates(e);
                const targetPlanet = this.getPlanetAtPosition(coords.x, coords.y);
                
                if (targetPlanet && targetPlanet !== this.dragStartPlanet) {
                    if (targetPlanet.owner !== 'player') {
                        // Attack drag
                        this.attemptFleetSend(this.dragStartPlanet, targetPlanet);
                        console.log(`🎯 Drag attack: ${this.dragStartPlanet.id} → ${targetPlanet.id}`);
                    } else {
                        // Reinforce drag
                        this.attemptFleetSend(this.dragStartPlanet, targetPlanet);
                        console.log(`🎯 Drag reinforce: ${this.dragStartPlanet.id} → ${targetPlanet.id}`);
                    }
                }
                this.isDragging = false;
            }
            this.dragStartPlanet = null;
        } else if (e.button === 2) {
            this.isRightClickHeld = false;
        }
    },

    attemptFleetSend(source, target) {
        if (source.ships <= 1) {
            this.showFeedback('No hay suficientes naves para enviar', 'warning');
            return;
        }
        
        const distance = Utils.distance(source, target);
        const shipsToSend = Math.floor(source.ships / 2);
        
        const energyCost = CONFIG.calculateMovementCost(shipsToSend, distance);
        const canAfford = ResourceManager.canAffordMovement(shipsToSend, distance);
        
        console.log(`🚀 Fleet send attempt: ${shipsToSend} ships, distance: ${distance.toFixed(0)}, cost: ${energyCost}`);
        
        if (!canAfford) {
            const currentEnergy = ResourceManager.getEnergy();
            this.showEnergyInsufficientFeedback(energyCost, currentEnergy, shipsToSend, distance);
            return;
        }
        
        if (ResourceManager.payForMovement(shipsToSend, distance)) {
            FleetManager.createFleet(source, target, shipsToSend, 'player');
            
            const costInfo = CONFIG.getMovementCostInfo(shipsToSend, distance);
            this.showFeedback(
                `⚡ ${shipsToSend} naves enviadas | Coste: ${costInfo.total} energía`, 
                'success'
            );
            
            console.log(`✅ Fleet sent: ${shipsToSend} ships for ${costInfo.total} energy`);
        }
    },

    showEnergyInsufficientFeedback(needed, available, ships, distance) {
        const shortfall = needed - available;
        this.showFeedback(
            `❌ Energía insuficiente: Necesitas ${needed}, tienes ${available} (faltan ${shortfall})`, 
            'error'
        );
        
        // Show what they could afford
        let maxAffordableShips = 0;
        for (let testShips = 1; testShips <= ships; testShips++) {
            const testCost = CONFIG.calculateMovementCost(testShips, distance);
            if (testCost <= available) {
                maxAffordableShips = testShips;
            } else {
                break;
            }
        }
        
        if (maxAffordableShips > 0) {
            setTimeout(() => {
                this.showFeedback(
                    `💡 Puedes enviar máximo ${maxAffordableShips} naves con tu energía actual`, 
                    'info'
                );
            }, 2000);
        } else {
            setTimeout(() => {
                this.showFeedback(
                    `🔬 Construye un Laboratorio de Energía para generar más combustible`, 
                    'info'
                );
            }, 2000);
        }
    },

    showFeedback(message, type = 'info') {
        const existing = document.getElementById('game-feedback');
        if (existing) existing.remove();
        
        const feedback = document.createElement('div');
        feedback.id = 'game-feedback';
        
        const colors = {
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4444',
            info: '#4a90e2'
        };
        
        feedback.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: ${colors[type] || colors.info};
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            z-index: 2000;
            border: 2px solid ${colors[type] || colors.info};
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            animation: slideDown 0.3s ease-out;
        `;
        
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.animation = 'slideUp 0.3s ease-in';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 3000);
    },

    showBuildingMenu(planet, x, y) {
        if (typeof BuildingUI !== 'undefined') {
            BuildingUI.showBuildingMenu(planet, x, y);
            console.log(`🏗️ Building menu for planet ${planet.id}`);
        }
    },

    handleMouseMove(e) {
        if (!this.isInitialized) return;
        
        const coords = this.getSVGCoordinates(e);
        this.mouseX = coords.x;
        this.mouseY = coords.y;
        
        // Handle drag detection
        if (this.dragStartPlanet && !this.isDragging) {
            const dragDistance = Math.sqrt(
                Math.pow(coords.x - this.dragStartPlanet.x, 2) + 
                Math.pow(coords.y - this.dragStartPlanet.y, 2)
            );
            if (dragDistance > 10) { // Start drag after 10px movement
                this.isDragging = true;
                console.log(`🎯 Started dragging from planet ${this.dragStartPlanet.id}`);
            }
        }
        
        const planet = this.getPlanetAtPosition(coords.x, coords.y);
        
        if (planet !== this.hoveredPlanet) {
            if (this.hoveredPlanet) {
                this.hoveredPlanet.setHovered(false);
            }
            
            this.hoveredPlanet = planet;
            
            if (planet) {
                planet.setHovered(true);
                this.showTooltip(planet, e.pageX, e.pageY);
            } else {
                this.hideTooltip();
            }
        }
        
        if (planet) {
            this.updateTooltipPosition(e.pageX, e.pageY);
        }
    },

    // FIXED: Keyboard system with proper focus and assignments
    handleKeyDown(e) {
        if (!this.isInitialized) return;
        
        // Only process game keys when not in input fields
        if (e.target.tagName.toLowerCase() === 'input' || 
            e.target.tagName.toLowerCase() === 'textarea') {
            return;
        }
        
        const key = e.key.toLowerCase();
        
        // Check keyboard assignments
        if (CONFIG && CONFIG.KEYBOARD && CONFIG.KEYBOARD.assignments && CONFIG.KEYBOARD.assignments[key]) {
            const planetId = CONFIG.KEYBOARD.assignments[key];
            
            if (typeof GameEngine !== 'undefined' && GameEngine.planets) {
                const planet = GameEngine.planets.find(p => p && p.id === planetId);
                
                if (planet && planet.owner === 'player') {
                    this.selectPlanet(planet);
                    console.log(`⌨️ Keyboard select: Planet ${planet.id} via key '${key.toUpperCase()}'`);
                    e.preventDefault();
                }
            }
        }
        
        // Debug keys
        if (e.ctrlKey) {
            switch (key) {
                case 'e':
                    if (typeof ResourceManager !== 'undefined') {
                        ResourceManager.debugInfo();
                        e.preventDefault();
                    }
                    break;
                case 'r':
                    if (typeof ResourceManager !== 'undefined') {
                        ResourceManager.debugAddEnergy(50);
                        this.showFeedback('Debug: +50 energía', 'info');
                        e.preventDefault();
                    }
                    break;
                case 'i':
                    console.log('🎮 Input Debug:', {
                        initialized: this.isInitialized,
                        selectedPlanet: this.selectedPlanet?.id,
                        hoveredPlanet: this.hoveredPlanet?.id,
                        mousePos: {x: this.mouseX.toFixed(1), y: this.mouseY.toFixed(1)},
                        keyboardAssignments: CONFIG?.KEYBOARD?.assignments,
                        planetsCount: GameEngine?.planets?.length || 0
                    });
                    e.preventDefault();
                    break;
                case 'k':
                    // Show keyboard assignments
                    console.log('⌨️ Keyboard Assignments:', CONFIG?.KEYBOARD?.assignments);
                    GameEngine?.planets?.forEach(p => {
                        if (p.assignedKey) {
                            console.log(`  ${p.assignedKey.toUpperCase()} → Planet ${p.id} (${p.owner})`);
                        }
                    });
                    e.preventDefault();
                    break;
            }
        }
    },

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
            
            if (planet.owner === 'player' && typeof ResourceManager !== 'undefined') {
                const energyGen = ResourceManager.getPlanetEnergyGeneration(planet);
                this.showFeedback(
                    `📍 Planeta ${planet.id} [${planet.assignedKey?.toUpperCase() || '?'}] | Energía: +${energyGen.toFixed(1)}/min`, 
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

    showTooltip(planet, x, y) {
        if (!planet || !this.tooltip) return;
        
        let content = planet.getTooltipInfo();
        
        // Add energy cost info
        if (this.selectedPlanet && this.selectedPlanet.owner === 'player' && 
            planet !== this.selectedPlanet) {
            
            const distance = Utils.distance(this.selectedPlanet, planet);
            const ships = Math.floor(this.selectedPlanet.ships / 2);
            
            if (ships > 0) {
                const costInfo = CONFIG.getMovementCostInfo(ships, distance);
                const canAfford = ResourceManager.canAffordMovement(ships, distance);
                
                content += `<br><hr style="border: 1px solid #444; margin: 8px 0;">`;
                content += `<strong>Coste de movimiento:</strong><br>`;
                content += `⚡ ${costInfo.total} energía para ${ships} naves<br>`;
                content += `📏 Distancia: ${distance.toFixed(0)}px<br>`;
                content += `💰 ${costInfo.perShip} energía/nave`;
                
                if (!canAfford) {
                    content += `<br><span style="color: #ff4444">❌ Energía insuficiente</span>`;
                } else {
                    content += `<br><span style="color: #00ff88">✅ Movimiento posible</span>`;
                }
            }
        }
        
        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
        this.updateTooltipPosition(x, y);
    },

    updateTooltipPosition(x, y) {
        if (!this.tooltip || this.tooltip.style.display === 'none') return;
        
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = x + 15;
        let top = y - tooltipRect.height - 10;
        
        if (left + tooltipRect.width > windowWidth) {
            left = x - tooltipRect.width - 15;
        }
        
        if (top < 0) {
            top = y + 15;
        }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    },

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    },

    // FIXED: Better planet detection with proper coordinates
    getPlanetAtPosition(x, y) {
        if (typeof GameEngine === 'undefined' || !GameEngine.planets) {
            console.warn('🎯 GameEngine or planets not available');
            return null;
        }
        
        let closestPlanet = null;
        let closestDistance = Infinity;
        
        for (const planet of GameEngine.planets) {
            if (!planet) continue;
            
            const distance = Math.sqrt(
                Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2)
            );
            
            // Precise hit detection with no extra tolerance
            const hitRadius = planet.radius;
            
            if (distance <= hitRadius && distance < closestDistance) {
                closestPlanet = planet;
                closestDistance = distance;
            }
        }
        
        return closestPlanet;
    },

    getEnergyStatus() {
        if (typeof ResourceManager === 'undefined') {
            return { current: 0, generation: 0, level: 'unknown' };
        }
        
        const energy = ResourceManager.getEnergy();
        const generation = ResourceManager.getTotalEnergyGeneration();
        
        return {
            current: energy,
            generation: generation,
            level: energy < 20 ? 'critical' : 
                   energy < 50 ? 'low' : 
                   energy < 100 ? 'medium' : 'high'
        };
    },

    reinitialize() {
        console.log('🔄 Reinitializing Input Manager...');
        this.cleanup();
        this.isInitialized = false;
        setTimeout(() => this.init(), 100);
    },

    cleanup() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
            this.tooltip = null;
        }
        
        const feedback = document.getElementById('game-feedback');
        if (feedback) feedback.remove();
        
        this.selectedPlanet = null;
        this.hoveredPlanet = null;
        this.dragStartPlanet = null;
        this.isDragging = false;
        this.isInitialized = false;
    }
};

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Enhanced debug commands
window.debugInput = {
    status: () => {
        console.log('🎮 Input Manager Status:', {
            initialized: InputManager.isInitialized,
            selectedPlanet: InputManager.selectedPlanet?.id,
            hoveredPlanet: InputManager.hoveredPlanet?.id,
            mousePos: {x: InputManager.mouseX.toFixed(1), y: InputManager.mouseY.toFixed(1)},
            dragging: InputManager.isDragging,
            dragStart: InputManager.dragStartPlanet?.id
        });
    },
    reinit: () => InputManager.reinitialize(),
    testClick: (x, y) => {
        const planet = InputManager.getPlanetAtPosition(x, y);
        console.log(`🎯 Test click at SVG(${x}, ${y}):`, planet ? `Planet ${planet.id}` : 'No planet');
        return planet;
    },
    keyboard: () => {
        console.log('⌨️ Keyboard Assignments:');
        GameEngine?.planets?.forEach(p => {
            if (p.assignedKey && p.owner === 'player') {
                console.log(`  ${p.assignedKey.toUpperCase()} → Planet ${p.id} at (${p.x.toFixed(0)}, ${p.y.toFixed(0)})`);
            }
        });
    }
};
