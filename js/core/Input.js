class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.mouse = { x: 0, y: 0, isPressed: false };

        // Eventos de teclado
        window.addEventListener('keydown', (e) => {
            if (e.code === 'F2') {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Eventos de mouse con corrección de escala
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            
            // Calculamos el factor de proporción en X y Y
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            // Multiplicamos por la escala para normalizar las coordenadas
            this.mouse.x = (e.clientX - rect.left) * scaleX;
            this.mouse.y = (e.clientY - rect.top) * scaleY;
        });

        canvas.addEventListener('mousedown', () => this.mouse.isPressed = true);
        canvas.addEventListener('mouseup', () => this.mouse.isPressed = false);
    }

    isPressed(keyCode) {
        return !!this.keys[keyCode];
    }
}