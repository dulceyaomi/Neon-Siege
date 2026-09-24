# Neon Siege - Cyberpunk Space Arcade 🚀

**Neon Siege** es un videojuego arcade web de supervivencia en arena en 2D con estética *Cyberpunk/Space*, desarrollado íntegramente en tecnologías nativas web. El jugador controla a un astronauta varado en el espacio profundo que debe sobrevivir a hordas de meteoritos y naves alienígenas cazadoras, mientras evoluciona sus armas y registra sus puntuaciones máximas en un servidor Node.js.

---

## 👥 Integrantes del Equipo
* **Integrante 1:** González Reyes Dulce Yaomi - 202411161
* **Integrante 2:** Cazarez Oliva Susana - 202410723

---

## 🛠️ Tecnologías Utilizadas
El proyecto cumple strictly con el requisito de utilizar **tecnologías puras sin frameworks ni motores externos**:
* **HTML5:** Estructura general de la aplicación y renderizado gráfico mediante el API de **HTML5 Canvas (2D)**.
* **CSS3:** Maquetación responsiva, efectos de iluminación neón (`box-shadow`, `text-shadow`) y overlay de entrada.
* **JavaScript (ES6+):** Lógica del motor del juego (Programación Orientada a Objetos, Patrón Object Pool, Máquina de Estados, Detección de Colisiones).
* **Node.js:** Servidor REST API nativo (módulos `http`, `fs`, `path`) para la administración de puntuaciones.
* **JSON:** Formato de almacenamiento persistente de datos (`scores.json`).
* **Fetch API:** Comunicación asíncrona cliente-servidor para enviar y recibir puntuaciones.
* **LocalStorage:** Sistema de almacenamiento local de respaldo en caso de desconexión del servidor backend.

---

## 📁 Estructura del Proyecto

```text
Neon-Siege/
│
├── index.html                  # Punto de entrada de la aplicación web
├── generate_assets.html        # Herramienta propia de generación de Sprites Pro HD
├── README.md                   # Documentación técnica completa del proyecto
│
├── css/
│   └── styles.css              # Estilos responsivos y temas de interfaz
│
├── js/
│   ├── core/
│   │   ├── GameLoop.js         # Bucle principal de renderizado y lógica (Delta Time)
│   │   ├── Input.js            # Gestor centralizado de eventos de teclado y ratón
│   │   └── ObjectPool.js       # Reutilización eficiente de memoria (Bala/Partículas)
│   ├── entities/
│   │   ├── Player.js           # Lógica, animación y nivel evolutivo del Astronauta
│   │   ├── Enemy.js            # IA y patrones de ataque de Meteoritos, Aliens y Jefe
│   │   ├── Bullet.js           # Proyectiles del jugador y enemigos
│   │   └── Particle.js         # Sistema de efectos visuales de explosiones
│   ├── services/
│   │   └── ScoreService.js     # Cliente API (Fetch API + LocalStorage)
│   ├── utils/
│   │   └── Sprite.js           # Motor de renderizado de Sprite Sheets con Fallback
│   └── main.js                 # Coordinador principal de la aplicación y UI
│
├── assets/
│   ├── background/
│   │   └── galaxy_bg.png       # Fondo espacial de galaxia en alta definición
│   └── sprites/
│       ├── player_sheet.png    # Sprite Sheet del Astronauta (4 frames)
│       ├── guns_sheet.png      # Sprite Sheet de las 5 Armas Evolutivas
│       ├── enemy_yellow.png    # Sprite de Meteorito Amarillo Rápido
│       ├── enemy_hunter.png    # Sprite de Meteorito Naranja
│       ├── enemy_ranger.png    # Sprite de Nave Alienígena Verde
│       ├── enemy_tank.png      # Sprite del Jefe Nodriza Morado
│       └── bomb.png            # Sprite de la Bomba Neón
│
└── server/
    ├── server.js               # Servidor REST API nativo en Node.js
    └── scores.json             # Base de datos persistente JSON para Top Scores
```

---

## 🎮 Controles del Juego

