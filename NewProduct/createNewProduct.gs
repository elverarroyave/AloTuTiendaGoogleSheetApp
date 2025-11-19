// ==========================================
// 1. MENÚ Y APERTURA DE SIDEBAR
// ==========================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Menú Producto (NUEVO)
  ui.createMenu("Producto")
    .addItem("Nuevo producto", "openProductModal")
    .addToUi();
}

function openProductModal() {
  // 1. Crear el HTML desde el archivo
  let html = HtmlService.createHtmlOutputFromFile("createNewProductForm")
      .setWidth(800)   // Ancho en píxeles (puedes ajustarlo, ej: 800 o 1000)
      .setHeight(700); // Alto en píxeles (ajusta según el largo de tu formulario)

  // 2. Mostrar como "Diálogo Modal" (Popup centrado)
  SpreadsheetApp.getUi().showModalDialog(html, "Crear nuevo Producto");
}

// ==========================================
// 2. LÓGICA DE CREACIÓN DE PRODUCTO
// ==========================================

function createNewProduct(form) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("INVENTARIO");
  
  // Obtenemos la secuencia actual para PRODUCTO para asegurar consistencia en el servidor
  const sequences = getSequences(); 
  // Buscamos la secuencia donde NAME es 'PRODUCTO' (Fila 3 en tu ejemplo)
  const productSequence = sequences.find(seq => seq.NAME === 'PRODUCTO');
  
  if (!productSequence) {
    throw new Error("No se encontró la secuencia de PRODUCTO");
  }

  // Calculamos valores
  const nextNum = productSequence.NEXT; // Ejemplo: 91
  const fullCode = productSequence.PREFIX + '0' + nextNum; // Ajuste simple de ceros, ej: PDCT091
  // Nota: Si quieres un padding dinámico de ceros (ej: 091 vs 0091), usa JS: nextNum.toString().padStart(3, '0')
  
  // Fila objetivo para insertar (Fila 3, igual que en Venta)
  const targetRow = 3;

  // 1. Insertar fila vacía y empujar las demás hacia abajo
  sheet.insertRowBefore(targetRow);

  // 2. Escribir datos en INVENTARIO
  // Estructura: | NOMBRE (A) | NUM (B) | CODIGO (C) | CATEGORIA (D) | UNO/PRECIO (E) |
  
  sheet.getRange('A' + targetRow).setValue(form.productName.toUpperCase()); // Nombre
  sheet.getRange('B' + targetRow).setValue(nextNum);          // Num
  sheet.getRange('C' + targetRow).setValue(fullCode);         // Código Completo
  sheet.getRange('D' + targetRow).setValue(form.category);    // Categoría
  sheet.getRange('E' + targetRow).setValue(form.salePrice);   // Precio (Columna UNO)

  // 3. Actualizar la tabla SEQUENCES
  // Lógica solicitada: Remplazar CURRENT con el valor de NEXT recuperado.
  // La fórmula en la hoja (=CURRENT + 1) actualizará el nuevo NEXT automáticamente.
  setSequences(productSequence.NUMBER, nextNum);

  return {
    success: true,
    code: fullCode,
    name: form.productName
  };
}

// ==========================================
// 3. UTILIDADES (Revisar que existan)
// ==========================================

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
  
  // sequenceNumber viene de la columna A (NUMBER). 
  // Asumimos que NUMBER corresponde a la fila relativa + 1 o buscamos la fila.
  // Dado tu tabla: 1->Fila 2, 2->Fila 3 (Producto). 
  // Fórmula general basada en tu tabla: Fila = sequenceNumber + 1
  
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