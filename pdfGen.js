// ============================
// TOLERANCIAS - TRATAMIENTOS TÉRMICOS
// ============================

// Torcimiento LF y LM: máximo 1.5
function evaluarTorcimiento(valor) {
  return valor <= 1.5 ? "OK" : "NO_OK";
}

// Hoja caída: rango 0.80 a 1.50
function evaluarHojaCaida(valor) {
  return valor >= 0.8 && valor <= 1.5 ? "OK" : "NO_OK";
}

// Evaluación completa de un registro
function evaluarRegistro(registro) {
  return {
    lf: evaluarTorcimiento(Number(registro.lf)),
    lm: evaluarTorcimiento(Number(registro.lm)),
    caida: evaluarHojaCaida(Number(registro.caida))
  };
}

// Colores para tolerancias (suaves y corporativos)
const COLOR_OK = [233, 252, 235];     // verde suave
const COLOR_NO_OK = [255, 224, 224];  // rojo suave

function generarPDF(report) {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  
// ===== ENCABEZADO =====
doc.setFont("helvetica", "bold");
doc.setFontSize(16);
doc.setTextColor(0, 0, 0);
doc.text(
  "HOJA DE INSPECCIÓN – TRATAMIENTOS TÉRMICOS",
  pageWidth / 2,
  15,
  { align: "center" }
);

doc.setFontSize(11);
doc.setFont("helvetica", "normal");
doc.setTextColor(80);
doc.text(
  "REGISTRO DE INSPECCIÓN DE TRATAMIENTOS TÉRMICOS",
  pageWidth / 2,
  22,
  { align: "center" }
);

doc.setDrawColor(245, 124, 0); // naranja marca
doc.setLineWidth(0.8);
doc.line(10, 26, pageWidth - 10, 26);

  // =========================
  // DATOS DEL REPORTE
  // =========================
  doc.setFontSize(9);
doc.setTextColor(0);

doc.text(`Inspector: ${report.inspector}`, 12, 32);
doc.text(`Hora del reporte: ${report.hour}`, pageWidth - 70, 32);

// Línea sutil debajo
doc.setDrawColor(200);
doc.setLineWidth(0.3);
doc.line(10, 35, pageWidth - 10, 35);

  // =========================
  // TABLA
  // =========================
  const headers = [[
    "HORA",
    "LÍNEA",
    "ESTACIÓN",
    "NO. PARTE",
    "HOJA",
    "ALTURA",
    "TORC. LF",
    "TORC. LM",
    "PARTE PLANA",
    "HOJA CAÍDA",
    "OBSERVACIONES"
  ]];

  const bodyData = report.registros.map(r => {
  const status = evaluarRegistro(r);

  return {
    data: [
      report.hour,
      r.linea,
      r.estacion,
      r.parte,
      r.hoja,
      r.altura,
      r.lf,
      r.lm,
      r.partePlana,
      r.caida,
      r.observaciones || ""
    ],
    status
  };
});

  // Rellenar filas vacías (formato físico)
while (bodyData.length < 18) {
  bodyData.push({
    data: ["", "", "", "", "", "", "", "", "", "", ""],
    status: {
      lf: "OK",
      lm: "OK",
      caida: "OK"
    }
  });
}

  doc.autoTable({
  startY: 38,
  head: headers,
  body: bodyData.map(row => row.data),
  theme: "grid",

  styles: {
    fontSize: 8,
    cellPadding: 2,
    halign: "center",
    valign: "middle",
    minCellHeight: 8,
    lineWidth: 0.2
  },

  headStyles: {
    fillColor: [233, 252, 235],
    textColor: 0,
    fontStyle: "bold",
    lineWidth: 0.5
  },

  didParseCell: function (data) {
    if (data.section !== "body") return;

    const rowStatus = bodyData[data.row.index].status;

    // Columna TORC. LF → índice 6
    if (data.column.index === 6) {
      data.cell.styles.fillColor =
        rowStatus.lf === "OK" ? COLOR_OK : COLOR_NO_OK;
    }

    // Columna TORC. LM → índice 7
    if (data.column.index === 7) {
      data.cell.styles.fillColor =
        rowStatus.lm === "OK" ? COLOR_OK : COLOR_NO_OK;
    }

    // Columna HOJA CAÍDA → índice 9
    if (data.column.index === 9) {
      data.cell.styles.fillColor =
        rowStatus.caida === "OK" ? COLOR_OK : COLOR_NO_OK;
    }
  },

  alternateRowStyles: {
    fillColor: [242, 242, 242]
  },

  columnStyles: {
    10: { cellWidth: 45, halign: "left" }
  }
});

  // =========================
  // FOOTER
  // =========================
  
doc.setFontSize(8);
doc.setTextColor(100);
doc.text(
  `Documento generado automáticamente • ${new Date().toLocaleString("es-MX")}`,
  pageWidth / 2,
  pageHeight - 10,
  { align: "center" }
);


  doc.save("Reporte_Tratamientos_Termicos.pdf");
}
