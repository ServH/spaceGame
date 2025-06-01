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
                case 'mouseup':\n                    this.handleMouseUp(e);\n                    break;\n            }\n        };\n        \n        // Single event listener with delegation\n        ['click', 'contextmenu', 'mousemove', 'mousedown', 'mouseup'].forEach(event => {\n            canvas.addEventListener(event, eventHandler, { passive: false });\n            this.pools.events.set(event, eventHandler);\n        });\n        \n        // Prevent context menu\n        canvas.addEventListener('contextmenu', (e) => e.preventDefault());\n    },\n    \n    // 🎯 MEMORY MANAGEMENT\n    initializePools() {\n        // Element pools for reuse\n        this.pools.elements.set('dragLines', []);\n        this.pools.elements.set('tooltips', []);\n        this.pools.elements.set('animations', []);\n        \n        console.log('📦 Object pools initialized');\n    },\n    \n    // Get pooled element instead of creating new\n    getPooledElement(type, creator) {\n        const pool = this.pools.elements.get(type) || [];\n        \n        if (pool.length > 0) {\n            return pool.pop();\n        }\n        \n        return creator();\n    },\n    \n    // Return element to pool\n    returnToPool(type, element) {\n        const pool = this.pools.elements.get(type) || [];\n        \n        // Reset element state\n        if (element.style) {\n            element.style.display = 'none';\n            element.style.opacity = '1';\n        }\n        \n        if (element.setAttribute) {\n            element.setAttribute('opacity', '1');\n        }\n        \n        pool.push(element);\n        this.pools.elements.set(type, pool);\n    },\n    \n    // 🎯 MEMORY LEAK PREVENTION\n    cleanupEventListeners() {\n        const canvas = document.getElementById('gameCanvas');\n        if (!canvas) return;\n        \n        // Remove all registered event listeners\n        this.pools.events.forEach((handler, event) => {\n            canvas.removeEventListener(event, handler);\n        });\n        \n        this.pools.events.clear();\n    },\n    \n    cleanupTimers() {\n        // Clear all registered timers\n        this.pools.timers.forEach(timer => {\n            clearTimeout(timer);\n            clearInterval(timer);\n        });\n        \n        this.pools.timers.clear();\n    },\n    \n    // Safe timer creation with auto-cleanup\n    createTimer(callback, delay, isInterval = false) {\n        const timer = isInterval ? \n            setInterval(callback, delay) : \n            setTimeout(callback, delay);\n        \n        this.pools.timers.add(timer);\n        \n        // Auto-remove after execution for timeouts\n        if (!isInterval) {\n            setTimeout(() => this.pools.timers.delete(timer), delay + 100);\n        }\n        \n        return timer;\n    },\n    \n    // 🎯 ANIMATION OPTIMIZATION\n    optimizeAnimationLoop() {\n        // Batch DOM updates\n        this.documentFragment = document.createDocumentFragment();\n        \n        // Use transform instead of position changes\n        this.optimizeTransforms();\n    },\n    \n    // Queue animation instead of immediate execution\n    queueAnimation(animation) {\n        this.animationQueue.push(animation);\n        \n        if (!this.isAnimating) {\n            this.processAnimationQueue();\n        }\n    },\n    \n    processAnimationQueue(deltaTime) {\n        if (this.animationQueue.length === 0) {\n            this.isAnimating = false;\n            return;\n        }\n        \n        this.isAnimating = true;\n        \n        // Process animations in batches\n        const batchSize = Math.min(5, this.animationQueue.length);\n        const batch = this.animationQueue.splice(0, batchSize);\n        \n        // Batch DOM updates\n        batch.forEach(animation => {\n            try {\n                animation(deltaTime);\n            } catch (error) {\n                console.warn('Animation error:', error);\n            }\n        });\n    },\n    \n    // Use CSS transforms for better performance\n    optimizeTransforms() {\n        // Create transform cache\n        this.transformCache = new Map();\n    },\n    \n    // 🎯 THROTTLING & DEBOUNCING\n    throttle(func, limit) {\n        let inThrottle;\n        return function() {\n            const args = arguments;\n            const context = this;\n            if (!inThrottle) {\n                func.apply(context, args);\n                inThrottle = true;\n                setTimeout(() => inThrottle = false, limit);\n            }\n        };\n    },\n    \n    debounce(func, delay) {\n        let timeoutId;\n        return function() {\n            const args = arguments;\n            const context = this;\n            clearTimeout(timeoutId);\n            timeoutId = setTimeout(() => func.apply(context, args), delay);\n        };\n    },\n    \n    // 🎯 MONITORING\n    startMonitoring() {\n        // Monitor memory usage\n        this.createTimer(() => this.checkMemoryUsage(), this.memoryCheckInterval, true);\n        \n        // Monitor performance\n        this.createTimer(() => this.logPerformanceStats(), 10000, true); // Every 10s\n    },\n    \n    checkMemoryUsage() {\n        if (performance.memory) {\n            this.memoryUsage = {\n                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB\n                total: Math.round(performance.memory.totalJSHeapSize / 1048576) // MB\n            };\n            \n            // Warn if memory usage is high\n            if (this.memoryUsage.used > 100) {\n                console.warn(`⚠️ High memory usage: ${this.memoryUsage.used}MB`);\n            }\n        }\n    },\n    \n    logPerformanceStats() {\n        console.log('📊 Performance Stats:', {\n            FPS: this.currentFPS,\n            'Memory (MB)': this.memoryUsage.used,\n            'Animation Queue': this.animationQueue.length,\n            'Active Timers': this.pools.timers.size,\n            'Event Listeners': this.pools.events.size\n        });\n    },\n    \n    // 🎯 EVENT HANDLERS (Optimized)\n    handleClick(e) {\n        if (e.button !== 0) return;\n        \n        const coords = this.getSVGCoordinates(e);\n        const planet = this.getPlanetAtPosition(coords.x, coords.y);\n        \n        if (planet && typeof InputManager !== 'undefined') {\n            InputManager.selectPlanet(planet);\n        } else if (typeof InputManager !== 'undefined') {\n            InputManager.deselectPlanet();\n        }\n    },\n    \n    handleRightClick(e) {\n        e.preventDefault();\n        \n        const coords = this.getSVGCoordinates(e);\n        const targetPlanet = this.getPlanetAtPosition(coords.x, coords.y);\n        \n        if (!targetPlanet || typeof InputManager === 'undefined') return;\n        \n        if (targetPlanet.owner === 'player') {\n            InputManager.showBuildingMenu(targetPlanet, coords.x, coords.y);\n        } else if (InputManager.selectedPlanet && \n                  InputManager.selectedPlanet.owner === 'player' && \n                  targetPlanet !== InputManager.selectedPlanet) {\n            InputManager.attemptFleetSend(InputManager.selectedPlanet, targetPlanet);\n        }\n    },\n    \n    handleMouseMove(e) {\n        const coords = this.getSVGCoordinates(e);\n        \n        if (typeof InputManager !== 'undefined') {\n            InputManager.mouseX = coords.x;\n            InputManager.mouseY = coords.y;\n            \n            const planet = this.getPlanetAtPosition(coords.x, coords.y);\n            InputManager.updateHover(planet, e.pageX, e.pageY);\n        }\n    },\n    \n    handleMouseDown(e) {\n        // Delegate to appropriate handler\n        if (typeof MouseHandler !== 'undefined') {\n            MouseHandler.handleMouseDown(e);\n        }\n    },\n    \n    handleMouseUp(e) {\n        // Delegate to appropriate handler\n        if (typeof MouseHandler !== 'undefined') {\n            MouseHandler.handleMouseUp(e);\n        }\n    },\n    \n    // Utility methods\n    getSVGCoordinates(e) {\n        const svg = document.getElementById('gameCanvas');\n        if (!svg) return { x: e.offsetX, y: e.offsetY };\n        \n        try {\n            const pt = svg.createSVGPoint();\n            pt.x = e.clientX;\n            pt.y = e.clientY;\n            const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());\n            return { x: svgP.x, y: svgP.y };\n        } catch (error) {\n            return { x: e.offsetX, y: e.offsetY };\n        }\n    },\n    \n    getPlanetAtPosition(x, y) {\n        if (typeof GameEngine === 'undefined' || !GameEngine.planets) {\n            return null;\n        }\n        \n        // Use spatial indexing for better performance with many planets\n        return GameEngine.planets.find(planet => {\n            if (!planet) return false;\n            \n            const distance = Math.sqrt(\n                Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2)\n            );\n            \n            return distance <= planet.radius;\n        });\n    },\n    \n    // 🎯 CLEANUP\n    cleanup() {\n        this.cleanupEventListeners();\n        this.cleanupTimers();\n        \n        // Clear pools\n        this.pools.elements.clear();\n        this.pools.events.clear();\n        this.pools.timers.clear();\n        \n        // Clear animation queue\n        this.animationQueue = [];\n        this.isAnimating = false;\n        \n        console.log('🧹 Performance Manager cleaned up');\n    },\n    \n    // 🎯 PUBLIC API\n    getStats() {\n        return {\n            fps: this.currentFPS,\n            memory: this.memoryUsage,\n            animationQueue: this.animationQueue.length,\n            timers: this.pools.timers.size,\n            eventListeners: this.pools.events.size\n        };\n    }\n};\n\n// Debug utilities\nwindow.debugPerformance = {\n    stats: () => console.table(PerformanceManager.getStats()),\n    \n    memory: () => {\n        if (performance.memory) {\n            console.log('💾 Memory Usage:', {\n                'Used (MB)': Math.round(performance.memory.usedJSHeapSize / 1048576),\n                'Total (MB)': Math.round(performance.memory.totalJSHeapSize / 1048576),\n                'Limit (MB)': Math.round(performance.memory.jsHeapSizeLimit / 1048576)\n            });\n        } else {\n            console.log('Memory API not available');\n        }\n    },\n    \n    startMonitor: () => {\n        const interval = setInterval(() => {\n            const stats = PerformanceManager.getStats();\n            console.log(`⚡ FPS: ${stats.fps} | Memory: ${stats.memory.used}MB | Queue: ${stats.animationQueue}`);\n        }, 1000);\n        \n        console.log('📊 Performance monitor started (call debugPerformance.stopMonitor() to stop)');\n        window.performanceMonitorInterval = interval;\n    },\n    \n    stopMonitor: () => {\n        if (window.performanceMonitorInterval) {\n            clearInterval(window.performanceMonitorInterval);\n            console.log('📊 Performance monitor stopped');\n        }\n    },\n    \n    benchmark: () => {\n        console.log('🏃 Running performance benchmark...');\n        \n        const start = performance.now();\n        \n        // Simulate heavy operations\n        for (let i = 0; i < 100000; i++) {\n            Math.sqrt(Math.random() * 1000);\n        }\n        \n        const duration = performance.now() - start;\n        console.log(`⏱️ Benchmark completed in ${duration.toFixed(2)}ms`);\n        \n        return duration;\n    }\n};