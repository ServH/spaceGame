// Lazy Loading Manager - Load systems on demand
const LazyLoader = {
    loadedModules: new Set(),
    loadingPromises: new Map(),
    
    // Module definitions with dependencies
    modules: {
        'buildings': {
            path: 'src/systems/buildings.js',
            dependencies: ['config']
        },
        'buildingManager': {
            path: 'src/systems/buildingManager.js',
            dependencies: ['buildings', 'resourceManager']
        },
        'ai': {
            path: 'src/systems/ai.js',
            dependencies: ['config', 'resourceManager']
        },
        'animations': {
            path: 'src/ui/animations.js',
            dependencies: []
        }
    },
    
    async loadModule(moduleName) {
        // Return if already loaded
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve();
        }
        
        // Return existing promise if already loading
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }
        
        const moduleConfig = this.modules[moduleName];
        if (!moduleConfig) {
            throw new Error(`Module ${moduleName} not found`);
        }
        
        // Load dependencies first
        const dependencyPromises = moduleConfig.dependencies.map(dep => 
            this.loadModule(dep)
        );
        
        const loadPromise = Promise.all(dependencyPromises)
            .then(() => this.loadScript(moduleConfig.path))
            .then(() => {
                this.loadedModules.add(moduleName);
                this.loadingPromises.delete(moduleName);
                console.log(`📦 Lazy loaded: ${moduleName}`);
            })
            .catch(error => {
                this.loadingPromises.delete(moduleName);
                throw error;
            });
        
        this.loadingPromises.set(moduleName, loadPromise);
        return loadPromise;
    },
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    // Preload critical modules
    async preloadCritical() {
        const criticalModules = ['buildings', 'ai'];
        
        try {
            await Promise.all(criticalModules.map(module => 
                this.loadModule(module)
            ));
            console.log('✅ Critical modules preloaded');
        } catch (error) {
            console.error('❌ Failed to preload critical modules:', error);
        }
    },
    
    // Load modules when needed
    async loadOnDemand(feature) {
        const featureModules = {
            'building': ['buildings', 'buildingManager'],
            'combat': ['ai'],
            'effects': ['animations']
        };
        
        const modules = featureModules[feature] || [];
        
        try {
            await Promise.all(modules.map(module => 
                this.loadModule(module)
            ));
            console.log(`✅ Loaded modules for feature: ${feature}`);
        } catch (error) {
            console.error(`❌ Failed to load modules for ${feature}:`, error);
        }
    },
    
    getLoadedModules() {
        return Array.from(this.loadedModules);
    },
    
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
};

// Update Game.js to integrate lazy loading
if (typeof Game !== 'undefined') {
    const originalInitializeGame = Game.initializeGame;
    
    Game.initializeGame = async function() {
        console.log('⚙️ Starting game with lazy loading...');
        
        // Preload critical modules
        await LazyLoader.preloadCritical();
        
        // Call original initialization
        originalInitializeGame.call(this);
        
        console.log('✅ Game initialized with lazy loading');
    };
}