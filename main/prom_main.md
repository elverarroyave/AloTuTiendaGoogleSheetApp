Crea una interfaz principal para mi aplicación app script, que permita mostrar todas la funcionalidades de la aplicacíon ya construida
el html y el js deben estar en la carpeta main. 
Este es el panel general de las funcionalidades que se tienen en la aplicaición actualmente

La aplicación debe estar construida con bootstrap css y js, responsive para que se vea bien en cualquier dispositivo.

Debe tener un menu lateral que permita acceder a las funcionalidades de la aplicacíon.

```
const SPREADSHEET_ID = "12-WtjzoN1TrEG8t71H59MplnuvnTwmuJ1d7OJ49fa6Y";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  //Menú Venta
  ui.createMenu("AloTuTienda")
    .addItem("Nueva venta", "openCurstomerModal")
    .addItem("Nuevo producto", "openProductModal")
    .addItem("Nuevo Cliente", "openClientModal")
    .addItem("Ingresar pedido", "openControlIngresoModal")
    .addItem("Agregar Abono", "openAbonoSidebar")
    .addItem("Pagar Pedido", "openPagoSidebar")
    .addToUi();
}
```