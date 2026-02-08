// ==========================================
// 1. UTILIDADES Obtener secuencias
// ==========================================


function getInventory() {
  return getRowDataAsObjects(INVENTARIO);
}

function getAbonos() {
  return getRowDataAsObjects(ABONOS);
}

function getActiveSuppliers() {
  // PROVEEDORES: A hasta H. Filtramos por ACTIVO (Col D)
  const suppliers = getRowDataAsObjects(PROVEEDORES);
  return suppliers.filter(supplier => {
    supplier.CREATED_DATETIME = parseDateLocalTime(supplier.CREATED_DATETIME);
    return supplier.ACTIVO === true
  });
}

function getActivePaymentMethods() {
  // METODO_DE_PAGO: A hasta D. Filtramos por ACTIVO (Col D)
  const paymentMethods = getRowDataAsObjects(METODO_DE_PAGO);
  console.log('paymentMethodsL: ', paymentMethods);
  return paymentMethods.filter(method => {
    method.CREATED_DATETIME = parseDateLocalTime(method.CREATED_DATETIME);
    return method.ACTIVO === true
  });
}

function getClients() {
  return getRowDataAsObjects(CLIENTES);
}

function getSocios() {
  const socios = getRowDataAsObjects(SOCIOS);
  return socios.filter(socio => socio.ACTIVO === true);
}

function getSalesData() {
  try {
    if (typeof CONTROL_VENTAS === 'undefined') {
      throw new Error("CONTROL_VENTAS no está definido. Asegúrate de que tables.js se cargue antes o esté en el proyecto.");
    }
    const getSales = getRowDataAsObjects(CONTROL_VENTAS);
    console.log('getSales count: ', getSales.length);
    // Stringify to ensure safe transport over google.script.run
    return JSON.stringify(getSales);
  } catch (e) {
    console.error("Error in getSalesData:", e);
    return JSON.stringify({ error: e.message });
  }
}

function getCurrentDateTime() {
  // --- 2. OBTENER FECHA Y HORA ---
  let now = new Date();
  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  return Utilities.formatDate(now, timeZone, "MM/dd/yyyy HH:mm:ss");
}

function parseDateLocalTime(dateInput) {
  const date = new Date(dateInput);
  const timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  return Utilities.formatDate(date, timeZone, "MM/dd/yyyy HH:mm:ss");
}

function getSequences() {
  return getRowDataAsObjects(SEQUENCES);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
}

function getSequence(prefix) {
  let sequences = getSequences();
  return sequences.find(s => s.PREFIX === prefix);
}

// Función ajustada para escribir en la columna CURRENT (Columna D)
function setSequences(sequenceNumber, newCurrentValue) {
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("SEQUENCES");
  const rowToUpdate = parseInt(sequenceNumber) + 1;
  // Actualizamos la columna D (CURRENT)
  sheet.getRange('D' + rowToUpdate).setValue(newCurrentValue);
}


function getRowDataAsObjects(table) {
  const sheetName = table.NAME_TABLE;
  if (!sheetName) throw new Error(`Hoja no encontrada: ${sheetName}`);
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const rowIndex = table.TARGET_ROW;
  if (!rowIndex) throw new Error(`Row start index no especificado: ${rowIndex}`);
  const startColumn = 1;
  const endColumn = sheet.getLastColumn();
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < rowIndex) return [];
    const numColumns = endColumn - startColumn + 1;
    const values = sheet.getRange(rowIndex, startColumn, lastRow - rowIndex + 1, numColumns).getValues();
    const headers = sheet.getRange(rowIndex - 1, startColumn, 1, numColumns).getValues()[0];
    const result = [];
    values.forEach((row, i) => {
      if (row.every(cell => cell === '')) return;
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index];
      });
      rowObject.index = rowIndex + i;
      result.push(rowObject);
    });
    // console.log(`getRowDataAsObjects ${table.NAME_TABLE}: `, result);
    return result;
  } catch (e) {
    return { error: e.message };
  }
}

