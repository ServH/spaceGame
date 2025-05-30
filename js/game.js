// Main Game Controller - V1.4 Classic Evolution Mode
const Game = {
    initialized: false,

    init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Space Game Evolution v1.4...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        try {
            // Initialize directly in classic evolution mode
            this.initializeGame();
            
            this.initialized = true;
            console.log('✅ Game ready in Classic Evolution mode!');
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.showErrorMessage(error);
        }
    },

    // Initialize game systems for classic evolution mode
    initializeGame() {
        console.log('⚙️ Starting Classic Evolution game systems...');
        
        // Initialize balance configuration for classic mode
        if (typeof BalanceConfig !== 'undefined') {
            BalanceConfig.init();
        }
        
        // Initialize resource system (Action 01)
        if (typeof ResourceManager !== 'undefined') {
            console.log('💰 Resource system available');
        }
        
        // Initialize building system (Action 02) - will be implemented
        if (typeof BuildingManager !== 'undefined') {
            console.log('🏗️ Building system available');
        }
        
        // Initialize game engine
        GameEngine.init();
        console.log('✅ Game engine initialized');
        
        // Initialize UI extensions for classic mode
        if (typeof UIExtensions !== 'undefined') {
            UIExtensions.init();
        }
        
        this.showWelcomeMessage();
    },

    showWelcomeMessage() {
        setTimeout(() => {
            if (typeof UI !== 'undefined' && UI.setStatus) {
                UI.setStatus('¡Evolution Action 02! Click derecho en planetas para construir', 3000);
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
            font-family: 'Courier New', monospace;
        `;
        errorDiv.innerHTML = `
            <h3>Error al inicializar el juego</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #ff4444;
                border: none;
                padding: 10px 20px;
                margin-top: 10px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Reintentar</button>
        `;
        document.body.appendChild(errorDiv);
    },

    restart() {
        console.log('🔄 Restarting Classic Evolution game...');
        
        // Clear existing game state
        if (typeof FleetManager !== 'undefined') {
            FleetManager.clear();
        }
        
        if (typeof GameEngine !== 'undefined' && GameEngine.planets) {
            GameEngine.planets.forEach(planet => planet.destroy());
            GameEngine.planets = [];
        }
        
        // Clear building state if available
        if (typeof BuildingManager !== 'undefined') {
            BuildingManager.reset();
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