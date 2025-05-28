// King of Hill System - V1.3
// Special game mode where players compete to control a central planet

const KingOfHill = {
    // Hill state
    hillPlanet: null,
    currentController: null,
    controlStartTime: null,
    controlDuration: 30000, // 30 seconds to win
    progressBar: null,

    // Visual elements
    hillIndicator: null,
    progressElement: null,

    // Initialize King of Hill mode
    init() {
        this.createHillUI();
        this.setupHillPlanet();
        console.log('👑 King of Hill mode initialized');
    },

    // Setup the central hill planet
    setupHillPlanet() {
        if (!GameEngine.planets || GameEngine.planets.length === 0) return;

        // Find the most central planet
        const centerX = CONFIG.GAME.CANVAS_WIDTH / 2;
        const centerY = CONFIG.GAME.CANVAS_HEIGHT / 2;

        this.hillPlanet = GameEngine.planets.reduce((closest, planet) => {
            const dist1 = Math.sqrt((planet.x - centerX) ** 2 + (planet.y - centerY) ** 2);
            const dist2 = Math.sqrt((closest.x - centerX) ** 2 + (closest.y - centerY) ** 2);
            return dist1 < dist2 ? planet : closest;
        });

        // Mark as hill planet
        this.hillPlanet.isHill = true;
        this.addHillVisuals();
        
        console.log(`👑 Hill planet set: Planet ${this.hillPlanet.id}`);
    },

    // Add visual indicators to hill planet
    addHillVisuals() {
        if (!this.hillPlanet || !this.hillPlanet.element) return;

        // Golden ring around hill planet
        const hillRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hillRing.setAttribute('cx', this.hillPlanet.x);
        hillRing.setAttribute('cy', this.hillPlanet.y);
        hillRing.setAttribute('r', this.hillPlanet.radius + 8);
        hillRing.setAttribute('fill', 'none');
        hillRing.setAttribute('stroke', '#ffd700');
        hillRing.setAttribute('stroke-width', '3');
        hillRing.setAttribute('stroke-dasharray', '5,5');
        hillRing.classList.add('hill-ring');

        // Crown icon
        const crown = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        crown.setAttribute('x', this.hillPlanet.x);
        crown.setAttribute('y', this.hillPlanet.y - this.hillPlanet.radius - 15);
        crown.setAttribute('text-anchor', 'middle');
        crown.setAttribute('font-size', '20');
        crown.setAttribute('fill', '#ffd700');
        crown.textContent = '👑';
        crown.classList.add('hill-crown');

        // Progress circle for control
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', this.hillPlanet.x);
        progressCircle.setAttribute('cy', this.hillPlanet.y);
        progressCircle.setAttribute('r', this.hillPlanet.radius + 12);
        progressCircle.setAttribute('fill', 'none');
        progressCircle.setAttribute('stroke', '#00ff88');
        progressCircle.setAttribute('stroke-width', '4');
        progressCircle.setAttribute('stroke-dasharray', '0,1000');
        progressCircle.classList.add('hill-progress');
        progressCircle.style.display = 'none';

        // Add to canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.appendChild(hillRing);
            canvas.appendChild(crown);
            canvas.appendChild(progressCircle);
        }

        this.progressElement = progressCircle;

        // Animate ring
        this.animateHillRing(hillRing);
    },

    // Animate the hill ring
    animateHillRing(ring) {
        let offset = 0;
        setInterval(() => {
            offset += 1;
            ring.setAttribute('stroke-dashoffset', offset);
        }, 50);
    },

    // Create King of Hill UI
    createHillUI() {
        const hillUI = document.createElement('div');
        hillUI.id = 'kingOfHillUI';
        hillUI.className = 'king-of-hill-ui';
        hillUI.innerHTML = `
            <div class="hill-status">
                <div class="hill-title">👑 REY DE LA COLINA</div>
                <div class="hill-controller" id="hillController">Nadie controla la colina</div>
                <div class="hill-progress-bar">
                    <div class="hill-progress-fill" id="hillProgressFill"></div>
                </div>
                <div class="hill-time" id="hillTimeRemaining">30s para ganar</div>
            </div>
        `;

        // Add to UI overlay
        const uiOverlay = document.querySelector('.ui-overlay');
        if (uiOverlay) {
            uiOverlay.appendChild(hillUI);
        }

        // Add styles
        this.addHillStyles();
    },

    // Add King of Hill CSS styles
    addHillStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .king-of-hill-ui {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #ffd700;
                border-radius: 10px;
                padding: 15px 20px;
                color: #ffffff;
                font-family: 'Courier New', monospace;
                z-index: 100;
                min-width: 200px;
            }

            .hill-title {
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                color: #ffd700;
                margin-bottom: 8px;
            }

            .hill-controller {
                text-align: center;
                font-size: 14px;
                margin-bottom: 8px;
            }

            .hill-controller.player-control {
                color: #00ff88;
            }

            .hill-controller.ai-control {
                color: #ff4444;
            }

            .hill-progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 5px;
            }

            .hill-progress-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #ffd700, #ffaa00);
                border-radius: 4px;
                transition: width 0.1s ease;
            }

            .hill-time {
                text-align: center;
                font-size: 12px;
                opacity: 0.8;
            }

            .hill-ring {
                animation: hillRingPulse 2s infinite;
            }

            @keyframes hillRingPulse {
                0% { stroke-opacity: 0.8; }
                50% { stroke-opacity: 0.4; }
                100% { stroke-opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    },

    // Update hill control status
    update() {
        if (!this.hillPlanet || !GameModes.hasFeature('kingOfHill')) return;

        const currentOwner = this.hillPlanet.owner;

        // Check if control changed
        if (currentOwner !== this.currentController) {
            this.currentController = currentOwner;
            this.controlStartTime = Date.now();
            
            // Update UI
            this.updateHillUI();
            
            // Show/hide progress circle
            if (currentOwner !== 'neutral') {
                this.progressElement.style.display = 'block';
                this.progressElement.setAttribute('stroke', 
                    currentOwner === 'player' ? '#00ff88' : '#ff4444');
            } else {
                this.progressElement.style.display = 'none';
            }

            console.log(`👑 Hill control changed to: ${currentOwner}`);
        }

        // Update progress if someone controls the hill
        if (this.currentController !== 'neutral' && this.currentController !== null) {
            const elapsed = Date.now() - this.controlStartTime;
            const progress = Math.min(1, elapsed / this.controlDuration);
            
            // Update progress circle
            const circumference = 2 * Math.PI * (this.hillPlanet.radius + 12);
            const dashArray = `${circumference * progress},${circumference}`;
            this.progressElement.setAttribute('stroke-dasharray', dashArray);

            // Update UI progress bar
            const progressFill = document.getElementById('hillProgressFill');
            if (progressFill) {
                progressFill.style.width = `${progress * 100}%`;
            }

            // Update time remaining
            const timeRemaining = Math.ceil((this.controlDuration - elapsed) / 1000);
            const timeElement = document.getElementById('hillTimeRemaining');
            if (timeElement) {
                timeElement.textContent = `${timeRemaining}s para ganar`;
            }

            // Check for victory
            if (elapsed >= this.controlDuration) {
                this.declareWinner();
            }
        } else {
            // Reset progress when no one controls
            this.progressElement.setAttribute('stroke-dasharray', '0,1000');
            const progressFill = document.getElementById('hillProgressFill');
            if (progressFill) {
                progressFill.style.width = '0%';
            }
        }
    },

    // Update hill UI display
    updateHillUI() {
        const controllerElement = document.getElementById('hillController');
        if (!controllerElement) return;

        controllerElement.className = 'hill-controller';

        switch (this.currentController) {
            case 'player':
                controllerElement.textContent = 'JUGADOR controla la colina';
                controllerElement.classList.add('player-control');
                break;
            case 'ai':
                controllerElement.textContent = 'IA controla la colina';
                controllerElement.classList.add('ai-control');
                break;
            default:
                controllerElement.textContent = 'Nadie controla la colina';
                break;
        }
    },

    // Declare winner of King of Hill
    declareWinner() {
        const winner = this.currentController;
        console.log(`👑 King of Hill winner: ${winner}`);

        // Trigger game end
        if (GameEngine && GameEngine.endGame) {
            GameEngine.endGame(winner, 'King of Hill Victory!');
        }
    },

    // Get current hill controller
    getCurrentController() {
        return this.currentController;
    },

    // Get hill planet
    getHillPlanet() {
        return this.hillPlanet;
    },

    // Get control progress (0-1)
    getControlProgress() {
        if (!this.controlStartTime || this.currentController === 'neutral') return 0;
        
        const elapsed = Date.now() - this.controlStartTime;
        return Math.min(1, elapsed / this.controlDuration);
    },

    // Reset hill state
    reset() {
        this.currentController = null;
        this.controlStartTime = null;
        
        if (this.progressElement) {
            this.progressElement.style.display = 'none';
            this.progressElement.setAttribute('stroke-dasharray', '0,1000');
        }

        this.updateHillUI();
        console.log('👑 King of Hill reset');
    }
};

// Export for use in other modules
window.KingOfHill = KingOfHill;