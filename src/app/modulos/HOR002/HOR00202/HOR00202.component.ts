import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxComponent, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxComponent, DxDateBoxModule, DxDropDownBoxModule, DxFormComponent, DxFormModule, DxLoadPanelModule, 
         DxSelectBoxModule, 
         DxTabsModule, 
         DxTagBoxComponent, 
         DxTagBoxModule, 
         DxTextBoxModule, 
         DxTreeListModule,
         DxValidatorModule} from 'devextreme-angular';
import { Observable, Subject, Subscription, lastValueFrom, takeUntil } from 'rxjs';
import { clsBarraRegistro } from 'src/app/containers/regbarra/_clsBarraReg';
import Swal from 'sweetalert2';
import { showToast } from '../../../shared/toast/toastComponent';
import { validatorRes } from 'src/app/shared/validator/validator';
import { clsArrendatarios, clsPropiedades, clsPropietarios } from '../clsHOR002.class';
import { CommonModule, formatNumber } from '@angular/common';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-HOR00202',
  templateUrl: './HOR00202.component.html',
  styleUrls: ['./HOR00202.component.css'],
  standalone: true,
  imports: [DxLoadPanelModule, DxFormModule, DxSelectBoxModule,
    DxDropDownBoxModule, DxDataGridModule, DxTreeListModule, DxButtonModule,
    DxTextBoxModule,DxTagBoxModule, DxValidatorModule,
    DxTabsModule, CommonModule, DxDateBoxModule, DxCheckBoxModule
]

})
export class HOR00202Component {
  @ViewChild("formPropiedades", { static: false }) formPropiedades: DxFormComponent;
  @ViewChild("gridArrendatarios", { static: false }) gridArrendatarios: DxDataGridComponent;
  @ViewChild("tagArrendatarios", { static: false }) tagArrendatarios: DxTagBoxComponent;
  @ViewChild("xs_FECHA_ADQUISICION", { static: false }) fechaAdq: DxDateBoxComponent;
  @ViewChild("chFacturable", { static: false }) chFacturable: DxCheckBoxComponent;
  
  mnuAccion: string;
	VDatosReg: any;
  keyFila: any;

  DPropietarios: clsPropietarios[] = [];
  DArrendatarios: clsArrendatarios[] = [];
  DListaArreBase: any[] = [];
  DListaArre: any = [];
  DListaArrtariaBase: any[] = [];
  DListaArrtaria: any = [];
  readOnly: boolean = false;
  readOnlyLlave: boolean = false;
  readOnlyForm: boolean = false;
  esEdicion: boolean = false;
  esInicioDatos: boolean = false;
  esCreacion: boolean = false;
  esInicioObj: any;
  iniEdicion: boolean = false;
  esFacturableDef: boolean = true;
  especAplicacion: any;
  especUsuarioEmail: string = ''; 
  especModoEnvioEmail: string = ''; 

  focusedRowIndex: number;
  focusedRowKeyGrupos: string;
  focusedRowKeyContactos: string;
  focusedRowKeyRepresentante: string;
  aceptarButtonOptions: any;
  closeButtonOptions: any;

  DEstados: any[] = ['ACTIVO','INACTIVO'];
  selectActividad: any[] = [];
  treeBoxGrupo: any[] = [];
  IdFacturable: string = "";
  perfilButton: any;
  isTreeBoxOpened: boolean;
  focusedRowKey: string;
  dropDownOptions = { width: 600, 
    height: 400, 
    hideOnParentScroll: true,
    container: '#router-container' };

  // Operaciones de grid
  rowNew: boolean = true;
  rowEdit: boolean = false;
  rowDelete: boolean = false;
  rowSave: boolean = false;
  rowApplyChanges: boolean = false;
  filasSelecc: any[] = [];
  esNuevaFila: boolean = false;
  esVisibleSelecc: string = 'none';
  ltool: any;

  // notificaciones
	type = 'info'
  toaVisible: boolean;
  toaMessage: string = "Registro actualizado!";
  toaTipo: string = 'success';
  loadingVisible: boolean = false;
  positionOf: string;

  borderStyle: string = "none";
  dropDownOptionsArr: any;
  
  private eventsSubscription: Subscription;

  @Input() events: Observable<any>;

  @Input() visible: boolean;

  @Output() onRespuestaArre = new EventEmitter<any>;

  constructor(
    private _sdatos: HOR001Service
  ) { 

    this.setCellValueFacturable = this.setCellValueFacturable.bind(this);

  }

