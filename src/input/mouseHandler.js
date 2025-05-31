// Mouse Handler - Modular Input System
const MouseHandler = {
    isDragging: false,
    dragStartPlanet: null,
    dragLine: null,
    isRightClickHeld: false,
    rightClickStartTime: 0,

    init() {
        this.setupEventListeners();
        console.log('🖱️ Mouse Handler initialized');
    },

    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('❌ Canvas not found for mouse events');
            return;
        }
        
        canvas.addEventListener('click', (e) => this.handleClick(e));
        canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    handleClick(e) {
        if (e.button !== 0) return;
        
        const coords = InputManager.getSVGCoordinates(e);
        const planet = InputManager.getPlanetAtPosition(coords.x, coords.y);
        
        if (planet) {
            InputManager.selectPlanet(planet);
        } else {
            InputManager.deselectPlanet();
        }
    },

    handleRightClick(e) {
        e.preventDefault();
        
        const coords = InputManager.getSVGCoordinates(e);
        const targetPlanet = InputManager.getPlanetAtPosition(coords.x, coords.y);
        
        if (!targetPlanet) return;
        
        if (targetPlanet.owner === 'player') {
            InputManager.showBuildingMenu(targetPlanet, coords.x, coords.y);
            return;
        }
        
        if (InputManager.selectedPlanet && InputManager.selectedPlanet.owner === 'player' && 
            targetPlanet !== InputManager.selectedPlanet) {
            InputManager.attemptFleetSend(InputManager.selectedPlanet, targetPlanet);
        }
    },

    handleMouseDown(e) {
        if (e.button === 0) {
            const coords = InputManager.getSVGCoordinates(e);
            const planet = InputManager.getPlanetAtPosition(coords.x, coords.y);
            
            if (planet && planet.owner === 'player') {
                this.dragStartPlanet = planet;
                this.isDragging = false;
            }
        } else if (e.button === 2) {
            this.isRightClickHeld = true;
            this.rightClickStartTime = Date.now();
        }
    },

    handleMouseUp(e) {
        if (e.button === 0 && this.dragStartPlanet) {
            if (this.isDragging) {
                const coords = InputManager.getSVGCoordinates(e);
                const targetPlanet = InputManager.getPlanetAtPosition(coords.x, coords.y);
                
                if (targetPlanet && targetPlanet !== this.dragStartPlanet) {
                    InputManager.attemptFleetSend(this.dragStartPlanet, targetPlanet);
                }
                this.isDragging = false;
            }
            this.dragStartPlanet = null;
            this.removeDragLine();
        } else if (e.button === 2) {
            this.isRightClickHeld = false;
        }
    },

    handleMouseMove(e) {
        const coords = InputManager.getSVGCoordinates(e);
        InputManager.mouseX = coords.x;
        InputManager.mouseY = coords.y;
        
        // Handle drag detection
        if (this.dragStartPlanet && !this.isDragging) {
            const dragDistance = Math.sqrt(
                Math.pow(coords.x - this.dragStartPlanet.x, 2) + 
                Math.pow(coords.y - this.dragStartPlanet.y, 2)
            );
            if (dragDistance > 10) {
                this.isDragging = true;
            }
        }
        
        // Update drag line
        if (this.isDragging && this.dragStartPlanet) {
            this.createDragLine(
                this.dragStartPlanet.x, 
                this.dragStartPlanet.y, 
                coords.x, 
                coords.y
            );
        }
        
        // Handle hover
        const planet = InputManager.getPlanetAtPosition(coords.x, coords.y);
        InputManager.updateHover(planet, e.pageX, e.pageY);
    },

    createDragLine(startX, startY, endX, endY) {
        if (this.dragLine) {
            this.dragLine.remove();
        }
        
        const svg = document.getElementById('gameCanvas');
        this.dragLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.dragLine.setAttribute('x1', startX);
        this.dragLine.setAttribute('y1', startY);
        this.dragLine.setAttribute('x2', endX);
        this.dragLine.setAttribute('y2', endY);
        this.dragLine.setAttribute('stroke', '#00ff88');
        this.dragLine.setAttribute('stroke-width', '3');
        this.dragLine.setAttribute('stroke-dasharray', '10,5');
        this.dragLine.setAttribute('opacity', '0.8');
        this.dragLine.style.pointerEvents = 'none';
        
        // Ensure arrow marker exists
        const defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
        if (!defs.querySelector('#arrow-head')) {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrow-head');
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '10');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
            polygon.setAttribute('fill', '#00ff88');
            marker.appendChild(polygon);
            defs.appendChild(marker);
        }
        
        this.dragLine.setAttribute('marker-end', 'url(#arrow-head)');
        svg.appendChild(this.dragLine);
    },

    removeDragLine() {
        if (this.dragLine) {
            this.dragLine.remove();
            this.dragLine = null;
        }
    },

    cleanup() {
        this.removeDragLine();
        this.dragStartPlanet = null;
        this.isDragging = false;
        this.isRightClickHeld = false;
    }
};