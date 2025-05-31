// Game Initialization - Main Entry Point
// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Starting Space Game V2.5 - Modular Architecture');
    
    // Initialize systems in correct order
    try {
        // 1. Configuration
        if (typeof BalanceConfig !== 'undefined') {
            BalanceConfig.init();
        }
        
        // 2. Core systems
        if (typeof ResourceManager !== 'undefined') {
            ResourceManager.init();
        }
        
        if (typeof BuildingManager !== 'undefined') {
            BuildingManager.init();
        }
        
        // 3. UI systems
        if (typeof ResourceUI !== 'undefined') {
            ResourceUI.init();
        }
        
        if (typeof BuildingUI !== 'undefined') {
            BuildingUI.init();
        }
        
        if (typeof UI !== 'undefined') {
            UI.init();
        }
        
        if (typeof Animations !== 'undefined') {
            Animations.init();
        }
        
        // 4. Game engine (must be last)
        if (typeof GameEngine !== 'undefined') {
            GameEngine.init();
        } else {
            console.error('❌ GameEngine not found');
        }
        
        console.log('✅ Game initialization complete');
        
    } catch (error) {
        console.error('❌ Game initialization failed:', error);
    }
});

// Global game state
window.gameStartTime = Date.now();

// Debug commands
window.debugGame = {
    restart: () => GameEngine.restartGame(),
    stats: () => console.table(GameEngine.getGameStats()),
    systems: () => {
        console.log('🎮 System Status:');
        const systems = ['CONFIG', 'GameEngine', 'ResourceManager', 'BuildingManager', 'AI', 'InputManager'];
        systems.forEach(sys => {
            console.log(`  ${sys}: ${typeof window[sys] !== 'undefined' ? '✅' : '❌'}`);
        });
    }
};