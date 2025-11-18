function onOpen() {
  SpreadsheetApp.getUi().createMenu("Venta").addItem("Nueva venta", "openCurstomerSidebar").addToUi();
}


function openCurstomerSidebar(){
  let html = HtmlService.createHtmlOutputFromFile("createNewSaleForm").setTitle("Crear nueva venta");
  SpreadsheetApp.getUi().showSidebar(html);
}

function createNewSale(form) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CONTROL_VENTAS");
  let targetRow = 3;

  // --- 1. INSERTAR FILA VACÍA ---
  // Esta es la clave. Crea una nueva fila en targetRow (Fila 3) y empuja todas las filas existentes hacia abajo.
  sheet.insertRowBefore(targetRow);

  // --- 2. OBTENER FECHA Y HORA ---
  let now = new Date();
  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  let formattedDate = Utilities.formatDate(now, timeZone, "dd/MM/yyyy HH:mm:ss");

  // --- 3. LÓGICA DE NÚMERO DE VENTA (Columna B) ---
  // Para obtener el último número de venta y sumarle 1 (ej: 001, 002, 003, etc.)
  // Asumimos que la Columna B es el contador de ventas y la fila 4 es el último dato antes de insertar.
  // Lee el valor de la celda B4 (la fila inmediatamente debajo de tu punto de inserción)
  let lastSaleNumber = sheet.getRange('B' + (targetRow + 1)).getValue();
  
  // Si la celda está vacía o es 0, inicia en 1, sino, suma 1.
  let newSaleNumber = (lastSaleNumber && typeof lastSaleNumber === 'number') ? lastSaleNumber + 1 : 1;


  // --- 4. ESCRITURA DE DATOS EN LA FILA targetRow (Fila 3) ---
  
  // Columna A: Fecha y Hora
  sheet.getRange('A' + targetRow).setValue(formattedDate);
  
  // Columna B: Número de Venta (Valor calculado)
  sheet.getRange('B' + targetRow).setValue(newSaleNumber); 

  // Columna d: Socio
  sheet.getRange('D' + targetRow).setValue(form.socio); 
  
  // Columna E: Plazo meses
  sheet.getRange('E' + targetRow).setValue(form.plazo); 
  
  // Columna F: Código Producto
  sheet.getRange('F' + targetRow).setValue(form.productCode); 
  
  // Columna H: Cantidad
  sheet.getRange('H' + targetRow).setValue(form.amount); 
  
  // Columna I: Código Cliente
  sheet.getRange('I' + targetRow).setValue(form.clientCode); 
  
  // Columna L: Precio
  sheet.getRange('L' + targetRow).setValue(form.priceProduct); 

  //Metodo de pago
  sheet.getRange('N' + targetRow).setValue(form.paymentMethod); 
  
  // Opcional: Cerrar el sidebar después de la venta
  SpreadsheetApp.getUi().showSidebar(HtmlService.createHtmlOutput('<h2>¡Venta Registrada!</h2>'));
}

/**
 * Recupera una lista de valores únicos de una columna específica de una hoja.
 * @param {string} sheetName El nombre de la hoja donde están los datos (ej: 'CATALOGO_SOCIOS').
 * @param {number} columnIndex El índice de la columna a leer (1 para A, 2 para B, etc.).
 * @returns {Array<string>} Una matriz de valores únicos de la columna.
 */
function getRowDataAsObjects(sheetName,rowIndex, startColumn, endColumn) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Hoja no encontrada: ${sheetName}`);
    }

    // El rango A2:A para obtener todas las filas de la columna, excluyendo el encabezado
    // Usa getMaxRows() para obtener el rango total, pero solo desde la fila 2.
    const lastRow = sheet.getLastRow();
    
    // Si no hay datos (solo encabezado), devuelve una matriz vacía
    if (lastRow < rowIndex) {
      return [];
    }

    // Calcula cuántas columnas leer
    const numColumns = endColumn - startColumn + 1;

    // 1. Lee el rango completo de datos.
    // Fila inicial, Columna inicial, número de filas, número de columnas
    const values = sheet.getRange(rowIndex, startColumn, lastRow - rowIndex + 1, numColumns).getValues();

    // 2. Lee los encabezados para usarlos como claves (keys) de los objetos
    // Esto hace que la estructura de los objetos sea dinámica y más fácil de usar en el frontend.
    const headers = sheet.getRange(rowIndex - 1, startColumn, 1, numColumns).getValues()[0];

    const result = [];

    // 3. Itera sobre cada fila de valores
    values.forEach(row => {
      // Ignora filas completamente vacías
      if (row.every(cell => cell === '')) return;

      const rowObject = {};
      
      // 4. Mapea cada valor de la celda a su encabezado (key)
      headers.forEach((header, index) => {
        // Usa la sintaxis de corchetes para crear la propiedad del objeto dinámicamente
        rowObject[header] = row[index];
      });
      
      result.push(rowObject);
    });

    return result;

  } catch (e) {
    Logger.log("Error al obtener datos: " + e.toString());
    return { error: e.message };
  }
}

/**
 * Función que tu formulario HTML llamará para obtener la lista de socios.
 */
function getInventory() {
  const sheetName = "INVENTARIO";
  const rowIndex = 3;
  const startColumn = 1;
  const endColumn = 14;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}


