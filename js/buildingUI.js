// Building UI - OPCIÓN A - Complete context menu prevention for all player planets
const BuildingUI = {
    
    currentPlanet: null,
    menuVisible: false,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        console.log('🖥️ Initializing Building UI - Complete context menu prevention...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
        
        this.initialized = true;
    },

    // FIXED: Complete context menu prevention for entire game area
    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('❌ Canvas not found for BuildingUI');
            return;
        }

        console.log('🖥️ Setting up complete context menu prevention...');

        // FIXED: Use mousedown with button detection
        canvas.addEventListener('mousedown', (event) => {
            // Check if it's right-click (button 2)
            if (event.button === 2) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                console.log('🖱️ RIGHT MOUSEDOWN DETECTED!', {
                    clientX: event.clientX,
                    clientY: event.clientY,
                    button: event.button,
                    target: event.target.tagName
                });
                
                this.handleRightClick(event);
                return false; // Extra prevention
            }
        }, true); // Use capture phase for better event interception

        // FIXED: Multiple context menu prevention layers
        
        // Layer 1: Canvas level
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            console.log('🚫 Canvas context menu prevented');
            return false;
        }, true);

        // Layer 2: Document level for the entire game area
        document.addEventListener('contextmenu', (event) => {
            // Check if we're in the game area (canvas or its children)
            const gameContainer = document.querySelector('.game-container');
            const canvas = document.getElementById('gameCanvas');
            
            if (event.target === canvas || 
                event.target.closest('#gameCanvas') ||
                event.target.closest('.game-container')) {
                
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('🚫 Document-level context menu prevented for game area');
                return false;
            }
        }, true);

        // Layer 3: Specific prevention for SVG elements (planets)
        document.addEventListener('contextmenu', (event) => {
            // Check if target is an SVG element (planet)
            if (event.target.tagName === 'circle' || 
                event.target.tagName === 'text' ||
                event.target.closest('svg')) {
                
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('🚫 SVG element context menu prevented');
                return false;
            }
        }, true);

        // Layer 4: Body level backup (last resort)
        document.body.addEventListener('contextmenu', (event) => {
            // Only prevent if we're over game elements
            if (event.target.closest('#gameCanvas') || 
                event.target.closest('.game-container') ||
                event.target.id === 'gameCanvas') {
                
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('🚫 Body-level context menu prevented for game elements');
                return false;
            }
        }, true);

        // Click to close building menu
        document.addEventListener('click', (event) => {
            if (this.menuVisible && !event.target.closest('.building-menu')) {
                console.log('🔒 Closing building menu due to outside click');
                this.hideBuildingMenu();
            }
        });
        
        console.log('✅ Complete context menu prevention setup - 4 layers active');
    },

    // FIXED: Handle right-click with proper coordinate detection
    handleRightClick(event) {
        console.log('🖱️ HandleRightClick called with event:', {
            clientX: event.clientX,
            clientY: event.clientY,
            button: event.button,
            type: event.type,
            timeStamp: event.timeStamp
        });
        
        // Use proper SVG coordinate transformation
        const svg = document.getElementById('gameCanvas');
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        
        const transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
        const gameX = transformed.x;
        const gameY = transformed.y;
        
        console.log('🎯 Coordinate conversion:', {
            screen: { x: event.clientX, y: event.clientY },
            game: { x: gameX.toFixed(1), y: gameY.toFixed(1) }
        });
        
        // Find clicked planet using the SAME method as InputManager
        const planet = this.findPlanetAt(gameX, gameY);
        
        console.log('🪐 Planet search result:', {
            found: !!planet,
            planetId: planet ? planet.id : 'none',
            owner: planet ? planet.owner : 'none',
            ships: planet ? planet.ships : 'N/A'
        });
        
        if (planet && planet.owner === 'player') {
            console.log('🏗️ SHOWING BUILDING MENU for player planet', planet.id);
            this.showBuildingMenu(planet, event.clientX, event.clientY);
        } else {
            console.log('❌ NOT showing menu:', {
                reason: !planet ? 'No planet found' : 
                       planet.owner !== 'player' ? `Planet owned by ${planet.owner}` : 'Unknown'
            });
            this.hideBuildingMenu();
        }
    },

    // Use SAME planet detection as InputManager
    findPlanetAt(x, y) {
        if (!GameEngine || !GameEngine.planets) {
            console.warn('❌ No GameEngine or planets available');
            return null;
        }
        
        console.log(`🔍 Searching for planet at (${x.toFixed(1)}, ${y.toFixed(1)}) among ${GameEngine.planets.length} planets`);
        
        let closestPlanet = null;
        let closestDistance = Infinity;
        
        GameEngine.planets.forEach((planet, index) => {
            const dx = planet.x - x;
            const dy = planet.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // SAME tolerance as InputManager for consistency
            const tolerance = Math.max(planet.radius + 15, 30);
            
            if (distance <= tolerance && distance < closestDistance) {
                closestDistance = distance;
                closestPlanet = planet;
                console.log(`🎯 Found planet: ${planet.id} at distance ${distance.toFixed(1)}, owner: ${planet.owner}`);
            }
        });
        
        console.log('🔍 Search complete:', {
            found: !!closestPlanet,
            planetId: closestPlanet ? closestPlanet.id : 'none',
            owner: closestPlanet ? closestPlanet.owner : 'none',
            finalDistance: closestDistance !== Infinity ? closestDistance.toFixed(1) : 'N/A'
        });
        
        return closestPlanet;
    },

    // Show building menu
    showBuildingMenu(planet, screenX, screenY) {
        console.log('🏗️ Creating building menu for planet', planet.id, 'at screen position', screenX, screenY);
        
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
        console.log('✅ Building menu displayed successfully at', x, y);
    },

    // Create building menu DOM
    createBuildingMenu(planet) {
        console.log('🏗️ Creating building menu DOM for planet', planet.id);
        
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

        // Planet header - FIXED: Convert planet.id to string
        const header = document.createElement('div');
        header.style.cssText = `
            color: #00ff88;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #00ff88;
            padding-bottom: 5px;
        `;
        header.textContent = `PLANETA ${String(planet.id).toUpperCase()} - CONSTRUCCIÓN`;
        menu.appendChild(header);

        // Planet info - OPCIÓN A specific
        const info = document.createElement('div');
        info.style.marginBottom = '15px';
        info.style.fontSize = '11px';
        info.style.color = '#ccc';
        
        const completedBuildings = BuildingManager ? BuildingManager.getCompletedBuildings(planet) : [];
        const constructing = BuildingManager ? BuildingManager.getConstructionQueue(planet) : [];
        
        info.innerHTML = `
            Naves: ${planet.ships}/${planet.capacity} (Regeneración: GRATIS)<br>
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
        
        const metal = ResourceManager ? ResourceManager.getMetal() : 0;
        const energy = ResourceManager ? ResourceManager.getEnergy() : 0;
        
        resourceInfo.innerHTML = `
            🔩 Metal: ${metal} | ⚡ Energy: ${energy}<br>
            <small style="color: #ffa500">Envío de flotas: 1 metal/nave</small>
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

        // Add buildings if Buildings object exists
        if (typeof Buildings !== 'undefined') {
            Buildings.getAllTypes().forEach(buildingId => {
                const buildingOption = this.createBuildingOption(planet, buildingId);
                menu.appendChild(buildingOption);
            });
        } else {
            const errorMsg = document.createElement('div');
            errorMsg.style.color = '#ff6666';
            errorMsg.textContent = 'Error: Buildings system not loaded';
            menu.appendChild(errorMsg);
        }

        console.log('✅ Building menu DOM created successfully');
        return menu;
    },

    // Create building option button
    createBuildingOption(planet, buildingId) {
        const building = Buildings.getDefinition(buildingId);
        if (!building) {
            console.error('❌ Building definition not found for', buildingId);
            return document.createElement('div');
        }
        
        const playerResources = BuildingManager ? BuildingManager.getPlayerResources() : { metal: 0, energy: 0 };
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
                console.log(`🏗️ User clicked to build ${building.name} on planet ${planet.id}`);
                
                if (BuildingManager && BuildingManager.startConstruction) {
                    if (BuildingManager.startConstruction(planet, buildingId)) {
                        console.log('✅ Construction started successfully');
                        this.hideBuildingMenu();
                    } else {
                        console.log('❌ Failed to start construction');
                    }
                } else {
                    console.error('❌ BuildingManager not available');
                }
            });
        }

        return option;
    },

    // Hide building menu
    hideBuildingMenu() {
        const existingMenu = document.querySelector('.building-menu');
        if (existingMenu) {
            existingMenu.remove();
            console.log('🔒 Building menu removed');
        }
        
        this.menuVisible = false;
        this.currentPlanet = null;
    },

    // Update planet buildings display (called by BuildingManager)
    updatePlanetBuildings(planet) {
        console.log('🔄 Updating building display for planet', planet.id);
        
        // If the menu is open for this planet, refresh it
        if (this.menuVisible && this.currentPlanet === planet) {
            const existingMenu = document.querySelector('.building-menu');
            if (existingMenu) {
                const rect = existingMenu.getBoundingClientRect();
                this.hideBuildingMenu();
                this.showBuildingMenu(planet, rect.left, rect.top);
            }
        }
    }
};

// Make available globally
window.BuildingUI = BuildingUI;