const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const sheetIngresoEgreso = ss.getSheetByName(INGRESOS_EGRESOS.NAME_TABLE);
const targetRowIngresoEgreso = INGRESOS_EGRESOS.TARGET_ROW;

function subControlIngreso(referencia, detalle, valor, metodoPago){
    let inOutSeq = getSequenceInOut();
    let inOutNewCode = inOutSeq.PREFIX + inOutSeq.NEXT;
    let now = getCurrentDateTime();
    sheetIngresoEgreso.insertRowBefore(targetRowIngresoEgreso);


    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.FECHA + targetRowIngresoEgreso).setValue(now); //FECHA
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.REFERENCIA + targetRowIngresoEgreso).setValue(referencia); //REFERENCIA
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.NUM + targetRowIngresoEgreso).setValue(inOutSeq.NEXT); //NUM
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.CODIGO + targetRowIngresoEgreso).setValue(inOutNewCode); //CODIGO
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.DETALLE + targetRowIngresoEgreso).setValue(detalle); //DETALLE
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.SALIDA + targetRowIngresoEgreso).setValue(valor); //SALIDA
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.M_PAGO + targetRowIngresoEgreso).setValue(metodoPago); //M PAGO

    setSequences(inOutSeq.NUMBER, inOutSeq.NEXT);
    return inOutNewCode;
}

function addControlIngreso(referencia, detalle, valor, metodoPago){
    let inOutSeq = getSequenceInOut();
    let inOutNewCode = inOutSeq.PREFIX + inOutSeq.NEXT;
    let now = getCurrentDateTime();
    sheetIngresoEgreso.insertRowBefore(targetRowIngresoEgreso);


    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.FECHA + targetRowIngresoEgreso).setValue(now); //FECHA
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.REFERENCIA + targetRowIngresoEgreso).setValue(referencia); //REFERENCIA
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.NUM + targetRowIngresoEgreso).setValue(inOutSeq.NEXT); //NUM
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.CODIGO + targetRowIngresoEgreso).setValue(inOutNewCode); //CODIGO
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.DETALLE + targetRowIngresoEgreso).setValue(detalle); //DETALLE
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.ENTRADA + targetRowIngresoEgreso).setValue(valor); //ENTRADA
    sheetIngresoEgreso.getRange(INGRESOS_EGRESOS.M_PAGO + targetRowIngresoEgreso).setValue(metodoPago); //M PAGO

    setSequences(inOutSeq.NUMBER, inOutSeq.NEXT);
    return inOutNewCode;
}

function getSequenceInOut(){
    let sequences = getSequences();
    return sequences.find(s => s.PREFIX === 'INOUT');
}