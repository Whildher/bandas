import { Component, ViewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxComponent, DxCheckBoxModule, DxContextMenuModule, DxDataGridComponent, DxDataGridModule, DxDropDownBoxModule, DxFormModule, DxLoadPanelModule, DxPopupModule, DxSelectBoxModule, DxTextAreaModule } from 'devextreme-angular';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import { clsBarraRegistro } from 'src/app/containers/regbarra/_clsBarraReg';
import { SbarraService } from 'src/app/containers/regbarra/_sbarra.service';
import { TabService } from 'src/app/containers/tabs/tab.service';
import { BANService } from 'src/app/services/BAN/BAN.service';
import { validatorRes } from 'src/app/shared/validator/validator';
import Swal from 'sweetalert2';
import { showToast } from '../../shared/toast/toastComponent.js';
import { clsCotizaciones } from './clsBAN011.class.js';
import DataSource from 'devextreme/data/data_source';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-BAN011',
  templateUrl: './BAN011.component.html',
  styleUrls: ['./BAN011.component.css'],
  standalone: true,
  imports: [ DxDataGridModule, DxButtonModule, DxCheckBoxModule, DxDropDownBoxModule,
             DxSelectBoxModule, DxPopupModule, DxFormModule, CommonModule,
             DxContextMenuModule, DxLoadPanelModule, DxTextAreaModule
           ]
})
export class BAN011Component {

  @ViewChild("gridCotizacion", { static: false }) gridCotizacion: DxDataGridComponent;
  @ViewChild("chModificar", { static: false }) chModificar: DxCheckBoxComponent;

  DCotizaciones: clsCotizaciones[];
  DAutorizaciones: any;
  selectedItemKeys: string[] = [];
  QFiltro: string;
  mnuAccion: string;
  esEdicion: boolean = false;
  modoEdicion: string = "";
  gridBoxAutoriz: string[] = [];
  readonly allowedPageSizes = [5, 10, 20, 50, 100, 'all'];
  
  DListaProductosBase: any[] = [];
  DListaProductos: any;
  DListaClientesBase: any[] = [];
  DListaClientes: any;
  DListaProveedoresBase: any[] = [];
  DListaProveedores: any;
  DFCambioSeccion: any;
  MAX_CONSECUTIVO: Number;
  INI_SECCION: string;
  popUpSeccion: boolean = false;
  DOpcionesAgenda: any[] = [{ text: "Imprimir tirilla"},{ text: "Trazabilidad"},{ text: "Enviar correo"}];
  targetOpciones: any;
  menuVisible: boolean = false;
  loadingVisible: boolean = false;

  prmUsrAplBarReg: clsBarraRegistro;
  subscription: Subscription;
  eventsSubjectInformes: Subject<any> = new Subject<any>();

  constructor(
    private _sdatos: BANService,
		private _sbarreg: SbarraService,
    private tabService: TabService
  ) { 

    // Servicio de barra de registro
    this.subscription = this._sbarreg.getObsRegApl().subscribe((datreg) => {
      // Valida si la petición es para esta aplicacion
      if (datreg.aplicacion === this.prmUsrAplBarReg.aplicacion)
        this.opMenuRegistro(datreg);
    });

    this.eliminarUsuario = this.eliminarUsuario.bind(this);
    this.onValueChangedCliente = this.onValueChangedCliente.bind(this);
    this.onValueChangedProducto = this.onValueChangedProducto.bind(this);
    this.menuAgenda = this.menuAgenda.bind(this);

  }

