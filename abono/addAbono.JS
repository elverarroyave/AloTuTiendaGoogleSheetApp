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
  sheetAbonos.insertRowBefore(targetRowAbonos);

  try{
      // 3. Preparar Datos
    const now = getCurrentDateTime();
    const formulaClientName = '=XLOOKUP(ABONOS[COD_VENTA],CONTROL_VENTAS[CODIGO],CONTROL_VENTAS[CLIENTE],"CLIENTE NO ENCONTRADO")';
    const formulaProductName = '=XLOOKUP(ABONOS[COD_VENTA],CONTROL_VENTAS[CODIGO],CONTROL_VENTAS[PRODUCTO],"PRODUCTO NO ENCONTRADO")';
    const valorAbono = Number(form.abonoValue);
    const detalle = `Abono para venta ${form.ventaCode}`;

    // 4. Escribir Datos (Estructura asumida: A: FECHA | B: NUM_ABONO | C: COD_ABONO | F: VALOR | H: METODO_PAGO)
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.FECHA + targetRowIngresoEgreso).setValue(now);
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.REFERENCIA + targetRowIngresoEgreso).setValue('ABONO');
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.NUM + targetRowIngresoEgreso).setValue(inOutSeq.NEXT);                       
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.CODIGO + targetRowIngresoEgreso).setValue(inOutNewCode);
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.DETALLE + targetRowIngresoEgreso).setValue(detalle);
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.ENTRADA + targetRowIngresoEgreso).setValue(valorAbono);       
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.M_PAGO + targetRowIngresoEgreso).setValue(form.metodoPago);

    // Escribir datos en tabla Abono
    sheetAbonos.getRange(ABONOS.FECHA + targetRowAbonos).setValue(now);
    sheetAbonos.getRange(ABONOS.CODIGO + targetRowAbonos).setValue(abonoNewCode);
    sheetAbonos.getRange(ABONOS.COD_IN_OUT + targetRowAbonos).setValue(inOutNewCode);
    sheetAbonos.getRange(ABONOS.COD_VENTA + targetRowAbonos).setValue(form.ventaCode);
    sheetAbonos.getRange(ABONOS.CLIENTE + targetRowAbonos).setValue(formulaClientName);
    sheetAbonos.getRange(ABONOS.PRODUCTO + targetRowAbonos).setValue(formulaProductName);
    sheetAbonos.getRange(ABONOS.VALOR + targetRowAbonos).setValue(valorAbono);
    
    // 5. Actualizar Secuencia
    setSequences(inOutSeq.NUMBER, inOutSeq.NEXT);
    setSequences(abonoSeq.NUMBER, abonoSeq.NEXT);
                
    return {
      success: true,
      code: inOutNewCode,
      value: Number(form.abonoValue)
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