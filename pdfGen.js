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

  const body = report.registros.map(r => ([
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
  ]));

  // Rellenar filas vacías (formato físico)
  while (body.length < 18) {
    body.push(["", "", "", "", "", "", "", "", "", "", ""]);
  }

  doc.autoTable({
    startY: 38,
    head: headers,
    body,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      align: "center",
      minCellHeight: 8,
      lineWidth: 0.2
    },
    
headStyles: {
  fillColor: [255, 243, 231], // naranja 50
  textColor: 0,
  fontStyle: "bold",
  lineWidth: 0.5
},


styles: {
  fontSize: 8,
  cellPadding: 2,
  halign: "center",
  valign: "middle",
  minCellHeight: 8,
  lineWidth: 0.2
},
alternateRowStyles: {
  fillColor: [242, 242, 242] // gris claro
},

    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 22 },
      7: { cellWidth: 22 },
      8: { cellWidth: 24 },
      9: { cellWidth: 24 },
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
