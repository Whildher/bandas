import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxSelectBoxModule } from 'devextreme-angular';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Observable, Subject, Subscription, lastValueFrom, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { showToast } from '../../../shared/toast/toastComponent';
import { validatorRes } from 'src/app/shared/validator/validator';
import { CommonModule, formatNumber } from '@angular/common';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import { clsItemsTarifas, clsTarifas } from '../../HOR003/clsHOR003.class';
import { clsItmRecaudos, clsRecaudos, clsTotalesRec } from '../clsHOR005.class';
import { XcComboGridComponent } from 'src/app/shared/xc-combo-grid/xc-combo-grid.component';

@Component({
  selector: 'app-HOR00501',
  templateUrl: './HOR00501.component.html',
  styleUrls: ['./HOR00501.component.css'],
  standalone: true,
  imports: [DxSelectBoxModule, DxDataGridModule, DxButtonModule,
            CommonModule, XcComboGridComponent
           ]
})
export class HOR00501Component {
  @ViewChild("gridItemsRecaudos", { static: false }) gridItemsRecaudos: DxDataGridComponent;
  
  mnuAccion: string;
	VDatosReg: any;
  keyFila: any;
  user: any;
  
  DItemsRecaudos: clsItmRecaudos[] = [];
  DTarifas: any[] = [];
  DAccionesRec:any = [];
    
  accionesItems: string;
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
  rowsSelected: any[] = [];

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
  
  eventsSubjectGrid: Subject<any> = new Subject<any>();
  private eventsSubscription: Subscription;

  @Input() events: Observable<any>;

  @Input() visible: boolean;

  @Output() onRespuestaItemsIndiv = new EventEmitter<any>;

  @Input() DRecaudos: clsRecaudos;

  constructor(
    private _sdatos: HOR001Service
  ) { 


  }

  // Selección de acción sobre los items
  onSeleccAccion(e) {

    this.accionesItems = e.itemData.FILTRO;
    const prm = { ACCION: e.itemData.FILTRO };
    this._sdatos.consulta('configuracion acciones', prm, 'COM-203').subscribe((data: any) => {
      const res = JSON.parse(data.data);
      if ( (data.token != undefined) ){
        const refreshToken = data.token;
        localStorage.setItem("token", refreshToken);
      }

      // Ejecuta la accion
      if (res[0].tipo === 'popup') {
        // this.eventsSubjectPopUpGrid.next({ operacion: 'ver', 
        //                                     config: res[0], 
        //                                     prmDatos: this.DMovimientos  })
        this.valoresObjetos('ventana acciones', { operacion: 'ver', 
                                                  config: res[0], 
                                                  prmDatos: this.DRecaudos  })
      }
      else {
        this.DItemsRecaudos = res;
      }

    });

  }

  // Recibe los datos la ventana de acciones
  onRespuestaGrid(e: any) {

    if (e !== 'refrescar') {

      // Trae toda la info seleccionada según la acción
      const prm = { DATOS: e.rowsSelected };
      this._sdatos.consulta('accion:'+this.accionesItems, prm, 'COM-203').subscribe((data: any) => {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        if (res[0].ErrMensaje !== '') {
          this.showModal(res[0].ErrMensaje);
        } 
        else {
          this.DItemsRecaudos = res;
        }

      });
  
    }
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
          this.DItemsRecaudos = [];
          break;
      
        case 'consulta':
          // this.DItemsRecaudos = datos.dataSource;
          this.valoresObjetos('consulta', datos.documento);
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
    this.user = localStorage.getItem("usuario");
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
    e.data.ID_TARIFA = '',
    e.data.TARIFA = '',
    e.data.CANTIDAD = 0;
    e.data.VALOR_UNITARIO = 0;
    e.data.IVA = 0;
    e.data.TOTAL = 0;
    if (this.DItemsRecaudos.length > 0) {
      const item = this.DItemsRecaudos.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act}) 
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
    this.calcularTotales('total', '', '');
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
    this.calcularTotales('total', '', '');
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
    this.calcularTotales('total', '', '');
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
      const nx = this.DItemsRecaudos.findIndex(p => p.ID_TARIFA === e.newData.ID_TARIFA && p.ITEM === e.newData.ITEM);
      if (nx !== -1) {
        this.rowApplyChanges = true;
        e.isValid = false;
        resolve(false);
        e.errorText = 'Concepto repetido!';
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
    this.calcularTotales('total', '', '');
  }

  setCellValor(rowData: any, value: any, currentRowData: any){
    rowData.VALOR_UNITARIO = value;
    rowData.IVA = rowData.VALOR_UNITARIO * currentRowData.CANTIDAD * currentRowData.POR_IVA;
    rowData.VALOR_TOTAL = rowData.VALOR_UNITARIO * currentRowData.CANTIDAD * (1 + currentRowData.POR_IVA);
  }
  setCellCan(rowData: any, value: any, currentRowData: any){
    rowData.CANTIDAD = value;
    rowData.IVA = currentRowData.VALOR_UNITARIO * rowData.CANTIDAD * currentRowData.POR_IVA;
    rowData.VALOR_TOTAL = currentRowData.VALOR_UNITARIO * rowData.CANTIDAD * (1 + currentRowData.POR_IVA);
  }
  onValueChangedTarifa(e, cellInfo) {
    this.calcularTotales('linea', cellInfo, e.value);
  }

