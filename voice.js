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
    altura.value = match[1];
    feedback("Altura " + match[1]);
  }

  // LF
  match = texto.match(/(lado fijo|lf)\s(\d+(\.\d+)?)/);
  if (match) {
    lf.value = match[2];
    feedback("LF " + match[2]);
  }

  // LM
  match = texto.match(/(lado movil|lm)\s(\d+(\.\d+)?)/);
  if (match) {
    lm.value = match[2];
    feedback("LM " + match[2]);
  }

  // LÍNEA
  match = texto.match(/linea\s(\d)/);
  if (match) {
    linea.value = "L" + match[1];
    feedback("Línea " + match[1]);
  }

  // ESTACIÓN
  match = texto.match(/estacion\s(\d)/);
  if (match) {
    estacion.value = "E" + match[1];
    feedback("Estación " + match[1]);
  }

  // GUARDAR
  if (texto.includes("guardar")) {
    saveInspection.click();
    feedback("Registro guardado");
  }

  // GENERAR REPORTE
  if (texto.includes("generar reporte")) {
    generateReport.click();
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
