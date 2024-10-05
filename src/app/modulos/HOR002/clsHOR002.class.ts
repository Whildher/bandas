export class clsPropiedades {
	public ID_PROPIEDAD: any;
	public ID_PROPIEDAD_PADRE: any;
	public TIPO_INMUEBLE: any;
	public NUM_INMUEBLE: any;
	public TIPO_INMUEBLE2: any;
	public NUM_INMUEBLE2: any;
	public DOMICILIO: any;
	public ID_UBICACION: any;
	public ESTADO: string;
	public FECHA_ADQUISICION: Date;
	public MATRICULA: any;
	public ID_TARIFA: any;
	public TELEFONO: any;
	public OCUPACION: any;
	public DEPENDIENTES: any;
	public OBSERVACIONES: any;

	public constructor() {}
}

export class clsPropietarios {
	public ITEM: number;
	public ID_PROPIETARIO: any;
	public NOMBRE: any;
	public PROPIETARIO: any;
    public FACTURABLE: boolean;
	public FECHA_ADQUISICION: Date;
	public ESTADO: any;
	
	public constructor() {}
}

export class clsArrendatarios {
	public ITEM: number;
	public ID_ARRENDATARIO: any;
	public NOMBRE: any;
	public ARRENDATARIO: any;
    public FACTURABLE: any;
	public FECHA_INCIO: Date;
	public FECHA_FINAL: Date;
	public ESTADO: any;
	public ID_ARRENDATARIA: any;
	public NOMBRE_ARRENDATARIA: any;
	
	public constructor() {}
}

