# Crear nuevo cliente

## Necesidad
Nesito crear un formulario para crear un nuevo cliente en mi proyecto, este formulario debe estar construido con html, bootstrap javascript y Apps Script
Debe tener como entrada el: Nombre del cliente*, Código del cliente*, Teléfono*, Correo*, Dirección, Socio. los campos marcados con asterisco(*) son obligatorios. Un boton al final del formulario que me permita registrar el cliente que se habilite solo cuando los campos obligatorios esten completados. Se debe crear en un nuevo menu llamado "Cliente" con item "Nuevo Cliente"

El código del cliente debe obtenerse usando la funcion getSequences() para obtener todas las sequencias, función que ya existe en otro script.gs
(Toma como referencia el uso en los script anteriores)
Que se encuentran en la tabla con nombre SEQUENCES y tiene las siguientes secuencias
       | A     |B       |C     |D      |E
1      |NUMBER |NAME	|PREFIX|CURRENT|NEXT
2      |1      |VENTA	|VENTA |419	   |420
3      |2	   |PRODUCTO|PDCT  |90	   |91
4      |3	   |CLIENTE	|CLN   |235	   |236  <----- Secuencia que corresponde a clientes
5      |4	   |INGRESO	|IN	   |85 	   |86

al cliente actual le debe asignar la secuencia siguiente(NEXT) y luego debe actualizar la tabla, remplazando el valor CURRENT de la secuencia correspondiente
con el valor NEXT recuperado anteriormente, de esta forma el valor NEXT se actualizará automaticamente, dado que esa celda tien una formula(=D4+1)

CLIENTES es el nombre de la tabla donde se debe insertar el producto, tiene algunos clientes ya insertados con la siguiente estructura
 |A                                    |B    |C        |D            |E           |F                                         |G                                                     |H
1| NOMBRE                              | num | CODIGO  | DOCUMENTO   | TELEFONO   | CORREO                                   | DIRECCION                                            | SOCIO          |
2|-------------------------------------|-----|---------|-------------|------------|------------------------------------------|------------------------------------------------------|----------------|
3| ABEL JOSE PEREZ CONTRERAS           | 1   | CLNT001 | 1069488014  | 3148692079 | abeljoseperezcontreras@hotmail.com       | Asovivienda Crra 21 # 3-35                           | YINA ATENCIA   |
4| ADILANDESTWARTH MOSQUERA ARAGON     | 2   | CLNT002 | 1038647406  | 3147517178 | mosqueramonica2020@gmail.com             | NUEVA SANTAELENA                                     | YINA ATENCIA   |
5| ADRIANA SANDRIC MENDOZA MARTINEZ    | 3   | CLNT003 | 1001533009  | 3218946550 | adrianamen1997@gmail.com                 | Barrio La colombianita                               | YARIS RODRIGUEZ|
6| AGRO VETERINARIA BUENAVISTA         | 4   | CLNT004 | 10950669-9  | 3126259123 | agroferreteriabuenavista@gmail.com       | Carrera 12 9 a 31 Buenavista Brrio los Almendros     | YINA ATENCIA   |


Este es un ejemplo de un formulario ya hecho para que lo tomes como referencia

