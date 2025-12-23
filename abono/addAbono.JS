function openAbonoSidebar() {
  let html = HtmlService.createHtmlOutputFromFile("addAbonoForm").setTitle("Agregar Abono");
  SpreadsheetApp.getUi().showSidebar(html);
}

function getSalesData() {
  try {
    if (typeof CONTROL_VENTAS === 'undefined') {
      throw new Error("CONTROL_VENTAS no está definido. Asegúrate de que tables.js se cargue antes o esté en el proyecto.");
    }
    const getSales = getRowDataAsObjects(CONTROL_VENTAS.NAME_TABLE, 3, 1, 19);
    console.log('getSales count: ', getSales.length);
    // Stringify to ensure safe transport over google.script.run
    return JSON.stringify(getSales);
  } catch (e) {
    console.error("Error in getSalesData:", e);
    return JSON.stringify({ error: e.message });
  }
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
  const abonoSeq = getSequence('ABONO');
  const abonoNewCode = abonoSeq.PREFIX + abonoSeq.NEXT;

  // 2. Insertar Fila
  sheetAbonos.insertRowBefore(targetRowAbonos);

  try {
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

    let abonoResult = getDataAbono(form.ventaCode);

    return {
      date: now,
      success: true,
      code: inOutNewCode,
      value: Number(form.abonoValue),
      ventaCode: form.ventaCode,
      metodoPago: form.metodoPago,
      cliente: abonoResult.cliente,
      producto: abonoResult.producto,
      resta: abonoResult.resta,
      precio: abonoResult.precio,
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

function getDataAbono(saleCode) {
  const sheetName = CONTROL_VENTAS.NAME_TABLE;
  const dataStartRow = CONTROL_VENTAS.TARGET_ROW;
  const startColumn = 1;
  const endColumn = 20;
  const nameColumnCode = "CODIGO";
  const code = saleCode;
  const result = getRowDataAsObjectByNameColumn(sheetName, dataStartRow, startColumn, endColumn, nameColumnCode, code);
  console.log('Result: ', result); // <--- imprime el objeto encontrado con valores
  if (result != null) {
    return {
      cliente: result.CLIENTE,
      producto: result.PRODUCTO,
      total: result.TOTAL,
      resta: result.RESTA,
      precio: result.PRECIO,
    }
  } else {
    throw new Error("No se encontro la venta");
  }
}