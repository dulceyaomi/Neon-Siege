class ObjectPool {
    constructor(createFn, initialSize = 100) {
        this.pool = [];
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(createFn());
        }
    }

    get() {
        // Busca una bala inactiva para reutilizarla
        let obj = this.pool.find(item => !item.active);
        if (!obj) {
            // Si nos quedamos sin balas guardadas, creamos una nueva
            obj = new Bullet();
            this.pool.push(obj);
        }
        return obj;
    }

    getActive() {
        return this.pool.filter(item => item.active);
    }
}