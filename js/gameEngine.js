    init(selectedMode = 'classic') {
        console.log(`🚀 Initializing Game Engine V1.3 - ${selectedMode} mode`);
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        
        // Apply mode-specific balance
        BalanceConfig.applyMode(selectedMode);
        
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        Animations.init();
        GameModes.init(selectedMode);
        EnhancedAI.init();
        
        UI.init();
        InputManager.init();
        this.start();
    }

    assignInitialPlanets() {
        const settings = BalanceConfig.getCurrentSettings();
        
        this.planets[0].owner = 'player';
        this.planets[0].ships = settings.startShips;
        this.planets[0].updateVisual();
        
        let furthestPlanet = null;
        let maxDistance = 0;
        
        for (let i = 1; i < this.planets.length; i++) {
            const distance = Utils.distance(this.planets[0], this.planets[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPlanet = this.planets[i];
            }
        }
        
        if (furthestPlanet) {
            furthestPlanet.owner = 'ai';
            furthestPlanet.ships = settings.startShips;
            furthestPlanet.updateVisual();
        }
        
        console.log(`🎯 ${BalanceConfig.currentMode} mode initialized - ${settings.startShips} starting ships`);
    }