    // FIXED: Complete keyboard system with select + target
    handleKeyDown(e) {
        if (!this.isInitialized) return;
        
        // Only process game keys when not in input fields
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName.toLowerCase() === 'input' || 
            activeElement.tagName.toLowerCase() === 'textarea' ||
            activeElement.contentEditable === 'true'
        )) {
            return;
        }
        
        const key = e.key.toLowerCase();
        
        // Check keyboard assignments with more robust checking
        if (CONFIG?.KEYBOARD?.assignments && typeof CONFIG.KEYBOARD.assignments === 'object') {
            const planetId = CONFIG.KEYBOARD.assignments[key];
            
            if (typeof planetId !== 'undefined' && 
                typeof GameEngine !== 'undefined' && 
                Array.isArray(GameEngine.planets)) {
                
                const planet = GameEngine.planets.find(p => p && p.id === planetId);
                
                if (planet) {
                    // KEYBOARD SELECT + TARGET SYSTEM
                    if (planet.owner === 'player') {
                        // Select own planet
                        this.selectPlanet(planet);
                        console.log(`⌨️ Selected planet ${planet.id} (${planet.assignedKey?.toUpperCase()}) via key '${key.toUpperCase()}'`);
                        e.preventDefault();
                        return;
                    } else if (this.selectedPlanet && this.selectedPlanet.owner === 'player') {
                        // Target enemy/neutral planet if we have a selected planet
                        console.log(`⌨️ Target planet ${planet.id} (${planet.assignedKey?.toUpperCase()}) from selected planet ${this.selectedPlanet.id}`);
                        this.attemptFleetSend(this.selectedPlanet, planet);
                        e.preventDefault();
                        return;
                    }
                }
            }
        }
        
        // Debug keys (Ctrl+key combinations)
        if (e.ctrlKey) {
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
                        this.showFeedback('Debug: +50 energía', 'info');
                        e.preventDefault();
                    }
                    break;
                case 'k':
                    // Show keyboard assignments
                    console.log('⌨️ Keyboard Debug:');
                    console.log('  CONFIG.KEYBOARD.assignments:', CONFIG?.KEYBOARD?.assignments);
                    if (GameEngine?.planets) {
                        console.log('  Planet assignments:');
                        GameEngine.planets.forEach(p => {
                            if (p.assignedKey) {
                                const owner = p.owner === 'player' ? '🟢' : p.owner === 'ai' ? '🔴' : '⚪';
                                console.log(`    ${p.assignedKey.toUpperCase()} → Planet ${p.id} ${owner} at (${p.x.toFixed(0)}, ${p.y.toFixed(0)})`);
                            }
                        });
                        if (this.selectedPlanet) {
                            console.log(`  Selected: Planet ${this.selectedPlanet.id} (${this.selectedPlanet.assignedKey?.toUpperCase()})`);
                        }
                    }
                    e.preventDefault();
                    break;
                case 'i':
                    console.log('🎮 Input Debug:', {
                        initialized: this.isInitialized,
                        selectedPlanet: this.selectedPlanet?.id,
                        hoveredPlanet: this.hoveredPlanet?.id,
                        isDragging: this.isDragging,
                        activeElement: activeElement?.tagName,
                        keyboardAssignments: Object.keys(CONFIG?.KEYBOARD?.assignments || {}).length
                    });
                    e.preventDefault();
                    break;
            }
        }
    },