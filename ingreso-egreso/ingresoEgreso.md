# Crear nuevo producto

## Necesidad
Nesito crear un formulario para crear un ingreso o un egreso en el control de ingresos egresos, para esto debo crear un nuevo menú llamádo "Ingreso Egreso"
Este debe tener un fomulario con los siguientes campos: 
- Label con la fecha actual y hora en formato dd/mm/yyyy hh:mm:ss que se actualice en tiempo real
- *Select para idenficiar si es un ingreso o un egreso
    <select id="type" name="type" class="form-select">
        <option value="" selected>Seleccione...</option>
        <option value="INGRESO">Ingreso</option>
        <option value="EGRESO">Egreso</option>
    </select>
- *Valor del ingreso o egreso 
- Detalle del ingreso o egreso (opcional)
- *Select con la categoria que identifican al ingreso o egreso
            <select id="category" name="category" class="form-select">
                <option value="" selected>Seleccione...</option>
                <option value="PAGO MEICO">PAGO MEICO</option>
                <option value="PAGO T.ÉXITO">PAGO T.ÉXITO</option>
                <option value="PAGO T.NU KATY">PAGO T.NU KATY</option>
                <option value="PAGO T.CMR FALABELLA">PAGO T.CMR FALABELLA</option>
                <option value="PAGO TRANSPORTE">PAGO TRANSPORTE</option>
            </select>
- Select con el método de pago (opcional) 
             <select id="paymentMethod" name="paymentMethod" class="form-select">
                <option value="" selected>Seleccione...</option>
                <option value="Efectivo">Efectivo</option>
                <option value="B/bia K">Bancolombia Katy</option>
                <option value="B/bia E">Bancolombia Elver</option>
                <option value="Nequi K">Nequi Katy</option>
                <option value="Nequi E">Nequi Elver</option>
                <option value="Addi">Addi</option>
                <option value="SisteCredito">SisteCredito</option>
                <option value="BoldDatafono">BoldDatafono</option>
            </select>
- Botón para guardar el ingreso o egreso (Soló abilitar cuando los campos obligatorios estén completados)

Para ejecutar el guardado llamar la funcion 
function addIngresoEgreso(form) {
    let inOutCode = '';
    if (form.type === 'INGRESO') {
        inOutCode = addControlIngreso(form.category, form.detalle, form.value, form.paymentMethod);
    } else {
        inOutCode = subControlIngreso(form.category, form.detalle, form.value, form.paymentMethod);
    }
    return inOutCode;
}

Al presionar el botón para guardar el ingreso o egreso, de debe mostrar un resumen de la transacción con los siguientes campos:
- Fecha y hora de la transacción
- Tipo de transacción (Ingreso o Egreso)
- Valor de la transacción (dependiendo si es un ingreso o un egreso, se debe mostrar verde o rojo)
- Detalle de la transacción
- Referencia de la transacción
- Método de pago
- Botón para confirmar la transacción o cancelar y volver al fomulario anterior