===============HTML=====================
```
    <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nueva Venta</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/tom-select/dist/css/tom-select.bootstrap5.css" rel="stylesheet">
    <style>
        body { background-color: #f8f9fa; } /* Fondo gris suave unificado */
        
        /* Estilo para los campos de solo lectura (form-control-plaintext) */
        .form-control-plaintext {
            padding-left: 0.75rem; 
            color: #212529;
        }

        /* Estilo para asteriscos de campos obligatorios */
        .required-asterisk {
            color: red;
            margin-left: 3px;
            font-weight: bold;
        }

        /* Ajuste para que la tarjeta se vea bien */
        .card-form {
            border: none;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
    </style>
</head>

<body>
    <div class="container mt-3 mb-5">
        <div class="text-center mb-4">
            <h3>Nueva Venta</h3>
            <p class="text-muted small">Registre los detalles de la transacción.</p>
        </div>

        <form class="card card-form p-4" onsubmit="sendInformationSale(event, this)">
            
            <div class="accordion" id="accordionVenta">

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCliente" aria-expanded="true" aria-controls="collapseCliente">
                            <strong>1. Datos del Cliente y Pago</strong>
                        </button>
                    </h2>
                    <div id="collapseCliente" class="accordion-collapse collapse show" data-bs-parent="#accordionVenta">
                        <div class="accordion-body">
                            <div class="mb-3">
                                <label for="clientName" class="form-label fw-bold">Cliente<span class="required-asterisk">*</span></label>
                                <select class="form-select" id="clientName" name="clientName" aria-label="Lista de cliente"></select>
                                <input type="hidden" id="clientCode" name="clientCode">
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="plazo" class="form-label fw-bold">Plazo de pago<span class="required-asterisk">*</span></label>
                                    <select class="form-select" id="plazo" name="plazo">
                                        <option value="UNO">Contado</option>
                                        <option value="DOS">1 mes</option>
                                        <option value="TRES">2 meses</option>
                                        <option value="CUATRO">3 meses</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label for="amount" class="form-label fw-bold">Cantidad<span class="required-asterisk">*</span></label>
                                    <input type="number" id="amount" name="amount" class="form-control" value="1" min="1">
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="checkIsCredict" name="checkIsCredict">
                                    <label class="form-check-label" for="checkIsCredict">¿Es una venta a crédito?</label>
                                </div>
                            </div>

                            <div class="mb-3" id="firstPaymentContainer" style="display: none;">
                                <label for="firstPayment" class="form-label fw-bold">Primer abono<span class="required-asterisk">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="text" id="firstPayment" class="form-control" name="firstPayment" placeholder="0">
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="paymentMethod" class="form-label fw-bold">Método de pago<span class="required-asterisk">*</span></label>
                                <select id="paymentMethod" class="form-select" name="paymentMethod">
                                    <option value="" selected>Seleccione método...</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="B/bia K">Bancolombia Katy</option>
                                    <option value="B/bia E">Bancolombia Elver</option>
                                    <option value="Nequi K">Nequi Katy</option>
                                    <option value="Nequi E">Nequi Elver</option>
                                    <option value="Addi">Addi</option>
                                    <option value="SisteCredito">SisteCredito</option>
                                    <option value="BoldDatafono">BoldDatafono</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseProducto" aria-expanded="false" aria-controls="collapseProducto">
                            <strong>2. Selección de Producto</strong>
                        </button>
                    </h2>
                    <div id="collapseProducto" class="accordion-collapse collapse" data-bs-parent="#accordionVenta">
                        <div class="accordion-body">
                            <div class="mb-3">
                                <label for="productName" class="form-label fw-bold">Producto<span class="required-asterisk">*</span></label>
                                <select class="form-select" id="productName" name="productName"></select>
                                <input type="hidden" id="productCode" name="productCode" readonly>
                            </div>

                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label text-muted small mb-0">Precio Total</label>
                                    <input type="text" class="form-control-plaintext fw-bold fs-5 text-primary" id="priceProduct" name="priceProduct" readonly value="—"> 
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label text-muted small mb-0">Stock</label>
                                    <input type="text" class="form-control-plaintext fw-bold" id="stockProduct" readonly value="—">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSocio" aria-expanded="false" aria-controls="collapseSocio">
                            <strong>3. Vendedor / Socio</strong>
                        </button>
                    </h2>
                    <div id="collapseSocio" class="accordion-collapse collapse" data-bs-parent="#accordionVenta">
                        <div class="accordion-body">
                            <label for="socio" class="form-label fw-bold">Socio responsable<span class="required-asterisk">*</span></label>
                            <select id="socio" class="form-select" name="socio">
                                <option value="" selected>Seleccione socio...</option>
                                <option value="YINA ATENCIA">Yina Atencia</option>
                                <option value="KATY IRIARTE">Katy Iriarte</option>
                                <option value="YARIS RODRIGUEZ">Yaris Rodriguez</option>
                                <option value="MARIA PATERNINA">Maria Paternina</option>
                                <option value="ELVER ARROYAVE">Elver Arroyave</option>
                                <option value="KAREN EDITH BRACAMONTE">Karen Bracamonte</option>
                                <option value="VANESSA ARROYAVE">Vanessa Arroyave</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 p-3 bg-light rounded border">
                <h5 class="mb-3 text-secondary">Resumen preliminar</h5>
                <div class="row g-2 small">
                    <div class="col-6"><strong>Código Venta:</strong> <span id="resCodigoVenta" class="text-primary">...</span></div>
                    <div class="col-6"><strong>Cliente:</strong> <span id="resCliente">—</span></div>
                    <div class="col-6"><strong>Producto:</strong> <span id="resProducto">—</span></div>
                    <div class="col-6"><strong>Total a pagar:</strong> <span id="resPrecio" class="fw-bold text-success">—</span></div>
                </div>
            </div>

            <div class="d-grid gap-2 mt-4">
                <button type="submit" id="btnSubmit" class="btn btn-primary btn-lg" disabled>
                    Registrar Venta
                </button>
            </div>
        </form>

        <div class="modal fade" id="saleSummaryModal" tabindex="-1" aria-labelledby="saleSummaryModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title" id="saleSummaryModalLabel">¡Venta Exitosa!</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="saleSummaryContent"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar y Nueva Venta</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tom-select/dist/js/tom-select.complete.min.js"></script>

    <script>
        // --- 1. Utilidades y Constantes ---

        function formatCurrency(value) {
            if (typeof value !== 'number' || Number.isNaN(value)) {
                return ''; 
            }
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP', 
                minimumFractionDigits: 0
            }).format(value);
        }

        const DOM = {
            resCodigoVenta: document.getElementById('resCodigoVenta'),
            clientName: document.getElementById('clientName'),
            clientCode: document.getElementById('clientCode'),
            plazo: document.getElementById('plazo'),
            amount: document.getElementById('amount'),
            checkIsCredict: document.getElementById('checkIsCredict'),
            firstPayment: document.getElementById('firstPayment'),
            firstPaymentContainer: document.getElementById('firstPaymentContainer'),
            paymentMethod: document.getElementById('paymentMethod'),
            productName: document.getElementById('productName'),
            productCode: document.getElementById('productCode'),
            priceProduct: document.getElementById('priceProduct'),
            stockProduct: document.getElementById('stockProduct'),
            socio: document.getElementById('socio'),
            btnSubmit: document.getElementById('btnSubmit') 
        };

        const TS = {};

        // --- 2. Funciones de Inicialización ---

        function initializeTomSelect() {
            try {
                TS.paymentMethodSelect = new TomSelect(DOM.paymentMethod, {
                    create: false,
                    maxItems: 1,
                    allowEmptyOption: true,
                    placeholder: "Buscar método...",
                    sortField: { field: 'text', direction: 'asc' },
                    onChange: validateForm 
                });

                TS.socioSelect = new TomSelect(DOM.socio, {
                    create: false,
                    maxItems: 1,
                    allowEmptyOption: true,
                    placeholder: "Buscar socio...",
                    sortField: { field: 'text', direction: 'asc' },
                    onChange: validateForm
                });
            } catch (e) {
                console.warn('TomSelect no pudo inicializarse:', e);
            }
        }

        function loadInventoryData() {
            google.script.run.withSuccessHandler(populateProductSelect).getInventory();
        }

        function loadClientsData() {
            google.script.run.withSuccessHandler(populateClientsSelect).getClients();
        }

        function loadSequencesData() {
            google.script.run.withSuccessHandler(getSequences).getSequences();
        }

        // --- 3. Funciones de Lógica ---

        function calculatePriceByPlazo(product) {
            const plazo = DOM.plazo.value || 'UNO';
            const amount = Number(DOM.amount.value) || 1;
            let priceResult;

            switch (plazo) {
                case 'UNO': priceResult = product.UNO; break;
                case 'DOS': priceResult = product.DOS; break;
                case 'TRES': priceResult = product.TRES; break;
                case 'CUATRO': priceResult = product.CUATRO; break;
                case 'CINCO': priceResult = product.CINCO; break;
                default: priceResult = product.UNO;
            }
            return Number(priceResult) * amount;
        }

        function updateProductValues() {
            const selectedOption = DOM.productName.options[DOM.productName.selectedIndex];

            if (!selectedOption || selectedOption.value === "") {
                DOM.priceProduct.value = '—';
                DOM.stockProduct.value = '—';
                DOM.productCode.value = '';
                updateSummary();
                validateForm(); 
                return;
            }

            const productPrices = {
                UNO: selectedOption.dataset.price,
                DOS: selectedOption.dataset.priceDos,
                TRES: selectedOption.dataset.priceTres,
                CUATRO: selectedOption.dataset.priceCuatro,
                CINCO: selectedOption.dataset.priceCinco
            };

            const totalPrice = calculatePriceByPlazo(productPrices);
            const stock = selectedOption.dataset.stock;
            const code = selectedOption.dataset.code;

            DOM.priceProduct.value = formatCurrency(totalPrice); // Formateado visualmente
            // Nota: Para el envío guardamos el valor numérico crudo si es necesario, 
            // pero aquí se muestra bonito. Al enviar, asegúrate de limpiar el formato si el backend espera numero.
            // En tu código original enviabas el valor del input. 
            
            DOM.stockProduct.value = stock;
            DOM.productCode.value = code;

            updateSummary();
            validateForm(); 
        }

        function toggleFirstPayment() {
            if (DOM.checkIsCredict.checked) {
                DOM.firstPaymentContainer.style.display = "block";
            } else {
                DOM.firstPaymentContainer.style.display = "none";
                DOM.firstPayment.value = ""; 
            }
            updateSummary();
            validateForm();
        }

        function populateProductSelect(optionsArray) {
            if (optionsArray.error) {
                DOM.productName.innerHTML = `<option value="">Error: ${optionsArray.error}</option>`;
                return;
            }
            DOM.productName.innerHTML = '<option value="" disabled selected>Seleccione producto...</option>';

            for (const product of optionsArray) {
                const option = document.createElement('option');
                option.value = product.CODIGO || ''; 
                option.textContent = `${product.NOMBRE || 'Sin nombre'} (${product.CODIGO || ''})`;
                option.dataset.price = product.UNO;
                option.dataset.priceDos = product.DOS;
                option.dataset.priceTres = product.TRES;
                option.dataset.priceCuatro = product.CUATRO;
                option.dataset.priceCinco = product.CINCO;
                option.dataset.stock = product.STOCK;
                option.dataset.code = product.CODIGO || 'No Code';
                DOM.productName.appendChild(option);
            }

            TS.productNameSelect = new TomSelect(DOM.productName, {
                create: false,
                maxItems: 1,
                allowEmptyOption: true,
                placeholder: "Buscar producto...",
                sortField: { field: 'text', direction: 'asc' },
                onChange: function() {
                    updateProductValues(); 
                }
            });
        }

        function populateClientsSelect(optionsArray) {
            if (optionsArray.error) {
                DOM.clientName.innerHTML = `<option value="">Error: ${optionsArray.error}</option>`;
                return;
            }
            DOM.clientName.innerHTML = '<option value="" disabled selected>Seleccione cliente...</option>';

            for (const client of optionsArray) {
                const option = document.createElement('option');
                option.value = client.NOMBRE || ''; 
                option.textContent = `${client.NOMBRE || 'Sin nombre'} (${client.CODIGO || ''})`;
                option.dataset.code = client.CODIGO || '';
                DOM.clientName.appendChild(option);
            }

            TS.clientNameSelect = new TomSelect(DOM.clientName, {
                create: false,
                maxItems: 1,
                allowEmptyOption: true,
                placeholder: "Buscar cliente...",
                sortField: { field: 'text', direction: 'asc' },
                onChange: function() {
                    const selected = DOM.clientName.options[DOM.clientName.selectedIndex];
                    const code = selected && selected.dataset ? selected.dataset.code : '';
                    DOM.clientCode.value = code || '';
                    updateSummary();
                    validateForm(); 
                }
            });
        }

        var saleSequence;
        function getSequences(sequencesArray) {
            saleSequence = sequencesArray.find(seq => seq.NAME === 'VENTA');
            if (saleSequence) {
                // Asumiendo lógica de prefijo + numero
                let newSaleNumber = saleSequence.PREFIX + saleSequence.NEXT || 'N/A';
                DOM.resCodigoVenta.innerText = newSaleNumber;
            } else {
                DOM.resCodigoVenta.innerText = 'N/A';
            }
        }

        // --- 4. Validaciones y Envío ---

        function validateForm() {
            let isValid = true;

            if (!DOM.clientName.value || DOM.clientName.value === "") isValid = false;
            if (!DOM.plazo.value || DOM.plazo.value === "") isValid = false;
            
            const amountVal = parseFloat(DOM.amount.value);
            if (isNaN(amountVal) || amountVal <= 0) isValid = false;

            if (DOM.checkIsCredict.checked) {
                if (!DOM.firstPayment.value || DOM.firstPayment.value.trim() === "") {
                    isValid = false;
                }
            }

            if (!DOM.paymentMethod.value || DOM.paymentMethod.value === "") isValid = false;
            if (!DOM.productName.value || DOM.productName.value === "") isValid = false;
            if (!DOM.socio.value || DOM.socio.value === "") isValid = false;

            DOM.btnSubmit.disabled = !isValid;
            return isValid;
        }

        function updateSummary() {
            // Actualización del resumen pequeño en el formulario principal
            document.getElementById("resCliente").innerText = DOM.clientName.value || "—";
            
            const _prodSelected = DOM.productName.options[DOM.productName.selectedIndex];
            document.getElementById("resProducto").innerText = (_prodSelected && _prodSelected.text) ? _prodSelected.text.split('-')[0] : "—";
            
            document.getElementById("resPrecio").innerText = DOM.priceProduct.value || "—";
        }

        function sendInformationSale(e, form) {
            e.preventDefault();

            if (!validateForm()) {
                alert("Por favor complete todos los campos obligatorios.");
                return;
            }

            const stockAvailable = parseInt(DOM.stockProduct.value);
            const amountRequested = parseInt(DOM.amount.value);
            
            // Validación básica de stock (opcional, remover si no se necesita estricta)
            if (!isNaN(stockAvailable) && stockAvailable < amountRequested) {
                alert("Stock insuficiente para la cantidad solicitada.");
                return;
            }

            const submitBtn = DOM.btnSubmit;
            submitBtn.disabled = true; 
            submitBtn.innerText = "Procesando...";

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            data.checkIsCredict = DOM.checkIsCredict.checked;
            // Importante: Si priceProduct tiene formato moneda (e.g. $1.000), el backend debe limpiarlo o limpiarlo aquí
            // Aquí lo enviamos tal cual, asumiendo que el backend lo maneja o que getRange().setValue() lo acepta.
            data.priceProduct = DOM.priceProduct.value; 
            data.productCode = DOM.productCode.value;
            data.clientName = DOM.clientName.value;

            google.script.run
                .withSuccessHandler(function(response) {
                    submitBtn.innerText = "Registrar Venta"; 
                    showSummary(response);
                })
                .withFailureHandler(function(err) {
                    submitBtn.disabled = false; 
                    submitBtn.innerText = "Registrar Venta";
                    alert('Error al crear la venta: ' + (err && err.message ? err.message : JSON.stringify(err)));
                })
                .createNewSale(data, saleSequence);
        }

        function showSummary(response) {
            if (!response || !response.success) {
                alert('No se pudo registrar la venta.');
                DOM.btnSubmit.disabled = false;
                return;
            }

            const contentEl = document.getElementById('saleSummaryContent');
            // Reconstrucción del HTML para el Modal de éxito
            const html = `
                <div class="text-center mb-4">
                    <h2 class="text-success display-6">${response.saleCode}</h2>
                    <p class="text-muted">${response.date}</p>
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Cliente:</span> <strong>${DOM.clientName.value}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Producto:</span> <strong>${DOM.productName.options[DOM.productName.selectedIndex].text}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Cantidad:</span> <strong>${DOM.amount.value}</strong>
                    </li>
                     <li class="list-group-item d-flex justify-content-between">
                        <span>Total:</span> <strong class="text-success">${DOM.priceProduct.value}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between">
                        <span>Vendedor:</span> <span>${DOM.socio.value}</span>
                    </li>
                </ul>
            `;

            contentEl.innerHTML = html;

            const modalEl = document.getElementById('saleSummaryModal');
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }

        function resetForm() {
            const form = document.querySelector('form');
            if (!form) return;

            form.reset();
            loadSequencesData();

            try {
                if (TS.paymentMethodSelect) TS.paymentMethodSelect.clear();
                if (TS.socioSelect) TS.socioSelect.clear();
                if (TS.clientNameSelect) TS.clientNameSelect.clear();
                if (TS.productNameSelect) TS.productNameSelect.clear();
            } catch (e) {
                console.warn('Clean TS error:', e);
            }

            DOM.priceProduct.value = '—';
            DOM.stockProduct.value = '—';
            DOM.productCode.value = '';
            DOM.clientCode.value = '';

            toggleFirstPayment();
            updateSummary();
            validateForm();
            DOM.btnSubmit.disabled = true; 
        }

        // --- 5. Inicialización Global ---
        document.addEventListener('DOMContentLoaded', function() {
            toggleFirstPayment();
            loadClientsData();
            loadInventoryData();
            loadSequencesData();
            initializeTomSelect();

            DOM.checkIsCredict.addEventListener("change", toggleFirstPayment);

            for (const key in DOM) {
                if (DOM[key] && DOM[key].tagName && DOM[key].id !== 'btnSubmit') {
                    DOM[key].addEventListener("input", () => { updateSummary(); validateForm(); });
                    DOM[key].addEventListener("change", () => { updateSummary(); validateForm(); });
                }
            }

            updateSummary();
            validateForm();

            const modalEl = document.getElementById('saleSummaryModal');
            if (modalEl) {
                modalEl.addEventListener('hidden.bs.modal', resetForm);
            }
        });
    </script>
</body>
</html>
```

