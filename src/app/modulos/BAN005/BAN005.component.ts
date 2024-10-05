import { Component, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule  } from 'devextreme-angular';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import { clsBarraRegistro } from 'src/app/containers/regbarra/_clsBarraReg';
import { SbarraService } from 'src/app/containers/regbarra/_sbarra.service';
import { TabService } from 'src/app/containers/tabs/tab.service';
import { BANService } from 'src/app/services/BAN/BAN.service';
import { validatorRes } from 'src/app/shared/validator/validator';
import Swal from 'sweetalert2';
import { showToast } from '../../shared/toast/toastComponent.js';
import { clsSecciones } from './clsBAN005.class';

@Component({
  selector: 'app-BAN005',
  templateUrl: './BAN005.component.html',
  styleUrls: ['./BAN005.component.css'],
  standalone: true,
  imports: [ DxDataGridModule, DxButtonModule  ]
})
export class BAN005Component {

  @ViewChild("gridSecciones", { static: false }) gridSecciones: DxDataGridComponent;

  DSecciones: clsSecciones[];
  DAutorizaciones: any;
  selectedItemKeys: string[] = [];
  QFiltro: string;
  mnuAccion: string;
  esEdicion: boolean = false;
  modoEdicion: string = "";
  gridBoxAutoriz: string[] = [];

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

  }

  // Llama a Acciones de registro
	opMenuRegistro(operMenu: clsBarraRegistro): void {
    // Activa modo de operacion para los demás componentes

		switch (operMenu.accion) {
			case "r_ini":
				const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "SECCIONES",
          aplicacion: "BAN-005",
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
                                   : " SECCIONES.ID_SECCION = '"+this.DSecciones[0].ID_SECCION+"'"
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
    e.data.ID_SECCION = "";
    e.data.DESCRIPCION = '';
    e.data.ITEM = 0;
    e.data.TIPO = '';
    e.data.ESTADO = 'ACTIVO';
    this.esEdicion = true;
    this.modoEdicion = 'new';
  }

  insertingRow(e){

  }
  async onRowValidating(e: any) {
  
    e.promise = new Promise((resolve, reject) => {
      // Valida completitud
      if (e.newData.ID_SECCION === '' || 
          e.newData.NOMBRE === '' 
          ) 
        {
        e.isValid = false;
        e.errorText = 'Falta completar datos del usuario: Código o nombre';
        resolve(false);
        return;
      }

      else {

        // Guarda datos
        const datos = this.modoEdicion == 'new' ? e.newData : { ...e.oldData, ...e.newData };
        const prm = { SECCIONES: datos };
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
            showToast("sección actualizada!","success");
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
  eliminarUsuario(e){
    Swal.fire({
      title: '',
      text: '',
      html:
        'Desea eliminar la sección <i>' +
        e.row.data.ID_SECCION + " " + e.row.data.NOMBRE +
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
        const prm = { USUARIO: e.row.data.ID_SECCION };
        this._sdatos.delete('delete', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
          const res = validatorRes(data);
          if (res[0].ErrMensaje !== '') {
            this.showModal(res[0].ErrMensaje,'error');
          }
          else {
            showToast("Usuario eliminado!","warning");
            e.component.deleteRow(e.row.rowIndex);
          }
        });

      }
    });

  }

  setCellOrden(rowData: any, value: any, currentRowData: any){
    rowData.ITEM = value;
  }


  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj === 'SECCIONES' || obj === 'todos') {
      const prm = { };
      this._sdatos.consulta('SECCIONES', prm, 'BAN-005').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DSecciones = res;
        if (this.gridSecciones) {
          this.gridSecciones.instance.cancelEditData();
          this.gridSecciones.instance.refresh();
        }

      });
    }


  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.prmUsrAplBarReg = {
      tabla: "SECCIONES",
      aplicacion: "BAN-005",
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
    this.DSecciones = [];

    // Inicializa datos
    this.valoresObjetos('todos');

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
