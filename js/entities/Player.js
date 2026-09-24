class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 250;
        this.hp = 100;
        this.maxHp = 100;
        this.invulnerableTimer = 0;
        this.rotationAngle = 0;

        // Sprite del Astronauta (4 frames de 32x32)
        this.sprite = new Sprite('assets/sprites/player_sheet.png', 32, 32, 4, 0.1, '#00ffff');
        
        // Sprite Sheet de las 5 Armas Evolutivas
        this.gunsSprite = new Sprite('assets/sprites/guns_sheet.png', 32, 32, 5, 0, '#ffff00');

        // Niveles Evolutivos
        this.multiShotLevel = 1;
        this.damageLevel = 1;
        this.bombLevel = 0;
        this.bombsCount = 0;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.hp = this.maxHp;
        this.invulnerableTimer = 0;
        this.multiShotLevel = 1;
        this.damageLevel = 1;
        this.bombLevel = 0;
        this.bombsCount = 0;
    }

    takeDamage(amount) {
        if (this.invulnerableTimer > 0) return false;

        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.invulnerableTimer = 0.8;
        return true;
    }

    update(deltaTime, input, canvasWidth, canvasHeight) {
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= deltaTime;
        }

        let dx = 0;
        let dy = 0;

        if (input.isPressed('KeyA') || input.isPressed('ArrowLeft')) dx -= 1;
        if (input.isPressed('KeyD') || input.isPressed('ArrowRight')) dx += 1;
        if (input.isPressed('KeyW') || input.isPressed('ArrowUp')) dy -= 1;
        if (input.isPressed('KeyS') || input.isPressed('ArrowDown')) dy += 1;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        this.x += dx * this.speed * deltaTime;
        this.y += dy * this.speed * deltaTime;

        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));

        this.rotationAngle = Math.atan2(input.mouse.y - this.y, input.mouse.x - this.x);

        this.sprite.update(deltaTime);
    }

    draw(ctx) {
        ctx.save();

        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
            ctx.globalAlpha = 0.3;
        }

        // 1. Dibujar Astronauta
        this.sprite.draw(ctx, this.x, this.y, this.radius * 2, this.radius * 2, this.rotationAngle, this.radius);

        // 2. Dibujar Arma Equipada según el Nivel de Cañón Pesado (1 al 5)
        const currentGunFrame = Math.min(Math.max(this.damageLevel - 1, 0), 4);
        this.gunsSprite.currentFrame = currentGunFrame;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        // Dibujar el arma apuntando al frente de la mano del astronauta
        this.gunsSprite.draw(ctx, 12, 6, 24, 24, 0, 5);
        ctx.restore();

        ctx.restore();
    }
}