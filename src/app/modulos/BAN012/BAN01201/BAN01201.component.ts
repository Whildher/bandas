import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxComponent, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxComponent, DxDateBoxModule, DxDropDownBoxModule, DxFormComponent, DxFormModule, DxLoadPanelModule, 
         DxPopupModule, 
         DxSelectBoxComponent, 
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
import { clsItmCotizaciones } from '../clsBAN012.class';
import DataSource from 'devextreme/data/data_source';
import { FileManagerComponent } from 'src/app/shared/image-manager/file-manager.component';
import { clsCotizaciones } from '../../BAN011/clsBAN011.class';
import { PegardatosComponent } from 'src/app/shared/pegardatos/pegardatos.component';

@Component({
  selector: 'app-BAN01201',
  templateUrl: './BAN01201.component.html',
  styleUrls: ['./BAN01201.component.css'],
  standalone: true,
  imports: [DxLoadPanelModule, DxFormModule, DxSelectBoxModule,
    DxDropDownBoxModule, DxDataGridModule, DxTreeListModule, DxButtonModule,
    DxTextBoxModule,DxTagBoxModule, DxValidatorModule,
    DxTabsModule, CommonModule, DxDateBoxModule, DxCheckBoxModule,
    DxPopupModule, FileManagerComponent, PegardatosComponent
]

})
export class BAN01201Component {
  @ViewChild("gridItemsCotizaciones", { static: false }) gridItemsCotizaciones: DxDataGridComponent;
  @ViewChild("xs_PRODUCTOS", { static: false }) sboxProductos: DxSelectBoxComponent;
  @ViewChild("checkProvPro", { static: false }) checkProvPro: DxCheckBoxComponent;
  
  mnuAccion: string;
	VDatosReg: any;
  keyFila: any;
  numFila: Number;

  DItemsCotizaciones: clsItmCotizaciones[] = [];
  FCotizaciones: clsCotizaciones;
  DProductos: any;
  DProductosLista: any;
  DProveedores: any;
  DProveedoresLista: any;
  DListaUDM: any;
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
  popUpImg: boolean = false;

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
  dropDownOptionsPro: any =  { width: 700, 
    height: 400, 
    hideOnParentScroll: true, 
    container: '#router-container',
    toolbarItems: [{
      location: 'before', 
      toolbar: 'top',
      template: 'tempEncab',
    }]
  };
  dropDownOptionsProvee: any =  { width: 700, 
    height: 400, 
    hideOnParentScroll: true, 
    container: '#router-container',
    toolbarItems: [{
      location: 'before', 
      toolbar: 'top',
      template: 'tempEncabProv',
    }]
  };

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
  backendIMG: string = "/api/img/PRO022/2012113_1.jpg"

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

  eventsSubjectAdjuntos: Subject<any> = new Subject<any>();
  eventsSubjectPegar: Subject<any> = new Subject<any>();

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
      case 'generacion':
        this.esVisibleSelecc = 'always';
        this.esEdicion = false;
        break;
    
