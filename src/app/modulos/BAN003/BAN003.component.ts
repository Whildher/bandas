import { Component, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxLoadPanelModule  } from 'devextreme-angular';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import { clsBarraRegistro } from 'src/app/containers/regbarra/_clsBarraReg';
import { SbarraService } from 'src/app/containers/regbarra/_sbarra.service';
import { TabService } from 'src/app/containers/tabs/tab.service';
import { BANService } from 'src/app/services/BAN/BAN.service';
import { validatorRes } from 'src/app/shared/validator/validator';
import Swal from 'sweetalert2';
import { showToast } from '../../shared/toast/toastComponent.js';
import { clsClientes } from './clsBAN003.class.js';

@Component({
  selector: 'app-BAN003',
  templateUrl: './BAN003.component.html',
  styleUrls: ['./BAN003.component.css'],
  standalone: true,
  imports: [ DxDataGridModule, DxButtonModule, DxLoadPanelModule  ]
})
export class BAN003Component {

  @ViewChild("gridClientes", { static: false }) gridClientes: DxDataGridComponent;

  DClientes: clsClientes[];
  DAutorizaciones: any;
  selectedItemKeys: string[] = [];
  QFiltro: string;
  mnuAccion: string;
  esEdicion: boolean = false;
  modoEdicion: string = "";
  gridBoxAutoriz: string[] = [];
  loadingVisible: boolean = false;
  readonly allowedPageSizes = [5, 10, 20, 50, 100, 'all'];

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

    this.eliminarCliente = this.eliminarCliente.bind(this);

  }

  // Llama a Acciones de registro
	opMenuRegistro(operMenu: clsBarraRegistro): void {
    // Activa modo de operacion para los demás componentes

		switch (operMenu.accion) {
			case "r_ini":
				const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "CLIENTES",
          aplicacion: "BAN-003",
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
                                   : " CLIENTES.ID_CLIENTE = '"+this.DClientes[0].ID_CLIENTE+"'"
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
    e.data.ID_CLIENTE = "";
    e.data.NOMBRE_COMPLETO = '';
    e.data.ITEM = 0;
    e.data.DIRECCION = '';
    e.data.TELEFONO = '';
    e.data.CIUDAD = '';
    e.data.EMAIL = '';
    e.data.ESTADO = 'ACTIVO';
    this.esEdicion = true;
    this.modoEdicion = 'new';
  }

  insertingRow(e){

  }

  async onRowValidating(e: any) {
  
    e.promise = new Promise((resolve, reject) => {
      // Valida completitud
      if (e.newData.ID_CLIENTE === '' || 
          e.newData.NOMBRE_COMPLETO === '' 
          ) 
        {
        e.isValid = false;
        e.errorText = 'Falta completar datos del cliente: Código o nombre';
        resolve(false);
        return;
      }

      else {

        // Guarda datos
        const datos = this.modoEdicion == 'new' ? e.newData : { ...e.oldData, ...e.newData };
        const prm = { CLIENTES: datos };
        this._sdatos.save(this.modoEdicion, prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
          const res = validatorRes(data);
          if (res[0].ErrMensaje !== '') {
            e.isValid = false;
            // e.errorText = res[0].ErrMensaje;
            this.showModal(Error(res[0].ErrMensaje));
            resolve(false);
            return;
          }
          else {
            e.errorText="";
            showToast("Cliente actualizado!","success");
            e.isValid = true;
            resolve(true);
            return;
          }
        });
    
      }

    }).then((result) => { 
      if (!result)
        showToast('Error de validación!','error');
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
    if(e.rowType === "data") {
      e.component.editRow(e.rowIndex);
    }
  }  
  eliminarCliente(e){
    Swal.fire({
      title: '',
      text: '',
      html:
        'Desea eliminar el cliente <i>' +
        e.row.data.ID_CLIENTE + " " + e.row.data.NOMBRE_COMPLETO +
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
        const prm = { ID_CLIENTE: e.row.data.ID_CLIENTE };
        this._sdatos.delete('delete', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
          const res = validatorRes(data);
          if (res[0].ErrMensaje !== '') {
            this.showModal(res[0].ErrMensaje,'error');
          }
          else {
            showToast("Cliente eliminado!","warning");
            e.component.deleteRow(e.row.rowIndex);
          }
        });

      }
    });

  }

  setCellOrden(rowData: any, value: any, currentRowData: any){
    rowData.ITEM = value;
  }

  crearCliente(e) {
    this.gridClientes.instance.addRow();
  }
  
  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj === 'CLIENTES' || obj === 'todos') {
      const prm = { };
      this.loadingVisible = true;
      this._sdatos.consulta('CLIENTES', prm, 'BAN-003').subscribe((data: any)=> {
        const res = validatorRes(data);
        this.loadingVisible = false;
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DClientes = res;
        if (this.gridClientes) {
          this.gridClientes.instance.cancelEditData();
          this.gridClientes.instance.refresh();
        }
        this.gridClientes.rowAlternationEnabled = true;

      });
    }


  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.prmUsrAplBarReg = {
      tabla: "CLIENTES",
      aplicacion: "BAN-003",
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
    this.DClientes = [];

    // Inicializa datos
    setTimeout(() => {
      this.valoresObjetos('todos');
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
