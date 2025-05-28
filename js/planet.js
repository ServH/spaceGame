    setHovered(hovered) {
        // Prevent unnecessary DOM manipulation that causes jitter
        if (this._currentlyHovered === hovered) return;
        this._currentlyHovered = hovered;
        
        if (hovered) {
            this.element.setAttribute('stroke', CONFIG.VISUAL.HOVER_GLOW);
            this.element.setAttribute('stroke-width', '2');
        } else if (!this.isBeingConquered) {
            this.element.removeAttribute('stroke');
            this.element.removeAttribute('stroke-width');
        }
    }