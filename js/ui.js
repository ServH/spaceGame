// UI Manager - V1.3 Enhanced with Victory Details and Mode Info
const UI = {
    elements: {},
    tooltip: null,

    init() {
        this.cacheElements();
        this.createTooltip();
        this.updateStats();
        this.showKeyboardInfo();
        
        // V1.3: Add mode indicator
        this.showModeIndicator();
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

    // V1.3: Show current game mode
    showModeIndicator() {
        const mode = GameModes.currentMode;
        if (!mode || mode.id === 'classic') return;

        const indicator = document.createElement('div');
        indicator.id = 'modeIndicator';
        indicator.style.cssText = `
            position: absolute;
            top: 50px;
            right: 20px;
            background: rgba(0, 102, 204, 0.2);
            border: 1px solid #0066cc;
            color: #66ccff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            z-index: 50;
        `;
        
        let modeText = mode.name;
        if (mode.duration) {
            modeText += ` (${mode.duration / 1000}s)`;
        }
        
        indicator.textContent = modeText;
        
        const uiOverlay = document.querySelector('.ui-overlay');
        if (uiOverlay) {
            uiOverlay.appendChild(indicator);
        }
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
                // Add crown for hill planet
                if (planet.isHill) icon += '👑';
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

    // V1.3: Enhanced game end with victory details
    showGameEnd(winner, details = '') {
        const message = winner === 'player' ? '¡Victoria!' : 
                       winner === 'ai' ? 'Derrota' : 'Empate';
        const color = winner === 'player' ? '#00ff88' : 
                     winner === 'ai' ? '#ff4444' : '#ffaa00';
        const emoji = winner === 'player' ? '🎉' : 
                     winner === 'ai' ? '💀' : '🤝';
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            font-family: 'Courier New', monospace;
            animation: fadeIn 0.5s ease;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            padding: 40px;
            background: linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 40, 0.9));
            border: 2px solid ${color};
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
            max-width: 500px;
            width: 90%;
        `;
        
        const gameStats = GameEngine.getGameStats();
        const mode = GameModes.currentMode;
        
        content.innerHTML = `
            <h1 style="font-size: 42px; margin: 0 0 15px 0; color: ${color};">
                ${emoji} ${message}
            </h1>
            
            ${details ? `<p style="font-size: 16px; margin: 0 0 20px 0; color: #cccccc;">
                ${details}
            </p>` : ''}
            
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #ffffff;">Estadísticas Finales</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left;">
                    <div>
                        <strong style="color: #00ff88;">🟢 Jugador</strong><br>
                        Planetas: ${gameStats.player.planets}<br>
                        Naves: ${gameStats.player.ships}
                    </div>
                    <div>
                        <strong style="color: #ff4444;">🔴 IA</strong><br>
                        Planetas: ${gameStats.ai.planets}<br>
                        Naves: ${gameStats.ai.ships}
                    </div>
                </div>
                ${gameStats.neutral > 0 ? `<p style="margin: 10px 0 0 0; color: #888888;">
                    Planetas neutrales: ${gameStats.neutral}
                </p>` : ''}
            </div>
            
            ${mode && mode.id !== 'classic' ? `<div style="background: rgba(0, 102, 204, 0.2); padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="color: #66ccff;">Modo: ${mode.name}</strong>
                ${mode.duration ? `<br><small>Duración: ${mode.duration / 1000}s</small>` : ''}
            </div>` : ''}
            
            <div style="margin-top: 30px;">
                <button onclick="Game.restart()" style="
                    padding: 12px 24px;
                    font-size: 16px;
                    background: ${color};
                    color: ${winner === 'tie' ? '#000000' : winner === 'player' ? '#000000' : '#ffffff'};
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: inherit;
                    font-weight: bold;
                    margin-right: 10px;
                    transition: transform 0.2s ease;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🎮 Nueva Partida
                </button>
                <button onclick="location.reload()" style="
                    padding: 12px 24px;
                    font-size: 16px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: inherit;
                    transition: background 0.2s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                    🔄 Recargar
                </button>
            </div>
            
            <p style="font-size: 12px; margin: 20px 0 0 0; color: #888888;">
                Reinicio automático en <span id="countdown">5</span> segundos...
            </p>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // Countdown
        let countdown = 5;
        const countdownInterval = setInterval(() => {
            countdown--;
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                Game.restart();
            }
        }, 1000);
    },

    // V1.3: Show victory progress for debugging
    showVictoryProgress() {
        if (typeof VictoryConditions === 'undefined') return;
        
        const progress = VictoryConditions.getVictoryProgress();
        console.log('Victory Progress:', progress);
        
        // Could add visual progress indicators here in the future
    }
};