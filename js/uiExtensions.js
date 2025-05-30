// UI Extensions - V1.4 Simplified for Classic Mode Evolution
const UIExtensions = {
    
    // Update game status for classic mode
    updateGameStatus() {
        const status = document.getElementById('gameStatus');
        if (!status) return;

        // Simple status for classic evolution mode
        status.textContent = '¡Conquista todos los planetas! (Evolution: Building System)';
    },

    // Update shortcuts info for building system
    updateShortcutsInfo() {
        const shortcuts = document.getElementById('shortcutsInfo');
        if (!shortcuts) return;

        const infoText = 'Controles: Drag & Drop o teclas asignadas. Click derecho en planetas para construir edificios.';
        shortcuts.innerHTML = `<div>${infoText}</div>`;
    },

    // Initialize UI for classic evolution mode
    init() {
        this.updateGameStatus();
        this.updateShortcutsInfo();
        console.log('🎮 UI Extensions initialized for Classic Evolution mode');
    },

    // Debug balance info
    debugModeInfo() {
        console.log('Current Mode: Classic Evolution');
        console.log('Applied Settings:', BalanceConfig.getCurrentSettings());
        BalanceConfig.debugCurrentSettings();
    }
};

// Extend existing UI
if (window.UI) {
    // Add classic mode updates to existing UI update cycle
    const originalUpdate = UI.update;
    UI.update = function() {
        originalUpdate.call(this);
        UIExtensions.updateGameStatus();
    };

    // Initialize classic mode UI when game starts
    UI.initClassicUI = function() {
        UIExtensions.init();
    };
}

window.UIExtensions = UIExtensions;