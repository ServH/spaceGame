// Building UI - Action 02 FIXED - Ensure proper initialization and right-click functionality
const BuildingUI = {
    
    currentPlanet: null,
    menuVisible: false,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        console.log('🖥️ Initializing Building UI...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
        
        this.initialized = true;
    },

    // Setup event listeners for building UI
    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('❌ Canvas not found for BuildingUI');
            return;
        }

        // Right-click to open building menu
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.handleRightClick(event);
        });

        // Click to close building menu
        document.addEventListener('click', (event) => {
            if (this.menuVisible && !event.target.closest('.building-menu')) {
                this.hideBuildingMenu();
            }
        });
        
        console.log('✅ Building UI event listeners setup complete');
    },

    // Handle right-click on canvas
    handleRightClick(event) {
        console.log('🖱️ Right-click detected at', event.clientX, event.clientY);
        
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert screen coordinates to game coordinates
        const gameX = (x / rect.width) * 800;
        const gameY = (y / rect.height) * 600;
        
        console.log('🎯 Converted coordinates:', gameX, gameY);
        
        // Find clicked planet
        const planet = this.findPlanetAt(gameX, gameY);
        
        console.log('🪐 Found planet:', planet ? `ID: ${planet.id}, Owner: ${planet.owner}` : 'None');
        
        if (planet && planet.owner === 'player') {
            console.log('🏗️ Showing building menu for player planet', planet.id);
            this.showBuildingMenu(planet, event.clientX, event.clientY);
        } else {
            console.log('❌ Not a player planet or no planet found');
            this.hideBuildingMenu();
        }
    },

    // Find planet at coordinates
    findPlanetAt(x, y) {
        if (!GameEngine || !GameEngine.planets) return null;
        
        return GameEngine.planets.find(planet => {
            const distance = Math.sqrt(Math.pow(planet.x - x, 2) + Math.pow(planet.y - y, 2));
            return distance <= planet.radius + 15; // Add some tolerance
        });
    },

    // Show building menu
    showBuildingMenu(planet, screenX, screenY) {
        this.currentPlanet = planet;
        this.hideBuildingMenu(); // Close any existing menu
        
        const menu = this.createBuildingMenu(planet);
        document.body.appendChild(menu);
        
        // Position menu
        const rect = menu.getBoundingClientRect();
        let x = screenX;
        let y = screenY;
        
        // Keep menu on screen
        if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width - 10;
        }
        if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height - 10;
        }
        
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        
        this.menuVisible = true;
        console.log('✅ Building menu displayed');
    },

    // Create building menu DOM
    createBuildingMenu(planet) {
        const menu = document.createElement('div');
        menu.className = 'building-menu';
        menu.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ff88;
            border-radius: 8px;
            padding: 15px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 2000;
            min-width: 280px;
            box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
        `;

        // Planet header
        const header = document.createElement('div');
        header.style.cssText = `
            color: #00ff88;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #00ff88;
            padding-bottom: 5px;
        `;
        header.textContent = `PLANETA ${planet.id.toUpperCase()}`;
        menu.appendChild(header);

        // Planet info
        const info = document.createElement('div');
        info.style.marginBottom = '15px';
        info.style.fontSize = '11px';
        info.style.color = '#ccc';
        
        const completedBuildings = BuildingManager.getCompletedBuildings(planet);
        const constructing = BuildingManager.getConstructionQueue(planet);
        
        info.innerHTML = `
            Naves: ${planet.ships}/${planet.capacity}<br>
            Edificios: ${completedBuildings.length}/3<br>
            Construyendo: ${constructing.length}
        `;
        menu.appendChild(info);

        // Current resources
        const resourceInfo = document.createElement('div');
        resourceInfo.style.cssText = `
            background: rgba(0, 255, 136, 0.1);
            padding: 5px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 11px;
        `;
        resourceInfo.innerHTML = `
            🔩 Metal: ${ResourceManager.getMetal()} | ⚡ Energy: ${ResourceManager.getEnergy()}
        `;
        menu.appendChild(resourceInfo);

        // Available buildings
        const buildingsTitle = document.createElement('div');
        buildingsTitle.style.cssText = `
            color: #00ff88;
            font-weight: bold;
            margin-bottom: 8px;
        `;
        buildingsTitle.textContent = 'EDIFICIOS DISPONIBLES:';
        menu.appendChild(buildingsTitle);

        // Building options
        Buildings.getAllTypes().forEach(buildingId => {
            const buildingOption = this.createBuildingOption(planet, buildingId);
            menu.appendChild(buildingOption);
        });

        // Current constructions
        if (constructing.length > 0) {
            const constructionTitle = document.createElement('div');
            constructionTitle.style.cssText = `
                color: #ffa500;
                font-weight: bold;
                margin: 15px 0 8px 0;
                border-top: 1px solid #444;
                padding-top: 10px;
            `;
            constructionTitle.textContent = 'EN CONSTRUCCIÓN:';
            menu.appendChild(constructionTitle);

            constructing.forEach(construction => {
                const constructionItem = this.createConstructionItem(planet, construction);
                menu.appendChild(constructionItem);
            });
        }

        // Completed buildings
        if (completedBuildings.length > 0) {
            const completedTitle = document.createElement('div');
            completedTitle.style.cssText = `
                color: #90ee90;
                font-weight: bold;
                margin: 15px 0 8px 0;
                border-top: 1px solid #444;
                padding-top: 10px;
            `;
            completedTitle.textContent = 'EDIFICIOS COMPLETADOS:';
            menu.appendChild(completedTitle);

            completedBuildings.forEach(building => {
                const buildingItem = this.createCompletedBuildingItem(building);
                menu.appendChild(buildingItem);
            });
        }

        return menu;
    },

    // Create building option button
    createBuildingOption(planet, buildingId) {
        const building = Buildings.getDefinition(buildingId);
        const playerResources = BuildingManager.getPlayerResources();
        const canAfford = Buildings.canAfford(buildingId, playerResources);
        const canBuild = Buildings.canBuildOnPlanet(buildingId, planet);
        const enabled = canAfford && canBuild;

        const option = document.createElement('div');
        option.style.cssText = `
            margin-bottom: 8px;
            padding: 8px;
            border: 1px solid ${enabled ? '#00ff88' : '#666'};
            border-radius: 4px;
            cursor: ${enabled ? 'pointer' : 'not-allowed'};
            background: ${enabled ? 'rgba(0, 255, 136, 0.1)' : 'rgba(102, 102, 102, 0.1)'};
            color: ${enabled ? 'white' : '#999'};
            transition: background 0.2s;
        `;

        option.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 3px;">
                ${building.icon} ${building.name}
            </div>
            <div style="font-size: 10px; color: #ccc; margin-bottom: 3px;">
                ${building.description}
            </div>
            <div style="font-size: 10px;">
                Coste: ${Buildings.getCostString(buildingId)} | Tiempo: ${Buildings.getBuildTimeString(buildingId)}
            </div>
        `;

        if (enabled) {
            option.addEventListener('mouseover', () => {
                option.style.background = 'rgba(0, 255, 136, 0.2)';
            });
            
            option.addEventListener('mouseout', () => {
                option.style.background = 'rgba(0, 255, 136, 0.1)';
            });

            option.addEventListener('click', () => {
                console.log(`🏗️ Attempting to build ${building.name} on planet ${planet.id}`);
                if (BuildingManager.startConstruction(planet, buildingId)) {
                    console.log('✅ Construction started successfully');
                    this.hideBuildingMenu();
                } else {
                    console.log('❌ Failed to start construction');
                }
            });
        }

        // Show reason if can't build
        if (!canBuild && canAfford) {
            const reason = document.createElement('div');
            reason.style.cssText = 'font-size: 9px; color: #ff6666; margin-top: 3px;';
            
            if (planet.buildings && planet.buildings[buildingId] && planet.buildings[buildingId].level > 0) {
                reason.textContent = 'Ya construido';
            } else {
                reason.textContent = 'Sin espacio (máx. 3 edificios)';
            }
            
            option.appendChild(reason);
        }

        return option;
    },

    // Create construction progress item
    createConstructionItem(planet, construction) {
        const item = document.createElement('div');
        item.style.cssText = `
            margin-bottom: 6px;
            padding: 6px;
            background: rgba(255, 165, 0, 0.1);
            border-left: 3px solid #ffa500;
            border-radius: 3px;
        `;

        const timeRemaining = Math.ceil((construction.buildTime - (Date.now() - construction.startTime)) / 1000);
        
        item.innerHTML = `
            <div style="font-weight: bold; font-size: 11px;">
                ${construction.definition.icon} ${construction.definition.name}
            </div>
            <div style="font-size: 10px; color: #ccc; margin: 3px 0;">
                Progreso: ${Math.round(construction.progress)}% | ${Math.max(0, timeRemaining)}s restantes
            </div>
            <div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
                <div style="
                    background: linear-gradient(90deg, #ffa500, #ff6600);
                    height: 100%;
                    width: ${construction.progress}%;
                    transition: width 0.3s;
                "></div>
            </div>
        `;

        // Add cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.style.cssText = `
            background: #ff4444;
            color: white;
            border: none;
            padding: 2px 6px;
            font-size: 9px;
            border-radius: 2px;
            cursor: pointer;
            margin-top: 5px;
        `;
        
        cancelBtn.addEventListener('click', () => {
            if (BuildingManager.cancelConstruction(planet, construction.buildingId)) {
                this.hideBuildingMenu();
            }
        });
        
        item.appendChild(cancelBtn);

        return item;
    },

    // Create completed building item
    createCompletedBuildingItem(building) {
        const item = document.createElement('div');
        item.style.cssText = `
            margin-bottom: 6px;
            padding: 6px;
            background: rgba(144, 238, 144, 0.1);
            border-left: 3px solid #90ee90;
            border-radius: 3px;
        `;

        item.innerHTML = `
            <div style="font-weight: bold; font-size: 11px;">
                ${building.definition.icon} ${building.definition.name} (Nv.${building.level})
            </div>
            <div style="font-size: 10px; color: #ccc;">
                ${building.definition.description}
            </div>
        `;

        return item;
    },

    // Hide building menu
    hideBuildingMenu() {
        const existingMenu = document.querySelector('.building-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        this.menuVisible = false;
        this.currentPlanet = null;
        console.log('🔒 Building menu hidden');
    },

    // Update planet buildings display (called by BuildingManager)
    updatePlanetBuildings(planet) {
        // If the menu is open for this planet, refresh it
        if (this.menuVisible && this.currentPlanet === planet) {
            // Get current menu position
            const existingMenu = document.querySelector('.building-menu');
            if (existingMenu) {
                const rect = existingMenu.getBoundingClientRect();
                this.hideBuildingMenu();
                this.showBuildingMenu(planet, rect.left, rect.top);
            }
        }
        
        // Update visual indicators on the planet
        this.updatePlanetVisualIndicators(planet);
    },

    // Update visual indicators on planet
    updatePlanetVisualIndicators(planet) {
        if (!planet.element) return;

        // Remove existing building indicators
        const existingIndicators = planet.element.parentNode.querySelectorAll(`.building-indicator[data-planet="${planet.id}"]`);
        existingIndicators.forEach(indicator => indicator.remove());

        // Add building indicators
        const completedBuildings = BuildingManager.getCompletedBuildings(planet);
        const constructing = BuildingManager.getConstructionQueue(planet);

        // Show completed buildings as small icons around planet
        completedBuildings.forEach((building, index) => {
            this.addBuildingIndicator(planet, building.definition, index, 'completed');
        });

        // Show construction progress as pulsing indicator
        if (constructing.length > 0) {
            this.addConstructionIndicator(planet, constructing[0]);
        }
    },

    // Add building indicator to planet
    addBuildingIndicator(planet, building, index, status) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        const angle = (index * 60) * (Math.PI / 180); // Distribute around planet
        const distance = planet.radius + 15;
        const x = planet.x + Math.cos(angle) * distance;
        const y = planet.y + Math.sin(angle) * distance;

        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        indicator.setAttribute('cx', x);
        indicator.setAttribute('cy', y);
        indicator.setAttribute('r', 4);
        indicator.setAttribute('fill', building.visual.color);
        indicator.setAttribute('stroke', 'white');
        indicator.setAttribute('stroke-width', '1');
        indicator.setAttribute('opacity', '0.9');
        indicator.setAttribute('data-planet', planet.id);
        indicator.className = 'building-indicator';
        
        canvas.appendChild(indicator);
    },

    // Add construction indicator to planet
    addConstructionIndicator(planet, construction) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        indicator.setAttribute('cx', planet.x);
        indicator.setAttribute('cy', planet.y);
        indicator.setAttribute('r', planet.radius + 8);
        indicator.setAttribute('fill', 'none');
        indicator.setAttribute('stroke', '#ffa500');
        indicator.setAttribute('stroke-width', '2');
        indicator.setAttribute('stroke-dasharray', '5,5');
        indicator.setAttribute('data-planet', planet.id);
        indicator.className = 'building-indicator construction-indicator';
        
        // Animate construction indicator
        const animate = () => {
            const currentOffset = parseFloat(indicator.getAttribute('stroke-dashoffset') || 0);
            indicator.setAttribute('stroke-dashoffset', currentOffset - 0.5);
        };
        
        const animationInterval = setInterval(animate, 50);
        
        // Stop animation when construction completes
        setTimeout(() => {
            clearInterval(animationInterval);
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, construction.buildTime - (Date.now() - construction.startTime));
        
        canvas.appendChild(indicator);
    }
};

// Make available globally
window.BuildingUI = BuildingUI;