export class clsCotizaciones {
	public ID_DOCUMENTO: any;
	public CONSECUTIVO: any;
	public DOCUMENTO: any;
	public TIPO: any;
	public ID_CLIENTE: any;
	public NOMBRE: any;
	public FECHA: Date;
	public HORA: Date;
	public FECHA_VENCIMIENTO: Date;
	public DESCRIPCION: string;
	public FILTRO: string;
	public ESTADO: string;
	public USUARIO: string;
	public TIPO_VENTA: string;
	public TOTALES: any;

	public constructor() {}
}

export class clsItmCotizaciones {
	public ITEM: number;
	public PRODUCTO: any;
	public ID_PROVEEDOR: string;
	public NOMBRE_PROVEEDOR: string;
	public GRAVAMENES: string;
	public CANTIDAD: number;
	public FECHA_ENTREGA: Date;
	public COSTO: number;
	public FLETE: number;
	public ID_UDM: string;
	public DETALLE: string;
	public ADJUNTOS: any;
	
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
