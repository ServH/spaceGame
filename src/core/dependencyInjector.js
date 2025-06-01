// Dependency Injector - Modular Dependency Management V1.0
// Provides loose coupling between game systems through dependency injection

const DependencyInjector = {
    dependencies: new Map(),
    singletons: new Map(),
    factories: new Map(),
    initializing: new Set(),
    
    init() {
        console.log('🔌 Dependency Injector initialized');
        this.registerCoreDependencies();
    },

    // Register a dependency
    register(name, dependency, options = {}) {
        const config = {
            singleton: options.singleton !== false, // Default to singleton
            factory: options.factory || false,
            lazy: options.lazy || false,
            dependencies: options.dependencies || []
        };
        
        this.dependencies.set(name, {
            value: dependency,
            config,
            initialized: !config.lazy
        });
        
        console.log(`📦 Registered dependency: ${name} (${config.singleton ? 'singleton' : 'instance'})`);
        
        return this;
    },

    // Register a factory function
    registerFactory(name, factoryFn, dependencies = []) {
        this.factories.set(name, {
            factory: factoryFn,
            dependencies
        });
        
        console.log(`🏭 Registered factory: ${name}`);
        return this;
    },

    // Get a dependency
    get(name) {
        // Check if it's a singleton that's already created
        if (this.singletons.has(name)) {
            return this.singletons.get(name);
        }
        
        // Check if it's a registered dependency
        if (this.dependencies.has(name)) {
            return this.resolveDependency(name);
        }
        
        // Check if it's a factory
        if (this.factories.has(name)) {
            return this.resolveFactory(name);
        }
        
        // Try to get from global scope as fallback
        if (typeof window[name] !== 'undefined') {
            console.warn(`⚠️ Dependency '${name}' not registered, using global fallback`);
            return window[name];
        }
        
        throw new Error(`Dependency '${name}' not found`);
    },

    // Resolve a registered dependency
    resolveDependency(name) {
        const dep = this.dependencies.get(name);
        
        if (!dep) {
            throw new Error(`Dependency '${name}' not registered`);
        }
        
        // Prevent circular dependencies
        if (this.initializing.has(name)) {
            throw new Error(`Circular dependency detected: ${name}`);
        }
        
        // If it's a lazy dependency and not initialized, initialize it now
        if (dep.config.lazy && !dep.initialized) {
            this.initializeDependency(name);
        }
        
        // Handle singleton
        if (dep.config.singleton) {
            if (!this.singletons.has(name)) {
                this.singletons.set(name, dep.value);
            }
            return this.singletons.get(name);
        }
        
        // Return new instance for non-singletons
        return dep.value;
    },

    // Resolve a factory
    resolveFactory(name) {
        const factory = this.factories.get(name);
        
        if (!factory) {
            throw new Error(`Factory '${name}' not registered`);
        }
        
        // Resolve factory dependencies
        const resolvedDeps = factory.dependencies.map(depName => this.get(depName));
        
        // Call factory with resolved dependencies
        return factory.factory(...resolvedDeps);
    },

    // Initialize a lazy dependency
    initializeDependency(name) {
        const dep = this.dependencies.get(name);
        
        if (!dep || dep.initialized) return;
        
        this.initializing.add(name);
        
        try {
            // Resolve dependencies first
            const resolvedDeps = dep.config.dependencies.map(depName => this.get(depName));
            
            // Initialize if it has an init method
            if (dep.value && typeof dep.value.init === 'function') {
                dep.value.init(...resolvedDeps);
            }
            
            dep.initialized = true;
            console.log(`✅ Initialized lazy dependency: ${name}`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize dependency '${name}':`, error);
            throw error;
        } finally {
            this.initializing.delete(name);
        }
    },

    // Inject dependencies into an object
    inject(target, dependencies) {
        const injected = {};
        
        Object.entries(dependencies).forEach(([key, depName]) => {
            try {
                injected[key] = this.get(depName);
            } catch (error) {
                console.error(`Failed to inject dependency '${depName}' as '${key}':`, error);
                injected[key] = null;
            }
        });
        
        // Add injected dependencies to target
        Object.assign(target, injected);
        
        return target;
    },

    // Create a module with dependency injection
    createModule(name, moduleFactory, dependencies = []) {
        return this.registerFactory(name, (...deps) => {
            const module = moduleFactory(...deps);
            
            // Auto-inject common dependencies if module has inject method
            if (typeof module.inject === 'function') {
                module.inject(this);
            }
            
            return module;
        }, dependencies);
    },

    // Register core game dependencies
    registerCoreDependencies() {
        console.log('📦 Registering core dependencies...');
        
        // Register core systems that should be available everywhere
        const coreModules = [
            'CONFIG',
            'Utils', 
            'PerformanceManager',
            'EventSystem',
            'StateManager'
        ];
        
        coreModules.forEach(moduleName => {
            if (typeof window[moduleName] !== 'undefined') {
                this.register(moduleName, window[moduleName], {
                    singleton: true,
                    lazy: false
                });
                console.log(`✅ Registered core dependency: ${moduleName}`);
            } else {
                console.warn(`⚠️ Core dependency '${moduleName}' not found in global scope`);
            }
        });
        
        console.log(`📦 Core dependencies registration complete (${this.dependencies.size} registered)`);
    },

    // Enhanced auto-wire with better error handling
    autoWire(module, dependencyMap = {}) {
        if (!module || typeof module !== 'object') return module;
        
        // Default dependency mappings
        const defaultMappings = {
            eventSystem: 'EventSystem',
            stateManager: 'StateManager',
            performanceManager: 'PerformanceManager',
            config: 'CONFIG',
            utils: 'Utils'
        };
        
        const mappings = { ...defaultMappings, ...dependencyMap };
        
        // Inject dependencies
        Object.entries(mappings).forEach(([property, dependencyName]) => {
            if (module[property] === undefined) {
                try {
                    // Try to get from registered dependencies first
                    if (this.has(dependencyName)) {
                        module[property] = this.get(dependencyName);
                    } else {
                        // Fallback to global scope
                        if (typeof window[dependencyName] !== 'undefined') {
                            module[property] = window[dependencyName];
                            // Register it for future use
                            this.register(dependencyName, window[dependencyName], {
                                singleton: true,
                                lazy: false
                            });
                            console.log(`📦 Auto-registered missing dependency: ${dependencyName}`);
                        } else {
                            console.warn(`⚠️ Could not auto-wire '${dependencyName}' to '${property}': Dependency not found`);
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Could not auto-wire '${dependencyName}' to '${property}':`, error.message);
                }
            }
        });
        
        return module;
    },

    // Check if a dependency is available
    has(name) {
        return this.dependencies.has(name) || 
               this.factories.has(name) || 
               this.singletons.has(name) ||
               typeof window[name] !== 'undefined';
    },

    // Get dependency information
    getDependencyInfo(name) {
        if (this.dependencies.has(name)) {
            const dep = this.dependencies.get(name);
            return {
                type: 'dependency',
                singleton: dep.config.singleton,
                lazy: dep.config.lazy,
                initialized: dep.initialized,
                dependencies: dep.config.dependencies
            };
        }
        
        if (this.factories.has(name)) {
            const factory = this.factories.get(name);
            return {
                type: 'factory',
                dependencies: factory.dependencies
            };
        }
        
        if (this.singletons.has(name)) {
            return {
                type: 'singleton',
                initialized: true
            };
        }
        
        return null;
    },

    // Initialize all lazy dependencies
    initializeAll() {
        console.log('🚀 Initializing all dependencies...');
        
        const lazyDeps = Array.from(this.dependencies.entries())
            .filter(([name, dep]) => dep.config.lazy && !dep.initialized)
            .map(([name]) => name);
        
        lazyDeps.forEach(name => {
            try {
                this.initializeDependency(name);
            } catch (error) {
                console.error(`Failed to initialize ${name}:`, error);
            }
        });
        
        console.log(`✅ Initialized ${lazyDeps.length} lazy dependencies`);
    },

    // Reset all dependencies
    reset() {
        console.log('🔄 Resetting Dependency Injector...');
        
        this.singletons.clear();
        this.initializing.clear();
        
        // Reset initialization status for lazy dependencies
        this.dependencies.forEach(dep => {
            if (dep.config.lazy) {
                dep.initialized = false;
            }
        });
        
        console.log('✅ Dependency Injector reset complete');
    },

    // Cleanup
    cleanup() {
        console.log('🧹 Cleaning up Dependency Injector...');
        
        // Cleanup singletons that have cleanup methods
        this.singletons.forEach((instance, name) => {
            if (instance && typeof instance.cleanup === 'function') {
                try {
                    instance.cleanup();
                } catch (error) {
                    console.error(`Error cleaning up ${name}:`, error);
                }
            }
        });
        
        this.dependencies.clear();
        this.singletons.clear();
        this.factories.clear();
        this.initializing.clear();
        
        console.log('✅ Dependency Injector cleanup complete');
    },

    // Debug utilities
    debugDependencies() {
        console.log('🔌 Registered Dependencies:');
        this.dependencies.forEach((dep, name) => {
            console.log(`  ${name}: ${dep.config.singleton ? 'singleton' : 'instance'} (${dep.initialized ? 'initialized' : 'lazy'})`);
        });
        
        console.log('🏭 Registered Factories:');
        this.factories.forEach((factory, name) => {
            console.log(`  ${name}: deps=[${factory.dependencies.join(', ')}]`);
        });
        
        console.log('📦 Active Singletons:');
        this.singletons.forEach((instance, name) => {
            console.log(`  ${name}: ${typeof instance}`);
        });
    },

    // Get dependency graph
    getDependencyGraph() {
        const graph = {};
        
        this.dependencies.forEach((dep, name) => {
            graph[name] = {
                type: 'dependency',
                dependencies: dep.config.dependencies,
                singleton: dep.config.singleton,
                initialized: dep.initialized
            };
        });
        
        this.factories.forEach((factory, name) => {
            graph[name] = {
                type: 'factory',
                dependencies: factory.dependencies
            };
        });
        
        return graph;
    }
};

// Make available globally
window.DependencyInjector = DependencyInjector; 