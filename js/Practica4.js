function compareNumbers() {
    let val1 = document.getElementById("valor1").value;
    let val2 = document.getElementById("valor2").value;
    let resultElement = document.getElementById("result");

    if (val1 === "" || val2 === "" || isNaN(val1) || isNaN(val2)) {
        resultElement.textContent = "Ingresa números válidos";
        return;
    }

    let num1 = parseFloat(val1);
    let num2 = parseFloat(val2);

    if (num1 > num2) {
        resultElement.textContent = "Valor 1 es mayor";
    } else if (num2 > num1) {
        resultElement.textContent = "Valor 2 es mayor";
    } else {
        resultElement.textContent = "Los valores son iguales";
    }
}