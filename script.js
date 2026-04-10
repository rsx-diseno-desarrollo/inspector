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

const recordCount = document.getElementById("recordCount");
const previewTableBody = document.querySelector("#previewTable tbody");

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
      <td>${index + 1}</td>
      <td>${r.time}</td>
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

// ============================
// Limpiar formulario
// ============================

function limpiarFormulario() {
  inspectionForm.reset();
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
});