  // Llama a Acciones de registro
	opMenuRegistro(operMenu: clsBarraRegistro): void {
    // Activa modo de operacion para los demás componentes

		switch (operMenu.accion) {
			case "r_ini":
				const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "COTIZACION",
          aplicacion: "BAN-011",
          usuario: user,
					accion: "r_ini",
					error: "",
					r_numReg: 0,
					r_totReg: 0,
          operacion: { r_refrescar: true }
				};
				this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
				break;

			case 'r_imprimir':
        var prmRep = { ...operMenu.operacion, 
                         accion: 'previsualizar',
                         aplicacion: this.prmUsrAplBarReg.aplicacion, 
                         tabla: this.prmUsrAplBarReg.tabla,
                         usuario: this.prmUsrAplBarReg.usuario,
                         QFiltro: (operMenu.operacion.registro === 'todos') 
                                   ? this.QFiltro 
                                   : " USUARIOS.USUARIO = '"+this.DCotizaciones[0].USUARIO+"'"
                        };
        if (operMenu.operacion.modo === 'previsualizar')

          this.eventsSubjectInformes.next(prmRep);
        if (operMenu.operacion.modo === 'pdf') {
          prmRep = { ...prmRep, accion: 'pdf' };
          this.eventsSubjectInformes.next(prmRep);
        }
				break;

      case 'r_refrescar':
				this.valoresObjetos('todos');
				break;

			default:
				break;
		}
	}


  onEditingStart(e) {
    e.component.columnOption("command:delete", "visible", false);  
    this.modoEdicion = "update";
    this.gridBoxAutoriz = e.data.AUTORIZACIONES;
  }
  onSelectionChanged(e) {
  }
  deleteRecords() {
  }
  onContentReady(e:any) {  
    if (!this.esEdicion)
      e.component.columnOption("command:delete", "visible", true);  
  }
  clickCambioClave(e: any, cellInfo) {
  }
  onValueCambioClave(e, cellInfo) {
    cellInfo.setValue(e.value);
  }
  initNewRow(e){
    e.data.DOCUMENTO = this.MAX_CONSECUTIVO;
    e.data.FECHA = new Date;
    e.data.PRODUCTO = "";
    e.data.CANTIDAD = 0;
    e.data.LARGO = 0;
    e.data.ANCHO = 0;
    e.data.COSTO = 0;
    e.data.ID_CLIENTE = "";
    e.data.ID_PROVEEDOR = "";
    e.data.OBSERVACIONES = "";
    e.data.ESTADO = "Activo";
    e.data.USUARIO = this.prmUsrAplBarReg.usuario;
    this.gridBoxAutoriz = [];
    this.esEdicion = true;
    this.modoEdicion = 'new';

  }

  insertingRow(e){

  }
  async onRowValidating(e: any) {
  
    e.promise = new Promise((resolve, reject) => {
      // Valida completitud
      if (e.newData.PRODUCTO === '' || 
          e.newData.CANTIDAD === '' ||
          e.newData.CANTIDAD === 0 ||
          e.newData.ID_CLIENTE === '' 
          ) 
        {
        e.isValid = false;
        e.errorText = 'Falta completar datos de cotización: Producto,Cantidad,Cliente';
        resolve(false);
        return;
      }

      else {

        // Guarda datos
        const prm = { COTIZACION: e.newData };
        this._sdatos.save(this.modoEdicion, prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
          const res = validatorRes(data);
          if (res[0].ErrMensaje !== '') {
            e.isValid = false;
            e.errorText = res[0].ErrMensaje;
            this.showModal(Error(res[0].ErrMensaje));
            resolve(false);
            return;
          }
          else {
            e.errorText="";
            showToast("Cotización creada!","success");
            e.isValid = true;
            resolve(true);
            this.MAX_CONSECUTIVO = res[0].CONSECUTIVO;
            return;
          }
        });
    
      }

    }).then((result) => { 
      if (!result)
        showToast(e.errorText,'error');
    })  

  }

  onSelectionAutoriz(e, cellInfo) {
    if (e.selectedRowKeys.length === 0) return;
    cellInfo.setValue(e.selectedRowKeys);
  }
  insertedRow(e){
    // e.component.columnOption("command:edit", "visible", true); 
    this.esEdicion = false; 
  }
  updatingRow(e){
  }
  updatedRow(e){
  }
  startEdit(e) {
    // Valida que haya informacion de producto principal
    // if(e.rowType === "data") {
    //   e.component.editRow(e.rowIndex);
    // }
  }  
  eliminarUsuario(e){
    Swal.fire({
      title: '',
      text: '',
      html:
        'Desea eliminar la cotización <i>' +
        e.row.data.USUARIO + " " + e.row.data.NOMBRE +
        '</i> ?',
      iconHtml: "<i class='icon-alert-ol'></i>",
      showCancelButton: true,
      confirmButtonColor: '#DF3E3E',
      cancelButtonColor: '#438ef1',
      cancelButtonText: 'No',
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      // Procesa eliminación. Llama a la API para validar referenciación y eliminación en tabla
      if (result.isConfirmed){

        // Elimina de la base de datos
        const prm = { USUARIO: e.row.data.USUARIO };
        this._sdatos.delete('delete', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
          const res = validatorRes(data);
          if (res[0].ErrMensaje !== '') {
            this.showModal(res[0].ErrMensaje,'error');
          }
          else {
            showToast("Cotización anulada!","warning");
            e.component.deleteRow(e.row.rowIndex);
          }
        });

      }
    });

  }
  menuAgenda(e) {
    this.targetOpciones = e.event.currentTarget; // set target
    this.menuVisible = true; // show menu
  }

  setCellCan(rowData: any, value: any, currentRowData: any){
    rowData.CANTIDAD = value;
  }

  setCellValor(rowData: any, value: any, currentRowData: any){
    rowData.COSTO = value;
  }

  onValueChangedProducto(e, cellInfo) {
    cellInfo.setValue(e.value);
    cellInfo.data.NOMBRE_PRODUCTO = "";
    const dnom = this.DListaProductosBase.find(a => a.PRODUCTO == e.value);
    if (dnom) {
      cellInfo.data.NOMBRE_PRODUCTO = e.value + "; " + dnom.NOMBRE;
    }
  }

  onValueChangedCliente(e, cellInfo) {
    cellInfo.setValue(e.value);
    cellInfo.data.NOMBRE_CLIENTE = "";
    const dnom = this.DListaClientesBase.find(a => a.ID_CLIENTE == e.value);
    if (dnom) {
      cellInfo.data.NOMBRE_CLIENTE = e.value + "; " + dnom.NOMBRE_COMPLETO;
    }
  }

  onValueChangedProveedor(e, cellInfo) {
    cellInfo.setValue(e.value);
    cellInfo.data.NOMBRE_PROVEEDOR = "";
    const dnom = this.DListaProveedoresBase.find(a => a.ID_PROVEEDOR == e.value);
    if (dnom) {
      cellInfo.data.NOMBRE_PROVEEDOR = e.value + "; " + dnom.NOMBRE;
    }
  }

  confirmaCambio() {
    // Valida si el estado puede ejecutar alguna acción
    this._sdatos.consulta('CAMBIO SECCION', 
                          { CONSECUTIVO: this.DFCambioSeccion.ORDEN, 
                            ID_SECCION: this.DFCambioSeccion.ID_SECCION, 
                            USUARIO: this.prmUsrAplBarReg.usuario, 
                            ACCION: 'actualizar' }, "BAN-011")
    .subscribe((data: any) => {
      const res = JSON.parse(data.data);
      if ( (data.token != undefined)){
        const refreshToken = data.token;
        localStorage.setItem("token", refreshToken);
      }

      // Resultado validación
      if (res[0].ErrMensaje !== '') {
        this.showModal(res[0].ErrMensaje, 'Evento cambio de sección');
      }
      else {
        showToast("Cambio de sección realizado!","success");
        const fila = this.DCotizaciones.findIndex(a => a.CONSECUTIVO == this.DFCambioSeccion.ORDEN);
        // if (fila !== -1)
        //   this.DCotizaciones[fila].ID_SECCION = this.DFCambioSeccion.ID_SECCION;
      }
    });
    this.popUpSeccion = false;
    this.gridCotizacion.instance.refresh();

  }
  cancelaCambio() {
    this.popUpSeccion = false;
  }

  onCellClick(e) {
    if (e.row === undefined) return;

    if (e.row.cells[e.columnIndex].column.dataField === 'ID_SECCION') {
      const keyFila = e.key;

      // Valida si el estado puede ejecutar alguna acción
      this._sdatos.consulta('CAMBIO SECCION', 
              { CONSECUTIVO: e.row.data.ORDEN, ACCION: 'consulta' }, 
              "BAN-011")
        .subscribe((data: any) => {
          const res = JSON.parse(data.data);
          if ( (data.token != undefined)){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }

          // Resultado validación
          if (res[0].ErrMensaje !== '') {
            this.showModal(res[0].ErrMensaje, 'Evento cambio de sección');
          }
          else {
            this.popUpSeccion = true;
            this.DFCambioSeccion = { 
                                    ORDEN: e.row.data.ORDEN, 
                                    PRODUCTO: e.row.data.PRODUCTO, 
                                    ID_SECCION_ACTUAL: e.row.data.ID_SECCION, 
                                    ID_SECCION: res[0].ID_SECCION 
                                   };
          }
      });

    }
  }

  // Activa busqueda de cliente completo
  nombreCliente(d) {
    return d.NOMBRE_CLIENTE
  }
  // Activa busqueda de proveedor completo
  nombreProveedor(d) {
    return d.NOMBRE_PROVEEDOR
  }
  crearCotizacion(e) {
    this.valoresObjetos("CONSECUTIVO","new");
  }
  onRowPrepared(e) {
    if (e.rowIndex % 2 === 0)
        e.rowElement.style.height = "20px !important";
  }


  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj === 'PRODUCTOS' || obj === 'todos') {
      const prm = { FILTRO:"ventas",PRODUCTO:"", MODO:"simple"};
      this._sdatos.consulta('PRODUCTOS', prm, 'PRO-022').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DListaProductosBase = res;
        this.DListaProductos = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });

      });
    }

    if (obj === 'CLIENTES' || obj === 'todos') {
      const prm = { };
      this._sdatos.consulta('CLIENTES', prm, 'BAN-010').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DListaClientesBase = res;
        this.DListaClientes = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });

      });
    }

    if (obj === 'PROVEEDORES' || obj === 'todos') {
      const prm = { };
      this._sdatos.consulta('PROVEEDORES', prm, 'BAN-011').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DListaProveedoresBase = res;
        this.DListaProveedores = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });

      });
    }

    if (obj === 'CONSECUTIVO') {
      this._sdatos.consulta('CONSECUTIVO', {}, 'BAN-011').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.MAX_CONSECUTIVO = res[0].CONSECUTIVO;

        if (opcion=="new") 
          this.gridCotizacion.instance.addRow();
        
      });
    }

    if (obj === 'consulta' || obj === 'todos') {
      this.loadingVisible = true;
      this._sdatos.consulta('consulta', {}, 'BAN-011').subscribe((data: any)=> {
        this.loadingVisible = false;
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DCotizaciones = res;
        
      });
    }

  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.prmUsrAplBarReg = {
      tabla: "COTIZACION",
      aplicacion: "BAN-011",
      usuario: user,
      accion: "r_ini",
      error: "",
      r_numReg: 0,
      r_totReg: 0,
			operacion: { r_refrescar: true }
    };
    this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
    this.mnuAccion = '';
    this._sdatos.accion = 'r_ini';
    this.DCotizaciones = [];

    // Inicializa datos
    setTimeout(() => {
      this.valoresObjetos('todos');
      this.valoresObjetos('CONSECUTIVO');
    }, 300);

  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  showModal(mensaje, titulo = '', html = '') {
		Swal.fire({
			iconHtml: "<i class='icon-cancelar-ol error-color'></i>",
      confirmButtonColor: '#0F4C81',
			title: '¡Error!',
			text: mensaje,
			allowOutsideClick: true,
			allowEscapeKey: false,
			allowEnterKey: false,
			backdrop: true,
			position: 'center',
      html,
			stopKeydownPropagation: false,
		});
	}


}
