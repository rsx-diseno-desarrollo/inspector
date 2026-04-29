// ===============================
// CONFIGURACIÓN
// ===============================

window.dictadoActivo = false;
let esperandoComando = false;

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const voiceToggle = document.getElementById("voiceToggle");
const voiceStatus = document.getElementById("voiceStatus");

if (voiceToggle) {
  voiceToggle.addEventListener("click", () => {
    if (!dictadoActivo) {
      iniciarDictado();
    } else {
      detenerDictado();
    }
  });
 }

recognition.lang = "es-MX";
recognition.continuous = true;
recognition.interimResults = false;

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

function iniciarDictado() {
  dictadoActivo = true;
  window.dictadoActivo = true;

  try {
  recognition.start();
} catch (e) {
  console.warn("Micrófono ya activo");
}

  voiceToggle.classList.remove("off");
  voiceToggle.classList.add("on");
  voiceStatus.textContent = "Escuchando…";

  feedback("Modo dictado activado");
}

function detenerDictado() {
  dictadoActivo = false;
  window.dictadoActivo = false;

  recognition.stop();

  voiceToggle.classList.remove("on");
  voiceToggle.classList.add("off");
  voiceStatus.textContent = "Dictado apagado";

  feedback("Modo dictado desactivado");
}

function activarModoComando() {
  esperandoComando = true;

  reproducirBeep();

  // Timeout de seguridad (opcional)
  setTimeout(() => {
    esperandoComando = false;
  }, 6000);
}

function reproducirBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.value = 800;
  osc.type = "sine";

  osc.start();
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.stop(ctx.currentTime + 0.15);
}

function textoANumero(texto) {
  const mapa = {
    uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
    seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10
  };

  Object.keys(mapa).forEach(palabra => {
    texto = texto.replace(palabra, mapa[palabra]);
  });

  return texto;
}

// ===============================
// RESULTADO
// ===============================
recognition.onresult = (event) => {
  let texto = event.results[event.results.length - 1][0].transcript;
  texto = normalizarTexto(texto);

  // FASE 1: detectar wake word
  if (texto.includes("inspector") && !esperandoComando) {
  activarModoComando();
  return;
}

  // FASE 2: ejecutar comando
  if (esperandoComando) {
  if (texto.length < 3) return; // evita ruido corto

  procesarTexto(texto);
  esperandoComando = false;
}
};

recognition.onend = () => {
  if (dictadoActivo) {
    recognition.start();
  }
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
    feedback("Lado Fijo " + match[2]);
  }

  // LM
  match = texto.match(/(lado movil|lm)\s(\d+(\.\d+)?)/);
  if (match) {
    lm.value = match[2];
    feedback("Lado Movil " + match[2]);
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
