class ScoreService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/scores';
        this.storageKey = 'neon_siege_high_scores';
    }

    // Obtener los puntajes altos
    async getHighScores() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error('Servidor no disponible');
            const scores = await response.json();
            return scores;
        } catch (error) {
            console.warn('Servidor Backend no detectado. Cargando desde LocalStorage.');
            const localData = localStorage.getItem(this.storageKey);
            return localData ? JSON.parse(localData) : [];
        }
    }

    // Guardar nueva puntuación
    async saveScore(playerData) {
        // Respaldo en LocalStorage
        this.saveToLocalStorage(playerData);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData)
            });
            if (!response.ok) throw new Error('Error al responder el servidor');
            return await response.json();
        } catch (error) {
            console.warn('Puntuación guardada únicamente en LocalStorage:', error.message);
            return { message: 'Guardado en LocalStorage.' };
        }
    }

    saveToLocalStorage(newEntry) {
        let scores = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        scores.push({
            player: newEntry.player || 'Jugador',
            score: newEntry.score || 0,
            kills: newEntry.kills || 0,
            difficulty: newEntry.difficulty || 'MEDIO',
            date: new Date().toISOString()
        });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10);
        localStorage.setItem(this.storageKey, JSON.stringify(scores));
    }
}