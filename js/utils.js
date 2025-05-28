// Utils - Essential utility functions
const Utils = {
    // Distance between two points
    distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Random number between min and max
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Shuffle array
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Format number for display
    formatNumber(num) {
        if (num >= 1000) {
            return Math.floor(num / 100) / 10 + 'k';
        }
        return Math.floor(num);
    },

    // Check if point is inside circle
    pointInCircle(point, circle, radius) {
        return this.distance(point, circle) <= radius;
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};