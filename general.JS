// ==========================================
// 1. UTILIDADES Obtener secuencias
// ==========================================


function getInventory() {
  const sheetName = "INVENTARIO";
  const rowIndex = 3;
  const startColumn = 1;
  const endColumn = 14;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}

function getActiveSuppliers() {
  // PROVEEDORES: A hasta H. Filtramos por ACTIVO (Col D)
  const suppliers = getRowDataAsObjects("PROVEEDORES", 2, 1, 7);
  return suppliers.filter(supplier => supplier.ACTIVO === true);
}

function getActivePaymentMethods() {
  // METODO_DE_PAGO: A hasta D. Filtramos por ACTIVO (Col D)
  const paymentMethods = getRowDataAsObjects("METODO_DE_PAGO", 3, 1, 4);
  console.log('paymentMethodsL: ', paymentMethods);
  return paymentMethods.filter(method => method.ACTIVO === true);
}

function getClients() {
  const sheetName = "CLIENTES";
  const rowIndex = 3;
  const startColumn = 1;
  const endColumn = 3;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}

function getSocios() {
  const sheetName = "SOCIOS";
  const rowIndex = 2;
  const startColumn = 1;
  const endColumn = 6;
  const socios = getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
  return socios.filter(socio => socio.ACTIVO === true);
}

function getCurrentDateTime() {
  // --- 2. OBTENER FECHA Y HORA ---
  let now = new Date();
  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  return Utilities.formatDate(now, timeZone, "MM/dd/yyyy HH:mm:ss");
}

function getSequences() {
  const sheetName = "SEQUENCES";
  const rowIndex = 2;
  const startColumn = 1;
  const endColumn = 5;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
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

function getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn) {
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