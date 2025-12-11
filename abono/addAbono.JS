function openAbonoSidebar(){
    let html = HtmlService.createHtmlOutputFromFile("addAbonoForm").setTitle("Agregar Abono");
    SpreadsheetApp.getUi().showSidebar(html);
}


// ==========================================
// 2. LÓGICA DE ABONOS (NUEVO)
// ==========================================

function createAbono(form) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetIngresoEgreso = ss.getSheetByName(INGRESOS_EGRESOS.NAME_TABLE); 
  const targetRowIngresoEgreso = INGRESOS_EGRESOS.TARGET_ROW;
  const sheetAbonos = ss.getSheetByName("ABONOS"); 
  const targetRowAbonos = 2;

  //Obtener secuencia para abonoSeq
  const abonoSeq = getSequencesAbono();
  const abonoNewCode = abonoSeq.PREFIX + abonoSeq.NEXT;

  // 2. Insertar Fila
  sheetAbonos.insertRowBefore(targetRowAbonos);

  try{
      // 3. Preparar Datos
    const now = getCurrentDateTime();
    const formulaClientName = '=XLOOKUP(ABONOS[COD_VENTA],CONTROL_VENTAS[CODIGO],CONTROL_VENTAS[CLIENTE],"CLIENTE NO ENCONTRADO")';
    const formulaProductName = '=XLOOKUP(ABONOS[COD_VENTA],CONTROL_VENTAS[CODIGO],CONTROL_VENTAS[PRODUCTO],"PRODUCTO NO ENCONTRADO")';
    const valorAbono = Number(form.abonoValue);
    const detalle = `Abono para venta ${form.ventaCode}`;

    // Registrar en control de ingresos
    let inOutNewCode = addControlIngreso('ABONO', detalle, valorAbono, form.metodoPago);

    // Escribir datos en tabla Abono
    sheetAbonos.getRange(ABONOS.FECHA + targetRowAbonos).setValue(now);
    sheetAbonos.getRange(ABONOS.CODIGO + targetRowAbonos).setValue(abonoNewCode);
    sheetAbonos.getRange(ABONOS.COD_IN_OUT + targetRowAbonos).setValue(inOutNewCode);
    sheetAbonos.getRange(ABONOS.COD_VENTA + targetRowAbonos).setValue(form.ventaCode);
    sheetAbonos.getRange(ABONOS.CLIENTE + targetRowAbonos).setValue(formulaClientName);
    sheetAbonos.getRange(ABONOS.PRODUCTO + targetRowAbonos).setValue(formulaProductName);
    sheetAbonos.getRange(ABONOS.VALOR + targetRowAbonos).setValue(valorAbono);
    
    // 5. Actualizar Secuencia
    setSequences(abonoSeq.NUMBER, abonoSeq.NEXT);
                
    return {
      date: now,
      success: true,
      code: inOutNewCode,
      value: Number(form.abonoValue),
      ventaCode: form.ventaCode,
      metodoPago: form.metodoPago
    }; 
  } catch (error) {
    console.error("Error al crear el abono. Realizando rollback:", error);
    
    // --- ROLLBACK: ELIMINAR FILA INSERTADA ---
    try {
        sheetIngresoEgreso.deleteRow(targetRowIngresoEgreso);
        sheetAbonos.deleteRow(targetRowAbonos);
        console.log(`Rollback exitoso: Filas ${targetRowIngresoEgreso} y ${targetRowAbonos} eliminadas de INGRESOS_EGRESOS y ABONOS respectivamente.`);
    } catch (e) {
        console.error("Error en rollback de INGRESOS_EGRESOS y ABONOS:", e);
    }
    
    throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${error.message}`);
  }
}

function getSequencesAbono(){
  let sequences = getSequences();
  return sequences.find(s => s.PREFIX === 'ABONO');
}