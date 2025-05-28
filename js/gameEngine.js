    init() {
        console.log('🚀 Initializing Game Engine...');
        this.canvas = document.getElementById('gameCanvas');
        this.setupCanvas();
        this.generatePlanets();
        this.assignInitialPlanets();
        this.assignKeyboardShortcuts();
        
        // V1.2: Initialize animation system
        Animations.init();
        
        UI.init();
        InputManager.init();
        AI.init();
        this.start();
    }

    update(deltaTime) {
        // Update planets
        this.planets.forEach(planet => planet.update(deltaTime));
        
        // Update fleets
        FleetManager.update();
        
        // V1.2: Update animations
        Animations.update();
        
        // Update AI
        AI.update();
        
        // Update UI stats
        UI.updateStats();
        
        // Check game end
        this.checkGameEnd();
    }