// Input Manager - ENERGY AS FUEL SYSTEM V2.0
// Player uses energy for movement, same rules as AI
const InputManager = {
    selectedPlanet: null,
    hoveredPlanet: null,
    mouseX: 0,
    mouseY: 0,
    tooltip: null,
    isRightClickHeld: false,
    rightClickStartTime: 0,
    
    init() {
        this.setupEventListeners();
        this.createTooltip();
        console.log('🎮 Input Manager initialized - ENERGY AS FUEL SYSTEM');
    },

    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        
        // Mouse events
        canvas.addEventListener('click', (e) => this.handleClick(e));
        canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Prevent context menu
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    createTooltip() {
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
        if (e.button !== 0) return; // Only left click
        
        const planet = this.getPlanetAtPosition(e.offsetX, e.offsetY);
        
        if (planet) {
            this.selectPlanet(planet);
        } else {
            this.deselectPlanet();
        }
    },

    // ENERGY FUEL: Enhanced right click for movement validation
    handleRightClick(e) {
        e.preventDefault();
        
        const targetPlanet = this.getPlanetAtPosition(e.offsetX, e.offsetY);
        
        if (!targetPlanet) return;
        
        // Building menu for owned planets
        if (targetPlanet.owner === 'player') {
            this.showBuildingMenu(targetPlanet, e.offsetX, e.offsetY);
            return;
        }
        
        // Fleet sending for attacks
        if (this.selectedPlanet && this.selectedPlanet.owner === 'player' && 
            targetPlanet !== this.selectedPlanet) {
            this.attemptFleetSend(this.selectedPlanet, targetPlanet);
        }
    },

    // ENERGY FUEL: Validate energy cost before sending
    attemptFleetSend(source, target) {
        if (source.ships <= 1) {
            this.showFeedback('No hay suficientes naves para enviar', 'warning');
            return;
        }
        
        const distance = Utils.distance(source, target);
        const shipsToSend = Math.floor(source.ships / 2); // Send half by default
        
        // ENERGY FUEL: Check energy cost
        const energyCost = CONFIG.calculateMovementCost(shipsToSend, distance);
        const canAfford = ResourceManager.canAffordMovement(shipsToSend, distance);
        
        if (!canAfford) {
            const currentEnergy = ResourceManager.getEnergy();
            this.showEnergyInsufficientFeedback(energyCost, currentEnergy, shipsToSend, distance);
            return;
        }
        
        // Execute movement
        if (ResourceManager.payForMovement(shipsToSend, distance)) {
            FleetManager.createFleet(source, target, shipsToSend, 'player');
            
            // Show success feedback with energy cost
            const costInfo = CONFIG.getMovementCostInfo(shipsToSend, distance);
            this.showFeedback(
                `⚡ ${shipsToSend} naves enviadas | Coste: ${costInfo.total} energía (${costInfo.perShip}/nave)`, 
                'success'
            );
        }
    },

    // ENERGY FUEL: Enhanced feedback for energy costs
    showEnergyInsufficientFeedback(needed, available, ships, distance) {
        const shortfall = needed - available;
        this.showFeedback(
            `❌ Energía insuficiente: Necesitas ${needed}, tienes ${available} (faltan ${shortfall})`, 
            'error'
        );
        
        // Also show what they could afford
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
        // Remove existing feedback
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
        
        // Auto remove after 3 seconds
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
        }
    },

    handleMouseMove(e) {
        this.mouseX = e.offsetX;
        this.mouseY = e.offsetY;
        
        const planet = this.getPlanetAtPosition(e.offsetX, e.offsetY);
        
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

    handleMouseDown(e) {
        if (e.button === 2) { // Right mouse button
            this.isRightClickHeld = true;
            this.rightClickStartTime = Date.now();
        }
    },

    handleMouseUp(e) {
        if (e.button === 2) {
            this.isRightClickHeld = false;
        }
    },

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        if (CONFIG.KEYBOARD.assignments[key]) {
            const planetId = CONFIG.KEYBOARD.assignments[key];
            const planet = GameEngine.planets.find(p => p.id === planetId);
            
            if (planet && planet.owner === 'player') {
                this.selectPlanet(planet);
                e.preventDefault();
            }
        }
        
        // ENERGY FUEL: Debug keys
        if (e.ctrlKey) {
            switch (key) {
                case 'e':
                    ResourceManager.debugInfo();
                    e.preventDefault();
                    break;
                case 'r':
                    ResourceManager.debugAddEnergy(50);
                    this.showFeedback('Debug: +50 energía', 'info');
                    e.preventDefault();
                    break;
            }
        }
    },

    selectPlanet(planet) {
        if (this.selectedPlanet) {
            this.selectedPlanet.element.style.strokeWidth = '';
            this.selectedPlanet.element.style.stroke = '';
        }
        
        this.selectedPlanet = planet;
        
        if (planet) {
            planet.element.style.stroke = '#ffff00';
            planet.element.style.strokeWidth = '3';
            
            // ENERGY FUEL: Show planet info with energy context
            if (planet.owner === 'player') {
                const energyGen = ResourceManager.getPlanetEnergyGeneration(planet);
                this.showFeedback(
                    `📍 Planeta seleccionado | Energía: +${energyGen.toFixed(1)}/min`, 
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

    // ENERGY FUEL: Enhanced tooltip with energy costs
    showTooltip(planet, x, y) {
        let content = planet.getTooltipInfo();
        
        // Add energy cost info for potential movements
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

    getPlanetAtPosition(x, y) {
        return GameEngine.planets.find(planet => {
            const distance = Math.sqrt(
                Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2)
            );
            return distance <= planet.radius;
        });
    },

    // ENERGY FUEL: Method to check current energy situation
    getEnergyStatus() {
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

    cleanup() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
        
        // Remove any feedback messages
        const feedback = document.getElementById('game-feedback');
        if (feedback) feedback.remove();
    }
};

// CSS for animations
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