import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
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
import { clsArrendatarios, clsPropiedades, clsPropietarios } from '../clsHOR002.class';
import { CommonModule, formatNumber } from '@angular/common';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-HOR00201',
  templateUrl: './HOR00201.component.html',
  styleUrls: ['./HOR00201.component.css'],
  standalone: true,
  imports: [MatTabsModule, DxLoadPanelModule, DxFormModule, DxSelectBoxModule,
            DxDropDownBoxModule, DxDataGridModule, DxTreeListModule, DxButtonModule,
            DxTextBoxModule,DxTagBoxModule, DxValidatorModule,
            DxTabsModule, CommonModule, DxDateBoxModule, DxCheckBoxModule
    ]
})
export class HOR00201Component {
  @ViewChild("formPropiedades", { static: false }) formPropiedades: DxFormComponent;
  @ViewChild("gridPropietarios", { static: false }) gridPropietarios: DxDataGridComponent;
  @ViewChild("tagArrendatarios", { static: false }) tagArrendatarios: DxTagBoxComponent;
  @ViewChild("xs_FECHA_ADQUISICION", { static: false }) fechaAdq: DxDateBoxComponent;
  @ViewChild("chFacturable", { static: false }) chFacturable: DxCheckBoxComponent;
  
  

  colCountByScreen: object;
	conCambios: number = 0;
  mnuAccion: string;
	VDatosReg: any;
  keyFila: any;

  tabsInfoAcreedores: string[] = ['Identificación','Ubicaciones','Financieros', 'Histórico'];

  DPropietarios: clsPropietarios[] = [];
  DListaPropBase: any[] = [];
  DListaProp: any;
  DCiudades: any;
  DCiudadesLista: any[] = [];
  readOnly: boolean = false;
  readOnlyLlave: boolean = false;
  readOnlyForm: boolean = false;
  openIdLegal: boolean = false;
  openGrupo: boolean = false;
  openContacto: boolean = false;
  openActividad: boolean = false;
  openRepresentante: boolean = false;
  idTributariasVisible: boolean = false;
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
  FPropiedades_prev: any;
  rowsSelectedPerfil: any;
  rowsSelectedRT: any;

  DTipos: any = [];
  DTarifas: any = [];
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
  tabVisible: any[] = ["block","none","none","none"];

  QFiltro: any;
  filterIdLegal: any ='';
  
  customValueSboxIdLegal: boolean = false;
  eventsSubjectInformes: Subject<any> = new Subject<any>();
  eventsSubjectFiltro: Subject<any> = new Subject<any>();
  eventsSubjectArre: Subject<any> = new Subject<any>();
  customValueSboxContacto: boolean = false;
  DEmail: any;
  DDirecciones: any;
  DTelefonos: any;
  DCondiciones: any;
  DContactoAdic: any;
  DCLIENTEesPro: any;
  DBancos: any;

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

  callbacks = [];
  borderStyle: string = "none";
  dropDownOptionsArr: any;

  private eventsSubscription: Subscription;

  @Input() events: Observable<any>;

  @Input() visible: boolean;

  @Output() onRespuestaProp = new EventEmitter<any>;
  
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
          this.DPropietarios = [];
          break;
      
        case 'consulta':
          this.DPropietarios = datos.dataSource;
          setTimeout(() => {
            this.chFacturable.instance.option('disabled',true);
            const dprop = this.DPropietarios.find(p=> p.FACTURABLE)
            if (dprop)
              this.onRespuestaProp.emit({ operacion: 'facturable', CLIENTE: dprop.PROPIETARIO})
          }, 300);
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


