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
import { clsProveedores } from './clsBAN004.class.js';

@Component({
  selector: 'app-BAN004',
  templateUrl: './BAN004.component.html',
  styleUrls: ['./BAN004.component.css'],
  standalone: true,
  imports: [ DxDataGridModule, DxButtonModule, DxLoadPanelModule  ]
})
export class BAN004Component {

  @ViewChild("gridProveedores", { static: false }) gridProveedores: DxDataGridComponent;

  DProveedores: clsProveedores[];
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

    this.eliminarProveedor = this.eliminarProveedor.bind(this);

  }

  // Llama a Acciones de registro
	opMenuRegistro(operMenu: clsBarraRegistro): void {
    // Activa modo de operacion para los demás componentes

		switch (operMenu.accion) {
			case "r_ini":
				const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "PROVEEDORES",
          aplicacion: "BAN-004",
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
                                   : " PROVEEDORES.ID_PROVEEDOR = '"+this.DProveedores[0].ID_PROVEEDOR+"'"
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
    e.data.ID_PROVEEDOR = "";
    e.data.NOMBRE = '';
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
      if (e.newData.ID_PROVEEDOR === '' || 
          e.newData.NOMBRE === '' 
          ) 
        {
        e.isValid = false;
        e.errorText = 'Falta completar datos del proveedor: Código o nombre';
        resolve(false);
        return;
      }

      else {

        // Guarda datos
        const datos = this.modoEdicion == 'new' ? e.newData : { ...e.oldData, ...e.newData };
        const prm = { PROVEEDORES: datos };
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
            showToast("Proveedor actualizado!","success");
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
  eliminarProveedor(e){
    Swal.fire({
      title: '',
      text: '',
      html:
        'Desea eliminar el proveedor <i>' +
        e.row.data.ID_PROVEEDOR + " " + e.row.data.NOMBRE +
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
        const prm = { ID_PROVEEDOR: e.row.data.ID_PROVEEDOR };
        this._sdatos.delete('delete', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
          const res = validatorRes(data);
          if (res[0].ErrMensaje !== '') {
            this.showModal(res[0].ErrMensaje,'error');
          }
          else {
            showToast("Proveedor eliminado!","warning");
            e.component.deleteRow(e.row.rowIndex);
          }
        });

      }
    });

  }

  setCellOrden(rowData: any, value: any, currentRowData: any){
    rowData.ITEM = value;
  }

  crearProveedor(e) {
    this.gridProveedores.instance.addRow();
  }
  
  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj === 'PROVEEDORES' || obj === 'todos') {
      const prm = { };
      this.loadingVisible = true;
      this._sdatos.consulta('PROVEEDORES', prm, 'BAN-004').subscribe((data: any)=> {
        const res = validatorRes(data);
        this.loadingVisible = false;
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DProveedores = res;
        if (this.gridProveedores) {
          this.gridProveedores.instance.cancelEditData();
          this.gridProveedores.instance.refresh();
        }
        this.gridProveedores.rowAlternationEnabled = true;

      });
    }


  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.prmUsrAplBarReg = {
      tabla: "PROVEEDORES",
      aplicacion: "BAN-004",
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
    this.DProveedores = [];

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
