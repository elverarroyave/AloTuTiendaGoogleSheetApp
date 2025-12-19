
# Realizar cuadre de caja

## Necesidad
Necesito un apartado para realizar un cuadre de caja:

Este debe calcular la fecha del último cuadre realizado, tomar todas las ventas realizadas a partir de esta fecha.
y calcular cuanto debe ser el total recaudado por las ventas encontradas(TOTAL DEL SISTEMA), este valor se obtiene al llamar una función calcularVentasCuadre().

Se debe construir un formulario de cuadre de caja que cuente con los siguientes inputs para que se facilite contar el dinero recaudado.

El código del cuadre debe obtenerse usando la funcion getSequences() para obtener todas las sequencias, función que ya existe en otro script.gs
(Toma como referencia el uso en los script anteriores)
Que se encuentran en la tabla con nombre SEQUENCES y tiene las siguientes secuencias
       | A     |B               |C     |D      |E
1      |NUMBER |NAME	        |PREFIX|CURRENT|NEXT
2      |1      |VENTA	        |VENTA |419	   |420
3      |2	   |PRODUCTO        |PDCT  |90	   |91
4      |3	   |CLIENTE	        |CLN   |235	   |236  
5      |4	   |INGRESO	        |IN	   |185    |186
6      |5	   |METODO DE PAGO  |MDP   |6      |7  
7      |6	   |PROVEEDOR       |PROV  |12     |13  
13     |12	   |CUADRE          |CDRE  |32     |33  <----- Secuencia actual

Se debe crear un botón llamado REALIZAR CUADRE que al ser presionado, muestre un modal con los valores del formulario a enviar, si el usuario confirma, llame a la función saveCuadreCaja(form), que lleve del fomulario los siguientes datos: responsable, total efectivo, total cuentas, total otros, total sistema, total recaudado, faltante, sobre.

-----------------------------------
ALOTUTIENDA
-----------------------------------
-----------------------------------
CODIGO DE CUADRE            CDRE000
-----------------------------------
-----------------------------------
FECHA DEL CUADRE         DD/MM/YYYY
-----------------------------------
-----------------------------------
RESPONSABLE DEL CUADRE
El responsable debe ser un select simple, los valores se deben obtener de la tabla "USUARIOS" (Solo se deben mostrar los usuarios activos)
-----------------------------------
-----------------------------------
BILLETES
-----------------------------------
- $100.000     |    _________|  valorBilleteXCantidad
- $ 50.000     |    _________|  valorBilleteXCantidad
- $ 20.000     |    _________|  valorBilleteXCantidad
- $ 10.000     |    _________|  valorBilleteXCantidad
- $  5.000     |    _________|  valorBilleteXCantidad
- $  2.000     |    _________|  valorBilleteXCantidad
- $  1.000     |    _________|  valorBilleteXCantidad
                        TOTAL|  $ TOTAL
-----------------------------------
MONEDAS
-----------------------------------
- $  1.000     |    _________|  valorBilleteXCantidad
- $    500     |    _________|  valorBilleteXCantidad
- $    200     |    _________|  valorBilleteXCantidad
- $    100     |    _________|  valorBilleteXCantidad
- $     50     |    _________|  valorBilleteXCantidad
                        TOTAL|  $ TOTAL
-----------------------------------
CUENTAS
-----------------------------------
- Bancolombia                | _____________
- Nequi                      | _____________
- Otras		                 | _____________
-----------------------------------
OTROS
- Vales                      | _____________
- Otros                      | _____________
-----------------------------------
TOTAL DEL SISTEMA
-----------------------------------
TOTAL RECAUDADO
-----------------------------------
FALTANTE
-----------------------------------
SOBRE
-----------------------------------

Este es un ejemplo de un formulario ya hecho para que lo tomes como referencia, para mantener la consistencia en el diseño.

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Registrar Abono</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/tom-select/dist/css/tom-select.bootstrap5.css" rel="stylesheet">
    <?!= includes("componentCss.html"); ?>
</head>

