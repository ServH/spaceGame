// Game Modes - V1.3 Galcon-inspired modes
const GameModes = {
    current: 'classic',
    timer: null,
    startTime: 0,

    modes: {
        classic: {
            name: 'Conquista Clásica',
            description: 'Conquista todos los planetas',
            timeLimit: 0,
            winCondition: 'total_control'
        },
        
        blitz: {
            name: 'Blitz',
            description: 'Partida rápida - 90 segundos',
            timeLimit: 90000,
            winCondition: 'time_or_control'
        },
        
        kingOfHill: {
            name: 'Rey de la Colina',
            description: 'Controla el planeta central por 30 segundos',
            timeLimit: 120000,
            winCondition: 'king_of_hill',
            hillPlanet: null,
            hillControlTime: 0,
            hillTargetTime: 30000
        }
    },

    init(mode = 'blitz') {
        this.current = mode;
        this.startTime = Date.now();
        
        if (mode === 'kingOfHill') {
            this.setupKingOfHill();
        }
        
        console.log(`🎮 Game mode: ${this.modes[mode].name}`);
    },

    setupKingOfHill() {
        // Find center planet
        const centerX = CONFIG.GAME.CANVAS_WIDTH / 2;
        const centerY = CONFIG.GAME.CANVAS_HEIGHT / 2;
        
        let closestPlanet = null;
        let minDistance = Infinity;
        
        GameEngine.planets.forEach(planet => {
            const distance = Utils.distance(planet, { x: centerX, y: centerY });
            if (distance < minDistance) {
                minDistance = distance;
                closestPlanet = planet;
            }
        });
        
        this.modes.kingOfHill.hillPlanet = closestPlanet;
        
        // Visual indicator
        if (closestPlanet) {
            const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            indicator.setAttribute('cx', closestPlanet.x);
            indicator.setAttribute('cy', closestPlanet.y);
            indicator.setAttribute('r', closestPlanet.radius + 8);
            indicator.setAttribute('fill', 'none');
            indicator.setAttribute('stroke', '#ffd700');
            indicator.setAttribute('stroke-width', '3');
            indicator.setAttribute('stroke-dasharray', '5,5');
            indicator.setAttribute('opacity', '0.8');
            indicator.id = 'hill-indicator';
            
            document.getElementById('gameCanvas').appendChild(indicator);
        }
    },

    update() {
        const mode = this.modes[this.current];
        const elapsed = Date.now() - this.startTime;
        
        // Time limit check
        if (mode.timeLimit && elapsed >= mode.timeLimit) {
            this.handleTimeUp();
            return;
        }
        
        // Mode-specific updates
        switch (this.current) {
            case 'kingOfHill':
                this.updateKingOfHill();
                break;
        }
        
        // Update UI timer
        this.updateTimer(elapsed, mode.timeLimit);
    },

    updateKingOfHill() {
        const hill = this.modes.kingOfHill;
        if (!hill.hillPlanet) return;
        
        if (hill.hillPlanet.owner === 'player') {
            hill.hillControlTime += 16; // ~60fps
            
            if (hill.hillControlTime >= hill.hillTargetTime) {
                GameEngine.endGame('player');
                return;
            }
        } else {
            hill.hillControlTime = Math.max(0, hill.hillControlTime - 32);
        }
        
        // Update hill progress
        this.updateHillProgress();
    },

    updateHillProgress() {
        const hill = this.modes.kingOfHill;
        const progress = hill.hillControlTime / hill.hillTargetTime;
        
        let progressBar = document.getElementById('hill-progress');
        if (!progressBar) {
            progressBar = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            progressBar.id = 'hill-progress';
            progressBar.setAttribute('cx', hill.hillPlanet.x);
            progressBar.setAttribute('cy', hill.hillPlanet.y);
            progressBar.setAttribute('r', hill.hillPlanet.radius + 12);
            progressBar.setAttribute('fill', 'none');
            progressBar.setAttribute('stroke', '#00ff88');
            progressBar.setAttribute('stroke-width', '4');
            progressBar.style.transformOrigin = `${hill.hillPlanet.x}px ${hill.hillPlanet.y}px`;
            progressBar.style.transform = 'rotate(-90deg)';
            
            document.getElementById('gameCanvas').appendChild(progressBar);
        }
        
        const circumference = 2 * Math.PI * (hill.hillPlanet.radius + 12);
        const dashArray = circumference;
        const dashOffset = circumference * (1 - progress);
        
        progressBar.setAttribute('stroke-dasharray', dashArray);
        progressBar.setAttribute('stroke-dashoffset', dashOffset);
        progressBar.setAttribute('opacity', progress > 0 ? '0.8' : '0');
    },

    updateTimer(elapsed, timeLimit) {
        if (!timeLimit) return;
        
        const remaining = Math.max(0, timeLimit - elapsed);
        const seconds = Math.ceil(remaining / 1000);
        
        let timerElement = document.getElementById('game-timer');
        if (!timerElement) {
            timerElement = document.createElement('div');
            timerElement.id = 'game-timer';
            timerElement.style.cssText = `
                position: fixed;
                top: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: ${seconds <= 10 ? '#ff4444' : '#ffffff'};
                padding: 5px 10px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 16px;
                font-weight: bold;
                z-index: 100;
                pointer-events: none;
            `;
            document.body.appendChild(timerElement);
        }
        
        timerElement.textContent = `${seconds}s`;
        timerElement.style.color = seconds <= 10 ? '#ff4444' : '#ffffff';
    },

    handleTimeUp() {
        const playerPlanets = GameEngine.planets.filter(p => p.owner === 'player').length;
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai').length;
        
        if (playerPlanets > aiPlanets) {
            GameEngine.endGame('player');
        } else if (aiPlanets > playerPlanets) {
            GameEngine.endGame('ai');
        } else {
            GameEngine.endGame('draw');
        }
    },

    checkWinConditions() {
        const playerPlanets = GameEngine.planets.filter(p => p.owner === 'player').length;
        const aiPlanets = GameEngine.planets.filter(p => p.owner === 'ai').length;
        const totalPlanets = GameEngine.planets.length;
        
        // Early domination victory
        if (playerPlanets >= totalPlanets * BALANCE.VICTORY.EARLY_ADVANTAGE_THRESHOLD) {
            GameEngine.endGame('player');
            return true;
        }
        
        if (aiPlanets >= totalPlanets * BALANCE.VICTORY.EARLY_ADVANTAGE_THRESHOLD) {
            GameEngine.endGame('ai');
            return true;
        }
        
        // Economic victory
        const playerShips = GameEngine.getPlayerStats().ships;
        const aiShips = GameEngine.getAIStats().ships;
        
        if (playerShips >= aiShips * BALANCE.VICTORY.ECONOMIC_VICTORY_RATIO && playerPlanets > aiPlanets) {
            GameEngine.endGame('player');
            return true;
        }
        
        if (aiShips >= playerShips * BALANCE.VICTORY.ECONOMIC_VICTORY_RATIO && aiPlanets > playerPlanets) {
            GameEngine.endGame('ai');
            return true;
        }
        
        return false;
    },

    getStatus() {
        const mode = this.modes[this.current];
        const elapsed = Date.now() - this.startTime;
        
        let status = mode.name;
        
        if (this.current === 'kingOfHill') {
            const hill = mode;
            const progress = Math.floor((hill.hillControlTime / hill.hillTargetTime) * 100);
            if (progress > 0) {
                status += ` - Colina: ${progress}%`;
            }
        }
        
        return status;
    }
};