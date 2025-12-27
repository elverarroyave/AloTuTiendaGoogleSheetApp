function openCurstomerModal() {
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
  try {

    console.log('Formulario recibido crear nueva venta:', form);

    sheet.getRange(CONTROL_VENTAS.FECHA + targetRow).setValue(formattedDate);

    sheet.getRange(CONTROL_VENTAS.NUM + targetRow).setValue(newSaleNumber);

    sheet.getRange(CONTROL_VENTAS.CODIGO + targetRow).setValue(saleCode);

    //UPDATE SALE SEQUENCE
    setSequences(saleSequence.NUMBER, newSaleNumber)

    sheet.getRange(CONTROL_VENTAS.COD_SOCIO + targetRow).setValue(form.socioCode);

    sheet.getRange(CONTROL_VENTAS.C_PAGOS + targetRow).setValue(form.cPagos);

    sheet.getRange(CONTROL_VENTAS.COD_PRDT + targetRow).setValue(form.productCode);

    sheet.getRange(CONTROL_VENTAS.CANTIDAD + targetRow).setValue(form.amount);

    sheet.getRange(CONTROL_VENTAS.COD_CLNT + targetRow).setValue(form.clientCode);

    sheet.getRange(CONTROL_VENTAS.PRECIO_BASE + targetRow).setValue(form.priceBase);

    sheet.getRange(CONTROL_VENTAS.PRECIO + targetRow).setValue(form.priceProduct);

    if (form.checkIsCredict) {
      sheet.getRange(CONTROL_VENTAS.PAGO + targetRow).setValue(form.firstPayment);
      sheet.getRange(CONTROL_VENTAS.ESTADO + targetRow).setValue(SALE_STATUS.AL_DIA);
    } else {
      sheet.getRange(CONTROL_VENTAS.PAGO + targetRow).setValue(form.priceProduct);
      sheet.getRange(CONTROL_VENTAS.ESTADO + targetRow).setValue(SALE_STATUS.PAGADO);
    }

    //Metodo de pago
    sheet.getRange(CONTROL_VENTAS.M_PAGO + targetRow).setValue(form.paymentMethod);

    // Devuelve un objeto con información de la venta para que el cliente (sidebar) muestre el resumen
    const response = {
      success: true,
      saleCode: saleCode,
      date: formattedDate,
      insertedRow: targetRow,
      form: form
    };

    // --- 5. ENVIAR CORREO AL CLIENTE ---
    try {
      if (form.clientCorreo) {
        const subject = `[COMPRA] Resumen de Compra - ${form.productName}`;
        sendSaleNotificationEmail(form.clientCorreo, subject, form, saleCode, formattedDate);
        console.log(`Correo enviado a: ${form.clientCorreo}`);
      } else {
        console.log("No se envió correo: Cliente sin correo registrado.");
      }
      if (form.socioCorreo) {
        const subject = `[VENTA] Realizaste una venta a: ${form.clientName}`;
        sendSaleNotificationEmail(form.socioCorreo, subject, form, saleCode, formattedDate);
        console.log(`Correo enviado a: ${form.socioCorreo}`);
      } else {
        console.log("No se envió correo: Socio sin correo registrado.");
      }
    } catch (emailError) {
      console.error("Error al enviar el correo:", emailError);
      // No lanzamos error para no afectar la venta que ya fue exitosa
    }

    return response;

  } catch (error) {
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

function sendSaleNotificationEmail(email, subject, form, saleCode, date) {
  // Formateo de moneda simple para el correo
  const formatMoney = (val) => {
    return '$ ' + Number(val).toLocaleString('es-CO');
  };

  const isCredit = form.checkIsCredict;
  const paymentStatus = isCredit ? "Crédito / plazo: " + form.plazo : "Contado/Pagado";
  const firstPayment = isCredit ? formatMoney(form.firstPayment) : formatMoney(form.priceProduct);
  const total = formatMoney(form.priceProduct);

  let saldoPendiente = 0;
  if (isCredit) {
    saldoPendiente = Number(form.priceProduct) - Number(form.firstPayment);
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2E86AB; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">¡Gracias por tu compra!</h2>
        <p style="margin: 5px 0 0;">Aquí tienes el resumen de tu transacción.</p>
      </div>
      
      <div style="padding: 20px;">
        <p>Hola <strong>${form.clientName}</strong>,</p>
        <p>Hemos registrado tu compra exitosamente. A continuación los detalles:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Código de Venta:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${saleCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Producto:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.productName} (Ref. ${form.productCode})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Cantidad:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Plazo:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${paymentStatus}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Método de Pago:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${form.paymentMethod}</td>
          </tr>
        </table>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin-top: 20px; border-radius: 6px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px;"><strong>Total de la Compra:</strong></td>
              <td style="padding: 5px; text-align: right; font-size: 1.1em; color: #2E86AB;"><strong>${total}</strong></td>
            </tr>
            ${isCredit ? `
            <tr>
              <td style="padding: 5px;">Abono Inicial:</td>
              <td style="padding: 5px; text-align: right;">${firstPayment}</td>
            </tr>
            <tr>
              <td style="padding: 5px; color: #d9534f;"><strong>Saldo Pendiente:</strong></td>
              <td style="padding: 5px; text-align: right; color: #d9534f;"><strong>${formatMoney(saldoPendiente)}</strong></td>
            </tr>
            ` : ''}
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