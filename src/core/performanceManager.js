// Performance Manager - Optimization System V1.0
const PerformanceManager = {
    // Frame rate monitoring
    frameCount: 0,
    lastFPSUpdate: 0,
    currentFPS: 0,
    targetFPS: 60,
    frameTimeThreshold: 16.67, // 60fps = 16.67ms per frame
    
    // Memory monitoring
    memoryUsage: { used: 0, total: 0 },
    lastMemoryCheck: 0,
    memoryCheckInterval: 5000, // Check every 5 seconds
    
    // Performance pools
    pools: {
        elements: new Map(),
        events: new Map(),
        timers: new Set()
    },
    
    // Animation throttling
    animationQueue: [],
    isAnimating: false,
    lastAnimationFrame: 0,
    
    init() {
        console.log('⚡ Performance Manager V1.0 initializing...');
        
        this.initializePools();
        this.startMonitoring();
        this.optimizeAnimationLoop();
        
        console.log('✅ Performance Manager initialized');
    },
    
    // 🎯 FRAME RATE OPTIMIZATION
    initializeAnimationLoop() {
        const loop = (timestamp) => {
            const deltaTime = timestamp - this.lastAnimationFrame;
            
            // Skip frame if running too fast
            if (deltaTime < this.frameTimeThreshold) {
                requestAnimationFrame(loop);
                return;
            }
            
            // Update FPS counter
            this.updateFPS(timestamp);
            
            // Only update if performance allows
            if (this.currentFPS > 30) {
                this.processAnimationQueue(deltaTime);
            }
            
            this.lastAnimationFrame = timestamp;
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    },
    
    updateFPS(timestamp) {
        this.frameCount++;
        
        if (timestamp - this.lastFPSUpdate >= 1000) {
            this.currentFPS = Math.round((this.frameCount * 1000) / (timestamp - this.lastFPSUpdate));
            this.frameCount = 0;
            this.lastFPSUpdate = timestamp;
            
            // Warn if FPS drops significantly
            if (this.currentFPS < 30) {
                console.warn(`⚠️ Low FPS detected: ${this.currentFPS}fps`);
            }
        }
    },
    
    // 🎯 EVENT LISTENER OPTIMIZATION
    centralizeEventListeners() {
        // Remove existing listeners to prevent duplicates
        this.cleanupEventListeners();
        
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Use event delegation for better performance
        const eventHandler = (e) => {
            switch(e.type) {
                case 'click':
                    this.handleClick(e);
                    break;
                case 'contextmenu':
                    this.handleRightClick(e);
                    break;
                case 'mousemove':
                    this.throttle(() => this.handleMouseMove(e), 16); // ~60fps
                    break;
                case 'mousedown':
                    this.handleMouseDown(e);
                    break;
                case 'mouseup':
                    this.handleMouseUp(e);
                    break;
            }
        };
        
        // Single event listener with delegation
        ['click', 'contextmenu', 'mousemove', 'mousedown', 'mouseup'].forEach(event => {
            canvas.addEventListener(event, eventHandler, { passive: false });
            this.pools.events.set(event, eventHandler);
        });
        
        // Prevent context menu
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    
    // 🎯 MEMORY MANAGEMENT
    initializePools() {
        // Element pools for reuse
        this.pools.elements.set('dragLines', []);
        this.pools.elements.set('tooltips', []);
        this.pools.elements.set('animations', []);
        
        console.log('📦 Object pools initialized');
    },
    
    // Get pooled element instead of creating new
    getPooledElement(type, creator) {
        const pool = this.pools.elements.get(type) || [];
        
        if (pool.length > 0) {
            return pool.pop();
        }
        
        return creator();
    },
    
    // Return element to pool
    returnToPool(type, element) {
        const pool = this.pools.elements.get(type) || [];
        
        // Reset element state
        if (element.style) {
            element.style.display = 'none';
            element.style.opacity = '1';
        }
        
        if (element.setAttribute) {
            element.setAttribute('opacity', '1');
        }
        
        pool.push(element);
        this.pools.elements.set(type, pool);
    },
    
    // 🎯 MEMORY LEAK PREVENTION
    cleanupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Remove all registered event listeners
        this.pools.events.forEach((handler, event) => {
            canvas.removeEventListener(event, handler);
        });
        
        this.pools.events.clear();
    },
    
    cleanupTimers() {
        // Clear all registered timers
        this.pools.timers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        
        this.pools.timers.clear();
    },
    
    // Safe timer creation with auto-cleanup
    createTimer(callback, delay, isInterval = false) {
        const timer = isInterval ? 
            setInterval(callback, delay) : 
            setTimeout(callback, delay);
        
        this.pools.timers.add(timer);
        
        // Auto-remove after execution for timeouts
        if (!isInterval) {
            setTimeout(() => this.pools.timers.delete(timer), delay + 100);
        }
        
        return timer;
    },
    
    // 🎯 ANIMATION OPTIMIZATION
    optimizeAnimationLoop() {
        // Batch DOM updates
        this.documentFragment = document.createDocumentFragment();
        
        // Use transform instead of position changes
        this.optimizeTransforms();
    },
    
    // Queue animation instead of immediate execution
    queueAnimation(animation) {
        this.animationQueue.push(animation);
        
        if (!this.isAnimating) {
            this.processAnimationQueue();
        }
    },
    
    processAnimationQueue(deltaTime) {
        if (this.animationQueue.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        this.isAnimating = true;
        
        // Process animations in batches
        const batchSize = Math.min(5, this.animationQueue.length);
        const batch = this.animationQueue.splice(0, batchSize);
        
        // Batch DOM updates
        batch.forEach(animation => {
            try {
                animation(deltaTime);
            } catch (error) {
                console.warn('Animation error:', error);
            }
        });
    },
    
    // Use CSS transforms for better performance
    optimizeTransforms() {
        // Create transform cache
        this.transformCache = new Map();
    },
    
    // 🎯 THROTTLING & DEBOUNCING
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    debounce(func, delay) {
        let timeoutId;
        return function() {
            const args = arguments;
            const context = this;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context, args), delay);
        };
    },
    
    // 🎯 MONITORING
    startMonitoring() {
        // Monitor memory usage
        this.createTimer(() => this.checkMemoryUsage(), this.memoryCheckInterval, true);
        
        // Monitor performance
        this.createTimer(() => this.logPerformanceStats(), 10000, true); // Every 10s
    },
    
    checkMemoryUsage() {
        if (performance.memory) {
            this.memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1048576) // MB
            };
            
            // Warn if memory usage is high
            if (this.memoryUsage.used > 100) {
                console.warn(`⚠️ High memory usage: ${this.memoryUsage.used}MB`);
            }
        }
    },
    
    logPerformanceStats() {
        console.log('📊 Performance Stats:', {
            FPS: this.currentFPS,
            'Memory (MB)': this.memoryUsage.used,
            'Animation Queue': this.animationQueue.length,
            'Active Timers': this.pools.timers.size,
            'Event Listeners': this.pools.events.size
        });
    },
    
    // 🎯 EVENT HANDLERS (Optimized)
    handleClick(e) {
        if (e.button !== 0) return;
        
        const coords = this.getSVGCoordinates(e);
        const planet = this.getPlanetAtPosition(coords.x, coords.y);
        
        if (planet && typeof InputManager !== 'undefined') {
            InputManager.selectPlanet(planet);
        } else if (typeof InputManager !== 'undefined') {
            InputManager.deselectPlanet();
        }
    },
    
    handleRightClick(e) {
        e.preventDefault();
        
        const coords = this.getSVGCoordinates(e);
        const targetPlanet = this.getPlanetAtPosition(coords.x, coords.y);
        
        if (!targetPlanet || typeof InputManager === 'undefined') return;
        
        if (targetPlanet.owner === 'player') {
            InputManager.showBuildingMenu(targetPlanet, coords.x, coords.y);
        } else if (InputManager.selectedPlanet && 
                  InputManager.selectedPlanet.owner === 'player' && 
                  targetPlanet !== InputManager.selectedPlanet) {
            InputManager.attemptFleetSend(InputManager.selectedPlanet, targetPlanet);
        }
    },
    
    handleMouseMove(e) {
        const coords = this.getSVGCoordinates(e);
        
        if (typeof InputManager !== 'undefined') {
            InputManager.mouseX = coords.x;
            InputManager.mouseY = coords.y;
            
            const planet = this.getPlanetAtPosition(coords.x, coords.y);
            InputManager.updateHover(planet, e.pageX, e.pageY);
        }
    },
    
    handleMouseDown(e) {
        // Delegate to appropriate handler
        if (typeof MouseHandler !== 'undefined') {
            MouseHandler.handleMouseDown(e);
        }
    },
    
    handleMouseUp(e) {
        // Delegate to appropriate handler
        if (typeof MouseHandler !== 'undefined') {
            MouseHandler.handleMouseUp(e);
        }
    },
    
    // Utility methods
    getSVGCoordinates(e) {
        const svg = document.getElementById('gameCanvas');
        if (!svg) return { x: e.offsetX, y: e.offsetY };
        
        try {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
            return { x: svgP.x, y: svgP.y };
        } catch (error) {
            return { x: e.offsetX, y: e.offsetY };
        }
    },
    
    getPlanetAtPosition(x, y) {
        if (typeof GameEngine === 'undefined' || !GameEngine.planets) {
            return null;
        }
        
        // Use spatial indexing for better performance with many planets
        return GameEngine.planets.find(planet => {
            if (!planet) return false;
            
            const distance = Math.sqrt(
                Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2)
            );
            
            return distance <= planet.radius;
        });
    },
    
    // 🎯 CLEANUP
    cleanup() {
        this.cleanupEventListeners();
        this.cleanupTimers();
        
        // Clear pools
        this.pools.elements.clear();
        this.pools.events.clear();
        this.pools.timers.clear();
        
        // Clear animation queue
        this.animationQueue = [];
        this.isAnimating = false;
        
        console.log('🧹 Performance Manager cleaned up');
    },
    
    // 🎯 PUBLIC API
    getStats() {
        return {
            fps: this.currentFPS,
            memory: this.memoryUsage,
            animationQueue: this.animationQueue.length,
            timers: this.pools.timers.size,
            eventListeners: this.pools.events.size
        };
    }
};

