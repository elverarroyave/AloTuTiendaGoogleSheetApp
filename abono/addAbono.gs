function openAbonoSidebar(){
    let html = HtmlService.createHtmlOutputFromFile("addAbonoForm").setTitle("Agregar Abono");
    SpreadsheetApp.getUi().showSidebar(html);
}


// ==========================================
// 2. LÓGICA DE ABONOS (NUEVO)
// ==========================================

function createAbono(form, abonoSeq) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetIngresoEgreso = ss.getSheetByName("INGRESOS_EGRESOS"); 
  const targetRowIngresoEgreso = 4;
  const sheetAbonos = ss.getSheetByName("ABONOS"); 
  const targetRowAbonos = 2;
  
  const nextNum = abonoSeq.NEXT;
  const inOutNewCode = abonoSeq.PREFIX + nextNum; // Ej: ABO101

  //Obtener secuencia para abonoSeq
  const abonoSeq = getSequencesAbono();
  const abonoNewCode = abonoSeq.PREFIX + abonoSeq.NEXT;

  // 2. Insertar Fila
  sheetIngresoEgreso.insertRowBefore(targetRowIngresoEgreso);

  // 3. Preparar Datos
  const now = getCurrentDateTime();
  const formulaClientName = '=XLOOKUP(INGRESOS_EGRESOS[COD_VENTA],CONTROL_VENTAS[COD_VENTA],CONTROL_VENTAS[CLIENTE],"CLIENTE NO ENCONTRADO")';
  const formulaProductName = '=XLOOKUP(INGRESOS_EGRESOS[COD_VENTA],CONTROL_VENTAS[COD_VENTA],CONTROL_VENTAS[PRODUCTO],"PRODUCTO NO ENCONTRADO")';
  const valorAbono = Number(form.abonoValue);

  // 4. Escribir Datos (Estructura asumida: A: FECHA | B: NUM_ABONO | C: COD_ABONO | F: VALOR | H: METODO_PAGO)
  sheetIngresoEgreso.getRange('A' + targetRowIngresoEgreso).setValue(now);
  sheetIngresoEgreso.getRange('B' + targetRowIngresoEgreso).setValue('ABONO');
  sheetIngresoEgreso.getRange('C' + targetRowIngresoEgreso).setValue(nextNum);                       
  sheetIngresoEgreso.getRange('D' + targetRowIngresoEgreso).setValue(inOutNewCode);                      
  //sheetIngresoEgreso.getRange('F' + targetRowIngresoEgreso).setFormula(formulaF);           
  //sheetIngresoEgreso.getRange('G' + targetRowIngresoEgreso).setFormula(formulaG);  
  sheetIngresoEgreso.getRange('F' + targetRowIngresoEgreso).setValue(valorAbono);       
  sheetIngresoEgreso.getRange('H' + targetRowIngresoEgreso).setValue(form.metodoPago);

  // Escribir datos en tabla Abono
  sheetAbonos.getRange('A' + targetRowAbonos).setValue(now);
  sheetAbonos.getRange('B' + targetRowAbonos).setValue(abonoNewCode);
  sheetAbonos.getRange('C' + targetRowAbonos).setValue(inOutNewCode);
  sheetAbonos.getRange('D' + targetRowAbonos).setValue(form.ventaCode);
  sheetAbonos.getRange('E' + targetRowAbonos).setValue(formulaClientName);
  sheetAbonos.getRange('F' + targetRowAbonos).setValue(formulaProductName);
  sheetAbonos.getRange('G' + targetRowAbonos).setValue(fvalorAbono);
  
  // 5. Actualizar Secuencia
  setSequences(abonoSeq.NUMBER, nextNum);
               
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