function openCurstomerModal(){
  // 1. Crear el HTML desde el archivo
    let html = HtmlService.createHtmlOutputFromFile("createNewSaleForm")
        .setWidth(800)   // Ancho en píxeles (puedes ajustarlo, ej: 800 o 1000)
        .setHeight(700); // Alto en píxeles (ajusta según el largo de tu formulario)

    // 2. Mostrar como "Diálogo Modal" (Popup centrado)
    SpreadsheetApp.getUi().showModalDialog(html, "Crear nueva venta");
}

function createNewSale(form, saleSequence) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CONTROL_VENTAS");
  let targetRow = 3;

  // --- 1. INSERTAR FILA VACÍA ---
  // Esta es la clave. Crea una nueva fila en targetRow (Fila 3) y empuja todas las filas existentes hacia abajo.
  sheet.insertRowBefore(targetRow);

  let formattedDate = getCurrentDateTime();

  //Set sale number;
  const newSaleNumber = saleSequence.NEXT;

  // --- 4. ESCRITURA DE DATOS EN LA FILA targetRow (Fila 3) ---
  
  // Columna A: Fecha y Hora
  sheet.getRange('A' + targetRow).setValue(formattedDate);
  
  // Columna B: Número de Venta (Valor calculado)
  sheet.getRange('B' + targetRow).setValue(newSaleNumber); 
  
  //UPDATE SALE SEQUENCE
  setSequences(saleSequence.NUMBER, newSaleNumber)

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

  if(form.checkIsCredict){
    // Columna N: Pago
    sheet.getRange('N' + targetRow).setValue(form.firstPayment);
  }else{
    // Columna N: Pago
    sheet.getRange('N' + targetRow).setValue(form.priceProduct); 
  }

  //Metodo de pago
  sheet.getRange('M' + targetRow).setValue(form.paymentMethod); 
  
  // Devuelve un objeto con información de la venta para que el cliente (sidebar) muestre el resumen
  return {
    success: true,
    saleCode: saleSequence.PREFIX + newSaleNumber,
    date: formattedDate,
    insertedRow: targetRow,
    form: form
  };
}