<body>
    <div class="container mt-3">
        <div class="d-flex align-items-center mb-4 px-2">
            <div>
                <h3>Registrar Abono</h3>
                <p class="text-muted small mb-0">Registra un pago parcial o total a una venta.</p>
            </div>
        </div>

        <form id="abonoForm" class="card-form mb-5" onsubmit="handleSubmit(event)">
            
            <div class="mb-4">
                <label for="abonoCodeDisplay" class="form-label">Código de Abono (Referencia)</label>
                <input type="text" class="form-control preview-code" id="abonoCodeDisplay" readonly value="Cargando...">
            </div>

            <div class="mb-4">
                <label for="ventaCode" class="form-label">Código de Venta<span class="required-asterisk">*</span></label>
                <input id="ventaCode" class="form-control" name="ventaCode" placeholder="Ej: VENTA000" required>
            </div>

            <div class="mb-4">
                <label for="abonoValue" class="form-label">Valor del Abono<span class="required-asterisk">*</span></label>
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0 text-muted">$</span>
                    <input type="number" class="form-control border-start-0 ps-0" id="abonoValue" name="abonoValue" min="1" placeholder="0" required>
                </div>
                <div class="summary-box">
                    <span class="text-muted small d-block">Valor a registrar</span>
                    <p class="abono-value" id="abonoValueDisplay">—</p>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="metodoPago" class="form-label">Método de pago<span class="required-asterisk">*</span></label>
                <select id="metodoPago" class="form-select" name="metodoPago">
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

            </form>

        <div class="sticky-footer">
            <button type="submit" id="btnSubmit" class="btn-primary-custom" form="abonoForm" disabled>
                Registrar Abono
            </button>
        </div>

    </div>

    <div class="modal-overlay" id="genericModalOverlay">
        <div class="custom-modal">
            <div class="modal-header-custom">
                <div class="modal-icon" id="modalIcon">
                    <span id="modalIconSign">✓</span>
                </div>
                <div class="modal-title-custom">
                    <h3 id="modalTitle">Título</h3>
                </div>
            </div>
            
            <div class="modal-body-custom">
                <p id="modalMessage"></p>
                <div id="modalContentList"></div>
            </div>
            
            <div class="modal-footer-custom">
                <button class="modal-btn" id="modalActionBtn" onclick="closeGenericModal()">Entendido</button>
            </div>
        </div>
    </div>

    <!-- Modal de Confirmación Específico -->
    <div class="modal-overlay" id="confirmationModalOverlay">
        <div class="custom-modal">
            <div class="modal-header-custom">
                <div class="modal-icon warning">
                    <span>?</span>
                </div>
                <div class="modal-title-custom">
                    <h3>Confirmar Abono</h3>
                </div>
            </div>
            
            <div class="modal-body-custom">
                <p>Por favor verifica los datos antes de registrar el abono.</p>
                <div id="confModalContentList"></div>
            </div>
            
            <div class="modal-footer-custom" style="display: flex; gap: 10px; justify-content: center;">
                <button class="modal-btn" onclick="closeConfirmationModal()" style="background-color: transparent; color: red; border: 1px solid #ccc;">Cancelar</button>
                <button class="modal-btn" onclick="confirmSubmit()" style="background-color: var(--primary-color); color: green;">Confirmar Registro</button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tom-select/dist/js/tom-select.complete.min.js"></script>

    <script>
        const DOM = {
            form: document.getElementById('abonoForm'),
            abonoCodeDisplay: document.getElementById('abonoCodeDisplay'),
            ventaCode: document.getElementById('ventaCode'),
            abonoValue: document.getElementById('abonoValue'),
            abonoValueDisplay: document.getElementById('abonoValueDisplay'),
            metodoPago: document.getElementById('metodoPago'),
            btnSubmit: document.getElementById('btnSubmit'),
        };

        let abonoSeq = null; 
        let lastModalType = ''; 

        // --- 1. Utilidades ---
        function formatCurrency(value) {
            if (typeof value !== 'number' || Number.isNaN(value)) return '—';
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP', 
                minimumFractionDigits: 0
            }).format(value);
        }

        function formatValueDisplay() {
            const value = parseFloat(DOM.abonoValue.value) || 0;
            DOM.abonoValueDisplay.innerText = formatCurrency(value);
        }

        // --- 2. Modales Unificados (Copiados de la Interfaz Nueva Venta) ---
        function showModal(type, title, message, htmlDetails = '') {
            const overlay = document.getElementById('genericModalOverlay');
            const iconContainer = document.getElementById('modalIcon');
            const iconSign = document.getElementById('modalIconSign');
            const titleEl = document.getElementById('modalTitle');
            const msgEl = document.getElementById('modalMessage');
            const listEl = document.getElementById('modalContentList');
            const btn = document.getElementById('modalActionBtn');

            iconContainer.className = 'modal-icon';
            lastModalType = type;

            switch(type) {
                case 'success':
                    iconContainer.classList.add('success');
                    iconSign.textContent = '✓';
                    btn.textContent = 'Registrar otro Abono';
                    btn.style.borderColor = 'var(--success)';
                    break;
                case 'error':
                    iconContainer.classList.add('error');
                    iconSign.textContent = '✕';
                    btn.textContent = 'Intentar de nuevo';
                    btn.style.borderColor = 'var(--error)';
                    break;
                case 'warning':
                    iconContainer.classList.add('warning');
                    iconSign.textContent = '⚠';
                    btn.textContent = 'Corregir';
                    btn.style.borderColor = 'var(--warning)';
                    break;
                default:
                    btn.textContent = 'Entendido';
            }

            titleEl.textContent = title;
            msgEl.textContent = message; 
            listEl.innerHTML = htmlDetails; 
            overlay.classList.add('active');
        }

        function closeGenericModal() {
            document.getElementById('genericModalOverlay').classList.remove('active');
            if (lastModalType === 'success') { resetForm(); }
        }

        // --- 3. Carga de Datos y Secuencia ---
        function loadData() {
            google.script.run
                .withSuccessHandler(displaySequence)
                .withFailureHandler(err => {
                    DOM.abonoCodeDisplay.value = "Error";
                    console.error("Error al cargar secuencia:", err);
                })
                .getSequences();
        }
        
        function displaySequence(sequences) {
            // Asumiendo que la secuencia para Abono es 'INOUT' (entrada/salida de dinero)
            abonoSeq = sequences.find(s => s.NAME === 'ABONO' || s.PREFIX === 'INOUT'); 
            
            if (abonoSeq) {
                // Usamos el código de la secuencia (PREFIX + NEXT)
                DOM.abonoCodeDisplay.value = `${abonoSeq.PREFIX}${abonoSeq.NEXT || '0000'}`;
            } else {
                DOM.abonoCodeDisplay.value = "ERROR: Secuencia de Abono no encontrada.";
            }
        }

        // --- 4. Lógica y Validación ---
        function validateForm() {
            let isValid = true;
            let errorMsg = '';

            // Validar Código de Venta
            if (!DOM.ventaCode.value || DOM.ventaCode.value.trim() === "") { 
                isValid = false; 
                errorMsg = "El Código de Venta es obligatorio."; 
            }
            
            // Validar Valor del Abono (> 0)
            const value = parseFloat(DOM.abonoValue.value);
            if (isValid && (isNaN(value) || value <= 0)) { 
                isValid = false; 
                errorMsg = "El Valor del Abono debe ser mayor a cero.";
            }
            
            // Validar Método Pago
            if (isValid && !DOM.metodoPago.value) { 
                isValid = false; 
                errorMsg = "Debes seleccionar un Método de Pago.";
            } 

            // Actualizar estado del botón
            DOM.btnSubmit.disabled = !isValid;
            return { isValid, errorMsg }; 
        }

        // --- 5. Event Listeners y Handlers ---
        function addEventListeners() {
            DOM.abonoValue.addEventListener('input', () => {
                formatValueDisplay();
                validateForm();
            });
            DOM.ventaCode.addEventListener('input', validateForm);
            DOM.metodoPago.addEventListener('change', validateForm);
        }

        function handleSubmit(e) {
            e.preventDefault();
            
            const validation = validateForm();
            if (!validation.isValid) {
                showModal('warning', 'Faltan Datos', validation.errorMsg);
                return;
            }

            DOM.btnSubmit.disabled = true;
            DOM.btnSubmit.innerText = "Verificando...";
            const saleCode = DOM.ventaCode.value.toUpperCase().trim();
            google.script.run.withSuccessHandler(showConfirmationModal)
            .withFailureHandler(err => {
                // console.error("Error al cargar secuencia:", err);
                showModal('error', 'Error al consultar la venta', err, "Revise que el código de venta exista y tenga saldo pendiente.");
                DOM.btnSubmit.disabled = false;
                DOM.btnSubmit.innerText = "Registrar Abono";
            })
            .getDataAbono(saleCode);
        }

        function onSuccess(res) {
            DOM.btnSubmit.innerText = "Registrar Abono";

            if (res.error) {
                 showModal('error', 'Error de Lógica', res.error, res.details || "Revise que el código de venta exista y tenga saldo pendiente.");
                 DOM.btnSubmit.disabled = false;
                 return;
            }

            // Construir HTML de resumen para el éxito
            const detailsHtml = `
                <div class="modal-list-item"><span>Fecha</span> <strong>${res.date}</strong></div>
                <div class="modal-list-item"><span>Cliente</span> <strong>${res.cliente}</strong></div>
                <div class="modal-list-item"><span>Producto</span> <strong>${res.producto}</strong></div>
                <div class="modal-list-item"><span>Valor abonado</span> <strong style="color:var(--success)">${formatCurrency(res.value)}</strong></div>
                <div class="modal-list-item"><span>Método</span> <strong>${res.metodoPago}</strong></div>
                <div class="modal-list-item"><span>Saldo Restante</span> <strong>${formatCurrency(res.resta)}</strong></div>
            `;
            
            showModal('success', '¡Abono Registrado!', `El abono se ha completado exitosamente.`, detailsHtml);
        }

        // --- 6. Modal de Confirmación ---
        function showConfirmationModal(result) {
            // Manejo de la respuesta serializada
            if (typeof result === 'string') {
                result = JSON.parse(result);
            }
            const formData = {
                ventaCode: DOM.ventaCode.value.toUpperCase().trim(),
                abonoValue: parseFloat(DOM.abonoValue.value),
                metodoPago: DOM.metodoPago.value,
                abonoCode: DOM.abonoCodeDisplay.value
            };        

            const detailsHtml = `
                <div class="modal-list-item"><span>Cliente</span> <strong>${result.cliente}</strong></div>
                <div class="modal-list-item"><span>Producto </span> <strong>${result.producto}</strong></div>
                <div class="modal-list-item"><span>Código Venta</span> <strong>${formData.ventaCode}</strong></div>
                <div class="modal-list-item"><span>Valor Abono</span> <strong style="color:var(--primary-color)">${formatCurrency(formData.abonoValue)}</strong></div>
                <div class="modal-list-item"><span>Método Pago</span> <strong>${formData.metodoPago}</strong></div>
            `;

            document.getElementById('confModalContentList').innerHTML = detailsHtml;
            document.getElementById('confirmationModalOverlay').classList.add('active');
        }

        function closeConfirmationModal() {
            document.getElementById('confirmationModalOverlay').classList.remove('active');
            DOM.btnSubmit.disabled = false;
            DOM.btnSubmit.innerText = "Registrar Abono";
        }

        function confirmSubmit() {
            closeConfirmationModal();
            
            // Proceed with submission
            DOM.btnSubmit.disabled = true;
            DOM.btnSubmit.innerText = "Procesando...";

            const formData = {
                ventaCode: DOM.ventaCode.value.toUpperCase().trim(),
                abonoValue: parseFloat(DOM.abonoValue.value),
                metodoPago: DOM.metodoPago.value
            };

            google.script.run
                .withSuccessHandler(onSuccess)
                .withFailureHandler(err => {
                    DOM.btnSubmit.disabled = false;
                    DOM.btnSubmit.innerText = "Registrar Abono";
                    showModal('error', 'Error al Registrar', err.message || "Ocurrió un error inesperado en el servidor.");
                })
                .createAbono(formData, abonoSeq);
        }

        function resetForm() {
            DOM.form.reset();
            // Recargar secuencia
            DOM.abonoCodeDisplay.value = "Actualizando...";
            loadData(); 
            
            formatValueDisplay(); // Poner en "—"
            validateForm(); // Deshabilitar el botón
        }

        document.addEventListener('DOMContentLoaded', function() {
            loadData();
            addEventListeners();
            formatValueDisplay();
            validateForm();
        });
    </script>
