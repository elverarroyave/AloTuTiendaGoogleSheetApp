function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  //Menú Venta
  ui.createMenu("AloTuTienda")
    .addItem("Nueva venta", "openCurstomerModal")
    .addItem("Nuevo producto", "openProductModal")
    .addItem("Nuevo Cliente", "openClientModal")
    .addItem("Ingresar pedido", "openControlIngresoModal")
    .addToUi();    
}


// ==========================================
// 2. UTILIDADES Obtener secuencias
// ==========================================


function getInventory() {
  const sheetName = "INVENTARIO";
  const rowIndex = 3;
  const startColumn = 1;
  const endColumn = 14;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}

function getActiveSuppliers() {
  // PROVEEDORES: A hasta H. Filtramos por ACTVIO (Col D)
  return getRowDataAsObjects("PROVEEDORES", 2, 1, 7);
}

function getActivePaymentMethods() {
  // METODO_DE_PAGO: A hasta D. Filtramos por ACTIVO (Col D)
  return getRowDataAsObjects("METODO_DE_PAGO", 3, 1, 4);
}

function getClients(){
    const sheetName = "CLIENTES";
    const rowIndex = 3;
    const startColumn = 1;
    const endColumn = 3;
    return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}

function getCurrentDateTime(){
    // --- 2. OBTENER FECHA Y HORA ---
  let now = new Date();
  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  return Utilities.formatDate(now, timeZone, "MM/dd/yyyy HH:mm:ss");
}

function getSequences(){
  const sheetName = "SEQUENCES";
  const rowIndex = 2;
  const startColumn = 1;
  const endColumn = 5;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}

// Función ajustada para escribir en la columna CURRENT (Columna D)
function setSequences(sequenceNumber, newCurrentValue){
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SEQUENCES");
  const rowToUpdate = parseInt(sequenceNumber) + 1;
  // Actualizamos la columna D (CURRENT)
  sheet.getRange('D' + rowToUpdate).setValue(newCurrentValue);
}

// Función auxiliar necesaria (ya la tenías, pero asegúrate de que esté en el archivo)
function getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn) {
    // ... (Usa la misma función que proporcionaste en tu prompt)
    // Si no la copiaste aquí, asegúrate de que esté en tu archivo Code.gs original
    try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
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
