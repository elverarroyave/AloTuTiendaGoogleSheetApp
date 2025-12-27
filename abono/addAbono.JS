function openAbonoSidebar() {
  let html = HtmlService.createHtmlOutputFromFile("addAbonoForm").setTitle("Agregar Abono");
  SpreadsheetApp.getUi().showSidebar(html);
}

// ==========================================
// 2. LÓGICA DE ABONOS (NUEVO)
// ==========================================

function createAbono(form) {
  console.log('form createAbono: ', form);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetIngresoEgreso = ss.getSheetByName(INGRESOS_EGRESOS.NAME_TABLE);
  const targetRowIngresoEgreso = INGRESOS_EGRESOS.TARGET_ROW;
  const sheetAbonos = ss.getSheetByName("ABONOS");
  const targetRowAbonos = 2;

  //Obtener secuencia para abonoSeq
  const abonoSeq = getSequence('ABONO');
  const abonoNewCode = abonoSeq.PREFIX + abonoSeq.NEXT;

  // 2. Insertar Fila
  sheetAbonos.insertRowBefore(targetRowAbonos);

  try {
    // 3. Preparar Datos
    const now = getCurrentDateTime();
    const formulaClientName = '=XLOOKUP(ABONOS[COD_VENTA],CONTROL_VENTAS[CODIGO],CONTROL_VENTAS[CLIENTE],"CLIENTE NO ENCONTRADO")';
    const formulaProductName = '=XLOOKUP(ABONOS[COD_VENTA],CONTROL_VENTAS[CODIGO],CONTROL_VENTAS[PRODUCTO],"PRODUCTO NO ENCONTRADO")';
    const valorAbono = Number(form.abonoValue);
    const detalle = `Abono para venta ${form.ventaCode}`;

    // Registrar en control de ingresos
    let inOutNewCode = addControlIngreso('ABONO', detalle, valorAbono, form.metodoPago);

    // Escribir datos en tabla Abono
    sheetAbonos.getRange(ABONOS.FECHA + targetRowAbonos).setValue(now);
    sheetAbonos.getRange(ABONOS.CODIGO + targetRowAbonos).setValue(abonoNewCode);
    sheetAbonos.getRange(ABONOS.COD_IN_OUT + targetRowAbonos).setValue(inOutNewCode);
    sheetAbonos.getRange(ABONOS.COD_VENTA + targetRowAbonos).setValue(form.ventaCode);
    sheetAbonos.getRange(ABONOS.CLIENTE + targetRowAbonos).setValue(formulaClientName);
    sheetAbonos.getRange(ABONOS.PRODUCTO + targetRowAbonos).setValue(formulaProductName);
    sheetAbonos.getRange(ABONOS.VALOR + targetRowAbonos).setValue(valorAbono);

    // 5. Actualizar Secuencia
    setSequences(abonoSeq.NUMBER, abonoSeq.NEXT);

    let ventaResult = getDataAbono(form.ventaCode);
    console.log('ventaResult: ', ventaResult);
    //Si resta es igual a 0 cambiar estado de la venta a PAGADO
    let estadoVenta = definirEstadoVenta(ventaResult);
    if (ventaResult.resta <= 0) {
      // (tableConfig, column, row, value)
      estadoVenta.estado = ESTADO_VENTA.PAGADO;
      setValueByCodeAndColumn(CONTROL_VENTAS, CONTROL_VENTAS.ESTADO, ventaResult.index, estadoVenta.estado);
    } else {
      setValueByCodeAndColumn(CONTROL_VENTAS, CONTROL_VENTAS.ESTADO, ventaResult.index, estadoVenta.estado);
    }

    return {
      date: now,
      success: true,
      code: inOutNewCode,
      value: Number(form.abonoValue),
      ventaCode: form.ventaCode,
      metodoPago: form.metodoPago,
      cliente: ventaResult.cliente,
      clienteCodigo: ventaResult.clienteCodigo,
      socioCodigo: ventaResult.socioCodigo,
      producto: ventaResult.producto,
      resta: ventaResult.resta,
      precio: ventaResult.precio,
      estado: estadoVenta.estado,
      codigoVenta: ventaResult.codigoVenta,
    };

  } catch (error) {
    console.error("Error al crear el abono. Realizando rollback:", error);

    // --- ROLLBACK: ELIMINAR FILA INSERTADA ---
    try {
      sheetIngresoEgreso.deleteRow(targetRowIngresoEgreso);
      sheetAbonos.deleteRow(targetRowAbonos);
      console.log(`Rollback exitoso: Filas ${targetRowIngresoEgreso} y ${targetRowAbonos} eliminadas de INGRESOS_EGRESOS y ABONOS respectivamente.`);
    } catch (e) {
      console.error("Error en rollback de INGRESOS_EGRESOS y ABONOS:", e);
    }

    throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${error.message}`);
  }
}

function getDataAbono(saleCode) {
  const result = getObjectByCode(CONTROL_VENTAS, saleCode);
  if (result != null) {
    response = {
      index: result.index,
      fechaCompra: parseDateLocalTime(result.FECHA),
      cPagos: result.C_PAGOS,
      cliente: result.CLIENTE,
      clienteCodigo: result.COD_CLNT,
      socioCodigo: result.COD_SOCIO,
      producto: result.PRODUCTO,
      total: result.TOTAL,
      resta: result.RESTA,
      precio: result.PRECIO,
      estado: result.ESTADO,
      codigoVenta: result.CODIGO,
    }
    return response;
  } else {
    throw new Error("No se encontro la venta");
  }
}

function sendNotification(data) {
  const cliente = getObjectByCode(CLIENTES, data.clienteCodigo);
  console.log('cliente: ', cliente);
  const socio = getObjectByCode(SOCIOS, data.socioCodigo);
  console.log('socio: ', socio);

  try {
    if (cliente.CORREO) {
      const subject = `[ABONO] Registro de abono - ${data.producto}`;
      sendAbonoNotificationEmail(cliente.CORREO, subject, data);
      console.log(`Correo enviado a: ${cliente.CORREO}`);
    } else {
      console.log("No se envió correo: Cliente sin correo registrado.");
    }
    if (socio.EMAIL) {
      const subject = `[ABONO] tu cliente ${data.cliente} registro un abono.`;
      sendAbonoNotificationEmail(socio.EMAIL, subject, data);
      console.log(`Correo enviado a: ${socio.EMAIL}`);
    } else {
      console.log("No se envió correo: Socio sin correo registrado.");
    }
  } catch (emailError) {
    console.error("Error al enviar el correo:", emailError);
    // No lanzamos error para no afectar la venta que ya fue exitosa
  }


}

function sendAbonoNotificationEmail(email, subject, data) {
  // Formateo de moneda simple para el correo
  const formatMoney = (val) => {
    return '$ ' + Number(val).toLocaleString('es-CO');
  };

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2E86AB; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">Resumen de Abono</h2>
        <p style="margin: 5px 0 0;">Se ha registrado un nuevo pago exitosamente.</p>
      </div>
      
      <div style="padding: 20px;">
        <p>Hola, el siguiente es el detalle del abono registrado:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Cliente:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.cliente}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Producto:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.producto}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Código Venta:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.ventaCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Método de Pago:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.metodoPago}</td>
          </tr>
           <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Estado Actual:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.estado}</td>
          </tr>
        </table>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin-top: 20px; border-radius: 6px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px;"><strong>Valor Abonado:</strong></td>
              <td style="padding: 5px; text-align: right; font-size: 1.1em; color: #2E86AB;"><strong>${formatMoney(data.value)}</strong></td>
            </tr>
            <tr>
              <td style="padding: 5px; color: #d9534f;"><strong>Saldo Restante:</strong></td>
              <td style="padding: 5px; text-align: right; color: #d9534f;"><strong>${formatMoney(data.resta)}</strong></td>
            </tr>
          </table>
        </div>

        <p style="margin-top: 25px; font-size: 0.9em; color: #777; text-align: center;">
          Si tienes alguna duda, por favor contáctanos.
        </p>
      </div>
      
      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 0.8em; color: #888;">
        &copy; ${new Date().getFullYear()} AloTuTienda. Todos los derechos reservados.
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });

}