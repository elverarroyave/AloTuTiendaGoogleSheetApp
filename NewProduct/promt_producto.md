# Crear nuevo producto

## Necesidad
Nesito crear un formulario para crear un nuevo producto en mi proyecto, este formulario debe estar construido con html, bootstrap javascripty Apps Script
Debe tener como entrada el: Nombre del producto*, Código del producto*, Categoria de venta(Seleccionable con opciones: Electrodoméstico), Precio de venta* con los campos marcados con asterisco(*) como obligatorios. Un boton al final del formulario que me permita registrar el producto que se habilite solo cuando los campos obligatorios esten completados. Se debe crear en un nuevo menu llamado "Producto" con item "Nuevo producto"

El código del producto debe obtenerse usando la funcion getSequences() para obtener todas las sequencias

Que se encuentran en la tabla con nombre SEQUENCES y tiene las siguientes secuencias
       | A     |B       |C     |D      |E
1      |NUMBER |NAME	|PREFIX|CURRENT|NEXT
2      |1      |VENTA	|VENTA |419	   |420
3      |2	   |PRODUCTO|PDCT  |90	   |91
4      |3	   |CLIENTE	|CLN   |235	   |236
5      |4	   |INGRESO	|IN	   |85 	   |86

al producto actual le debe asignar la secuencia siguiente(NEXT) y luego debe actualizar la tabla, remplazando el valor CURRENT de la secuencia correspondiente
con el valor NEXT recuperado anteriormente, de esta forma el valor NEXT se actualizará automaticamente, dado que esa celda tien una formula(=D3+1)

INVENTARIO es el nombre de la tabla donde se debe insertar el producto, tiene algunos productos ya insertados con la siguiente estructura
    |A                                                           |B      |C      |D                 |E
2   |NOMBRE	                                                     |NUM    |CODIGO |CATEGORIA         |UNO
3   |Televisor CAIXUN 55 pulgadas LED Uhd4K Smart TV C55VAUG	 |90     |PDCT090|Electrodomestico	|$  1,450,000 
4   |Portatil HP 14 Intel core i3 8GB de RAM 512GB SSD           |89     |PDCT089|Electrodomestico	|$  1,550,000 
5   |Licuadora Imusa Infiny Force 10 1.75 L GRIS vaso de vidrio  |88     |PDCT088|Electrodomestico	|$  179,000 
6   |Ventilador De Techo Altezza Vento Café	                     |87     |PDCT087|Electrodomestico	|$  279,000 
7   |Torre De Sonido SAMSUNG  (1500 vatios)	                     |86     |PDCT086|Electrodomestico	|$  1,249,000 
8   |Ventilador Samurai Air Protec Maxx 16"	                     |85     |PDCT085|Elcetrodomestico	|$  230,000 
9   |Ventilador Samurai Ultra Silence Force Plus 18" 2 en 1	     |84     |PDCT084|	                |$  350,000 
10  |Hidrolavadora FEMMTO 1400W 1600PSI	                         |83     |PDCT083|Ferretería	    |$  320,000 
11  |Ventilador Pared Altezza PRO 18" Malla plastica	         |82     |PDCT082|Electrodomestico	|$  208,000 
12  |Batería 10 Piezas Antiadherente Gris Imusa 	             |81     |PDCT081|Cocina	        |$  279,000 
13  |Freidora de aire Manual 4Lts DF OSTER. 	                 |80     |PDCT080|Electrodomestico	|$  359,000 

Este es un ejemplo de un formulario ya hecho para que lo tomes como referencia

