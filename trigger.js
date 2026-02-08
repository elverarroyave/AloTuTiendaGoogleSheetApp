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
    sale.DIAS_ATRASO = saleStatus.diasAtraso;

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
  let socios = getSocios();
  let clientes = getClients();
  let sociosAdmin = socios.filter(socio => socio.CARGO === CARGOS_SOCIOS.ADMIN);
  sendNotification(sociosAdmin, salesOverdue, `<p>Hola Administrador.</p><p>Se han detectado las siguientes ventas en estado <strong>ATRAZADO</strong>:</p>`);
  sendNotificationForSocios(socios, salesOverdue, `<p>Hola Socio.</p><p>Se ha detectato que algunos de tus clientes tienen ventas en estado <strong>ATRAZADO</strong>:</p>`);
  sendNotificationsClientes(clientes, salesOverdue);
}

function sendNotification(socios, sales, message) {
  let htmlBody = createOverdueSalesTemplate(sales, message);
  socios.forEach(socio => {
    if (socio.EMAIL) {
      MailApp.sendEmail({
        to: socio.EMAIL,
        subject: '[REPORTE] Ventas Atrasadas - AloTuTienda',
        htmlBody: htmlBody
      });
      console.log(`Correo enviado a ${socio.NOMBRE} (${socio.EMAIL})`);
    } else {
      console.log(`Socio ${socio.NOMBRE} no tiene email registrado.`);
    }
  })
}

function sendNotificationForSocios(socios, sales, message) {
  socios.forEach(socio => {
    let salesOverDueForSocio = sales.filter(sale => sale.COD_SOCIO === socio.CODIGO);
    if (salesOverDueForSocio.length > 0) {
      sendNotification([socio], salesOverDueForSocio, message);
    }
  })
}

function sendNotificationToClients(clients, sales) {
  clients.forEach(client => {
    const codigosCompras = sales.map(sale => sale.CODIGO).join(', ');
    let message = `<p>Hola Sr./Sra. ${client.NOMBRE}.</p>
    <p>Se han detectado que tu compra se encuentra en estado <strong>ATRAZADO</strong>.</p>
    <p>Por favor, realice el pago correspondiente, recuerde que esto es esencial para mantener tu crédito en la tienda y evitar reportes negativos.</p>
    <p>Si tienes dudas, contacte al administrador. <a class="nav-link" href="https://wa.me/573122082703?text=Hola%2C%20Tengo%20dudas%20con%20mi%20compra%20${codigosCompras}" target="_blank">
    <span>AloTuTienda - WhatsApp</span>
    </a></p>
    `;
    let htmlBody = createOverdueSalesTemplate(sales, message);
    if (client.CORREO) {
      MailApp.sendEmail({
        to: client.CORREO,
        subject: '[REPORTE] Ventas Atrasadas - AloTuTienda',
        htmlBody: htmlBody
      });
      console.log(`Correo enviado a ${client.NOMBRE} (${client.CORREO})`);
    } else {
      console.log(`Cliente ${client.NOMBRE} no tiene correo registrado.`);
    }
  })
}

function sendNotificationsClientes(clientes, sales) {
  clientes.forEach(cliente => {
    let salesOverDueForCliente = sales.filter(sale => sale.COD_CLNT === cliente.CODIGO);
    if (salesOverDueForCliente.length > 0) {
      sendNotificationToClients([cliente], salesOverDueForCliente);
    }
  })
}

function createOverdueSalesTemplate(sales, message) {
  let listItems = sales.map(sale => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.CODIGO}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.CLIENTE || 'N/A'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.PRODUCTO || 'N/A'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${sale.DIAS_ATRASO} ${sale.DIAS_ATRASO === 1 ? 'día' : 'días'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${formatCurrency(sale.SALDO_PAGO_IDEAL)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${formatCurrency(sale.RESTA)}</td>
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
            ${message}
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa; text-align: left;">
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Código</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Cliente</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Producto</th>
                  <th style="padding: 10px; border-bottom: 2px solid #ddd;">Días Atraso</th>
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
