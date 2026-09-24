const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Cargar imagen de fondo espacial
const bgImage = new Image();
bgImage.src = 'assets/background/galaxy_bg.png';

const input = new InputHandler(canvas);
const player = new Player(canvas.width / 2, canvas.height / 2);
const scoreService = new ScoreService();

// Elementos HTML del overlay de registro
const nameInputOverlay = document.getElementById('nameInputOverlay');
const playerNameInput = document.getElementById('playerNameInput');
const saveScoreBtn = document.getElementById('saveScoreBtn');

// Pools de objetos
const bulletPool = new ObjectPool(() => new Bullet(), 200);
const enemyBulletPool = new ObjectPool(() => new Bullet(), 100);
const particlePool = new ObjectPool(() => new Particle(), 500);

const enemies = [];
let spawnTimer = 0;
let baseSpawnInterval = 1.2;
let currentSpawnInterval = 1.2;

let fireTimer = 0;
const fireRate = 0.15;

// Estados del Juego: 'MENU', 'PLAYING', 'UPGRADE', 'PAUSED', 'GAMEOVER'
let gameState = 'MENU';
let score = 0;
let kills = 0;
let survivalTime = 0;

let nextUpgradeKills = 15;

// Control de Teclas
let pWasPressed = false;
let f2WasPressed = false;
let spaceWasPressed = false;

// Variables de Backend y Registro
let scoreSubmitted = false;
let highScoresList = [];

// Configuración de Dificultad
const DIFFICULTIES = {
    EASY: { name: 'FÁCIL', hpMult: 0.7, speedMult: 0.8, spawnInterval: 1.5, scoreMult: 0.8 },
    MEDIUM: { name: 'MEDIO', hpMult: 1.0, speedMult: 1.0, spawnInterval: 1.1, scoreMult: 1.0 },
    HARD: { name: 'DIFÍCIL', hpMult: 1.5, speedMult: 1.2, spawnInterval: 0.7, scoreMult: 1.5 }
};
let selectedDifficulty = DIFFICULTIES.MEDIUM;

let debugMode = false;
let currentFps = 0;

function submitPlayerScore() {
    if (scoreSubmitted) return;

    const playerName = playerNameInput.value.trim() || 'Piloto Neón';
    scoreSubmitted = true;
    nameInputOverlay.style.display = 'none';

    scoreService.saveScore({
        player: playerName,
        score: score,
        kills: kills,
        difficulty: selectedDifficulty.name
    }).then(() => {
        scoreService.getHighScores().then(scores => {
            highScoresList = scores;
        });
    });
}

saveScoreBtn.addEventListener('click', submitPlayerScore);
playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitPlayerScore();
});

function checkCircleCollision(c1, c2) {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    return Math.hypot(dx, dy) < (c1.radius + c2.radius);
}

function createExplosion(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        const p = particlePool.get();
        if (p) p.spawn(x, y, color);
    }
}

// Función para verificar si se activa el Menú de Mejoras o la Recompensa Máxima
function checkUpgradeTrigger() {
    if (kills >= nextUpgradeKills) {
        nextUpgradeKills += 15;

        // Comprobar si todas las mejoras están al nivel 5 (máximo)
        const isAllMaxed = player.multiShotLevel >= 5 && player.damageLevel >= 5 && player.bombLevel >= 5;

        if (!isAllMaxed) {
            gameState = 'UPGRADE';
        } else {
            // Recompensa por nivel máximo: curar +25 HP al astronauta
            player.hp = Math.min(player.maxHp, player.hp + 25);
            createExplosion(player.x, player.y, '#00ff66', 20);
        }
    }
}

function spawnEnemy() {
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -20 : canvas.width + 20;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -20 : canvas.height + 20;
    }

    const rand = Math.random();
    let type = 'hunter';

    if (rand < 0.20) type = 'yellow';       // Meteorito Amarillo
    else if (rand < 0.45) type = 'hunter';  // Meteorito Naranja
    else if (rand < 0.65) type = 'swarm';   // Meteorito Secundario
    else if (rand < 0.82) type = 'ranger';  // Alien en Nave Verde
    else type = 'tank';                     // Nave Nodriza Morada (Jefe)

    const enemy = new Enemy(x, y, type);
    enemy.hp *= selectedDifficulty.hpMult;
    enemy.maxHp *= selectedDifficulty.hpMult;
    enemy.speed *= selectedDifficulty.speedMult;

    enemies.push(enemy);
}

