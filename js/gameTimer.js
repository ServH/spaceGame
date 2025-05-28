// Game Timer System - V1.3
// Visual countdown timer for time-limited game modes

const GameTimer = {
    // Timer state
    duration: null,
    startTime: null,
    isRunning: false,
    onTimeUp: null,
    updateInterval: null,

    // DOM elements
    timerElement: null,
    progressBar: null,

    // Initialize timer system
    init() {
        this.createTimerUI();
        console.log('⏱️ Game Timer initialized');
    },

    // Create timer UI elements
    createTimerUI() {
        // Create timer container
        const timerContainer = document.createElement('div');
        timerContainer.id = 'gameTimer';
        timerContainer.className = 'game-timer hidden';
        timerContainer.innerHTML = `
            <div class="timer-display">
                <div class="timer-text">
                    <span id="timerMinutes">00</span>:<span id="timerSeconds">00</span>
                </div>
                <div class="timer-progress">
                    <div class="progress-bar" id="timerProgressBar"></div>
                </div>
            </div>
            <div class="timer-label">Tiempo restante</div>
        `;

        // Add to UI overlay
        const uiOverlay = document.querySelector('.ui-overlay');
        if (uiOverlay) {
            uiOverlay.appendChild(timerContainer);
        }

        // Store references
        this.timerElement = timerContainer;
        this.progressBar = document.getElementById('timerProgressBar');

        // Add styles
        this.addTimerStyles();
    },

    // Add timer CSS styles
    addTimerStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .game-timer {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #ffaa00;
                border-radius: 10px;
                padding: 10px 20px;
                color: #ffffff;
                font-family: 'Courier New', monospace;
                z-index: 100;
                transition: all 0.3s ease;
            }

            .game-timer.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .game-timer.warning {
                border-color: #ff4444;
                background: rgba(255, 68, 68, 0.2);
                animation: pulse 1s infinite;
            }

            @keyframes pulse {
                0% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
                100% { transform: translateX(-50%) scale(1); }
            }

            .timer-display {
                text-align: center;
                margin-bottom: 5px;
            }

            .timer-text {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .timer-progress {
                width: 120px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                overflow: hidden;
                margin: 0 auto;
            }

            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #00ff88, #ffaa00, #ff4444);
                transition: width 0.1s ease;
                border-radius: 2px;
            }

            .timer-label {
                font-size: 12px;
                text-align: center;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    },

    // Start timer with duration in milliseconds
    start(durationMs, onComplete) {
        this.duration = durationMs;
        this.startTime = Date.now();
        this.isRunning = true;
        this.onTimeUp = onComplete;

        // Show timer
        this.timerElement.classList.remove('hidden');

        // Start update loop
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
        }, 100);

        console.log(`⏱️ Timer started: ${durationMs / 1000}s`);
    },

    // Stop and hide timer
    stop() {
        this.isRunning = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        // Hide timer
        this.timerElement.classList.add('hidden');
        this.timerElement.classList.remove('warning');

        console.log('⏱️ Timer stopped');
    },

    // Update timer display
    updateDisplay() {
        if (!this.isRunning) return;

        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.duration - elapsed);

        // Convert to minutes and seconds
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        // Update display
        document.getElementById('timerMinutes').textContent = 
            minutes.toString().padStart(2, '0');
        document.getElementById('timerSeconds').textContent = 
            seconds.toString().padStart(2, '0');

        // Update progress bar
        const progress = (remaining / this.duration) * 100;
        this.progressBar.style.width = `${progress}%`;

        // Warning state for last 30 seconds
        if (remaining <= 30000 && !this.timerElement.classList.contains('warning')) {
            this.timerElement.classList.add('warning');
        }

        // Time up
        if (remaining <= 0) {
            this.timeUp();
        }
    },

    // Handle time up
    timeUp() {
        this.stop();
        
        if (this.onTimeUp) {
            this.onTimeUp();
        }

        console.log('⏰ Time up!');
    },

    // Get remaining time in milliseconds
    getTimeRemaining() {
        if (!this.isRunning) return 0;
        
        const elapsed = Date.now() - this.startTime;
        return Math.max(0, this.duration - elapsed);
    },

    // Check if timer is active
    isActive() {
        return this.isRunning;
    },

    // Get progress percentage (0-100)
    getProgress() {
        if (!this.isRunning) return 0;
        
        const elapsed = Date.now() - this.startTime;
        const progress = (elapsed / this.duration) * 100;
        return Math.min(100, Math.max(0, progress));
    },

    // Pause timer
    pause() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isRunning = false;
    },

    // Resume timer
    resume() {
        if (!this.isRunning && this.duration) {
            this.isRunning = true;
            this.updateInterval = setInterval(() => {
                this.updateDisplay();
            }, 100);
        }
    }
};

// Export for use in other modules
window.GameTimer = GameTimer;