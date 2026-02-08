function calcularVentasCuadre() {
    const lastCuadre = getRowExactlyAsObject(CUADRE_CAJA.NAME_TABLE, 2, 1, 12);
    const getSales = getRowDataAsObjects(CONTROL_VENTAS);

    // Validate if FECHA exists, otherwise use a default or handle gracefully
    const lastDate = lastCuadre.FECHA instanceof Date ? lastCuadre.FECHA : new Date(0);

    const getSaleToCuadre = getSales.filter(s => s.FECHA > lastDate);
    let result = { total: 0, sinceDate: lastDate, count: 0 };
    getSaleToCuadre.forEach(s => {
        result.total += s.PAGO;
        result.count++;
    });

    // Format date to string to avoid serialization issues
    const formattedResult = {
        total: result.total,
        sinceDate: Utilities.formatDate(result.sinceDate, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"),
        count: result.count
    };

    console.log('result calcularVentasCuadre: ', formattedResult);
    return formattedResult;
}

function saveCuadreCaja(form) {
    console.log('form: ', form);
    // form contains: responsable, total efectivo, total cuentas, total otros, total sistema, total recaudado, faltante, sobre.
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetCuadre = ss.getSheetByName(CUADRE_CAJA.NAME_TABLE);
    const targetRow = CUADRE_CAJA.TARGET_ROW;
    const sheetIngresoEgreso = ss.getSheetByName(INGRESOS_EGRESOS.NAME_TABLE);
    if (!sheetCuadre) throw new Error("Sheet CUADRE_DE_CAJA not found");

    //Obtener secuencia para cuadreSeq
    const cuadreSeq = getSequence('CDRE');
    const cuadreNewCode = cuadreSeq.PREFIX + cuadreSeq.NEXT;

    // Insertar fila
    sheetCuadre.insertRowBefore(targetRow);
    const date = getCurrentDateTime();

    try {
        const detalle = `Cuadre de Caja ${cuadreNewCode}`;
        const totalCuadre = form.totalRecaudado;
        const base_caja = sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.TARGET_TOTAL).getValue();
        //Registrar en control de ingresos
        let inOutNewCode = addControlIngreso('CUADRE CAJA', detalle, totalCuadre, '');
        //Escribir datos en tabla de historico_cuadre
        sheetCuadre.getRange(CUADRE_CAJA.FECHA + targetRow).setValue(date);
        sheetCuadre.getRange(CUADRE_CAJA.CODIGO + targetRow).setValue(cuadreNewCode);
        sheetCuadre.getRange(CUADRE_CAJA.COD_IN_OUT + targetRow).setValue(inOutNewCode);
        sheetCuadre.getRange(CUADRE_CAJA.RESPONSABLE + targetRow).setValue(form.responsable);
        sheetCuadre.getRange(CUADRE_CAJA.BASE_CAJA + targetRow).setValue(base_caja);
        sheetCuadre.getRange(CUADRE_CAJA.TOTAL_EFECTIVO + targetRow).setValue(form.totalEfectivo);
        sheetCuadre.getRange(CUADRE_CAJA.TOTAL_CUENTAS + targetRow).setValue(form.totalCuentas);
        sheetCuadre.getRange(CUADRE_CAJA.TOTAL_OTROS + targetRow).setValue(form.totalOtros);
        sheetCuadre.getRange(CUADRE_CAJA.TOTAL_RECAUDADO + targetRow).setValue(form.totalRecaudado);
        sheetCuadre.getRange(CUADRE_CAJA.TOTAL_SISTEMA + targetRow).setValue(form.totalSistema);
        sheetCuadre.getRange(CUADRE_CAJA.FALTANTE + targetRow).setValue(form.faltante);
        sheetCuadre.getRange(CUADRE_CAJA.SOBRANTE + targetRow).setValue(form.sobre);
        //Actualizar secuencia
        setSequences(cuadreSeq.NUMBER, cuadreSeq.NEXT);
        // updateStatusSalesPayed();

        return { success: true, code: cuadreNewCode, date: date };

    } catch (e) {
        console.error('Error al guardar el cuadre de caja. Realizando rollback:', e);
        try {
            sheetIngresoEgreso.deleteRow(INGRESOS_EGRESOS.TARGET_ROW);
            sheetCuadre.deleteRow(targetRow);
            console.log(`Rollback exitoso: Filas ${INGRESOS_EGRESOS.TARGET_ROW} y ${targetRow} eliminadas de INGRESOS_EGRESOS y HISTORICO_CUADRE respectivamente.`);
        } catch (e) {
            console.error('Error al realizar rollback:', e);
        }
        throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${e.message}`);
    }

}

function updateStatusSalesPayed() {
    //Get sales payed
    const salesString = getSalesData();
    let sales = JSON.parse(salesString);
    sales = sales.filter(sale => sale.ESTADO === ESTADO_VENTA.PAGADO);
    console.log('sales updateStatusSalesPayed: ', sales.length);

    // Get socios
    const socios = getSocios();
    console.log('socios: ', socios.length);
    console.log('socios: ', socios[0]);

    socios.forEach(socio => {
        const salesBySocio = sales.filter(sale => sale.COD_SOCIO === socio.CODIGO);
        console.log('salesBySocio: ', salesBySocio.length);
        console.log('salesBySocio: ', salesBySocio[0]);

        if (salesBySocio.length > 0) {
            const resume = calculateCommision(salesBySocio);
            resume.socio = socio;
            console.log('resume addCommission: ', resume);
            addCommission(resume);
            //update sales status
            updateSalesStatus(salesBySocio);
            sendCommissionEmail(resume);
        }
    });
}

function updateSalesStatus(sales) {
    sales.forEach(sale => {
        setValueByCodeAndColumn(CONTROL_VENTAS, CONTROL_VENTAS.ESTADO, sale.index, ESTADO_VENTA.COMISIONADA);
    });
}