  // Activa campos de la forma para edición 
  // dependiendo de la acción a realizar
  activarEdicion(accion) {
    switch (accion) {
      case 'consulta':
      case 'inactivo':
        this.esVisibleSelecc = 'none';
        this.esEdicion = false;
        break;
      case 'activo':
      case 'nuevo':
        this.esVisibleSelecc = 'always';
        this.esEdicion = true;
        break;
    
      default:
        break;
    }
  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.eventsSubscription = this.events.subscribe((datos: any) => {
      switch (datos.operacion) {
        case 'nuevo':
          this.DArrendatarios = [];
          break;
      
        case 'consulta':
          this.DArrendatarios = datos.dataSource;
          const dprop = this.DArrendatarios.find(p=> p.FACTURABLE)
          if (dprop)
            this.onRespuestaArre.emit({ operacion: 'facturable', CLIENTE: dprop.ARRENDATARIO})
        break;
      
        case 'facturable':
          this.IdFacturable = datos.CLIENTE;
          break;
      
        default:
          break;
      }
      this.activarEdicion(datos.operacion);

      // Inicializa datos
      this.valoresObjetos('todos');
    });

  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  onValueChangedFac(e, cellInfo) {
  }
  clickFacturable(e: any, cellInfo) {
    const chkval = this.chFacturable.instance.option('value');
    if (!cellInfo.data.FACTURABLE) {
      const drepe = this.DArrendatarios.findIndex(ya => ya.FACTURABLE && ya.ITEM !== cellInfo.data.ITEM);
      if (drepe === -1) {
        if (this.IdFacturable === "") {
          cellInfo.data.FACTURABLE = true;
          this.onRespuestaArre.emit({ operacion: 'facturable', CLIENTE: cellInfo.data.ARRENDATARIO})
        }
        else {
          cellInfo.data.FACTURABLE = false;
          showToast('Ya existe un propietario(a) facturable por defecto: '+this.IdFacturable);
        }
        e.stopImmediatePropagation();
      }
      else {
        cellInfo.data.FACTURABLE = false;
        showToast('Ya hay un propietario Facturable por defecto!');
        e.stopImmediatePropagation();
      }
    }
    else  {
      this.onRespuestaArre.emit({ operacion: 'facturable', CLIENTE: ""});
      cellInfo.data.FACTURABLE = false;
    }
  }

  onContentReadyGrupo(e:any) {
    if(e.rowType === 'data') {
      if(!e.data.ASIGNABLE) {
        e.cellElement.style.opacity = '.5'
      }
    }
  }
  selectionGrid(e) {
    this.filasSelecc = e.selectedRowKeys;
    if (this.filasSelecc.length != 0)
      this.rowDelete = true;
    else
      this.rowDelete = false;
  }

  
  verCiudad(item) {
    if (item)
      return item.ID_UBICACION + '; ' + item.NOMBRE;
    else
      return "";
  }
  verTarifa(item) {
    if (item)
      return item.ID_TARIFA + '; ' + formatNumber(item.VALOR, 'en-US', '1.2-2');
    else
      return "";
  }


  initNewRow(e){
    e.data.ITEM = 0;
    e.data.ID_ARRENDATARIO = '';
    e.data.ARRENDATARIO = '';
    e.data.FACTURABLE = false;
    e.data.FECHA_INICIO = new Date;
    e.data.FECHA_FINAL = new Date;
    e.data.ESTADO = 'ACTIVO';
    e.data.ID_ARRENDATARIA = '';
    e.data.ARRENDATARIA = '';
    if (this.DArrendatarios.length > 0) {
      const item = this.DArrendatarios.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act}) 
      e.data.ITEM = item.ITEM + 1;
    }
    else {
      e.data.ITEM = 1;
    }
    e.data.isEdit = false;
    this.esNuevaFila = true;

