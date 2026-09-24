class Bullet {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.radius = 4;
        this.speed = 600;
        this.active = false;
        this.isEnemy = false;
        this.damage = 10; // Daño configurable
        this.color = '#ffff00';
    }

    spawn(x, y, targetX, targetY, isEnemy = false, damage = 10, radius = 4, color = '#ffff00') {
        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;
        this.damage = damage;
        this.radius = radius;
        this.color = color;
        this.active = true;

        const dx = targetX - x;
        const dy = targetY - y;
        const angle = Math.atan2(dy, dx);

        this.vx = Math.cos(angle) * (isEnemy ? 250 : this.speed);
        this.vy = Math.sin(angle) * (isEnemy ? 250 : this.speed);
    }

    // Spawn con ángulo directo (útil para disparos dobles o bidireccionales)
    spawnAngle(x, y, angle, isEnemy = false, damage = 10, radius = 4, color = '#ffff00') {
        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;
        this.damage = damage;
        this.radius = radius;
        this.color = color;
        this.active = true;

        this.vx = Math.cos(angle) * (isEnemy ? 250 : this.speed);
        this.vy = Math.sin(angle) * (isEnemy ? 250 : this.speed);
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        if (!this.active) return;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        if (this.x < -10 || this.x > canvasWidth + 10 || this.y < -10 || this.y > canvasHeight + 10) {
            this.active = false;
        }
    }
}