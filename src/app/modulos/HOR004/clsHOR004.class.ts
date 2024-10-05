export class clsFacturaInmuebles {
	public ID_DOCUMENTO: any;
	public CONSECUTIVO: any;
	public DOCUMENTO: any;
	public TIPO: any;
	public PERIODO: any;
	public ID_CLIENTE: any;
	public NOMBRE: any;
	public FECHA: Date;
	public HORA: Date;
	public FECHA_INICIAL: Date;
	public FECHA_FINAL: Date;
	public FECHA_VENCIMIENTO: Date;
	public DESCRIPCION: string;
	public FILTRO: string;
	public EXTRAORDINARIA: boolean;
	public ESTADO: string;
	public USUARIO: string;
	public FACTURA: string;
	public ID_PROPIEDAD: string;
	public TIPO_VENTA: string;
	public TOTALES: any;

	public constructor() {}
}

export class clsItmFacturaInmuebles {
	public ITEM: number;
	public ID_PROPIEDAD: any;
	public PERIODO: any;
	public UBICACION: any;
	public ID_TARIFA: any;
	public ID_CLIENTE: any;
	public VALOR: number;
	public INTERES: number;
	public FECHA_INICIAL: Date;
	public FECHA_FINAL: Date;
	public FECHA_VENCIMIENTO: Date;
	public ID_FACTURA: string;
	public NC_FACTURA: number;
	public GRAVAMENES: string;
	public CANTIDAD: number;
	public VALOR_UNITARIO: number;
	public IVA: number;
	public ID_TASA: string;
	public POR_IVA: number;
	public DESC_TASA: string;
	public VALOR_TOTAL: number;
	public DETALLE: string;
	
	public constructor() {}
}

export class clsTotalesFac {
	public ITEM: number;
	public CONCEPTO: any;
	public FRM_VALOR: string;
	public VALOR: number;
	
	public constructor() {}
}

export class clsListaIva {
	public ID_TASA: string;
	public DESC_IVA: string;
	public POR_IVA: number;
	public VALOR: number;
	
	public constructor() {}
}
