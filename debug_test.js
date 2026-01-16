
const ESTADO_VENTA = {
    AL_DIA: 'AL DIA',
    ATRAZADO: 'ATRAZADO',
    PAGADO: 'PAGADO',
    COMISIONADA: 'COMISIONADA',
    FACTURADA: 'FACTURADA',
}

const CANTIDADA_PAGOS = {
    UNO: { valor: 1, plazo: 0, porcentaje: 0 },
    DOS: { valor: 2, plazo: 30, porcentaje: 5 },
    TRES: { valor: 3, plazo: 60, porcentaje: 10 },
    CUATRO: { valor: 4, plazo: 90, porcentaje: 15 },
}

function diasTranscurridosCoutner(fechaInicio, fechaFin) {
    const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.floor(diferencia / MILISEGUNDOS_POR_DIA);
}

function definirEstadoVenta(ventaResult) {
    const cPagosObject = CANTIDADA_PAGOS[ventaResult.cPagos];
    if (!cPagosObject) throw new Error("Plan de pagos no encontrado");

    const fechaCompra = new Date(ventaResult.fechaCompra);
    const valorCadaPago = ventaResult.precio / cPagosObject.valor;
    const diasTranscurridos = diasTranscurridosCoutner(fechaCompra, new Date());

    // LOGIC FROM general.js
    const cuotasPagadas = Math.floor(ventaResult.total / valorCadaPago);
    let siguienteCuotaExigible = Math.min(cuotasPagadas + 1, cPagosObject.valor);

    let deadline = 0;
    if (siguienteCuotaExigible > 0) {
        const hito = Object.values(CANTIDADA_PAGOS).find(h => h.valor === siguienteCuotaExigible);
        if (hito) {
            deadline = hito.plazo;
        }
    }

    let cantidadPagosExigiblesHoy = cPagosObject.valor;
    const hitosPago = Object.values(CANTIDADA_PAGOS);
    for (const hito of hitosPago) {
        if (diasTranscurridos < hito.plazo) {
            cantidadPagosExigiblesHoy = hito.valor - 1;
            break;
        }
    }
    cantidadPagosExigiblesHoy = Math.min(cantidadPagosExigiblesHoy, cPagosObject.valor);

    const valorPagoIdealHoy = valorCadaPago * cantidadPagosExigiblesHoy;

    const estado = ventaResult.total >= valorPagoIdealHoy
        ? ESTADO_VENTA.AL_DIA
        : ESTADO_VENTA.ATRAZADO;

    let diasAtrasoCalc = 0;
    if (estado === ESTADO_VENTA.ATRAZADO) {
        diasAtrasoCalc = diasTranscurridos - deadline;
        if (diasAtrasoCalc < 0) diasAtrasoCalc = 0;
    }

    return {
        saldoParaPagoIdeal: valorPagoIdealHoy - ventaResult.total,
        estado: estado,
        diasAtraso: diasAtrasoCalc,
        _debug: { diasTranscurridos, deadline, cuotasPagadas, siguienteCuotaExigible }
    }
}

// TEST CASE
const today = new Date('2026-01-06T11:04:53-05:00'); // Use exact time from metadata
// User said Date 2025-10-06. 
// Assuming the user's input "DateMA: '#ERROR!'" implies some date issue in original, but he gave a FECHA string.
const sale = {
    fechaCompra: '2025-10-06T20:45:50.000Z',
    cPagos: 'CUATRO',
    precio: 2702500,
    total: 1275000
};

// Override Date for testing
const originalDate = Date;
global.Date = class extends Date {
    constructor(date) {
        if (!date) return new originalDate(today); // Default to our 'today'
        return new originalDate(date);
    }
}

const result = definirEstadoVenta(sale);
console.log(JSON.stringify(result, null, 2));
