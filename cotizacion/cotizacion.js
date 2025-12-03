function openCotizacionModal(){
    let html = HtmlService.createHtmlOutputFromFile("createCotizacionForm")
        .setWidth(900)
        .setHeight(750);
    SpreadsheetApp.getUi().showModalDialog(html, "Cotizacion");
}

function cotizarProductoXPlazo(productCode, paymentTerm){
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);   
      
    
}