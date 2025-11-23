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
  //Set code sale;
  const saleCode = saleSequence.PREFIX + newSaleNumber;

  // --- 4. ESCRITURA DE DATOS EN LA FILA targetRow (Fila 3) ---
  try{
    // Columna A: Fecha y Hora
    sheet.getRange(CONTROL_VENTAS.FECHA + targetRow).setValue(formattedDate);
    
    // Columna B: Número de Venta (Valor calculado)
    sheet.getRange(CONTROL_VENTAS.NUM + targetRow).setValue(newSaleNumber); 

    // Columna C: Código de venta
    sheet.getRange(CONTROL_VENTAS.CODIGO + targetRow).setValue(saleCode); 
    
    //UPDATE SALE SEQUENCE
    setSequences(saleSequence.NUMBER, newSaleNumber)

    // Columna d: Socio
    sheet.getRange(CONTROL_VENTAS.SOCIO + targetRow).setValue(form.socio); 
    
    // Columna E: Plazo meses
    sheet.getRange(CONTROL_VENTAS.C_PAGOS + targetRow).setValue(form.plazo); 
    
    // Columna F: Código Producto
    sheet.getRange(CONTROL_VENTAS.COD_PRDT + targetRow).setValue(form.productCode); 
    
    // Columna H: Cantidad
    sheet.getRange(CONTROL_VENTAS.CANTIDAD + targetRow).setValue(form.amount); 
    
    // Columna I: Código Cliente
    sheet.getRange(CONTROL_VENTAS.COD_CLNT + targetRow).setValue(form.clientCode); 

    // Columna L: Precio
    sheet.getRange(CONTROL_VENTAS.PRECIO + targetRow).setValue(form.priceProduct); 

    if(form.checkIsCredict){
      // Columna N: Pago
      sheet.getRange(CONTROL_VENTAS.PAGO + targetRow).setValue(form.firstPayment);
    }else{
      // Columna N: Pago
      sheet.getRange(CONTROL_VENTAS.PAGO + targetRow).setValue(form.priceProduct); 
    }

    //Metodo de pago
    sheet.getRange(CONTROL_VENTAS.M_PAGO + targetRow).setValue(form.paymentMethod); 
    
    // Devuelve un objeto con información de la venta para que el cliente (sidebar) muestre el resumen
    return {
      success: true,
      saleCode: saleCode,
      date: formattedDate,
      insertedRow: targetRow,
      form: form
    };
  }catch(error){
    console.error("Error al crear la venta. Realizando rollback:", error);
    
    // --- ROLLBACK: ELIMINAR FILA INSERTADA ---
    try {
        sheet.deleteRow(targetRow);
        console.log(`Rollback exitoso: Fila ${targetRow} eliminada de CONTROL_VENTAS.`);
    } catch (e) {
        console.error("Error en rollback de CONTROL_VENTAS:", e);
    }
    
    throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${error.message}`);
  }
}