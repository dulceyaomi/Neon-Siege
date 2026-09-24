class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.radius = 2;
        this.color = '#ffffff';
        this.alpha = 1;
        this.decay = 0.03;
        this.active = false;
    }

    spawn(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.alpha = 1;
        this.active = true;

        // Velocidad y dirección aleatorias para la explosión
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 180 + 40;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.decay = Math.random() * 0.02 + 0.02;
    }

    update(deltaTime) {
        if (!this.active) return;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Fricción ligera
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Desvanecimiento
        this.alpha -= this.decay;
        if (this.alpha <= 0) {
            this.alpha = 0;
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}