| Tecla / Acción | Función |
| :--- | :--- |
| **W, A, S, D / Flechas** | Mover al Astronauta en la arena espacial |
| **Ratón (Cursor)** | Apuntar armas y retícula de disparo |
| **Clic Izquierdo** | Disparar arma equipada |
| **ESPACIO** | Activar Bomba Neón (Limpia enemigos en pantalla) |
| **P** | Pausar / Reanudar el juego |
| **Teclas 1, 2, 3** | Seleccionar dificultad en Menú / Elegir Mejora Evolutiva |
| **R** | Volver al Menú Principal tras Game Over |
| **F2 / B** | Activar / Desactivar Modo Debug (Hitboxes, FPS, Niveles) |

---

## ⚙️ Requisitos e Instalación

### Requisitos Previos
* Un navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Brave).
* **Node.js** (versión 14.0 o superior) instalado en el sistema.

### Instrucciones de Ejecución

1. **Clonar o descargar el repositorio:**
   ```bash
   git clone [https://github.com/dulceyaomi/Neon-Siege.git](https://github.com/dulceyaomi/Neon-Siege.git)
   cd Neon-Siege
   ```

2. **Iniciar el Servidor Backend de Puntuaciones:**
   Abre una terminal en la carpeta del proyecto y ejecuta:
   ```bash
   node server/server.js
   ```
   *El servidor iniciará en `http://localhost:3000` y creará automáticamente el archivo `server/scores.json` si no existe.*

3. **Ejecutar el Juego:**
   Abre el archivo `index.html` directamente en tu navegador web.

---

## 🎨 Documentación de Sprites y Recursos Gráficos

Todos los recursos gráficos del proyecto fueron creados a medida por el equipo mediante nuestra herramienta interna **`generate_assets.html`**, la cual renderiza sombras luminosas de neón y degradados vectoriales directo a archivos `.png`.

### 1. Personaje Principal
* **Archivo:** `assets/sprites/player_sheet.png`
* **Tipo:** Sprite Sheet (128x32 px) de 4 fotogramas (*frames*).
* **Descripción:** Muestra al astronauta con su traje espacial blindado, jetpack con fuego de propulsión animado y visor holográfico.

### 2. Armas Evolutivas (Power-ups Visuales)
* **Archivo:** `assets/sprites/guns_sheet.png`
* **Tipo:** Sprite Sheet (160x32 px) de 5 fotogramas.
* **Descripción:** 5 pistolas neón que evolucionan dinámicamente en las manos del astronauta según el nivel de mejora:
  * *Nivel 1:* Pistola Láser Amarilla.
  * *Nivel 2:* Rifle Dual Celeste.
  * *Nivel 3:* Cañón Pesado Naranja.
  * *Nivel 4:* Lanzador de Plasma Morado.
  * *Nivel 5:* BFG Oblivion Neón Rojo.

### 3. Enemigos y Jefe
* **Meteorito Amarillo (`enemy_yellow.png`):** Asteroide rápido con aura de fuego ardiente (32x32 px).
* **Meteorito Naranja (`enemy_hunter.png`):** Asteroide magmático de masa pesada (32x32 px).
* **Nave Alienígena Cazadora (`enemy_ranger.png`):** OVNI verde con cúpula y láseres (32x32 px).
* **Nave Nodriza Morada - Jefe (`enemy_tank.png`):** Nave espacial Dreadnought con ojo de plasma y 3 Naves Guardianas Verdes que la protegen orbitando a su alrededor (64x64 px).

### 4. Objetos y Escenario
* **Bomba Neón (`bomb.png`):** Artefacto cibernético rosado con detonador lumínico (32x32 px).
* **Fondo de Galaxia (`galaxy_bg.png`):** Mapa estelar de alta resolución (800x600 px) con nebulosas de color violeta/azul y estrellas con destellos neón.

### 5. Renderizado Seguro de Respaldo (*Fallback System*)
La clase `Sprite.js` incluye una verificación mediante el evento `image.onerror`. Si por alguna razón los archivos de imagen no se encuentran presentes en las carpetas de `assets/`, el juego cambia automáticamente a renderizado vectorial neón, garantizando que el juego **nunca sufra errores ni deje de funcionar**.