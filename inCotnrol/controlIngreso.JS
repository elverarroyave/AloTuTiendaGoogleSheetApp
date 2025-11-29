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
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("CONTROL_INGRESO");
  const targetRow = 3; // Insertar en fila 3

  // 1. Obtener Secuencia
  const sequences = getSequences(); 
  const ingresoSequence = sequences.find(seq => seq.NAME === 'INGRESO'); 
  
  if (!ingresoSequence) throw new Error("No se encontró la secuencia de INGRESO");

  const nextNum = ingresoSequence.NEXT; 
  const fullCode = ingresoSequence.PREFIX + nextNum; // Ej: IN186

  try {
    // 2. Insertar Fila
    sheet.insertRowBefore(targetRow);

    // 3. Preparar Datos Calculados
    let now = getCurrentDateTime();
    
    // Parsear números para asegurar cálculos correctos
    const cantidad = Number(form.cantidad);
    const precioUnitario = Number(form.precioUnitario);
    const total = cantidad * precioUnitario;

    const formulaSaldoRestante = '=SUMIF(PAGOS_PEDIDOS[COD_IN],CONTROL_INGRESO[CODIGO],PAGOS_PEDIDOS[VALOR])';

    // 4. Escribir Datos (Mapeo exacto a columnas A-N)
    sheet.getRange(CONTROL_INGRESO.FECHA + targetRow).setValue(now);          // FECHA
    sheet.getRange(CONTROL_INGRESO.NUM_IN + targetRow).setValue(nextNum);                // NUM_IN
    sheet.getRange(CONTROL_INGRESO.COD_INGRESO + targetRow).setValue(fullCode);               // COD_INGRESO
    sheet.getRange(CONTROL_INGRESO.QUIEN_RECIBE + targetRow).setValue(form.empleado);          // EMPLEADO QUE RECIBE
    sheet.getRange(CONTROL_INGRESO.COD_PROV + targetRow).setValue(form.codProv);           // COD_PROV
    sheet.getRange(CONTROL_INGRESO.PROVEEDOR + targetRow).setValue(form.nombreProv);        // PROVEEDOR
    sheet.getRange(CONTROL_INGRESO.COD_PRDT + targetRow).setValue(form.codPrdt);           // COD_PRDT
    sheet.getRange(CONTROL_INGRESO.PRODUCTO + targetRow).setValue(form.nombrePrdt);        // PRODUCTO
    sheet.getRange(CONTROL_INGRESO.CANTIDAD + targetRow).setValue(cantidad);               // CANTIDAD
    sheet.getRange(CONTROL_INGRESO.PRECIO_UNITARIO + targetRow).setValue(precioUnitario);         // PRECIO UNITARIO
    sheet.getRange(CONTROL_INGRESO.METODO_DE_PAGO + targetRow).setValue(form.metodoPago);        // MÉTODO DE PAGO
    sheet.getRange(CONTROL_INGRESO.SALDO_PAGADO + targetRow).setValue(formulaSaldoRestante);   // formula saldo restante
    sheet.getRange(CONTROL_INGRESO.TOTAL + targetRow).setValue(total);                  // TOTAL
    sheet.getRange(CONTROL_INGRESO.PAGADO + targetRow).setValue('FALSE');                // PAGADO
    sheet.getRange(CONTROL_INGRESO.ESTADO + targetRow).setValue(form.estado);            // ESTADO
    sheet.getRange(CONTROL_INGRESO.ENLACE_FACTURA + targetRow).setValue(form.enlaceFactura);     // ENLACE DE FACTURA

    // 5. Actualizar Secuencia
    setSequences(ingresoSequence.NUMBER, nextNum);

    return {
      success: true,
      code: fullCode,
      total: total
    };

  } catch (error) {
    console.error("Error al crear el ingreso. Realizando rollback:", error);
    
    // --- ROLLBACK: ELIMINAR FILA INSERTADA ---
    try {
        sheet.deleteRow(targetRow);
        console.log(`Rollback exitoso: Fila ${targetRow} eliminada de CONTROL_INGRESO.`);
    } catch (e) {
        console.error("Error en rollback de CONTROL_INGRESO:", e);
    }
    
    throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${error.message}`);
  }
}