</body>
</html>

<style>
        /* --- 1. Variables de Diseño (Idénticas a Interfaz Principal y Nueva Venta) --- */
        :root {
            --primary: #2E86AB;
            --primary-dark: #1C5F7B;
            --primary-light: #5DADE2;
            --accent: #E8F4F8;
            --background: #FAFBFC;
            --white: #ffffff;
            --text-dark: #2c3e50;
            --text-muted: #6c757d;
            --border: #e9ecef;
            --success: #28a745;
            --warning: #ffc107;
            --error: #dc3545;
            --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 6px rgba(0,0,0,0.06);
            --shadow-lg: 0 8px 15px rgba(0,0,0,0.1);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* --- 2. Estilos Generales y Contenedores --- */
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: var(--background);
            color: var(--text-dark);
            padding-bottom: 90px; /* Espacio para botón flotante */
        }

        h3 { color: var(--primary); font-weight: 700; margin-bottom: 0; }
        .text-muted { color: var(--text-muted) !important; }

        .card-form {
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: 16px;
            box-shadow: var(--shadow-md);
            padding: 25px;
            transition: var(--transition);
        }

        /* Mobile Fixes: Sin borde ni sombra en móvil */
        @media (max-width: 768px) {
            .card-form { padding: 15px; box-shadow: none; border: none; background: transparent; }
            body { background: var(--white); }
            .container { padding-left: 0; padding-right: 0; }
        }

        /* --- 3. Inputs y Formularios --- */
        .form-label {
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--text-dark);
            margin-bottom: 6px;
        }
        .required-asterisk { color: var(--error); margin-left: 3px; }

        .form-control, .form-select {
            border-radius: 10px;
            border: 1px solid var(--border);
            padding: 12px 15px; /* Más padding para touch */
            font-size: 1rem;
            transition: var(--transition);
            background-color: var(--accent);
        }

        .form-control:focus, .form-select:focus {
            border-color: var(--primary-light);
            box-shadow: 0 0 0 3px rgba(46, 134, 171, 0.15);
            background-color: var(--white);
        }

        /* Display del Código de Abono */
        .preview-code { 
            font-family: monospace; 
            color: var(--primary-dark) !important; 
            font-weight: bold; 
            background-color: var(--accent) !important;
            border: 2px dashed var(--border);
            padding-left: 10px !important;
        }

        /* Display del Valor del Abono */
        .summary-box {
            background: var(--accent);
            border-radius: 12px;
            padding: 15px;
            margin-top: 10px;
            text-align: right;
            border-left: 5px solid var(--primary);
        }
        .abono-value { 
            font-size: 1.5rem; 
            font-weight: 700; 
            color: var(--success); /* Éxito, ya que es dinero que entra */
            margin: 0;
        }

        /* --- 4. Botón Principal (Sticky Footer) --- */
        .sticky-footer {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: white; padding: 15px 20px;
            box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
            z-index: 100;
            border-top: 1px solid var(--border);
        }

        .btn-primary-custom {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
            border: none;
            color: white;
            padding: 14px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1.1rem;
            width: 100%;
            box-shadow: 0 4px 16px rgba(46, 134, 171, 0.3);
            transition: var(--transition);
        }

        .btn-primary-custom:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(46, 134, 171, 0.4);
        }
        
        .btn-primary-custom:disabled {
            background: var(--text-muted);
            box-shadow: none;
            cursor: not-allowed;
            opacity: 0.7;
        }

        /* --- 5. MODALES (Copiados de Nueva Venta) --- */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            display: none; align-items: center; justify-content: center;
            z-index: 2000; padding: 20px;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.2s ease;
        }
        .modal-overlay.active { display: flex; }
        
        .custom-modal {
            background: white; border-radius: 20px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
            max-width: 440px; width: 100%; overflow: hidden;
            animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { 
            from { opacity: 0; transform: translateY(40px) scale(0.95); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }

        .modal-header-custom { padding: 32px 28px 20px; text-align: center; }
        .modal-icon {
            width: 64px; height: 64px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; margin: 0 auto 20px; position: relative;
        }
        
        /* Variantes de Iconos */
        .modal-icon.success {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white;
            box-shadow: 0 8px 24px rgba(40, 167, 69, 0.3);
        }
        .modal-icon.error {
            background: linear-gradient(135deg, #dc3545 0%, #e63946 100%); color: white;
            box-shadow: 0 8px 24px rgba(220, 53, 69, 0.3);
        }
        .modal-icon.warning {
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white;
            box-shadow: 0 8px 24px rgba(255, 193, 7, 0.3);
        }

        .modal-title-custom h3 { font-size: 1.5rem; color: var(--text-dark); margin: 0; }
        
        .modal-body-custom { padding: 0 28px 28px; }
        .modal-body-custom p { color: var(--text-muted); text-align: center; font-size: 1rem; line-height: 1.5; margin-bottom: 15px; }

        /* Lista de detalles dentro del modal */
        .modal-list-item {
            display: flex; justify-content: space-between;
            padding: 10px 0; border-bottom: 1px solid var(--border);
            font-size: 0.95rem; color: var(--text-muted);
        }
        .modal-list-item strong { color: var(--text-dark); }
        .modal-list-item:last-child { border-bottom: none; }

        .modal-footer-custom { padding: 20px 28px 28px; display: flex; justify-content: center; gap: 10px; }
        .modal-btn {
            padding: 12px 24px; border-radius: 10px; border: 2px solid var(--border);
            background: var(--background); color: var(--text-dark);
            font-weight: 600; cursor: pointer; width: 100%;
            transition: all 0.2s;
        }
        .modal-btn:hover { transform: translateY(-1px); border-color: var(--primary); }
    </style>