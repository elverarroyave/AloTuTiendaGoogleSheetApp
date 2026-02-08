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

METODO_DE_PAGO = {
    NAME_TABLE: 'METODO_DE_PAGO',
    TARGET_ROW: 3,
    NOMBRE: 'A',
    CODIGO: 'B',
    ACTIVO: 'C',
    CUPO_TOTAL: 'D',
}

INVENTARIO = {
    NAME_TABLE: 'INVENTARIO',
    TARGET_ROW: 3,
    NOMBRE: 'A',
    CODIGO: 'B',
    CATEGORIA: 'C',
    UNO: 'D',
    DOS: 'E',
    TRES: 'F',
    CUATRO: 'G',
    CINCO: 'H',
    SEIS: 'I',
    SIETE: 'J',
    INGRESOS: 'K',
    VENTAS: 'L',
    STOCK: 'M',
    TOTAL: 'N',
}

SOCIOS = {
    NAME_TABLE: 'SOCIOS',
    TARGET_ROW: 2,
    NOMBRE: 'A',
    CODIGO: 'B',
    ACTIVO: 'C',
    DOCUMENTO: 'D',
    CARGO: 'E',
    TELEFONO: 'F',
    EMAIL: 'G'
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
    NAME_TABLE: 'ABONOS',
    TARGET_ROW: 2,
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

CLIENTES = {
    NAME_TABLE: 'CLIENTES',
    TARGET_ROW: 3,
    NOMBRE: 'A',
    CODIGO: 'B',
    DOCUMENTO: 'C',
    TELEFONO: 'D',
    CORREO: 'E',
    DIRECCION: 'F',
    SOCIO: 'G'
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

PROVEEDORES = {
    NAME_TABLE: 'PROVEEDORES',
    TARGET_ROW: 2,
    NOMBRE: 'A',
    CODIGO: 'B',
    ACTIVO: 'C',
    ENLACE: 'D',
    CONTACTO: 'E',
    CIUDAD: 'F'
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

CARGOS_SOCIOS = {
    ADMIN: 'ADMINISTRADOR',
    VENDEDOR: 'VENDEDOR',
}

SEQUENCES = {
    NAME_TABLE: 'SEQUENCES',
    TARGET_ROW: 2,
    NUMBER: 'A',
    NAME: 'B',
    PREFIX: 'C',
    CURRENT: 'D',
    NEXT: 'E',
}

COMISIONES = {
    NAME_TABLE: 'COMISIONES',
    TARGET_ROW: 2,
    FECHA: 'A',
    CODIGO: 'B',
    COD_IN_OUT: 'C',
    COD_SOCIO: 'D',
    SOCIO: 'E',
    T_VENTAS: 'F',
    VALOR: 'G',
    PAGADA: 'H',
}

