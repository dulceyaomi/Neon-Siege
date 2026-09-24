# Neon Siege - Cyberpunk Space Arcade 🚀

**Neon Siege** es un videojuego arcade web de supervivencia en arena en 2D con estética *Cyberpunk/Space*, desarrollado íntegramente en tecnologías nativas web. El jugador controla a un astronauta varado en el espacio profundo que debe sobrevivir a hordas de meteoritos y naves alienígenas cazadoras, mientras evoluciona sus armas y registra sus puntuaciones máximas en un servidor Node.js.

---

## 👥 Integrantes del Equipo
* **Integrante 1:** [González Reyes Dulce Yaomi] - [202411161]
* **Integrante 2:** [Cazarez Oliva Susana] - [202410723]

---

## 🛠️ Tecnologías Utilizadas
El proyecto cumple estrictamente con el requisito de utilizar **tecnologías puras sin frameworks ni motores externos**:
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