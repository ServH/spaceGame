// UI Manager - V1.3 Basic functionality + Evolution Integration
const UI = {
    initialized: false,
    tooltip: null,
    
    init() {
        if (this.initialized) return;
        
        this.elements = {
            playerPlanets: document.getElementById('playerPlanets'),
            playerShips: document.getElementById('playerShips'),
            aiPlanets: document.getElementById('aiPlanets'),
            aiShips: document.getElementById('aiShips'),
            gameStatus: document.getElementById('gameStatus'),
            shortcutsInfo: document.getElementById('shortcutsInfo')
        };
        
        this.createTooltip();
        this.initialized = true;
        console.log('UI initialized');
        
        // Start update loop
        this.updateLoop();
    },
    
    // FIXED: Add missing tooltip functions
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'gameTooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            display: none;
            max-width: 200px;
            border: 1px solid #444;
        `;
        document.body.appendChild(this.tooltip);
    },
    
    showTooltip(content, x, y) {
        if (!this.tooltip) return;
        this.tooltip.innerHTML = content;
        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = y + 'px';
        this.tooltip.style.display = 'block';
    },
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    },
    
    updateLoop() {
        this.update();
        if (GameEngine.isRunning) {
            requestAnimationFrame(() => this.updateLoop());
        }
    },
    
    update() {
        this.updateStats();
        this.updateStatus();
    },
    
    updateStats() {
        if (!GameEngine.planets || GameEngine.planets.length === 0) return;
        
        let playerPlanets = 0, playerShips = 0;
        let aiPlanets = 0, aiShips = 0;
        
        GameEngine.planets.forEach(planet => {
            if (planet.owner === 'player') {
                playerPlanets++;
                playerShips += planet.ships;
            } else if (planet.owner === 'ai') {
                aiPlanets++;
                aiShips += planet.ships;
            }
        });
        
        if (this.elements.playerPlanets) this.elements.playerPlanets.textContent = playerPlanets;
        if (this.elements.playerShips) this.elements.playerShips.textContent = playerShips;
        if (this.elements.aiPlanets) this.elements.aiPlanets.textContent = aiPlanets;
        if (this.elements.aiShips) this.elements.aiShips.textContent = aiShips;
    },
    
    updateStatus() {
        if (window.UIExtensions && UIExtensions.updateModeStatus) {
            UIExtensions.updateModeStatus();
        }
    },
    
    setStatus(message, duration = 3000) {
        if (this.elements.gameStatus) {
            this.elements.gameStatus.textContent = message;
            
            if (duration > 0) {
                setTimeout(() => {
                    if (window.UIExtensions) {
                        UIExtensions.updateModeStatus();
                    }
                }, duration);
            }
        }
    },
    
    initModeUI() {
        if (window.UIExtensions) {
            UIExtensions.updateShortcutsInfo();
            UIExtensions.highlightCenterPlanet();
        }
    }
};