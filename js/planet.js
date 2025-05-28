    startConquest(newOwner, ships) {
        if (this.owner === 'neutral') {
            this.isBeingConquered = true;
            this.conqueror = newOwner;
            this.ships = ships;
            this.conquestTimer = CONFIG.PLANETS.CONQUEST_TIME;
            this.updateVisual();
            
            // V1.2: Add conquest animation
            Animations.createConquestProgress(this);
        }
    }

    completeConquest() {
        this.owner = this.conqueror;
        this.isBeingConquered = false;
        this.conqueror = null;
        this.conquestTimer = 0;
        this.lastProduction = Date.now();
        this.updateVisual();
        
        // V1.2: Remove conquest animation
        Animations.removeAnimation(`conquest_${this.id}`);
        
        UI.updateStats();
    }

    attack(attackerShips, attacker) {
        if (this.isBeingConquered && this.conqueror !== attacker) {
            this.isBeingConquered = false;
            this.conqueror = null;
            this.conquestTimer = 0;
            Animations.removeAnimation(`conquest_${this.id}`);
        }
        
        if (this.owner === attacker) {
            this.ships = Math.min(this.capacity, this.ships + attackerShips);
        } else {
            // V1.2: Add battle animation
            Animations.createBattleEffect(this);
            
            if (attackerShips > this.ships) {
                this.owner = attacker;
                this.ships = attackerShips - this.ships;
                this.lastProduction = Date.now();
            } else {
                this.ships -= attackerShips;
            }
        }
        
        this.updateVisual();
        UI.updateStats();
    }