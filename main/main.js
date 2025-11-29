function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("AloTuTienda")
    .addItem("Panel Principal", "openMainInterface")
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

function doGet(e) {
  const page = e.parameter.page;
  
  if (!page || page === 'home') {
    const template = HtmlService.createTemplateFromFile('mainInterface');
    template.webAppUrl = ScriptApp.getService().getUrl();
    return template.evaluate()
      .setTitle('AloTuTienda - Panel Principal')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // Map pages to files
  const pageMap = {
    'createNewSale': 'createNewSaleForm',
    'createNewProduct': 'createNewProductForm',
    'createNewClient': 'createNewClientForm',
    'controlIngreso': 'createControlIngresoForm',
    'addAbono': 'addAbonoForm',
    'pagoPedido': 'pagoPedidoForm'
  };
  
  if (pageMap[page]) {
    return HtmlService.createTemplateFromFile(pageMap[page])
      .evaluate()
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  return HtmlService.createHtmlOutput('<h2>Página no encontrada</h2><p>La sección solicitada no existe.</p>');
}

function getUrl() {
  return ScriptApp.getService().getUrl();
}
