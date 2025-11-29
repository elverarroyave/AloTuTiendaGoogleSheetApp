// NUEVA FUNCIÓN PARA ABRIR CLIENTE
function openClientModal(){
    let html = HtmlService.createHtmlOutputFromFile("createNewClientForm").setWidth(800).setHeight(650);
    SpreadsheetApp.getUi().showModalDialog(html, "Registrar Nuevo Cliente");
}

// ==========================================
// 2. LÓGICA DE CLIENTES
// ==========================================

function createNewClient(form) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("CLIENTES");
  
  // 1. Obtener Secuencia
  const sequences = getSequences(); 
  const clientSequence = sequences.find(seq => seq.NAME === 'CLIENTE'); // Busca la fila donde NAME es CLIENTE
  
  if (!clientSequence) {
    throw new Error("No se encontró la secuencia de CLIENTE en la tabla SEQUENCES");
  }

  const nextNum = clientSequence.NEXT; 
  const fullCode = clientSequence.PREFIX + nextNum;

  const targetRow = 3; // Insertar siempre en fila 3 (debajo de encabezados)

  // 2. Insertar Fila
  sheet.insertRowBefore(targetRow);

  try{
      // 3. Escribir Datos
      // Estructura Tabla: 
      // A: NOMBRE | B: NUM | C: CODIGO | D: DOCUMENTO | E: TELEFONO | F: CORREO | G: DIRECCION | H: SOCIO
      
      sheet.getRange(CLIENTES.NOMBRE + targetRow).setValue(form.clientName.toUpperCase()); 
      sheet.getRange(CLIENTES.NUM + targetRow).setValue(nextNum);
      sheet.getRange(CLIENTES.CODIGO + targetRow).setValue(fullCode);
      sheet.getRange(CLIENTES.DOCUMENTO + targetRow).setValue(form.clientDoc || ""); // Campo Documento (para mantener orden columna)
      sheet.getRange(CLIENTES.TELEFONO + targetRow).setValue(form.clientPhone);
      sheet.getRange(CLIENTES.CORREO + targetRow).setValue(form.clientEmail);
      sheet.getRange(CLIENTES.DIRECCION + targetRow).setValue(form.clientAddress);
      sheet.getRange(CLIENTES.SOCIO + targetRow).setValue(form.socio);
    
      // 4. Actualizar Secuencia
      setSequences(clientSequence.NUMBER, nextNum);
    
      return {
        success: true,
        code: fullCode,
        name: form.clientName
      };
  }catch(error){
    console.error("Error al crear el cliente. Realizando rollback:", error);
    
    // --- ROLLBACK: ELIMINAR FILA INSERTADA ---
    try {
        sheet.deleteRow(targetRow);
        console.log(`Rollback exitoso: Fila ${targetRow} eliminada de CLIENTES.`);
    } catch (e) {
        console.error("Error en rollback de CLIENTES:", e);
    }
    
    throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${error.message}`);
  }
}
