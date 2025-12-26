function triggerUpdateSaleStatus() {
  updateSaleStatus();
}

function updateSaleStatus() {
  const salesString = getSalesData();
  let sales = JSON.parse(salesString);
  sales = sales.filter(sale => sale.ESTADO === ESTADO_VENTA.AL_DIA || sale.ESTADO === ESTADO_VENTA.ATRAZADO);
  let salesOverdue = [];
  sales.forEach(sale => {
    let definirVenta = {
      fechaCompra: sale.FECHA,
      cPagos: sale.C_PAGOS,
      precio: sale.PRECIO,
      total: sale.TOTAL,
    }
    const saleStatus = definirEstadoVenta(definirVenta);
    sale.SALDO_PAGO_IDEAL = saleStatus.saldoParaPagoIdeal;

    if (saleStatus.estado != sale.ESTADO) {
      sale.ESTADO = saleStatus.estado;
      setValueByCodeAndColumn(CONTROL_VENTAS, CONTROL_VENTAS.ESTADO, sale.index, saleStatus.estado);
    }
    if (saleStatus.estado === ESTADO_VENTA.ATRAZADO) {
      salesOverdue.push(sale);
    }
  })

  if (salesOverdue.length > 0) {
    console.log('salesOverdue: ', salesOverdue);
    sendEmailSalesOverdue(salesOverdue);
  }
}

function sendEmailSalesOverdue(salesOverdue) {
  let socios = getAdminSocios();
  let htmlBody = createOverdueSalesTemplate(salesOverdue);

  socios.forEach(socio => {
    if (socio.EMAIL) {
      MailApp.sendEmail({
        to: socio.EMAIL,
        subject: 'Reporte de Ventas Atrasadas - AloTuTienda',
        htmlBody: htmlBody
      });
      console.log(`Correo enviado a ${socio.NOMBRE} (${socio.EMAIL})`);
    } else {
      console.log(`Socio ${socio.NOMBRE} no tiene email registrado.`);
    }
  })
}

function createOverdueSalesTemplate(sales) {
  let listItems = sales.map(sale => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.CODIGO}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.CLIENTE || 'N/A'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.PRODUCTO || 'N/A'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(sale.SALDO_PAGO_IDEAL).toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(sale.RESTA).toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #d9534f; font-weight: bold;">${sale.ESTADO}</td>
    </tr>
  `).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Reporte de Ventas Atrasadas</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hola,</p>
            <p>Se ha detectado que las siguientes ventas tienen un estado de <strong>ATRAZADO</strong>:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa; text-align: left;">
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Código</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Cliente</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Producto</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Saldo Mínimo Restante</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Saldo Total Restante</th>
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

function getAdminSocios() {
  const socios = getSocios();
  return socios.filter(socio => socio.CARGO === CARGOS_SOCIOS.ADMIN);
}