const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');

// Inicializar archivo de puntuaciones si no existe
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([
        { player: 'Piloto Neón', score: 1500, kills: 20, difficulty: 'MEDIO', date: new Date().toISOString() },
        { player: 'Cyber Hunter', score: 1000, kills: 15, difficulty: 'FÁCIL', date: new Date().toISOString() }
    ], null, 2));
}

const server = http.createServer((req, res) => {
    // Configuración de cabeceras CORS para comunicación con el frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /api/scores -> Retorna los 10 mejores puntajes
    if (req.method === 'GET' && req.url === '/api/scores') {
        fs.readFile(SCORES_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al leer puntuaciones' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } 
    // POST /api/scores -> Recibe y guarda una nueva puntuación
    else if (req.method === 'POST' && req.url === '/api/scores') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const newEntry = JSON.parse(body);
                fs.readFile(SCORES_FILE, 'utf8', (err, data) => {
                    let scores = [];
                    if (!err && data) {
                        try { scores = JSON.parse(data); } catch (e) { scores = []; }
                    }

                    scores.push({
                        player: newEntry.player || 'Jugador',
                        score: newEntry.score || 0,
                        kills: newEntry.kills || 0,
                        difficulty: newEntry.difficulty || 'MEDIO',
                        date: new Date().toISOString()
                    });

                    // Ordenar de mayor a menor puntaje y conservar los mejores 10
                    scores.sort((a, b) => b.score - a.score);
                    scores = scores.slice(0, 10);

                    fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Error al guardar la puntuación' }));
                            return;
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Puntuación guardada con éxito', scores }));
                    });
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'JSON inválido' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor de Neon Siege ejecutándose en http://localhost:${PORT}`);
});