      default:
        break;
    }
  }

  pegarDatos() {
    this.eventsSubjectPegar.next({ accion: 'editar' });
  }
  onRespuestaPegar(e: any) {
    // Adiciona a los items
    this.DItemsCotizaciones = [];
    let k = 1;
    e.forEach(dat => {
      this.DItemsCotizaciones.push({ PRODUCTO: dat.PRODUCTO, 
                                     CANTIDAD: dat.CANTIDAD,
                                     ADJUNTOS: {},
                                     COSTO: 0,
                                     DETALLE: '',
                                     FECHA_ENTREGA: new Date,
                                     FLETE: 0,
                                     GRAVAMENES: '',
                                     ID_PROVEEDOR: '',
                                     ID_UDM: '',
                                     ITEM: k,
                                     NOMBRE_PROVEEDOR: ''
                                    });
      k++
    });
  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.eventsSubscription = this.events.subscribe((datos: any) => {
      switch (datos.operacion) {
        case 'nuevo':
          this.DItemsCotizaciones = [];
          this.FCotizaciones = datos.Encab;
          this.valoresObjetos('productos');
          break;
      
        case 'modificar':
          this.DItemsCotizaciones = datos.Items;
          this.FCotizaciones = datos.Encab;
          this.valoresObjetos('productos');
          break;
      
        case 'consulta':
          this.valoresObjetos('consulta', datos.documento);
          break;

        case 'generacion':
          this.DItemsCotizaciones = datos.dataSource;
          break;
      
        default:
          break;
      }
      this.activarEdicion(datos.operacion);

      // Inicializa datos
      this.valoresObjetos('todos');
      // this.valoresObjetos('consulta items');

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
    e.data.PRODUCTO = '';
    e.data.FECHA_ENTREGA = new Date;
    e.data.ID_PROVEEDOR = '';
    e.data.FLETE = 0;
    e.data.COSTO = 0;
    e.data.CANTIDAD = 0;
    e.data.ID_UDM = '';
    e.data.DETALLE = '';
    if (this.DItemsCotizaciones.length > 0) {
      const item = this.DItemsCotizaciones.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act}) 
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
    this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsCotizaciones });
  }

  insertingRow(e) {
    e.data.isEdit = true;
    // Valida datos
    if (e.data.COSTO === 0){
      showToast('Faltan datos de costo!', 'warning');
      e.cancel = true;
    }
  }

  removedRow(e) {
    this.rowApplyChanges = false;
    this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsCotizaciones });
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
    this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsCotizaciones });
  }
  onEditingStart(e) {
    e.data.isEdit = true;
    this.esVisibleSelecc = 'none';
    this.rowApplyChanges = true;
    this.rowNew = false;
  }
  onEditorPreparing(e) {
  }
  
  onCellPrepared1(e) {
    if (e.rowType === 'data' && e.column.dataField === 'PRODUCTO') {
      if (e.rowIndex > 0) {
        if (e.data.PRODUCTO === e.component.cellValue(e.rowIndex - 1, 'PRODUCTO')) {
          // e.cellElement.style.display = 'none';
          e.cellElement.css("font-size" , "0");  
        } else {
          const startIndex = e.rowIndex - 1;
          let rowspan = 1;
          while (startIndex + rowspan < e.component.getVisibleRows().length && 
                 e.data.PRODUCTO === e.component.cellValue(startIndex + rowspan, 'PRODUCTO')) {
            rowspan++;
          }
          e.cellElement.setAttribute('rowspan', rowspan);
        }
      }
    }
  }
  onCellPrepared (e) {
    if (e.rowType === "data" && e.rowIndex > 0) {
      setTimeout(() => {
        if (e.column.dataField == "PRODUCTO") {
          var previousCellValue = e.component.cellValue(e.rowIndex - 1, e.column.dataField);
          if (e.value === previousCellValue) {
            var previousCellElement = e.component.getCellElement(e.rowIndex - 1, e.column.dataField);
            var rowspan = 2;
            while(previousCellElement.style.display === "none") {
              rowspan++;
              previousCellElement = e.component.getCellElement(e.rowIndex - rowspan + 1, e.column.dataField);
            }
            previousCellElement.setAttribute("rowspan", rowspan);
            e.cellElement.style.display = "none";
          }
        }
      })
    }
  }

  onValueChangedUDM(e, cellInfo) {
    cellInfo.setValue(e.value);
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

    var errMsg = '';
    e.promise = new Promise((resolve, reject) => {
      // Valida completitud
      if (e.newData.COSTO === 0) errMsg += 'Falta asignar costo!';
      if (e.newData.CANTIDAD === 0) errMsg += 'Falta asignar cantidad!';
      if (errMsg !== '') {
        this.rowApplyChanges = true;
        e.isValid = false;
        showToast(errMsg,"error");
        // e.errorText = errMsg;
        resolve(false);
        return;
      }
      else {
        e.errorText="";
        // showToast("sección actualizada!","success");
        e.isValid = true;
        resolve(true);
        return;
      }

    }).then((result) => { 
      if (!result)
        showToast(errMsg,'error');
    })  

  }

  onFocusedRowChanged(e){
    const rowData = e.row && e.row.data;
  }
  onEditCanceled(e) {
    this.esVisibleSelecc = 'none';
    this.rowApplyChanges = true;
    this.rowNew = false;
  }

  setCellCantidad(rowData: any, value: any, currentRowData: any){
    rowData.CANTIDAD = value;
  }
  setCellCosto(rowData: any, value: any, currentRowData: any){
    rowData.COSTO = value;
  }
  setCellFlete(rowData: any, value: any, currentRowData: any){
    rowData.FLETE = value;
  }

  // Acciones sobre Selección producto
  // Nombre, precios, especificaciones de producto
  async onSeleccRowProducto(e:any, cellInfo:any) {
    if (e.value){
      cellInfo.data.PRODUCTO = e.value;
      this.keyFila = cellInfo.key;
    }
  }
  refreshClick(objeto) {
    // this.checkProSoloPrecio.instance.option("value", false);
    // this.checkProvPro.instance.option("value", false);
    this.valoresObjetos('productos');
    this.sboxProductos.instance._refresh();
    this.sboxProductos.instance.close();
  }
  onCustomItemCreating(e) {
    if (!e.text) {
      e.customItem = null;
      return;
    }

    const dataSource = e.component.getDataSource();
    const newItem = {
      PRODUCTO: e.text
    };

    dataSource.store().push([
      {
        type: "insert",
        data: newItem
      }
    ]);
    e.customItem = newItem;
  }

  // Acciones sobre Selección proveedor
  onSeleccRowProveedor(e:any, cellInfo:any) {
    if (e.value){
      cellInfo.data.ID_PROVEEDOR = e.value;
      this.keyFila = cellInfo.key;
      const dpro = this.DProveedores._items.find((d:any) => d.ID_PROVEEDOR === e.value);
      if (dpro) {
        this.gridItemsCotizaciones.instance.cellValue(cellInfo.rowIndex, "COSTO", dpro.COSTO);
      }
    }
  }
  refreshClickProv(objeto) {
    // this.checkProSoloPrecio.instance.option("value", false);
    // this.checkProvPro.instance.option("value", false);
    this.valoresObjetos('proveedores');
    this.sboxProductos.instance._refresh();
    this.sboxProductos.instance.close();
  }
  onCustomItemCreatingProv(e) {
    if (!e.text) {
      e.customItem = null;
      return;
    }

    const dataSource = e.component.getDataSource();
    const newItem = {
      PRODUCTO: e.text
    };

    dataSource.store().push([
      {
        type: "insert",
        data: newItem
      }
    ]);
    e.customItem = newItem;
  }
  onProductosProv(e) {
    const chkprov = this.checkProvPro.instance.option("value");
    var rowIndex = this.gridItemsCotizaciones.instance.getRowIndexByKey(this.keyFila);  
    const producto = this.gridItemsCotizaciones.instance.cellValue(rowIndex, "PRODUCTO");
    var datPro: any = [];
    if (e.value) {
      datPro = chkprov ? 
               this.DProveedoresLista.filter(p =>p.PRODUCTOS.findIndex(c => c.PRODUCTO == producto) != -1) :
               this.DProveedoresLista;
      // Muestra el costo
      datPro.forEach(elepro => {
        elepro.COSTO = elepro.PRODUCTOS.find(p => p.PRODUCTO == producto).COSTO?? 0;
      });
    }
    else {
      datPro = this.DProveedoresLista;  
    }
    this.DProveedores = new DataSource({
      store: datPro,  
      paginate: true,
      pageSize: 20
    });
    setTimeout(() => {
      this.DProveedores.reload();
    }, 300);
  }

  aceptaImg() {
    const prefijo = this.FCotizaciones.ID_DOCUMENTO + "_" + 
                    this.FCotizaciones.CONSECUTIVO + "_" + 
                    this.numFila + "_"
    this.eventsSubjectAdjuntos.next({ operacion: 'guardar', prefijo });
    this.popUpImg = false;
  }
  cancelaImg() {
    this.popUpImg = false;
  }
  onClickAttach(e, cellInfo): void {
    this.popUpImg = true;
    this.numFila = cellInfo.data.ITEM;
  }

  onInit(e: any) {  
    e.component.registerKeyHandler("escape", function (arg) {  
        arg.stopPropagation();  
    });  
  }  

  operGrid(e, operacion) {
    switch (operacion) {
      case 'new':
        this.gridItemsCotizaciones.instance.addRow();
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
        this.gridItemsCotizaciones.instance.saveEditData();
        this.rowApplyChanges = false;
        this.rowNew = true;
        this.esVisibleSelecc = 'always';
        this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsCotizaciones });
        break;
      case 'cancel':
        this.gridItemsCotizaciones.instance.cancelEditData();
        this.rowApplyChanges = false;
        this.esVisibleSelecc = 'always';
        this.rowNew = true;
        break;
      case 'delete':
        // Elimina filas seleccionadas
        if (this.filasSelecc.length == 0) {
          showToast('No hay filas seleccionadas!');
          return;
        }
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
              const index = this.DItemsCotizaciones.findIndex(a => a.ITEM === key);
              this.DItemsCotizaciones.splice(index, 1);
            });
            this.rowDelete = false;
            this.filasSelecc = [];
            this.gridItemsCotizaciones.instance.deselectAll();
            this.onRespuestaItems.emit({ operacion: 'datos', data: this.DItemsCotizaciones });
            setTimeout(() => {
              this.gridItemsCotizaciones.instance.refresh();
              this.gridItemsCotizaciones.instance.repaint();
            }, 300);
          }
        });
        break;

      default:
        break;
    }
  }

  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj == 'productos' || obj == 'todos') {
      const prm = { };
      const accion = 'PRODUCTOS COTIZACIONES';
      this._sdatos.consulta(accion, prm, 'BAN-012').subscribe((data: any) => {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        // this.DProductos = res;
        this.DProductosLista = JSON.parse(JSON.stringify(res));  
        this.DProductos = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });
      });
    }

    if (obj == 'proveedores' || obj == 'todos') {
      const prm = { };
      const accion = 'PROVEEDORES';
      this._sdatos.consulta(accion, prm, 'BAN-012').subscribe((data: any) => {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        // this.DProductos = res;
        this.DProveedoresLista = JSON.parse(JSON.stringify(res));  
        this.DProveedores = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });
      });
    }

    if (obj === 'consulta') {
      const prm = { DOCUMENTO: opcion };
      this._sdatos.consulta('items factura masiva', prm, 'HOR-004').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DItemsCotizaciones = res;
      });
    }

    if (obj === 'consulta items') {
      const prm = { ID_DOCUMENTO: "COT", CONSECUTIVO: 7000}
      this._sdatos.consulta('consulta items', prm, "BAN-011").subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DItemsCotizaciones = res;
      });
    }

    if (obj === 'UDM' || obj === 'todos') {
      const prm = { };
      this._sdatos.consulta('UNIDADES MEDIDA', prm, 'BAN-002').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DListaUDM = res;
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
