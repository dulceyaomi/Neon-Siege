class Sprite {
    constructor(src, frameWidth = 0, frameHeight = 0, frameCount = 1, frameDuration = 0.1, fallbackColor = '#00ffff') {
        this.image = new Image();
        this.loaded = false;
        this.src = src;

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.frameDuration = frameDuration; // Tiempo en segundos por fotograma
        
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.fallbackColor = fallbackColor;

        this.image.onload = () => {
            this.loaded = true;
            if (this.frameWidth === 0) this.frameWidth = this.image.width;
            if (this.frameHeight === 0) this.frameHeight = this.image.height;
        };

        this.image.onerror = () => {
            console.warn(`No se pudo cargar la imagen: ${this.src}. Se utilizará renderizado neón vectorial de respaldo.`);
            this.loaded = false;
        };

        this.image.src = src;
    }

    update(deltaTime) {
        if (!this.loaded || this.frameCount <= 1) return;

        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.frameDuration) {
            this.animationTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }
    }

    draw(ctx, x, y, width, height, angle = 0, radius = 20) {
        ctx.save();
        ctx.translate(x, y);

        if (angle !== 0) {
            ctx.rotate(angle);
        }

        if (this.loaded) {
            // Renderizado desde Sprite Sheet o Imagen individual
            const sourceX = this.currentFrame * this.frameWidth;
            const sourceY = 0;

            ctx.drawImage(
                this.image,
                sourceX, sourceY, this.frameWidth, this.frameHeight,
                -width / 2, -height / 2, width, height
            );
        } else {
            // Renderizado vectorial de respaldo (Garantiza que el juego funcione sin imágenes)
            ctx.fillStyle = this.fallbackColor;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();

            // Línea indicadora de dirección
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(radius, 0);
            ctx.stroke();
        }

        ctx.restore();
    }
}