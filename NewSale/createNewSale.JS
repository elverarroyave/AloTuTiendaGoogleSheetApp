function openCurstomerModal(){
  // 1. Crear el HTML desde el archivo
    let html = HtmlService.createHtmlOutputFromFile("createNewSaleForm")
        .setWidth(800)   // Ancho en píxeles (puedes ajustarlo, ej: 800 o 1000)
        .setHeight(700); // Alto en píxeles (ajusta según el largo de tu formulario)

    // 2. Mostrar como "Diálogo Modal" (Popup centrado)
    SpreadsheetApp.getUi().showModalDialog(html, "Crear nueva venta");
}

function createNewSale(form, saleSequence) {
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("CONTROL_VENTAS");
  let targetRow = 3;

  // --- 1. INSERTAR FILA VACÍA ---
  // Esta es la clave. Crea una nueva fila en targetRow (Fila 3) y empuja todas las filas existentes hacia abajo.
  sheet.insertRowBefore(targetRow);

  console.log('Formulario recibido:', form);

  let formattedDate = getCurrentDateTime();

  //Set sale number;
  const newSaleNumber = saleSequence.NEXT;
  //Set code sale;
  const saleCode = saleSequence.PREFIX + newSaleNumber;

  // --- 4. ESCRITURA DE DATOS EN LA FILA targetRow (Fila 3) ---
  try{
    sheet.getRange(CONTROL_VENTAS.FECHA + targetRow).setValue(formattedDate);
    
    sheet.getRange(CONTROL_VENTAS.NUM + targetRow).setValue(newSaleNumber); 

    sheet.getRange(CONTROL_VENTAS.CODIGO + targetRow).setValue(saleCode); 
    
    //UPDATE SALE SEQUENCE
    setSequences(saleSequence.NUMBER, newSaleNumber)

    sheet.getRange(CONTROL_VENTAS.COD_SOCIO + targetRow).setValue(form.socioCode); 
    
    sheet.getRange(CONTROL_VENTAS.C_PAGOS + targetRow).setValue(form.plazo); 
    
    sheet.getRange(CONTROL_VENTAS.COD_PRDT + targetRow).setValue(form.productCode); 
    
    sheet.getRange(CONTROL_VENTAS.CANTIDAD + targetRow).setValue(form.amount); 
    
    sheet.getRange(CONTROL_VENTAS.COD_CLNT + targetRow).setValue(form.clientCode); 

    sheet.getRange(CONTROL_VENTAS.PRECIO + targetRow).setValue(form.priceProduct); 

    if(form.checkIsCredict){
      sheet.getRange(CONTROL_VENTAS.PAGO + targetRow).setValue(form.firstPayment);
      sheet.getRange(CONTROL_VENTAS.ESTADO + targetRow).setValue(SALE_STATUS.AL_DIA);
    }else{
      sheet.getRange(CONTROL_VENTAS.PAGO + targetRow).setValue(form.priceProduct); 
      sheet.getRange(CONTROL_VENTAS.ESTADO + targetRow).setValue(SALE_STATUS.PAGADO);
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