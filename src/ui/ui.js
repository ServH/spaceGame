// UI Manager - ENHANCED for Evolution with full tooltip and message system
const UI = {
    initialized: false,
    tooltip: null,
    messageQueue: [],
    
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
        this.createNotificationSystem();
        this.addUIStyles();
        this.initialized = true;
        console.log('🎨 UI initialized with Evolution features');
        
        this.updateLoop();
    },
    
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'gameTooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, rgba(0, 40, 80, 0.95), rgba(0, 20, 40, 0.95));
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-family: 'Courier New', monospace;
            pointer-events: none;
            z-index: 1000;
            display: none;
            max-width: 250px;
            border: 2px solid #0088cc;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(2px);
        `;
        document.body.appendChild(this.tooltip);
    },
    
    createNotificationSystem() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notificationContainer';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 999;
            pointer-events: none;
        `;
        document.body.appendChild(this.notificationContainer);
    },
    
    addUIStyles() {
        const style = document.createElement('style');
        style.id = 'ui-evolution-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            #gameTooltip {
                animation: fadeIn 0.2s ease-out;
            }
        `;
        document.head.appendChild(style);
    },
    
    showTooltip(content, x, y) {
        if (!this.tooltip) return;
        this.tooltip.innerHTML = content;
        
        // Position tooltip, avoiding screen edges
        this.tooltip.style.display = 'block';
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let adjustedX = x;
        let adjustedY = y;
        
        if (x + tooltipRect.width > viewportWidth - 10) {
            adjustedX = x - tooltipRect.width - 20;
        }
        if (y + tooltipRect.height > viewportHeight - 10) {
            adjustedY = y - tooltipRect.height - 10;
        }
        
        this.tooltip.style.left = adjustedX + 'px';
        this.tooltip.style.top = adjustedY + 'px';
    },
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    },
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        const id = 'notification_' + Date.now();
        notification.id = id;
        
        const colors = {
            info: '#0088cc',
            success: '#00cc88',
            warning: '#ccaa00',
            error: '#cc4400',
            resource: '#8800cc'
        };
        
        notification.style.cssText = `
            background: linear-gradient(135deg, rgba(0, 40, 80, 0.95), rgba(0, 20, 40, 0.95));
            color: white;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 8px;
            border-left: 4px solid ${colors[type] || colors.info};
            font-family: 'Courier New', monospace;
            font-size: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            animation: slideInRight 0.3s ease-out;
            min-width: 200px;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        this.notificationContainer.appendChild(notification);
        
        // Auto-remove after duration using PerformanceManager if available
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.createTimer(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOutRight 0.3s ease-in';
                    PerformanceManager.createTimer(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, duration);
        } else {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, duration);
        }
        
        return id;
    },
    
    updateLoop() {
        this.update();
        if (GameEngine.gameState === 'playing') {
            // Use performance optimized updates
            if (typeof PerformanceManager !== 'undefined') {
                PerformanceManager.createTimer(() => this.updateLoop(), 100);
            } else {
                setTimeout(() => this.updateLoop(), 100);
            }
        }
    },
    
    update() {
        this.updateStats();
        this.updateResourceUI();
    },
    
    updateStats() {
        if (!GameEngine.planets || GameEngine.planets.length === 0) return;
        
        let playerPlanets = 0, playerShips = 0;
        let aiPlanets = 0, aiShips = 0;
        
        GameEngine.planets.forEach(planet => {
            if (planet.owner === 'player') {
                playerPlanets++;
                playerShips += Math.floor(planet.ships);
            } else if (planet.owner === 'ai') {
                aiPlanets++;
                aiShips += Math.floor(planet.ships);
            }
        });
        
        if (this.elements.playerPlanets) this.elements.playerPlanets.textContent = playerPlanets;
        if (this.elements.playerShips) this.elements.playerShips.textContent = playerShips;
        if (this.elements.aiPlanets) this.elements.aiPlanets.textContent = aiPlanets;
        if (this.elements.aiShips) this.elements.aiShips.textContent = aiShips;
    },
    
    updateResourceUI() {
        // Let ResourceUI handle its own updates
        if (typeof ResourceUI !== 'undefined' && ResourceUI.update) {
            ResourceUI.update();
        }
    },
    
    setStatus(message, duration = 3000) {
        if (this.elements.gameStatus) {
            this.elements.gameStatus.textContent = message;
            
            if (duration > 0) {
                const resetStatus = () => {
                    if (this.elements.gameStatus) {
                        this.elements.gameStatus.textContent = '¡Energía como combustible! Gestiona tu energía para movilizar flotas';
                    }
                };
                
                if (typeof PerformanceManager !== 'undefined') {
                    PerformanceManager.createTimer(resetStatus, duration);
                } else {
                    setTimeout(resetStatus, duration);
                }
            }
        }
    },
    
    // Evolution-specific UI methods
    showResourceInsufficient(resourceType, needed, available) {
        this.showNotification(
            `Recursos insuficientes: ${resourceType} (necesitas ${needed}, tienes ${available})`,
            'warning',
            4000
        );
    },
    
    showResourceGenerated(amount, type) {
        this.showNotification(
            `+${amount.toFixed(1)} ${type} generado`,
            'resource',
            2000
        );
    },
    
    showFleetLaunched(origin, destination, ships) {
        this.showNotification(
            `${ships} naves: ${origin} → ${destination}`,
            'info',
            3000
        );
    },
    
    showPlanetConquered(planet, newOwner) {
        const ownerName = newOwner === 'player' ? 'Jugador' : 'IA';
        this.showNotification(
            `¡Planeta conquistado por ${ownerName}!`,
            newOwner === 'player' ? 'success' : 'error',
            4000
        );
    },
    
    showVictoryScreen(winner, condition, duration) {
        const winnerText = winner === 'player' ? '🎉 ¡VICTORIA!' : '💀 DERROTA';
        const message = `${winnerText} - ${condition} en ${duration.toFixed(1)}s`;
        
        this.showNotification(message, winner === 'player' ? 'success' : 'error', 10000);
        this.setStatus(message, 0); // Permanent status
    },
    
    showGameModeInfo(mode) {
        const modeNames = {
            classic: 'Clásico',
            blitz: 'Blitz',
            kingOfHill: 'Rey de la Colina'
        };
        
        this.showNotification(
            `Modo: ${modeNames[mode] || mode}`,
            'info',
            3000
        );
    },
    
    // Debug helpers
    debugShowAllNotifications() {
        this.showNotification('Test Info', 'info');
        this.showNotification('Test Success', 'success');
        this.showNotification('Test Warning', 'warning');
        this.showNotification('Test Error', 'error');
        this.showNotification('Test Resource', 'resource');
    }
};