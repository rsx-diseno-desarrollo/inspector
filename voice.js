// ===============================
// CONFIGURACIÓN
// ===============================
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.lang = "es-MX";
recognition.continuous = false;
recognition.interimResults = false;

// ===============================
// BOTÓN VOZ (créalo en HTML)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.createElement("button");
  btn.id = "voiceBtn";
  btn.innerText = "🎤 Dictar";
  btn.style.marginTop = "10px";

  document.getElementById("actions").appendChild(btn);

  btn.addEventListener("click", () => {
    iniciarReconocimiento();
  });
});

// ===============================
// INICIAR VOZ
// ===============================
function iniciarReconocimiento() {
  try {
    recognition.start();
    feedback("Escuchando...");
  } catch (e) {
    console.warn("Reconocimiento ya activo");
  }
}

// ===============================
// RESULTADO
// ===============================
recognition.onresult = (event) => {
  const texto = event.results[0][0].transcript.toLowerCase();
  console.log("Detectado:", texto);

  procesarTexto(texto);
};

// ===============================
// PROCESAR TEXTO
// ===============================
function procesarTexto(texto) {

  let match;

  // ALTURA
  match = texto.match(/altura\s(\d+(\.\d+)?)/);
  if (match) {
    document.getElementById("altura").value = match[1];
    feedback("Altura " + match[1]);
  }

  // LF
  match = texto.match(/(lado fijo|lf)\s(\d+(\.\d+)?)/);
  if (match) {
    document.getElementById("lf").value = match[2];
    feedback("Lado fijo " + match[2]);
  }

  // LM
  match = texto.match(/(lado movil|lm)\s(\d+(\.\d+)?)/);
  if (match) {
    document.getElementById("lm").value = match[2];
    feedback("Lado móvil " + match[2]);
  }

  // HOJA CAIDA
  match = texto.match(/hoja caida\s(\d+(\.\d+)?)/);
  if (match) {
    document.getElementById("caida").value = match[1];
    feedback("Hoja caída " + match[1]);
  }

  // PARTE PLANA
  if (texto.includes("parte plana ok")) {
    document.getElementById("partePlana").value = "OK";
    feedback("Parte plana OK");
  }

  if (texto.includes("parte plana no")) {
    document.getElementById("partePlana").value = "NOT_OK";
    feedback("Parte plana no OK");
  }

  // OBSERVACIONES
  if (texto.includes("observaciones")) {
    let obs = texto.split("observaciones")[1];
    document.getElementById("observaciones").value = obs.trim();
    feedback("Observaciones registradas");
  }

  // GUARDAR
  if (texto.includes("guardar")) {
    document.getElementById("saveInspection").click();
    feedback("Registro guardado");
  }

  let match = texto.match(/linea\s(\d)/);
if (match) {
  document.getElementById("linea").value = "L" + match[1];
  feedback("Línea " + match[1]);
}

  match = texto.match(/estacion\s(\d)/);
if (match) {
  document.getElementById("estacion").value = "E" + match[1];
  feedback("Estación " + match[1]);
}

match = texto.match(/parte\s(\d+)/);
if (match) {
  document.getElementById("parte").value = match[1];
  feedback("Parte " + match[1]);
}

if (texto.includes("generar reporte")) {
  document.getElementById("generateReport").click();
  feedback("Generando reporte");
}
}

// ===============================
// FEEDBACK
// ===============================
function feedback(msg) {
  console.log(msg);

  if (navigator.vibrate) navigator.vibrate(150);

  const speech = new SpeechSynthesisUtterance(msg);
  speech.lang = "es-MX";
  speech.volume = 0.6;
  window.speechSynthesis.speak(speech);
}