function getRowDataAsObjectsWithLimits(sheetName, rowIndex, startColumn, endColumn) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
    if (!sheet) throw new Error(`Hoja no encontrada: ${sheetName}`);
    const lastRow = sheet.getLastRow();
    if (lastRow < rowIndex) return [];
    const numColumns = endColumn - startColumn + 1;
    const values = sheet.getRange(rowIndex, startColumn, lastRow - rowIndex + 1, numColumns).getValues();
    const headers = sheet.getRange(rowIndex - 1, startColumn, 1, numColumns).getValues()[0];
    const result = [];
    values.forEach(row => {
      if (row.every(cell => cell === '')) return;
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index];
      });
      result.push(rowObject);
    });
    return result;
  } catch (e) {
    return { error: e.message };
  }
}

/*obtener una fila exacta como objeto*/
function getRowExactlyAsObject(sheetName, rowIndex, startColumn, endColumn) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
    if (!sheet) throw new Error(`Hoja no encontrada: ${sheetName}`);
    const lastRow = sheet.getLastRow();
    if (lastRow < rowIndex) throw new Error(`Fila no encontrada: ${rowIndex}`);
    const numColumns = endColumn - startColumn + 1;
    const values = sheet.getRange(rowIndex, startColumn, 1, numColumns).getValues();
    const headers = sheet.getRange(rowIndex - 1, startColumn, 1, numColumns).getValues()[0];
    const row = values[0];
    if (row.every(cell => cell === '')) throw new Error(`Fila vacia: ${rowIndex}`);
    const rowObject = {};
    headers.forEach((header, index) => {
      rowObject[header] = row[index];
    });
    return rowObject;
  } catch (e) {
    console.error("Error in getRowExactlyAsObject:", e);
    return { error: e.message };
  }
}

/**
 * Busca una fila específica dentro de un rango de datos en una hoja de cálculo
 * basándose en el valor de una columna y devuelve la fila como un objeto.
 *
 * @param {string} sheetName El nombre de la hoja (ej: "CONTROL_INGRESO").
 * @param {number} dataStartRow La primera fila que contiene datos (excluye encabezados).
 * @param {number} startColumn La primera columna a considerar (ej: 1 para la columna A).
 * @param {number} endColumn La última columna a considerar (ej: 15 para la columna O).
 * @param {string} nameColumnCode El nombre del encabezado de la columna donde buscar el 'code' (ej: "CODIGO").
 * @param {any} code El valor a buscar en la columna 'nameColumnCode'.
 * @returns {Object|null} Un objeto que representa la fila encontrada, o null si no se encuentra.
 * @throws {Error} Si la hoja de cálculo no se encuentra.
 */
