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
import Swal from 'sweetalert2';
import { showToast } from '../../../shared/toast/toastComponent';
import { validatorRes } from 'src/app/shared/validator/validator';
import { CommonModule, formatNumber } from '@angular/common';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import { clsItemsTarifas } from '../clsHOR003.class';

@Component({
  selector: 'app-HOR00301',
  templateUrl: './HOR00301.component.html',
  styleUrls: ['./HOR00301.component.css'],
  standalone: true,
  imports: [DxLoadPanelModule, DxFormModule, DxSelectBoxModule,
    DxDropDownBoxModule, DxDataGridModule, DxTreeListModule, DxButtonModule,
    DxTextBoxModule,DxTagBoxModule, DxValidatorModule,
    DxTabsModule, CommonModule, DxDateBoxModule, DxCheckBoxModule
]

})
export class HOR00301Component {
  @ViewChild("gridItemsTarifas", { static: false }) gridItemsTarifas: DxDataGridComponent;
  
  mnuAccion: string;
	VDatosReg: any;
  keyFila: any;

  DItemsTarifas: clsItemsTarifas[] = [];
  DIvas: any[] = [];
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

  @Output() onRespuestaItems = new EventEmitter<any>;

  constructor(
    private _sdatos: HOR001Service
  ) { 


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
          this.DItemsTarifas = [];
          
          break;
      
        case 'consulta':
          this.DItemsTarifas = datos.dataSource;
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

  selectionGrid(e) {
    this.filasSelecc = e.selectedRowKeys;
    if (this.filasSelecc.length != 0)
      this.rowDelete = true;
    else
      this.rowDelete = false;
  }

  
  initNewRow(e){
    e.data.ITEM = 0;
    e.data.FECHA_INICIAL = new Date;
    e.data.FECHA_VENCIMIENTO = new Date;
    e.data.VALOR_BASE = 0;
    e.data.PORCENTAJE = 0;
    if (this.DItemsTarifas.length > 0) {
      const item = this.DItemsTarifas.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act}) 
      e.data.ITEM = item.ITEM + 1;
    }
    else {
      e.data.ITEM = 1;
    }
    e.data.isEdit = false;
    this.esNuevaFila = true;

  }

  insertedRow(e){
    this.rowApplyChanges = false;
    this.esVisibleSelecc = 'always';
    this.esFacturableDef = true;
    this.esNuevaFila = false;
    this.rowNew = true;
    this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsTarifas });
  }

  insertingRow(e) {
    e.data.isEdit = true;
    // Valida datos
    if (e.data.VALOR_BASE === 0 || e.data.FECHA_INICIAL === ''){
      showToast('Faltan datos de tarifa!', 'warning');
      e.cancel = true;
    }
  }

  removedRow(e) {
    this.rowApplyChanges = false;
    this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsTarifas });
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
    this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsTarifas });
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
      if (e.newData.VALOR === 0) 
        errMsg = 'Falta asignar un valor!';
      if (errMsg !== '') {
        this.rowApplyChanges = true;
        e.isValid = false;
        e.errorText = errMsg;
        resolve(false);
        return;
      }

      // Valida si hay superposición de fechas
      const nx = this.DItemsTarifas.findIndex(p => p.FECHA_INICIAL === e.newData.FECHA_INICIAL);
      if (nx !== -1) {
        this.rowApplyChanges = true;
        e.isValid = false;
        resolve(false);
        e.errorText = 'Hay un rango de fechas superpuesto!';
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
      showToast('Ya existe un rango de fechas!','Repetido', 'error');
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

  setCellValor(rowData: any, value: any, currentRowData: any){
    rowData.VALOR_BASE = value;
  }
  setCellPor(rowData: any, value: any, currentRowData: any){
    rowData.PORCENTAJE = value;
  }

  onValueChangedIva(e, cellInfo) {
    cellInfo.data.IVA = "";
    const dtar = this.DIvas.find(a => a.ID_TASA == e.value);
    if (dtar) {
      cellInfo.data.IVA = dtar.ID_TASA + '; ' + formatNumber(dtar.PORCENTAJE*100, 'en-US', '1.2-2') + '%';
    }
  }

  operGrid(e, operacion) {
    switch (operacion) {
      case 'new':
        this.gridItemsTarifas.instance.addRow();
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
        this.gridItemsTarifas.instance.saveEditData();
        this.rowApplyChanges = false;
        this.rowNew = true;
        this.esVisibleSelecc = 'always';
        this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsTarifas });
        break;
      case 'cancel':
        this.gridItemsTarifas.instance.cancelEditData();
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
              const index = this.DItemsTarifas.findIndex(a => a.ITEM === key);
              this.DItemsTarifas.splice(index, 1);
            });
            this.gridItemsTarifas.instance.refresh();
            this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsTarifas });
          }
        });
        break;

      default:
        break;
    }
  }

  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj === 'ivas' || obj === 'todos') {
      const prm = { TIPO: 'IVA' };
      this._sdatos.consulta('IVA', prm, 'HOR-003').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DIvas = res;
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