  // Calcular total de linea y de la factura
  calcularTotales(opcion, cellInfo, concepto) {
    if (opcion == 'linea') {
      cellInfo.data.TARIFA = "";
      const dtar = this.DTarifas.find(a => a.ID_TARIFA == concepto);
      if (dtar) {
        cellInfo.data.TARIFA = dtar.ID_TARIFA + '; ' + formatNumber(dtar.VALOR, 'en-US', '1.2-2');
        cellInfo.data.VALOR_UNITARIO = dtar.VALOR;
        cellInfo.data.CANTIDAD = 1;
        cellInfo.data.ID_TASA = dtar.ID_TASA;
        cellInfo.data.DESC_TASA = dtar.DESC_TASA;
        cellInfo.data.POR_IVA = dtar.POR_IVA;
        cellInfo.data.IVA = cellInfo.data.VALOR_UNITARIO * cellInfo.data.CANTIDAD * dtar.POR_IVA;
        cellInfo.data.VALOR_TOTAL = cellInfo.data.VALOR_UNITARIO * cellInfo.data.CANTIDAD * (1 + dtar.POR_IVA);
      }
    }

    // Totales encabezado
    if (opcion == 'total') {
      let sumSubTotal: number = 0;
      let sumIva: number = 0;
      let sumTotal: number = 0;
      this.DItemsRecaudos.forEach(item => {
        sumSubTotal += item.CANTIDAD * item.VALOR_UNITARIO;
        sumIva += item.IVA;
        sumTotal += item.CANTIDAD * item.VALOR_UNITARIO + item.IVA;
      })

      // Construye array de totales
      let DTotales: clsTotalesRec[] = [];
      DTotales.push({ ITEM: 1, 
                      CONCEPTO: 'Sub total', 
                      FRM_VALOR: formatNumber(sumSubTotal, 'en-US', '1.2-2'),
                      VALOR: sumSubTotal
                     });
      let k = 2;
      this.onRespuestaItemsIndiv.emit({ operacion: 'datos', data: this.DItemsRecaudos, totales: DTotales });
      
    }

  }

  operGrid(e, operacion) {
    switch (operacion) {
      case 'new':
        this.gridItemsRecaudos.instance.addRow();
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
        this.gridItemsRecaudos.instance.saveEditData();
        this.rowApplyChanges = false;
        this.rowNew = true;
        this.esVisibleSelecc = 'always';
        this.calcularTotales('total', '', '');
        break;
      case 'cancel':
        this.gridItemsRecaudos.instance.cancelEditData();
        this.rowApplyChanges = false;
        this.esVisibleSelecc = 'always';
        this.rowNew = true;
        this.calcularTotales('total', '', '');
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
              const index = this.DItemsRecaudos.findIndex(a => a.ITEM === key);
              this.DItemsRecaudos.splice(index, 1);
            });
            this.gridItemsRecaudos.instance.refresh();
            this.calcularTotales('total', '', '');
          }
        });
        break;

      default:
        break;
    }
  }

  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj === 'tarifas' || obj === 'todos') {
      const prm = { ID_LISTA: 'TARIFAS' };
      this._sdatos.consulta('TARIFAS', prm, 'HOR-003').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DTarifas = res;
      });
    }

    if (obj === 'consulta') {
      const prm = { DOCUMENTO: opcion };
      this._sdatos.consulta('items factura individual', prm, 'HOR-004').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DItemsRecaudos = res;
      });
    }

    if (obj == 'acciones' || obj == 'todos' ) {
      const prm = { RECAUDOS: this.DRecaudos,
                    USUARO: this.user
                  }
      this._sdatos.consulta('ACCIONES', prm, "HOR-005").subscribe((data: any) => {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DAccionesRec = res;
      });
    }
 
    if (obj == 'ventana acciones') {
      const prm = { CONFIG: opcion,  DATOS: opcion.prmDatos }
      this._sdatos.consulta(opcion.config.accionDatos, prm, 'COM-203').subscribe((data: any) => {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }

        // Valida si hay datos...
        if (res[0].ErrMensaje !== "") {
          this.showModal(res[0].ErrMensaje);
        }
        else {
          this.eventsSubjectGrid.next({ 
            dataSource: res, 
            rowsSelected: this.rowsSelected,
            keyExpr: opcion.config.keyExpr,   //["ITEM"],
            titGrid: opcion.config.titulo, 
            modoSelection: opcion.config.modoSelection,
            colsConfig: opcion.config.dataConfig, 
            style: { height: opcion.config.height, width: opcion.config.width },
            container: 'popup'
           });
        }
        
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
