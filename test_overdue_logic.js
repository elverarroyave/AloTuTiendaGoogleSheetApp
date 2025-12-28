
// Mock dependencies
const ESTADO_VENTA = {
    AL_DIA: 'AL DIA',
    ATRAZADO: 'ATRAZADO',
};

const CANTIDADA_PAGOS = {
    UNO: { valor: 1, plazo: 0 },
    DOS: { valor: 2, plazo: 30 },
    TRES: { valor: 3, plazo: 60 },
    CUATRO: { valor: 4, plazo: 90 },
};

function diasTranscurridosCoutner(fechaInicio, fechaFin) {
    const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;
    return Math.floor((fechaFin - fechaInicio) / MILISEGUNDOS_POR_DIA);
}

// Target function to test (Old version logic approximation based on inspection)
function definirEstadoVentaOld(ventaResult, diasSimulados) {
    const cPagosObject = CANTIDADA_PAGOS[ventaResult.cPagos];
    const valorCadaPago = ventaResult.precio / cPagosObject.valor;
    const diasTranscurridos = diasSimulados;

    let cantidadPagosExigibles = cPagosObject.valor;

    const hitosPago = Object.values(CANTIDADA_PAGOS);
    // Note: Assuming hitos are iterated in order or finding logic same as original
    // Original code iterates Object.values().

    for (const hito of hitosPago) {
        if (diasTranscurridos < hito.plazo) {
            cantidadPagosExigibles = hito.valor - 1;
            break;
        }
    }
    cantidadPagosExigibles = Math.min(cantidadPagosExigibles, cPagosObject.valor);

    const valorPagoIdeal = valorCadaPago * cantidadPagosExigibles;
    const valorAbonado = ventaResult.total;

    const estado = valorAbonado >= valorPagoIdeal
        ? ESTADO_VENTA.AL_DIA
        : ESTADO_VENTA.ATRAZADO;

    // The problematic line from original code:
    // diasAtraso: diasTranscurridos - cPagosObject.plazo + 30,
    // cPagosObject.plazo is the TOTAL plazo of the plan (e.g. 60 for TRES)

    return {
        saldoParaPagoIdeal: valorPagoIdeal - valorAbonado,
        estado: estado,
        diasAtraso: diasTranscurridos - cPagosObject.plazo + 30,
    }
}

function definirEstadoVentaNew(ventaResult, diasSimulados) {
    const cPagosObject = CANTIDADA_PAGOS[ventaResult.cPagos];
    const valorCadaPago = ventaResult.precio / cPagosObject.valor;
    const diasTranscurridos = diasSimulados;

    let cantidadPagosExigibles = cPagosObject.valor;

    const hitosPago = Object.values(CANTIDADA_PAGOS).sort((a, b) => a.valor - b.valor);

    for (const hito of hitosPago) {
        if (diasTranscurridos < hito.plazo) {
            cantidadPagosExigibles = hito.valor - 1;
            break;
        }
    }
    cantidadPagosExigibles = Math.min(cantidadPagosExigibles, cPagosObject.valor);

    // Find the deadline for the current exigible payment
    // If cantidadPagosExigibles is 0, we shouldn't be here basically, or deadline is 0?
    // If cantidadPagosExigibles is 1, deadline is 0 (UNO).
    // If cantidadPagosExigibles is 2, deadline is 30 (DOS).

    let deadline = 0;
    if (cantidadPagosExigibles > 0) {
        const deadlineHito = hitosPago.find(h => h.valor === cantidadPagosExigibles);
        if (deadlineHito) deadline = deadlineHito.plazo;
    }

    const valorPagoIdeal = valorCadaPago * cantidadPagosExigibles;
    const valorAbonado = ventaResult.total;

    const estado = valorAbonado >= valorPagoIdeal
        ? ESTADO_VENTA.AL_DIA
        : ESTADO_VENTA.ATRAZADO;

    return {
        saldoParaPagoIdeal: valorPagoIdeal - valorAbonado,
        estado: estado,
        diasAtraso: estado === ESTADO_VENTA.ATRAZADO ? (diasTranscurridos - deadline) : 0,
        // Note: Logic for diasAtraso usually only matters if ATRAZADO, but user might want to see negative if ahead? 
        // Usually 'dias atraso' implies positive number.
        // User example: 33 days passed, Plan TRES. 1st month passed (deadline 30).
        // If they paid 0. They owe 2 payments (Day 0 and Day 30).
        // If they assume 'dias de atraso' means from the oldest unpaid installment? 
        // Or from the latest due date?
        // User said: "si ya tiene 33 días ... muestra 3 días atrasado".
        // This implies 33 - 30. So it is from the *latest* due date that was crossed.
    }
}

// Test Case
// Plan TRES (3 months). Total Price 300. Monthly roughly 100.
// Day 33.
// Should have paid: Payment 1 (Day 0) + Payment 2 (Day 30). Total 200.
// Paid: 0.
// Status: ATRAZADO.
// Overdue days: 33 - 30 = 3?

const caso1 = {
    cPagos: 'TRES',
    precio: 300000,
    total: 0
};
const dias1 = 33;

console.log("--- OLD LOGIC ---");
console.log(definirEstadoVentaOld(caso1, dias1));
// Old Logic Calculation:
// diasTranscurridos = 33
// cPagosObject.plazo (TRES) = 60
// 33 - 60 + 30 = 3.
// Wait, the old logic result ACCIDENTALLY matches the user expectation for this specific case?
// 33 - 60 + 30 = 3.
// Let's try Day 40.
// 40 - 60 + 30 = 10. (Correct: 40-30=10).
// Let's try Day 90 (Simulating way past).
// 90 - 60 + 30 = 60. 
// Correct calculation should be: 90 - 60 = 30? No, last deadline was 60. So 30 is correct.
// Let's try Day 15.
// 15 - 60 + 30 = -15.
// User expectation: 15 - 0 = 15 days overdue (if nothing paid).
// Old logic gives negative.

console.log("--- NEW LOGIC ---");
console.log(definirEstadoVentaNew(caso1, dias1));
console.log("--- CASE: Day 15 ---");
console.log("OLD: ", definirEstadoVentaOld(caso1, 15));
console.log("NEW: ", definirEstadoVentaNew(caso1, 15));

