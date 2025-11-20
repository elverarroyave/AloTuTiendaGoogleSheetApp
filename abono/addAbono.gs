function openAbonoSidebar(){
    let html = HtmlService.createHtmlOutputFromFile("addAbonoForm").setTitle("Agregar Abono");
    SpreadsheetApp.getUi().showSidebar(html);
}


// ==========================================
// 2. LÓGICA DE ABONOS (NUEVO)
// ==========================================

function createAbono(form, abonoSeq) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("INGRESOS_EGRESOS"); 
  const targetRow = 4; // Insertar en fila 3
  
  const nextNum = abonoSeq.NEXT;
  const fullCode = abonoSeq.PREFIX + nextNum; // Ej: ABO101

  // 2. Insertar Fila
  sheet.insertRowBefore(targetRow);

  // 3. Preparar Datos
  const now = getCurrentDateTime();
  const formulaF = '=XLOOKUP(INGRESOS_EGRESOS[COD_VENTA],CONTROL_VENTAS[COD_VENTA],CONTROL_VENTAS[CLIENTE],"CLIENTE NO ENCONTRADO")';
  const formulaG = '=XLOOKUP(INGRESOS_EGRESOS[COD_VENTA],CONTROL_VENTAS[COD_VENTA],CONTROL_VENTAS[PRODUCTO],"PRODUCTO NO ENCONTRADO")';

  // 4. Escribir Datos (Estructura asumida: A: FECHA | B: NUM_ABONO | C: COD_ABONO | D: COD_VENTA | E: VALOR | F: METODO_PAGO)
  sheet.getRange('A' + targetRow).setValue(now);
  sheet.getRange('B' + targetRow).setValue('ABONO');
  sheet.getRange('C' + targetRow).setValue(nextNum);                       
  sheet.getRange('D' + targetRow).setValue(fullCode);                      
  sheet.getRange('E' + targetRow).setValue(form.ventaCode);               
  sheet.getRange('F' + targetRow).setFormula(formulaF);           
  sheet.getRange('G' + targetRow).setFormula(formulaG);  
  sheet.getRange('I' + targetRow).setValue(Number(form.abonoValue));       
  sheet.getRange('K' + targetRow).setValue(form.metodoPago);
  
  // 5. Actualizar Secuencia
  setSequences(abonoSeq.NUMBER, nextNum);
               
  return {
    success: true,
    code: fullCode,
    value: Number(form.abonoValue)
  };
}