function addCommission(data) {
    console.log('data addCommission: ', data);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetComisiones = ss.getSheetByName(COMISIONES.NAME_TABLE);
    const targetRow = COMISIONES.TARGET_ROW;
    if (!sheetComisiones) throw new Error("Sheet COMISIONES not found");

    //Obtener secuencia para comisionesSeq
    const comisionesSeq = getSequence('CMSN');
    const comisionesNewCode = comisionesSeq.PREFIX + comisionesSeq.NEXT;

    // Insertar fila
    sheetComisiones.insertRowBefore(targetRow);
    const date = getCurrentDateTime();
    const socioFormula = '=XLOOKUP(D2,SOCIOS[CODIGO],SOCIOS[NOMBRE],"NOT FOUND")';

    try {
        //Escribir datos en tabla de historico_comisiones
        sheetComisiones.getRange(COMISIONES.FECHA + targetRow).setValue(date);
        sheetComisiones.getRange(COMISIONES.CODIGO + targetRow).setValue(comisionesNewCode);
        // sheetComisiones.getRange(COMISIONES.COD_IN_OUT + targetRow).setValue(inOutNewCode);
        sheetComisiones.getRange(COMISIONES.COD_SOCIO + targetRow).setValue(data.codSocio);
        sheetComisiones.getRange(COMISIONES.SOCIO + targetRow).setValue(socioFormula);
        sheetComisiones.getRange(COMISIONES.T_VENTAS + targetRow).setValue(data.tVentas);
        sheetComisiones.getRange(COMISIONES.VALOR + targetRow).setValue(data.totalCommission);
        sheetComisiones.getRange(COMISIONES.PAGADA + targetRow).setValue(false);
        //Actualizar secuencia
        setSequences(comisionesSeq.NUMBER, comisionesSeq.NEXT);

        return { success: true, code: comisionesNewCode, date: date };

    } catch (e) {
        console.error('Error al guardar la comisión. Realizando rollback:', e);
        try {
            sheetComisiones.deleteRow(targetRow);
        } catch (e) {
            console.error('Error al realizar rollback:', e);
        }
        throw new Error(`Error en la transacción. Se realizó un rollback. Detalle: ${e.message}`);
    }
}

function calculateCommision(sales) {
    console.log('sales calculateCommision: ', sales);
    let totalCommission = 0;
    sales.forEach(sale => {
        if (sale.M_PAGO === 'BoldDatafono' || sale.M_PAGO === 'SisteCredito') {
            let partialCommission = sale.PRECIO_BASE * 0.07;
            sale.commission = partialCommission;
            totalCommission += partialCommission;
        } else {
            let partialCommission = sale.PRECIO_BASE * 0.1;
            sale.commission = partialCommission;
            totalCommission += partialCommission;
        }
    });
    console.log('totalCommission socio: ', sales[0].COD_SOCIO, ' suma: ', totalCommission);
    return {
        totalCommission: totalCommission,
        codSocio: sales[0].COD_SOCIO,
        tVentas: sales.length,
        salesCommissioned: sales
    };
}

function sendCommissionEmail(resume) {
    let message = `<p>Hola Socio. Queremos resaltar el gran esfuerzo que has realizado en la tienda. Te damos el resumen de las comisiones
    que has obtenido en este periodo.</p>
    <P> Resumen: </P>
    <p> Total de ventas comisionadas: ${resume.tVentas}</p>
    <p> Total comision: ${formatCurrency(resume.totalCommission)}</p>
    <p> Gracias por tu esfuerzo y dedicación.</p>
    <p> Atentamente, <br> AloTuTienda</p>`;

    let htmlBody = createCommissionTemplate(resume.salesCommissioned, message);
    if (resume.socio.EMAIL) {
        MailApp.sendEmail({
            to: resume.socio.EMAIL,
            subject: '[COMISION] Ventas Comisionadas - AloTuTienda',
            htmlBody: htmlBody
        });
    } else {
        console.log(`Socio ${resume.socio.NOMBRE} no tiene email registrado.`);
    }
}

function createCommissionTemplate(sales, message) {
    let listItems = sales.map(sale => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.CODIGO}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.CLIENTE || 'N/A'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.PRODUCTO || 'N/A'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatCurrency(sale.PRECIO_BASE)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatCurrency(sale.commission)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">COMISIONADA</td>
    </tr>
  `).join('');
    return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Reporte de Ventas Comisionadas</h2>
          </div>
          <div style="padding: 20px;">
            ${message}
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa; text-align: left;">
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Código</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Cliente</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Producto</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Precio Base</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Comisión</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${listItems}
              </tbody>
            </table>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Este es un mensaje automático del sistema AloTuTienda.</p>
          </div>
        </div>
      </body>
    </html>
  `;
} 