    init() {
        console.log('🚀 Initializing Game Engine V1.3...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        
        // V1.3: Apply fast-paced balance
        BALANCE.applyFastSettings();
        
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        Animations.init();
        
        // V1.3: Initialize game mode and enhanced AI
        GameModes.init('blitz');
        EnhancedAI.init();
        
        UI.init();
        InputManager.init();
        this.start();
    }

    assignInitialPlanets() {
        // V1.3: More starting ships for fast gameplay
        this.planets[0].owner = 'player';
        this.planets[0].ships = BALANCE.PLANET_BALANCE.START_SHIPS;
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
            furthestPlanet.ships = BALANCE.PLANET_BALANCE.START_SHIPS;
            furthestPlanet.updateVisual();
        }
        
        console.log('🎯 Initial planets assigned with fast-game balance');
    }

    update(deltaTime) {
        this.planets.forEach(planet => planet.update(deltaTime));
        FleetManager.update();
        Animations.update();
        
        // V1.3: Enhanced AI and game modes
        EnhancedAI.update();
        GameModes.update();
        
        UI.updateStats();
        
        // V1.3: Enhanced win conditions
        if (!GameModes.checkWinConditions()) {
            this.checkGameEnd();
        }
    }