function getRowDataAsObjectByNameColumn(sheetName, dataStartRow, startColumn, endColumn, nameColumnCode, code) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Hoja no encontrada: ${sheetName}`);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < dataStartRow) {
      console.log(`No hay datos a partir de la fila ${dataStartRow}.`);
      return null;
    }

    const numColumns = endColumn - startColumn + 1;

    // 1. Obtener Encabezados
    // Se asume que los encabezados están inmediatamente ANTES de dataStartRow
    const headers = sheet.getRange(dataStartRow - 1, startColumn, 1, numColumns).getValues()[0];

    // Determinar el índice de la columna de búsqueda
    const codeColumnIndex = headers.indexOf(nameColumnCode);

    if (codeColumnIndex === -1) {
      throw new Error(`Columna de búsqueda no encontrada: ${nameColumnCode}`);
    }

    // 2. Obtener los Datos
    const values = sheet.getRange(dataStartRow, startColumn, lastRow - dataStartRow + 1, numColumns).getValues();

    // 3. Buscar la Fila
    for (let i = 0; i < values.length; i++) {
      const row = values[i];

      // Verificar si la celda de la columna de código coincide con el valor buscado
      // Se utiliza un triple igual (===) para asegurar la coincidencia de tipo y valor.
      if (row[codeColumnIndex] === code) {

        // 4. Construir el Objeto de la Fila Encontrada
        const rowObject = {};
        rowObject.index = i + dataStartRow;
        headers.forEach((header, index) => {
          rowObject[header] = row[index];
        });

        console.log(`Fila encontrada para ${nameColumnCode} = ${code}:`, rowObject);
        return rowObject;
      }
    }

    // Si el bucle termina sin encontrar el código
    console.log(`Código no encontrado en la columna ${nameColumnCode}: ${code}`);
    return null;

  } catch (e) {
    console.error("Error en getRowDataAsObjectByNameColumn:", e.message);
    // Lanzamos el error para que sea manejado por la lógica de google.script.run
    throw new Error(e.message);
  }
}

/**
 * Función genérica para obtener un objeto de una tabla buscando por código.
 * Utiliza las constantes definidas en tables.js.
 * 
 * @param {Object} tableConfig El objeto de configuración de la tabla (ej: CONTROL_VENTAS).
 * @param {string} code El código a buscar (ej: "VENTA404").
 * @param {string} columnHeaderName El nombre del encabezado de la columna donde buscar (default: "CODIGO").
 * @returns {Object|null} El objeto de la fila encontrada o null.
 */
function getObjectByCode(tableConfig, code, columnHeaderName = "CODIGO") {
  if (!tableConfig || tableConfig.NAME_TABLE === undefined) {
    throw new Error("Configuración de tabla no válida.");
  }

  const sheetName = tableConfig.NAME_TABLE;
  const dataStartRow = tableConfig.TARGET_ROW || 2;
  const startColumn = 1;

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Hoja no encontrada: ${sheetName}`);

  const endColumn = sheet.getLastColumn();

  return getRowDataAsObjectByNameColumn(sheetName, dataStartRow, startColumn, endColumn, columnHeaderName, code);
}

