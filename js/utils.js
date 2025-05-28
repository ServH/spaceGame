// Utility functions - Reusable helpers
const Utils = {
    // Distance between two points
    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Random number between min and max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Lerp between two values
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    // Normalize angle to 0-2π
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle > Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },

    // Get angle between two points
    angleBetween(p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    },

    // Check if point is inside circle
    pointInCircle(point, circle) {
        return this.distance(point, circle) <= circle.radius;
    },

    // Get mouse position relative to element
    getMousePos(event, element) {
        const rect = element.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    },

    // Shuffle array in place
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // Check if planets have enough distance between them
    checkPlanetPlacement(newPlanet, existingPlanets, minDistance) {
        return existingPlanets.every(planet => 
            this.distance(newPlanet, planet) >= minDistance
        );
    },

    // Format number for display
    formatNumber(num) {
        return Math.floor(num);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
