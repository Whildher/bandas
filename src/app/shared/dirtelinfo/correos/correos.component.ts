import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { clsEmail } from '../clsDirTeInfo.class';
import { Observable, Subject, Subscription, lastValueFrom } from 'rxjs';
import { DirtelinfoService } from '../dirtelinfo.service';
import { showToast } from '../../toast/toastComponent.js';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-correos',
  templateUrl: './correos.component.html',
  styleUrls: ['./correos.component.css'],
  standalone: true,
  imports: [ DxDataGridModule, CommonModule, DxButtonModule, DxTextBoxModule, DxValidatorModule ]
})
export class CorreosComponent {

  @ViewChild("gridEmails", { static: false }) gridEmails: DxDataGridComponent;

  DEmail: clsEmail[] = [];
  esEdicion: boolean = false;
  esVisibleSelecc: string = 'none';
  esInicioDatos: boolean = false;
  esCreacion: boolean = false;
  esInicioObj: any;
  iniEdicion: boolean = false;
  focusedRowIndex: number;
  focusedRowKey: string;
  msgValidacion: string;
  filaValida: boolean = false;

  // Operaciones de grid
  rowNew: boolean = true;
  rowEdit: boolean = false;
  rowDelete: boolean = false;
  rowSave: boolean = false;
  rowApplyChanges: boolean = false;
  filasSelecc: any[] = [];
  esNuevaFila: boolean = false;
  numeroFila: number;
  ltool: any;

  private eventsSubscription: Subscription;
  eventsSubjectSbox: Subject<any> = new Subject<any>();

  @Input() events: Observable<any>;

  @Output() onGuardarCambios: EventEmitter<any> = new EventEmitter<any>;

  constructor( private _sdatos: DirtelinfoService,
               private httpClient: HttpClient
             ) 
  {
    this.valideEmail = this.valideEmail.bind(this);
    this.insertedRow = this.insertedRow.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
  }

