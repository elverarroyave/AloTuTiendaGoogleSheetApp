const SPREADSHEET_ID = "17kHi1Cvk-p3c-mzK8jMoY8d2Ser38nm5GyPkUdHhwDI";

function getVersionApp() {
  return "1.2.3";
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("AloTuTienda")
    .addItem("Nueva venta", "openCurstomerModal")
    .addItem("Nuevo producto", "openProductModal")
    .addItem("Nuevo Cliente", "openClientModal")
    .addItem("Ingresar pedido", "openControlIngresoModal")
    .addItem("Agregar Abono", "openAbonoSidebar")
    .addItem("Pagar Pedido", "openPagoSidebar")
    .addToUi();
}

function openMainInterface() {
  const template = HtmlService.createTemplateFromFile('mainInterface');
  template.webAppUrl = ScriptApp.getService().getUrl();
  
  const html = template.evaluate()
      .setWidth(1000)
      .setHeight(700)
      .setTitle('Panel Principal - AloTuTienda');
  SpreadsheetApp.getUi().showModalDialog(html, 'Panel Principal - AloTuTienda');
}

function includes(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doGet(e) {
  try {
    const page = e.parameter.page;
    
    if (!page || page === 'home') {
      // Try with folder first, then without
      let template;
      try {
        template = HtmlService.createTemplateFromFile('main/mainInterface');
      } catch (e) {
        template = HtmlService.createTemplateFromFile('mainInterface');
      }
      template.webAppUrl = ScriptApp.getService().getUrl();
      return template.evaluate()
        .setTitle('AloTuTienda - Panel Principal')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // Map pages to files with CORRECT PATHS (Folder/File)
    const pageMap = {
      'createNewSale': 'newSale/createNewSaleForm',
      'inventory_product': 'newProduct/createNewProductForm', // Renamed to fix cache/routing issue
      'createNewClient': 'newClient/createNewClientForm', 
      'controlIngreso': 'inCotnrol/createControlIngresoForm',
      'addAbono': 'abono/addAbonoForm',
      'pagoPedido': 'pagoPedido/pagoPedidoForm',
      'cotizacion': 'cotizacion/cotizacion'
    };
    
    if (pageMap[page]) {
      let template;
      try {
        template = HtmlService.createTemplateFromFile(pageMap[page]);
      } catch (e) {
        // Fallback: try flat name if folder path fails
        const flatName = pageMap[page].split('/').pop();
        template = HtmlService.createTemplateFromFile(flatName);
      }
      
      return template.evaluate()
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    return HtmlService.createHtmlOutput('<h2>Página no encontrada</h2><p>La sección solicitada no existe.</p>')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (error) {
    return HtmlService.createHtmlOutput(`<h2>Error</h2><p>${error.message}</p>`)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function getUrl() {
  return ScriptApp.getService().getUrl();
}
