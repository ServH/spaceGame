// Main Game Controller - Fixed for Evolution Action 01
const Game = {
    initialized: false,

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Space Game...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        try {
            // FIXED: Skip GameMenu, initialize directly
            this.initializeGame();
            
            this.initialized = true;
            console.log('✅ Game ready!');
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage(error);
        }
    },

    // Initialize game systems
    initializeGame(selectedMode = 'classic') {
        console.log('⚙️ Starting game systems...');
        
        // FIXED: Skip BalanceConfig if not available
        if (typeof BalanceConfig !== 'undefined') {
            BalanceConfig.applyMode(selectedMode);
        }
        
        // Initialize game engine
        GameEngine.init();
        console.log('✅ Game engine initialized');
        
        this.showWelcomeMessage();
    },

    showWelcomeMessage() {
        setTimeout(() => {
            if (typeof UI !== 'undefined' && UI.setStatus) {
                UI.setStatus('¡Evolution Action 01! Drag & Drop para enviar naves', 3000);
            }
        }, 500);
    },

    showErrorMessage(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>Error al inicializar el juego</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()">Reintentar</button>
        `;
        document.body.appendChild(errorDiv);
    },

    restart() {
        console.log('🔄 Restarting game...');
        
        // Clear existing game state
        if (typeof FleetManager !== 'undefined') {
            FleetManager.clear();
        }
        
        if (typeof GameEngine !== 'undefined' && GameEngine.planets) {
            GameEngine.planets.forEach(planet => planet.destroy());
            GameEngine.planets = [];
        }
        
        // Restart
        this.initialized = false;
        this.init();
    }
};

// Auto-initialize when script loads
Game.init();

// Make available globally
window.Game = Game;