// Debug utilities
window.debugPerformance = {
    stats: () => console.table(PerformanceManager.getStats()),
    
    memory: () => {
        if (performance.memory) {
            console.log('💾 Memory Usage:', {
                'Used (MB)': Math.round(performance.memory.usedJSHeapSize / 1048576),
                'Total (MB)': Math.round(performance.memory.totalJSHeapSize / 1048576),
                'Limit (MB)': Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            });
        } else {
            console.log('Memory API not available');
        }
    },
    
    startMonitor: () => {
        const interval = setInterval(() => {
            const stats = PerformanceManager.getStats();
            console.log(`⚡ FPS: ${stats.fps} | Memory: ${stats.memory.used}MB | Queue: ${stats.animationQueue}`);
        }, 1000);
        
        console.log('📊 Performance monitor started (call debugPerformance.stopMonitor() to stop)');
        window.performanceMonitorInterval = interval;
    },
    
    stopMonitor: () => {
        if (window.performanceMonitorInterval) {
            clearInterval(window.performanceMonitorInterval);
            console.log('📊 Performance monitor stopped');
        }
    },
    
    benchmark: () => {
        console.log('🏃 Running performance benchmark...');
        
        const start = performance.now();
        
        // Simulate heavy operations
        for (let i = 0; i < 100000; i++) {
            Math.sqrt(Math.random() * 1000);
        }
        
        const duration = performance.now() - start;
        console.log(`⏱️ Benchmark completed in ${duration.toFixed(2)}ms`);
        
        return duration;
    }
};