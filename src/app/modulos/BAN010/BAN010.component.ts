import { Component, ViewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxComponent, DxCheckBoxModule, DxContextMenuModule, DxDataGridComponent, DxDataGridModule, DxDropDownBoxModule, DxFormModule, DxPopupModule, DxSelectBoxModule, DxTextAreaModule } from 'devextreme-angular';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import { clsBarraRegistro } from 'src/app/containers/regbarra/_clsBarraReg';
import { SbarraService } from 'src/app/containers/regbarra/_sbarra.service';
import { TabService } from 'src/app/containers/tabs/tab.service';
import { BANService } from 'src/app/services/BAN/BAN.service';
import { validatorRes } from 'src/app/shared/validator/validator';
import Swal from 'sweetalert2';
import { showToast } from '../../shared/toast/toastComponent.js';
import { clsAgenda } from './clsBAN010.class.js';
import DataSource from 'devextreme/data/data_source';
import { CommonModule } from '@angular/common';
import { GeninformesComponent } from 'src/app/shared/geninformes/geninformes.component';
import { BAN01001Component } from './BAN01001/BAN01001.component';

@Component({
  selector: 'app-BAN010',
  templateUrl: './BAN010.component.html',
  styleUrls: ['./BAN010.component.css'],
  standalone: true,
  imports: [ DxDataGridModule, DxButtonModule, DxCheckBoxModule, DxDropDownBoxModule,
             DxSelectBoxModule, DxPopupModule, DxFormModule, CommonModule,
             DxContextMenuModule, GeninformesComponent, BAN01001Component,
             DxTextAreaModule
           ]
})
export class BAN010Component {

  @ViewChild("gridAgenda", { static: false }) gridAgenda: DxDataGridComponent;
  @ViewChild("chModificar", { static: false }) chModificar: DxCheckBoxComponent;

  DAgenda: clsAgenda[];
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
  DFCambioSeccion: any;
  CONSECUTIVO: Number;
  MAX_CONSECUTIVO: string;
  INI_SECCION: string;
  INI_COLOR_SECCION: string;
  popUpSeccion: boolean = false;
  DOpcionesAgenda: any[] = [{ text: "Imprimir tirilla"},
                            { text: "Trazabilidad"},
                            { text: "Anular Corte"}];
  targetOpciones: any;
  menuVisible: boolean = false;

  dataSource: any[];

  prmUsrAplBarReg: clsBarraRegistro;
  subscription: Subscription;
  eventsSubjectInformes: Subject<any> = new Subject<any>();
  eventsSubjectLog: Subject<any> = new Subject<any>();
  
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

    this.dataSource = [
      { id: 1, name: 'Project A', task: 'Task 1', assignee: 'John', status: 'In Progress', dueDate: '2024-09-01' },
      { id: 2, name: 'Project A', task: 'Task 2', assignee: 'Alice', status: 'Pending', dueDate: '2024-09-15' },
      { id: 3, name: 'Project A', task: 'Task 3', assignee: 'Bob', status: 'Completed', dueDate: '2024-08-30' },
      { id: 4, name: 'Project B', task: 'Task 1', assignee: 'Emma', status: 'In Progress', dueDate: '2024-09-10' },
      { id: 5, name: 'Project B', task: 'Task 2', assignee: 'David', status: 'Pending', dueDate: '2024-09-20' },
    ];