  clickFacturable(e: any, cellInfo) {
    const chkval = this.chFacturable.instance.option('value');
    if (!cellInfo.data.FACTURABLE) {
      const drepe = this.DPropietarios.findIndex(ya => ya.FACTURABLE && ya.ITEM !== cellInfo.data.ITEM);
      if (drepe === -1) {
        if (this.IdFacturable === "") {
          cellInfo.data.FACTURABLE = true;
          this.onRespuestaProp.emit({ operacion: 'facturable', CLIENTE: cellInfo.data.PROPIETARIO})
        }
        else {
          cellInfo.data.FACTURABLE = false;
          showToast('Ya existe un arrendatario(a) facturable por defecto: '+this.IdFacturable);
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
      this.onRespuestaProp.emit({ operacion: 'facturable', CLIENTE: ""});
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

  initNewRow(e){
    e.data.ITEM = 0;
    e.data.ID_PROPIETARIO = '';
    e.data.PROPIETARIO = '';
    e.data.FACTURABLE = false;
    e.data.FECHA_ADQUISICION = new Date;
    e.data.ESTADO = 'ACTIVO';
    if (this.DPropietarios.length > 0) {
      const item = this.DPropietarios.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act}) 
      e.data.ITEM = item.ITEM + 1;
    }
    else {
      e.data.ITEM = 1;
    }
    e.data.isEdit = false;
    this.esNuevaFila = true;

    // Verifica si ya hay un valor x defecto de columna FACTURABLE
    this.esFacturableDef = this.DPropietarios.find(ya => ya.FACTURABLE) ? false : true;

  }

  insertedRow(e){
    this.rowApplyChanges = false;
    this.esVisibleSelecc = 'always';
    this.esFacturableDef = true;
    this.esNuevaFila = false;
    this.rowNew = true;
    this.onRespuestaProp.emit({operacion: 'datos', data: this.DPropietarios});
  }

  insertingRow(e) {
    this.conCambios++;
    e.data.isEdit = true;
    // Valida datos
    if (e.data.TIPO === '' || e.data.ID_PROPIEDAD === ''){
      showToast('Faltan completar tipo o numero de propiedad', 'warning');
      e.cancel = true;
    }
  }


  removedRow(e) {
    this.rowApplyChanges = false;
    this.onRespuestaProp.emit({operacion: 'datos', data: this.DPropietarios});
  }
  updatingRow(e) {
    this.conCambios++;
    if (e.oldData === undefined)
      return;
    e.oldData.isEdit = true;
  }
  updatedRow(e){
    this.rowApplyChanges = false;
    this.esVisibleSelecc = 'always';
    this.esNuevaFila = false;
    this.rowNew = true;
    this.onRespuestaProp.emit({operacion: 'datos', data: this.DPropietarios});
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
      if (e.newData.ID_PROPIEDAD !== undefined && e.newData.ID_PROPIEDAD <= 0) 
        errMsg = 'Falta seleccionar número propiedad';
      if (errMsg !== '') {
        this.rowApplyChanges = true;
        e.isValid = false;
        e.errorText = errMsg;
        resolve(false);
        return;
      }

      // Valida si hay duplicidad
      const nx = this.DPropietarios.findIndex(p => p.ID_PROPIETARIO === e.newData.ID_PROPIETARIO);
      if (nx !== -1) {
        this.rowApplyChanges = true;
        e.isValid = false;
        resolve(false);
        e.errorText = 'Ya existe este propietario asignado!';
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
      showToast('Propietario ya asignado!','Repetido', 'error');
    })  

  }

  onFocusedRowChanged(e){
    const rowData = e.row && e.row.data;
    if (rowData) {
      this.valoresObjetos('atributos');
    }
  }
  onEditCanceled(e) {
    e.data.isEdit = true;
    this.esVisibleSelecc = 'none';
    this.rowApplyChanges = true;
    this.rowNew = false;
  }
  onValueChangedPropietario(e, cellInfo) {
    cellInfo.data.PROPIETARIO = "";
    const dnom = this.DListaPropBase.find(a => a.ID_CLIENTE == e.value);
    if (dnom) {
      cellInfo.data.PROPIETARIO = e.value + "; " + dnom.NOMBRE_COMPLETO;
    }
  }
  setCellValueFacturable(rowData: any, value: any, currentRowData: any){
    rowData.FACTURABLE = value;
  }

  crearArre(e, accion) {
    this.eventsSubjectArre.next({ operacion: 'nuevo'});
  }
  
  onValueChangedFac(e, cellInfo) {

  }

  operGrid(e, operacion) {
    switch (operacion) {
      case 'new':
        this.gridPropietarios.instance.addRow();
        this.rowApplyChanges = true;
        this.esVisibleSelecc = 'none';
        this.chFacturable.instance.option('disabled',false);
        break;
      case 'edit':
        this.esEdicion = true;
        this.rowApplyChanges = true;
        this.rowEdit = false;
        this.esVisibleSelecc = 'none';
        this.chFacturable.instance.option('disabled',false);
        break;
      case 'save':
        this.gridPropietarios.instance.saveEditData();
        this.rowApplyChanges = false;
        this.rowNew = true;
        this.esVisibleSelecc = 'always';
        this.onRespuestaProp.emit({ operacion: 'datos', data: this.DPropietarios });
        this.chFacturable.instance.option('disabled',true);
        break;
      case 'cancel':
        this.gridPropietarios.instance.cancelEditData();
        this.rowApplyChanges = false;
        this.esVisibleSelecc = 'always';
        this.rowNew = true;
        this.chFacturable.instance.option('disabled',true);
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
              const index = this.DPropietarios.findIndex(a => a.ITEM === key);
              this.DPropietarios.splice(index, 1);
            });
            this.gridPropietarios.instance.refresh();
            this.onRespuestaProp.emit({ operacion: 'datos', data: this.DPropietarios });
          }
        });
        break;

      default:
        break;
    }
  }

  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj == 'propietarios' || obj == 'todos') {
      const prm = { ID_GRUPO: 'PROPIETARIO' };
      this._sdatos.consulta('CLIENTES INMUEBLES', prm, "HOR-001").subscribe((data: any)=> {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DListaPropBase = res;
        this.DListaProp = new DataSource({
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