function startGame(difficulty) {
    selectedDifficulty = difficulty;
    baseSpawnInterval = difficulty.spawnInterval;
    currentSpawnInterval = difficulty.spawnInterval;

    player.reset(canvas.width / 2, canvas.height / 2);
    enemies.length = 0;
    bulletPool.pool.forEach(b => b.active = false);
    enemyBulletPool.pool.forEach(b => b.active = false);
    particlePool.pool.forEach(p => p.active = false);

    score = 0;
    kills = 0;
    survivalTime = 0;
    nextUpgradeKills = 15;
    spawnTimer = 0;
    fireTimer = 0;
    scoreSubmitted = false;
    highScoresList = [];
    nameInputOverlay.style.display = 'none';

    gameState = 'PLAYING';
}

function fireWeapons() {
    const targetX = input.mouse.x;
    const targetY = input.mouse.y;
    const baseAngle = Math.atan2(targetY - player.y, targetX - player.x);

    const dmg = 10 * player.damageLevel;
    const rad = 4 + (player.damageLevel - 1) * 1.5;
    const colors = ['#ffff00', '#ffcc00', '#ffaa00', '#ff6600', '#ff0055'];
    const col = colors[player.damageLevel - 1] || '#ffff00';

    const count = player.multiShotLevel;
    const spreadAngle = 0.12;

    if (count === 1) {
        const b = bulletPool.get();
        if (b) b.spawnAngle(player.x, player.y, baseAngle, false, dmg, rad, col);
    } else {
        const startAngle = baseAngle - (spreadAngle * (count - 1)) / 2;
        for (let i = 0; i < count; i++) {
            const angle = startAngle + i * spreadAngle;
            const b = bulletPool.get();
            if (b) b.spawnAngle(player.x, player.y, angle, false, dmg, rad, col);
        }
    }
}

function triggerBomb() {
    if (player.bombsCount <= 0) return;

    player.bombsCount--;

    createExplosion(player.x, player.y, '#ff00ff', 35);
    createExplosion(player.x, player.y, '#00ffff', 35);

    const bombDamage = 100 + player.bombLevel * 50;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.takeDamage(bombDamage);
        createExplosion(enemy.x, enemy.y, enemy.color, 8);

        if (!enemy.active) {
            kills++;
            score += Math.round((enemy.type === 'tank' ? 250 : 100) * selectedDifficulty.scoreMult);
            enemies.splice(i, 1);

            checkUpgradeTrigger();
        }
    }
}

