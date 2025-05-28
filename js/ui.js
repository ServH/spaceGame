// UI Manager - Enhanced with tooltips and better UX like SpaceIndustry
const UI = {
    elements: {},
    tooltip: null,

    init() {
        this.cacheElements();
        this.createTooltip();
        this.updateStats();
        this.showKeyboardInfo();
        console.log('🎨 UI initialized');
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
        this.tooltip.className = 'tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #444;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            display: none;
            max-width: 200px;
            line-height: 1.4;
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
                return `${planet.assignedKey}:${icon}(${planet.capacity})`;
            })
            .join(' | ');
        
        this.elements.shortcutsInfo.innerHTML = `
            <div style="margin-bottom: 5px;">
                <strong>Controles:</strong> 
                Ratón: Arrastra desde tu planeta | 
                Teclado: Tecla origen → Tecla destino
            </div>
            <div style="font-size: 11px; opacity: 0.8;">
                ${planetInfo}
            </div>
        `;
    },

    showTooltip(content, x, y) {
        if (!this.tooltip) return;
        
        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
        
        // Position tooltip
        let finalX = x + 15;
        let finalY = y - 10;
        
        // Keep tooltip on screen
        const rect = this.tooltip.getBoundingClientRect();
        if (finalX + rect.width > window.innerWidth) {
            finalX = x - rect.width - 15;
        }
        if (finalY < 0) {
            finalY = y + 25;
        }
        if (finalY + rect.height > window.innerHeight) {
            finalY = window.innerHeight - rect.height - 10;
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
        const message = winner === 'player' ? '¡Has Ganado!' : 'La IA ha Ganado';
        const color = winner === 'player' ? '#00ff88' : '#ff4444';
        
        // Create end game overlay
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
            font-family: Arial, sans-serif;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            padding: 40px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${color};
            border-radius: 10px;
        `;
        
        content.innerHTML = `
            <h2 style="font-size: 36px; margin: 0 0 20px 0; color: ${color};">${message}</h2>
            <p style="font-size: 18px; margin: 0 0 30px 0;">La partida se reiniciará automáticamente en 5 segundos...</p>
            <button onclick="location.reload()" style="
                padding: 10px 20px;
                font-size: 16px;
                background: ${color};
                color: black;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Reiniciar Ahora</button>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // Auto reload after 5 seconds
        setTimeout(() => location.reload(), 5000);
    }
};