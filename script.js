// ============================
// Supabase Client
// ============================
const SUPABASE_URL = "https://kjdribojjoiigftttwwu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bHihm-V59U5uVz-sT8r3-g_iqlsVy_Q";

// CLIENTE REAL
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ============================
// Estado del reporte
// ============================

let report = {
  inspector: "",
  hour: "",
  registros: []
};

// ID del reporte activo en Supabase
let activeReportId = null;

// ============================
// Referencias al DOM
// ============================

const inspectionForm = document.getElementById("inspectionForm");
const startButton = document.getElementById("startReport");
const startSection = document.getElementById("start-section");
const reportContent = document.getElementById("report-content");

const saveBtn = document.getElementById("saveInspection");
const generateBtn = document.getElementById("generateReport");
const cancelBtn = document.getElementById("cancelReport");

const recordCount = document.getElementById("recordCount");
const previewTableBody = document.querySelector("#previewTable tbody");

const searchBtn = document.getElementById("searchReport");
const searchSection = document.getElementById("search-section");
const toggleAdvancedBtn = document.getElementById("toggleAdvanced");
const advancedSection = document.getElementById("advanced-search");
const backHomeBtn = document.getElementById("backHome");

const voiceControl = document.getElementById("voiceControl");

// ============================
// Buscar reporte
// ============================

startButton.addEventListener("click", () => {
  startSection.style.display = "none";
  reportContent.style.display = "block";
});

// ============================
// Guardar registro
// ============================

function validarRegistro() {
  const faltantes = [];

  if (!linea.value) faltantes.push("línea");
  if (!estacion.value) faltantes.push("estación");
  if (!parte.value) faltantes.push("número de parte");
  if (!hoja.value) faltantes.push("hoja");
  if (!altura.value) faltantes.push("altura");
  if (!lf.value) faltantes.push("lado fijo");
  if (!lm.value) faltantes.push("lado móvil");
  if (!partePlana.value) faltantes.push("parte plana");
  if (!caida.value) faltantes.push("hoja caída");

  return faltantes;
}

function mostrarMensaje(texto) {
  let box = document.getElementById("mensajeTemporal");

  if (!box) {
    box = document.createElement("div");
    box.id = "mensajeTemporal";
    box.style.position = "fixed";
    box.style.bottom = "100px";
    box.style.right = "20px";
    box.style.background = "#ffe0e0";
    box.style.color = "#900";
    box.style.padding = "10px 14px";
    box.style.borderRadius = "8px";
    box.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    box.style.zIndex = "1000";
    document.body.appendChild(box);
  }

  box.textContent = texto;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}


saveBtn.addEventListener("click", async () => {

  const inspector = document.getElementById("inspectorName").value.trim();
  const reportHour = document.getElementById("reportHour").value;
  const area = document.getElementById("areaSelect").value;

  if (!inspector || !reportHour) {
    alert("Ingrese el nombre del inspector y la hora antes de guardar registros.");
    return;
  }

  // ✅ SOLO la primera vez se crea el reporte
  if (!activeReportId) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();

    const folio = `R-${area}-${dd}${mm}${yyyy}-01`; // luego lo automatizamos

    const { data, error } = await supabase
      .from("reports")
      .insert({
        folio,
        area,
        inspector,
        report_date: `${yyyy}-${mm}-${dd}`,
        status: "open"
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Error al crear el reporte");
      return;
    }

    activeReportId = data.id;
  }

  // ✅ Ahora sí guardas el registro
  const registro = {
    report_id: activeReportId,
    report_hour: reportHour,
    linea: linea.value,
    estacion: estacion.value,
    parte: parte.value,
    hoja: hoja.value,
    altura: altura.value,
    torc_lf: lf.value,
    torc_lm: lm.value,
    parte_plana: partePlana.value,
    hoja_caida: caida.value,
    obs: observaciones.value || null
  };

  const { error: regError } = await supabase
    .from("inspec_records_tsts")
    .insert(registro);

  if (regError) {
    console.error(regError);
    alert("Error al guardar el registro");
    return;
  }

  report.registros.push(registro);
  actualizarPreview();
  limpiarFormulario();
  generateBtn.disabled = false;
});

// ============================
// Actualizar tabla de vista previa
// ============================

function actualizarPreview() {
  previewTableBody.innerHTML = "";

  report.registros.forEach((r, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>
       <button class="btn-delete" data-index="${index}">❌</button>
      </td>
      <td>${index + 1}</td>
      <td>${r.linea}</td>
      <td>${r.estacion}</td>
      <td>${r.parte}</td>
      <td>${r.hoja}</td>
      <td>${r.altura}</td>
      <td>${r.lf}</td>
      <td>${r.lm}</td>
      <td>${r.partePlana}</td>
      <td>${r.caida}</td>
      <td>${r.observaciones}</td>
    `;

    previewTableBody.appendChild(fila);
  });

  recordCount.textContent = report.registros.length;
}

previewTableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const index = parseInt(e.target.dataset.index, 10);

    if (confirm("¿Eliminar este registro?")) {
      report.registros.splice(index, 1);
      actualizarPreview();

      if (report.registros.length === 0) {
        generateBtn.disabled = true;
      }
    }
  }
});

function resetApp() {
  // Reset estado del reporte
  report = {
    inspector: "",
    hour: "",
    registros: []  
  };

  // Limpiar UI
  recordCount.textContent = "0";
  previewTableBody.innerHTML = "";
  inspectionForm.reset();
  document.getElementById("inspectorName").value = "";
  document.getElementById("reportHour").value = "";
  generateBtn.disabled = true;

  // Volver a pantalla inicial
  reportContent.style.display = "none";
  startSection.style.display = "block";

  voiceControl.classList.add("hidden");

// Asegurarse de apagar micrófono
if (window.dictadoActivo) {
  detenerDictado();
  }
}

// ============================
// Limpiar formulario
// ============================


function limpiarFormulario() {
  // Guardamos temporalmente el No. de Parte
  const parteActual = document.getElementById("parte").value;

  inspectionForm.reset();

  // Restauramos el No. de Parte
  document.getElementById("parte").value = parteActual;
}

generateBtn.addEventListener("click", async () => {
  if (!activeReportId) return;

  generarPDF(report);

  const { error } = await supabase
    .from("reports")
    .update({ status: "closed" })
    .eq("id", activeReportId);

  if (error) {
    console.error(error);
    alert("Error al cerrar el reporte");
    return;
  }

  resetApp();
});

cancelBtn.addEventListener("click", () => {
  const confirmCancel = confirm(
    "¿Estás seguro de cancelar el reporte?\nSe perderán todos los registros capturados."
  );

  if (!confirmCancel) return;

  resetApp();
});


// ============================
// Registro del Service Worker
// ============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Service Worker registrado:', registration.scope);
      })
      .catch(error => {
        console.error('Error al registrar Service Worker:', error);
      });
  });
}
