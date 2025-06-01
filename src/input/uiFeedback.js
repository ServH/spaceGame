// UI Feedback - Tooltips and Notifications - FIXED
const UIFeedback = {
    tooltip: null,

    init() {
        this.createTooltip();
        this.injectCSS();
        console.log('💬 UI Feedback initialized');
    },

    createTooltip() {
        if (this.tooltip) return;
        
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'game-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            max-width: 300px;
            border: 1px solid #444;
            display: none;
        `;
        document.body.appendChild(this.tooltip);
    },

    showTooltip(planet, x, y) {
        if (!planet || !this.tooltip) return;
        
        // FIX: Use correct method name
        let content = planet.getTooltipInfo();
        
        // Add movement cost info if planet can be targeted
        if (InputManager.selectedPlanet && InputManager.selectedPlanet.owner === 'player' && 
            planet !== InputManager.selectedPlanet) {
            
            const distance = Utils.distance(InputManager.selectedPlanet, planet);
            const ships = Math.floor(InputManager.selectedPlanet.ships / 2);
            
            if (ships > 0) {
                const costInfo = CONFIG.getMovementCostInfo(ships, distance);
                const canAfford = ResourceManager.canAffordMovement(ships, distance);
                
                content += `<br><hr style="border: 1px solid #444; margin: 8px 0;">`;
                content += `<strong>Coste de movimiento:</strong><br>`;
                content += `⚡ ${costInfo.total} energía para ${ships} naves<br>`;
                content += `📏 Distancia: ${distance.toFixed(0)}px`;
                
                if (!canAfford) {
                    content += `<br><span style="color: #ff4444">❌ Energía insuficiente</span>`;
                } else {
                    content += `<br><span style="color: #00ff88">✅ Movimiento posible</span>`;
                }
            }
        }
        
        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
        this.updateTooltipPosition(x, y);
    },

    updateTooltipPosition(x, y) {
        if (!this.tooltip || this.tooltip.style.display === 'none') return;
        
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = x + 15;
        let top = y - tooltipRect.height - 10;
        
        if (left + tooltipRect.width > windowWidth) {
            left = x - tooltipRect.width - 15;
        }
        
        if (top < 0) {
            top = y + 15;
        }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    },

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    },

    showFeedback(message, type = 'info') {
        const existing = document.getElementById('game-feedback');
        if (existing) existing.remove();
        
        const feedback = document.createElement('div');
        feedback.id = 'game-feedback';
        
        const colors = {
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4444',
            info: '#4a90e2'
        };
        
        feedback.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: ${colors[type] || colors.info};
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            z-index: 2000;
            border: 2px solid ${colors[type] || colors.info};
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            animation: slideDown 0.3s ease-out;
        `;
        
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.animation = 'slideUp 0.3s ease-in';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 3000);
    },

    showEnergyInsufficientFeedback(needed, available, ships, distance) {
        const shortfall = needed - available;
        this.showFeedback(
            `❌ Energía insuficiente: Necesitas ${needed}, tienes ${available}`, 
            'error'
        );
        
        let maxAffordableShips = 0;
        for (let testShips = 1; testShips <= ships; testShips++) {
            const testCost = CONFIG.calculateMovementCost(testShips, distance);
            if (testCost <= available) {
                maxAffordableShips = testShips;
            } else {
                break;
            }
        }
        
        if (maxAffordableShips > 0) {
            setTimeout(() => {
                this.showFeedback(`💡 Puedes enviar máximo ${maxAffordableShips} naves`, 'info');
            }, 2000);
        }
    },

    injectCSS() {
        if (document.getElementById('ui-feedback-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ui-feedback-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    },

    cleanup() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
            this.tooltip = null;
        }
        
        const feedback = document.getElementById('game-feedback');
        if (feedback) feedback.remove();
        
        const styles = document.getElementById('ui-feedback-styles');
        if (styles) styles.remove();
    }
};