function update(deltaTime) {
    if (deltaTime > 0) currentFps = Math.round(1 / deltaTime);

    // Toggle Debug (F2 / B)
    if (input.isPressed('F2') || input.isPressed('KeyB') || input.isPressed('Backquote')) {
        if (!f2WasPressed) {
            debugMode = !debugMode;
            f2WasPressed = true;
        }
    } else {
        f2WasPressed = false;
    }

    // Toggle Pausa con la Tecla [ P ]
    if (input.isPressed('KeyP')) {
        if (!pWasPressed) {
            if (gameState === 'PLAYING') {
                gameState = 'PAUSED';
            } else if (gameState === 'PAUSED') {
                gameState = 'PLAYING';
            }
            pWasPressed = true;
        }
    } else {
        pWasPressed = false;
    }

    // Si el juego está en Pausa, no actualizamos la lógica del juego
    if (gameState === 'PAUSED') {
        return;
    }

    // --- ESTADO: MENÚ DIFICULTAD ---
    if (gameState === 'MENU') {
        if (input.isPressed('Digit1') || input.isPressed('Numpad1')) startGame(DIFFICULTIES.EASY);
        else if (input.isPressed('Digit2') || input.isPressed('Numpad2')) startGame(DIFFICULTIES.MEDIUM);
        else if (input.isPressed('Digit3') || input.isPressed('Numpad3')) startGame(DIFFICULTIES.HARD);
        return;
    }

    // --- ESTADO: MENÚ DE MEJORAS EVOLUTIVAS ---
    if (gameState === 'UPGRADE') {
        if (input.isPressed('Digit1') || input.isPressed('Numpad1')) {
            if (player.multiShotLevel < 5) {
                player.multiShotLevel++;
                gameState = 'PLAYING';
            }
        } else if (input.isPressed('Digit2') || input.isPressed('Numpad2')) {
            if (player.damageLevel < 5) {
                player.damageLevel++;
                gameState = 'PLAYING';
            }
        } else if (input.isPressed('Digit3') || input.isPressed('Numpad3')) {
            if (player.bombLevel < 5) {
                player.bombLevel++;
                player.bombsCount = Math.min(5, player.bombsCount + 2);
                gameState = 'PLAYING';
            }
        }
        return;
    }

    // --- ESTADO: GAME OVER ---
    if (gameState === 'GAMEOVER') {
        if (input.isPressed('KeyR')) {
            nameInputOverlay.style.display = 'none';
            gameState = 'MENU';
        }
        return;
    }

    // --- ESTADO: PLAYING ---
    survivalTime += deltaTime;
    currentSpawnInterval = Math.max(0.3, baseSpawnInterval - Math.floor(survivalTime / 12) * 0.08);

    player.update(deltaTime, input, canvas.width, canvas.height);

    if (input.isPressed('Space') || input.isPressed('KeySpace')) {
        if (!spaceWasPressed) {
            triggerBomb();
            spaceWasPressed = true;
        }
    } else {
        spaceWasPressed = false;
    }

    fireTimer += deltaTime;
    if (input.mouse.isPressed && fireTimer >= fireRate) {
        fireWeapons();
        fireTimer = 0;
    }

    spawnTimer += deltaTime;
    if (spawnTimer >= currentSpawnInterval) {
        spawnEnemy();
        spawnTimer = 0;
    }

    const activePlayerBullets = bulletPool.getActive();
    activePlayerBullets.forEach(bullet => bullet.update(deltaTime, canvas.width, canvas.height));

    const activeEnemyBullets = enemyBulletPool.getActive();
    activeEnemyBullets.forEach(bullet => {
        bullet.update(deltaTime, canvas.width, canvas.height);

        if (bullet.active && checkCircleCollision(bullet, player)) {
            bullet.active = false;
            if (player.takeDamage(bullet.damage || 10)) {
                createExplosion(player.x, player.y, '#00ffff', 6);
            }
        }
    });

    particlePool.getActive().forEach(p => p.update(deltaTime));

    // Enemigos y Colisiones
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(deltaTime, player, enemyBulletPool);

        if (enemy.active && checkCircleCollision(enemy, player)) {
            let contactDamage = 0;

            if (enemy.type === 'yellow' || enemy.type === 'hunter' || enemy.type === 'swarm' || enemy.type === 'kamikaze' || enemy.type === 'ranger') {
                contactDamage = 5;
            } else if (enemy.type === 'tank' && enemy.bossState === 'DASH') {
                contactDamage = 35;
            }

            if (contactDamage > 0 && player.takeDamage(contactDamage)) {
                createExplosion(player.x, player.y, '#ff0055', 8);
            }
        }

        activePlayerBullets.forEach(bullet => {
            if (!bullet.active) return;

            if (enemy.type === 'tank' && enemy.shieldOrbs.length > 0) {
                const facingAngle = Math.atan2(canvas.height / 2 - enemy.y, canvas.width / 2 - enemy.x);
                
                for (let o = enemy.shieldOrbs.length - 1; o >= 0; o--) {
                    const orb = enemy.shieldOrbs[o];
                    const orbPos = enemy.getOrbPosition(orb, facingAngle);

                    if (checkCircleCollision(bullet, { x: orbPos.x, y: orbPos.y, radius: orb.radius })) {
                        bullet.active = false;
                        orb.hp -= bullet.damage;
                        createExplosion(orbPos.x, orbPos.y, '#00ff66', 4);

                        if (orb.hp <= 0) {
                            createExplosion(orbPos.x, orbPos.y, '#00ff66', 12);
                            enemy.shieldOrbs.splice(o, 1);
                        }
                        return;
                    }
                }
            }

            if (checkCircleCollision(bullet, enemy)) {
                bullet.active = false;
                enemy.takeDamage(bullet.damage);
                createExplosion(bullet.x, bullet.y, enemy.color, 4);

                if (!enemy.active) {
                    kills++;
                    score += Math.round((enemy.type === 'tank' ? 250 : 100) * selectedDifficulty.scoreMult);
                    createExplosion(enemy.x, enemy.y, enemy.color, 14);

                    checkUpgradeTrigger();
                }
            }
        });

        if (!enemy.active) {
            enemies.splice(i, 1);
        }
    }

    if (player.hp <= 0 && gameState !== 'GAMEOVER') {
        gameState = 'GAMEOVER';
        createExplosion(player.x, player.y, '#00ffff', 30);

        nameInputOverlay.style.display = 'block';
        playerNameInput.focus();
        playerNameInput.select();

        scoreService.getHighScores().then(scores => {
            highScoresList = scores;
        });
    }
}

