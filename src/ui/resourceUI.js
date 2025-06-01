// Resource UI - Enhanced display for Action 02 Energy Fuel System
const ResourceUI = {
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        this.elements = {
            mainResourceDisplay: document.getElementById('mainResourceDisplay')
        };
        
        this.initialized = true;
        console.log('💰 ResourceUI initialized');
    },
    
    update() {
        if (!this.initialized || !ResourceManager) return;
        
        const metal = ResourceManager.getMetal();
        const energy = ResourceManager.getEnergy();
        const rates = ResourceManager.getGenerationRates();
        
        if (this.elements.mainResourceDisplay) {
            this.elements.mainResourceDisplay.innerHTML = 
                `🔩 Metal: ${Math.floor(metal)} (+${rates.metal.toFixed(1)}/min) | ` +
                `⚡ Energy: ${Math.floor(energy)} (+${rates.energy.toFixed(1)}/min)`;
        }
    },
    
    showResourceChange(type, amount, isPositive = true) {
        const color = isPositive ? '#00ff88' : '#ff4444';
        const prefix = isPositive ? '+' : '-';
        const icon = type === 'metal' ? '🔩' : '⚡';
        
        // Create floating text effect
        const floatingText = document.createElement('div');
        floatingText.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            color: ${color};
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            pointer-events: none;
            animation: fadeInOut 2s ease-out;
        `;
        
        floatingText.textContent = `${prefix}${Math.abs(amount)} ${icon} ${type}`;
        document.body.appendChild(floatingText);
        
        // Remove after animation
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.remove();
            }
        }, 2000);
    }
};

// Add CSS for floating animation if not exists
if (!document.getElementById('resource-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'resource-ui-styles';
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(0); }
            20% { opacity: 1; transform: translateY(-10px); }
            80% { opacity: 1; transform: translateY(-10px); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}

// Make available globally
window.ResourceUI = ResourceUI;