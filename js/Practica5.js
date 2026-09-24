function calcularPromedio() {
    let c1 = document.getElementById("calif1").value;
    let c2 = document.getElementById("calif2").value;
    let c3 = document.getElementById("calif3").value;
    let resultElement = document.getElementById("resultado");

    if (c1 === "" || c2 === "" || c3 === "" || isNaN(c1) || isNaN(c2) || isNaN(c3)) {
        resultElement.textContent = "Por favor, ingresa 3 calificaciones válidas.";
        return;
    }

    let n1 = parseFloat(c1);
    let n2 = parseFloat(c2);
    let n3 = parseFloat(c3);

    let promedio = (n1 + n2 + n3) / 3;
    let promedioFormateado = promedio.toFixed(2);

    if (promedio >= 6.0) {
        resultElement.textContent = "El alumno está: aprobado. Promedio: " + promedioFormateado;
    } else {
        resultElement.textContent = "El alumno está: reprobado. Promedio: " + promedioFormateado;
    }
}