  initNewRow(e){
    e.data.ITEM = 0;
    e.data.EMAIL = '';
    e.data.ETIQUETA = '';
    if (this.DEmail.length > 0) {
      const item = this.DEmail.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act}) 
      e.data.ITEM = item.ITEM + 1;
    }
    else {
      e.data.ITEM = 1;
    }
    e.data.isEdit = true;
    this.numeroFila = e.data.ITEM;
  }

  insertedRow(e){
    this.rowApplyChanges = false;
    this.esVisibleSelecc = 'always';
    this.rowNew = true;
    e.data.isEdit = false;
    this.onGuardarCambios.emit(this.DEmail);
  }

  insertingRow(e) {
    e.data.isEdit = true;
    // Valida datos
    if (e.data.EMAIL === '' || e.data.ETIQUETA === ''){
      showToast('Faltan completar datos del Correo', 'warning');
      e.cancel = true;
    }
  }

  updatedRow(e){
    this.rowApplyChanges = false;
    this.esVisibleSelecc = 'always';
    this.rowNew = true;
    e.data.isEdit = false;
    this.onGuardarCambios.emit(this.DEmail);
  }

  updatingRow(e) {
    if (e.oldData === undefined)
      return;
    e.oldData.isEdit = true;
  }
  onEditingStart(e) {
    // if (this.numeroFila === e.data.ITEM) {
      // this.esVisibleSelecc = 'none';
      // this.rowApplyChanges = true;
      // this.rowNew = false;
      // e.data.isEdit = true;
    // }
  }
  onCellClick(e) {
    this.numeroFila = e.data.ITEM;
    this.esVisibleSelecc = 'none';
    this.rowApplyChanges = true;
    this.rowNew = false;
    e.data.isEdit = true;
  }
  onEditorPreparing(e) {
  }
  onCellPrepared(e) {
  }
  onToolbarPreparingGrid(e: any) {
    let toolbarItems = e.toolbarOptions.items;
    e.toolbarOptions.items.unshift(
      {
        location: 'before'
      }
    );
  }
  removedRow(e) {
    this.rowApplyChanges = false;
    this.onGuardarCambios.emit(this.DEmail);
  }
  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.isEdit) {
				// e.rowElement.style.backgroundColor = 'lightyellow';
				const className:string = e.rowElement.className;
				e.rowElement.className = className +' row-modified-focused';
			}
      if (e.data.isEdit) 
        {
          // this.esVisibleSelecc = 'none';
        }
    }
    if (e.rowType === "header" && e.rowIndex === 2 && !this.esEdicion) {
      e.rowElement.style.display = "none";
    }
  }
  onRowValidating(e: any) {
    // Valida completitud
    var errMsg = '';
    if (e.newData.EMAIL !== undefined && e.newData.EMAIL == '') 
      errMsg = 'Falta registrar un email';
    if (e.newData.ETIQUETA !== undefined && e.newData.ETIQUETA == "") 
      errMsg = 'Falta asignar una etiqueta';
    if (errMsg !== '') {
      e.isValid = false;
      showToast(errMsg, 'warning');
      return;
    }
  }
  onContentReady(e) {  
    e.component.columnOption("command:edit", "visible", false);  
  }
  onFocusedRowChanged(e){
  }
  onEditCanceled(e) {
    this.esVisibleSelecc = 'always';
    this.rowApplyChanges = false;
    this.rowNew = true;
  }
  onCellHoverChanged(e) {
  }
  selectionGrid(e) {
    this.filasSelecc = e.selectedRowKeys;
    if (this.filasSelecc.length != 0)
      this.rowDelete = true;
    else
      this.rowDelete = false;
  }

  valideEmail(params) {
    var ret: boolean = true;
    this.filaValida = true;
    const EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    this.msgValidacion = ""
    if (params.value !== '' && (params.value.length <= 5 || !EMAIL_REGEXP.test(params.value))) {
      this.msgValidacion = "Email inválido"
      ret = false;  
      this.filaValida = false;
    }  

    // Valida si está ya registrado
    const ix = this.DEmail.findIndex(e => e.EMAIL === params.value && e.ITEM !== params.data.ITEM);
    if (ix !== -1) {
      this.msgValidacion = "Email ya está registrado"
      this.filaValida = false;
      ret = false;  
    }
    return ret;

  }

  operGrid(e, operacion) {
    switch (operacion) {
      case 'new':
        this.gridEmails.instance.addRow();
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
        if (this.filaValida) {
          this.gridEmails.instance.saveEditData();
          this.rowApplyChanges = false;
          this.rowNew = true;
          this.esVisibleSelecc = 'always';
        }
        else {
          showToast('Hay errores de datos del email!','error');
        }
        break;
      case 'cancel':
        this.gridEmails.instance.cancelEditData();
        this.rowApplyChanges = false;
        this.esVisibleSelecc = 'always';
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
              const index = this.DEmail.findIndex(a => a.ITEM === key);
              this.DEmail.splice(index, 1);
            });
            this.gridEmails.instance.refresh();
          }
        });
        break;

      default:
        break;
    }
  }

  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined) {

    if (obj == 'correos' || obj == 'todos') {
      const prm = { TIPO_UBICACION : 'Ciudad' };
      this._sdatos
        .consulta('correos', prm, "ADM-006")
        .subscribe((data: any) => {
          const res = JSON.parse(data.data);
          if ( (data.token != undefined) ){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.DEmail = res;
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
    this.eventsSubscription = this.events.subscribe((datos: any) => {
      switch (datos.operacion) {
        case 'nuevo':
          this.DEmail = [];
          break;
      
        case 'consulta':
          this.DEmail = datos.dataSource;
          break;
          
        default:
          break;
      }
      this.activarEdicion(datos.operacion);
    });

  }
  ngAfterViewInit(): void {   

  }
  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  showModal(mensaje: any, titulo = '¡Error!', msg_html= '') {
    const tipo = titulo;
		Swal.fire({
			iconHtml: "<i class='icon-cancelar-ol error-color'></i>",
      confirmButtonColor: tipo==='Error' ? 'DF3E3E':'#0F4C81 !important',
			title: titulo,
			text: mensaje,
			allowOutsideClick: true,
			allowEscapeKey: false,
			allowEnterKey: false,
			backdrop: true,
			position: 'center',
			stopKeydownPropagation: false,
		});
	}


}
