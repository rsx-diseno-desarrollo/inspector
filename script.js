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
// Iniciar reporte
// ============================

startButton.addEventListener("click", () => {
  startSection.style.display = "none";
  reportContent.style.display = "block";
});

// ============================
// Guardar registro
// ============================

saveBtn.addEventListener("click", () => {
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
    observaciones: observaciones.value
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

generateBtn.addEventListener("click", () => {
  report.inspector = document.getElementById("inspectorName").value;
  report.hour = document.getElementById("reportHour").value;

  if (!report.inspector || !report.hour) {
    alert("Ingrese el nombre del inspector y la hora del reporte.");
    return;
  }

  if (report.registros.length === 0) {
    alert("No hay registros para generar el reporte.");
    return;
  }

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
