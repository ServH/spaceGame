    arrive() {
        // V1.2: Fleet arrival animation
        Animations.animateFleetArrival(this, this.destination);
        
        if (this.destination.owner === 'neutral') {
            this.destination.startConquest(this.owner, this.ships);
        } else {
            this.destination.attack(this.ships, this.owner);
        }
        
        this.destroy();
    }