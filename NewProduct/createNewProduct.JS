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
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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

  try{
    
      // 2. Escribir datos en INVENTARIO
      // Estructura: | NOMBRE (A) | NUM (B) | CODIGO (C) | CATEGORIA (D) | UNO/PRECIO (E) |
      
      sheet.getRange(INVENTARIO.NOMBRE + targetRow).setValue(form.productName.toUpperCase()); // Nombre
      sheet.getRange(INVENTARIO.NUM + targetRow).setValue(nextNum);          // Num
      sheet.getRange(INVENTARIO.CODIGO + targetRow).setValue(fullCode);         // Código Completo
      sheet.getRange(INVENTARIO.CATEGORIA + targetRow).setValue(form.category);    // Categoría
      sheet.getRange(INVENTARIO.UNO + targetRow).setValue(form.salePrice);   // Precio (Columna UNO)
    
      // 3. Actualizar la tabla SEQUENCES
      // Lógica solicitada: Remplazar CURRENT con el valor de NEXT recuperado.
      // La fórmula en la hoja (=CURRENT + 1) actualizará el nuevo NEXT automáticamente.
      setSequences(productSequence.NUMBER, nextNum);
    
      return {
        success: true,
        code: fullCode,
        name: form.productName
      };

  }catch(error){
    console.error("Error al crear el producto. Realizando rollback:", error);
    
    // --- ROLLBACK: ELIMINAR FILA INSERTADA ---
    try {
        sheet.deleteRow(targetRow);
        console.log(`Rollback exitoso: Fila ${targetRow} eliminada de INVENTARIO.`);
    } catch (e) {
        console.error("Error en rollback de INVENTARIO:", e);
    }
    
    throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${error.message}`);
  }
}