// ===============================
// CONFIGURACIÓN
// ===============================
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.lang = "es-MX";
recognition.continuous = false;
recognition.interimResults = false;

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("voiceBtn");

  if (btn) {
    btn.addEventListener("click", () => {
      iniciarReconocimiento();
    });
  }
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
  let texto = event.results[0][0].transcript;
  texto = normalizarTexto(texto);
  console.log("Detectado:", texto);

  procesarTexto(texto);
};

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos
}

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
// HOJA
  match = texto.match(/hoja\s(\d+)/);
if (match) {
  hoja.value = match[1];
  feedback("Hoja " + match[1]);
}
// HOJA CAIDA
  match = texto.match(/hoja caida\s(\d+(\.\d+)?)/);
if (match) {
  caida.value = match[1];
  feedback("Hoja caída " + match[1]);
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
// PARTE
  match = texto.match(/parte\s(\d+)/);
if (match) {
  parte.value = match[1];
  feedback("Parte " + match[1]);
}
// PARTE PLANA
if (texto.includes("parte plana ok")) {
  partePlana.value = "OK";
  feedback("Parte plana OK");
}

if (texto.includes("parte plana no ok")) {
  partePlana.value = "NOT_OK";
  feedback("Parte plana no OK");
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
// OBSERVACIONES
  if (texto.includes("observaciones")) {
  let obs = texto.split("observaciones")[1];
  observaciones.value = obs.trim();
  feedback("Observaciones registradas");
}

  // GUARDAR
 match = texto.match(/estacion\s(\d)/);
if (match) {
  estacion.value = "E" + match[1];
  feedback("Estación " + match[1]);
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