function drawMenu() {
    ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('NEON SIEGE', canvas.width / 2, canvas.height / 2 - 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Selecciona el Nivel de Dificultad para comenzar:', canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('[ 1 ] FÁCIL    (Enemigos débiles, menor puntuación)', canvas.width / 2, canvas.height / 2 + 10);

    ctx.fillStyle = '#ffaa00';
    ctx.fillText('[ 2 ] MEDIO    (Dificultad balanceada)', canvas.width / 2, canvas.height / 2 + 50);

    ctx.fillStyle = '#ff0055';
    ctx.fillText('[ 3 ] DIFÍCIL  (Enemigos letales, mayor puntuación)', canvas.width / 2, canvas.height / 2 + 90);

    ctx.textAlign = 'left';
}

function drawUpgradeMenu() {
    ctx.fillStyle = 'rgba(5, 10, 25, 0.90)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('¡SISTEMA EVOLUTIVO DISPONIBLE!', canvas.width / 2, canvas.height / 2 - 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Elige una mejora presionando la tecla [ 1 ], [ 2 ] o [ 3 ]:', canvas.width / 2, canvas.height / 2 - 90);

    const isMax1 = player.multiShotLevel >= 5;
    ctx.fillStyle = isMax1 ? '#222222' : '#1a2636';
    ctx.fillRect(canvas.width / 2 - 320, canvas.height / 2 - 50, 200, 170);
    ctx.strokeStyle = isMax1 ? '#ff0055' : '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width / 2 - 320, canvas.height / 2 - 50, 200, 170);

    ctx.fillStyle = isMax1 ? '#ff0055' : '#00ffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('[ 1 ] RÁFAGA MÚLTIPLE', canvas.width / 2 - 220, canvas.height / 2 - 20);
    ctx.fillStyle = '#cccccc';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Proyectiles a la vez: ${player.multiShotLevel + (isMax1 ? 0 : 1)}`, canvas.width / 2 - 220, canvas.height / 2 + 10);
    
    ctx.font = 'bold 14px monospace';
    if (isMax1) {
        ctx.fillStyle = '#ff0055';
        ctx.fillText('¡NIVEL MÁXIMO EVOLUTIVO!', canvas.width / 2 - 220, canvas.height / 2 + 60);
    } else {
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`Nivel: ${player.multiShotLevel} / 5`, canvas.width / 2 - 220, canvas.height / 2 + 60);
    }

    const isMax2 = player.damageLevel >= 5;
    ctx.fillStyle = isMax2 ? '#222222' : '#1a2636';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 170);
    ctx.strokeStyle = isMax2 ? '#ff0055' : '#ffaa00';
    ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 170);

    ctx.fillStyle = isMax2 ? '#ff0055' : '#ffaa00';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('[ 2 ] CAÑÓN PESADO', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#cccccc';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Daño por disparo: ${(player.damageLevel + (isMax2 ? 0 : 1)) * 10}`, canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.font = 'bold 14px monospace';
    if (isMax2) {
        ctx.fillStyle = '#ff0055';
        ctx.fillText('¡NIVEL MÁXIMO EVOLUTIVO!', canvas.width / 2, canvas.height / 2 + 60);
    } else {
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`Nivel: ${player.damageLevel} / 5`, canvas.width / 2, canvas.height / 2 + 60);
    }

    const isMax3 = player.bombLevel >= 5;
    ctx.fillStyle = isMax3 ? '#222222' : '#1a2636';
    ctx.fillRect(canvas.width / 2 + 120, canvas.height / 2 - 50, 200, 170);
    ctx.strokeStyle = isMax3 ? '#ff0055' : '#ff00ff';
    ctx.strokeRect(canvas.width / 2 + 120, canvas.height / 2 - 50, 200, 170);

    ctx.fillStyle = isMax3 ? '#ff0055' : '#ff00ff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('[ 3 ] BOMBA NEÓN', canvas.width / 2 + 220, canvas.height / 2 - 20);
    ctx.fillStyle = '#cccccc';
    ctx.font = '12px sans-serif';
    ctx.fillText('Limpia la pantalla [ESPACIO]', canvas.width / 2 + 220, canvas.height / 2 + 5);
    ctx.fillText('+2 Bombas extra', canvas.width / 2 + 220, canvas.height / 2 + 25);
    
    ctx.font = 'bold 14px monospace';
    if (isMax3) {
        ctx.fillStyle = '#ff0055';
        ctx.fillText('¡NIVEL MÁXIMO EVOLUTIVO!', canvas.width / 2 + 220, canvas.height / 2 + 60);
    } else {
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`Nivel: ${player.bombLevel} / 5`, canvas.width / 2 + 220, canvas.height / 2 + 60);
    }

    ctx.textAlign = 'left';
}

