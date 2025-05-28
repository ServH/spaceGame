// Game Menu - V1.3 Mode selection and game start
const GameMenu = {
    isVisible: false,
    selectedMode: 'blitz',

    modes: {
        classic: {
            name: 'Conquista Clásica',
            description: 'Sin límite de tiempo. Conquista todos los planetas.',
            timeLimit: 0,
            features: ['Ritmo normal', 'Sin prisa', 'Victoria total']
        },
        blitz: {
            name: 'Blitz',
            description: 'Partida rápida de 2 minutos. Mayoría de planetas gana.',
            timeLimit: 120000,
            features: ['Producción 2x', 'Movimiento rápido', '2 minutos']
        },
        kingOfHill: {
            name: 'Rey de la Colina',
            description: 'Controla el planeta central por 45 segundos.',
            timeLimit: 180000,
            features: ['Planeta especial', 'Control por tiempo', '3 minutos máx']
        }
    },

    show() {
        this.isVisible = true;
        this.createMenuDOM();
    },

    hide() {
        this.isVisible = false;
        const menu = document.getElementById('game-menu');
        if (menu) menu.remove();
    },

    createMenuDOM() {
        const menuHTML = `
            <div id="game-menu" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                color: white;
                font-family: 'Courier New', monospace;
            ">
                <div style="
                    background: rgba(0,0,0,0.95);
                    border: 2px solid #00ff88;
                    border-radius: 10px;
                    padding: 40px;
                    width: 600px;
                    height: 500px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-sizing: border-box;
                ">
                    <div>
                        <h1 style="color: #00ff88; margin: 0 0 30px 0;">SPACE CONQUEST</h1>
                        <p style="margin: 0 0 30px 0; color: #ccc;">Selecciona modo de juego:</p>
                        
                        <div id="mode-buttons" style="margin-bottom: 30px;">
                            ${Object.keys(this.modes).map(key => this.createModeButton(key)).join('')}
                        </div>
                    </div>
                    
                    <div id="mode-info" style="
                        background: rgba(0,50,0,0.3);
                        border: 1px solid #00ff88;
                        border-radius: 5px;
                        padding: 20px;
                        text-align: left;
                        flex-grow: 1;
                        margin-bottom: 30px;
                        overflow-y: auto;
                    ">
                        ${this.getModeInfo(this.selectedMode)}
                    </div>
                    
                    <button id="start-game" style="
                        background: #00ff88;
                        color: black;
                        border: none;
                        padding: 15px 30px;
                        font-size: 18px;
                        font-weight: bold;
                        border-radius: 5px;
                        cursor: pointer;
                        font-family: inherit;
                    ">INICIAR PARTIDA</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHTML);
        this.attachEventListeners();
    },

    createModeButton(modeKey) {
        const mode = this.modes[modeKey];
        const isSelected = modeKey === this.selectedMode;
        
        return `
            <button class="mode-btn" data-mode="${modeKey}" style="
                background: ${isSelected ? '#00ff88' : 'transparent'};
                color: ${isSelected ? 'black' : '#00ff88'};
                border: 2px solid #00ff88;
                padding: 10px 20px;
                margin: 5px;
                border-radius: 5px;
                cursor: pointer;
                font-family: inherit;
                font-weight: bold;
            ">${mode.name}</button>
        `;
    },

    getModeInfo(modeKey) {
        const mode = this.modes[modeKey];
        return `
            <h3 style="color: #00ff88; margin-top: 0;">${mode.name}</h3>
            <p style="margin-bottom: 15px;">${mode.description}</p>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${mode.features.map(f => `
                    <span style="
                        background: rgba(0,255,136,0.2);
                        padding: 4px 8px;
                        border-radius: 3px;
                        font-size: 12px;
                    ">${f}</span>
                `).join('')}
            </div>
        `;
    },

    attachEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedMode = e.target.dataset.mode;
                this.updateModeButtons();
                this.updateModeInfo();
            });
        });

        // Start game
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
    },

    updateModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            const isSelected = btn.dataset.mode === this.selectedMode;
            btn.style.background = isSelected ? '#00ff88' : 'transparent';
            btn.style.color = isSelected ? 'black' : '#00ff88';
        });
    },

    updateModeInfo() {
        document.getElementById('mode-info').innerHTML = this.getModeInfo(this.selectedMode);
    },

    startGame() {
        console.log(`🎮 Starting ${this.selectedMode} mode`);
        this.hide();
        
        // Initialize game engine with selected mode
        if (window.GameEngine && GameEngine.init) {
            GameEngine.init(this.selectedMode);
        } else {
            console.error('GameEngine not available');
        }
    }
};