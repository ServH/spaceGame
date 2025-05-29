// Smart Fleet System - V1.3 Polish
// Intelligent ship sending with percentages and dynamic feedback

const SmartFleetSystem = {
    // Smart send state
    dragPreview: null,
    previewElement: null,
    currentSourcePlanet: null,
    smartSendActive: false,
    
    // Send percentages
    sendPercentages: {
        quarter: 0.25,    // 25%
        half: 0.5,        // 50%
        all: 1.0          // 100%
    },

    // Initialize smart fleet system
    init() {
        this.createDragPreview();
        this.addKeyboardListeners();
        this.addMouseListeners();
        console.log('🧠 Smart Fleet System initialized');
    },

    // Create drag preview element
    createDragPreview() {
        this.previewElement = document.createElement('div');
        this.previewElement.id = 'dragPreview';
        this.previewElement.className = 'drag-preview';
        this.previewElement.style.display = 'none';
        document.body.appendChild(this.previewElement);

        this.addSmartFleetStyles();
    },

    // Add smart fleet CSS styles
    addSmartFleetStyles() {
        const style = document.createElement('style');
        style.id = 'smart-fleet-styles';
        style.textContent = `
            .drag-preview {
                position: fixed;
                background: rgba(0, 255, 136, 0.9);
                color: #000000;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                pointer-events: none;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);
                transform: translate(-50%, -50%);
                white-space: nowrap;
                border: 2px solid #00cc66;
            }

            .drag-preview.insufficient {
                background: rgba(255, 170, 0, 0.9);
                border-color: #cc8800;
                color: #000000;
            }

            .drag-preview.attack {
                background: rgba(255, 68, 68, 0.9);
                border-color: #cc3333;
                color: #ffffff;
            }

            .smart-send-buttons {
                position: absolute;
                display: flex;
                gap: 5px;
                pointer-events: auto;
                z-index: 900;
            }

            .smart-send-btn {
                background: rgba(0, 255, 136, 0.8);
                color: #000000;
                border: 1px solid #00cc66;
                border-radius: 15px;
                padding: 4px 8px;
                font-size: 11px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 35px;
                text-align: center;
            }

            .smart-send-btn:hover {
                background: rgba(0, 255, 136, 1);
                transform: scale(1.1);
                box-shadow: 0 2px 8px rgba(0, 255, 136, 0.4);
            }

            .smart-send-btn.quarter {
                background: rgba(100, 200, 255, 0.8);
                border-color: #66ccff;
            }

            .smart-send-btn.quarter:hover {
                background: rgba(100, 200, 255, 1);
            }

            .smart-send-btn.half {
                background: rgba(255, 170, 0, 0.8);
                border-color: #ffaa00;
            }

            .smart-send-btn.half:hover {
                background: rgba(255, 170, 0, 1);
            }

            .smart-send-btn.all {
                background: rgba(255, 68, 68, 0.8);
                border-color: #ff4444;
                color: #ffffff;
            }

            .smart-send-btn.all:hover {
                background: rgba(255, 68, 68, 1);
            }

            .planet-hover-info {
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 10px;
                border-radius: 8px;
                font-size: 12px;
                pointer-events: none;
                z-index: 950;
                border: 1px solid #444;
                white-space: nowrap;
            }

            .send-line {
                stroke: #00ff88;
                stroke-width: 3;
                stroke-opacity: 0.7;
                stroke-dasharray: 5,5;
                pointer-events: none;
                animation: dashMove 1s linear infinite;
            }

            @keyframes dashMove {
                to {
                    stroke-dashoffset: -10;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // Add keyboard listeners for smart sending
    addKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.currentSourcePlanet || this.currentSourcePlanet.owner !== 'player') return;

            // Ctrl/Cmd + Number for percentage sends
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.showSmartSendButtons(this.currentSourcePlanet);
                        break;
                    case '2':
                        e.preventDefault();
                        this.preparePercentageSend('quarter');
                        break;
                    case '3':
                        e.preventDefault();
                        this.preparePercentageSend('half');
                        break;
                    case '4':
                        e.preventDefault();
                        this.preparePercentageSend('all');
                        break;
                }
            }
        });
    },

    // Add mouse listeners for right-click send
    addMouseListeners() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent context menu
            
            const planetElement = e.target.closest('.planet');
            if (planetElement) {
                const planetId = parseInt(planetElement.getAttribute('data-planet-id'));
                const planet = GameEngine.getPlanetById(planetId);
                
                if (planet && planet.owner === 'player' && planet.ships > 0) {
                    this.prepareSmartSend(planet, 'all');
                }
            }
        });
    },

    // Show smart send buttons around planet
    showSmartSendButtons(planet) {
        this.hideSmartSendButtons();
        
        if (!planet || planet.owner !== 'player' || planet.ships <= 1) return;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'smart-send-buttons';
        buttonsContainer.id = 'smartSendButtons';
        
        // Position around planet
        buttonsContainer.style.left = `${planet.x - 60}px`;
        buttonsContainer.style.top = `${planet.y - planet.radius - 40}px`;

        // Create buttons
        const buttons = [
            { type: 'quarter', text: '25%', ships: Math.floor(planet.ships * 0.25) },
            { type: 'half', text: '50%', ships: Math.floor(planet.ships * 0.5) },
            { type: 'all', text: 'ALL', ships: planet.ships }
        ];

        buttons.forEach(btn => {
            if (btn.ships > 0) {
                const button = document.createElement('button');
                button.className = `smart-send-btn ${btn.type}`;
                button.textContent = `${btn.text} (${btn.ships})`;
                button.addEventListener('click', () => {
                    this.preparePercentageSend(btn.type);
                });
                buttonsContainer.appendChild(button);
            }
        });

        const canvas = document.getElementById('gameCanvas');
        if (canvas && canvas.parentElement) {
            canvas.parentElement.appendChild(buttonsContainer);
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                this.hideSmartSendButtons();
            }, 3000);
        }
    },

    // Hide smart send buttons
    hideSmartSendButtons() {
        const existing = document.getElementById('smartSendButtons');
        if (existing) {
            existing.remove();
        }
    },

    // Prepare percentage send
    preparePercentageSend(type) {
        if (!this.currentSourcePlanet) return;
        
        this.smartSendActive = true;
        this.currentSendType = type;
        
        // Show feedback
        if (typeof NotificationSystem !== 'undefined') {
            const percentage = Math.round(this.sendPercentages[type] * 100);
            const ships = Math.floor(this.currentSourcePlanet.ships * this.sendPercentages[type]);
            NotificationSystem.showNotification(
                `Modo envío ${percentage}% activado (${ships} naves). Haz clic en destino.`,
                'info',
                3000
            );
        }

        this.hideSmartSendButtons();
    },

    // Prepare smart send (for right-click)
    prepareSmartSend(planet, type) {
        this.currentSourcePlanet = planet;
        this.preparePercentageSend(type);
    },

    // Calculate smart send amount
    calculateSendAmount(sourcePlanet, targetPlanet, sendType = 'auto') {
        if (!sourcePlanet || sourcePlanet.ships <= 0) return 0;

        // If specific percentage requested
        if (sendType !== 'auto' && this.sendPercentages[sendType]) {
            return Math.floor(sourcePlanet.ships * this.sendPercentages[sendType]);
        }

        // Auto-calculate optimal amount
        if (!targetPlanet) return Math.floor(sourcePlanet.ships * 0.5);

        if (targetPlanet.owner === 'neutral') {
            // For neutral planets, send just enough to conquer + buffer
            return Math.min(sourcePlanet.ships, targetPlanet.ships + 2);
        } else if (targetPlanet.owner !== sourcePlanet.owner) {
            // For enemy planets, send enough to win + buffer
            const needed = targetPlanet.ships + 3;
            return Math.min(sourcePlanet.ships, needed);
        } else {
            // For friendly planets, send half available
            return Math.floor(sourcePlanet.ships * 0.5);
        }
    },

    // Update drag preview during drag
    updateDragPreview(mouseX, mouseY, sourcePlanet, targetPlanet) {
        if (!this.previewElement || !sourcePlanet) return;

        const sendAmount = this.smartSendActive && this.currentSendType ? 
            Math.floor(sourcePlanet.ships * this.sendPercentages[this.currentSendType]) :
            this.calculateSendAmount(sourcePlanet, targetPlanet);

        let previewText = `${sendAmount} naves`;
        let className = 'drag-preview';

        if (targetPlanet) {
            if (targetPlanet.owner === 'neutral') {
                previewText += ` → Conquistar (${targetPlanet.ships} def)`;
                className += ' attack';
            } else if (targetPlanet.owner !== sourcePlanet.owner) {
                const willWin = sendAmount > targetPlanet.ships;
                previewText += ` → ${willWin ? 'Victoria' : 'Derrota'} (${targetPlanet.ships} def)`;
                className += willWin ? ' attack' : ' insufficient';
            } else {
                previewText += ` → Reforzar (${targetPlanet.ships}/${targetPlanet.capacity})`;
            }
        }

        if (sendAmount > sourcePlanet.ships) {
            previewText = `Insuficientes naves (${sourcePlanet.ships} disponibles)`;
            className += ' insufficient';
        }

        this.previewElement.textContent = previewText;
        this.previewElement.className = className;
        this.previewElement.style.left = `${mouseX}px`;
        this.previewElement.style.top = `${mouseY}px`;
        this.previewElement.style.display = 'block';
    },

    // Hide drag preview
    hideDragPreview() {
        if (this.previewElement) {
            this.previewElement.style.display = 'none';
        }
    },

    // Execute smart send
    executeSmartSend(sourcePlanet, targetPlanet) {
        if (!sourcePlanet || !targetPlanet || sourcePlanet === targetPlanet) {
            this.resetSmartSend();
            return false;
        }

        const sendAmount = this.smartSendActive && this.currentSendType ? 
            Math.floor(sourcePlanet.ships * this.sendPercentages[this.currentSendType]) :
            this.calculateSendAmount(sourcePlanet, targetPlanet);

        if (sendAmount <= 0 || sendAmount > sourcePlanet.ships) {
            this.resetSmartSend();
            return false;
        }

        // Execute the send
        const success = FleetManager.createFleet(sourcePlanet, targetPlanet, sendAmount, sourcePlanet.owner);
        
        if (success && typeof NotificationSystem !== 'undefined') {
            const action = targetPlanet.owner === 'neutral' ? 'conquistar' :
                          targetPlanet.owner !== sourcePlanet.owner ? 'atacar' : 'reforzar';
            
            NotificationSystem.showNotification(
                `${sendAmount} naves enviadas para ${action} planeta ${targetPlanet.assignedKey}`,
                'success',
                2000
            );
        }

        this.resetSmartSend();
        return success;
    },

    // Reset smart send state
    resetSmartSend() {
        this.smartSendActive = false;
        this.currentSendType = null;
        this.currentSourcePlanet = null;
        this.hideDragPreview();
        this.hideSmartSendButtons();
    },

    // Set current source planet
    setSourcePlanet(planet) {
        this.currentSourcePlanet = planet;
    },

    // Get send preview info
    getSendPreviewInfo(sourcePlanet, targetPlanet) {
        if (!sourcePlanet || !targetPlanet) return null;

        const sendAmount = this.calculateSendAmount(sourcePlanet, targetPlanet);
        
        return {
            ships: sendAmount,
            action: targetPlanet.owner === 'neutral' ? 'conquer' :
                   targetPlanet.owner !== sourcePlanet.owner ? 'attack' : 'reinforce',
            willSucceed: targetPlanet.owner === sourcePlanet.owner || sendAmount > targetPlanet.ships,
            targetDefense: targetPlanet.ships
        };
    }
};

// Export for use in other modules
window.SmartFleetSystem = SmartFleetSystem;