class Enemy {
    constructor(x, y, type = 'hunter') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;

        // Configuración de tipos y asignación de Sprites
        if (type === 'yellow') { 
            // METEORITO AMARILLO (Rápido)
            this.radius = 12;
            this.speed = 270;
            this.hp = 15;
            this.maxHp = 15;
            this.color = '#ffff00';
            this.sprite = new Sprite('assets/sprites/enemy_yellow.png', 32, 32, 1, 0, '#ffff00');
        } else if (type === 'hunter') { 
            // METEORITO NARANJA
            this.radius = 14;
            this.speed = 240;
            this.hp = 20;
            this.maxHp = 20;
            this.color = '#ffaa00';
            this.sprite = new Sprite('assets/sprites/enemy_hunter.png', 32, 32, 1, 0, '#ffaa00');
        } else if (type === 'swarm' || type === 'kamikaze') { 
            // METEORITO SECUNDARIO
            this.radius = 11;
            this.speed = 260;
            this.hp = 12;
            this.maxHp = 12;
            this.color = '#ff6600';
            this.sprite = new Sprite('assets/sprites/enemy_hunter.png', 32, 32, 1, 0, '#ff6600');
        } else if (type === 'ranger') { 
            // ALIEN EN NAVE VERDE (Disparador)
            this.radius = 16;
            this.speed = 120;
            this.hp = 25;
            this.maxHp = 25;
            this.color = '#00ff66';
            this.fireTimer = 0;
            this.fireInterval = 2.0;
            this.sprite = new Sprite('assets/sprites/enemy_ranger.png', 32, 32, 1, 0, '#00ff66');
        } else if (type === 'tank') { 
            // NAVE NODRIZA MORADA (Jefe con Escudo)
            this.radius = 28;
            this.speed = 75;
            this.hp = 200;
            this.maxHp = 200;
            this.color = '#a855f7';
            this.sprite = new Sprite('assets/sprites/enemy_tank.png', 64, 64, 1, 0, '#a855f7');
            
            // Sprite de los Guardianes del Escudo (Naves Verdes Pequeñas)
            this.shieldSprite = new Sprite('assets/sprites/enemy_ranger.png', 32, 32, 1, 0, '#00ff66');

            this.shieldOrbs = [
                { angleOffset: -0.6, hp: 30, maxHp: 30, radius: 10 },
                { angleOffset: 0,    hp: 30, maxHp: 30, radius: 10 },
                { angleOffset: 0.6,  hp: 30, maxHp: 30, radius: 10 }
            ];

            this.bossState = 'CYCLE_SHOOT';
            this.bulletsFired = 0;
            this.shootTimer = 0;
            this.telegraphTimer = 0;
            this.dashTimer = 0;
            this.dashAngle = 0;
            this.hasUsedUlt = false;
            this.ultTimer = 0;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.active = false;
        }
    }

    getOrbPosition(orb, facingAngle) {
        const dist = this.radius + 20;
        const angle = facingAngle + orb.angleOffset;
        return {
            x: this.x + Math.cos(angle) * dist,
            y: this.y + Math.sin(angle) * dist
        };
    }

    update(deltaTime, player, bulletPool) {
        if (!this.active) return;

        const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);

        if (this.type === 'yellow' || this.type === 'hunter' || this.type === 'kamikaze' || this.type === 'swarm') {
            this.x += Math.cos(angleToPlayer) * this.speed * deltaTime;
            this.y += Math.sin(angleToPlayer) * this.speed * deltaTime;
            return;
        }

        if (this.type === 'ranger') {
            const dist = Math.hypot(player.x - this.x, player.y - this.y);
            if (dist > 220) {
                this.x += Math.cos(angleToPlayer) * this.speed * deltaTime;
                this.y += Math.sin(angleToPlayer) * this.speed * deltaTime;
            }

            this.fireTimer += deltaTime;
            if (this.fireTimer >= this.fireInterval) {
                this.fireTimer = 0;
                const bullet = bulletPool.get();
                if (bullet) {
                    bullet.spawnAngle(this.x, this.y, angleToPlayer, true, 10, 5, '#00ff66');
                }
            }
            return;
        }

        if (this.type === 'tank') {
            if (!this.hasUsedUlt && this.hp <= this.maxHp * 0.5) {
                this.hasUsedUlt = true;
                this.bossState = 'ULT_CENTER';
                this.ultTimer = 0;
            }

            if (this.bossState === 'ULT_CENTER') {
                const centerX = 400;
                const centerY = 300;
                const dx = centerX - this.x;
                const dy = centerY - this.y;
                const distCenter = Math.hypot(dx, dy);

                if (distCenter > 5) {
                    this.x += (dx / distCenter) * 200 * deltaTime;
                    this.y += (dy / distCenter) * 200 * deltaTime;
                } else {
                    this.bossState = 'ULT_BURST';
                    this.ultTimer = 0;
                }
                return;
            }

            if (this.bossState === 'ULT_BURST') {
                this.ultTimer += deltaTime;
                if (Math.random() < 0.35) {
                    const randomAngle = Math.random() * Math.PI * 2;
                    const b = bulletPool.get();
                    if (b) {
                        b.spawnAngle(this.x, this.y, randomAngle, true, 15, 6, '#ff00ff');
                        b.speed = 180 + Math.random() * 100;
                    }
                }

                if (this.ultTimer >= 2.5) {
                    this.bossState = 'CYCLE_SHOOT';
                    this.bulletsFired = 0;
                    this.shootTimer = 0;
                }
                return;
            }

            if (this.bossState === 'CYCLE_SHOOT') {
                this.x += Math.cos(angleToPlayer) * (this.speed * 0.6) * deltaTime;
                this.y += Math.sin(angleToPlayer) * (this.speed * 0.6) * deltaTime;

                if (this.shieldOrbs.length === 0) {
                    this.shootTimer += deltaTime;
                    if (this.shootTimer >= 0.6) {
                        this.shootTimer = 0;
                        const b = bulletPool.get();
                        if (b) {
                            b.spawnAngle(this.x, this.y, angleToPlayer, true, 25, 7, '#a855f7');
                            b.speed = 140;
                        }
                        this.bulletsFired++;

                        if (this.bulletsFired >= 5) {
                            this.bossState = 'TELEGRAPH';
                            this.telegraphTimer = 0;
                            this.dashAngle = angleToPlayer;
                        }
                    }
                }
            } else if (this.bossState === 'TELEGRAPH') {
                this.telegraphTimer += deltaTime;
                if (this.telegraphTimer >= 2.0) {
                    this.bossState = 'DASH';
                    this.dashTimer = 0;
                }
            } else if (this.bossState === 'DASH') {
                this.dashTimer += deltaTime;
                this.x += Math.cos(this.dashAngle) * 450 * deltaTime;
                this.y += Math.sin(this.dashAngle) * 450 * deltaTime;

                if (this.dashTimer >= 0.6) {
                    this.bossState = 'CYCLE_SHOOT';
                    this.bulletsFired = 0;
                    this.shootTimer = 0;
                }
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        if (this.type === 'tank' && this.bossState === 'TELEGRAPH') {
            ctx.strokeStyle = 'rgba(255, 0, 85, 0.6)';
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + Math.cos(this.dashAngle) * 500, this.y + Math.sin(this.dashAngle) * 500);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Renderizado del Sprite del Enemigo Principal
        const angleToPlayer = Math.atan2(ctx.canvas.height / 2 - this.y, ctx.canvas.width / 2 - this.x);
        this.sprite.draw(ctx, this.x, this.y, this.radius * 2, this.radius * 2, angleToPlayer, this.radius);

        // Renderizado de las Naves Guardianas de Escudo (si es el Jefe Morado)
        if (this.type === 'tank') {
            this.shieldOrbs.forEach(orb => {
                const pos = this.getOrbPosition(orb, angleToPlayer);
                this.shieldSprite.draw(ctx, pos.x, pos.y, orb.radius * 2.2, orb.radius * 2.2, angleToPlayer, orb.radius);
            });
        }

        ctx.restore();
    }
}