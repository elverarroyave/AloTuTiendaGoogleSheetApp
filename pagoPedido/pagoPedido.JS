function openPagoSidebar(){
    let html = HtmlService.createHtmlOutputFromFile("pagoPedidoForm").setTitle("Agregar Pago");
    SpreadsheetApp.getUi().showSidebar(html);
}

// ==========================================
// 2. LÓGICA DE PAGOS (NUEVO)
// ==========================================

function crearPago(form, inOutSeq) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetIngresoEgreso = ss.getSheetByName("INGRESOS_EGRESOS");
    const targetRowIngresoEgreso = 4;
    const sheetPagos = ss.getSheetByName("PAGOS_PEDIDOS");
    const targetRowPagos = 2;

    // Las filas insertadas se encuentran en estas posiciones
    const rowIngresoEgresoToDelete = targetRowIngresoEgreso;
    const rowPagosToDelete = targetRowPagos;

    try {
        const inOutNewCode = inOutSeq.PREFIX + inOutSeq.NEXT; // Ej: ABO101

        // Obtener secuencia para pagoSeq
        const pagoSeq = getSequencesPago();
        const pagoNewCode = pagoSeq.PREFIX + pagoSeq.NEXT;

        // 2. Insertar Fila
        // ESTOS SON LOS PUNTOS DE FALLO CRÍTICOS A REVERTIR
        sheetIngresoEgreso.insertRowBefore(targetRowIngresoEgreso);
        sheetPagos.insertRowBefore(targetRowPagos);

        // 3. Preparar Datos
        const now = getCurrentDateTime();
        const formulaProductName = '=XLOOKUP(PAGOS_PEDIDOS[COD_IN],CONTROL_INGRESO[CODIGO],CONTROL_INGRESO[PRODUCTO],"NONE")';
        const payValue = Number(form.payValue);
        const controlIngresoRow = getRowDataAsObjectByNameColumn("CONTROL_INGRESO", 3, 1, 15, "CODIGO", form.inCode);
        console.log("controlIngresoRow:", controlIngresoRow);
        const detalle = `Pago de pedido ${form.inCode} - ${controlIngresoRow.METODO_DE_PAGO}`;

        // Escritura en INGRESOS_EGRESOS (Punto de fallo potencial)
        sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.FECHA + targetRowIngresoEgreso).setValue(now); //FECHA
        sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.REFERENCIA + targetRowIngresoEgreso).setValue("PAGO PEDIDO"); //REFERENCIA
        sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.NUM + targetRowIngresoEgreso).setValue(inOutSeq.NEXT); //NUM
        sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.CODIGO + targetRowIngresoEgreso).setValue(inOutNewCode); //CODIGO
        sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.DETALLE + targetRowIngresoEgreso).setValue(detalle); //DETALLE
        sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.ENTRADA + targetRowIngresoEgreso).setValue(payValue); //ENTRADA
        sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.M_PAGO + targetRowIngresoEgreso).setValue(form.metodoPago); //M PAGO

        // Escribir datos en tabla Pagos_Pedidos (Punto de fallo potencial)
        sheetPagos.getRange(PAGO_PEDIDOS.FECHA + targetRowPagos).setValue(now);
        sheetPagos.getRange(PAGO_PEDIDOS.CODIGO + targetRowPagos).setValue(pagoNewCode);
        sheetPagos.getRange(PAGO_PEDIDOS.COD_IN_OUT + targetRowPagos).setValue(inOutNewCode);
        sheetPagos.getRange(PAGO_PEDIDOS.COD_IN + targetRowPagos).setValue(form.inCode);
        sheetPagos.getRange(PAGO_PEDIDOS.PRODUCTO + targetRowPagos).setValue(formulaProductName);
        sheetPagos.getRange(PAGO_PEDIDOS.METODO_DE_COMPRA + targetRowPagos).setValue(controlIngresoRow.METODO_DE_PAGO);
        sheetPagos.getRange(PAGO_PEDIDOS.VALOR + targetRowPagos).setValue(payValue);

        // 5. Actualizar Secuencia (Punto de fallo potencial)
        setSequences(inOutSeq.NUMBER, inOutSeq.NEXT);
        setSequences(pagoSeq.NUMBER, pagoSeq.NEXT);

        return {
            success: true,
            code: inOutNewCode,
            value: payValue
        };

    } catch (error) {
        // En caso de CUALQUIER error (inserción, escritura o actualización de secuencia),
        // se ejecuta el rollback.
        console.error("Error al crear el pago. Realizando rollback:", error);
        
        // --- ROLLBACK: ELIMINAR FILAS INSERTADAS ---
        
        // 1. Eliminar la fila de PAGOS_PEDIDOS
        // La instrucción deleteRow es segura aunque haya fallado la inserción, 
        // ya que simplemente eliminará la fila en esa posición.
        try {
            sheetPagos.deleteRow(rowPagosToDelete);
            console.log(`Rollback exitoso: Fila ${rowPagosToDelete} eliminada de PAGOS_PEDIDOS.`);
        } catch (e) {
            console.error("Error en rollback de PAGOS_PEDIDOS:", e);
        }

        // 2. Eliminar la fila de INGRESOS_EGRESOS
        try {
            sheetIngresoEgreso.deleteRow(rowIngresoEgresoToDelete);
            console.log(`Rollback exitoso: Fila ${rowIngresoEgresoToDelete} eliminada de INGRESOS_EGRESOS.`);
        } catch (e) {
            console.error("Error en rollback de INGRESOS_EGRESOS:", e);
        }
        
        throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${error.message}`);
    }
}

function getSequencesPago(){
  let sequences = getSequences();
  return sequences.find(s => s.PREFIX === 'PAGO');
}