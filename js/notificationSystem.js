// Notification System - V1.3 Polish
// Centralized system for alerts, notifications and visual feedback

const NotificationSystem = {
    // Notification queue and state
    notifications: [],
    alertIndicators: [],
    maxNotifications: 3,

    // Initialize notification system
    init() {
        this.createNotificationContainer();
        this.createAlertIndicators();
        console.log('🔔 Notification System initialized');
    },

    // Create notification container
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);

        // Add styles
        this.addNotificationStyles();
    },

    // Create alert indicators for off-screen events
    createAlertIndicators() {
        const indicators = ['top', 'right', 'bottom', 'left'];
        
        indicators.forEach(side => {
            const indicator = document.createElement('div');
            indicator.id = `alertIndicator${side}`;
            indicator.className = `alert-indicator alert-${side}`;
            document.body.appendChild(indicator);
        });
    },

    // Add notification CSS styles
    addNotificationStyles() {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 120px;
                right: 20px;
                z-index: 900;
                pointer-events: none;
                max-width: 300px;
            }

            .notification {
                background: rgba(0, 0, 0, 0.9);
                border-left: 4px solid #00ff88;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 10px;
                color: white;
                font-size: 14px;
                font-family: 'Courier New', monospace;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                animation: slideInRight 0.3s ease;
                pointer-events: auto;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .notification:hover {
                background: rgba(0, 0, 0, 0.95);
                transform: translateX(-5px);
            }

            .notification.warning {
                border-left-color: #ffaa00;
                background: rgba(40, 30, 0, 0.9);
            }

            .notification.danger {
                border-left-color: #ff4444;
                background: rgba(40, 0, 0, 0.9);
            }

            .notification.success {
                border-left-color: #00ff88;
                background: rgba(0, 40, 20, 0.9);
            }

            .notification.info {
                border-left-color: #66ccff;
                background: rgba(0, 20, 40, 0.9);
            }

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

            .alert-indicator {
                position: fixed;
                background: rgba(255, 68, 68, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 950;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
            }

            .alert-indicator.active {
                opacity: 1;
                animation: alertPulse 2s infinite ease-in-out;
            }

            .alert-top {
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
            }

            .alert-right {
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
            }

            .alert-bottom {
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
            }

            .alert-left {
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
            }

            @keyframes alertPulse {
                0%, 100% { 
                    transform: scale(1) translateX(-50%); 
                    box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
                }
                50% { 
                    transform: scale(1.1) translateX(-50%); 
                    box-shadow: 0 6px 20px rgba(255, 68, 68, 0.8);
                }
            }

            .alert-right.active {
                animation: alertPulseRight 2s infinite ease-in-out;
            }

            .alert-left.active {
                animation: alertPulseLeft 2s infinite ease-in-out;
            }

            .alert-top.active, .alert-bottom.active {
                animation: alertPulse 2s infinite ease-in-out;
            }

            @keyframes alertPulseRight {
                0%, 100% { 
                    transform: scale(1) translateY(-50%); 
                }
                50% { 
                    transform: scale(1.1) translateY(-50%); 
                }
            }

            @keyframes alertPulseLeft {
                0%, 100% { 
                    transform: scale(1) translateY(-50%); 
                }
                50% { 
                    transform: scale(1.1) translateY(-50%); 
                }
            }

            .planet-selection-pulse {
                animation: selectionPulse 0.5s ease-out;
            }

            @keyframes selectionPulse {
                0% { 
                    transform: scale(1);
                    stroke-width: 2;
                    stroke-opacity: 1;
                }
                50% { 
                    transform: scale(1.2);
                    stroke-width: 4;
                    stroke-opacity: 0.8;
                }
                100% { 
                    transform: scale(1);
                    stroke-width: 2;
                    stroke-opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // Show notification
    showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">
                ${this.getTypeIcon(type)} ${this.getTypeTitle(type)}
            </div>
            <div>${message}</div>
        `;

        // Add click to dismiss
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        const container = document.getElementById('notificationContainer');
        if (container) {
            container.appendChild(notification);
            this.notifications.push(notification);

            // Remove old notifications if too many
            if (this.notifications.length > this.maxNotifications) {
                this.removeNotification(this.notifications[0]);
            }

            // Auto remove after duration
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
    },

    // Remove notification
    removeNotification(notification) {
        if (!notification || !notification.parentNode) return;

        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    },

    // Get type icon
    getTypeIcon(type) {
        switch (type) {
            case 'danger': return '🚨';
            case 'warning': return '⚠️';
            case 'success': return '✅';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    },

    // Get type title
    getTypeTitle(type) {
        switch (type) {
            case 'danger': return 'ALERTA';
            case 'warning': return 'ATENCIÓN';
            case 'success': return 'ÉXITO';
            case 'info': return 'INFO';
            default: return 'INFO';
        }
    },

    // Show directional alert for off-screen events
    showDirectionalAlert(direction, message, planetPosition = null) {
        const indicator = document.getElementById(`alertIndicator${direction}`);
        if (!indicator) return;

        indicator.textContent = message;
        indicator.classList.add('active');

        // Add arrow pointing to direction
        let arrow = '';
        switch (direction.toLowerCase()) {
            case 'top': arrow = '↑'; break;
            case 'right': arrow = '→'; break;
            case 'bottom': arrow = '↓'; break;
            case 'left': arrow = '←'; break;
        }
        indicator.textContent = `${arrow} ${message}`;

        // Remove after 3 seconds
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 3000);
    },

    // Show planet selection feedback
    showPlanetSelection(planet) {
        if (!planet || !planet.element) return;

        // Add visual pulse
        planet.element.classList.add('planet-selection-pulse');

        // Remove after animation
        setTimeout(() => {
            if (planet.element) {
                planet.element.classList.remove('planet-selection-pulse');
            }
        }, 500);

        // Show brief notification
        this.showNotification(`Planeta ${planet.assignedKey} seleccionado`, 'info', 1500);
    },

    // Notify planet under attack
    notifyPlanetAttack(planet, attacker) {
        const planetPos = { x: planet.x, y: planet.y };
        const isVisible = this.isPlanetVisible(planetPos);

        if (!isVisible) {
            const direction = this.getDirectionToPlanet(planetPos);
            this.showDirectionalAlert(direction, `Planeta ${planet.assignedKey} bajo ataque!`);
        }

        this.showNotification(
            `¡Tu planeta ${planet.assignedKey} está siendo atacado por ${attacker === 'ai' ? 'la IA' : 'el enemigo'}!`,
            'danger',
            3000
        );
    },

    // Notify crucial events
    notifyEvent(eventType, details) {
        switch (eventType) {
            case 'hill_captured':
                this.showNotification(
                    `¡${details.controller === 'ai' ? 'La IA' : 'El jugador'} capturó la colina!`,
                    details.controller === 'ai' ? 'danger' : 'success',
                    3000
                );
                break;

            case 'economic_victory_imminent':
                this.showNotification(
                    `¡Victoria económica de ${details.player} inminente! Ratio: ${details.ratio}:1`,
                    details.player === 'ai' ? 'danger' : 'warning',
                    4000
                );
                break;

            case 'domination_close':
                this.showNotification(
                    `¡${details.player} cerca de dominación! ${details.planets}/${details.total} planetas`,
                    details.player === 'ai' ? 'danger' : 'warning',
                    4000
                );
                break;

            case 'time_warning':
                this.showNotification(
                    `¡Solo quedan ${details.timeLeft} segundos!`,
                    'warning',
                    2000
                );
                break;
        }
    },

    // Check if planet is visible on screen
    isPlanetVisible(planetPos) {
        const margin = 100; // Consider visible if within 100px of edge
        return planetPos.x >= -margin && 
               planetPos.x <= CONFIG.GAME.CANVAS_WIDTH + margin &&
               planetPos.y >= -margin && 
               planetPos.y <= CONFIG.GAME.CANVAS_HEIGHT + margin;
    },

    // Get direction to planet from screen center
    getDirectionToPlanet(planetPos) {
        const centerX = CONFIG.GAME.CANVAS_WIDTH / 2;
        const centerY = CONFIG.GAME.CANVAS_HEIGHT / 2;
        
        const dx = planetPos.x - centerX;
        const dy = planetPos.y - centerY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'bottom' : 'top';
        }
    },

    // Clear all notifications
    clearAll() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
        
        // Clear alert indicators
        ['top', 'right', 'bottom', 'left'].forEach(direction => {
            const indicator = document.getElementById(`alertIndicator${direction}`);
            if (indicator) {
                indicator.classList.remove('active');
            }
        });
    }
};

// Export for use in other modules
window.NotificationSystem = NotificationSystem;