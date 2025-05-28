// UI Extensions - V1.3 Mode-aware interface updates
const UIExtensions = {
    
    updateModeStatus() {
        const status = document.getElementById('gameStatus');
        if (!status) return;

        const mode = BalanceConfig.getCurrentSettings();
        const modeInfo = BalanceConfig.getModeInfo(BalanceConfig.currentMode);
        
        if (!mode || !modeInfo) return;

        // Update based on current mode
        switch (BalanceConfig.currentMode) {
            case 'classic':
                status.textContent = 'Modo Clásico - Conquista todos los planetas';
                break;
            case 'blitz':
                if (GameModes.timeRemaining > 0) {
                    const timeLeft = Math.ceil(GameModes.timeRemaining / 1000);
                    status.textContent = `Blitz - ${timeLeft}s restantes`;
                } else {
                    status.textContent = 'Modo Blitz - 2 minutos';
                }
                break;
            case 'kingOfHill':
                if (GameModes.hillController) {
                    const timeLeft = Math.ceil(GameModes.hillTimeRemaining / 1000);
                    status.textContent = `Rey de la Colina - ${GameModes.hillController} controla por ${timeLeft}s`;
                } else {
                    status.textContent = 'Rey de la Colina - Controla el planeta central';
                }
                break;
        }
    },

    updateShortcutsInfo() {
        const shortcuts = document.getElementById('shortcutsInfo');
        if (!shortcuts) return;

        const mode = BalanceConfig.currentMode;
        const modeInfo = BalanceConfig.getModeInfo(mode);
        
        if (!modeInfo) return;

        let infoText = '';
        
        switch (mode) {
            case 'classic':
                infoText = 'Controles: Drag & Drop o teclas asignadas a planetas. Conquista todos para ganar.';
                break;
            case 'blitz':
                infoText = 'Partida rápida: Conquista mayoría de planetas antes de que termine el tiempo (2 min).';
                break;
            case 'kingOfHill':
                infoText = 'Controla el planeta central (marcado) por 45 segundos para ganar.';
                break;
        }

        shortcuts.innerHTML = `<div>${infoText}</div>`;
    },

    // Visual indicators for special modes
    highlightCenterPlanet() {
        if (BalanceConfig.currentMode !== 'kingOfHill') return;
        
        // Find center planet (should be implemented in GameModes)
        const planets = GameEngine.planets;
        if (!planets || planets.length === 0) return;

        // Simple center calculation - most central planet
        const centerX = 400; // Canvas center
        const centerY = 300;
        
        let centerPlanet = null;
        let minDistance = Infinity;

        planets.forEach(planet => {
            const distance = Math.sqrt(
                Math.pow(planet.x - centerX, 2) + 
                Math.pow(planet.y - centerY, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                centerPlanet = planet;
            }
        });

        if (centerPlanet) {
            // Add visual highlight to center planet
            centerPlanet.element.style.filter = 'drop-shadow(0 0 10px gold)';
            centerPlanet.isHillPlanet = true;
        }
    },

    // Add mode info to debug
    debugModeInfo() {
        console.log('Current Mode:', BalanceConfig.currentMode);
        console.log('Applied Settings:', BalanceConfig.getCurrentSettings());
        BalanceConfig.debugCurrentSettings();
    }
};

// Extend existing UI
if (window.UI) {
    // Add mode-aware updates to existing UI update cycle
    const originalUpdate = UI.update;
    UI.update = function() {
        originalUpdate.call(this);
        UIExtensions.updateModeStatus();
    };

    // Initialize mode-specific UI when game starts
    UI.initModeUI = function() {
        UIExtensions.updateShortcutsInfo();
        UIExtensions.highlightCenterPlanet();
    };
}

window.UIExtensions = UIExtensions;