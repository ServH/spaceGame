// King of Hill System - V1.3 Revised
// Enhanced with clearer visuals and strategic bonuses

const KingOfHill = {
    // Hill state
    hillPlanet: null,
    currentController: null,
    controlStartTime: null,
    controlDuration: 45000, // 45 seconds to win
    progressBar: null,

    // Visual elements
    hillIndicator: null,
    progressElement: null,

    // Initialize King of Hill mode
    init() {
        // Get control duration from game mode
        if (typeof GameModes !== 'undefined') {
            this.controlDuration = GameModes.getKingOfHillTime();
        }
        
        this.createHillUI();
        this.setupHillPlanet();
        console.log(`👑 King of Hill initialized (${this.controlDuration / 1000}s to win)`);
    },

    // Setup the central hill planet with bonuses
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

        // Apply hill bonuses
        const bonuses = GameModes.getHillBonuses();
        
        // Mark as hill planet
        this.hillPlanet.isHill = true;
        
        // Apply capacity bonus (30% larger)
        this.hillPlanet.capacity = Math.floor(this.hillPlanet.capacity * bonuses.capacity);
        
        // Apply production bonus (50% faster)
        this.hillPlanet.hillProductionBonus = bonuses.production;
        
        // Make it visually larger
        this.hillPlanet.radius = this.hillPlanet.radius * 1.2;
        
        this.addHillVisuals();
        
        console.log(`👑 Hill planet set: Planet ${this.hillPlanet.id} (Capacity: ${this.hillPlanet.capacity}, Production: +${Math.round((bonuses.production - 1) * 100)}%)`);
    },

    // Add enhanced visual indicators
    addHillVisuals() {
        if (!this.hillPlanet || !this.hillPlanet.element) return;

        // Multiple golden rings for better visibility
        const rings = [
            { radius: this.hillPlanet.radius + 12, width: 4, opacity: 0.9 },
            { radius: this.hillPlanet.radius + 20, width: 2, opacity: 0.6 },
            { radius: this.hillPlanet.radius + 28, width: 1, opacity: 0.3 }
        ];

        rings.forEach((ring, index) => {
            const hillRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            hillRing.setAttribute('cx', this.hillPlanet.x);
            hillRing.setAttribute('cy', this.hillPlanet.y);
            hillRing.setAttribute('r', ring.radius);
            hillRing.setAttribute('fill', 'none');
            hillRing.setAttribute('stroke', '#ffd700');
            hillRing.setAttribute('stroke-width', ring.width);
            hillRing.setAttribute('stroke-opacity', ring.opacity);
            hillRing.setAttribute('stroke-dasharray', '8,4');
            hillRing.classList.add('hill-ring', `hill-ring-${index}`);
            
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                canvas.appendChild(hillRing);
            }
        });

        // Larger, more prominent crown
        const crown = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        crown.setAttribute('x', this.hillPlanet.x);
        crown.setAttribute('y', this.hillPlanet.y - this.hillPlanet.radius - 20);
        crown.setAttribute('text-anchor', 'middle');
        crown.setAttribute('font-size', '28');
        crown.setAttribute('fill', '#ffd700');
        crown.setAttribute('stroke', '#000000');
        crown.setAttribute('stroke-width', '1');
        crown.textContent = '👑';
        crown.classList.add('hill-crown');

        // Add "HILL" text label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', this.hillPlanet.x);
        label.setAttribute('y', this.hillPlanet.y + this.hillPlanet.radius + 25);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '12');
        label.setAttribute('font-weight', 'bold');
        label.setAttribute('fill', '#ffd700');
        label.setAttribute('stroke', '#000000');
        label.setAttribute('stroke-width', '0.5');
        label.textContent = 'COLINA';
        label.classList.add('hill-label');

        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.appendChild(crown);
            canvas.appendChild(label);
        }

        this.addHillStyles();
    },

    // Enhanced CSS styles
    addHillStyles() {
        if (document.getElementById('hill-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'hill-styles';
        style.textContent = `
            .hill-ring-0 {
                animation: hillPulse 2s infinite ease-in-out;
                transform-origin: center;
            }
            
            .hill-ring-1 {
                animation: hillPulse 2s infinite ease-in-out 0.3s;
                transform-origin: center;
            }
            
            .hill-ring-2 {
                animation: hillPulse 2s infinite ease-in-out 0.6s;
                transform-origin: center;
            }

            @keyframes hillPulse {
                0%, 100% { 
                    stroke-opacity: 0.9; 
                    transform: scale(1);
                }
                50% { 
                    stroke-opacity: 0.4; 
                    transform: scale(1.05);
                }
            }

            .hill-crown {
                animation: crownBob 3s infinite ease-in-out;
                filter: drop-shadow(0 0 8px #ffd700);
            }

            @keyframes crownBob {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }

            .hill-label {
                animation: labelGlow 2s infinite ease-in-out;
            }

            @keyframes labelGlow {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .hill-progress {
                position: absolute;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                border: 3px solid #ffd700;
                border-radius: 12px;
                padding: 15px 20px;
                color: #ffffff;
                font-size: 16px;
                font-weight: bold;
                z-index: 100;
                min-width: 280px;
                text-align: center;
                box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
            }

            .hill-progress.hidden {
                display: none;
            }

            .hill-control-bar {
                width: 100%;
                height: 12px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                overflow: hidden;
                margin-top: 12px;
                border: 1px solid rgba(255, 215, 0, 0.5);
            }

            .hill-control-fill {
                height: 100%;
                border-radius: 6px;
                transition: width 0.2s ease;
                position: relative;
            }

            .hill-control-fill.player {
                background: linear-gradient(90deg, #00ff88, #00cc66);
                box-shadow: 0 0 12px rgba(0, 255, 136, 0.6);
            }

            .hill-control-fill.ai {
                background: linear-gradient(90deg, #ff4444, #cc3333);
                box-shadow: 0 0 12px rgba(255, 68, 68, 0.6);
            }

            .hill-bonus-info {
                font-size: 12px;
                color: #ffd700;
                margin-top: 8px;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    },

    // Enhanced hill UI
    createHillUI() {
        const hillUI = document.createElement('div');
        hillUI.id = 'hillProgress';
        hillUI.className = 'hill-progress hidden';
        
        const bonuses = GameModes.getHillBonuses();
        const productionBonus = Math.round((bonuses.production - 1) * 100);
        const capacityBonus = Math.round((bonuses.capacity - 1) * 100);
        
        hillUI.innerHTML = `
            <div id="hillControllerText">🏰 Colina Neutral</div>
            <div class="hill-control-bar">
                <div class="hill-control-fill" id="hillControlFill"></div>
            </div>
            <div class="hill-bonus-info">
                👑 Bonificaciones: +${productionBonus}% producción, +${capacityBonus}% capacidad
            </div>
        `;

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

        if (previousController !== this.currentController) {
            this.onControllerChange();
        }

        if (this.currentController && this.currentController !== 'neutral') {
            this.updateProgress();
        }

        this.checkVictory();
    },

    // Enhanced controller change handling
    onControllerChange() {
        if (this.currentController === 'neutral') {
            this.controlStartTime = null;
            this.hideProgress();
            console.log('👑 Hill is now neutral');
        } else {
            this.controlStartTime = Date.now();
            this.showProgress();
            
            const controllerName = this.currentController === 'player' ? 'Jugador' : 'IA';
            console.log(`👑 ${controllerName} conquered the hill! ${this.controlDuration / 1000}s to victory`);
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

    // Enhanced progress display
    updateProgress() {
        if (!this.controlStartTime || !this.progressElement) return;

        const elapsed = Date.now() - this.controlStartTime;
        const progress = Math.min(elapsed / this.controlDuration, 1) * 100;

        // Update text with more details
        const remaining = Math.ceil((this.controlDuration - elapsed) / 1000);
        const controllerText = document.getElementById('hillControllerText');
        if (controllerText) {
            const controllerName = this.currentController === 'player' ? '🟢 Jugador' : '🔴 IA';
            const emoji = remaining <= 10 ? '🚨' : '👑';
            controllerText.textContent = `${emoji} ${controllerName} controla la colina - ${remaining}s para victoria`;
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
            console.log(`👑 ${this.currentController} wins by King of Hill!`);
            
            if (GameEngine && GameEngine.endGame) {
                const details = `Controlled the fortified hill for ${this.controlDuration / 1000} seconds`;
                GameEngine.endGame(this.currentController, details);
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
        
        if (this.hillPlanet) {
            this.hillPlanet.isHill = true;
        }
        
        console.log('👑 King of Hill reset');
    },

    // Enhanced cleanup
    destroy() {
        this.reset();
        
        // Remove visual elements
        const hillElements = document.querySelectorAll('.hill-ring, .hill-crown, .hill-label');
        hillElements.forEach(el => el.remove());
        
        if (this.progressElement) {
            this.progressElement.remove();
        }
        
        // Remove styles
        const hillStyles = document.getElementById('hill-styles');
        if (hillStyles) {
            hillStyles.remove();
        }
        
        console.log('👑 King of Hill destroyed');
    }
};

// Export for use in other modules
window.KingOfHill = KingOfHill;