const supabaseDB = window.supabaseClient;
// ============================
// Estado del reporte
// ============================

let report = {
  inspector: "",
  hour: "",
  registros: []
};

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

const executeSearchBtn = document.getElementById("executeSearch");
const resultsSection = document.getElementById("search-results");
const resultsTableBody = document.querySelector("#resultsTable tbody");

const voiceControl = document.getElementById("voiceControl");

// ============================
// Buscar reporte
// ============================

searchBtn.addEventListener("click", () => {
  startSection.style.display = "none";
  reportContent.style.display = "none";
  searchSection.style.display = "block";
});

toggleAdvancedBtn.addEventListener("click", () => {
  const isVisible = advancedSection.style.display === "block";

  advancedSection.style.display = isVisible ? "none" : "block";
  toggleAdvancedBtn.textContent = isVisible
    ? "▸ Búsqueda avanzada"
    : "▾ Búsqueda avanzada";
});

backHomeBtn.addEventListener("click", () => {
  searchSection.style.display = "none";
  startSection.style.display = "block";
});

// ============================
// Render tabla de busqueda
// ============================
function renderSearchResults(data) {
  resultsTableBody.innerHTML = "";

  if (!data || data.length === 0) {
    resultsTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;">
          No se encontraron reportes
        </td>
      </tr>
    `;
    resultsSection.style.display = "block";
    return;
  }

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.folio}</td>
      <td>${row.report_date}</td>
      <td>${row.inspector}</td>
      <td>${row.lineas}</td>
      <td>${row.partes_evaluadas}</td>
      <td><button disabled>Abrir</button></td>
    `;

    resultsTableBody.appendChild(tr);
  });

  resultsSection.style.display = "block";
}

executeSearchBtn.addEventListener("click", async () => {

const folio = document.getElementById("searchFolio").value.trim();
const date = document.getElementById("searchDate").value;
const inspector = document.getElementById("searchInspector").value.trim();
const linea = document.getElementById("searchLinea").value;
const hour = document.getElementById("searchHour").value;


if (!folio && !date && !inspector && !linea && !hour) {
  alert("Ingrese al menos un criterio de búsqueda.");
  return;
}

  let query = supabaseDB
  .from("view_reports_summary")
  .select("*")
  .order("report_date", { ascending: false });

// ===== FILTROS BASICOS =====
if (folio) {
  query = query.ilike("folio", `%${folio}%`);
}

if (date) {
  query = query.eq("report_date", date);
}

// ===== FILTROS AVANZADOS =====
if (inspector) {
  query = query.ilike("inspector", `%${inspector}%`);
}

if (linea) {
  // Se usa ilike porque "lineas" es un string agregador (L1, L4)
  query = query.ilike("lineas", `%${linea}%`);
}

if (hour) {
  // Si luego agregas horas a la view, aquí se conecta
  query = query.ilike("horas", `%${hour}%`);
}

  const { data, error } = await query;

  if (error) {
    console.error(error);
    alert("Error al buscar reportes.");
    return;
  }

  renderSearchResults(data);
});

// ============================
// Iniciar reporte
// ============================

startButton.addEventListener("click", () => {
  startSection.style.display = "none";
  reportContent.style.display = "block";
  voiceControl.classList.remove("hidden");
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


saveBtn.addEventListener("click", () => {

  const faltantes = validarRegistro();
  if (faltantes.length > 0) {
    mostrarMensaje("Faltan datos: " + faltantes.join(", "));
    return;
  }

  const registro = {
    linea: linea.value,
    estacion: estacion.value,
    parte: parte.value,
    hoja: hoja.value,
    altura: altura.value,
    lf: lf.value,
    lm: lm.value,
    partePlana: partePlana.value,
    caida: caida.value,
    observaciones: observaciones.value || ""
  };

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
  const lineaActual = document.getElementById("linea").value;

  inspectionForm.reset();

  // Restauramos el No. de Parte
  document.getElementById("parte").value = parteActual;
  document.getElementById("linea").value = lineaActual;
}

generateBtn.addEventListener("click", async () => {

  const inspector = document.getElementById("inspectorName").value.trim();
  const reportHour = document.getElementById("reportHour").value;
  const area = document.getElementById("areaSelect").value;

  if (!inspector || !reportHour) {
    alert("Ingrese el nombre del inspector y la hora del reporte.");
    return;
  }

  if (report.registros.length === 0) {
    alert("No hay registros para generar el reporte.");
    return;
  }

  // Fecha
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const reportDate = `${yyyy}-${mm}-${dd}`;
  
  // Calcular consecutivo
  const { data: existingReports, error: countError } = await supabaseDB
    .from("reports")
    .select("id")
    .eq("area", area)
    .eq("report_date", reportDate);
  
  if (countError) {
    console.error(countError);
    alert("Error al calcular el consecutivo del reporte.");
    return;
  }
  
  const consecutivo = existingReports.length + 1;
  const consecutivoFormatted = String(consecutivo).padStart(2, "0");
  
  // Folio FINAL
  const folio = `R-${area}-${dd}${mm}${yyyy}-${consecutivoFormatted}`;

  const { data: reportData, error: reportError } = await supabaseDB
    .from("reports")
    .insert({
      folio,
      area,
      inspector,
      report_date: reportDate,
      status: "closed"
    })
    .select()
    .single();

  if (reportError) {
    console.error(reportError);
    alert("Error al guardar el reporte.");
    return;
  }

  const reportId = reportData.id;

  // =========================
  // 2. CREAR REGISTROS
  // =========================
  const registrosParaDB = report.registros.map(r => ({
    report_id: reportId,
    report_hour: reportHour,
    linea: r.linea,
    estacion: r.estacion,
    parte: r.parte,
    hoja: r.hoja,
    altura: r.altura,
    torc_lf: r.lf,
    torc_lm: r.lm,
    parte_plana: r.partePlana,
    hoja_caida: r.caida,
    obs: r.observaciones || null
  }));

  const { error: recordsError } = await supabaseDB
    .from("inspec_records_tsts")
    .insert(registrosParaDB);

  if (recordsError) {
    console.error(recordsError);
    alert("Error al guardar los registros.");
    return;
  }

  // =========================
  // 3. PDF + RESET
  // =========================
  generarPDF(report);
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
