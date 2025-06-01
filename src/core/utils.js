// Utils - Essential utility functions (from working branch)
const Utils = {
    distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    formatNumber(num) {
        if (num >= 1000) {
            return Math.floor(num / 100) / 10 + 'k';
        }
        return Math.floor(num);
    },

    pointInCircle(point, circle, radius) {
        return this.distance(point, circle) <= radius;
    },

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};