    this.eliminarUsuario = this.eliminarUsuario.bind(this);
    this.onValueChangedCliente = this.onValueChangedCliente.bind(this);
    this.onValueChangedProducto = this.onValueChangedProducto.bind(this);
    this.menuAgenda = this.menuAgenda.bind(this);
    this.crearCorte = this.crearCorte.bind(this);

  }

  calculateCellValue(data: any) {
    return data.name;
  }
  isMasterRow(data: any) {
    return data.key === data.items[0].id;
  }
  onCellPreparedEx(e) {  
    if (e.rowType !== "data" || e.columnIndex != 0) {  
      return;  
    }  
    if (e.rowIndex % 3 === 0) {  
      e.cellElement.rowSpan = 3;  
      e.cellElement.innerHTML = "<div>"+e.data.name+"</div>";  
    }  
    else {  
      e.cellElement.style.display = "none";  
    }  
  }  

  onCellPrepared(e){
    if (e.rowType === "data") {
      if (e.column.dataField === "ID_SECCION") {
          e.cellElement.style.cssText = "background-color: "+e.data.COLOR_SECCION;
      }
      if (e.column.dataField === "ESTADO") {
        if (e.data.ESTADO == "ANULADO")
          e.cellElement.style.cssText = "background-color: red; color: white";
        else
          e.cellElement.style.cssText = "background-color: white";
    }
  }
  }

  // Llama a Acciones de registro
	opMenuRegistro(operMenu: clsBarraRegistro): void {
    // Activa modo de operacion para los demás componentes

		switch (operMenu.accion) {
			case "r_ini":
				const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "AGENDA_CORTES",
          aplicacion: "BAN-010",
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
                                   : " USUARIOS.USUARIO = '"+this.DAgenda[0].USUARIO+"'"
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
    e.data.ORDEN = this.MAX_CONSECUTIVO;
    e.data.FECHA = new Date;
    e.data.PRODUCTO = "";
    e.data.NOMBRE_PRODUCTO = "";
    e.data.CANTIDAD = 0;
    e.data.LARGO = 0;
    e.data.ANCHO = 0;
    e.data.LARGO_FINAL = 0;
    e.data.ID_CLIENTE = "";
    e.data.NOMBRE_CLIENTE = "";
    e.data.TIPO_UNION = "";
    e.data.OBSERVACIONES = "";
    e.data.STATUS = "";
    e.data.ID_SECCION = this.INI_SECCION;
    e.data.COLOR_SECCION = this.INI_COLOR_SECCION;
    e.data.ESTADO = "Activo";
    e.data.USUARIO = this.prmUsrAplBarReg.usuario;
    this.gridBoxAutoriz = [];
    this.esEdicion = true;
    this.modoEdicion = 'new';

  }

  insertingRow(e){
    // Asigna nombres

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
        e.errorText = 'Falta completar datos del corte: Producto,Cantidad,Cliente';
        resolve(false);
        return;
      }

      else {

        // Guarda datos
        const prm = { AGENDA: e.newData };
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
            showToast("Corte creado!","success");
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
        'Desea eliminar el corte <i>' +
        e.row.data.ORDEN +
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
        const prm = { CONSECUTIVO: e.row.data.ORDEN, USUARIO: this.prmUsrAplBarReg.usuario };
        this._sdatos.delete('delete', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
          const res = validatorRes(data);
          if (res[0].ErrMensaje !== '') {
            this.showModal(res[0].ErrMensaje,'error');
          }
          else {
            showToast("Corte anulado!","warning");
            const fila = this.DAgenda.findIndex(a => a.ORDEN == e.row.data.ORDEN);
            if (fila !== -1) {
              this.DAgenda[fila].ESTADO = 'ANULADO';
            }
            // e.component.deleteRow(e.row.rowIndex);
          }
        });

      }
    });

  }
  menuAgenda(e) {
    this.targetOpciones = e.event.currentTarget; // set target
    this.menuVisible = true; // show menu
    this.CONSECUTIVO = e.row.data.ORDEN;
  }

  setCellCan(rowData: any, value: any, currentRowData: any){
    rowData.CANTIDAD = value;
  }

  setCellLargo(rowData: any, value: any, currentRowData: any){
    rowData.LARGO = value;
  }
  setCellAncho(rowData: any, value: any, currentRowData: any){
    rowData.ANCHO = value;
  }
  setCellFinal(rowData: any, value: any, currentRowData: any){
    rowData.LARGO_FINAL = value;
  }

  crearCorte(e, tipodoc) {
    this.valoresObjetos("CONSECUTIVO",{ accion: 'new', tipodoc } );
  }

  // Selección opciones Menu
  contextMenuItemClick(e: any) {
  
    if (e.itemData.text === "Imprimir tirilla") {
      var prmRep = {  operacion: 'r_imprimir', 
        accion: 'previsualizar',
        aplicacion: this.prmUsrAplBarReg.aplicacion, 
        tabla: this.prmUsrAplBarReg.tabla,
        usuario: this.prmUsrAplBarReg.usuario,
        idrpt: "RptTirillaPro",
        archivo: "RptTirillaPro",
        id_reporte: "BAN-010-001",
        data_rpt: { text: 'Estado de cuenta', id_reporte: 'BAN-010-001', archivo: 'RptTirillaPro', item: 0},
        QFiltro: " AGENDA_CORTES.ID_DOCUMENTO+'-'+CONVERT(NVARCHAR,AGENDA_CORTES.CONSECUTIVO) = '"+this.CONSECUTIVO+"'"
      };
      this.eventsSubjectInformes.next(prmRep);
    }

    if (e.itemData.text === "Trazabilidad") {
      this.eventsSubjectLog.next({ 
        accion: 'activar', 
        CONSECUTIVO: this.CONSECUTIVO
      });
    }

  }
  

  onValueChangedProducto(e, cellInfo) {
    cellInfo.setValue(e.value);
    cellInfo.data.NOMBRE_PRODUCTO = "";
    const dnom = this.DListaProductosBase.find(a => a.PRODUCTO == e.value);
    if (dnom) {
      cellInfo.data.NOMBRE_PRODUCTO = e.value + "; " + dnom.NOMBRE;
      this.gridAgenda.instance.cellValue(cellInfo.rowIndex, "NOMBRE_PRODUCTO", e.value + "; " + dnom.NOMBRE);
    }
  }

  onValueChangedCliente(e, cellInfo) {
    cellInfo.setValue(e.value);
    cellInfo.data.NOMBRE_CLIENTE = "";
    const dnom = this.DListaClientesBase.find(a => a.ID_CLIENTE == e.value);
    if (dnom) {
      cellInfo.data.NOMBRE_CLIENTE = e.value + "; " + dnom.NOMBRE_COMPLETO;
      this.gridAgenda.instance.cellValue(cellInfo.rowIndex, "NOMBRE_CLIENTE", e.value + "; " + dnom.NOMBRE_COMPLETO);
    }
  }

  onValueChangedObs(e, cellInfo) {
    cellInfo.setValue(e.value);
  }

  confirmaCambio() {
    // Valida si el estado puede ejecutar alguna acción
    this._sdatos.consulta('CAMBIO SECCION', 
                          { CONSECUTIVO: this.DFCambioSeccion.ORDEN, 
                            ID_SECCION: this.DFCambioSeccion.ID_SECCION, 
                            USUARIO: this.prmUsrAplBarReg.usuario, 
                            ACCION: 'actualizar' }, "BAN-010")
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
        const fila = this.DAgenda.findIndex(a => a.ORDEN == this.DFCambioSeccion.ORDEN);
        if (fila !== -1) {
          this.DAgenda[fila].ID_SECCION = this.DFCambioSeccion.ID_SECCION;
          this.DAgenda[fila].COLOR_SECCION = this.DFCambioSeccion.COLOR_SECCION;
        }
      }
    });
    this.popUpSeccion = false;
    this.gridAgenda.instance.refresh();

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
              "BAN-010")
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
                                    ID_SECCION: res[0].ID_SECCION,
                                    COLOR_SECCION: res[0].COLOR_SECCION,
                                    USUARIO: this.prmUsrAplBarReg.usuario
                                   };
          }
      });

    }
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

    if (obj === 'CONSECUTIVO') {
      this._sdatos.consulta('CONSECUTIVO', { TIPO_DOC: opcion.tipodoc }, 'BAN-010').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.MAX_CONSECUTIVO = opcion.tipodoc+"-"+res[0].CONSECUTIVO;
        this.INI_SECCION = res[0].ID_SECCION;
        this.INI_COLOR_SECCION = res[0].COLOR_SECCION;

        if (opcion.accion == "new") 
          this.gridAgenda.instance.addRow();
        
      });
    }

    if (obj === 'consulta' || obj === 'todos') {
      this._sdatos.consulta('consulta', {}, 'BAN-010').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DAgenda = res;
        
      });
    }

  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.prmUsrAplBarReg = {
      tabla: "AGENDA_CORTES",
      aplicacion: "BAN-010",
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
    this.DAgenda = [];

    // Inicializa datos
    this.valoresObjetos('todos');
    this.valoresObjetos('CONSECUTIVO',{accion: 'ini', tipodoc: ''});

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
