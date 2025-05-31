// Keyboard Handler - SELECT + TARGET System
const KeyboardHandler = {
    init() {
        this.setupEventListeners();
        console.log('⌨️ Keyboard Handler initialized - SELECT + TARGET system');
    },

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    },

    handleKeyDown(e) {
        // Skip if user is typing in input fields
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName.toLowerCase() === 'input' || 
            activeElement.tagName.toLowerCase() === 'textarea' ||
            activeElement.contentEditable === 'true'
        )) {
            return;
        }
        
        const key = e.key.toLowerCase();
        
        // Handle planet selection/targeting
        if (this.handlePlanetKeys(key, e)) {
            return;
        }
        
        // Handle debug keys
        if (e.ctrlKey) {
            this.handleDebugKeys(key, e);
        }
    },

    handlePlanetKeys(key, e) {
        if (!CONFIG?.KEYBOARD?.assignments || typeof CONFIG.KEYBOARD.assignments !== 'object') {
            return false;
        }

        const planetId = CONFIG.KEYBOARD.assignments[key];
        
        if (typeof planetId === 'undefined' || 
            typeof GameEngine === 'undefined' || 
            !Array.isArray(GameEngine.planets)) {
            return false;
        }
        
        const planet = GameEngine.planets.find(p => p && p.id === planetId);
        
        if (!planet) return false;
        
        if (planet.owner === 'player') {
            // Select own planet
            InputManager.selectPlanet(planet);
            console.log(`⌨️ Selected planet ${planet.id} (${planet.assignedKey?.toUpperCase()}) via key '${key.toUpperCase()}'`);
            e.preventDefault();
            return true;
        } else if (InputManager.selectedPlanet && InputManager.selectedPlanet.owner === 'player') {
            // Target enemy/neutral planet if we have a selected planet
            console.log(`⌨️ Target planet ${planet.id} (${planet.assignedKey?.toUpperCase()}) from selected planet ${InputManager.selectedPlanet.id}`);
            InputManager.attemptFleetSend(InputManager.selectedPlanet, planet);
            e.preventDefault();
            return true;
        }
        
        return false;
    },

    handleDebugKeys(key, e) {
        switch (key) {
            case 'e':
                if (typeof ResourceManager !== 'undefined') {
                    ResourceManager.debugInfo();
                    e.preventDefault();
                }
                break;
            case 'r':
                if (typeof ResourceManager !== 'undefined') {
                    ResourceManager.debugAddEnergy(50);
                    InputManager.showFeedback('Debug: +50 energía', 'info');
                    e.preventDefault();
                }
                break;
            case 'k':
                this.debugKeyboardStatus();
                e.preventDefault();
                break;
        }
    },

    debugKeyboardStatus() {
        console.log('⌨️ Keyboard Status:');
        if (GameEngine?.planets) {
            GameEngine.planets.forEach(p => {
                if (p.assignedKey) {
                    const owner = p.owner === 'player' ? '🟢' : p.owner === 'ai' ? '🔴' : '⚪';
                    console.log(`  ${p.assignedKey.toUpperCase()} → Planet ${p.id} ${owner}`);
                }
            });
            if (InputManager.selectedPlanet) {
                console.log(`  Selected: Planet ${InputManager.selectedPlanet.id} (${InputManager.selectedPlanet.assignedKey?.toUpperCase()})`);
            }
        }
    }
};