function drawPauseMenu() {
    ctx.fillStyle = 'rgba(5, 5, 15, 0.80)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('JUEGO EN PAUSA', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText('Presiona [ P ] para reanudar la partida', canvas.width / 2, canvas.height / 2 + 30);

    ctx.textAlign = 'left';
}

function drawHUD() {
    const barWidth = 200;
    const barHeight = 16;
    const hpPercent = player.hp / player.maxHp;

    ctx.fillStyle = '#222222';
    ctx.fillRect(20, 20, barWidth, barHeight);
    
    ctx.fillStyle = hpPercent > 0.5 ? '#00ff66' : hpPercent > 0.25 ? '#ffaa00' : '#ff0044';
    ctx.fillRect(20, 20, barWidth * hpPercent, barHeight);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, barWidth, barHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`SALUD: ${Math.ceil(player.hp)} / ${player.maxHp}`, 25, 33);

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`PUNTOS: ${score}`, 20, 60);
    ctx.fillText(`BAJAS: ${kills} / ${nextUpgradeKills}`, 20, 80);
    ctx.fillText(`DIFICULTAD: ${selectedDifficulty.name}`, 20, 100);

    if (player.bombLevel > 0) {
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(`BOMBAS [ESPACIO]: ${player.bombsCount}`, 20, 125);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px monospace';
    ctx.fillText('[ P ] PAUSA', canvas.width - 90, 30);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.90)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';

    ctx.fillStyle = '#ff0055';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('¡GAME OVER!', canvas.width / 2, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Puntuación Final: ${score}  |  Bajas: ${kills}  |  Modo: ${selectedDifficulty.name}`, canvas.width / 2, 120);

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('--- TOP 5 MEJORES PUNTUACIONES ---', canvas.width / 2, 280);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#cccccc';

    if (highScoresList.length === 0) {
        ctx.fillText('Sincronizando puntuaciones...', canvas.width / 2, 320);
    } else {
        highScoresList.slice(0, 5).forEach((hs, idx) => {
            const line = `${idx + 1}. ${hs.player} - ${hs.score} pts (${hs.kills} bajas) [${hs.difficulty || 'MEDIO'}]`;
            ctx.fillText(line, canvas.width / 2, 320 + idx * 24);
        });
    }

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Presiona [ R ] para volver al Menú Principal', canvas.width / 2, canvas.height - 40);

    ctx.textAlign = 'left';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar Fondo Galáctico
    if (bgImage.complete && bgImage.naturalWidth !== 0) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (gameState === 'MENU') {
        drawMenu();
        return;
    }

    player.draw(ctx);
    enemies.forEach(enemy => enemy.draw(ctx));
    particlePool.getActive().forEach(p => p.draw(ctx));

    bulletPool.getActive().forEach(bullet => {
        if (bullet.active) {
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    enemyBulletPool.getActive().forEach(bullet => {
        if (bullet.active) {
            ctx.fillStyle = bullet.color || '#ff0055';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    if (gameState === 'PLAYING') {
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(input.mouse.x, input.mouse.y, 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawHUD();

    if (debugMode) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.stroke();

        enemies.forEach(enemy => {
            ctx.strokeStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.stroke();
        });

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 140, 280, 110);
        ctx.strokeStyle = '#00ffff';
        ctx.strokeRect(10, 140, 280, 110);

        ctx.fillStyle = '#00ffff';
        ctx.font = '12px monospace';
        ctx.fillText(`--- DEBUG MODE (F2 / B) ---`, 20, 158);
        ctx.fillText(`FPS: ${currentFps}`, 20, 178);
        ctx.fillText(`DISPAROS Lvl: ${player.multiShotLevel} | DAÑO Lvl: ${player.damageLevel}`, 20, 198);
        ctx.fillText(`BOMBAS Lvl: ${player.bombLevel} (${player.bombsCount} disponibles)`, 20, 218);
    }

    if (gameState === 'UPGRADE') {
        drawUpgradeMenu();
    } else if (gameState === 'PAUSED') {
        drawPauseMenu();
    } else if (gameState === 'GAMEOVER') {
        drawGameOver();
    }
}

const game = new GameLoop(update, draw);
game.start();