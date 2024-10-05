export class clsTarifas {
	public ID_TASA: any;
	public DESCRIPCION: any;

	public constructor() {}
}

export class clsItemsTarifas {
	public ITEM: number;
	public ID_TASA: any;
	public FECHA_INICIAL: Date;
	public FECHA_FINAL: Date;
	public VALOR: number;
    public PORCENTAJE: number;
	public TASA_BASE: any;
	
	public constructor() {}
}
