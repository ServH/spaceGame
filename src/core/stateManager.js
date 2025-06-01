// State Manager - Centralized Game State Management V1.0
// Provides consistent state management across all game systems

const StateManager = {
    state: {},
    watchers: new Map(),
    history: [],
    maxHistorySize: 50,
    
    init() {
        console.log('🗃️ State Manager initialized');
        this.initializeDefaultState();
        this.setupStateWatching();
    },

    // Initialize default game state
    initializeDefaultState() {
        this.state = {
            // Game meta state
            game: {
                status: 'initializing', // initializing, playing, paused, ended
                mode: 'classic',
                startTime: null,
                endTime: null,
                winner: null,
                difficulty: 'normal'
            },
            
            // Player state
            player: {
                planets: [],
                ships: 0,
                resources: {
                    metal: 0,
                    energy: 0
                },
                buildings: {}
            },
            
            // AI state
            ai: {
                planets: [],
                ships: 0,
                resources: {
                    metal: 0,
                    energy: 0
                },
                strategy: 'balanced',
                difficulty: 'normal'
            },
            
            // World state
            world: {
                planets: [],
                fleets: [],
                totalPlanets: 0
            },
            
            // UI state
            ui: {
                selectedPlanet: null,
                tooltipVisible: false,
                notifications: [],
                expandedPanels: []
            },
            
            // Performance state
            performance: {
                fps: 0,
                memoryUsage: 0,
                activeAnimations: 0,
                eventQueueSize: 0
            }
        };
    },

    // Get state value by path (e.g., 'player.resources.metal')
    get(path) {
        return this.getNestedValue(this.state, path);
    },

    // Set state value by path
    set(path, value, silent = false) {
        const oldValue = this.get(path);
        
        // Don't update if value hasn't changed
        if (oldValue === value) return false;
        
        // Store in history
        this.addToHistory(path, oldValue, value);
        
        // Update state
        this.setNestedValue(this.state, path, value);
        
        // Notify watchers
        if (!silent) {
            this.notifyWatchers(path, value, oldValue);
        }
        
        return true;
    },

    // Update multiple state values at once
    update(updates, silent = false) {
        const changes = [];
        
        Object.entries(updates).forEach(([path, value]) => {
            const oldValue = this.get(path);
            if (oldValue !== value) {
                this.setNestedValue(this.state, path, value);
                changes.push({ path, value, oldValue });
            }
        });
        
        // Add to history as batch
        if (changes.length > 0) {
            this.addToHistory('batch', null, changes);
            
            // Notify watchers
            if (!silent) {
                changes.forEach(({ path, value, oldValue }) => {
                    this.notifyWatchers(path, value, oldValue);
                });
            }
        }
        
        return changes.length > 0;
    },

    // Watch for changes to a specific path
    watch(path, callback, context = null) {
        if (!this.watchers.has(path)) {
            this.watchers.set(path, []);
        }
        
        const watcher = {
            callback,
            context,
            id: this.generateWatcherId()
        };
        
        this.watchers.get(path).push(watcher);
        
        return watcher.id;
    },

    // Stop watching a path
    unwatch(path, watcherId) {
        if (!this.watchers.has(path)) return false;
        
        const watchers = this.watchers.get(path);
        const index = watchers.findIndex(w => w.id === watcherId);
        
        if (index !== -1) {
            watchers.splice(index, 1);
            
            // Clean up empty watchers
            if (watchers.length === 0) {
                this.watchers.delete(path);
            }
            
            return true;
        }
        
        return false;
    },

    // Get nested value from object using dot notation
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    },

    // Set nested value in object using dot notation
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    },

    // Notify watchers of state changes
    notifyWatchers(path, newValue, oldValue) {
        // Notify exact path watchers
        if (this.watchers.has(path)) {
            this.watchers.get(path).forEach(watcher => {
                try {
                    if (watcher.context) {
                        watcher.callback.call(watcher.context, newValue, oldValue, path);
                    } else {
                        watcher.callback(newValue, oldValue, path);
                    }
                } catch (error) {
                    console.error(`Error in state watcher for '${path}':`, error);
                }
            });
        }
        
        // Notify parent path watchers (e.g., 'player' when 'player.resources.metal' changes)
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            if (this.watchers.has(parentPath)) {
                const parentValue = this.get(parentPath);
                this.watchers.get(parentPath).forEach(watcher => {
                    try {
                        if (watcher.context) {
                            watcher.callback.call(watcher.context, parentValue, null, parentPath);
                        } else {
                            watcher.callback(parentValue, null, parentPath);
                        }
                    } catch (error) {
                        console.error(`Error in parent state watcher for '${parentPath}':`, error);
                    }
                });
            }
        }
        
        // Emit event through EventSystem if available
        if (typeof EventSystem !== 'undefined') {
            EventSystem.emit('state:changed', {
                path,
                newValue,
                oldValue,
                timestamp: performance.now()
            });
        }
    },

    // Add change to history
    addToHistory(path, oldValue, newValue) {
        this.history.push({
            path,
            oldValue,
            newValue,
            timestamp: performance.now()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    },

    // Generate unique watcher ID
    generateWatcherId() {
        return `watcher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Setup automatic state watching for common patterns
    setupStateWatching() {
        // Watch for game status changes
        this.watch('game.status', (newStatus, oldStatus) => {
            if (typeof EventSystem !== 'undefined') {
                EventSystem.emit(`game:${newStatus}`, { oldStatus, newStatus });
            }
        });
        
        // Watch for resource changes
        this.watch('player.resources', (resources) => {
            if (typeof EventSystem !== 'undefined') {
                EventSystem.emit('resource:updated', resources);
            }
        });
        
        // Watch for planet ownership changes
        this.watch('world.planets', (planets) => {
            if (typeof EventSystem !== 'undefined') {
                EventSystem.emit('world:updated', { planets });
            }
        });
    },

    // Get current game statistics
    getGameStats() {
        return {
            player: {
                planets: this.get('player.planets').length,
                ships: this.get('player.ships'),
                metal: this.get('player.resources.metal'),
                energy: this.get('player.resources.energy')
            },
            ai: {
                planets: this.get('ai.planets').length,
                ships: this.get('ai.ships'),
                strategy: this.get('ai.strategy')
            },
            world: {
                totalPlanets: this.get('world.totalPlanets'),
                activeFleets: this.get('world.fleets').length
            },
            game: {
                status: this.get('game.status'),
                mode: this.get('game.mode'),
                duration: this.getGameDuration()
            }
        };
    },

    // Get game duration in seconds
    getGameDuration() {
        const startTime = this.get('game.startTime');
        const endTime = this.get('game.endTime');
        
        if (!startTime) return 0;
        
        const currentTime = endTime || performance.now();
        return (currentTime - startTime) / 1000;
    },

    // Reset state to defaults
    reset() {
        console.log('🔄 Resetting State Manager...');
        
        // Clear watchers
        this.watchers.clear();
        
        // Clear history
        this.history = [];
        
        // Reset to default state
        this.initializeDefaultState();
        
        // Re-setup watching
        this.setupStateWatching();
        
        console.log('✅ State Manager reset complete');
    },

    // Cleanup
    cleanup() {
        console.log('🧹 Cleaning up State Manager...');
        
        this.watchers.clear();
        this.history = [];
        this.state = {};
        
        console.log('✅ State Manager cleanup complete');
    },

    // Debug utilities
    debugState() {
        console.log('🗃️ Current State:', this.state);
    },

    debugWatchers() {
        console.log('👁️ State Watchers:');
        this.watchers.forEach((watchers, path) => {
            console.log(`  ${path}: ${watchers.length} watchers`);
        });
    },

    debugHistory() {
        console.log('📜 State History (last 10):');
        console.table(this.history.slice(-10));
    },

    // Export state for saving
    exportState() {
        return JSON.parse(JSON.stringify(this.state));
    },

    // Import state from save
    importState(savedState) {
        this.state = { ...this.state, ...savedState };
        
        // Notify all watchers of the import
        if (typeof EventSystem !== 'undefined') {
            EventSystem.emit('state:imported', { state: this.state });
        }
    }
};

// Make available globally
window.StateManager = StateManager; 