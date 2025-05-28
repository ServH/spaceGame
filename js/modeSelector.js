// Mode Selector - V1.3 Revised
// Updated with correct timings and descriptions

const ModeSelector = {
    // Selector state
    isVisible: false,
    selectedMode: 'classic',
    
    // DOM elements
    overlay: null,
    selector: null,

    // Initialize mode selector
    init() {
        this.createSelectorUI();
        console.log('🎯 Mode Selector initialized');
    },

    // Create selector UI
    createSelectorUI() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'modeSelector';
        this.overlay.className = 'mode-selector-overlay';
        
        // Create selector content
        this.selector = document.createElement('div');
        this.selector.className = 'mode-selector';
        
        // Build selector HTML
        this.selector.innerHTML = this.buildSelectorHTML();
        
        // Add to overlay
        this.overlay.appendChild(this.selector);
        
        // Add to document
        document.body.appendChild(this.overlay);
        
        // Add event listeners
        this.addEventListeners();
        
        // Add styles
        this.addSelectorStyles();
    },

    // Build selector HTML with updated descriptions
    buildSelectorHTML() {
        const modes = GameModes.getAvailableModes();
        
        let html = `
            <div class="selector-header">
                <h2>🚀 SPACE CONQUEST</h2>
                <p>Selecciona un modo de juego</p>
            </div>
            <div class="mode-list">
        `;
        
        modes.forEach(mode => {
            const isSelected = mode.id === this.selectedMode;
            const duration = mode.duration ? `${mode.duration / 1000}s` : '∞';
            
            html += `
                <div class="mode-option ${isSelected ? 'selected' : ''}" data-mode="${mode.id}">
                    <div class="mode-header">
                        <h3>${mode.name}</h3>
                        <span class="mode-duration">${duration}</span>
                    </div>
                    <p class="mode-description">${mode.description}</p>
                    <div class="mode-features">
                        ${this.getModeFeatures(mode.id)}
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="selector-controls">
                <button id="startGameBtn" class="start-btn">
                    🎮 COMENZAR PARTIDA
                </button>
                <div class="controls-hint">
                    <small>💡 Arrastra para enviar naves | Teclas para selección rápida | Números 1-3 para cambiar modo</small>
                </div>
            </div>
        `;
        
        return html;
    },

    // Get mode-specific features text (updated)
    getModeFeatures(modeId) {
        switch (modeId) {
            case 'classic':
                return '<span class="feature">🎮 Gameplay original</span><span class="feature">⏰ Sin límite de tiempo</span><span class="feature">🎯 Victoria por conquista</span>';
            case 'blitz':
                return '<span class="feature">⚡ Producción 3x</span><span class="feature">🚀 Velocidad 2.5x</span><span class="feature">🏆 4 formas de ganar</span><span class="feature">📊 Dominación 85%</span>';
            case 'kingofhill':
                return '<span class="feature">👑 Planeta fortificado</span><span class="feature">⏱️ Control por 45s</span><span class="feature">💪 +50% producción</span><span class="feature">🏰 +30% capacidad</span>';
            default:
                return '';
        }
    },

    // Add event listeners
    addEventListeners() {
        // Mode selection
        this.selector.addEventListener('click', (e) => {
            const modeOption = e.target.closest('.mode-option');
            if (modeOption) {
                this.selectMode(modeOption.dataset.mode);
            }
        });

        // Start game button
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            if (e.key === 'Enter') {
                this.startGame();
            } else if (e.key === 'Escape') {
                // Could add cancel functionality here
            } else if (e.key >= '1' && e.key <= '3') {
                const modes = ['classic', 'blitz', 'kingofhill'];
                const modeIndex = parseInt(e.key) - 1;
                if (modes[modeIndex]) {
                    this.selectMode(modes[modeIndex]);
                }
            }
        });
    },

    // Select a mode
    selectMode(modeId) {
        // Remove previous selection
        const prevSelected = this.selector.querySelector('.mode-option.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // Add new selection
        const newSelected = this.selector.querySelector(`[data-mode="${modeId}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
            this.selectedMode = modeId;
            console.log(`🎯 Mode selected: ${modeId}`);
        }
    },

    // Start the game with selected mode
    startGame() {
        console.log(`🚀 Starting game with mode: ${this.selectedMode}`);
        
        // Set the game mode
        GameModes.setMode(this.selectedMode);
        
        // Hide selector
        this.hide();
        
        // Start the actual game
        if (Game && Game.startWithMode) {
            Game.startWithMode(this.selectedMode);
        } else {
            // Fallback to regular start
            Game.start();
        }
    },

    // Show mode selector
    show() {
        this.isVisible = true;
        this.overlay.classList.add('visible');
        console.log('🎯 Mode selector shown');
    },

    // Hide mode selector
    hide() {
        this.isVisible = false;
        this.overlay.classList.remove('visible');
        console.log('🎯 Mode selector hidden');
    },

    // Add selector CSS styles
    addSelectorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mode-selector-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(10, 10, 26, 0.95);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .mode-selector-overlay.visible {
                opacity: 1;
                visibility: visible;
            }

            .mode-selector {
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 2px solid #0066cc;
                border-radius: 15px;
                padding: 30px;
                max-width: 700px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
                transform: scale(0.8);
                transition: transform 0.3s ease;
            }

            .mode-selector-overlay.visible .mode-selector {
                transform: scale(1);
            }

            .selector-header {
                text-align: center;
                margin-bottom: 25px;
            }

            .selector-header h2 {
                color: #ffffff;
                font-size: 28px;
                margin: 0 0 10px 0;
                text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
            }

            .selector-header p {
                color: #cccccc;
                margin: 0;
                font-size: 16px;
            }

            .mode-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 25px;
            }

            .mode-option {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid transparent;
                border-radius: 10px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }

            .mode-option:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(0, 255, 136, 0.5);
                transform: translateX(5px);
            }

            .mode-option.selected {
                background: rgba(0, 255, 136, 0.15);
                border-color: #00ff88;
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            }

            .mode-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .mode-header h3 {
                color: #ffffff;
                margin: 0;
                font-size: 20px;
            }

            .mode-duration {
                background: rgba(255, 170, 0, 0.2);
                color: #ffaa00;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }

            .mode-description {
                color: #cccccc;
                margin: 0 0 15px 0;
                font-size: 14px;
                line-height: 1.5;
            }

            .mode-features {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .feature {
                background: rgba(0, 102, 204, 0.2);
                color: #66ccff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }

            .selector-controls {
                text-align: center;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 20px;
            }

            .start-btn {
                background: linear-gradient(145deg, #00ff88, #00cc66);
                color: #000000;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
            }

            .start-btn:hover {
                background: linear-gradient(145deg, #00cc66, #00aa55);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
            }

            .start-btn:active {
                transform: translateY(0);
            }

            .controls-hint {
                margin-top: 15px;
            }

            .controls-hint small {
                color: #888888;
                font-size: 12px;
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .mode-selector {
                    padding: 20px;
                    width: 95%;
                }

                .selector-header h2 {
                    font-size: 24px;
                }

                .mode-option {
                    padding: 15px;
                }

                .mode-header h3 {
                    font-size: 18px;
                }

                .mode-features {
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Export for use in other modules
window.ModeSelector = ModeSelector;