Esté es un ejemplo de otro fomulario para mantener la uniformidad
===============HTML=====================
```
    <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Nuevo Producto</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <?!= includes("componentCss.html"); ?>
</head>

<body>
    <div class="container mt-3">
        <div class="d-flex align-items-center mb-4 px-2">
            <div>
                <h3>Registrar Nuevo Producto</h3>
                <p class="text-muted small mb-0">Complete la información para registrar inventario.</p>
            </div>
        </div>

        <form id="productForm" class="card-form mb-5" onsubmit="handleSubmit(event)">
            
            <div class="mb-3">
                <label for="productName" class="form-label">
                    Nombre del producto<span class="required-asterisk">*</span>
                </label>
                <input type="text" class="form-control" id="productName" name="productName" 
                        placeholder="Ej: Lavadora Samsung 15kg..." required>
            </div>

            <div class="mb-3">
                <label for="productCodeDisplay" class="form-label">
                    Código del producto<span class="required-asterisk">*</span>
                </label>
                <div class="input-group">
                    <span class="input-group-text">Código</span>
                    <input type="text" class="form-control" id="productCodeDisplay" readonly value="Cargando...">
                </div>
                <div class="form-text text-muted">El código se asignará según la secuencia actual.</div>
            </div>

            <div class="mb-3">
                <label for="category" class="form-label">
                    Categoría de venta
                </label>
                <select class="form-select" id="category" name="category">
                    <option value="Electrodomestico" selected>Electrodoméstico</option>
                    <option value="Mueble">Mueble</option>
                    <option value="Tecnologia">Tecnología</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>

            <div class="mb-3">
                <label for="salePrice" class="form-label">
                    Precio de venta<span class="required-asterisk">*</span>
                </label>
                <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" id="salePrice" name="salePrice" 
                            placeholder="0" min="1" required>
                </div>
            </div>

            </form>

        <div class="sticky-footer">
            <button type="submit" id="btnSubmit" class="btn-primary-custom" form="productForm" disabled>
                Registrar Producto
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        // ELEMENTOS DOM
        const DOM = {
            form: document.getElementById('productForm'),
            productName: document.getElementById('productName'),
            productCodeDisplay: document.getElementById('productCodeDisplay'),
            salePrice: document.getElementById('salePrice'),
            category: document.getElementById('category'),
            btnSubmit: document.getElementById('btnSubmit'),
        };

        let lastModalType = ''; 

        // --- 1. Utilidades y Modales (Uniformidad) ---
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
                    btn.textContent = 'Registrar otro producto';
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
                    btn.textContent = 'Corregir datos';
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

        // --- 2. INICIALIZACIÓN Y Carga de Secuencia ---
        document.addEventListener('DOMContentLoaded', () => {
            loadSequencePreview();
            addValidationListeners();
        });

        // Cargar secuencia desde Apps Script
        function loadSequencePreview() {
            DOM.productCodeDisplay.value = "Cargando...";
            if (typeof google === 'undefined' || !google.script) {
                 // Si no estamos en Apps Script, simular la carga
                 setTimeout(() => DOM.productCodeDisplay.value = "PDCT091", 500);
                 console.warn("Ejecución fuera de Apps Script. Usando código simulado.");
                 return;
            }

            google.script.run
                .withSuccessHandler(displaySequence)
                .withFailureHandler(err => {
                    DOM.productCodeDisplay.value = "Error";
                    showModal('error', 'Error de Carga', 'No se pudo cargar la secuencia de código de producto. Contacte soporte.');
                })
                .getSequences();
        }

        function displaySequence(sequences) {
            const prodSeq = sequences.find(s => s.NAME === 'PRODUCTO');
            if (prodSeq) {
                // Asumiendo que quieres el formato PDCT091, ajusto el valor si es necesario
                DOM.productCodeDisplay.value = `${prodSeq.PREFIX}${String(prodSeq.NEXT).padStart(3, '0')}`;
            } else {
                DOM.productCodeDisplay.value = "N/A";
            }
        }

        // --- 3. VALIDACIÓN ---
        function addValidationListeners() {
            DOM.productName.addEventListener('input', validateForm);
            DOM.salePrice.addEventListener('input', validateForm);
        }

        function validateForm() {
            const nameValid = DOM.productName.value.trim().length > 2;
            const priceValue = parseFloat(DOM.salePrice.value);
            const priceValid = !isNaN(priceValue) && priceValue >= 1;

            const isValid = nameValid && priceValid;
            DOM.btnSubmit.disabled = !isValid;
            
            return { isValid, nameValid, priceValid };
        }

        // --- 4. ENVÍO ---
        function handleSubmit(e) {
            e.preventDefault();
            
            const validation = validateForm();
            if (!validation.isValid) {
                let errorMsg = '';
                if (!validation.nameValid) errorMsg += '• Nombre del producto\n';
                if (!validation.priceValid) errorMsg += '• Precio de venta (debe ser mayor a 0)';
                
                showModal('warning', 'Datos Incompletos', 'Debe completar y validar los siguientes campos:', `<div style="text-align: left; white-space: pre-wrap; font-family: monospace; padding: 10px; background: var(--background); border-radius: 8px;">${errorMsg}</div>`);
                return;
            }
            
            DOM.btnSubmit.disabled = true;
            DOM.btnSubmit.innerText = "Registrando...";

            const formData = {
                productName: DOM.productName.value.trim(),
                category: DOM.category.value,
                salePrice: DOM.salePrice.value
            };

            google.script.run
                .withSuccessHandler(onSuccess)
                .withFailureHandler(onFailure)
                .createNewProduct(formData);
        }

        function onSuccess(response) {
            DOM.btnSubmit.innerText = "Registrar Producto";
            DOM.form.classList.add('d-none'); // Ocultar formulario
            
            // Construir HTML de resumen para el modal de éxito
            const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(DOM.salePrice.value);

            const detailsHtml = `
                <div class="modal-list-item"><span>Código</span> <strong>${response.code || 'N/A'}</strong></div>
                <div class="modal-list-item"><span>Categoría</span> <strong>${DOM.category.options[DOM.category.selectedIndex].text}</strong></div>
                <div class="modal-list-item"><span>Precio Venta</span> <strong>${formattedPrice}</strong></div>
            `;

            showModal('success', '¡Producto Registrado!', `El producto **${response.name}** se ha agregado al inventario.`, detailsHtml);
        }

        function onFailure(error) {
            DOM.btnSubmit.disabled = false;
            DOM.btnSubmit.innerText = "Registrar Producto";
            showModal('error', 'Error de Registro', 'No se pudo crear el producto: ' + error.message);
        }

        // --- 5. REINICIAR ---
        function resetForm() {
            DOM.form.reset();
            DOM.form.classList.remove('d-none');
            
            // Limpiar código de display y recargar secuencia
            DOM.productCodeDisplay.value = "Actualizando...";
            loadSequencePreview();
            
            validateForm(); // Deshabilita el botón
        }
    </script>
</body>
</html>
```

