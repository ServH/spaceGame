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

        // Add to SVG
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.appendChild(hillRing);
            canvas.appendChild(crown);
        }

        // Add CSS animation
        this.addHillStyles();
    },

    // Add hill-specific CSS styles
    addHillStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .hill-ring {
                animation: hillPulse 2s infinite ease-in-out;
            }

            @keyframes hillPulse {
                0%, 100% { 
                    stroke-opacity: 1; 
                    transform: scale(1);
                }
                50% { 
                    stroke-opacity: 0.5; 
                    transform: scale(1.1);
                }
            }

            .hill-crown {
                animation: crownBob 3s infinite ease-in-out;
            }

            @keyframes crownBob {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }

            .hill-progress {
                position: absolute;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #ffd700;
                border-radius: 8px;
                padding: 10px 15px;
                color: #ffffff;
                font-size: 14px;
                z-index: 100;
                min-width: 200px;
                text-align: center;
            }

            .hill-progress.hidden {
                display: none;
            }

            .hill-control-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                overflow: hidden;
                margin-top: 8px;
            }

            .hill-control-fill {
                height: 100%;
                border-radius: 4px;
                transition: width 0.1s ease;
            }

            .hill-control-fill.player {
                background: linear-gradient(90deg, #00ff88, #00cc66);
            }

            .hill-control-fill.ai {
                background: linear-gradient(90deg, #ff4444, #cc3333);
            }
        `;
        document.head.appendChild(style);
    },

    // Create hill UI elements
    createHillUI() {
        const hillUI = document.createElement('div');
        hillUI.id = 'hillProgress';
        hillUI.className = 'hill-progress hidden';
        hillUI.innerHTML = `
            <div id="hillControllerText">Colina neutral</div>
            <div class="hill-control-bar">
                <div class="hill-control-fill" id="hillControlFill"></div>
            </div>
        `;

        // Add to UI overlay
        const uiOverlay = document.querySelector('.ui-overlay');
        if (uiOverlay) {
            uiOverlay.appendChild(hillUI);
        }

        this.progressElement = hillUI;
    },

    // Update hill control status
    update() {
        if (!this.hillPlanet) return;

        const previousController = this.currentController;
        this.currentController = this.hillPlanet.owner;

        // Check for controller change
        if (previousController !== this.currentController) {
            this.onControllerChange();
        }

        // Update progress if someone controls the hill
        if (this.currentController && this.currentController !== 'neutral') {
            this.updateProgress();
        }

        // Check for victory
        this.checkVictory();
    },

    // Handle controller change
    onControllerChange() {
        if (this.currentController === 'neutral') {
            // Hill is neutral
            this.controlStartTime = null;
            this.hideProgress();
            console.log('👑 Hill is now neutral');
        } else {
            // Someone took control
            this.controlStartTime = Date.now();
            this.showProgress();
            console.log(`👑 ${this.currentController} took control of the hill`);
        }
    },

    // Show progress UI
    showProgress() {
        if (this.progressElement) {
            this.progressElement.classList.remove('hidden');
        }
    },

    // Hide progress UI
    hideProgress() {
        if (this.progressElement) {
            this.progressElement.classList.add('hidden');
        }
    },

    // Update progress display
    updateProgress() {
        if (!this.controlStartTime || !this.progressElement) return;

        const elapsed = Date.now() - this.controlStartTime;
        const progress = Math.min(elapsed / this.controlDuration, 1) * 100;

        // Update text
        const remaining = Math.ceil((this.controlDuration - elapsed) / 1000);
        const controllerText = document.getElementById('hillControllerText');
        if (controllerText) {
            const controllerName = this.currentController === 'player' ? 'Jugador' : 'IA';
            controllerText.textContent = `${controllerName} controla la colina - ${remaining}s`;
        }

        // Update progress bar
        const progressBar = document.getElementById('hillControlFill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.className = `hill-control-fill ${this.currentController}`;
        }
    },

    // Check for victory condition
    checkVictory() {
        if (!this.controlStartTime || !this.currentController || this.currentController === 'neutral') {
            return false;
        }

        const elapsed = Date.now() - this.controlStartTime;
        if (elapsed >= this.controlDuration) {
            // Victory!
            console.log(`👑 ${this.currentController} wins by King of Hill!`);
            
            // Trigger victory
            if (GameEngine && GameEngine.endGame) {
                GameEngine.endGame(this.currentController);
            }
            
            return true;
        }

        return false;
    },

    // Get current controller
    getCurrentController() {
        return this.currentController;
    },

    // Get control progress (0-1)
    getControlProgress() {
        if (!this.controlStartTime) return 0;
        
        const elapsed = Date.now() - this.controlStartTime;
        return Math.min(elapsed / this.controlDuration, 1);
    },

    // Reset hill state
    reset() {
        this.currentController = null;
        this.controlStartTime = null;
        this.hideProgress();
        
        // Reset hill planet if it exists
        if (this.hillPlanet) {
            this.hillPlanet.isHill = true;
        }
        
        console.log('👑 King of Hill reset');
    },

    // Cleanup
    destroy() {
        this.reset();
        
        // Remove visual elements
        const hillElements = document.querySelectorAll('.hill-ring, .hill-crown');
        hillElements.forEach(el => el.remove());
        
        if (this.progressElement) {
            this.progressElement.remove();
        }
        
        console.log('👑 King of Hill destroyed');
    }
};

// Export for use in other modules
window.KingOfHill = KingOfHill;