=====================GS===================
```
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  //Menú Venta
  ui.createMenu("Venta").addItem("Nueva venta", "openCurstomerModal").addToUi();
  // Menú Producto (NUEVO)
  ui.createMenu("Producto")
    .addItem("Nuevo producto", "openProductModal")
    .addToUi();
    
}


function openCurstomerModal(){
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

  // --- 2. OBTENER FECHA Y HORA ---
  let now = new Date();
  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  let formattedDate = Utilities.formatDate(now, timeZone, "dd/MM/yyyy HH:mm:ss");

  //Set sale number;
  const newSaleNumber = saleSequence.NEXT;

  // --- 4. ESCRITURA DE DATOS EN LA FILA targetRow (Fila 3) ---
  
  // Columna A: Fecha y Hora
  sheet.getRange('A' + targetRow).setValue(formattedDate);
  
  // Columna B: Número de Venta (Valor calculado)
  sheet.getRange('B' + targetRow).setValue(newSaleNumber); 
  
  //UPDATE SALE SEQUENCE
  setSequences(saleSequence.NUMBER, newSaleNumber)

  // Columna d: Socio
  sheet.getRange('D' + targetRow).setValue(form.socio); 
  
  // Columna E: Plazo meses
  sheet.getRange('E' + targetRow).setValue(form.plazo); 
  
  // Columna F: Código Producto
  sheet.getRange('F' + targetRow).setValue(form.productCode); 
  
  // Columna H: Cantidad
  sheet.getRange('H' + targetRow).setValue(form.amount); 
  
  // Columna I: Código Cliente
  sheet.getRange('I' + targetRow).setValue(form.clientCode); 

  // Columna L: Precio
  sheet.getRange('L' + targetRow).setValue(form.priceProduct); 

  if(form.checkIsCredict){
    // Columna N: Pago
    sheet.getRange('N' + targetRow).setValue(form.firstPayment);
  }else{
    // Columna N: Pago
    sheet.getRange('N' + targetRow).setValue(form.priceProduct); 
  }

  //Metodo de pago
  sheet.getRange('M' + targetRow).setValue(form.paymentMethod); 
  
  // Devuelve un objeto con información de la venta para que el cliente (sidebar) muestre el resumen
  return {
    success: true,
    saleCode: saleSequence.PREFIX + newSaleNumber,
    date: formattedDate,
    insertedRow: targetRow,
    form: form
  };
}

/**
 * Función que tu formulario HTML llamará para obtener la lista de socios.
 */
function getInventory() {
  const sheetName = "INVENTARIO";
  const rowIndex = 3;
  const startColumn = 1;
  const endColumn = 14;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}

function getClients(){
    const sheetName = "CLIENTES";
    const rowIndex = 3;
    const startColumn = 1;
    const endColumn = 3;
    return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}


// ==========================================
// 3. UTILIDADES (Revisar que existan)
// ==========================================

function getSequences(){
  const sheetName = "SEQUENCES";
  const rowIndex = 2;
  const startColumn = 1;
  const endColumn = 5;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}

// Función ajustada para escribir en la columna CURRENT (Columna D)
function setSequences(sequenceNumber, newCurrentValue){
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("SEQUENCES");
  
  // sequenceNumber viene de la columna A (NUMBER). 
  // Asumimos que NUMBER corresponde a la fila relativa + 1 o buscamos la fila.
  // Dado tu tabla: 1->Fila 2, 2->Fila 3 (Producto). 
  // Fórmula general basada en tu tabla: Fila = sequenceNumber + 1
  
  const rowToUpdate = parseInt(sequenceNumber) + 1;
  
  // Actualizamos la columna D (CURRENT)
  sheet.getRange('D' + rowToUpdate).setValue(newCurrentValue);
}

// Función auxiliar necesaria (ya la tenías, pero asegúrate de que esté en el archivo)
function getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn) {
    // ... (Usa la misma función que proporcionaste en tu prompt)
    // Si no la copiaste aquí, asegúrate de que esté en tu archivo Code.gs original
    try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
    if (!sheet) throw new Error(`Hoja no encontrada: ${sheetName}`);
    const lastRow = sheet.getLastRow();
    if (lastRow < rowIndex) return [];
    const numColumns = endColumn - startColumn + 1;
    const values = sheet.getRange(rowIndex, startColumn, lastRow - rowIndex + 1, numColumns).getValues();
    const headers = sheet.getRange(rowIndex - 1, startColumn, 1, numColumns).getValues()[0];
    const result = [];
    values.forEach(row => {
      if (row.every(cell => cell === '')) return;
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index];
      });
      result.push(rowObject);
    });
    return result;
  } catch (e) {
    return { error: e.message };
  }
}
```

