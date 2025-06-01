/**
 * Event System - Centralized Event Management V1.0
 * Provides decoupled communication between game systems
 * 
 * @namespace EventSystem
 * @description Centralized event management system for the game
 */
const EventSystem = {
    listeners: new Map(),
    eventQueue: [],
    isProcessing: false,
    
    /**
     * Initialize the event system
     * @memberof EventSystem
     */
    init() {
        console.log('📡 Event System initialized');
        this.setupGlobalErrorHandling();
    },

    /**
     * Subscribe to an event
     * @memberof EventSystem
     * @param {string} eventType - The type of event to listen for
     * @param {Function} callback - The callback function to execute
     * @param {Object} [context=null] - The context to bind the callback to
     * @returns {string} The listener ID for unsubscribing
     */
    on(eventType, callback, context = null) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        
        const listener = {
            callback,
            context,
            id: this.generateListenerId()
        };
        
        this.listeners.get(eventType).push(listener);
        
        return listener.id; // Return ID for unsubscribing
    },

    /**
     * Subscribe to an event only once
     * @memberof EventSystem
     * @param {string} eventType - The type of event to listen for
     * @param {Function} callback - The callback function to execute
     * @param {Object} [context=null] - The context to bind the callback to
     * @returns {string} The listener ID
     */
    once(eventType, callback, context = null) {
        const listenerId = this.on(eventType, (...args) => {
            callback.apply(context, args);
            this.off(eventType, listenerId);
        }, context);
        
        return listenerId;
    },

    /**
     * Unsubscribe from an event
     * @memberof EventSystem
     * @param {string} eventType - The type of event
     * @param {string} listenerId - The listener ID returned by on() or once()
     * @returns {boolean} True if successfully unsubscribed
     */
    off(eventType, listenerId) {
        if (!this.listeners.has(eventType)) return false;
        
        const listeners = this.listeners.get(eventType);
        const index = listeners.findIndex(listener => listener.id === listenerId);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            
            // Clean up empty event types
            if (listeners.length === 0) {
                this.listeners.delete(eventType);
            }
            
            return true;
        }
        
        return false;
    },

    /**
     * Emit an event immediately
     * @memberof EventSystem
     * @param {string} eventType - The type of event to emit
     * @param {*} [data=null] - The data to pass to listeners
     * @returns {boolean} True if event was not prevented
     */
    emit(eventType, data = null) {
        if (!this.listeners.has(eventType)) return;
        
        const listeners = this.listeners.get(eventType);
        const event = {
            type: eventType,
            data,
            timestamp: performance.now(),
            preventDefault: false,
            stopPropagation: false
        };
        
        // Create event object with control methods
        const eventObj = {
            ...event,
            preventDefault: () => { event.preventDefault = true; },
            stopPropagation: () => { event.stopPropagation = true; }
        };
        
        // Call listeners
        for (const listener of listeners) {
            try {
                if (listener.context) {
                    listener.callback.call(listener.context, eventObj);
                } else {
                    listener.callback(eventObj);
                }
                
                // Stop if propagation was stopped
                if (event.stopPropagation) break;
                
            } catch (error) {
                console.error(`Error in event listener for '${eventType}':`, error);
            }
        }
        
        return !event.preventDefault;
    },

    /**
     * Queue an event for next frame (async)
     * @memberof EventSystem
     * @param {string} eventType - The type of event to queue
     * @param {*} [data=null] - The data to pass to listeners
     */
    queue(eventType, data = null) {
        this.eventQueue.push({
            type: eventType,
            data,
            timestamp: performance.now()
        });
        
        // Process queue on next frame if not already processing
        if (!this.isProcessing) {
            this.scheduleQueueProcessing();
        }
    },

    // Process queued events
    processQueue() {
        if (this.eventQueue.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        const events = [...this.eventQueue];
        this.eventQueue = [];
        
        // Process events in order
        events.forEach(event => {
            this.emit(event.type, event.data);
        });
        
        // Schedule next processing if more events were queued
        if (this.eventQueue.length > 0) {
            this.scheduleQueueProcessing();
        } else {
            this.isProcessing = false;
        }
    },

    // Schedule queue processing for next frame
    scheduleQueueProcessing() {
        if (typeof PerformanceManager !== 'undefined') {
            PerformanceManager.queueAnimation(() => this.processQueue());
        } else {
            requestAnimationFrame(() => this.processQueue());
        }
    },

    // Generate unique listener ID
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Setup global error handling
    setupGlobalErrorHandling() {
        // Handle uncaught errors in event listeners
        window.addEventListener('error', (event) => {
            this.emit('system:error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.emit('system:unhandledRejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
    },

    // Get event statistics
    getStats() {
        const stats = {
            totalEventTypes: this.listeners.size,
            totalListeners: 0,
            queuedEvents: this.eventQueue.length,
            isProcessing: this.isProcessing,
            eventTypes: {}
        };
        
        this.listeners.forEach((listeners, eventType) => {
            stats.totalListeners += listeners.length;
            stats.eventTypes[eventType] = listeners.length;
        });
        
        return stats;
    },

    // Cleanup all listeners
    cleanup() {
        console.log('🧹 Cleaning up Event System...');
        
        this.listeners.clear();
        this.eventQueue = [];
        this.isProcessing = false;
        
        console.log('✅ Event System cleanup complete');
    },

    // Debug: List all registered events
    debugListeners() {
        console.log('📡 Event System Listeners:');
        this.listeners.forEach((listeners, eventType) => {
            console.log(`  ${eventType}: ${listeners.length} listeners`);
        });
    }
};

// Predefined game events for better organization
EventSystem.EVENTS = {
    // Game lifecycle
    GAME_START: 'game:start',
    GAME_END: 'game:end',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_RESTART: 'game:restart',
    
    // Planet events
    PLANET_CONQUERED: 'planet:conquered',
    PLANET_SELECTED: 'planet:selected',
    PLANET_PRODUCTION: 'planet:production',
    
    // Fleet events
    FLEET_LAUNCHED: 'fleet:launched',
    FLEET_ARRIVED: 'fleet:arrived',
    FLEET_DESTROYED: 'fleet:destroyed',
    
    // Building events
    BUILDING_STARTED: 'building:started',
    BUILDING_COMPLETED: 'building:completed',
    BUILDING_CANCELLED: 'building:cancelled',
    
    // Resource events
    RESOURCE_GENERATED: 'resource:generated',
    RESOURCE_SPENT: 'resource:spent',
    RESOURCE_INSUFFICIENT: 'resource:insufficient',
    
    // UI events
    UI_NOTIFICATION: 'ui:notification',
    UI_TOOLTIP_SHOW: 'ui:tooltip:show',
    UI_TOOLTIP_HIDE: 'ui:tooltip:hide',
    
    // AI events
    AI_DECISION: 'ai:decision',
    AI_STRATEGY_CHANGE: 'ai:strategy:change',
    
    // System events
    SYSTEM_ERROR: 'system:error',
    SYSTEM_WARNING: 'system:warning',
    SYSTEM_PERFORMANCE: 'system:performance'
};

// Make available globally
window.EventSystem = EventSystem; 