    // Verifica si ya hay un valor x defecto de columna FACTURABLE
    this.esFacturableDef = this.DArrendatarios.find(ya => ya.FACTURABLE) ? false : true;

  }

  insertedRow(e){
    this.rowApplyChanges = false;
    this.esVisibleSelecc = 'always';
    this.esFacturableDef = true;
    this.esNuevaFila = false;
    this.rowNew = true;
    this.onRespuestaArre.emit({ operacion: 'datos', data: this.DArrendatarios });
  }

  insertingRow(e) {
    e.data.isEdit = true;
    // Valida datos
    if (e.data.TIPO === '' || e.data.ID_ARRENDATARIO === ''){
      showToast('Faltan datos de arrendatario!', 'warning');
      e.cancel = true;
    }
  }

  removedRow(e) {
    this.rowApplyChanges = false;
    this.onRespuestaArre.emit({ operacion: 'datos', data: this.DArrendatarios });
  }
  updatingRow(e) {
    if (e.oldData === undefined)
      return;
    e.oldData.isEdit = true;
  }
  updatedRow(e){
    this.rowApplyChanges = false;
    this.esVisibleSelecc = 'always';
    this.esNuevaFila = false;
    this.rowNew = true;
    this.onRespuestaArre.emit({ operacion: 'datos', data: this.DArrendatarios });
  }
  onEditingStart(e) {
    e.data.isEdit = true;
    this.esVisibleSelecc = 'none';
    this.rowApplyChanges = true;
    this.rowNew = false;
  }
  onEditorPreparing(e) {
  }
  onCellPrepared(e) {
  }
  onCellClick(e) {
    this.keyFila = e.key;
  }
  onToolbarPreparingGrid(e: any) {
    let toolbarItems = e.toolbarOptions.items;
    e.toolbarOptions.items.unshift(
      {
        location: 'before'
      }
    );
  }
  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.isEdit) {
				// e.rowElement.style.backgroundColor = 'lightyellow';
				const className:string = e.rowElement.className;
				e.rowElement.className = className +' row-modified-focused';
			}
      if (!e.isEditing && e.data.isEdit) 
        {
          this.esVisibleSelecc = 'always';
          e.data.isEdit = false;
          this.rowNew = true;
          this.rowApplyChanges = false;
        }
      }
    if (e.rowType === "header" && e.rowIndex === 2 && !this.esEdicion) {
      e.rowElement.style.display = "none";
    }
  }

  onRowValidating(e: any) {

    e.promise = new Promise((resolve, reject) => {
      // Valida completitud
      var errMsg = '';
      if (e.newData.ID_ARRENDATARIO !== undefined && e.newData.ID_ARRENDATARIO == "") 
        errMsg = 'Falta seleccionar número propiedad';
      if (errMsg !== '') {
        this.rowApplyChanges = true;
        e.isValid = false;
        e.errorText = errMsg;
        resolve(false);
        return;
      }

      // Valida si hay duplicidad
      const nx = this.DArrendatarios.findIndex(p => p.ID_ARRENDATARIO === e.newData.ID_ARRENDATARIO);
      if (nx !== -1) {
        this.rowApplyChanges = true;
        e.isValid = false;
        resolve(false);
        e.errorText = 'Ya existe este arrendatario asignado!';
        return;
      }
      else {
        this.rowApplyChanges = false;
        this.rowNew = true;
        e.isValid = true;
        resolve(true);
        return;
      }
    }).then((result) => { 
      showToast('Arrendatario ya asignado!','Repetido', 'error');
    })  

  }

  onFocusedRowChanged(e){
    const rowData = e.row && e.row.data;
  }
  onEditCanceled(e) {
    e.data.isEdit = true;
    this.esVisibleSelecc = 'none';
    this.rowApplyChanges = true;
    this.rowNew = false;
  }
  onValueChangedArre(e, cellInfo) {
    cellInfo.data.ARRENDATARIO = "";
    const dnom = this.DListaArreBase.find(a => a.ID_CLIENTE == e.value);
    if (dnom) {
      cellInfo.data.ARRENDATARIO = e.value + "; " + dnom.NOMBRE_COMPLETO;
    }
  }
  onValueChangedArrtaria(e, cellInfo) {
    cellInfo.data.ARRENDATARIA = "";
    const dnom = this.DListaArrtariaBase.find(a => a.ID_CLIENTE == e.value);
    if (dnom) {
      cellInfo.data.ARRENDATARIA = e.value + "; " + dnom.NOMBRE_COMPLETO;
    }
  }
  setCellValueFacturable(rowData: any, value: any, currentRowData: any){
    rowData.FACTURABLE = value;
  }

  operGrid(e, operacion) {
    switch (operacion) {
      case 'new':
        this.gridArrendatarios.instance.addRow();
        this.rowApplyChanges = true;
        this.esVisibleSelecc = 'none';
        break;
      case 'edit':
        this.esEdicion = true;
        this.rowApplyChanges = true;
        this.rowEdit = false;
        this.esVisibleSelecc = 'none';
        break;
      case 'save':
        this.gridArrendatarios.instance.saveEditData();
        this.rowApplyChanges = false;
        this.rowNew = true;
        this.esVisibleSelecc = 'always';
        this.onRespuestaArre.emit({ operacion: 'datos', data: this.DArrendatarios });
        break;
      case 'cancel':
        this.gridArrendatarios.instance.cancelEditData();
        this.rowApplyChanges = false;
        this.esVisibleSelecc = 'always';
        this.rowNew = true;
        break;
      case 'delete':
        // Elimina filas seleccionadas
        Swal.fire({
          title: '',
          text: 'Desea eliminar los items seleccionados?',
          iconHtml: "<i class='icon-alert-ol'></i>",
          showCancelButton: true,
          confirmButtonColor: '#DF3E3E',
          cancelButtonColor: '#438ef1',
          cancelButtonText: 'No',
          confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.filasSelecc.forEach((key) => {
              const index = this.DArrendatarios.findIndex(a => a.ITEM === key);
              this.DArrendatarios.splice(index, 1);
            });
            this.gridArrendatarios.instance.refresh();
            this.onRespuestaArre.emit({ operacion: 'datos', data: this.DArrendatarios });
          }
        });
        break;

      default:
        break;
    }
  }

  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj == 'arrendatarios' || obj == 'todos') {
      const prm = { ID_GRUPO: 'ARRENDATARIO' };
      this._sdatos.consulta('CLIENTES INMUEBLES', prm, "HOR-001").subscribe((data: any)=> {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DListaArreBase = res;
        this.DListaArre = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });
      });
    }

    if (obj == 'arrendatarias' || obj == 'todos') {
      const prm = { ID_GRUPO: 'ARRENDATARIA' };
      this._sdatos.consulta('CLIENTES INMUEBLES', prm, "HOR-001").subscribe((data: any)=> {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DListaArrtariaBase = res;
        this.DListaArrtaria = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });
      });
    }

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
