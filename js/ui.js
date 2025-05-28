// UI Manager - Updated for new layout structure
const UI = {
    elements: {},
    tooltip: null,

    init() {
        this.cacheElements();
        this.createTooltip();
        this.updateStats();
        this.showKeyboardInfo();
    },

    cacheElements() {
        this.elements = {
            playerPlanets: document.getElementById('playerPlanets'),
            playerShips: document.getElementById('playerShips'),
            aiPlanets: document.getElementById('aiPlanets'),
            aiShips: document.getElementById('aiShips'),
            gameStatus: document.getElementById('gameStatus'),
            shortcutsInfo: document.getElementById('shortcutsInfo')
        };
    },

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 10px;
            border-radius: 4px;
            border: 1px solid #444;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            display: none;
            max-width: 180px;
            line-height: 1.3;
            font-family: 'Courier New', monospace;
        `;
        document.body.appendChild(this.tooltip);
    },

    updateStats() {
        const playerStats = GameEngine.getPlayerStats();
        const aiStats = GameEngine.getAIStats();
        
        if (this.elements.playerPlanets) {
            this.elements.playerPlanets.textContent = playerStats.planets;
        }
        if (this.elements.playerShips) {
            this.elements.playerShips.textContent = Math.floor(playerStats.ships);
        }
        if (this.elements.aiPlanets) {
            this.elements.aiPlanets.textContent = aiStats.planets;
        }
        if (this.elements.aiShips) {
            this.elements.aiShips.textContent = Math.floor(aiStats.ships);
        }
    },

    showKeyboardInfo() {
        if (!this.elements.shortcutsInfo) return;
        
        const planetInfo = GameEngine.planets
            .map(planet => {
                let icon = '';
                switch (planet.owner) {
                    case 'player': icon = '🟢'; break;
                    case 'ai': icon = '🔴'; break;
                    default: icon = '⚪'; break;
                }
                return `${planet.assignedKey}:${icon}`;
            })
            .join(' ');
        
        this.elements.shortcutsInfo.innerHTML = `
            <strong>Controles:</strong> Ratón (arrastra) | Teclado (origen→destino) | 
            <strong>Planetas:</strong> ${planetInfo}
        `;
    },

    showTooltip(content, x, y) {
        if (!this.tooltip) return;
        
        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
        
        // Position away from cursor to avoid interference
        let finalX = x + 15;
        let finalY = y - 30;
        
        // Keep on screen
        const rect = this.tooltip.getBoundingClientRect();
        if (finalX + rect.width > window.innerWidth) {
            finalX = x - rect.width - 15;
        }
        if (finalY < 0) {
            finalY = y + 20;
        }
        
        this.tooltip.style.left = `${finalX}px`;
        this.tooltip.style.top = `${finalY}px`;
    },

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    },

    setStatus(message, duration = 0) {
        if (this.elements.gameStatus) {
            this.elements.gameStatus.textContent = message;
            
            if (duration > 0) {
                setTimeout(() => {
                    this.elements.gameStatus.textContent = 'Arrastra para conquistar';
                }, duration);
            }
        }
    },

    showGameEnd(winner) {
        const message = winner === 'player' ? '¡Victoria!' : 'Derrota';
        const color = winner === 'player' ? '#00ff88' : '#ff4444';
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            font-family: 'Courier New', monospace;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            padding: 30px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${color};
            border-radius: 8px;
        `;
        
        content.innerHTML = `
            <h2 style="font-size: 32px; margin: 0 0 15px 0; color: ${color};">${message}</h2>
            <p style="font-size: 16px; margin: 0 0 20px 0;">Reiniciando en 3 segundos...</p>
            <button onclick="location.reload()" style="
                padding: 8px 16px;
                font-size: 14px;
                background: ${color};
                color: black;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
            ">Reiniciar Ahora</button>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        setTimeout(() => location.reload(), 3000);
    }
};