===============HTML=====================
```
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Nueva Venta - Bootstrap Accordion Form</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/tom-select/dist/css/tom-select.bootstrap5.css" rel="stylesheet">
        <style>
            /* Estilo para los campos de solo lectura dentro de un formulario (form-control-plaintext) */
            .form-control-plaintext {
                padding-left: 0.75rem; /* Ajuste para que se vea alineado con otros inputs */
            }
        </style>
    </head>

    <body>
        <div class="mt-3 text-center">
            <h1>Nueva venta</h1>
        </div>

        <form class="container mt-4 mb-5" onsubmit="sendInformationSale(event, this)">
            <div class="accordion" id="accordionVenta">

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCliente" aria-expanded="true" aria-controls="collapseCliente">
                            Cliente
                        </button>
                    </h2>
                    <div id="collapseCliente" class="accordion-collapse collapse show" data-bs-parent="#accordionVenta">
                        <div class="accordion-body">
                            <div class="mb-3">
                                <label for="clientName" class="form-label">Lista de cliente:</label>
                                <select class="form-select" id="clientName" name="clientName" aria-label="Lista de cliente"></select>
                                <input type="hidden" id="clientCode" name="clientCode">
                            </div>

                            <div class="mb-3">
                                <label for="plazo" class="form-label">Plazo de pago:</label>
                                <select class="form-select" id="plazo" name="plazo" aria-label="Plazo de pago">
                                    <option value="UNO">Contado</option>
                                    <option value="DOS">1 meses</option>
                                    <option value="TRES">2 meses</option>
                                    <option value="CUATRO">3 meses</option>
                                </select>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6 mb-3 mb-md-0">
                                    <label for="amount" class="form-label">Cantidad:</label>
                                    <input type="number" id="amount" name="amount" class="form-control" value="1" min="1">
                                </div>

                                <div class="col-md-6 d-flex align-items-center">
                                    <div class="form-check pt-md-4">
                                        <input class="form-check-input" type="checkbox" id="checkIsCredict" name="checkIsCredict">
                                        <label class="form-check-label" for="checkIsCredict">Es crédito?</label>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3" id="firstPaymentContainer">
                                <label for="firstPayment" class="form-label">Primer abono:</label>
                                <input type="text" id="firstPayment" class="form-control" name="firstPayment" placeholder="$">
                            </div>

                            <div class="mb-3">
                                <label for="paymentMethod" class="form-label">Método de pago:</label>
                                <select id="paymentMethod" class="form-select" name="paymentMethod" aria-label="Método de pago">
                                    <option value="" selected>Seleccione método de pago...</option>
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
                            Producto
                        </button>
                    </h2>
                    <div id="collapseProducto" class="accordion-collapse collapse" data-bs-parent="#accordionVenta">
                        <div class="accordion-body">
                            <div class="mb-3">
                                <label for="productName" class="form-label">Lista producto:</label>
                                <select class="form-select" id="productName" name="productName" aria-label="Lista de producto"></select>
                                <input type="hidden" id="productCode" name="productCode" readonly>
                            </div>

                            <div class="mb-3">
                                <label for="priceProduct" class="form-label mb-1">Precio Total (según plazo y cantidad):</label>
                                <input type="text" class="form-control-plaintext fw-bold" id="priceProduct" name="priceProduct" readonly value="—"> 
                            </div>

                            <div class="mb-3">
                                <label for="stockProduct" class="form-label mb-1">Cantidad disponible:</label>
                                <input type="text" class="form-control-plaintext" id="stockProduct" readonly value="—">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSocio" aria-expanded="false" aria-controls="collapseSocio">
                            Socio
                        </button>
                    </h2>
                    <div id="collapseSocio" class="accordion-collapse collapse" data-bs-parent="#accordionVenta">
                        <div class="accordion-body">
                            <select id="socio" class="form-select" name="socio" aria-label="Sin socio asociado">
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

            <div class="mt-4">
                <h3 class="mb-3">Resumen de la venta</h3>
                <div class="card shadow-sm">
                    <div class="card-body">
                        <p class="mb-1"><strong>Código de venta:</strong> <span id="resCodigoVenta" class="fw-normal"> —</span></p>
                        <p class="mb-1"><strong>Cliente:</strong> <span id="resCliente" class="fw-normal"> —</span></p>
                        <p class="mb-1"><strong>Plazo:</strong> <span id="resPlazo" class="fw-normal"> —</span></p>
                        <p class="mb-1"><strong>Cantidad:</strong> <span id="resCantidad" class="fw-normal"> —</span></p>
                        <p class="mb-1"><strong>Es crédito:</strong> <span id="resCredito" class="fw-normal"> —</span></p>
                        <p class="mb-1"><strong>Primer abono:</strong> $<span id="resPrimerAbono" class="fw-normal"> —</span></p>
                        <p><strong>Método de pago:</strong> <span id="resMetodoPago" class="fw-normal"> —</span></p>

                        <hr>

                        <p class="mb-1"><strong>Producto:</strong> <span id="resProducto" class="fw-normal"> —</span></p>
                        <p class="mb-1"><strong>Precio Total:</strong> $<span id="resPrecio" class="text-danger fw-bold"> —</span></p>
                        <p><strong>Stock disponible:</strong> <span id="resStock" class="fw-normal"> —</span></p>

                        <hr>

                        <p><strong>Socio:</strong> <span id="resSocio" class="fw-normal"> —</span></p>
                    </div>

                    <div class="container text-center pt-0 pb-3">
                        <button type="submit" class="btn btn-primary btn-lg w-75">Vender</button>
                    </div>
                </div>
            </div>
        </form>

        <!-- Modal para mostrar el resumen después de realizar la venta -->
        <div class="modal fade" id="saleSummaryModal" tabindex="-1" aria-labelledby="saleSummaryModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="saleSummaryModalLabel">Resumen de la venta</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Contenido será llenado dinámicamente -->
                        <div id="saleSummaryContent"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" id="btnSubmit" class="btn btn-primary btn-lg w-75" disabled>Vender</button>
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
            // ⚡ Referencia al botón de envío
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
                    sortField: { field: 'text', direction: 'asc' },
                    onChange: validateForm // ⚡ Validar al cambiar
                });

                TS.socioSelect = new TomSelect(DOM.socio, {
                    create: false,
                    maxItems: 1,
                    allowEmptyOption: true,
                    sortField: { field: 'text', direction: 'asc' },
                    onChange: validateForm // ⚡ Validar al cambiar
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


        // --- 3. Funciones de Lógica y Manejo de Datos ---

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
                validateForm(); // ⚡ Validar
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

            DOM.priceProduct.value = totalPrice; 
            DOM.stockProduct.value = stock;
            DOM.productCode.value = code;

            updateSummary();
            validateForm(); // ⚡ Validar
        }

        function toggleFirstPayment() {
            if (DOM.checkIsCredict.checked) {
                DOM.firstPaymentContainer.style.display = "block";
            } else {
                DOM.firstPaymentContainer.style.display = "none";
                DOM.firstPayment.value = ""; 
            }
            updateSummary();
            validateForm(); // ⚡ Validar cambios de estado
        }

        function populateProductSelect(optionsArray) {
            if (optionsArray.error) {
                DOM.productName.innerHTML = `<option value="">Error: ${optionsArray.error}</option>`;
                return;
            }

            DOM.productName.innerHTML = '<option value="" disabled selected>Seleccione una opción</option>';

            for (const product of optionsArray) {
                const option = document.createElement('option');
                option.value = product.CODIGO || ''; 
                option.textContent = `${product.NOMBRE || 'Sin nombre'} - ${product.CODIGO || ''}`;
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
                sortField: { field: 'text', direction: 'asc' },
                onChange: function() {
                    updateProductValues(); // Esto ya llama a validateForm
                }
            });
        }

        function populateClientsSelect(optionsArray) {
            if (optionsArray.error) {
                DOM.clientName.innerHTML = `<option value="">Error: ${optionsArray.error}</option>`;
                return;
            }

            DOM.clientName.innerHTML = '<option value="" disabled selected>Seleccione un cliente</option>';

            for (const client of optionsArray) {
                const option = document.createElement('option');
                option.value = client.NOMBRE || ''; 
                option.textContent = `${client.NOMBRE || 'Sin nombre'} - ${client.CODIGO || ''}`;
                option.dataset.code = client.CODIGO || '';
                DOM.clientName.appendChild(option);
            }

            TS.clientNameSelect = new TomSelect(DOM.clientName, {
                create: false,
                maxItems: 1,
                allowEmptyOption: true,
                sortField: { field: 'text', direction: 'asc' },
                onChange: function() {
                    // Actualizar código cliente oculto
                    const selected = DOM.clientName.options[DOM.clientName.selectedIndex];
                    const code = selected && selected.dataset ? selected.dataset.code : '';
                    DOM.clientCode.value = code || '';
                    updateSummary();
                    validateForm(); // ⚡ Validar
                }
            });
        }

        var saleSequence;
        function getSequences(sequencesArray) {
            saleSequence = sequencesArray.find(seq => seq.NAME === 'VENTA');
            if (saleSequence) {
                let newSaleNumber = saleSequence.PREFIX + saleSequence.NEXT || 'N/A';
                DOM.resCodigoVenta.innerText = newSaleNumber;
            } else {
                DOM.resCodigoVenta.innerText = 'N/A';
            }
        }

        // --- 4. Validaciones, Resumen y Envío ---

        /**
        * ⚡ NUEVA FUNCIÓN: Verifica si todos los campos obligatorios están listos.
        * Si todo está correcto, habilita el botón. Si no, lo deshabilita.
        */
        function validateForm() {
            let isValid = true;

            // 1. Cliente (Select)
            if (!DOM.clientName.value || DOM.clientName.value === "") isValid = false;

            // 2. Plazo (Select)
            if (!DOM.plazo.value || DOM.plazo.value === "") isValid = false;

            // 3. Cantidad (Mayor que cero)
            const amountVal = parseFloat(DOM.amount.value);
            if (isNaN(amountVal) || amountVal <= 0) isValid = false;

            // 4. Lógica de Crédito y Primer Abono
            if (DOM.checkIsCredict.checked) {
                // Si es crédito, primer abono es obligatorio y no puede estar vacío
                if (!DOM.firstPayment.value || DOM.firstPayment.value.trim() === "") {
                    isValid = false;
                }
            }

            // 5. Método de pago
            if (!DOM.paymentMethod.value || DOM.paymentMethod.value === "") isValid = false;

            // 6. Producto
            if (!DOM.productName.value || DOM.productName.value === "") isValid = false;

            // 7. Socio
            if (!DOM.socio.value || DOM.socio.value === "") isValid = false;

            // Aplicar estado al botón
            DOM.btnSubmit.disabled = !isValid;
            
            // Retornamos el valor por si se quiere usar en el onsubmit
            return isValid;
        }

        function updateSummary() {
            // Cliente
            document.getElementById("resCliente").innerText = DOM.clientName.value || "—";
            document.getElementById("resPlazo").innerText = DOM.plazo.options[DOM.plazo.selectedIndex].text || "—";
            document.getElementById("resCantidad").innerText = DOM.amount.value || "—";
            document.getElementById("resCredito").innerText = DOM.checkIsCredict.checked ? "Sí" : "No";
            document.getElementById("resPrimerAbono").innerText = DOM.firstPayment.value || "—";
            document.getElementById("resMetodoPago").innerText = DOM.paymentMethod.value || "—";

            // Producto
            const _prodSelected = DOM.productName.options[DOM.productName.selectedIndex];
            document.getElementById("resProducto").innerText = (_prodSelected && _prodSelected.text) || "—";
            document.getElementById("resPrecio").innerText = DOM.priceProduct.value || "—";
            document.getElementById("resStock").innerText = DOM.stockProduct.value || "—";

            // Socio
            const _socioSelected = DOM.socio.options[DOM.socio.selectedIndex];
            document.getElementById("resSocio").innerText = (_socioSelected && _socioSelected.text) || "—";
        }

        function sendInformationSale(e, form) {
            e.preventDefault();

            // ⚡ Doble chequeo de seguridad
            if (!validateForm()) {
                alert("Por favor complete todos los campos obligatorios.");
                return;
            }

            //Validate stock if stock is insufficient (0) show alert and return
            const stockAvailable = parseInt(DOM.stockProduct.value);
            const amountRequested = parseInt(DOM.amount.value);
            if (stockAvailable < amountRequested) {
                alert("Stock insuficiente para la cantidad solicitada.");
                return;
            }

            const submitBtn = DOM.btnSubmit;
            submitBtn.disabled = true; // Deshabilitar para evitar doble envío
            submitBtn.innerText = "Procesando...";

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            data.checkIsCredict = DOM.checkIsCredict.checked;
            data.priceProduct = DOM.priceProduct.value;
            data.productCode = DOM.productCode.value;
            data.clientName = DOM.clientName.value;

            google.script.run
                .withSuccessHandler(function(response) {
                    submitBtn.innerText = "Vender"; // Restaurar texto
                    // Nota: No habilitamos el botón aquí porque el modal se abre y al cerrar se resetea el form
                    showSummary(response);
                })
                .withFailureHandler(function(err) {
                    submitBtn.disabled = false; // Habilitar si falló para reintentar
                    submitBtn.innerText = "Vender";
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
            const _prodSelected = DOM.productName.options[DOM.productName.selectedIndex];
            const _socioSelected = DOM.socio.options[DOM.socio.selectedIndex];

            const html = `
                <div class="card">
                    <div class="card-body">
                        <p><strong>Fecha:</strong> ${response.date}</p>
                        <p><strong>Código de venta:</strong> ${response.saleCode}</p>
                        <hr>
                        <p><strong>Cliente:</strong> ${DOM.clientName.value || '—'} (${DOM.clientCode.value || '—'})</p>
                        <p><strong>Plazo:</strong> ${DOM.plazo.options[DOM.plazo.selectedIndex].text || '—'}</p>
                        <p><strong>Cantidad:</strong> ${DOM.amount.value || '—'}</p>
                        <p><strong>Es crédito:</strong> ${DOM.checkIsCredict.checked ? 'Sí' : 'No'}</p>
                        <p><strong>Primer abono:</strong> ${DOM.firstPayment.value || '—'}</p>
                        <p><strong>Método de pago:</strong> ${DOM.paymentMethod.value || '—'}</p>
                        <hr>
                        <p><strong>Producto:</strong> ${(_prodSelected && _prodSelected.text) || '—'}</p>
                        <p><strong>Precio Total:</strong> ${DOM.priceProduct.value || '—'}</p>
                        <p><strong>Stock disponible:</strong> ${DOM.stockProduct.value || '—'}</p>
                        <hr>
                        <p><strong>Socio:</strong> ${(_socioSelected && _socioSelected.text) || '—'}</p>
                    </div>
                </div>
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
                console.warn('No se pudo limpiar TomSelects:', e);
            }

            DOM.priceProduct.value = '—';
            DOM.stockProduct.value = '—';
            DOM.productCode.value = '';
            DOM.clientCode.value = '';

            toggleFirstPayment();
            updateSummary();
            validateForm(); // ⚡ Asegurar que el botón vuelva a estar deshabilitado
            DOM.btnSubmit.disabled = true; // Forzar disable por si acaso
        }

        // --- 5. Inicialización Global ---

        document.addEventListener('DOMContentLoaded', function() {
            toggleFirstPayment();
            loadClientsData();
            loadInventoryData();
            loadSequencesData();
            initializeTomSelect();

            // Listeners específicos
            DOM.checkIsCredict.addEventListener("change", toggleFirstPayment);

            // ⚡ Listener Global: Cualquier input o cambio dispara validación
            for (const key in DOM) {
                if (DOM[key] && DOM[key].tagName && DOM[key].id !== 'btnSubmit') {
                    DOM[key].addEventListener("input", () => { updateSummary(); validateForm(); });
                    DOM[key].addEventListener("change", () => { updateSummary(); validateForm(); });
                }
            }

            updateSummary();
            validateForm(); // ⚡ Chequeo inicial (debería deshabilitar el botón)

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
  SpreadsheetApp.getUi().createMenu("Venta").addItem("Nueva venta", "openCurstomerSidebar").addToUi();
}


function openCurstomerSidebar(){
  let html = HtmlService.createHtmlOutputFromFile("createNewSaleForm").setTitle("Crear nueva venta");
  SpreadsheetApp.getUi().showSidebar(html);
}

function createNewSale(form, saleSequence) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CONTROL_VENTAS");
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
 * Recupera una lista de valores únicos de una columna específica de una hoja.
 * @param {string} sheetName El nombre de la hoja donde están los datos (ej: 'CATALOGO_SOCIOS').
 * @param {number} columnIndex El índice de la columna a leer (1 para A, 2 para B, etc.).
 * @returns {Array<string>} Una matriz de valores únicos de la columna.
 */
function getRowDataAsObjects(sheetName,rowIndex, startColumn, endColumn) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Hoja no encontrada: ${sheetName}`);
    }

    // El rango A2:A para obtener todas las filas de la columna, excluyendo el encabezado
    // Usa getMaxRows() para obtener el rango total, pero solo desde la fila 2.
    const lastRow = sheet.getLastRow();
    
    // Si no hay datos (solo encabezado), devuelve una matriz vacía
    if (lastRow < rowIndex) {
      return [];
    }

    // Calcula cuántas columnas leer
    const numColumns = endColumn - startColumn + 1;

    // 1. Lee el rango completo de datos.
    // Fila inicial, Columna inicial, número de filas, número de columnas
    const values = sheet.getRange(rowIndex, startColumn, lastRow - rowIndex + 1, numColumns).getValues();

    // 2. Lee los encabezados para usarlos como claves (keys) de los objetos
    // Esto hace que la estructura de los objetos sea dinámica y más fácil de usar en el frontend.
    const headers = sheet.getRange(rowIndex - 1, startColumn, 1, numColumns).getValues()[0];

    const result = [];

    // 3. Itera sobre cada fila de valores
    values.forEach(row => {
      // Ignora filas completamente vacías
      if (row.every(cell => cell === '')) return;

      const rowObject = {};
      
      // 4. Mapea cada valor de la celda a su encabezado (key)
      headers.forEach((header, index) => {
        // Usa la sintaxis de corchetes para crear la propiedad del objeto dinámicamente
        rowObject[header] = row[index];
      });
      
      result.push(rowObject);
    });

    return result;

  } catch (e) {
    Logger.log("Error al obtener datos: " + e.toString());
    return { error: e.message };
  }
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

function getSequences(){
  const sheetName = "SEQUENCES";
  const rowIndex = 2;
  const startColumn = 1;
  const endColumn = 5;
  return getRowDataAsObjects(sheetName, rowIndex, startColumn, endColumn);
}

function setSequences(targetRow, nextValue){
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SEQUENCES");
    // Columna D: CurrenValue, targetRow + 1, porque la secuencia inicia desde la fila 2
  sheet.getRange('D' + (targetRow + 1)).setValue(nextValue);
}
```

