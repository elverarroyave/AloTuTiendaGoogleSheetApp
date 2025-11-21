function openAbonoSidebar(){
    let html = HtmlService.createHtmlOutputFromFile("addAbonoForm").setTitle("Agregar Abono");
    SpreadsheetApp.getUi().showSidebar(html);
}


// ==========================================
// 2. LÓGICA DE ABONOS (NUEVO)
// ==========================================

function createAbono(form, inOutSeq) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetIngresoEgreso = ss.getSheetByName("INGRESOS_EGRESOS"); 
  const targetRowIngresoEgreso = 4;
  const sheetAbonos = ss.getSheetByName("ABONOS"); 
  const targetRowAbonos = 2;
  
  const inOutNewCode = inOutSeq.PREFIX + inOutSeq.NEXT; // Ej: ABO101

  //Obtener secuencia para abonoSeq
  const abonoSeq = getSequencesAbono();
  const abonoNewCode = abonoSeq.PREFIX + abonoSeq.NEXT;

  // 2. Insertar Fila
  sheetIngresoEgreso.insertRowBefore(targetRowIngresoEgreso);

  // 3. Preparar Datos
  const now = getCurrentDateTime();
  const formulaClientName = '=XLOOKUP(ABONOS[COD_VENTA],CONTROL_VENTAS[CODIGO],CONTROL_VENTAS[CLIENTE],"CLIENTE NO ENCONTRADO")';
  const formulaProductName = '=XLOOKUP(ABONOS[COD_VENTA],CONTROL_VENTAS[CODIGO],CONTROL_VENTAS[PRODUCTO],"PRODUCTO NO ENCONTRADO")';
  const valorAbono = Number(form.abonoValue);
  const detalle = `Abono para venta ${form.ventaCode}`;

  // 4. Escribir Datos (Estructura asumida: A: FECHA | B: NUM_ABONO | C: COD_ABONO | F: VALOR | H: METODO_PAGO)
  sheetIngresoEgreso.getRange('A' + targetRowIngresoEgreso).setValue(now);
  sheetIngresoEgreso.getRange('B' + targetRowIngresoEgreso).setValue('ABONO');
  sheetIngresoEgreso.getRange('C' + targetRowIngresoEgreso).setValue(inOutSeq.NEXT);                       
  sheetIngresoEgreso.getRange('D' + targetRowIngresoEgreso).setValue(inOutNewCode);
  sheetIngresoEgreso.getRange('E' + targetRowIngresoEgreso).setValue(detalle);
  sheetIngresoEgreso.getRange('F' + targetRowIngresoEgreso).setValue(valorAbono);       
  sheetIngresoEgreso.getRange('H' + targetRowIngresoEgreso).setValue(form.metodoPago);

  // Escribir datos en tabla Abono
  sheetAbonos.getRange('A' + targetRowAbonos).setValue(now);
  sheetAbonos.getRange('B' + targetRowAbonos).setValue(abonoNewCode);
  sheetAbonos.getRange('C' + targetRowAbonos).setValue(inOutNewCode);
  sheetAbonos.getRange('D' + targetRowAbonos).setValue(form.ventaCode);
  sheetAbonos.getRange('E' + targetRowAbonos).setValue(formulaClientName);
  sheetAbonos.getRange('F' + targetRowAbonos).setValue(formulaProductName);
  sheetAbonos.getRange('G' + targetRowAbonos).setValue(valorAbono);
  
  // 5. Actualizar Secuencia
  setSequences(inOutSeq.NUMBER, inOutSeq.NEXT);
  setSequences(abonoSeq.NUMBER, abonoSeq.NEXT);
               
  return {
    success: true,
    code: inOutNewCode,
    value: Number(form.abonoValue)
  };
}

function getSequencesAbono(){
  let sequences = getSequences();
  return sequences.find(s => s.PREFIX === 'ABONO');
}