// Dame una funcion que setee un valor en una celda exacta, que reciba el codigo de la fila y la columna
function setValueByCodeAndColumn(tableConfig, column, row, value) {
  if (!tableConfig || tableConfig.NAME_TABLE === undefined) {
    throw new Error("Configuración de tabla no válida.");
  }

  const sheetName = tableConfig.NAME_TABLE;

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Hoja no encontrada: ${sheetName}`);

  let target = column + row;
  sheet.getRange(target).setValue(value);
  console.log(`Valor '${value}' seteado en ${sheetName} - index ${target}`);
}

/**
 * Calcula la cantidad de días transcurridos entre dos fechas, normalizando a medianoche.
 * 
 * @param {Date|string|number} fechaInicio - Fecha inicial.
 * @param {Date|string|number} fechaFin - Fecha final.
 * @returns {number} Número de días transcurridos.
 */
function diasTranscurridosCoutner(fechaInicio, fechaFin) {
  const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  // Normalizar horas a medianoche para evitar errores por desfases horarios
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  const diferencia = fin.getTime() - inicio.getTime();
  return Math.floor(diferencia / MILISEGUNDOS_POR_DIA);
}

/**
 * Determina el estado de una venta (AL DIA o ATRAZADO) basándose en los días transcurridos,
 * el plan de pagos pactado y el monto total abonado hasta la fecha.
 * 
 * @param {Object} ventaResult - Objeto con datos de la venta.
 * @param {string} ventaResult.cPagos - Clave del plan de pagos (ej: "UNO", "DOS").
 * @param {Date|string} ventaResult.fechaCompra - Fecha en que se realizó la venta.
 * @param {number} ventaResult.precio - Precio total de la venta ($).
 * @param {number} ventaResult.total - Total abonado hasta el momento ($).
 * @returns {string} Estado de la venta (de ESTADO_VENTA).
 */
function definirEstadoVenta(ventaResult) {
  const cPagosObject = CANTIDADA_PAGOS[ventaResult.cPagos];
  if (!cPagosObject) throw new Error("Plan de pagos no encontrado");

  const fechaCompra = new Date(ventaResult.fechaCompra);
  const valorCadaPago = ventaResult.precio / cPagosObject.valor;
  const diasTranscurridos = diasTranscurridosCoutner(fechaCompra, new Date());

  // Calculamos cuántos pagos deberían haberse realizado según los plazos transcurridos
  let cantidadPagosExigibles = cPagosObject.valor; // Por defecto todos ya vencieron

  const hitosPago = Object.values(CANTIDADA_PAGOS);
  for (const hito of hitosPago) {
    if (diasTranscurridos < hito.plazo) {
      // Si aún no llegamos a este hito de plazo, el total de pagos exigibles es 
      // el número de pagos del hito previo (hito.valor - 1)
      cantidadPagosExigibles = hito.valor - 1;
      break;
    }
  }

  // No podemos exigir más pagos de los que tiene el plan original de esta venta
  cantidadPagosExigibles = Math.min(cantidadPagosExigibles, cPagosObject.valor);

  const valorPagoIdeal = valorCadaPago * cantidadPagosExigibles;
  const valorAbonado = ventaResult.total;

  // Determine deadline for the current overdue payment
  let deadline = 0;
  if (cantidadPagosExigibles > 0) {
    // Find the milestone matching the number of exigible payments
    // We search through values of CANTIDADA_PAGOS
    const deadlineHito = Object.values(CANTIDADA_PAGOS).find(h => h.valor === cantidadPagosExigibles);
    if (deadlineHito) deadline = deadlineHito.plazo;
  }

  const estado = valorAbonado >= valorPagoIdeal
    ? ESTADO_VENTA.AL_DIA
    : ESTADO_VENTA.ATRAZADO;

  return {
    saldoParaPagoIdeal: valorPagoIdeal - valorAbonado,
    estado: estado,
    diasAtraso: estado === ESTADO_VENTA.ATRAZADO ? (diasTranscurridos - deadline) : 0,
  }
}



/**
 * Obtiene todas las ventas de un cliente específico.
 * @param {string} clientCode - El código del cliente (ej: CLNT001).
 * @returns {Array|Object} Lista de ventas o error.
 */
function getSalesByClient(clientCode) {
  if (!clientCode) return [];

  try {
    const salesDataStr = getSalesData();
    const salesData = JSON.parse(salesDataStr);

    if (salesData.error) return salesData;

    const clientSales = salesData.filter(sale => {
      sale.FECHA = parseDateLocalTime(sale.FECHA);
      return sale.COD_CLNT === clientCode
    });

    return JSON.stringify(clientSales);
  } catch (e) {
    console.error("Error getting sales by client:", e);
    return JSON.stringify({ error: e.message });
  }
}

function getAbonosBySale(saleCode) {
  if (!saleCode) return [];

  try {
    const abonosDataStr = getAbonosData();
    const abonosData = JSON.parse(abonosDataStr);

    if (abonosData.error) return abonosData;

    // Filter by COD_VENTA (Column J in ABONOS) or Name?
    // Assuming abonosData objects have keys from headers.
    const saleAbonos = abonosData.filter(abono => abono.COD_VENTA === saleCode);

    return JSON.stringify(saleAbonos);
  } catch (e) {
    console.error("Error getting abonos by sale:", e);
    return JSON.stringify({ error: e.message });
  }
}

function getAbonosData(saleCode) {
  if (!saleCode) return [];
  try {
    const abonos = getAbonos();
    const saleAbonos = abonos.filter(abono => {
      abono.FECHA = parseDateLocalTime(abono.FECHA);
      return abono.COD_VENTA === saleCode
    });
    console.log('saleAbonos: ', saleAbonos);
    return JSON.stringify(saleAbonos);
  } catch (e) {
    console.error("Error getting abonos by sale:", e);
    return JSON.stringify({ error: e.message });
  }
}


