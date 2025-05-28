// Simple Game Menu - Minimal overlay for mode selection
const GameMenu = {
    isVisible: false,
    selectedMode: 'classic',

    modes: {
        classic: {
            name: 'Clásico',
            description: 'Juego normal sin límite de tiempo'
        },
        blitz: {
            name: 'Blitz',
            description: 'Partida rápida con producción 2x'
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
                    text-align: center;
                ">
                    <h1 style="color: #00ff88; margin-bottom: 30px;">SPACE CONQUEST</h1>
                    <p style="margin-bottom: 30px; color: #ccc;">Selecciona modo:</p>
                    
                    ${Object.keys(this.modes).map(key => `
                        <button onclick="GameMenu.selectMode('${key}')" style="
                            background: ${key === this.selectedMode ? '#00ff88' : 'transparent'};
                            color: ${key === this.selectedMode ? 'black' : '#00ff88'};
                            border: 2px solid #00ff88;
                            padding: 15px 30px;
                            margin: 10px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-family: inherit;
                            font-weight: bold;
                        ">${this.modes[key].name}</button>
                    `).join('')}
                    
                    <br><br>
                    <p style="color: #ccc; font-size: 14px; margin-bottom: 20px;">
                        ${this.modes[this.selectedMode].description}
                    </p>
                    
                    <button onclick="GameMenu.startGame()" style="
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
    },

    selectMode(mode) {
        this.selectedMode = mode;
        this.hide();
        this.show(); // Refresh to update display
    },

    startGame() {
        console.log(`Starting ${this.selectedMode} mode`);
        this.hide();
        Game.initializeGame(this.selectedMode);
    }
};