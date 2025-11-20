function openControlIngresoModal(){
    let html = HtmlService.createHtmlOutputFromFile("createControlIngresoForm")
        .setWidth(900)
        .setHeight(750);
    SpreadsheetApp.getUi().showModalDialog(html, "Control de Ingreso de Mercancía");
}

// ==========================================
// 2. LÓGICA DE CONTROL INGRESO (NUEVO)
// ==========================================

function createControlIngreso(form) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("CONTROL_INGRESO");
  const targetRow = 3; // Insertar en fila 3

  // 1. Obtener Secuencia
  const sequences = getSequences(); 
  const ingresoSequence = sequences.find(seq => seq.NAME === 'INGRESO'); 
  
  if (!ingresoSequence) throw new Error("No se encontró la secuencia de INGRESO");

  const nextNum = ingresoSequence.NEXT; 
  const fullCode = ingresoSequence.PREFIX + nextNum; // Ej: IN186

  // 2. Insertar Fila
  sheet.insertRowBefore(targetRow);

  // 3. Preparar Datos Calculados
  let now = new Date();
  let timeZone = ss.getSpreadsheetTimeZone();
  let formattedDate = Utilities.formatDate(now, timeZone, "MM/dd/yyyy HH:mm");
  
  // Parsear números para asegurar cálculos correctos
  const cantidad = Number(form.cantidad);
  const precioUnitario = Number(form.precioUnitario);
  const total = cantidad * precioUnitario;

  // 4. Escribir Datos (Mapeo exacto a columnas A-N)
  sheet.getRange('A' + targetRow).setValue(formattedDate);          // FECHA
  sheet.getRange('B' + targetRow).setValue(nextNum);                // NUM_IN
  sheet.getRange('C' + targetRow).setValue(fullCode);               // COD_INGRESO
  sheet.getRange('D' + targetRow).setValue(form.empleado);          // EMPLEADO QUE RECIBE
  sheet.getRange('E' + targetRow).setValue(form.codProv);           // COD_PROV
  sheet.getRange('F' + targetRow).setValue(form.nombreProv);        // PROVEEDOR
  sheet.getRange('G' + targetRow).setValue(form.codPrdt);           // COD_PRDT
  sheet.getRange('H' + targetRow).setValue(form.nombrePrdt);        // PRODUCTO
  sheet.getRange('I' + targetRow).setValue(cantidad);               // CANTIDAD
  sheet.getRange('J' + targetRow).setValue(precioUnitario);         // PRECIO UNITARIO
  sheet.getRange('K' + targetRow).setValue(form.metodoPago);        // MÉTODO DE PAGO
  sheet.getRange('L' + targetRow).setValue(total);                  // TOTAL
  sheet.getRange('M' + targetRow).setValue(form.estado);            // ESTADO
  sheet.getRange('N' + targetRow).setValue(form.enlaceFactura);     // ENLACE DE FACTURA

  // 5. Actualizar Secuencia
  setSequences(ingresoSequence.NUMBER, nextNum);

  return {
    success: true,
    code: fullCode,
    total: total
  };
}
