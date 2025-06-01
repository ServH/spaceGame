// Resource UI - Classic Evolution Action 01
// UI components for displaying and managing resources

const ResourceUI = {
    // UI state
    isExpanded: false,
    elements: {},
    
    // Initialize resource UI
    init() {
        this.createResourceDisplay();
        this.addStyles();
        console.log('💰 ResourceUI initialized');
    },

    // Create main resource display
    createResourceDisplay() {
        // Create main resource panel
        const resourcePanel = document.createElement('div');
        resourcePanel.id = 'resourcePanel';
        resourcePanel.className = 'resource-panel compact';
        
        // Compact display (default)
        const compactDisplay = document.createElement('div');
        compactDisplay.id = 'resourceCompact';
        compactDisplay.className = 'resource-compact';
        compactDisplay.textContent = '🔩 0 | ⚡ 0';
        compactDisplay.title = 'Click to expand resource details';
        
        // Expanded display
        const expandedDisplay = document.createElement('div');
        expandedDisplay.id = 'resourceExpanded';
        expandedDisplay.className = 'resource-expanded hidden';
        
        // Metal details
        const metalDetails = document.createElement('div');
        metalDetails.className = 'resource-detail';
        metalDetails.innerHTML = `
            <div class="resource-icon">🔩</div>
            <div class="resource-info">
                <div id="metalDisplay" class="resource-amount">Metal: 0/0 (+0/min)</div>
                <div class="resource-bar">
                    <div id="metalBar" class="resource-progress" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        // Energy details
        const energyDetails = document.createElement('div');
        energyDetails.className = 'resource-detail';
        energyDetails.innerHTML = `
            <div class="resource-icon">⚡</div>
            <div class="resource-info">
                <div id="energyDisplay" class="resource-amount">Energy: 0/0 (+0/min)</div>
                <div class="resource-bar">
                    <div id="energyBar" class="resource-progress energy" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        expandedDisplay.appendChild(metalDetails);
        expandedDisplay.appendChild(energyDetails);
        
        // Toggle functionality
        compactDisplay.addEventListener('click', () => this.toggleDisplay());
        
        // Assembly
        resourcePanel.appendChild(compactDisplay);
        resourcePanel.appendChild(expandedDisplay);
        
        // Add to UI
        const uiOverlay = document.querySelector('.ui-overlay .ui-top');
        if (uiOverlay) {
            // Insert before game title
            const gameTitle = uiOverlay.querySelector('.game-title');
            uiOverlay.insertBefore(resourcePanel, gameTitle);
        }
        
        // Store references
        this.elements = {
            panel: resourcePanel,
            compact: compactDisplay,
            expanded: expandedDisplay,
            metalDisplay: document.getElementById('metalDisplay'),
            metalBar: document.getElementById('metalBar'),
            energyDisplay: document.getElementById('energyDisplay'),
            energyBar: document.getElementById('energyBar')
        };
    },

    // Add CSS styles
    addStyles() {
        const style = document.createElement('style');
        style.id = 'resource-ui-styles';
        style.textContent = `
            .resource-panel {
                position: relative;
                z-index: 100;
                font-family: 'Courier New', monospace;
                user-select: none;
                transition: all 0.3s ease;
            }

            .resource-compact {
                background: rgba(0, 40, 80, 0.9);
                border: 2px solid #0088cc;
                border-radius: 8px;
                padding: 8px 12px;
                color: #ffffff;
                font-weight: bold;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-block;
                min-width: 120px;
                text-align: center;
            }

            .resource-compact:hover {
                background: rgba(0, 60, 120, 0.9);
                border-color: #00aaff;
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
            }

            .resource-expanded {
                position: absolute;
                top: 0;
                left: 0;
                background: rgba(0, 20, 40, 0.95);
                border: 2px solid #0088cc;
                border-radius: 12px;
                padding: 16px;
                min-width: 320px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
                z-index: 101;
            }

            .resource-expanded.hidden {
                display: none;
            }

            .resource-detail {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
            }

            .resource-detail:last-child {
                margin-bottom: 0;
            }

            .resource-icon {
                font-size: 24px;
                margin-right: 12px;
                width: 32px;
                text-align: center;
            }

            .resource-info {
                flex: 1;
            }

            .resource-amount {
                color: #ffffff;
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 4px;
            }

            .resource-bar {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                overflow: hidden;
            }

            .resource-progress {
                height: 100%;
                background: linear-gradient(90deg, #0088cc, #00aaff);
                border-radius: 3px;
                transition: width 0.5s ease;
                position: relative;
            }

            .resource-progress.energy {
                background: linear-gradient(90deg, #ffaa00, #ffcc44);
            }

            .resource-progress::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent
                );
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            .resource-panel.compact .resource-expanded {
                display: none;
            }

            .resource-panel.expanded .resource-compact {
                display: none;
            }

            .resource-panel.expanded .resource-expanded {
                display: block;
            }

            /* Resource generation pulse effect */
            .resource-generation-pulse {
                animation: resourcePulse 0.6s ease-out;
            }

            @keyframes resourcePulse {
                0% {
                    transform: scale(1);
                    background-color: rgba(0, 136, 204, 0.9);
                }
                50% {
                    transform: scale(1.1);
                    background-color: rgba(0, 255, 136, 0.9);
                }
                100% {
                    transform: scale(1);
                    background-color: rgba(0, 136, 204, 0.9);
                }
            }

            /* Insufficient resources warning */
            .resource-insufficient {
                animation: insufficientFlash 0.5s ease-in-out;
                border-color: #ff4444 !important;
            }

            @keyframes insufficientFlash {
                0%, 100% {
                    background-color: rgba(0, 40, 80, 0.9);
                }
                50% {
                    background-color: rgba(80, 20, 20, 0.9);
                }
            }
        `;
        
        document.head.appendChild(style);
    },

    // Toggle between compact and expanded display
    toggleDisplay() {
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.elements.panel.className = 'resource-panel expanded';
        } else {
            this.elements.panel.className = 'resource-panel compact';
        }
        
        // Auto-collapse after 5 seconds
        if (this.isExpanded) {
            setTimeout(() => {
                if (this.isExpanded) {
                    this.toggleDisplay();
                }
            }, 5000);
        }
    },

    // Update resource display
    update() {
        if (!ResourceManager) return;

        const metal = ResourceManager.getMetal();
        const energy = ResourceManager.getEnergy();
        const metalCapacity = ResourceManager.getTotalMetalStorageCapacity();
        const energyCapacity = ResourceManager.getTotalEnergyStorageCapacity();
        const metalGeneration = ResourceManager.getTotalMetalGeneration();
        const energyGeneration = ResourceManager.getTotalEnergyGeneration();
        
        // Update compact display
        if (this.elements.compact) {
            this.elements.compact.textContent = `🔩 ${metal} | ⚡ ${energy}`;
        }
        
        // Update expanded display - Metal
        if (this.elements.metalDisplay) {
            this.elements.metalDisplay.textContent = 
                `Metal: ${metal}/${metalCapacity} (+${metalGeneration.toFixed(1)}/min)`;
        }
        
        if (this.elements.metalBar) {
            const percentage = metalCapacity > 0 ? (metal / metalCapacity) * 100 : 0;
            this.elements.metalBar.style.width = `${Math.min(percentage, 100)}%`;
        }

        // Update expanded display - Energy
        if (this.elements.energyDisplay) {
            this.elements.energyDisplay.textContent = 
                `Energy: ${energy}/${energyCapacity} (+${energyGeneration.toFixed(1)}/min)`;
        }
        
        if (this.elements.energyBar) {
            const percentage = energyCapacity > 0 ? (energy / energyCapacity) * 100 : 0;
            this.elements.energyBar.style.width = `${Math.min(percentage, 100)}%`;
        }
    },

    // Show resource generation feedback
    showGenerationPulse() {
        if (this.elements.compact) {
            this.elements.compact.classList.add('resource-generation-pulse');
            
            // Use PerformanceManager for cleanup timer
            const cleanup = () => {
                if (this.elements.compact) {
                    this.elements.compact.classList.remove('resource-generation-pulse');
                }
            };
            
            if (typeof PerformanceManager !== 'undefined') {
                PerformanceManager.createTimer(cleanup, 600);
            } else {
                setTimeout(cleanup, 600);
            }
        }
    },

    // Show insufficient resources warning
    showInsufficientResources() {
        if (this.elements.compact) {
            this.elements.compact.classList.add('resource-insufficient');
            
            // Use PerformanceManager for cleanup timer
            const cleanup = () => {
                if (this.elements.compact) {
                    this.elements.compact.classList.remove('resource-insufficient');
                }
            };
            
            if (typeof PerformanceManager !== 'undefined') {
                PerformanceManager.createTimer(cleanup, 500);
            } else {
                setTimeout(cleanup, 500);
            }
        }
    },

    // Get resource info for planet tooltips
    getPlanetResourceTooltip(planet) {
        if (!ResourceManager || planet.owner !== 'player') return '';

        const resourceInfo = ResourceManager.getPlanetResourceInfo(planet);
        if (!resourceInfo) return '';

        const metal = resourceInfo.metal;
        const energy = resourceInfo.energy;
        return `Metal: +${metal.generation}/min | Energy: +${energy.generation}/min`;
    },

    // Add cleanup method for memory management
    cleanup() {
        console.log('🧹 Cleaning up Resource UI...');
        
        // Clear elements references
        this.elements = {};
        this.initialized = false;
        
        console.log('✅ Resource UI cleanup complete');
    }
};

// Export for global access
window.ResourceUI = ResourceUI;