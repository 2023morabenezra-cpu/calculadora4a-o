const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll("button");

let expression = "";
let memory = 0;
let inverse = false;
let degreeMode = true;

// Actualizar la pantalla
function updateDisplay() {
  expressionEl.textContent = expression || "0";
}

// Agregar un valor a la expresión
function append(value) {
  expression += value;
  resultEl.textContent = "";
  updateDisplay();
}

// Dar formato a los números
function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  return Number(value.toPrecision(12)).toString();
}

// Realizar el cálculo
function calculateExpression(exp) {
  let jsExp = exp
    .replaceAll("×", "*")
    .replaceAll("−", "-")
    .replaceAll("π", "Math.PI");

  // Porcentaje
  jsExp = jsExp.replace(
    /(\d+(?:\.\d+)?)%/g,
    "($1/100)"
  );

  // Potencias
  jsExp = jsExp.replace(
    /(\d+(?:\.\d+)?)\^/g,
    "$1**"
  );

  // Seno
  jsExp = jsExp.replace(/sin\(([^()]*)\)/g, (_, x) => {
    const number = Number(
      Function(`"use strict"; return (${x})`)()
    );

    const angle = degreeMode
      ? number * Math.PI / 180
      : number;

    return Math.sin(angle);
  });

  // Coseno
  jsExp = jsExp.replace(/cos\(([^()]*)\)/g, (_, x) => {
    const number = Number(
      Function(`"use strict"; return (${x})`)()
    );

    const angle = degreeMode
      ? number * Math.PI / 180
      : number;

    return Math.cos(angle);
  });

  // Tangente
  jsExp = jsExp.replace(/tan\(([^()]*)\)/g, (_, x) => {
    const number = Number(
      Function(`"use strict"; return (${x})`)()
    );

    const angle = degreeMode
      ? number * Math.PI / 180
      : number;

    return Math.tan(angle);
  });

  // Logaritmo base 10
  jsExp = jsExp.replace(/log\(([^()]*)\)/g, (_, x) => {
    const number = Number(
      Function(`"use strict"; return (${x})`)()
    );

    return Math.log10(number);
  });

  // Logaritmo natural
  jsExp = jsExp.replace(/ln\(([^()]*)\)/g, (_, x) => {
    const number = Number(
      Function(`"use strict"; return (${x})`)()
    );

    return Math.log(number);
  });

  // Raíz cuadrada
  jsExp = jsExp.replace(/sqrt\(([^()]*)\)/g, (_, x) => {
    const number = Number(
      Function(`"use strict"; return (${x})`)()
    );

    return Math.sqrt(number);
  });

  // Solo permitir operaciones matemáticas
  if (!/^[0-9+\-*/().\sEe]+$/.test(jsExp)) {
    throw new Error("Expresión no válida");
  }

  return Function(
    `"use strict"; return (${jsExp})`
  )();
}

// Botón =
function equals() {
  if (!expression) {
    return;
  }

  try {
    const value = calculateExpression(expression);
    resultEl.textContent = formatNumber(value);
  } catch {
    resultEl.textContent = "Error";
  }
}

// Funciones científicas
function scientific(type) {

  // SIN, COS, TAN, LOG, LN y √
  if (
    type === "sin" ||
    type === "cos" ||
    type === "tan" ||
    type === "log" ||
    type === "ln" ||
    type === "sqrt"
  ) {

    expression += `${
      type === "sqrt" ? "sqrt" : type
    }(`;

    updateDisplay();
    return;
  }

  // Potencia
  if (type === "power") {
    append("^");
    return;
  }

  // Raíz con índice
  if (type === "root") {
    append("^(1/");
    return;
  }

  // Porcentaje
  if (type === "percent") {
    append("%");
    return;
  }

  // Limpiar
  if (type === "clear") {
    expression = "";
    resultEl.textContent = "";
    updateDisplay();
    return;
  }

  // Inversa
  if (type === "inverse") {
    inverse = !inverse;

    resultEl.textContent = inverse
      ? "INV"
      : "";

    return;
  }

  // Cambiar DEG / RAD
  if (type === "mode") {
    degreeMode = !degreeMode;

    resultEl.textContent = degreeMode
      ? "DEG"
      : "RAD";

    return;
  }

  // Guardar en memoria
  if (type === "store") {

    try {
      memory = calculateExpression(expression);
      resultEl.textContent = "STO";
    } catch {
      resultEl.textContent = "Error";
    }

    return;
  }

  // Recuperar memoria
  if (type === "recall") {
    append(formatNumber(memory));
    return;
  }

  // Sumar a memoria
  if (type === "memoryAdd") {

    try {
      memory += calculateExpression(expression);
      resultEl.textContent = "M+";
    } catch {
      resultEl.textContent = "Error";
    }

  }
}

// Detectar los botones
buttons.forEach(button => {

  button.addEventListener("click", () => {

    const value = button.dataset.value;
    const action = button.dataset.action;

    // Números y operadores
    if (value !== undefined) {
      append(value);
      return;
    }

    // Igual
    if (action === "equals") {
      equals();
    } 
    
    // Funciones científicas
    else {
      scientific(action);
    }

  });

});

// Permitir usar el teclado
document.addEventListener("keydown", event => {

  const key = event.key;

  // Números y punto
  if (/^[0-9.]$/.test(key)) {
    append(key);
  }

  // Operadores
  else if (
    ["+", "-", "*", "/", "(", ")", "^"].includes(key)
  ) {
    append(key);
  }

  // Enter = calcular
  else if (
    key === "Enter" ||
    key === "="
  ) {
    equals();
  }

  // Escape = borrar
  else if (key === "Escape") {
    scientific("clear");
  }

});
