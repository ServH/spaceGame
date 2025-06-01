// UI Feedback System - Optimized for Performance V2.1
const UIFeedback = {
    tooltip: null,
    
    init() {
        console.log('💬 UI Feedback system initialized');
    },

    showTooltip(element, text, delay = 500) {
        this.hideTooltip();
        
        const showTooltipDelayed = () => {
            if (!element) return;
            
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'game-tooltip';
            this.tooltip.textContent = text;
            
            this.tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: #ffffff;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                z-index: 1000;
                pointer-events: none;
                border: 1px solid #444;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                white-space: nowrap;
            `;
            
            document.body.appendChild(this.tooltip);
            
            const rect = element.getBoundingClientRect();
            const tooltipRect = this.tooltip.getBoundingClientRect();
            
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 10;
            
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            
            if (top < 10) {
                top = rect.bottom + 10;
            }
            
            this.tooltip.style.left = left + 'px';
            this.tooltip.style.top = top + 'px';
            
            this.tooltip.style.opacity = '0';
            this.tooltip.style.transition = 'opacity 0.2s ease-in';
            
            requestAnimationFrame(() => {
                if (this.tooltip) {
                    this.tooltip.style.opacity = '1';
                }
            });
        };
        
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.createTimer(showTooltipDelayed, delay);
        } else {
            setTimeout(showTooltipDelayed, delay);
        }
    },

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
            
            const removeTooltip = () => {
                if (this.tooltip && this.tooltip.parentNode) {
                    this.tooltip.parentNode.removeChild(this.tooltip);
                }
                this.tooltip = null;
            };
            
            if (typeof PerformanceManager !== 'undefined') {
                PerformanceManager.createTimer(removeTooltip, 200);
            } else {
                setTimeout(removeTooltip, 200);
            }
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
        
        // Use PerformanceManager for cleanup timer
        const cleanup = () => {
            if (feedback.parentNode) {
                feedback.style.animation = 'slideUp 0.3s ease-in';
                
                // Final removal after animation
                const finalCleanup = () => feedback.remove();
                
                if (typeof PerformanceManager !== 'undefined') {
                    PerformanceManager.createTimer(finalCleanup, 300);
                } else {
                    setTimeout(finalCleanup, 300);
                }
            }
        };
        
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.createTimer(cleanup, 3000);
        } else {
            setTimeout(cleanup, 3000);
        }
    },

    // Add cleanup method for memory management
    cleanup() {
        console.log('🧹 Cleaning up UI Feedback...');
        
        // Remove any existing feedback
        const existing = document.getElementById('game-feedback');
        if (existing) existing.remove();
        
        // Remove tooltip if exists
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
        
        console.log('✅ UI Feedback cleanup complete');
    }
}; 