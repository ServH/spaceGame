// Building UI - ULTRA SIMPLIFIED - Direct HTML approach for absolute control
const BuildingUI = {
    
    currentPlanet: null,
    menuVisible: false,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        console.log('🖥️ Initializing Building UI - ULTRA SIMPLIFIED APPROACH...');
        
        // Immediate setup - no waiting
        this.setupEventListeners();
        
        this.initialized = true;
    },

    // ULTRA SIMPLIFIED: Direct approach with immediate effect
    setupEventListeners() {
        console.log('🖥️ Setting up ULTRA SIMPLIFIED BuildingUI...');

        // APPROACH 1: Document level with immediate prevention
        document.addEventListener('contextmenu', (event) => {
            const canvas = document.getElementById('gameCanvas');
            if (event.target === canvas || event.target.closest('#gameCanvas') || event.target.closest('svg')) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('🚫 DOCUMENT: Context menu prevented');
                return false;
            }
        }, true);

        // APPROACH 2: Body level backup
        document.body.addEventListener('contextmenu', (event) => {
            if (event.target.closest('#gameCanvas') || event.target.tagName === 'circle' || event.target.tagName === 'text') {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('🚫 BODY: Context menu prevented');
                return false;
            }
        }, true);

        // APPROACH 3: Window level ultimate backup
        window.addEventListener('contextmenu', (event) => {
            if (event.target.closest('#gameCanvas') || event.target.id === 'gameCanvas') {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('🚫 WINDOW: Context menu prevented');
                return false;
            }
        }, true);

        // Mouse handler for building menu
        document.addEventListener('mousedown', (event) => {
            if (event.button === 2) { // Right click
                const canvas = document.getElementById('gameCanvas');
                if (event.target === canvas || event.target.closest('#gameCanvas')) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    
                    console.log('🖱️ MOUSEDOWN: Right-click detected');
                    this.handleRightClick(event);
                    return false;
                }
            }
        }, true);

        // Click to close building menu
        document.addEventListener('click', (event) => {
            if (this.menuVisible && !event.target.closest('.building-menu')) {
                this.hideBuildingMenu();
            }
        });
        
        console.log('✅ ULTRA SIMPLIFIED BuildingUI setup complete');
    },

    // Handle right-click with coordinate detection
    handleRightClick(event) {
        console.log('🖱️ HandleRightClick:', { x: event.clientX, y: event.clientY });
        
        // Use SVG coordinate transformation
        const svg = document.getElementById('gameCanvas');
        if (!svg) return;
        
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        
        const transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
        const gameX = transformed.x;
        const gameY = transformed.y;
        
        console.log('🎯 Game coordinates:', { x: gameX.toFixed(1), y: gameY.toFixed(1) });
        
        // Find planet
        const planet = this.findPlanetAt(gameX, gameY);
        
        if (planet && planet.owner === 'player') {
            console.log('🏗️ SHOWING MENU for player planet', planet.id);
            this.showBuildingMenu(planet, event.clientX, event.clientY);
        } else {
            console.log('❌ NOT showing menu:', planet ? `owner: ${planet.owner}` : 'no planet');
            this.hideBuildingMenu();
        }
    },

    // Find planet at coordinates
    findPlanetAt(x, y) {
        if (!GameEngine || !GameEngine.planets) return null;
        
        let closestPlanet = null;
        let closestDistance = Infinity;
        
        GameEngine.planets.forEach(planet => {
            const dx = planet.x - x;
            const dy = planet.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const tolerance = Math.max(planet.radius + 15, 30);
            
            if (distance <= tolerance && distance < closestDistance) {
                closestDistance = distance;
                closestPlanet = planet;
            }
        });
        
        return closestPlanet;
    },

    // Show building menu
    showBuildingMenu(planet, screenX, screenY) {
        console.log('🏗️ Creating menu for planet', planet.id);
        
        this.currentPlanet = planet;
        this.hideBuildingMenu();
        
        const menu = this.createBuildingMenu(planet);
        document.body.appendChild(menu);
        
        // Position menu
        const rect = menu.getBoundingClientRect();
        let x = Math.min(screenX, window.innerWidth - rect.width - 10);
        let y = Math.min(screenY, window.innerHeight - rect.height - 10);
        
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        
        this.menuVisible = true;
        console.log('✅ Menu displayed at', x, y);
    },

    // Create building menu DOM
    createBuildingMenu(planet) {
        const menu = document.createElement('div');
        menu.className = 'building-menu';
        
        // Ultra-secure styling to prevent any context menu
        menu.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ff88;
            border-radius: 8px;
            padding: 15px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 9999;
            min-width: 280px;
            box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            pointer-events: auto;
        `;

        // Prevent context menu on the menu itself
        menu.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            color: #00ff88;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #00ff88;
            padding-bottom: 5px;
        `;
        header.textContent = `PLANETA ${String(planet.id)} - CONSTRUCCIÓN`;
        menu.appendChild(header);

        // Planet info
        const info = document.createElement('div');
        info.style.cssText = 'margin-bottom: 15px; font-size: 11px; color: #ccc;';
        
        const completedBuildings = BuildingManager ? BuildingManager.getCompletedBuildings(planet) : [];
        const constructing = BuildingManager ? BuildingManager.getConstructionQueue(planet) : [];
        
        info.innerHTML = `
            Naves: ${planet.ships}/${planet.capacity} (Regeneración: GRATIS)<br>
            Edificios: ${completedBuildings.length}/3<br>
            Construyendo: ${constructing.length}
        `;
        menu.appendChild(info);

        // Resources
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
        
        resourceInfo.innerHTML = `🔩 Metal: ${metal} | ⚡ Energy: ${energy}`;
        menu.appendChild(resourceInfo);

        // Buildings title
        const buildingsTitle = document.createElement('div');
        buildingsTitle.style.cssText = 'color: #00ff88; font-weight: bold; margin-bottom: 8px;';
        buildingsTitle.textContent = 'EDIFICIOS DISPONIBLES:';
        menu.appendChild(buildingsTitle);

        // Add buildings
        if (typeof Buildings !== 'undefined') {
            Buildings.getAllTypes().forEach(buildingId => {
                const buildingOption = this.createBuildingOption(planet, buildingId);
                menu.appendChild(buildingOption);
            });
        }

        return menu;
    },

    // Create building option
    createBuildingOption(planet, buildingId) {
        const building = Buildings.getDefinition(buildingId);
        if (!building) return document.createElement('div');
        
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
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
        `;

        // Prevent context menu on building options
        option.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

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
                console.log(`🏗️ Building ${building.name} on planet ${planet.id}`);
                
                if (BuildingManager && BuildingManager.startConstruction) {
                    if (BuildingManager.startConstruction(planet, buildingId)) {
                        console.log('✅ Construction started');
                        this.hideBuildingMenu();
                    }
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
            console.log('🔒 Menu removed');
        }
        
        this.menuVisible = false;
        this.currentPlanet = null;
    },

    // Update planet buildings display
    updatePlanetBuildings(planet) {
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