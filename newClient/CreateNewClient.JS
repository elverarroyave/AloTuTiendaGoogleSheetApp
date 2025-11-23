// NUEVA FUNCIÓN PARA ABRIR CLIENTE
function openClientModal(){
    let html = HtmlService.createHtmlOutputFromFile("createNewClientForm").setWidth(800).setHeight(650);
    SpreadsheetApp.getUi().showModalDialog(html, "Registrar Nuevo Cliente");
}

// ==========================================
// 2. LÓGICA DE CLIENTES
// ==========================================

function createNewClient(form) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("CLIENTES");
  
  // 1. Obtener Secuencia
  const sequences = getSequences(); 
  const clientSequence = sequences.find(seq => seq.NAME === 'CLIENTE'); // Busca la fila donde NAME es CLIENTE
  
  if (!clientSequence) {
    throw new Error("No se encontró la secuencia de CLIENTE en la tabla SEQUENCES");
  }

  const nextNum = clientSequence.NEXT; 
  // Formato código: PREFIX (CLN) + NEXT (ej: 236) -> CLN236
  // Si prefieres ceros a la izquierda como en tu ejemplo (CLNT001), usa: 
  // const fullCode = "CLNT" + nextNum.toString().padStart(3, '0'); 
  // Pero basándome en tu tabla SEQUENCE usaremos el prefijo configurado:
  const fullCode = clientSequence.PREFIX + nextNum;

  const targetRow = 3; // Insertar siempre en fila 3 (debajo de encabezados)

  // 2. Insertar Fila
  sheet.insertRowBefore(targetRow);

  // 3. Escribir Datos
  // Estructura Tabla: 
  // A: NOMBRE | B: NUM | C: CODIGO | D: DOCUMENTO | E: TELEFONO | F: CORREO | G: DIRECCION | H: SOCIO
  
  sheet.getRange('A' + targetRow).setValue(form.clientName.toUpperCase()); 
  sheet.getRange('B' + targetRow).setValue(nextNum);
  sheet.getRange('C' + targetRow).setValue(fullCode);
  sheet.getRange('D' + targetRow).setValue(form.clientDoc || ""); // Campo Documento (para mantener orden columna)
  sheet.getRange('E' + targetRow).setValue(form.clientPhone);
  sheet.getRange('F' + targetRow).setValue(form.clientEmail);
  sheet.getRange('G' + targetRow).setValue(form.clientAddress);
  sheet.getRange('H' + targetRow).setValue(form.socio);

  // 4. Actualizar Secuencia
  setSequences(clientSequence.NUMBER, nextNum);

  return {
    success: true,
    code: fullCode,
    name: form.clientName
  };
}
