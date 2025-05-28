// UI Manager - Handles user interface updates
const UI = {
    elements: {},

    init() {
        this.cacheElements();
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

    updateStats() {
        const playerStats = GameEngine.getPlayerStats();
        const aiStats = GameEngine.getAIStats();
        
        if (this.elements.playerPlanets) {
            this.elements.playerPlanets.textContent = playerStats.planets;
        }
        if (this.elements.playerShips) {
            this.elements.playerShips.textContent = playerStats.ships;
        }
        if (this.elements.aiPlanets) {
            this.elements.aiPlanets.textContent = aiStats.planets;
        }
        if (this.elements.aiShips) {
            this.elements.aiShips.textContent = aiStats.ships;
        }
    },

    showKeyboardInfo() {
        if (!this.elements.shortcutsInfo) return;
        
        const keyInfo = GameEngine.planets
            .map(planet => `${planet.assignedKey}: ${this.getPlanetDescription(planet)}`)
            .join(' | ');
        
        this.elements.shortcutsInfo.innerHTML = `
            <div style="margin-bottom: 5px;">
                <strong>Controles:</strong> 
                Ratón: Arrastra desde tu planeta | 
                Teclado: Tecla origen → Tecla destino
            </div>
            <div style="font-size: 12px; opacity: 0.8;">
                Planetas: ${keyInfo}
            </div>
        `;
    },

    getPlanetDescription(planet) {
        let desc = '';
        switch (planet.owner) {
            case 'player':
                desc = '🟢';
                break;
            case 'ai':
                desc = '🔴';
                break;
            default:
                desc = '⚪';
        }
        return `${desc}(${planet.capacity})`;
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

    showWinMessage(message) {
        // Create win overlay
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
            border: 2px solid #fff;
            border-radius: 10px;
        `;
        
        content.innerHTML = `
            <h2 style="font-size: 36px; margin: 0 0 20px 0; color: #00ff88;">${message}</h2>
            <p style="font-size: 18px; margin: 0 0 30px 0;">La partida se reiniciará automáticamente...</p>
            <button onclick="location.reload()" style="
                padding: 10px 20px;
                font-size: 16px;
                background: #00ff88;
                color: black;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Reiniciar Ahora</button>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }
};
