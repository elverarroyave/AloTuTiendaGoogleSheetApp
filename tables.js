INGRESOS_EGRESOS = {
    NAME_TABLE: 'INGRESOS_EGRESOS',
    TARGET_ROW: 4,
    TARGET_TOTAL: 'I2',
    FECHA: 'A',
    REFERENCIA: 'B',
    NUM: 'C',
    CODIGO: 'D',
    DETALLE: 'E',
    ENTRADA: 'F',
    SALIDA: 'G',
    M_PAGO: 'H',
}

PAGO_PEDIDOS = {
    FECHA: 'A',
    CODIGO: 'B',
    COD_IN_OUT: 'C',
    COD_IN: 'D',
    PRODUCTO: 'E',
    METODO_DE_COMPRA: 'F',
    VALOR: 'G',
}

ABONOS = {
    FECHA: 'A',
    CODIGO: 'B',
    COD_IN_OUT: 'C',
    COD_VENTA: 'D',
    CLIENTE: 'E',
    PRODUCTO: 'F',
    VALOR: 'G',
}

CONTROL_VENTAS = {
    NAME_TABLE: 'CONTROL_VENTAS',
    TARGET_ROW: 3,
    FECHA: 'A',
    NUM: 'B',
    CODIGO: 'C',
    COD_SOCIO: 'D',
    SOCIO: 'E',
    C_PAGOS: 'F',
    COD_PRDT: 'G',
    CANTIDAD: 'I',
    COD_CLNT: 'J',
    PRECIO_BASE: 'L',
    PRECIO: 'M',
    M_PAGO: 'N',
    PAGO: 'O',
    ESTADO: 'S',
}

INVENTARIO = {
    NOMBRE: 'A',
    NUM: 'B',
    CODIGO: 'C',
    CATEGORIA: 'D',
    UNO: 'E'
}

CLIENTES = {
    NOMBRE: 'A',
    NUM: 'B',
    CODIGO: 'C',
    DOCUMENTO: 'D',
    TELEFONO: 'E',
    CORREO: 'F',
    DIRECCION: 'G',
    SOCIO: 'H'
}

CONTROL_INGRESO = {
    NAME_TABLE: 'CONTROL_INGRESO',
    TARGET_ROW: 3,
    FECHA: 'A',
    NUM_IN: 'B',
    COD_INGRESO: 'C',
    QUIEN_RECIBE: 'D',
    COD_PROV: 'E',
    PROVEEDOR: 'F',
    COD_PRDT: 'G',
    PRODUCTO: 'H',
    CANTIDAD: 'I',
    PRECIO_UNITARIO: 'J',
    METODO_DE_PAGO: 'K',
    SALDO_PAGADO: 'L',
    TOTAL: 'M',
    PAGADO: 'N',
    ESTADO: 'O',
    ENLACE_FACTURA: 'P'
}

CUADRE_CAJA = {
    NAME_TABLE: 'HISTORICO_CUADRE',
    TARGET_ROW: 2,
    FECHA: 'A',
    CODIGO: 'B',
    COD_IN_OUT: 'C',
    RESPONSABLE: 'D',
    BASE_CAJA: 'E',
    TOTAL_EFECTIVO: 'F',
    TOTAL_CUENTAS: 'G',
    TOTAL_OTROS: 'H',
    TOTAL_RECAUDADO: 'I',
    TOTAL_SISTEMA: 'J',
    FALTANTE: 'K',
    SOBRANTE: 'L'
}

DATA_CATEGORIA_INGRESOS_EGRESOS = {
    NAME_TABLE: 'DATA',
    TARGET_ROW: 3,
    NOMBRE: 15,
    REFERENCIA: 16,
}

ESTADO_VENTA = {
    AL_DIA: 'AL DIA',
    ATRAZADO: 'ATRAZADO',
    PAGADO: 'PAGADO',
    COMISIONADA: 'COMISIONADA',
    FACTURADA: 'FACTURADA',
}

CANTIDADA_PAGOS = {
    UNO: {
        valor: 1,
        plazo: 0,
        porcentaje: 0,
    },
    DOS: {
        valor: 2,
        plazo: 30,
        porcentaje: 5,
    },
    TRES: {
        valor: 3,
        plazo: 60,
        porcentaje: 10,
    },
    CUATRO: {
        valor: 4,
        plazo: 90,
        porcentaje: 15,
    },
    CINCO: {
        valor: 5,
        plazo: 120,
        porcentaje: 20,
    },
    SEIS: {
        valor: 6,
        plazo: 150,
        porcentaje: 25,
    },
    SIETE: {
        valor: 7,
        plazo: 180,
        porcentaje: 30,
    },
    OCHO: {
        valor: 8,
        plazo: 210,
        porcentaje: 35,
    },
    NUEVE: {
        valor: 9,
        plazo: 240,
        porcentaje: 40,
    },
    DIEZ: {
        valor: 10,
        plazo: 270,
        porcentaje: 45,
    },
    ONCE: {
        valor: 11,
        plazo: 300,
        porcentaje: 50,
    },
    DOCE: {
        valor: 12,
        plazo: 330,
        porcentaje: 55,
    }
}
