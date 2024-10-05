import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DxButtonGroupModule, DxButtonModule, DxCalendarModule, DxCheckBoxComponent, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxDropDownBoxComponent, DxDropDownBoxModule, DxDropDownButtonModule, DxFormModule, DxListComponent, DxListModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxScrollViewModule, DxSelectBoxModule, DxSwitchModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxTooltipModule, DxTreeListComponent, DxTreeListModule, DxValidatorModule } from 'devextreme-angular';
import { lastValueFrom, Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { validatorRes } from 'src/app/shared/validator/validator.js';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import {MatChipsModule} from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { clsBarraRegistro } from 'src/app/containers/regbarra/_clsBarraReg';
import { GES_INFOComponent } from '../GES_INFO/GES_INFO.component';
import { clsGesActividades } from 'src/app/shared/Tareas/Clase/clsGES00.class';
import { GES00Service } from '../Service/GES00.service';
import { GeneralesService } from 'src/app/services/generales/generales.service';
import { showToast } from '../../../shared/toast/toastComponent.js';
import { MatCardModule } from '@angular/material/card';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { GES001Service } from 'src/app/services/GES001/GES001.service';
import { SocketService } from 'src/app/services/socket/socket.service';


@Component({
  selector: 'GES00-COMPONENT',
  templateUrl: './GES00.component.html',
  styleUrls: ['./GES00.component.css'],
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxTagBoxModule, DxProgressBarModule, DxSelectBoxModule,
            DxDateBoxModule, DxNumberBoxModule, DxButtonModule, DxFormModule, DxTextBoxModule,
            DxTooltipModule, DxTreeListModule, MatTooltipModule, GES_INFOComponent, CdkAccordionModule,
            MatChipsModule, DxSwitchModule, DxLoadPanelModule, DxDropDownBoxModule, DxPopupModule,
            DxButtonGroupModule, DxCalendarModule, MatDividerModule, MatButtonToggleModule, DxCheckBoxModule,
            DxRadioGroupModule, DxListModule, DxValidatorModule, DxTextAreaModule, DxToolbarModule,
            MatCardModule, DxScrollViewModule, TimelineModule, CardModule, DxDropDownButtonModule
          ]
})
export class GES00Component implements OnInit {
  
  @ViewChild("TreeListTareas", { static: false }) TreeListTareas: DxTreeListComponent;
  @ViewChild("checkActivas", { static: false }) checkActivas: DxCheckBoxComponent;
  @ViewChild("checkFinalizadas", { static: false }) checkFinalizadas: DxCheckBoxComponent;
  @ViewChild("checkMisActividades", { static: false }) checkMisActividades: DxCheckBoxComponent;
  @ViewChild("checkAsignadas", { static: false }) checkAsignadas: DxCheckBoxComponent;
  @ViewChild("checkArea", { static: false }) checkArea: DxCheckBoxComponent;
  @ViewChild("checkCol", { static: false }) checkCol: DxCheckBoxComponent;
  @ViewChild("listDCargosResponsable", { static: false }) listDCargosResponsable: DxListComponent;

  @Input() APLICACION: string;
  @Input() DatosGes00: any;
  @Input() readOnly: boolean;
  @Input() Filtros: any;
  @Input() prmUsrAplBarReg: clsBarraRegistro;
  @Input() events: Observable<any>;
  @Output() DatosResponsabilidades = new EventEmitter<any>;

  subscription: Subscription;
  subscriptionLista: Subscription;
  subscriptionGesproInfo: Subscription;
  subs_tareas: Subscription;
  subs_filtros: Subscription;
  eventsSubscription: Subscription;

  DTareas: clsGesActividades [] = [];
  DResponsabilidades: any [] = [];
  DActividades: any [] = [];
  DCargosResponsable: any [] = [];
  DEventos: any [] = [];
  FTareas: any = {
    ID_ACTIVIDAD: '',
    ID_ACTIVIDAD_PADRE: '',
    ITEM: '',
    NOMBRE: '',
    ESTADO: '',
    FECHA_INICIO: '',
    FECHA_FIN: '',
    DESCRIPCION: '',
    RESPONSABLES: '',
    COLABORADORES: [],
    TIPO: '',
    PRIORIDAD: '',
    COSTO: '',
    DURACION: '',
    CLASE: '',
    FRECUENCIA: '',
    PERIODO_FRECUENCIA: '',
    PROGRAMACION: '',
    INTERVALO_FRECUENCIA: '',
    SUB_TAREAS: [],
    ARCHIVOS: [],
    REPETIR: false,
    TODO_DIA: false,
    ANULADO: false,
    readOnlyFechaInicio: false,
    readOnlyFechaFinal: false,
    readOnlyRepetir: false,
  };
  DataResTareas: clsGesActividades [] = [];
  actividadSeleccionada: clsGesActividades;
  actividadSeleccionada_prev: any;
  DColaboradores: any[] = [];
  listPrioridad: any = ['Inmediato', 'Alta', 'Media', 'Baja'];
  diasSemana:any = [
    { DIA: 'Domingo', COD: 'DOM', hint: 'Domingo' },
    { DIA: 'Lunes', COD: 'LUN', hint: 'Lunes' },
    { DIA: 'Martes', COD: 'MAR', hint: 'Martes' },
    { DIA: 'Miercoles', COD: 'MIÉ', hint: 'Miercoles' },
    { DIA: 'Jueves', COD: 'JUE', hint: 'Jueves' },
    { DIA: 'Viernes', COD: 'VIE', hint: 'Viernes' },
    { DIA: 'Sabado', COD: 'SÁB', hint: 'Sabado' }
  ];
  itemsFiltroHistorico: any [] = [
    { value: 'Todo', name: 'Todo' },
    { value: 'Historico', name: 'Historico' },
    { value: 'Novedades', name: 'Novedades' }
  ];
  minDateValue: Date;
  now: Date = new Date();
  rootValue: number;
  readOnlyRepetir: boolean = true;
  readOnlyTodoDia: boolean = true;
  readOnlyBtnCada: boolean = true;
  readOnlyProgramar: boolean = true;
  readOnlyFrecuencia: boolean = true;
  readOnlyResponsables: boolean = true;
  groupedResponsables: boolean = false;
  openedResponsables: boolean = false;
  visibleGridColaboradores: boolean = false;
  visiblePopupCell: boolean = false;
  activeAcordeonHistorico: boolean = false;
  activeAcordeonSubTareas: boolean = false;
  disabledBtnAceptarTarea: boolean = false;
  MOFiltros: boolean = true;
  positionOf: string = '';
  typeDateTime: string = 'datetime';
  heightPopupFechasTareas: any = '260px';
  widthPopupFechasTareas: any = '320px';
  widthDropDownOptions: any = '300px';
  DResponsables: any = [];
  DCargos: DataSource;
  DLEstados: any = [];
  DTareasUpdate: any = [];
  DResponsabilidadesUpdate: any = [];
  data: any;
  RFechas: UntypedFormGroup;
  USUARIO_LOCAL: any = '';
  dataConfigCargosResponsables:any = '';
  valueRadioResponsables: any = '';
  visiblebtnComentarios: boolean;
  toolTipVisible: boolean = false;
  activeSelectCargo: boolean = false;
  activeConfigCargosResponsables: boolean = false;
  visiblePopupFechas: boolean = false;
  visibleItemsFechasMovil: boolean = false;
  visiblePopupEditarTareas: boolean = false;
  loadingVisible: boolean = false;
  autoExpandAllTareas: boolean = true;
  autoExpandAllRes: boolean = true;
  targetIdTooltip: string;
  tooltipText: string;
  activeIconPerfil: boolean = false;
  iconNameUser: String;
  UM_DURACION: string;
  periodoSeleccionado: string = '';
  titleActividadSeleccionada: string = '';
  modoSelecionFrecuencia: string = '';
  cargosResponsable: any = [];
  ID_GESTION: any;
  CLASE_TAREAS: string;
  readOnlyFechasTareas: boolean = false;
  readOnlyFechasResponsabilidades: boolean = false;
  CONSECUTIVO: any = '';
  conCambios: number = 0;
  container: any;
  TPROGRAMACION: string = '';
  dataEditFila: any;
  visibleClase: boolean = false;
  numDiasMes: any[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
  mesAno: any[] = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  filtroSecciones: any[] = [
    { ID_FILTRO: 'Mis actividades', VALUE: true },
    { ID_FILTRO: 'Asignadas', VALUE: false },
    { ID_FILTRO: 'Colaborador', VALUE: false },
    { ID_FILTRO: 'Finalizadas', VALUE: false }
  ];
  filtroMaestro: any = [
    {ID: 1, DESCRIPCION: 'Activas', VALOR: false },
    {ID: 2, DESCRIPCION: 'Finalizadas', VALOR: false }
  ];
  filtroActividades: any = [false,false,false,false];
  valorDef: string;
  grupos:any = ['Responsabilidades', 'Tareas', 'Eventos'];
  itemsRegistroTareas:any = ['Información de Actividad', 'Sub tareas', 'Histórico de novedades y chat'];
  itemsFilters:any = [
    {ITEM: 1, ID_FILTRO:'MIS_ACTIVIDADES', DESCRIPCION: 'Mis Actividades'},
    {ITEM: 2, ID_FILTRO:'ASIGNADAS', DESCRIPCION: 'Asignadas'},
    {ITEM: 3, ID_FILTRO:'AREA_FUNCIONAL', DESCRIPCION: 'Por área'},
    {ITEM: 4, ID_FILTRO:'COLABORADOR', DESCRIPCION: 'Colaborador'}
  ];
  accordionExpand = [false,false,false];
  accordionPopupMovilExpand = [true,false,false];
  dropDownButton: any;
  selectFiltroHistorico: string = 'Novedades';
  accionInMovil: string = '';
  DTimeline: any[];
  eventosHistorico: any[];
  mesajeTextHistorico: string = '';
  focusedRowIndex: any = [];
  titleActividadCargo:any = '';
  targetData:any = '';
  sourceData:any = '';

  // Operaciones de Treelist
  rowNew: boolean = true;
  rowEdit: boolean = false;
  // rowDelete: boolean = false;
  rowSave: boolean = false;
  rowApplyChanges: boolean = false;
  filasSeleccResponsabilidades: any = [];
  filasSeleccTareas: any = [];
  dataTarea_prev:any = {};
  filasSeleccActividades: any = [];
  filasSeleccData: any;
  selectProfileSettings: any;
  esEdicionFila: boolean = false;
  activeToolbar: boolean = false;
  activeEditing: boolean = false;
  activeAdding: boolean = false;
  agruparCargos: boolean = false;
  openDropResponsablesMovil: boolean = false;


  constructor(
    private _sDatos: GES001Service,
    private _sdatos: GES00Service,
    private _sgenerales: GeneralesService,
    public datepipe: DatePipe,
    public socket: SocketService
  ) {
    this.subscriptionLista = this._sdatos
    .getObsActividades().subscribe((data:any) => {
      switch (data.accion) {
        case 'new':
          if ( this.APLICACION === 'GES-003') {
            this.readOnly = data.readOnly;
            this.visiblebtnComentarios = !data.readOnly;
            this.activeToolbar = !data.readOnly;
            this.activeEditing = !data.readOnly;
            this.activeAdding = !data.readOnly;
            const NODO:any = this.DTareas.filter((d:any) => d.ID_ACTIVIDAD === -20);
            this.DTareas = NODO;
            // for (let i = 0; i < this.DTareas.length; i++) {
            //   if(this.DTareas[i].ID_ACTIVIDAD !== -20)
            //     this.DTareas.splice(i, 1);
            // }
            this.TreeListTareas.instance.refresh();
          }
          break;

        case 'copiar':
          if ( this.APLICACION === 'GES-003') {
            this.readOnly = data.readOnly;
            this.visiblebtnComentarios = !data.readOnly;
            this.activeToolbar = !data.readOnly;
            this.activeEditing = !data.readOnly;
            this.activeAdding = !data.readOnly;
          }
          this.TreeListTareas.instance.refresh();
          break;

        case 'cargar datos':
          this.opRefrescar(data);
          break;

        case 'r_refrescar':
          const prm:any = { ID_RESPONSABLE: this.USUARIO_LOCAL };
          this.valoresObjetos('actividades', prm, 'r_refrescar');
          this.valoresObjetos('responsables', '', 'r_refrescar');
          this.esEdicionFila = false;
          break;

        case 'update':
          if ( this.APLICACION === 'GES-003') {
            this.readOnly = data.readOnly;
            this.visiblebtnComentarios = !data.readOnly;
            this.activeToolbar = !data.readOnly;
            this.activeEditing = !data.readOnly;
            this.activeAdding = !data.readOnly;
          }
          // this.opPrepararUpdate(data);
          break;

        case 'cancelar':
          if ( this.APLICACION === 'GES-003') {
            this.readOnly = data.readOnly;
            this.activeToolbar = !data.readOnly;
            this.activeEditing = !data.readOnly;
            this.activeAdding = !data.readOnly;
            const NODO:any = this.DTareas.filter((d:any) => d.ID_ACTIVIDAD === -20);
            this.DTareas = NODO;
            // for (let i = 0; i < this.DTareas.length; i++) {
            //   if(this.DTareas[i].ID_ACTIVIDAD !== -20)
            //     this.DTareas.splice(i, 1);
            // }
            this.TreeListTareas.instance.refresh();
          }
          break;

        case 'blanquear forma':
          this.opBlanquearForma();
          break;
      
        default:
          break;
      }
    });

    this.subs_filtros = this._sDatos
    .getObsFiltros().subscribe((data:any) => {
      switch (data.accion) {
        case 'filtrar':
          this.filtroMaestro = data.filtroMaestro;
          this.filtroActividades = data.filtroActividades;
          this.onValueChangedFiltro(data);
          break;
      
        default:
          break;
      }
    });

    this.subscriptionGesproInfo = this._sdatos
    .getObsGesproInfo().subscribe((data) => {
    });

    this.onCellPrepared = this.onCellPrepared.bind(this);
    this.onRowValidating = this.onRowValidating.bind(this);
    this.initNewRow = this.initNewRow.bind(this);
    this.adicionarFila = this.adicionarFila.bind(this);
    this.valoresObjetos = this.valoresObjetos.bind(this);
    this.saveState = this.saveState.bind(this);
    this.loadState = this.loadState.bind(this);
    this.onDragChange = this.onDragChange.bind(this);
    this.onReorder = this.onReorder.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onValueChangedNombre = this.onValueChangedNombre.bind(this);
    this.toggleToolTip = this.toggleToolTip.bind(this);
    this.ondblclickCard = this.ondblclickCard.bind(this);
    this.onSelectionChangedFiltroHistorico = this.onSelectionChangedFiltroHistorico.bind(this);
    this.onValueChangedFiltro = this.onValueChangedFiltro.bind(this);
    this.orderHeaderFilter = this.orderHeaderFilter.bind(this);

    this.container = document.getElementById('container-body');
    this.minDateValue = new Date(this.now.getTime() - 1000 * 60 * 60);
  }

  ngOnInit(): void {
    this.USUARIO_LOCAL = localStorage.getItem('usuario')?.toUpperCase();
    this.filasSeleccData = '';
    this.opConfigurarComponente();
  }

  ngOnDestroy() {
    this.subscriptionLista.unsubscribe();
    this.subscriptionGesproInfo.unsubscribe();
  }

  onInitializedBtnFilter = (e:any) => {
    this.dropDownButton = e.component;
  };

  opBlanquearForma() {
    this.DTareas = [];
    this.TreeListTareas.instance.refresh();
  }

  onDragChange(e: any) {
    const visibleRows = e.component.getVisibleRows();
    const sourceNode = e.component.getNodeByKey(e.itemData.ID_ACTIVIDAD);
    let targetNode = visibleRows[e.toIndex].node;
    if (sourceNode === undefined) return;

    switch (sourceNode.data.CLASE) {
      case 'RESPONSABILIDADES':
        if( (targetNode.data.CLASE === 'TAREAS') || (targetNode.data.CLASE === 'EVENTOS') || (targetNode.data.CLASE === 'NODOS') ) {
          showToast('Las Responsabilidades solo pueden interactuar entre si.', 'warning');
          e.cancel = true;
          return;
        }
        break;

      case 'TAREAS':
        // if(targetNode.data.CLASE === 'EVENTOS') {
        //   showToast('Las Tareas no pueden moverse a Eventos', 'error');
        //   e.cancel = true;
        //   return;
        // }
        break;

      case 'EVENTOS':
        if( (targetNode.data.CLASE === 'RESPONSABILIDADES') || (targetNode.data.CLASE === 'EVENTOS') || (targetNode.data.CLASE === 'NODOS') ) {
          showToast('Los Eventos solo se pueden mover a Tareas.', 'warning');
          e.cancel = true;
          return;
        }
        break;
    
      default:
        break;
    }

    while (targetNode && targetNode.data) {
      if (targetNode.data.ID_ACTIVIDAD === sourceNode.data.ID_ACTIVIDAD) {
        e.cancel = true;
        break;
      }
      targetNode = targetNode.parent;
    }
  }
  
  onReorder(e: any) {
    const visibleRows = e.component.getVisibleRows();
    const sourceNode = e.component.getNodeByKey(e.itemData.ID_ACTIVIDAD);
    let targetNode = visibleRows[e.toIndex].node;
    
    if(this.APLICACION === 'GES-003') {
      if(!this.readOnly) {
        if (e.dropInsideItem) {
          e.itemData.ID_ACTIVIDAD_PADRE = visibleRows[e.toIndex].key;
          e.component.refresh();
        } else {
          const sourceData = e.itemData;
          const toIndex = e.fromIndex > e.toIndex ? e.toIndex - 1 : e.toIndex;
          let targetData = toIndex >= 0 ? visibleRows[toIndex].node.data : null;
    
          if (targetData && e.component.isRowExpanded(targetData.ID_ACTIVIDAD)) {
            sourceData.ID_ACTIVIDAD_PADRE = targetData.ID_ACTIVIDAD;
            if(targetData.CLASE !== 'NODOS')
              sourceData.CLASE = targetData.CLASE;
            else {
              if(targetData.NOMBRE === 'Responsabilidades')
                sourceData.CLASE = 'RESPONSABILIDADES';
              if(targetData.NOMBRE === 'Tareas')
                sourceData.CLASE = 'TAREAS';
              if(targetData.NOMBRE === 'Eventos')
                sourceData.CLASE = 'EVENTOS';
            }
            targetData = null;
          } else {
            sourceData.ID_ACTIVIDAD_PADRE = targetData ? targetData.ID_ACTIVIDAD_PADRE : -1;
            if(targetData.CLASE !== 'NODOS')
              sourceData.CLASE = targetData.CLASE;
            else {
              if(targetData.NOMBRE === 'Responsabilidades')
                sourceData.CLASE = 'RESPONSABILIDADES';
              if(targetData.NOMBRE === 'Tareas')
                sourceData.CLASE = 'TAREAS';
              if(targetData.NOMBRE === 'Eventos')
                sourceData.CLASE = 'EVENTOS';
            }
          }
    
          const sourceIndex = this.DTareas.indexOf(sourceData.ID_ACTIVIDAD);
          this.DTareas.splice(sourceIndex, 1);
    
          const targetIndex = this.DTareas.indexOf(targetData) + 1;
          this.DTareas.splice(targetIndex, 0, sourceData);
        }
        this.conCambios++;
      } else {
        showToast('Active la Edición para permitir esta función.', 'error');
        return;
      }
    };

    if(this.APLICACION === 'GES-001') {
      if (e.dropInsideItem) {
        e.itemData.ID_ACTIVIDAD_PADRE = visibleRows[e.toIndex].key;
        e.component.refresh();
      } else {
        const sourceData = e.itemData;
        const toIndex = e.fromIndex > e.toIndex ? e.toIndex - 1 : e.toIndex;
        let targetData = toIndex >= 0 ? visibleRows[toIndex].node.data : null;

        //verifica si la actividad tiene hijas y sus responsables
        const hijas:any = this.DataResTareas.filter((d:any) => d.ID_ACTIVIDAD_PADRE === sourceData.ID_ACTIVIDAD);
        if (hijas.length > 0) {
          hijas.forEach((hija:any) => {
            const user_local:any = localStorage.getItem('usuario')?.toUpperCase();
            if (hija.RESPONSABLES.ID_RESPONSABLE !== user_local) {
              e.cancel = true;
            }
          });
          if (e.cancel) {
            Swal.fire({
              title: 'Advertencia',
              text: 'Esta actividad, tiene una Tarea hija cuyo responsable es otra persona,' +
                    ' debe modificar la jerarquía de esa Tarea para poder continuar.',
              iconHtml: "<i class='icon-alert-ol'></i>",
              showCancelButton: false,
              confirmButtonColor: '#DF3E3E',
              cancelButtonColor: '#438ef1',
              cancelButtonText: 'No',
              confirmButtonText: 'Continuar'
              }).then((result) => {
              if (result.isConfirmed) {
                this.TreeListTareas.instance.refresh();
              }
              if (result.isDismissed) {
                this.TreeListTareas.instance.refresh();
              }
            });
            return;
          }
        }

        if (targetData && e.component.isRowExpanded(targetData.ID_ACTIVIDAD)) {

          sourceData.ID_ACTIVIDAD_PADRE = targetData.ID_ACTIVIDAD;
          
          if(targetData.CLASE === 'RESPONSABILIDADES') {
            sourceData.TIPO = 'Permanente';
            sourceData.COLABORADORES = [];
          }
          if(targetData.CLASE !== 'NODOS')
            sourceData.CLASE = targetData.CLASE;
          else {
            if(targetData.NOMBRE === 'Responsabilidades')
              sourceData.CLASE = 'RESPONSABILIDADES';
            if(targetData.NOMBRE === 'Tareas')
              sourceData.CLASE = 'TAREAS';
            if(targetData.NOMBRE === 'Eventos')
              sourceData.CLASE = 'EVENTOS';
          }

          targetData = null;
        } else {
          sourceData.ID_ACTIVIDAD_PADRE = targetData ? targetData.ID_ACTIVIDAD_PADRE : -1;
          if(targetData.CLASE === 'RESPONSABILIDADES') {
            sourceData.TIPO = 'Permanente';
            sourceData.COLABORADORES = [];
          }
          if(targetData.CLASE !== 'NODOS')
            sourceData.CLASE = targetData.CLASE;
          else {
            if(targetData.NOMBRE === 'Responsabilidades')
              sourceData.CLASE = 'RESPONSABILIDADES';
            if(targetData.NOMBRE === 'Tareas')
              sourceData.CLASE = 'TAREAS';
            if(targetData.NOMBRE === 'Eventos')
              sourceData.CLASE = 'EVENTOS';
          }
        }

        const data_responsale:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === sourceData.RESPONSABLES.ID_RESPONSABLE);
        if (data_responsale[0].CARGOS.length > 0) {
          if (data_responsale[0].CARGOS.length === 1) {
            var data_responsables:any = [
              { ID_RESPONSABLE: sourceData.RESPONSABLES.ID_RESPONSABLE, TIPO: 'RESPONSABLE' },
              { ID_RESPONSABLE: data_responsale[0].CARGOS.ID_CARGO, TIPO: 'CARGO' }
            ];
            sourceData.RESPONSABLES = data_responsables;
            sourceData.TIPO = data_responsale[0].CARGOS.ID_CARGO;
          } else if (data_responsale[0].CARGOS.length > 1) {
            this.sourceData = sourceData;
            this.targetData = targetData;
            this.titleActividadCargo = 'Selecciones el cargo para la Responsabilidad seleccionada'
            this.DCargosResponsable = data_responsale[0].CARGOS;
            this.activeConfigCargosResponsables = true;
            return;
          }
        }

      }
      this.conCambios++;
      this.opPrepararGuardar(e.itemData, 'web');
    }
  }

  onDragStart(e:any) {
    if(e.itemData.CLASE === 'NODOS') {
      showToast('No puede mover este Item.', 'warning');
      e.cancel = true;
      return;
    }
  }

  onSelectionChangedCargoResponsabilidad(e:any) {
    if ((e.addedItems !== null) && (e.addedItems !== undefined) && (e.addedItems.length > 0)) {
      var data_responsables:any = [
        { ID_RESPONSABLE: this.sourceData.RESPONSABLES.ID_RESPONSABLE, TIPO: 'RESPONSABLE' },
        { ID_RESPONSABLE: e.addedItems[0].ID_CARGO, TIPO: 'CARGO' }
      ];
      this.sourceData.RESPONSABLES = data_responsables;
      this.sourceData.TIPO = e.addedItems[0].ID_CARGO;
    }
    this.conCambios++;
  }

  asignarTareaCargo(e:any) {
    this.conCambios++;
    //verifica si tiene hijas para que se apliquen los cambios
    const hijas:any = this.DataResTareas.filter((d:any) => d.ID_ACTIVIDAD_PADRE === this.sourceData.ID_ACTIVIDAD)
    if (hijas.length > 0) {
      hijas.forEach((hija:any) => {
        hija.CLASE = 'RESPONSABILIDADES';
        hija.TIPO = 'Permanente';
        hija.COLABORADORES = [];
        var data_responsables:any = [
          { ID_RESPONSABLE: hija.RESPONSABLES.ID_RESPONSABLE, TIPO: 'RESPONSABLE' },
          { ID_RESPONSABLE: this.sourceData.RESPONSABLES[1].ID_CARGO, TIPO: 'CARGO' }
        ];
        hija.RESPONSABLES = data_responsables;
        hija.TIPO = this.sourceData.RESPONSABLES[1].ID_CARGO;
        this.opPrepararGuardar(hija, 'web');
      });
    } else {
      this.opPrepararGuardar(this.sourceData, 'web');
    }
    this.activeConfigCargosResponsables = false;
    this.listDCargosResponsable.instance.unselectAll();
    this.TreeListTareas.instance.refresh();
  }

  cancelarTareaCargo(e:any) {
    this.activeConfigCargosResponsables = false;
    this.listDCargosResponsable.instance.unselectAll();
    this.sourceData = '';
    this.targetData = '';
  }

  opConfigurarComponente() {
    var datos_consolta: any;
    switch (this.APLICACION) {
      case 'GES-001':
        this.rootValue = -1;
        this.CLASE_TAREAS = 'TAREAS';
        this.readOnly = false;
        this.visiblebtnComentarios = true;
        this.visibleClase = true;
        this.activeToolbar = false;
        this.activeEditing = true;
        this.activeAdding = false;

        this.filtroMaestro = this.Filtros.filtroMaestro;
        this.filtroActividades = this.Filtros.filtroActividades;

        // this.filtroMaestro[0].VALOR = true;
        // this.filtroMaestro[1].VALOR = false;
        // this.filtroActividades = [true, false, false, false];
        datos_consolta = { 
          ID_RESPONSABLE: this.USUARIO_LOCAL
        };
        this.valoresObjetos('todos', datos_consolta, '');
        this.FTareas = {
          ID_ACTIVIDAD: '',
          ID_ACTIVIDAD_PADRE: '',
          ITEM: '',
          NOMBRE: '',
          ESTADO: '',
          FECHA_INICIO: '',
          FECHA_FIN: '',
          DESCRIPCION: '',
          RESPONSABLES: '',
          COLABORADORES: [],
          TIPO: '',
          PRIORIDAD: '',
          COSTO: '',
          DURACION: '',
          CLASE: '',
          FRECUENCIA: '',
          PERIODO_FRECUENCIA: '',
          PROGRAMACION: '',
          INTERVALO_FRECUENCIA: '',
          SUB_TAREAS: [],
          REPETIR: false,
          TODO_DIA: false,
          ANULADO: false,
          readOnlyFechaInicio: false,
          readOnlyFechaFinal: false,
          readOnlyRepetir: false,
        }
        break;

      case 'GES-003':
        this.rootValue = -20;
        this.CLASE_TAREAS = 'RESPONSABILIDADES';
        datos_consolta = { 
          ID_RESPONSABLE: this.DatosGes00.ID_CARGO
        };
        this.readOnly = true;
        this.visibleClase = false;
        this.activeToolbar = !this.readOnly;
        this.activeEditing = !this.readOnly;
        this.activeAdding = !this.readOnly;
        this.visiblebtnComentarios = !this.readOnly;
        this.valoresObjetos('actividad', '', '');
        this.valoresObjetos('responsables', '', '');
        this.valoresObjetos('estados', '', '');
        break;
    
      default:
        break;
    }
  }


  onEditingStart(e:any, tipo:string) {
    if(e.data.CLASE === 'TAREAS') {
      if(e.data.COLABORADORES.findIndex((d:any) => d.ID_RESPONSABLE === this.USUARIO_LOCAL) !== -1) {
        e.cancel = true;
        this.readOnlyResponsables = true;
        showToast('No puede modificar esta Tarea al ser solo Colaborador.', 'warning');
        return;
      } else {
        this.readOnlyResponsables = false;
        return;
      }
    };
    if(this.APLICACION === 'GES-001') {
      if(e.data.CLASE === 'NODOS') {
        e.cancel = true;
        return;
      }
      if(e.data.CLASE === 'RESPONSABILIDADES') {
        e.cancel = true;
        showToast('No puede modificar las Responsabilidades.', 'warning');
        return;
      }
    };
  }

  opRefrescar(data:any) {
    if(this.APLICACION === 'GES-003') {
      var index:number = 0;
      data.Datos.RESPONSABILIDADES.forEach((element:any) => {
        element.ITEM = index;
        element.visibleBtnComentarios = false;
        element.readOnlyResponsables = true;
        element.readOnlyTipo = true;
        if(element.PERIODO_FRECUENCIA === null || element.PERIODO_FRECUENCIA === '' || element.PERIODO_FRECUENCIA === undefined) {
          element.PERIODO_FRECUENCIA = [];
        } else {
          if (element.PERIODO_FRECUENCIA.length > 0)
            element.PERIODO_FRECUENCIA = JSON.parse(JSON.stringify(element.PERIODO_FRECUENCIA));
        }
        index += index;
        const prm:any = { data: element};
        this.setProgramacion(prm, 'web');
      });
      var NODO:any = [];
      this.DResponsables = [{ID_RESPONSABLE: data.Datos.ID_CARGO, NOMBRE: data.Datos.ID_CARGO}];
      if (this.DTareas.length > 0) {
        NODO = this.DTareas.filter((d:any) => d.ID_ACTIVIDAD === -20);
      }
      this.DTareas = data.Datos.RESPONSABILIDADES;
      if (NODO.length > 0) {
        this.DTareas = [...this.DTareas, ...NODO];
      }
      this.readOnly = data.readOnly;
      this.activeToolbar = !this.readOnly;
      this.activeEditing = !this.readOnly;
      this.visiblebtnComentarios = !this.readOnly;
      this.activeAdding = !data.readOnly;
    };
    this.TreeListTareas.instance.refresh();
  }

  loadState(obj:string): void {
    const prm:any = {
      ID_APLICACION: this.prmUsrAplBarReg.aplicacion,
      ID_USUARIO: this.USUARIO_LOCAL,
      ID_OBJETO: obj
    }
    return this.valoresObjetos("config objeto", prm, '');
  } 

  saveState = (state:any) => {
    this.sendStorageRequest('TreeListTareas', state);
  }

  orderHeaderFilter(data:any) {
    data.dataSource.postProcess = (results:any) => {
      results = [];
      this.DResponsables.forEach((item:any) => {
        results.push({
          key: item.NOMBRE,
          text: item.NOMBRE,
          value: item.NOMBRE
        });
      });
      return results;
    };
  }

  sendStorageRequest = (idObj:any, state:any) => {
    const prm:any = {
      ID_APLICACION: this.prmUsrAplBarReg.aplicacion,
      ID_USUARIO: this.USUARIO_LOCAL,
      ID_OBJETO: idObj,
      CONFIGURACION: state
    };
    this._sdatos.saveConfigObjeto('GUARDAR CONFIGURACION OBJETOS', prm).subscribe((data: any) => {
      const res = validatorRes(data);
      const mensaje = res[0].ErrMensaje;
      if (mensaje !== '') {
        showToast(mensaje, 'error');
      }
    },
      (err => {
        this._sdatos.loadingVisible = false;
        this.showModal(err.message, 'error');
      })
    );
  }

  // Deduce cual es la actividad padre
  activpadre(id_activ): string {
    let vret = "";
    let dact = this.DTareas.filter(ac => ac.ID_ACTIVIDAD === id_activ);
    while (dact !== undefined) {
        if (dact[0].ID_ACTIVIDAD === -10) vret = "TAREAS";
        if (dact[0].ID_ACTIVIDAD === -20) vret = "RESPONSABILIDADES";
        if (dact[0].ID_ACTIVIDAD === -30) vret = "EVENTOS";
        if (vret !== "") {
          break;
        }
        else {
          dact = this.DTareas.filter(ac => ac.ID_ACTIVIDAD === dact[0].ID_ACTIVIDAD_PADRE);
        }
    }
    return vret;
  }

  initNewRow(e:any, tipo:string) {
    e.data.NOMBRE = '';
    e.data.DESCRIPCION = '';
    e.data.COLABORADORES = [];
    e.data.ESTADO = 'Sin Iniciar';
    e.data.PRIORIDAD = '';
    e.data.FRECUENCIA = '';
    e.data.PERIODO_FRECUENCIA = '';
    e.data.INTERVALO_FRECUENCIA = 0;
    e.data.COSTO = 0;
    e.data.TODO_DIA = false;
    e.data.ANULADO = false;
    e.data.PROGRAMACION = '';
    e.data.ARCHIVOS = [];

    e.data.ACT_MIAS = false;
    e.data.ACT_ASIG = false;
    e.data.ACT_AREA = false;
    e.data.ACT_COLAB = false;
    e.data.visibleBtnComentarios = false;
    this.esEdicionFila = true;
    this.valueRadioResponsables = '';

    if (this.CLASE_TAREAS === 'TAREAS') {
      e.data.CLASE = 'TAREAS';
      e.data.RESPONSABLES = '';
      e.data.FECHA_INICIO = new Date();
      e.data.FECHA_FIN = new Date();
      e.data.REPETIR = false;
      e.data.readOnlyResponsables = false;
      e.data.readOnlyRepetir = false;
      e.data.readOnlyFechaInicio = false;
      e.data.readOnlyFechaFinal = false;
    };
    if (this.CLASE_TAREAS === 'EVENTOS') {
      e.data.CLASE = 'EVENTOS';
      e.data.RESPONSABLES = this.USUARIO_LOCAL;
      e.data.FECHA_INICIO = new Date();
      e.data.FECHA_FIN = new Date();
      e.data.readOnlyResponsables = true;
      e.data.REPETIR = false;
      e.data.readOnlyRepetir = false;
      e.data.readOnlyFechaInicio = false;
      e.data.readOnlyFechaFinal = false;
    };
    // if (this.DTareas.length > 0) {
    //   const item = this.DTareas.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act});
    //   e.data.ITEM = item.ITEM + 1;
    // } else {
    //   e.data.ITEM = 1;
    // };
    
    if(this.APLICACION === 'GES-001') {
      // const apiRest = this._sdatos.getConsecutivo('CONSECUTIVO', '');
      // const resConsec = await lastValueFrom(apiRest, {defaultValue: true});
      // const res = validatorRes(resConsec.data);
      // if(res[0].ErrMensaje !== '') {
      //   showToast(res[0].ErrMensaje, 'error');
      //   this.TreeListTareas.instance.cancelEditData();
      // };
      // this.CONSECUTIVO = res[0].CONSECUTIVO;
      // e.data.ID_ACTIVIDAD = this.CONSECUTIVO;
      const item = this.DTareas.reduce((ant, act)=>{return (ant.ID_ACTIVIDAD > act.ID_ACTIVIDAD) ? ant : act}) 
      this.CONSECUTIVO = item.ID_ACTIVIDAD+1;
      e.data.ID_ACTIVIDAD = this.CONSECUTIVO;

      e.data.RESPONSABLES = '';
      e.data.readOnlyTipo = false;
      this.readOnlyTodoDia = false;
      this.readOnlyRepetir = false;
      this.readOnlyFrecuencia = false;
    };
     
    if(this.APLICACION === 'GES-003') {
      if (this.DTareas.length > 0) {
        const item = this.DTareas.reduce((ant, act)=>{return (ant.ID_ACTIVIDAD > act.ID_ACTIVIDAD) ? ant : act}) 
        e.data.ID_ACTIVIDAD = item.ID_ACTIVIDAD + 1;
      } else {
        e.data.ID_ACTIVIDAD = 1;
      }
      // const apiRest = this._sdatos.getConsecutivo('CONSECUTIVO', '');
      // const resConsec = await lastValueFrom(apiRest, {defaultValue: true});
      // const res = validatorRes(resConsec.data);
      // if(res[0].ErrMensaje !== '') {
      //   showToast(res[0].ErrMensaje, 'error');
      //   this.TreeListTareas.instance.cancelEditData();
      // };
      // this.CONSECUTIVO = res[0].CONSECUTIVO;
      // e.data.ID_ACTIVIDAD = this.CONSECUTIVO;

      this.DResponsables = [{
        ID_RESPONSABLE: this.DatosGes00.ID_CARGO,
        NOMBRE: this.DatosGes00.NOMBRE
      }];
      e.data.CLASE = 'RESPONSABILIDADES';
      e.data.TEMP = 0;
      e.data.FECHA_INICIO = null;
      e.data.FECHA_FIN = null;
      e.data.REPETIR = true;
      e.data.RESPONSABLES = this.DResponsables;
      e.data.TIPO = this.DatosGes00.ID_CARGO;
      e.data.readOnlyTipo = true;
      e.data.readOnlyResponsables = false;
      e.data.readOnlyRepetir = true;
      e.data.readOnlyFechaInicio = true;
      e.data.readOnlyFechaFinal = true;
      this.readOnlyFrecuencia = false;
      this.readOnlyTodoDia = false;
      this.readOnlyRepetir = true;
    };

    this.filasSeleccData = e;
  }

  opPrepararUpdate(data:any) {
    this.DTareasUpdate = [data.NEW_DATA];
    // const npos:any = this.DTareas.findIndex((d:any) => d.ID_ACTIVIDAD === data.NEW_DATA.ID_ACTIVIDAD);
    // this.DTareas[npos] = data.NEW_DATA;
    // this.conCambios++;
    // this.opPrepararGuardar(data.NEW_DATA);
  }

  onCellHoverChanged(e:any, tipo:string) {
    if(!this.readOnly) {
      if(e.data !== null && e.data !== undefined && e.data !== '') {
        const box1:any = document.getElementById('txtNombre'+e.data.ITEM);
        const box2:any = document.getElementById('containerBtnNuevoTarea'+e.data.ITEM);
        if (box1 !== null && box2 !== null) {
          if(e.data.CLASE === 'NODOS') {
            e.data.visibleBtnComentarios = false;
            if(e.data.NOMBRE === 'Responsabilidades') {
              if(this.APLICACION === 'GES-003') {
                box1.style.transform = 'translateX(0px)';
                box2.style.opacity = '1';
                this.DTareas.forEach((ele:any) => {
                  if (ele.ITEM !== e.data.ITEM) {
                    const box1:any = document.getElementById('txtNombre'+ele.ITEM);
                    const box2:any = document.getElementById('containerBtnNuevoTarea'+ele.ITEM);
                    if(box1 !== null && box1 !== undefined) {
                      if(box1.style !== null && box1.style !== undefined) {
                        if(box1.style.transform === 'translateX(0px)') {
                          box1.style.transform = 'translateX(-25px)';
                          box2.style.opacity = '0';
                        }
                      }
                    }
                  }
                });
              }
            } else if(e.data.NOMBRE === 'Tareas' || e.data.NOMBRE === 'Eventos') {
              box1.style.transform = 'translateX(0px)';
                box2.style.opacity = '1';
                this.DTareas.forEach((ele:any) => {
                  if (ele.ITEM !== e.data.ITEM) {
                    const box1:any = document.getElementById('txtNombre'+ele.ITEM);
                    const box2:any = document.getElementById('containerBtnNuevoTarea'+ele.ITEM);
                    if(box1 !== null && box1 !== undefined) {
                      if(box1.style !== null && box1.style !== undefined) {
                        if(box1.style.transform === 'translateX(0px)') {
                          box1.style.transform = 'translateX(-25px)';
                          box2.style.opacity = '0';
                        }
                      }
                    }
                  }
                });
            }
          } else if(e.data.CLASE === 'RESPONSABILIDADES') {
            // if( (this.filasSeleccData !== '') && (this.filasSeleccData.data.ITEM === e.data.ITEM) ) {
            //   e.data.visibleBtnComentarios = !e.data.visibleBtnComentarios;
            // } else {
            //   e.data.visibleBtnComentarios = !e.data.visibleBtnComentarios;
            // }
            // e.data.visibleBtnComentarios = !e.data.visibleBtnComentarios;
             
          } else if(e.data.CLASE === 'EVENTOS') {
            e.data.visibleBtnComentarios = !e.data.visibleBtnComentarios;
          } else {
            if( (this.filasSeleccData !== '') && (this.filasSeleccData.data.ITEM === e.data.ITEM) ) {
              e.data.visibleBtnComentarios = true;
            } else {
              box1.style.transform = 'translateX(0px)';
              box2.style.opacity = '1';
              this.DTareas.forEach((ele:any) => {
                if (ele.ITEM !== e.data.ITEM) {
                  const box1:any = document.getElementById('txtNombre'+ele.ITEM);
                  const box2:any = document.getElementById('containerBtnNuevoTarea'+ele.ITEM);
                  if(box1 !== null && box1 !== undefined) {
                    if(box1.style !== null && box1.style !== undefined) {
                      if(box1.style.transform === 'translateX(0px)') {
                        box1.style.transform = 'translateX(-25px)';
                        box2.style.opacity = '0';
                      }
                    }
                  }
                }
              });
              e.data.visibleBtnComentarios = !e.data.visibleBtnComentarios;
            }
          }
  
          this.DTareas.forEach((ele:any) => {
            if (ele.ITEM !== e.data.ITEM) {
              const box1:any = document.getElementById('txtNombre'+ele.ITEM);
              const box2:any = document.getElementById('containerBtnNuevoTarea'+ele.ITEM);
              if(box1 !== null && box1 !== undefined) {
                if(box1.style !== null && box1.style !== undefined) {
                  if(box1.style.transform === 'translateX(0px)') {
                    box1.style.transform = 'translateX(-25px)';
                    box2.style.opacity = '0';
                  }
                }
              }
            }
          });          
        }
      }

    }
  }

  onValueChangedFiltro(e:any) {
    this.loadingVisible = true;
    this.DTareas = [];
    this.DResponsabilidades = [];
    this.DActividades = [];
    this.DEventos = [];

    const Nodos:any = JSON.parse(JSON.stringify(this.DataResTareas.filter((d:any) => d.CLASE === 'NODOS')));

    //APLICA EL FILTRO MAESTRO
    var DMaestro = JSON.parse(JSON.stringify(this.DataResTareas.filter((d:any) => d.CLASE !== 'NODOS')));
    if (this.filtroMaestro[0].VALOR && !this.filtroMaestro[1].VALOR)
      DMaestro = JSON.parse(JSON.stringify(DMaestro.filter((d:any) => d.ESTADO !== 'FINALIZADO')));
    if (!this.filtroMaestro[0].VALOR && this.filtroMaestro[1].VALOR)
      DMaestro = JSON.parse(JSON.stringify(DMaestro.filter((d:any) => d.ESTADO === 'FINALIZADO')));

    //SE APLICA LOS SUB-FILTROS
    let DFiltrados:any = [];
    if(this.filtroActividades[0]) {
      const misAct:any = JSON.parse(JSON.stringify(DMaestro.filter((d:any) => d.ACT_MIAS === true)));
      for (let i = 0; i < misAct.length; i++) {
        if(DFiltrados.findIndex((a:any) => a.ID_ACTIVIDAD === misAct[i].ID_ACTIVIDAD) === -1)
          DFiltrados.push(misAct[i]);
      }
    }
    if(this.filtroActividades[1]) {
      const asig:any = JSON.parse(JSON.stringify(DMaestro.filter((d:any) => d.ACT_ASIG === true)));
      for (let i = 0; i < asig.length; i++) {
        if(DFiltrados.findIndex((a:any) => a.ID_ACTIVIDAD === asig[i].ID_ACTIVIDAD) === -1)
          DFiltrados.push(asig[i]);
      }
    }
    if(this.filtroActividades[2]) {
      const Area:any = JSON.parse(JSON.stringify(DMaestro.filter((d:any) => d.ACT_AREA === true)));
      for (let i = 0; i < Area.length; i++) {
        if(DFiltrados.findIndex((a:any) => a.ID_ACTIVIDAD === Area[i].ID_ACTIVIDAD) === -1)
          DFiltrados.push(Area[i]);
      }

    }
    if(this.filtroActividades[3]) {
      const col:any = JSON.parse(JSON.stringify(DMaestro.filter((d:any) => d.ACT_COLAB === true)));
      for (let i = 0; i < col.length; i++) {
        if(DFiltrados.findIndex((a:any) => a.ID_ACTIVIDAD === col[i].ID_ACTIVIDAD) === -1)
          DFiltrados.push(col[i]);
      }
    }

    DFiltrados.forEach((tarea:any) => {
      if (DFiltrados.findIndex((d:any) => tarea.ID_ACTIVIDAD_PADRE === d.ID_ACTIVIDAD ) === -1 ) {
        if ( tarea.CLASE === 'TAREAS'){
          tarea.TEMP = tarea.ID_ACTIVIDAD_PADRE;
          tarea.ID_ACTIVIDAD_PADRE = -10;
        };
        if ( tarea.CLASE === 'RESPONSABILIDADES'){
          tarea.TEMP = tarea.ID_ACTIVIDAD_PADRE;
          tarea.ID_ACTIVIDAD_PADRE = -20;
          if (tarea.TIPO !== '')
            this.agruparCargos = true;
        };
        if ( tarea.CLASE === 'EVENTOS'){
          tarea.TEMP = tarea.ID_ACTIVIDAD_PADRE;
          tarea.ID_ACTIVIDAD_PADRE = -30;
        };
      };
    });

    if(DFiltrados.length > 0) {
      this.DTareas = [...Nodos, ...DFiltrados];
      this.DResponsabilidades = JSON.parse(JSON.stringify(this.DTareas.filter((d:any) => d.CLASE === 'RESPONSABILIDADES')));
      this.DActividades = JSON.parse(JSON.stringify(this.DTareas.filter((d:any) => d.CLASE === 'TAREAS')));
      this.DEventos = JSON.parse(JSON.stringify(this.DTareas.filter((d:any) => d.CLASE === 'EVENTOS')));
    } else {
      this.DTareas = Nodos;
      this.DResponsabilidades = [];
      this.DActividades = [];
      this.DEventos = [];
    }

    if(this.TreeListTareas !== null && this.TreeListTareas !== undefined)
      this.TreeListTareas.instance.refresh();
    
    this.loadingVisible = false;

  }

  onCellPrepared(e:any) {
    if(e.rowType === 'data') {
      if (e.column.dataField === 'RESPONSABLES') {
        if(e.value !== null && e.value !== '' && e.value !== undefined) {
          for (let i = 0; i < e.value.length; i++) {
            if(e.value[i].ICON === '') {
              const npos: any = e.value[i].NOMBRE.indexOf(" ");
              const name = e.value[i].NOMBRE.charAt(0).toUpperCase();
              const lastName = e.value[i].NOMBRE.substring(npos + 1, e.value[i].NOMBRE.length + 1);
              const Lape = lastName.charAt(0).toUpperCase();
              const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
              e.value[i].iconNameUser = newName;
            }
          };
        }
      };
    };
  }

  onRowPrepared(e: any) {
    // if(this.APLICACION === 'GES-001') {
      if(e.rowType === "data") {
        if (Number(e.data.ID_ACTIVIDAD) < 0 ) {
          const className:string = e.rowElement.className;
          e.rowElement.className = className +' xt-header-row';
        }
      };
      // this.esEdicionFila = false;
    // };
    if(this.APLICACION === 'GES-003') {
      // Valida que haya informacion de producto principal
      if(e.rowType === "data") {
        if(this.esEdicionFila && !this.prmUsrAplBarReg.accion.match('new')) {
          e.component.cancelEditData(this.filasSeleccData.rowIndex);
          this.esEdicionFila = false;
          e.data.modoEdicion = false;
          e.data.readOnlyResponsables = true;
          e.data.readOnlyFechaInicio = true;
          e.data.readOnlyResponsables = true;
          this.filasSeleccData = e;
          this.rowNew = true;
          this.rowApplyChanges = false;
        }
      }
    };
  }

  onRowPrevInsertingTreeList(e:any, tipo:string) {
    if (this.CLASE_TAREAS === 'TAREAS') {
      e.data.ID_ACTIVIDAD_PADRE = this.filasSeleccTareas.length === 0 ? -2 : this.filasSeleccTareas[0];
      e.data.CLASE = 'TAREAS';
    };
    if (this.CLASE_TAREAS === 'RESPONSABILIDADES') {
      e.data.ID_ACTIVIDAD_PADRE = this.filasSeleccResponsabilidades.length === 0 ? -1 : this.filasSeleccResponsabilidades[0];
      e.data.CLASE = 'RESPONSABILIDADES';
    }
  }

  onRowInserted(e:any, tipo:string) {
    if(this.APLICACION === 'GES-001') {
      if(this.prmUsrAplBarReg.accion === 'new') {
        if(e.data.ID_ACTIVIDAD === '' || e.data.ID_ACTIVIDAD !== this.CONSECUTIVO) {
          if(this.CONSECUTIVO !== '') {
            e.data.ID_ACTIVIDAD = this.CONSECUTIVO;
            this.CONSECUTIVO = '';
          }
        };
      }
    }
    if(this.APLICACION === 'GES-003') {
      const res1:any = e.data.RESPONSABLES;
      var data_responsables:any = [{ ID_RESPONSABLE: res1, TIPO: 'RESPONSABLE' }, { ID_RESPONSABLE: res1, TIPO: 'CARGO' }];
      e.data.RESPONSABLES = data_responsables;
    }
    this.opPrepararGuardar(e.data, 'web');
  }

  onEditCanceled(e:any, tipo:string) {
    this.esEdicionFila = false;
    if(e.data !== undefined && e.data !== null && e.data !== '') {
      // e.data.visibleBtnCambios = false;
      e.data = JSON.parse(JSON.stringify(this.dataTarea_prev));
    }
    this.filasSeleccData = '';
    this.prmUsrAplBarReg.accion = '';
    this.TreeListTareas.instance.refresh();
  }

  aceptarCambios(e: any) {
    this.visibleGridColaboradores = false;
  }

  cancelarCambios(e: any) {
    this.visibleGridColaboradores = false;
  }

  onRowUpdated(e:any, tipo:string) {
    if(this.APLICACION === 'GES-001') {
      if(this.prmUsrAplBarReg.accion === 'new') {
        if(e.data.ID_ACTIVIDAD === '' || e.data.ID_ACTIVIDAD !== this.CONSECUTIVO) {
          if(this.CONSECUTIVO !== '') {
            e.data.ID_ACTIVIDAD = this.CONSECUTIVO;
            this.CONSECUTIVO = '';
          }
        };
      }
    }
    if(this.APLICACION === 'GES-003') {
      const res1:any = e.data.RESPONSABLES;
      var data_responsables:any = [{ ID_RESPONSABLE: res1, TIPO: 'RESPONSABLE' }, { ID_RESPONSABLE: res1, TIPO: 'CARGO' }];
      e.data.RESPONSABLES = data_responsables;
    }
    this.opPrepararGuardar(e.data, 'web');
  }

  getCalculateDuracion(e:any, data:any, columna:string, tipo:string, screen:string) {
    if((e.value === null) && (e.value === undefined) && (e.value === '')){
      return;
    };
    if (screen === 'web') {
      this.conCambios++;
      if(columna === 'fecha inicio') {
        const fecha: Date = new Date(e.value);
        data.data.FECHA_INICIO = fecha;
        const npos:any = this.TreeListTareas.instance.getRowIndexByKey(data.data.ID_ACTIVIDAD);
        if(npos !== -1)
          this.TreeListTareas.instance.cellValue(npos, 'FECHA_INICIO', data.data.FECHA_INICIO);
        return;
      };
      if(columna === 'fecha fin') {
        if(data.data.FECHA_INICIO === '' && data.data.FECHA_INICIO === null && data.data.FECHA_INICIO === undefined) {
          showToast('Seleccione Fecha de Inicio', 'error');
        } else {
          const fecha: Date = new Date(e.value);
          data.data.FECHA_FIN = fecha;
          const fecha_inicio: any = new Date(data.data.FECHA_INICIO);
          const fecha_final: any = new Date(data.data.FECHA_FIN);
          if(fecha_inicio > fecha_final) {
            showToast('La fecha de inicio no puede ser mayor a la fecha final.', 'error');
            return;
          } else {
            const fecha: Date = new Date(e.value);
            data.data.FECHA_FIN = fecha;
            const npos:any = this.TreeListTareas.instance.getRowIndexByKey(data.data.ID_ACTIVIDAD);
            if(npos !== -1)
              this.TreeListTareas.instance.cellValue(npos, 'FECHA_FIN', data.data.FECHA_FIN);
            return;
          }
        }
      };

    } else if (screen === 'movil') {
      if(columna === 'fecha inicio') {
        const fecha: Date = new Date(e.value);
        this.FTareas.FECHA_INICIO = fecha;
        return;
      };
      if(columna === 'fecha fin') {
        if(this.FTareas.FECHA_INICIO === '' && this.FTareas.FECHA_INICIO === null && this.FTareas.FECHA_INICIO === undefined) {
          showToast('Seleccione Fecha de Inicio', 'error');
        } else {
          const fecha: Date = new Date(e.value);
          this.FTareas.FECHA_FIN = fecha;
          const fecha_inicio: any = new Date(this.FTareas.FECHA_INICIO);
          const fecha_final: any = new Date(this.FTareas.FECHA_FIN);
          if(fecha_inicio > fecha_final) {
            showToast('La fecha de inicio no puede ser mayor a la fecha final.', 'error');
            return;
          } else {
            const fecha: Date = new Date(e.value);
            this.FTareas.FECHA_FIN = fecha;
            return;
          }
        }
      };
      
      if(this.accionInMovil !== 'consulta')
        this.conCambios++;
    }
  }

  onValueChangedTodoElDia(e:any, data:any, screen:string) {
    if (screen === 'web') {
      if(e.value) {
        data.data.FECHA_FIN = data.data.FECHA_INICIO;
        this.typeDateTime = 'date';
      } else {
        this.typeDateTime = 'datetime';
      }
      data.setValue(e.value);
      this.TreeListTareas.instance.cellValue(data.rowIndex, 'REPETIR', e.value);
      this.conCambios++;
    } else if (screen === 'movil') {
      if(e.value) {
        this.FTareas.FECHA_FIN = this.FTareas.FECHA_INICIO;
        this.typeDateTime = 'date';
      } else {
        this.typeDateTime = 'datetime';
      }
      if(this.accionInMovil !== 'consulta')
        this.conCambios++;
    }
  }

  onValueChangedRepetir(e:any, data:any, screen:string) {
    if (screen === 'web') {
      if(e.value) {
        this.widthPopupFechasTareas = '675px';
        this.heightPopupFechasTareas = '260px';
      } else {
        this.modoSelecionFrecuencia = '';
        this.periodoSeleccionado = '';
        this.widthPopupFechasTareas = '320px';
        this.heightPopupFechasTareas = '260px';
      }
      data.setValue(e.value);
      // this.TreeListTareas.instance.cellValue(data.rowIndex, 'REPETIR', e.value);
      this.conCambios++;
    } else if (screen === 'movil') {
      this.FTareas.REPETIR = e.value;
      if(this.accionInMovil !== 'consulta')
        this.conCambios++;
    }
  }

  onSeleccIntervaloFrecuencia(e:any, data:any, screen:string) {
    if (screen === 'web') {
      this.actividadSeleccionada.INTERVALO_FRECUENCIA = e.value;
      // data.setValue(e.value);
      this.TreeListTareas.instance.cellValue(data.rowIndex, 'INTERVALO_FRECUENCIA', e.value);
      this.conCambios++;
    } else if (screen === 'movil') {
      this.FTareas.INTERVALO_FRECUENCIA = e.value;
      if(this.accionInMovil !== 'consulta')
        this.conCambios++;
    }
  }

  onValueChangedPeriodoFrecuencia(e:any, data:any, tipo:string, screen:string) {
    if (screen === 'web') {
      if(tipo === 'semana')
        data.data.PERIODO_FRECUENCIA = e.value;
      if(tipo === 'fecha')
        data.data.PERIODO_FRECUENCIA = [e.value];
      if(tipo !== 'fecha' && tipo !== 'semana')
        data.data.PERIODO_FRECUENCIA = e.value;
  
      // data.setValue(e.value);
      this.TreeListTareas.instance.cellValue(data.rowIndex, 'PERIODO_FRECUENCIA', e.value);
      this.conCambios++;
    } else if (screen === 'movil') {
      if(tipo === 'semana')
        this.FTareas.PERIODO_FRECUENCIA = e.value;
      if(tipo === 'fecha')
        this.FTareas.PERIODO_FRECUENCIA = [e.value];
      if(tipo !== 'fecha' && tipo !== 'semana')
        this.FTareas.PERIODO_FRECUENCIA = e.value;
      
      if(this.accionInMovil !== 'consulta')
        this.conCambios++;
    }
  }
  
  onSeleccFrecuencia(e:any, data:any, screen:string) {
    switch (e.value) {
      case 'Horas':
        this.periodoSeleccionado = 'Hora(s)';
        this.modoSelecionFrecuencia = 'hora';
        this.readOnlyBtnCada = false;
        this.heightPopupFechasTareas = '260px';
        break;

      case 'Diario':
        this.periodoSeleccionado = 'Día(s)';
        this.modoSelecionFrecuencia = 'dia';
        this.readOnlyBtnCada = false;
        this.heightPopupFechasTareas = '260px';
        break;

      case 'Semanal':
        this.periodoSeleccionado = 'Semana(s)'
        this.modoSelecionFrecuencia = 'semana';
        this.readOnlyBtnCada = false;
        this.heightPopupFechasTareas = '260px';
        break;

      case 'Mensual':
        this.periodoSeleccionado = 'Mes(es)';
        this.modoSelecionFrecuencia = 'mes';
        this.readOnlyBtnCada = false;
        this.heightPopupFechasTareas = '400px';
        break;

      case 'Anual':
        this.periodoSeleccionado = 'Año(s)';
        this.modoSelecionFrecuencia = 'ano';
        this.readOnlyBtnCada = false;
        this.heightPopupFechasTareas = '300px';
        break;
    
      default:
        break;
    }
    if (screen === 'web') {
      data.data.FRECUENCIA = e.value;
      // data.setValue(e.value);
      this.TreeListTareas.instance.cellValue(data.rowIndex, 'FRECUENCIA', e.value);
      this.conCambios++;
    } else if (screen === 'movil') {
      this.FTareas.FRECUENCIA = e.value;
      if(this.accionInMovil !== 'consulta')
        this.conCambios++;
    }
  }

  showProgramarFechas(e:any, cellInfo:any, screen:string) {
    if (screen === 'web') {
      if (this.APLICACION === 'GES-001') {
        if (this.prmUsrAplBarReg.accion !=='new')
          this.prmUsrAplBarReg.accion = 'update';
        if (!this.esEdicionFila) {
          if(cellInfo.data.CLASE !== 'RESPONSABILIDADES') {
            if(cellInfo.data.COLABORADORES.findIndex((d:any) => d.ID_RESPONSABLE === this.USUARIO_LOCAL) !== -1) {
              // e.component.cancelEditData(this.filasSeleccData.rowIndex);
              this.esEdicionFila = false;
              showToast('No puede modificar esta Tarea al ser Colaborador.', 'warning');
              return;
            } else {
              this.TreeListTareas.instance.editRow(cellInfo.rowIndex);
              cellInfo.data.modoEdicion = true;
              this.esEdicionFila = true;
              this.filasSeleccData = cellInfo;
              this.dataTarea_prev = JSON.parse(JSON.stringify(cellInfo.data));
              // this.prmUsrAplBarReg.accion = 'update';
              this.readOnlyTodoDia = false;
              this.readOnlyRepetir = false;
              this.readOnlyBtnCada = false;
              this.readOnlyFrecuencia= false;
              cellInfo.data.readOnlyResponsables = false;
              cellInfo.data.readOnlyFechaInicio = false;
              cellInfo.data.readOnlyFechaFinal = false;
            }
          } else {
            this.readOnlyTodoDia = true;
            this.readOnlyRepetir = true;
            this.readOnlyBtnCada = true;
            this.readOnlyFrecuencia= true;
            cellInfo.data.readOnlyResponsables = true;
            cellInfo.data.readOnlyFechaInicio = true;
            cellInfo.data.readOnlyFechaFinal = true;
          }
        } else {
          if ( (this.filasSeleccData.data.ID_ACTIVIDAD !== cellInfo.data.ID_ACTIVIDAD) &&
                this.prmUsrAplBarReg.accion !== 'new' ) {
            showToast('No puede modificar esta Tarea si esta en Edición la tarea anterior.', 'warning');
            return;
          } else {
            if(cellInfo.data.CLASE !== 'RESPONSABILIDADES') {
              cellInfo.data.modoEdicion = true;
              this.esEdicionFila = true;
              this.filasSeleccData = cellInfo;
              this.dataTarea_prev = JSON.parse(JSON.stringify(cellInfo.data));
              // this.prmUsrAplBarReg.accion = 'update';
              this.readOnlyTodoDia = false;
              this.readOnlyRepetir = false;
              this.readOnlyBtnCada = false;
              this.readOnlyFrecuencia= false;
              cellInfo.data.readOnlyResponsables = false;
              cellInfo.data.readOnlyFechaInicio = false;
              cellInfo.data.readOnlyFechaFinal = false;
            } else {
              this.readOnlyTodoDia = true;
              this.readOnlyRepetir = true;
              this.readOnlyBtnCada = true;
              this.readOnlyFrecuencia= true;
              cellInfo.data.readOnlyResponsables = true;
              cellInfo.data.readOnlyFechaInicio = true;
              cellInfo.data.readOnlyFechaFinal = true;
            }
          }
        }
      } else if(this.APLICACION === 'GES-003') {
        if (this.prmUsrAplBarReg.accion.match('new|update')) {
          this.readOnlyTodoDia = false;
          this.readOnlyRepetir = true;
          this.readOnlyBtnCada = false;
          this.readOnlyFrecuencia= false;
          cellInfo.data.readOnlyResponsables = true;
          cellInfo.data.readOnlyFechaInicio = true;
          cellInfo.data.readOnlyFechaFinal = true;
        }
      }
  
      if (cellInfo.data.ID_ACTIVIDAD === '') {
        if(this.CONSECUTIVO !== '') {
          cellInfo.data.ID_ACTIVIDAD = this.CONSECUTIVO;
        }
      };
      this.dataEditFila = cellInfo;
      this.actividadSeleccionada = cellInfo.data;
      this.actividadSeleccionada_prev = JSON.parse(JSON.stringify(cellInfo.data));
      this.titleActividadSeleccionada = this.actividadSeleccionada.NOMBRE;
      if(this.actividadSeleccionada.REPETIR) {
        this.widthPopupFechasTareas = '675px';
      } else {
        this.widthPopupFechasTareas = '320px';
      };
      if (this.actividadSeleccionada.TODO_DIA) {
        this.typeDateTime = 'date';
      } else {
        this.typeDateTime = 'datetime';
      };
      switch (this.actividadSeleccionada.FRECUENCIA) {
        case 'Horas':
          this.periodoSeleccionado = 'Hora(s)';
          this.modoSelecionFrecuencia = 'hora';
          this.heightPopupFechasTareas = '260px';
          break;
  
        case 'Diario':
          this.periodoSeleccionado = 'Día(s)';
          this.modoSelecionFrecuencia = 'dia';
          this.heightPopupFechasTareas = '260px';
          break;
  
        case 'Semanal':
          this.periodoSeleccionado = 'Semana(s)'
          this.modoSelecionFrecuencia = 'semana';
          this.heightPopupFechasTareas = '260px';
          break;
  
        case 'Mensual':
          this.periodoSeleccionado = 'Mes(es)';
          this.modoSelecionFrecuencia = 'mes';
          this.heightPopupFechasTareas = '400px';
          break;
  
        case 'Anual':
          this.periodoSeleccionado = 'Año(s)';
          this.modoSelecionFrecuencia = 'ano';
          this.heightPopupFechasTareas = '300px';
          break;
      
        default:
          break;
      };
      this.visiblePopupFechas = true;

    } else if (screen === 'movil') {
      this.visibleItemsFechasMovil = true;
    }
  }

  closeProgramarFechas(screen:string) {
    if(screen === 'movil') {
      this.setProgramacion('', 'movil');
      this.visibleItemsFechasMovil = false;
    }
  }

  aceptarBottom(e:any, data:any) {
    if(this.conCambios > 0) {
      if(data.REPETIR) {
        if((data.FRECUENCIA !== '') && (data.FRECUENCIA !== null) && (data.FRECUENCIA !== undefined)) {
          if(data.FRECUENCIA === 'Semanal' || data.FRECUENCIA === 'Anual' ) {
            if(data.PERIODO_FRECUENCIA.length <= 0) {
              showToast('Seleccione el periodo de frecuencia para la tarea.', 'error');
            } else {
              // if(this.prmUsrAplBarReg.accion === 'update') {
              //   this.DTareasUpdate = [{
              //     FECHA_INICIO: data.FECHA_INICIO,
              //     FECHA_FIN: data.FECHA_FIN,
              //     TODO_DIA: data.TODO_DIA,
              //     REPETIR: data.REPETIR,
              //     FRECUENCIA: data.FRECUENCIA,
              //     INTERVALO_FRECUENCIA: data.INTERVALO_FRECUENCIA,
              //     PERIODO_FRECUENCIA: data.PERIODO_FRECUENCIA
              //   }];
              // }
              this.setProgramacion(data, 'web');
              this.modoSelecionFrecuencia = '';
            }
          } else {
            // if(this.prmUsrAplBarReg.accion === 'update') {
            //   this.DTareasUpdate = [{
            //     FECHA_INICIO: data.FECHA_INICIO,
            //     FECHA_FIN: data.FECHA_FIN,
            //     TODO_DIA: data.TODO_DIA,
            //     REPETIR: data.REPETIR,
            //     FRECUENCIA: data.FRECUENCIA,
            //     INTERVALO_FRECUENCIA: data.INTERVALO_FRECUENCIA,
            //     PERIODO_FRECUENCIA: data.PERIODO_FRECUENCIA
            //   }];
            // }
            this.setProgramacion(data, 'web');
            this.modoSelecionFrecuencia = '';
            return;
          }
        } else {
          showToast('Seleccione una frecuencia para que la tarea pueda repetirse.', 'error');
        }
      } else {
        // if(this.prmUsrAplBarReg.accion === 'update') {
        //   this.DTareasUpdate = [{
        //     FECHA_INICIO: data.FECHA_INICIO,
        //     FECHA_FIN: data.FECHA_FIN,
        //     TODO_DIA: data.TODO_DIA,
        //     REPETIR: data.REPETIR,
        //     FRECUENCIA: data.FRECUENCIA,
        //     INTERVALO_FRECUENCIA: data.INTERVALO_FRECUENCIA,
        //     PERIODO_FRECUENCIA: data.PERIODO_FRECUENCIA
        //   }];
        // }
        this.setProgramacion(data, 'web');
        this.modoSelecionFrecuencia = '';
      }

      const fecha_inicio: any = new Date(data.data.FECHA_INICIO);
      const fecha_final: any = new Date(data.data.FECHA_FIN);
      if(fecha_inicio > fecha_final) {
        showToast('La fecha de inicio no puede ser mayor a la fecha final.', 'error');
      } else {
        this.visiblePopupFechas = false;
      }

    } else {
      this.visiblePopupFechas = false;
    }

  }

  closeBottom(e:any) {
    this.actividadSeleccionada = this.actividadSeleccionada_prev;
    this.visiblePopupFechas = false;
  }

  // Compone cadena que muestra la programacion escogida
  setProgramacion(data:any, screen:string) {
    var respProg = '';
    if (screen === 'web') {
      if( (data.data.FECHA_INICIO !== null && data.data.FECHA_INICIO !== undefined && data.data.FECHA_INICIO !== '') &&
          (data.data.FECHA_FIN !== null && data.data.FECHA_FIN !== undefined && data.data.FECHA_FIN !== '')
      ) {
        const fecha_inicial:any = new Date(data.data.FECHA_INICIO);
        const fecha_final:any = new Date(data.data.FECHA_FIN);
  
        const diaUno = fecha_inicial.getDate();
        const mesActualUno = fecha_inicial.getMonth() + 1;
        const añoActualUno = fecha_inicial.getFullYear();
  
        const diaDos = fecha_final.getDate();
        const mesActualDos = fecha_final.getMonth() + 1;
        const añoActualDos = fecha_final.getFullYear();
  
        if ( (data.data.TODO_DIA) && (data.data.TODO_DIA !== null) ) {
          if(fecha_inicial !== fecha_final) {
            if (fecha_inicial.getFullYear() === fecha_final.getFullYear()) {
              if( fecha_inicial.getMonth() === fecha_final.getMonth() ) {
                respProg = 'El ' + diaUno + ' Todo el día';
              } else {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' }) + ' - ' +
                          diaDos + ' ' + fecha_final.toLocaleString('default', { month: 'short' }) + ' Todo el día';
              }
            } else {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' }) + ' ' + fecha_inicial.getFullYear()
                          ' - ' +
                          diaDos + ' ' + fecha_final.toLocaleString('default', { month: 'short' }) + ' ' + fecha_final.getFullYear()
                          + ' Todo el día'
            }
          } else {
            respProg = 'El' + diaUno + ' todo el dia';
          }
        }
        if ( (!data.data.TODO_DIA && !data.data.REPETIR) && (data.data.TODO_DIA !== null && data.data.REPETIR !== null) ) {
          if(fecha_inicial !== fecha_final) {
            if (fecha_inicial.getFullYear() === fecha_final.getFullYear()) {
              if( fecha_inicial.getMonth() === fecha_final.getMonth() ) {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' });
              } else {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' }) + ' - ' +
                          diaDos + ' ' + fecha_final.toLocaleString('default', { month: 'short' });
              }
            } else {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' }) + ' ' + fecha_inicial.getFullYear()
                          ' - ' +
                          diaDos + ' ' + fecha_final.toLocaleString('default', { month: 'short' }) + ' ' + fecha_final.getFullYear()
                          + ' Todo el día'
            }
          } else {
            respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' });
          }
        }
        if (data.data.REPETIR && data.data.REPETIR !== null) {
          var titfrec = '';
          switch (data.data.FRECUENCIA) {
            case 'Horas':
              if(data.data.PERIODO_FRECUENCIA !== null && data.data.PERIODO_FRECUENCIA !== undefined && data.data.PERIODO_FRECUENCIA !== '') {
                if(data.data.INTERVALO_FRECUENCIA !== null && data.data.INTERVALO_FRECUENCIA !== undefined && data.data.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Siempre a las ' + data.data.PERIODO_FRECUENCIA + 'cada ' + data.data.INTERVALO_FRECUENCIA;
                } else {
                  respProg = 'Siempre a las ' + data.data.PERIODO_FRECUENCIA;
                }
              } else {
                respProg = 'Siempre cada Hora';
              }
              break;
      
            case 'Diario':
              if(data.data.INTERVALO_FRECUENCIA !== null && data.data.INTERVALO_FRECUENCIA !== undefined && data.data.INTERVALO_FRECUENCIA > 0) {
                respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' días ';
              } else {
                respProg = 'Cada día';
              }
              break;
      
            case 'Semanal':
              if(data.data.PERIODO_FRECUENCIA !== null && data.data.PERIODO_FRECUENCIA !== undefined && data.data.PERIODO_FRECUENCIA !== '') {
                var frec = '';
                if(data.data.PERIODO_FRECUENCIA.length > 1) {
                  data.data.PERIODO_FRECUENCIA.forEach((item:any) => {
                    frec = frec +', '+ item;
                  });
                } else if(data.data.PERIODO_FRECUENCIA.length > 1) {
                  frec = data.data.PERIODO_FRECUENCIA[0];
                }
                if(data.data.INTERVALO_FRECUENCIA !== null && data.data.INTERVALO_FRECUENCIA !== undefined && data.data.INTERVALO_FRECUENCIA > 0) {
                  if(data.data.PERIODO_FRECUENCIA.length > 1)
                    respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' semanas, los ' + frec;
                  else
                    respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' semanas, el ' + frec;
                } else {
                  if(data.data.PERIODO_FRECUENCIA.length > 1)
                    respProg = 'Cada semana, los ' + frec;
                  else
                    respProg = 'Cada semana, el ' + frec;
                }
              } else {
                respProg = 'Cada semana';
              }
              break;
      
            case 'Mensual':
              if(data.data.PERIODO_FRECUENCIA !== null && data.data.PERIODO_FRECUENCIA !== undefined && data.data.PERIODO_FRECUENCIA !== '') {
                titfrec = data.data.PERIODO_FRECUENCIA.join(',');
                respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' meses, el ' + titfrec;
              } else {
                respProg = 'Cada mes';
              }
              break;
      
            case 'Anual':
              if(data.data.PERIODO_FRECUENCIA !== null && data.data.PERIODO_FRECUENCIA !== undefined && data.data.PERIODO_FRECUENCIA !== '') {
                titfrec = data.data.PERIODO_FRECUENCIA.join(',');
                respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' años, en ' + titfrec;
              } else {
                respProg = 'Cada año';
              }
              break;
            
            default:
              break;
          }
        }
      } else {
        if ( (data.data.TODO_DIA && !data.data.REPETIR) && (data.data.TODO_DIA !== null && data.data.REPETIR !== null) ) {
          respProg = 'El todo el dia';
        }
        if ( (data.data.TODO_DIA && data.data.REPETIR) && (data.data.TODO_DIA !== null && data.data.REPETIR !== null) ) {
          respProg = 'Repetir todo el dia';
        }
        if (data.data.REPETIR && data.data.REPETIR !== null) {
          var titfrec = '';
          switch (data.data.FRECUENCIA) {
            case 'Horas':
              if(data.data.PERIODO_FRECUENCIA !== null && data.data.PERIODO_FRECUENCIA !== undefined && data.data.PERIODO_FRECUENCIA !== '') {
                if(data.data.INTERVALO_FRECUENCIA !== null && data.data.INTERVALO_FRECUENCIA !== undefined && data.data.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Siempre a las ' + data.data.PERIODO_FRECUENCIA + 'cada ' + data.data.INTERVALO_FRECUENCIA;
                } else {
                  respProg = 'Siempre a las ' + data.data.PERIODO_FRECUENCIA;
                }
              } else {
                respProg = 'Siempre cada Hora';
              }
              break;
      
            case 'Diario':
              if(data.data.INTERVALO_FRECUENCIA !== null && data.data.INTERVALO_FRECUENCIA !== undefined && data.data.INTERVALO_FRECUENCIA > 0) {
                respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' días ';
              } else {
                respProg = 'Cada día';
              }
              break;
      
            case 'Semanal':
              if(data.data.PERIODO_FRECUENCIA !== null && data.data.PERIODO_FRECUENCIA !== undefined && data.data.PERIODO_FRECUENCIA !== '') {
                var frec = '';
                if(data.data.PERIODO_FRECUENCIA.length > 1) {
                  data.data.PERIODO_FRECUENCIA.forEach((item:any) => {
                    frec = frec +', '+ item;
                  });
                } else if(data.data.PERIODO_FRECUENCIA.length > 1) {
                  frec = data.data.PERIODO_FRECUENCIA[0];
                }
                if(data.data.INTERVALO_FRECUENCIA !== null && data.data.INTERVALO_FRECUENCIA !== undefined && data.data.INTERVALO_FRECUENCIA > 0) {
                  if(data.data.PERIODO_FRECUENCIA.length > 1)
                    respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' semanas, los ' + frec;
                  else
                    respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' semanas, el ' + frec;
                } else {
                  if(data.data.PERIODO_FRECUENCIA.length > 1)
                    respProg = 'Cada semana, los ' + frec;
                  else
                    respProg = 'Cada semana, el ' + frec;
                }
              } else {
                respProg = 'Cada semana';
              }
              break;
      
            case 'Mensual':
              if(data.data.PERIODO_FRECUENCIA !== null && data.data.PERIODO_FRECUENCIA !== undefined && data.data.PERIODO_FRECUENCIA !== '') {
                titfrec = data.data.PERIODO_FRECUENCIA.join(',');
                if(data.data.INTERVALO_FRECUENCIA !== null && data.data.INTERVALO_FRECUENCIA !== undefined && data.data.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' meses, el ' + titfrec;
                } else {
                  respProg = 'Cada mes, el ' + titfrec;
                }
              } else {
                respProg = 'Cada mes';
              }
              break;
      
            case 'Anual':
              if(data.data.PERIODO_FRECUENCIA !== null && data.data.PERIODO_FRECUENCIA !== undefined && data.data.PERIODO_FRECUENCIA !== '') {
                titfrec = data.data.PERIODO_FRECUENCIA.join(',');
                if(data.data.INTERVALO_FRECUENCIA !== null && data.data.INTERVALO_FRECUENCIA !== undefined && data.data.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Cada ' + data.data.INTERVALO_FRECUENCIA + ' años, en ' + titfrec;
                } else {
                  respProg = 'Cada año, en ' + titfrec;
                }
              } else {
                respProg = 'Cada año';
              }
              break;
            
            default:
              break;
          }
        }
      }
      // Actualiza valor en el treelist
      data.data.PROGRAMACION = respProg;
      this.TreeListTareas.instance.cellValue(data.rowIndex, 'PROGRAMACION', respProg);

    } else if (screen === 'movil') {
      if( (this.FTareas.FECHA_INICIO !== null && this.FTareas.FECHA_INICIO !== undefined && this.FTareas.FECHA_INICIO !== '') &&
          (this.FTareas.FECHA_FIN !== null && this.FTareas.FECHA_FIN !== undefined && this.FTareas.FECHA_FIN !== '')
      ) {
        const fecha_inicial:any = new Date(this.FTareas.FECHA_INICIO);
        const fecha_final:any = new Date(this.FTareas.FECHA_FIN);
  
        const diaUno = fecha_inicial.getDate();
        const mesActualUno = fecha_inicial.getMonth() + 1;
        const añoActualUno = fecha_inicial.getFullYear();
  
        const diaDos = fecha_final.getDate();
        const mesActualDos = fecha_final.getMonth() + 1;
        const añoActualDos = fecha_final.getFullYear();
  
        if ( (this.FTareas.TODO_DIA) && (this.FTareas.TODO_DIA !== null) ) {
          if(fecha_inicial !== fecha_final) {
            if (fecha_inicial.getFullYear() === fecha_final.getFullYear()) {
              if( fecha_inicial.getMonth() === fecha_final.getMonth() ) {
                respProg = 'El ' + diaUno + ' Todo el día';
              } else {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' }) + ' - ' +
                          diaDos + ' ' + fecha_final.toLocaleString('default', { month: 'short' }) + ' Todo el día';
              }
            } else {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' }) + ' ' + fecha_inicial.getFullYear()
                          ' - ' +
                          diaDos + ' ' + fecha_final.toLocaleString('default', { month: 'short' }) + ' ' + fecha_final.getFullYear()
                          + ' Todo el día'
            }
          } else {
            respProg = 'El' + diaUno + ' todo el dia';
          }
        }
        if ( (!this.FTareas.TODO_DIA && !this.FTareas.REPETIR) && (this.FTareas.TODO_DIA !== null && this.FTareas.REPETIR !== null) ) {
          if(fecha_inicial !== fecha_final) {
            if (fecha_inicial.getFullYear() === fecha_final.getFullYear()) {
              if( fecha_inicial.getMonth() === fecha_final.getMonth() ) {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' });
              } else {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' }) + ' - ' +
                          diaDos + ' ' + fecha_final.toLocaleString('default', { month: 'short' });
              }
            } else {
                respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' }) + ' ' + fecha_inicial.getFullYear()
                          ' - ' +
                          diaDos + ' ' + fecha_final.toLocaleString('default', { month: 'short' }) + ' ' + fecha_final.getFullYear()
                          + ' Todo el día'
            }
          } else {
            respProg = diaUno + ' ' + fecha_inicial.toLocaleString('default', { month: 'short' });
          }
        }
        if (this.FTareas.REPETIR && this.FTareas.REPETIR !== null) {
          var titfrec = '';
          switch (this.FTareas.FRECUENCIA) {
            case 'Horas':
              if(this.FTareas.PERIODO_FRECUENCIA !== null && this.FTareas.PERIODO_FRECUENCIA !== undefined && this.FTareas.PERIODO_FRECUENCIA !== '') {
                if(this.FTareas.INTERVALO_FRECUENCIA !== null && this.FTareas.INTERVALO_FRECUENCIA !== undefined && this.FTareas.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Siempre a las ' + this.FTareas.PERIODO_FRECUENCIA + 'cada ' + this.FTareas.INTERVALO_FRECUENCIA;
                } else {
                  respProg = 'Siempre a las ' + this.FTareas.PERIODO_FRECUENCIA;
                }
              } else {
                respProg = 'Siempre cada Hora';
              }
              break;
      
            case 'Diario':
              if(this.FTareas.INTERVALO_FRECUENCIA !== null && this.FTareas.INTERVALO_FRECUENCIA !== undefined && this.FTareas.INTERVALO_FRECUENCIA > 0) {
                respProg = 'Cada ' + this.FTareas.INTERVALO_FRECUENCIA + ' días ';
              } else {
                respProg = 'Cada día';
              }
              break;
      
            case 'Semanal':
              if(this.FTareas.PERIODO_FRECUENCIA !== null && this.FTareas.PERIODO_FRECUENCIA !== undefined && this.FTareas.PERIODO_FRECUENCIA !== '') {
                const frec = this.FTareas.PERIODO_FRECUENCIA[0];
                if(this.FTareas.INTERVALO_FRECUENCIA !== null && this.FTareas.INTERVALO_FRECUENCIA !== undefined && this.FTareas.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Cada ' + this.FTareas.INTERVALO_FRECUENCIA + ' semanas, el ' + frec;
                } else {
                  respProg = 'Cada semana, el ' + frec;
                }
              } else {
                respProg = 'Cada semana';
              }
              break;
      
            case 'Mensual':
              if(this.FTareas.PERIODO_FRECUENCIA !== null && this.FTareas.PERIODO_FRECUENCIA !== undefined && this.FTareas.PERIODO_FRECUENCIA !== '') {
                titfrec = this.FTareas.PERIODO_FRECUENCIA.join(',');
                respProg = 'Cada ' + this.FTareas.INTERVALO_FRECUENCIA + ' meses, el ' + titfrec;
              } else {
                respProg = 'Cada mes';
              }
              break;
      
            case 'Anual':
              if(this.FTareas.PERIODO_FRECUENCIA !== null && this.FTareas.PERIODO_FRECUENCIA !== undefined && this.FTareas.PERIODO_FRECUENCIA !== '') {
                titfrec = this.FTareas.PERIODO_FRECUENCIA.join(',');
                respProg = 'Cada ' + this.FTareas.INTERVALO_FRECUENCIA + ' años, en ' + titfrec;
              } else {
                respProg = 'Cada año';
              }
              break;
            
            default:
              break;
          }
        }
      } else {
        if ( (this.FTareas.TODO_DIA && !this.FTareas.REPETIR) && (this.FTareas.TODO_DIA !== null && this.FTareas.REPETIR !== null) ) {
          respProg = 'El todo el dia';
        }
        if ( (this.FTareas.TODO_DIA && this.FTareas.REPETIR) && (this.FTareas.TODO_DIA !== null && this.FTareas.REPETIR !== null) ) {
          respProg = 'Repetir todo el dia';
        }
        if (this.FTareas.REPETIR && this.FTareas.REPETIR !== null) {
          var titfrec = '';
          switch (this.FTareas.FRECUENCIA) {
            case 'Horas':
              if(this.FTareas.PERIODO_FRECUENCIA !== null && this.FTareas.PERIODO_FRECUENCIA !== undefined && this.FTareas.PERIODO_FRECUENCIA !== '') {
                if(this.FTareas.INTERVALO_FRECUENCIA !== null && this.FTareas.INTERVALO_FRECUENCIA !== undefined && this.FTareas.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Siempre a las ' + this.FTareas.PERIODO_FRECUENCIA + 'cada ' + this.FTareas.INTERVALO_FRECUENCIA;
                } else {
                  respProg = 'Siempre a las ' + this.FTareas.PERIODO_FRECUENCIA;
                }
              } else {
                respProg = 'Siempre cada Hora';
              }
              break;
      
            case 'Diario':
              if(this.FTareas.INTERVALO_FRECUENCIA !== null && this.FTareas.INTERVALO_FRECUENCIA !== undefined && this.FTareas.INTERVALO_FRECUENCIA > 0) {
                respProg = 'Cada ' + this.FTareas.INTERVALO_FRECUENCIA + ' días ';
              } else {
                respProg = 'Cada día';
              }
              break;
      
            case 'Semanal':
              if(this.FTareas.PERIODO_FRECUENCIA !== null && this.FTareas.PERIODO_FRECUENCIA !== undefined && this.FTareas.PERIODO_FRECUENCIA !== '') {
                const frec = this.FTareas.PERIODO_FRECUENCIA[0];
                if(this.FTareas.INTERVALO_FRECUENCIA !== null && this.FTareas.INTERVALO_FRECUENCIA !== undefined && this.FTareas.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Cada ' + this.FTareas.INTERVALO_FRECUENCIA + ' semanas, el ' + frec;
                } else {
                  respProg = 'Cada semana, el ' + frec;
                }
              } else {
                respProg = 'Cada semana';
              }
              break;
      
            case 'Mensual':
              if(this.FTareas.PERIODO_FRECUENCIA !== null && this.FTareas.PERIODO_FRECUENCIA !== undefined && this.FTareas.PERIODO_FRECUENCIA !== '') {
                titfrec = this.FTareas.PERIODO_FRECUENCIA.join(',');
                if(this.FTareas.INTERVALO_FRECUENCIA !== null && this.FTareas.INTERVALO_FRECUENCIA !== undefined && this.FTareas.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Cada ' + this.FTareas.INTERVALO_FRECUENCIA + ' meses, el ' + titfrec;
                } else {
                  respProg = 'Cada mes, el ' + titfrec;
                }
              } else {
                respProg = 'Cada mes';
              }
              break;
      
            case 'Anual':
              if(this.FTareas.PERIODO_FRECUENCIA !== null && this.FTareas.PERIODO_FRECUENCIA !== undefined && this.FTareas.PERIODO_FRECUENCIA !== '') {
                titfrec = this.FTareas.PERIODO_FRECUENCIA.join(',');
                if(this.FTareas.INTERVALO_FRECUENCIA !== null && this.FTareas.INTERVALO_FRECUENCIA !== undefined && this.FTareas.INTERVALO_FRECUENCIA > 0) {
                  respProg = 'Cada ' + this.FTareas.INTERVALO_FRECUENCIA + ' años, en ' + titfrec;
                } else {
                  respProg = 'Cada año, en ' + titfrec;
                }
              } else {
                respProg = 'Cada año';
              }
              break;
            
            default:
              break;
          }
        }
      }
      // Actualiza valor en el treelist
      this.FTareas.PROGRAMACION = respProg;
    }

  }

  onValueChangedNombre(e:any, cellInfo:any, tipo:string, screen:string) {
    if(screen === 'web') {
      if(e.value.length <= 100) {
        cellInfo.data.NOMBRE = e.value;
        this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'NOMBRE', cellInfo.data.NOMBRE);
      } else {
        showToast('El nombre es muy largo, si necesita escribir más puede añadir en Descripción.', 'error');
      }
      this.conCambios++;
    } else if (screen === 'movil') {
      this.FTareas.NOMBRE =  e.value;
      if(e.value.length > 100) 
        showToast('El nombre es muy largo, si necesita escribir más puede añadir en Descripción.', 'error');
      if(this.accionInMovil !== 'consultar') {
        this.conCambios++;
      }
    }
  }

  onSelectionEstado(e:any, cellInfo:any, tipo:string, screen:string) {
    if (screen === 'web') {
      if(e.value !== 'Sin Iniciar' && e.value !== 'Descartada') {
        if((cellInfo.data.RESPONSABLES === null && cellInfo.data.RESPONSABLES === undefined && cellInfo.data.RESPONSABLES !== '') &&
          (cellInfo.data.FECHA_INICIO === '' && cellInfo.data.FECHA_INICIO === null && cellInfo.data.FECHA_INICIO === undefined) &&
          (cellInfo.data.FECHA_FIN === '' && cellInfo.data.FECHA_FIN === null && cellInfo.data.FECHA_FIN === undefined)
        ) {
          cellInfo.data.ESTADO = e.previousValue;
          this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'ESTADO', cellInfo.data.ESTADO);
          showToast('No puede modificar el estado si no tiene un Responsable asignado y un rango de fechas establecido.', 'error');
          return;
        }
        cellInfo.data.ESTADO = e.value;
        this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'ESTADO', cellInfo.data.ESTADO);
      } else {
        cellInfo.data.ESTADO = e.value;
        this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'ESTADO', cellInfo.data.ESTADO);
      }
      this.conCambios++;
    } else if (screen === 'movil') {
      if(e.value !== 'Sin Iniciar' && e.value !== 'Descartada') {
        if((this.FTareas.RESPONSABLES === null && this.FTareas.RESPONSABLES === undefined && this.FTareas.RESPONSABLES !== '') &&
          (this.FTareas.FECHA_INICIO === '' && this.FTareas.FECHA_INICIO === null && this.FTareas.FECHA_INICIO === undefined) &&
          (this.FTareas.FECHA_FIN === '' && this.FTareas.FECHA_FIN === null && this.FTareas.FECHA_FIN === undefined)
        ) {
          this.FTareas.ESTADO = e.previousValue;
          showToast('No puede modificar el estado si no tiene un Responsable asignado y un rango de fechas establecido.', 'error');
          return;
        }
        this.FTareas.ESTADO = e.value;
      } else {
        this.FTareas.ESTADO = e.value;
      }
      if(this.accionInMovil !== 'consulta')
        this.conCambios++;
    }
  }

  onSelectionTipo(e:any, cellInfo:any, tipo:string) {
    cellInfo.data.TIPO = e.value;
    this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'TIPO', cellInfo.data.TIPO);
    if(e.value === 'Permanente') {
      this.readOnlyFechasTareas = true;
      cellInfo.data.FECHA_INICIO = '';
      cellInfo.data.FECHA_FIN = '';
      this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'FECHA_INICIO', cellInfo.data.FECHA_INICIO);
      this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'FECHA_FIN', cellInfo.data.FECHA_FIN);
    } else {
      this.readOnlyFechasTareas = false;
    }
    this.conCambios++;
  }

  onRowValidating(e:any, tipo:string) {
    var res:boolean = false;
    if(this.APLICACION === 'GES-001') {
      if(this.prmUsrAplBarReg.accion === 'new') {
        let mensaje:any='';
        let propiedadesVacias:any = [];
        let propiedadesVerificar:any = [];
        switch (this.CLASE_TAREAS) {
          case 'RESPONSABILIDADES':
            propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "PROGRAMACION", "CLASE", "FRECUENCIA", "REPETIR"];
            if((e.newData.NOMBRE !== '' && e.newData.NOMBRE !== null && e.newData.NOMBRE !== undefined) &&
              (e.newData.RESPONSABLES !== '' && e.newData.RESPONSABLES !== null && e.newData.RESPONSABLES !== undefined) &&
              (e.newData.PROGRAMACION !== '' && e.newData.PROGRAMACION !== null && e.newData.PROGRAMACION !== undefined) &&
              (e.newData.CLASE !== '' && e.newData.CLASE !== null && e.newData.CLASE !== undefined)
            ){
              if((e.newData.FRECUENCIA !== '' && e.newData.FRECUENCIA !== null && e.newData.FRECUENCIA !== undefined) && (e.newData.REPETIR === true)) {
                e.isValid = true;
                res = true;
              } else {
                for (let key in e.newData) {
                  if (propiedadesVerificar.includes(key) && !e.newData[key]) {
                    propiedadesVacias.push(key);
                  }
                }
                if (propiedadesVacias.length > 0)
                  mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;
  
                res = false;
              };
            } else {
              for (let key in e.newData) {
                if (propiedadesVerificar.includes(key) && !e.newData[key]) {
                  propiedadesVacias.push(key);
                }
              }
              if (propiedadesVacias.length > 0)
                mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

              res = false;
            }
            break;
            
          case 'TAREAS':
            propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "CLASE"];
            if((e.newData.NOMBRE !== '' && e.newData.NOMBRE !== null && e.newData.NOMBRE !== undefined) &&
              (e.newData.RESPONSABLES !== '' && e.newData.RESPONSABLES !== null && e.newData.RESPONSABLES !== undefined) &&
              (e.newData.CLASE !== '' && e.newData.CLASE !== null && e.newData.CLASE !== undefined)
            ){
              e.isValid = true;
              res = true;
            } else {
              for (let key in e.newData) {
                if (propiedadesVerificar.includes(key) && !e.newData[key]) {
                  propiedadesVacias.push(key);
                }
              }
              if (propiedadesVacias.length > 0)
                mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

              e.isValid = false;
              res = false;
            }
            break;

          case 'EVENTOS':
            propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "PROGRAMACION", "FECHA_INICIO", "FECHA_FIN"];
            if((e.newData.NOMBRE !== '' && e.newData.NOMBRE !== null && e.newData.NOMBRE !== undefined) &&
              (e.newData.RESPONSABLES !== '' && e.newData.RESPONSABLES !== null && e.newData.RESPONSABLES !== undefined) &&
              (e.newData.FECHA_INICIO !== '' && e.newData.FECHA_INICIO !== null && e.newData.FECHA_INICIO !== undefined) &&
              (e.newData.FECHA_FIN !== '' && e.newData.FECHA_FIN !== null && e.newData.FECHA_FIN !== undefined) &&
              (e.newData.PROGRAMACION !== '' && e.newData.PROGRAMACION !== null && e.newData.PROGRAMACION !== undefined)
            ){
              e.isValid = true;
              res = true;
            } else {
              for (let key in e.newData) {
                if (propiedadesVerificar.includes(key) && !e.newData[key]) {
                  propiedadesVacias.push(key);
                }
              }
              if (propiedadesVacias.length > 0)
                mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

              e.isValid = false;
              res = false;
            }
            break;
        
          default:
            break;
        }

      };
      if(this.prmUsrAplBarReg.accion === 'update') {
        let mensaje:any='';
        let propiedadesVacias:any = [];
        let propiedadesVerificar:any = [];
        switch (this.CLASE_TAREAS) {
          case 'RESPONSABILIDADES':
            propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "PROGRAMACION", "CLASE", "FRECUENCIA", "REPETIR"];
            if((e.oldData.NOMBRE !== '' && e.oldData.NOMBRE !== null && e.oldData.NOMBRE !== undefined) &&
              (e.oldData.RESPONSABLES !== '' && e.oldData.RESPONSABLES !== null && e.oldData.RESPONSABLES !== undefined) &&
              (e.oldData.PROGRAMACION !== '' && e.oldData.PROGRAMACION !== null && e.oldData.PROGRAMACION !== undefined) &&
              (e.oldData.CLASE !== '' && e.oldData.CLASE !== null && e.oldData.CLASE !== undefined)
            ){
              if( (e.oldData.FRECUENCIA !== '' && e.oldData.FRECUENCIA !== null && e.oldData.FRECUENCIA !== undefined) && (e.oldData.REPETIR === true) ) {
                if(e.oldData !== undefined && e.oldData !== null && e.oldData.length > 0) {
                  if(JSON.stringify(e.newData) !== JSON.stringify(e.oldData)) {
                    this.DTareasUpdate = [e.newData];
                  }
                }
                e.isValid = true;
                res = true;
              } else {
                for (let key in e.newData) {
                  if (propiedadesVerificar.includes(key) && !e.newData[key]) {
                    propiedadesVacias.push(key);
                  }
                }
                if (propiedadesVacias.length > 0)
                  mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;
  
                e.isValid = false;
                res = false;
              }
            } else {
              for (let key in e.newData) {
                if (propiedadesVerificar.includes(key) && !e.newData[key]) {
                  propiedadesVacias.push(key);
                }
              }
              if (propiedadesVacias.length > 0)
                mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

              e.isValid = false;
              res = false;
            }
            break;
            
          case 'TAREAS':
            propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "CLASE"];
            if((e.oldData.NOMBRE !== '' && e.oldData.NOMBRE !== null && e.oldData.NOMBRE !== undefined) &&
              (e.oldData.RESPONSABLES !== '' && e.oldData.RESPONSABLES !== null && e.oldData.RESPONSABLES !== undefined) &&
              (e.oldData.CLASE !== '' && e.oldData.CLASE !== null && e.oldData.CLASE !== undefined)
            ){
              if(e.oldData !== undefined && e.oldData !== null && e.oldData.length > 0) {
                if(JSON.stringify(e.newData) !== JSON.stringify(e.oldData)) {
                  this.DTareasUpdate = [e.newData];
                }
              }
              e.isValid = true;
              res = true;
            } else {
              e.isValid = false;
              showToast('Faltan completar datos de la Tarea.', 'error');
              res = false;
            }
            break;

          case 'EVENTOS':
            propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "PROGRAMACION", "FECHA_INICIO", "FECHA_FIN"];
            if((e.oldData.NOMBRE !== '' && e.oldData.NOMBRE !== null && e.oldData.NOMBRE !== undefined) &&
              (e.oldData.RESPONSABLES !== '' && e.oldData.RESPONSABLES !== null && e.oldData.RESPONSABLES !== undefined) &&
              (e.oldData.FECHA_INICIO !== '' && e.oldData.FECHA_INICIO !== null && e.oldData.FECHA_INICIO !== undefined) &&
              (e.oldData.FECHA_FIN !== '' && e.oldData.FECHA_FIN !== null && e.oldData.FECHA_FIN !== undefined) &&
              (e.oldData.PROGRAMACION !== '' && e.oldData.PROGRAMACION !== null && e.oldData.PROGRAMACION !== undefined)
            ){
              if(e.oldData !== undefined && e.oldData !== null && e.oldData.length > 0) {
                if(JSON.stringify(e.newData) !== JSON.stringify(e.oldData)) {
                  this.DTareasUpdate = [e.newData];
                }
              }
              e.isValid = true;
              res = true;
            } else {
              e.isValid = false;
              showToast('Faltan completar datos del Evento.', 'error');
              res = false;
            }
            break;
        
          default:
            break;
        }
      }

    };

    if(this.APLICACION === 'GES-003') {
      let mensaje:any='';
      let propiedadesVacias:any = [];
      const propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "PROGRAMACION", "CLASE", "FRECUENCIA", "REPETIR"];
      if(this.prmUsrAplBarReg.accion === 'new') {
        if((e.newData.NOMBRE !== '' && e.newData.NOMBRE !== null && e.newData.NOMBRE !== undefined) &&
          (e.newData.RESPONSABLES !== '' && e.newData.RESPONSABLES !== null && e.newData.RESPONSABLES !== undefined) &&
          (e.newData.PROGRAMACION !== '' && e.newData.PROGRAMACION !== null && e.newData.PROGRAMACION !== undefined) &&
          (e.newData.CLASE !== '' && e.newData.CLASE !== null && e.newData.CLASE !== undefined)
        ){
          if( (e.newData.FRECUENCIA !== '' && e.newData.FRECUENCIA !== null && e.newData.FRECUENCIA !== undefined) && (e.newData.REPETIR === true) ) {
            if(e.oldData !== undefined && e.oldData !== null && e.oldData.length > 0) {
              if(JSON.stringify(e.newData) !== JSON.stringify(e.oldData)) {
                this.DTareasUpdate = [e.newData];
              }
            }
            e.isValid = true;
            res = true;
          } else {
            for (let key in e.newData) {
              if (propiedadesVerificar.includes(key) && !e.newData[key]) {
                propiedadesVacias.push(key);
              }
            }
            if (propiedadesVacias.length > 0)
              mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;
  
            e.isValid = false;
            showToast(mensaje, 'error');
            res = false;
          };
        } else {
          for (let key in e.newData) {
            if (propiedadesVerificar.includes(key) && !e.newData[key]) {
              propiedadesVacias.push(key);
            }
          }
          if (propiedadesVacias.length > 0)
            mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

          e.isValid = false;
          showToast(mensaje, 'error');
          res = false;
        };
      };
      if(this.prmUsrAplBarReg.accion === 'update') {
        if((e.oldData.NOMBRE !== '' && e.oldData.NOMBRE !== null && e.oldData.NOMBRE !== undefined) &&
          (e.oldData.RESPONSABLES !== '' && e.oldData.RESPONSABLES !== null && e.oldData.RESPONSABLES !== undefined) &&
          (e.oldData.PROGRAMACION !== '' && e.oldData.PROGRAMACION !== null && e.oldData.PROGRAMACION !== undefined) &&
          (e.oldData.CLASE !== '' && e.oldData.CLASE !== null && e.oldData.CLASE !== undefined)
        ){
          if( (e.oldData.FRECUENCIA !== '' && e.oldData.FRECUENCIA !== null && e.oldData.FRECUENCIA !== undefined) && (e.oldData.REPETIR === true)) {
            if(e.oldData !== undefined && e.oldData !== null && e.oldData.length > 0) {
              if(JSON.stringify(e.newData) !== JSON.stringify(e.oldData)) {
                this.DTareasUpdate = [e.newData];
              }
            }
            e.isValid = true;
            res = true;
          } else {
            for (let key in e.newData) {
              if (propiedadesVerificar.includes(key) && !e.newData[key]) {
                propiedadesVacias.push(key);
              }
            }
            if (propiedadesVacias.length > 0)
              mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;
  
            e.isValid = false;
            showToast(mensaje, 'error');
            res = false;
          }
        } else {
          for (let key in e.newData) {
            if (propiedadesVerificar.includes(key) && !e.newData[key]) {
              propiedadesVacias.push(key);
            }
          }
          if (propiedadesVacias.length > 0)
            mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

          e.isValid = false;
          showToast(mensaje, 'error');
          res = false;
        }
      }
    };

    if (res) {
      this.rowApplyChanges = false;
      this.rowEdit = false;
      this.rowNew = true;
      this.esEdicionFila = false;
      // this.prmUsrAplBarReg.accion = '';
    }
    return res;
  }

  toggleToolTip(item:any, cellInfo:any, accion:string) {
    if(cellInfo.data.COLABORADORES.length > 1) {
      if(accion === 'activar') {
        this.targetIdTooltip = '#USER-'+item.ID_RESPONSABLE+cellInfo.data.ITEM;
        this.toolTipVisible = true;
        this.tooltipText = item.NOMBRE;
      } else if (accion === 'salir') {
        this.toolTipVisible = false;
      }
    }
  }

  onItemClick(e:any) {
    this.selectProfileSettings = e.itemData;
  }

  onInitializedProgressBar(e:any, cellInfo:any) {
    const ele = e.element.querySelectorAll(".dx-progressbar-range");
    if(cellInfo.data.MEDICION >= 0 && cellInfo.data.MEDICION <= 20 ) {
      ele[0].style.backgroundColor = 'rgba(15,76,129, .25)';
    };
    if(cellInfo.data.MEDICION >= 21 && cellInfo.data.MEDICION <= 80 ) {
      ele[0].style.backgroundColor = 'rgba(15,76,129, .5)';
    };
    if(cellInfo.data.MEDICION >= 81 && cellInfo.data.MEDICION <= 99 ) {
      ele[0].style.backgroundColor = 'rgba(15,76,129, .75)';
    };
    if(cellInfo.data.MEDICION >= 100 ) {
      ele[0].style.backgroundColor = 'rgba(15,76,129, 1)';
    };
  }

  onSelectionPrioridad(e:any, cellInfo:any, tipo:string, screen:string) {
    if (screen === 'web') {
      cellInfo.data.PRIORIDAD = e.value;
      this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'PRIORIDAD', cellInfo.data.PRIORIDAD);
    } else if (screen === 'movil') {
      this.FTareas.PRIORIDAD = e.value;
    }
    this.conCambios++;
  }

  onValueChangedCosto(e:any, cellInfo:any, tipo:string) {
    cellInfo.data.COSTO = e.value;
    this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'COSTO', cellInfo.data.COSTO);
    this.conCambios++;
  }

  onValueChangedDescripcion(e:any, cellInfo:any, tipo:string, screen:string) {
    if(screen === 'web') {
      cellInfo.data.DESCRIPCION = e.value;
      this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'DESCRIPCION', cellInfo.data.DESCRIPCION);
      this.conCambios++;
    } else if (screen === 'movil') {
      this.FTareas.DESCRIPCION = e.value;
      if(this.accionInMovil !== 'consulta')
        this.conCambios++;
    }
  }

  onInitializedFromResponsables(e:any, data:any, medio:string) {
    if(medio === 'html') {
      for (let i = 0; i < data.length; i++) {
        const npos: any = data[i].NOMBRE.indexOf(" ");
        const name = data[i].NOMBRE.charAt(0).toUpperCase();
        const lastName = data[i].NOMBRE.substring(npos + 1, data[i].NOMBRE.length + 1);
        const Lape = lastName.charAt(0).toUpperCase();
        const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
        data[i].iconNameUser = newName;
      }
    } else if (medio === 'datos') {
      for (let i = 0; i < data.length; i++) {
        const npos: any = data[i].RESPONSABLES.NOMBRE.indexOf(" ");
        const name = data[i].RESPONSABLES.NOMBRE.charAt(0).toUpperCase();
        const lastName = data[i].RESPONSABLES.NOMBRE.substring(npos + 1, data[i].RESPONSABLES.NOMBRE.length + 1);
        const Lape = lastName.charAt(0).toUpperCase();
        const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
        data[i].RESPONSABLES.iconNameUser = newName;
      }
    }
  }

  onInitializedListResponsables(e:any, cellInfo:any, screen:string) {
    if (screen === 'web') {
      const item:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === cellInfo.data.RESPONSABLES);
      if(item.length > 0) {
        this.cargosResponsable = item[0].CARGOS;
        if(this.cargosResponsable.length > 0) {
          this.activeSelectCargo = true;
          for (let i = 0; i < this.cargosResponsable.length; i++) {
            const ele:any = this.cargosResponsable[i].ACTIVIDADES;
            const index:any = ele.findIndex((d:any) => d.ID_ACTIVIDAD === cellInfo.data.ID_ACTIVIDAD);
            if(index !== -1)
              this.valueRadioResponsables = this.cargosResponsable[index].ID_CARGO;
            else
              this.valueRadioResponsables = '';
          }
    
        } else {
          this.activeSelectCargo = false;
          this.valueRadioResponsables = '';
        }
      } else {
        this.cargosResponsable = [];
      }

    } else if (screen === 'movil') {
      const item:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === cellInfo.data.RESPONSABLES);
      if(item.length > 0) {
        this.cargosResponsable = item[0].CARGOS;
        if(this.cargosResponsable.length > 0) {
          this.activeSelectCargo = true;
          for (let i = 0; i < this.cargosResponsable.length; i++) {
            const ele:any = this.cargosResponsable[i].ACTIVIDADES;
            const index:any = ele.findIndex((d:any) => d.ID_ACTIVIDAD === cellInfo.data.ID_ACTIVIDAD);
            if(index !== -1)
              this.valueRadioResponsables = this.cargosResponsable[index].ID_CARGO;
            else
              this.valueRadioResponsables = '';
          }
    
        } else {
          this.activeSelectCargo = false;
          this.valueRadioResponsables = '';
        }
      } else {
        this.cargosResponsable = [];
      }
    }
      
  }

  onSelectionChangedResponsableList(e:any, cellInfo:any, screen:string) {
    if (screen === 'web') {
      if ((e.addedItems !== null) && (e.addedItems !== undefined) && (e.addedItems.length > 0)) {
        if(cellInfo.data.CLASE === 'RESPONSABILIDADES') {
          this.cargosResponsable = e.addedItems[0].CARGOS;
          // cellInfo.data.RESPONSABLES = e.addedItems[0].ID_RESPONSABLE;
          const responsable:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === e.addedItems[0].ID_RESPONSABLE);
          cellInfo.data.RESPONSABLES = e.addedItems[0];
          if(e.value === this.USUARIO_LOCAL)
            cellInfo.data.ACT_MIAS = true;
          else
            cellInfo.data.ACT_ASIG = true;

          if(this.cargosResponsable.length > 0) {
            this.activeSelectCargo = true;
            this.openedResponsables = true;
          } else {
            this.activeSelectCargo = false;
          }
        }
      } else {
        showToast('Debe seleccionar un Responsable.', 'error');
      }
      this.conCambios++;
    } else if (screen === 'movil') {
      if ((e.addedItems !== null) && (e.addedItems !== undefined) && (e.addedItems.length > 0)) {
        this.FTareas.RESPONSABLES = e.addedItems[0];
        if(e.addedItems[0].ID_RESPONSABLE === this.USUARIO_LOCAL)
          this.FTareas.ACT_MIAS = true;
        else
          this.FTareas.ACT_ASIG = true;
      } else {
        showToast('Debe seleccionar un Responsable.', 'error');
      }
      if (this.accionInMovil !== 'consultar')
        this.conCambios++;

      this.openDropResponsablesMovil = false;
    }
  }

  onSelectionChangedResponsable(e:any, cellInfo:any, tipo:string) {
    if(this.prmUsrAplBarReg.accion.match('new|update')) {
      if ((e.value !== null) && (e.value !== undefined) && (e.value !== 0)) {
        if(cellInfo.data.CLASE === 'TAREAS') {
          if(cellInfo.data.COLABORADORES.length > 0) {
            if(cellInfo.data.COLABORADORES.findIndex((d:any) => d.ID_RESPONSABLE === e.value) === -1) {
              const responsable:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === e.value);
              cellInfo.data.RESPONSABLES = {
                ID_ACTIVIDAD: cellInfo.data.ID_ACTIVIDAD,
                ID_RESPONSABLE: e.value,
                NOMBRE: responsable[0].NOMBRE,
                FOTO: responsable[0].FOTO,
                iconNameUser: responsable[0].iconNameUser
              };
              if(e.value === this.USUARIO_LOCAL)
                cellInfo.data.ACT_MIAS = true;
              else
                cellInfo.data.ACT_ASIG = true;
              this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'RESPONSABLES', cellInfo.data.RESPONSABLES);
            } else {
              cellInfo.data.RESPONSABLES = '';
              showToast('El usuario seleccionado no puede ser RESPONSABLE Y COLABORADOR en la misma tarea.', 'error');
              return;
            }
          } else {
            const responsable:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === e.value);
            cellInfo.data.RESPONSABLES = {
              ID_ACTIVIDAD: cellInfo.data.ID_ACTIVIDAD,
              ID_RESPONSABLE: e.value,
              NOMBRE: responsable[0].NOMBRE,
              FOTO: responsable[0].FOTO,
              iconNameUser: responsable[0].iconNameUser
            };
            
            if(e.value === this.USUARIO_LOCAL)
              cellInfo.data.ACT_MIAS = true;
            else
              cellInfo.data.ACT_ASIG = true;
            this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'RESPONSABLES', cellInfo.data.RESPONSABLES);
          };
        };
        if(cellInfo.data.CLASE === 'EVENTOS') {
          const responsable:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === e.value);
          cellInfo.data.RESPONSABLES = {
            ID_ACTIVIDAD: cellInfo.data.ID_ACTIVIDAD,
            ID_RESPONSABLE: e.value,
            NOMBRE: responsable[0].NOMBRE,
            FOTO: responsable[0].FOTO,
            iconNameUser: responsable[0].iconNameUser
          };
          if(e.value === this.USUARIO_LOCAL)
            cellInfo.data.ACT_MIAS = true;
          else
            cellInfo.data.ACT_ASIG = true;
          this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'RESPONSABLES', cellInfo.data.RESPONSABLES);
        };
      }
      this.conCambios++;
    }
  }

  onValueChangedCargoResponsable(e:any, cellInfo:any) {
    const npos:any = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === cellInfo.data.RESPONSABLES);
    const data:any = this.DResponsables[npos].CARGOS.filter((d:any) => d.ID_CARGO === e.value);
  }

  onValueColaboradores(e:any, cellInfo:any, tipo:string, screen:string) {
    if(this.prmUsrAplBarReg.accion.match('new|update')) {
      var newItem:any = {};
      if(e.value.length > 0) {
        if (screen === 'web') {
          if(cellInfo.data.RESPONSABLES !== '') {
            if(e.value.findIndex((d:any) => d.ID_RESPONSABLE === cellInfo.data.RESPONSABLES) === -1) {
              var newCol:any = [];
              e.value.forEach((ele:any) => {
                const npos:any = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === ele);
                if (npos !== -1) {
                  newItem.ID_RESPONSABLE = ele;
                  newItem.NOMBRE = this.DResponsables[npos].NOMBRE;
                  newItem.TIPO = 'COLABORADOR';
                  newItem.FOTO = this.DResponsables[npos].FOTO;
                  newItem.iconNameUser = this.DResponsables[npos].iconNameUser;
                  
                  if(ele === this.USUARIO_LOCAL)
                    cellInfo.data.ACT_COLAB = true;
                }
                newCol.push(JSON.parse(JSON.stringify(newItem)));
              });
              cellInfo.data.COLABORADORES = e.value;
              this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'COLABORADORES', cellInfo.data.COLABORADORES);
            } else {
              showToast('El usuario seleccionado no puede ser RESPONSABLE Y COLABORADOR en la misma tarea.', 'error');
              return;
            }
          } else {
            var newCol:any = [];
            e.value.forEach((ele:any) => {
              const npos:any = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === ele);
              if (npos !== -1) {
                newItem.ID_RESPONSABLE = ele;
                newItem.NOMBRE = this.DResponsables[npos].NOMBRE;
                newItem.TIPO = 'COLABORADOR';
                newItem.FOTO = this.DResponsables[npos].FOTO;
                newItem.iconNameUser = this.DResponsables[npos].iconNameUser;
  
                if(ele === this.USUARIO_LOCAL)
                  cellInfo.data.ACT_COLAB = true;
              }
              newCol.push(JSON.parse(JSON.stringify(newItem)));
            });
            cellInfo.data.COLABORADORES = e.value;
            this.TreeListTareas.instance.cellValue(cellInfo.rowIndex, 'COLABORADORES', cellInfo.data.COLABORADORES);
          };
          this.conCambios++;
        } else if (screen === 'movil') {
          if(this.FTareas.RESPONSABLES !== '') {
            if(e.value.findIndex((d:any) => d.ID_RESPONSABLE === this.FTareas.RESPONSABLES.ID_RESPONSABLE) === -1) {
              var newCol:any = [];
              e.value.forEach((ele:any) => {
                const npos:any = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === ele.ID_RESPONSABLE);
                if (npos !== -1) {
                  newItem.ID_RESPONSABLE = ele;
                  newItem.NOMBRE = this.DResponsables[npos].NOMBRE;
                  newItem.TIPO = 'COLABORADOR';
                  newItem.FOTO = this.DResponsables[npos].FOTO;
                  newItem.iconNameUser = this.DResponsables[npos].iconNameUser;
                  
                  if(ele === this.USUARIO_LOCAL)
                    this.FTareas.ACT_COLAB = true;
  
                }
                newCol.push(JSON.parse(JSON.stringify(newItem)));
              });
              this.FTareas.COLABORADORES = newCol;
            } else {
              showToast('El usuario seleccionado no puede ser RESPONSABLE Y COLABORADOR en la misma tarea.', 'error');
              return;
            }
          } else {
            var newCol:any = [];
            e.value.forEach((ele:any) => {
              const npos:any = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === ele.ID_RESPONSABLE);
              if (npos !== -1) {
                newItem.ID_RESPONSABLE = ele;
                newItem.NOMBRE = this.DResponsables[npos].NOMBRE;
                newItem.TIPO = 'COLABORADOR';
                newItem.FOTO = this.DResponsables[npos].FOTO;
                newItem.iconNameUser = this.DResponsables[npos].iconNameUser;
                
                if(ele === this.USUARIO_LOCAL)
                  this.FTareas.ACT_COLAB = true;
              }
              newCol.push(JSON.parse(JSON.stringify(newItem)));
            });
            this.FTareas.COLABORADORES = newCol;
          };
          if(this.accionInMovil !== 'consulta')
            this.conCambios++;
        }
      }
    }
  }

  // Inicio de edicion mediante click
  startEdit(e:any, clase:any) {
    if(e.rowType === "data") {
      e.component.editRow(e.rowIndex);
      this.esEdicionFila = true;
      this.rowApplyChanges = true;
      this.rowNew = false;
    }
  }

  // Operaciones de grid
  operGrid(e:any, operacion:any, tipo:string) {
    switch (operacion) {
      case 'new':
        //valida si la aplicacion activa necesita parametros de entrada antes de agregar la nueva fila.
        if(this.APLICACION === 'GES-003') {
          if(this.DatosGes00.ID_CARGO === '' || this.DatosGes00.NOMBRE === '') {
            showToast('Falta información del Cargo.', 'error');
            return;
          };
        }
        this.rowNew = false;
        // this.esEdicionFila = true;
        this.rowApplyChanges = true;
        // this.rowDelete = false;
        this.prmUsrAplBarReg.accion = 'new';
        this.TreeListTareas.instance.addRow();
        break;

      case 'save':
        this.TreeListTareas.instance.saveEditData();
        // this.prmUsrAplBarReg.accion = 'save';
        break;

      case 'cancel':
        this.TreeListTareas.instance.cancelEditData();
        this.prmUsrAplBarReg.accion = '';
        this.rowApplyChanges = false;
        this.rowEdit = false;
        this.rowNew = true;
        this.esEdicionFila = false;
        break;

      default:
        break;
    }
  }

  opPrepararModificar() {
    if(this.filasSeleccData !== '') {
      this.RFechas = new UntypedFormGroup({
        inicio: new UntypedFormControl(new Date()),
        final: new UntypedFormControl(new Date()),
      });
    }
    this.TreeListTareas.instance.editRow(this.filasSeleccData[0].ITEM);
  }

  opPrepararNuevaFila(cellInfo:any, accion:string) {
    if(accion === 'new') {
      if (!this.esEdicionFila) {
        switch (cellInfo.data.CLASE) {
          case 'RESPONSABILIDADES':
            this.CLASE_TAREAS = 'RESPONSABILIDADES';
            break;
    
          case 'TAREAS':
            this.CLASE_TAREAS = 'TAREAS';
            break;
    
          case 'EVENTOS':
            this.CLASE_TAREAS = 'EVENTOS';
            break;

          case 'NODOS':
            switch (cellInfo.data.NOMBRE) {
              case 'Responsabilidades':
                this.CLASE_TAREAS = 'RESPONSABILIDADES';
                break;

              case 'Tareas':
                this.CLASE_TAREAS = 'TAREAS';
                break;
        
              case 'Eventos':
                this.CLASE_TAREAS = 'EVENTOS';
                break;

              default:
                break;
            }
            break;

          default:
            break;
        }

        if (cellInfo !== '') {
          //valida si la aplicacion activa necesita parametros de entrada antes de agregar la nueva fila.
          if(this.APLICACION === 'GES-003') {
            if(this.DatosGes00.ID_CARGO === '' || this.DatosGes00.NOMBRE === '') {
              showToast('Falta información del Cargo.', 'error');
              return;
            };
          }
          this.TreeListTareas.instance.addRow(cellInfo.data.ID_ACTIVIDAD);
        } else {
          this.TreeListTareas.instance.addRow();
        }
        // this.rowNew = false;

        // if (this.APLICACION === 'GES-003') {
        //   this.filasSeleccResponsabilidades = [cellInfo.data.ID_ACTIVIDAD];
        //   this.rowApplyChanges = true;
        // }
        // if (this.APLICACION === 'GES-001')
          // cellInfo.data.visibleBtnCambios = true;

        this.prmUsrAplBarReg.accion = 'new';
      } else {
        if (this.APLICACION === 'GES-001')
          showToast('No puede Agregar un Tarea si esta en Edición la anterior.', 'warning');
        if (this.APLICACION === 'GES-003')
          showToast('No puede Agregar una Responsabilidad si esta en Edición la anterior.', 'warning');
      }
    };
    if(accion === 'cancel') {
      this.esEdicionFila = false;
      // cellInfo.data.visibleBtnCambios = false;
      cellInfo.data = JSON.parse(JSON.stringify(this.dataTarea_prev));
      this.TreeListTareas.instance.cancelEditData();
      this.filasSeleccData = '';
      this.prmUsrAplBarReg.accion = '';
      this.TreeListTareas.instance.refresh();
    };
    if(accion === 'save') {
      this.esEdicionFila = false;
      this.TreeListTareas.instance.saveEditData();
      // cellInfo.data.visibleBtnCambios = false;
      // this.prmUsrAplBarReg.accion = 'save';
      // this.filasSeleccData = '';
    };
  }

  opPrepararGuardar(datos:any, screen:string) {
    if ( this.conCambios > 0) {
      //valida fechas
      const fecha_inicio: any = new Date(datos.FECHA_INICIO);
      const fecha_final: any = new Date(datos.FECHA_FIN);
      if(fecha_inicio > fecha_final) {
        showToast('La fecha de inicio no puede ser mayor a la fecha final.', 'error');
        return;
      }

      var prm:any;
      var act:any = JSON.parse(JSON.stringify(datos));
      var newItem:any = {};
      var newCol:any = [];
      act.COLABORADORES.forEach((ele:any) => {
        var npos:any = -1;
        if(this.prmUsrAplBarReg.accion === 'new')
          npos = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === ele);
        if(this.prmUsrAplBarReg.accion === 'update')
          npos = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === ele.ID_RESPONSABLE);

        if (npos !== -1) {
          newItem.ID_RESPONSABLE = this.DResponsables[npos].ID_RESPONSABLE;
          newItem.NOMBRE = this.DResponsables[npos].NOMBRE;
          newItem.TIPO = 'COLABORADOR';
          newItem.FOTO = this.DResponsables[npos].FOTO;
          newItem.iconNameUser = this.DResponsables[npos].iconNameUser;
        }
        newCol.push(JSON.parse(JSON.stringify(newItem)));
      });
      act.COLABORADORES = newCol;
      if(this.prmUsrAplBarReg.accion === 'update' && this.DTareasUpdate.length > 0) {
        act.PERIODO_FRECUENCIA = JSON.stringify(act.PERIODO_FRECUENCIA);
        this.DTareasUpdate[0].PERIODO_FRECUENCIA = JSON.stringify(this.DTareasUpdate[0].PERIODO_FRECUENCIA);
        prm = {USUARIO: this.USUARIO_LOCAL, ACTIVIDAD: act, UPDATE: this.DTareasUpdate[0]};
      } else {
        prm = {USUARIO: this.USUARIO_LOCAL, ACTIVIDAD: act};
      };

      switch (this.APLICACION) {
        case 'GES-001':
          this._sdatos.saveActividades('save', prm).subscribe((data: any) => {
            this._sdatos.loadingVisible = false;
            const res = validatorRes(data);
            const mensaje = res[0].ErrMensaje;
            if (mensaje !== '') {
              showToast(mensaje, 'error');
            } else {
              this.DTareasUpdate = [];
              this.filasSeleccData = '';
              this.conCambios = 0;
              showToast('Registro exitoso.', 'success');

              var TIPO_TAREA:any = '';
              switch (prm.ACTIVIDAD.CLASE) {
                case 'RESPONSABILIDADES':
                  TIPO_TAREA = 'RESPONSABILIDAD';
                  break;

                case 'TAREAS':
                  TIPO_TAREA = 'TAREA';
                  break;

                case 'EVENTOS':
                  TIPO_TAREA = 'EVENTO';
                  break;
              
                default:
                  break;
              }

              //notificacion al Responsable
              const usr_env:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === prm.USUARIO);
              const usr_rec:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === prm.ACTIVIDAD.RESPONSABLES.ID_RESPONSABLE);
              if (this.prmUsrAplBarReg.accion === 'new') {
                var msj:any = '';
                if (TIPO_TAREA === 'RESPONSABILIDAD' || TIPO_TAREA === 'TAREA')
                  msj = usr_env[0].NOMBRE+', te asignó una '+TIPO_TAREA;
                if (TIPO_TAREA === 'EVENTO')
                  msj = usr_env[0].NOMBRE+', te asignó un '+TIPO_TAREA;

                const dataNotificacion:any = {
                  APLICACION: this.prmUsrAplBarReg.aplicacion,
                  FECHA: new Date(),
                  USUARIO_ENV: this.USUARIO_LOCAL,
                  USUARIO_REC: usr_rec[0].ID_RESPONSABLE,
                  DESCRIPCION: msj,
                  TIPO: 'AUTOMATICA',
                  FECHA_UPDATE: new Date(),
                  ESTADO: 'Enviado'
                }
                // API guardado de datos
                const data1:any = {
                  TIPO: 'NOTIFICACION',
                  DATOS: dataNotificacion
                }
                this.socket.saveInfo('save', data1).subscribe((data) => {
                  const res = JSON.parse(data.data);
                  if (res[0].ErrMensaje !== '') {
                    this.showModal(res[0].ErrMensaje, 'Error al enviar notificación.');
                  } else {
                    this.socket.sendNotifications(dataNotificacion);
                  }
                });

                prm.ACTIVIDAD.COLABORADORES.forEach((ele:any) => {
                  const usr_rec:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === ele.ID_RESPONSABLE);
                  const dataNotificacion:any = {
                    FECHA: new Date(),
                    USUARIO_ENV: this.USUARIO_LOCAL,
                    USUARIO_REC: usr_rec[0].ID_RESPONSABLE,
                    DESCRIPCION: usr_env[0].NOMBRE+', te añadio como Colaborador a una '+TIPO_TAREA,
                    TIPO: 'AUTOMATICA',
                    ESTADO: 'Enviado',
                    APLICACION: this.prmUsrAplBarReg.aplicacion,
                    FECHA_UPDATE: new Date()
                  }
                  const data2:any = {
                    TIPO: 'NOTIFICACION',
                    DATOS: dataNotificacion
                  }
                  // API guardado de datos
                  this.socket.saveInfo('save', data2).subscribe((data) => {
                    const res = JSON.parse(data.data);
                    if (res[0].ErrMensaje !== '') {
                      this.showModal(res[0].ErrMensaje, 'Error al enviar notificación.');
                    } else {
                      this.socket.sendNotifications(dataNotificacion);
                    }
                  });
                });

              } else if (this.prmUsrAplBarReg.accion === 'update') {
                var msj:any = '';
                if (TIPO_TAREA === 'RESPONSABILIDAD' || TIPO_TAREA === 'TAREA')
                  msj = usr_env[0].NOMBRE+', modificó una '+TIPO_TAREA;
                if (TIPO_TAREA === 'EVENTO')
                  msj = usr_env[0].NOMBRE+', modificó un '+TIPO_TAREA;

                const dataNotificacion:any = {
                  APLICACION: this.prmUsrAplBarReg.aplicacion,
                  FECHA: new Date(),
                  USUARIO_ENV: this.USUARIO_LOCAL,
                  USUARIO_REC: usr_rec[0].ID_RESPONSABLE,
                  DESCRIPCION: msj,
                  TIPO: 'AUTOMATICA',
                  FECHA_UPDATE: new Date(),
                  ESTADO: 'Enviado'
                }
                const data1:any = {
                  TIPO: 'NOTIFICACION',
                  DATOS: dataNotificacion
                }
                // API guardado de datos
                this.socket.saveInfo('save', data1).subscribe((data) => {
                  const res = JSON.parse(data.data);
                  if (res[0].ErrMensaje !== '') {
                    this.showModal(res[0].ErrMensaje, 'Error al enviar notificación.');
                  } else {
                    this.socket.sendNotifications(dataNotificacion);
                  }
                });

                prm.ACTIVIDAD.COLABORADORES.forEach((ele:any) => {
                  const usr_rec:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === ele.ID_RESPONSABLE);
                  const dataNotificacion:any = {
                    APLICACION: this.prmUsrAplBarReg.aplicacion,
                    FECHA: new Date(),
                    USUARIO_ENV: this.USUARIO_LOCAL,
                    USUARIO_REC: usr_rec[0].ID_RESPONSABLE,
                    DESCRIPCION: usr_env[0].NOMBRE+', modifico una '+TIPO_TAREA,
                    TIPO: 'AUTOMATICA',
                    FECHA_UPDATE: new Date(),
                    ESTADO: 'Enviado'
                  }
                  const data2:any = {
                    TIPO: 'NOTIFICACION',
                    DATOS: dataNotificacion
                  }
                  // API guardado de datos
                  this.socket.saveInfo('save', data2).subscribe((data) => {
                    const res = JSON.parse(data.data);
                    if (res[0].ErrMensaje !== '') {
                      this.showModal(res[0].ErrMensaje, 'Error al enviar notificación.');
                    } else {
                      this.socket.sendNotifications(dataNotificacion);
                    }
                  });
                });
                
              }


              if(screen === 'movil') {
                // this.FTareas.RESPONSABLES = data_res;
                switch (this.FTareas.CLASE) {
                  case 'RESPONSABILIDADES':
                    const npos1:any = this.DResponsabilidades.findIndex((d:any) => d.ID_ACTIVIDAD === this.FTareas.ID_ACTIVIDAD);
                    if(npos1 !== -1)
                      this.DResponsabilidades[npos1] = this.FTareas;
                    else
                      this.DResponsabilidades.push(this.FTareas);
                    break;
                  case 'TAREAS':
                    const npos2:any = this.DActividades.findIndex((d:any) => d.ID_ACTIVIDAD === this.FTareas.ID_ACTIVIDAD);
                    if(npos2 !== -1)
                      this.DActividades[npos2] = this.FTareas;
                    else
                      this.DActividades.push(this.FTareas);
                    break;
                  case 'EVENTO':
                    const npos3:any = this.DEventos.findIndex((d:any) => d.ID_ACTIVIDAD === this.FTareas.ID_ACTIVIDAD);
                    if(npos3 !== -1)
                      this.DEventos[npos3] = this.FTareas;
                    else
                      this.DEventos.push(this.FTareas);
                    break;
                
                  default:
                    break;
                }
                this.FTareas = {
                  ID_ACTIVIDAD: '',
                  ID_ACTIVIDAD_PADRE: '',
                  ITEM: '',
                  NOMBRE: '',
                  ESTADO: '',
                  FECHA_INICIO: '',
                  FECHA_FIN: '',
                  DESCRIPCION: '',
                  RESPONSABLES: '',
                  COLABORADORES: [],
                  TIPO: '',
                  PRIORIDAD: '',
                  COSTO: '',
                  DURACION: '',
                  CLASE: '',
                  FRECUENCIA: '',
                  PERIODO_FRECUENCIA: '',
                  PROGRAMACION: '',
                  INTERVALO_FRECUENCIA: '',
                  SUB_TAREAS: [],
                  REPETIR: false,
                  TODO_DIA: false,
                  ANULADO: false,
                  readOnlyFechaInicio: false,
                  readOnlyFechaFinal: false,
                  readOnlyRepetir: false,
                }
              }

            };
          },
            (err => {
              this._sdatos.loadingVisible = false;
              this.showModal(err.message, 'error');
            })
          );
          break;

        case 'GES-003':
          // if( prm.ACTIVIDAD.ID_ACTIVIDAD_PADRE === -1 ) {
          //   prm.ACTIVIDAD.TEMP = -20;
          //   prm.ACTIVIDAD.TEMP = -20;
          // }
          const datos:any = { accion: 'cargar', data: prm };
          this.DatosResponsabilidades.emit(datos);
          break;
      
        default:
          break;
      };

      
    }
  }

  // Ejecuta la eliminación de una actividad
  AccionEliminar(actividad:any, elemento:any): void {
    // API eliminación de datos
    const prm = { ID_ACTIVIDAD: actividad, CATEGORIA: elemento };
    this._sdatos
      .deleteActividades('delete', prm)
      .subscribe((data) => {
        const res = validatorRes(data);
        try {
          // if ( (res.token != undefined) ){
          //   const refreshToken = res.token;
          //   localStorage.setItem("token", refreshToken);
          // }
          if (res[0].ErrMensaje !== '') {
            this.showModal(res[0].ErrMensaje, 'error');
            return;
          }

          // Elimina y posiciona en el Array de Consulta
          // this.toaMessage = "Actividad eliminada!";
          showToast('Actividad eliminada', 'success');
        } 
        catch (error) {
          this.showModal('Error al eliminar actividad: '+error, 'error');
        }
    });
  }
  
  showChatsComentarios(e:any, cellInfo:any) {
    var RESPONSABLES:any;
    if(cellInfo.data.CLASE === 'TAREAS')
      RESPONSABLES = this.DResponsables;
    if(cellInfo.data.CLASE === 'RESPONSABILIDADES')
      RESPONSABLES = this.DCargos;
    this._sdatos.setObsGesproInfo({
      TITULO: cellInfo.data.NOMBRE,
      VISIBLE: true,
      DATA: cellInfo.data,
      readOnly: this.readOnly
    });
  }

  onContextMenuPreparing(e:any, elemento:any) {
    if(this.APLICACION === 'GES-003' && this.readOnly) return;
    if(e.row.data.CLASE !== 'NODOS') {
      let items: any = [];
  
      const selectedItems = [e.row.key];
  
      const hasEditData = e.component.hasEditData();
  
      if (selectedItems.length === 0) {
        items = [
          {
            text: "No selected rows",
            disabled: true
          }
        ];
      } else {
        const subItems: any = [];
        const rowData = e.component.getSelectedRowsData();
  
        selectedItems.forEach(item => {
          rowData.forEach((data:any) => {
            if (item === data.ID_ACTIVIDAD) {
              subItems.push({
                text: item,
                items: [
                  {
                    text: "Editar actividad",
                    onClick: () => {
                      e.component.editRow(e.component.getRowIndexByKey(item));
                      this.esEdicionFila = true;
                    }
                  },
                  {
                    template: function() {
                      return `<div> Actividad: ${data.ID_ACTIVIDAD} </div>
                              <div> Detalle: ${data.NOMBRE} </div>
                              <div> Padre: ${data.ID_ACTIVIDAD_PADRE} </div>
                              <div> Responsables: ${data.RESPONSABLES} </div>
                              <div> Estado: ${data.ESTADO} </div>
                              `;
                    },
                    onClick: () => {
                      console.log(data);
                    }
                  }
                ]
              });
            }
          });
        });
  
        items = [
          // {
          //   text: "Actividades seleccionadas",
          //   items: subItems
          // }
        ];
      }
  
      items.push(
        {
          text: "Editar actividad",
          disabled: this.esEdicionFila,
          onClick: () => {
            if (selectedItems.length !== 0) {
              const npos:any = this.DTareas.findIndex((d:any) => d.ID_ACTIVIDAD === selectedItems[0]);
              this.DTareas[npos].readOnlyResponsables = false;
              e.component.editRow(e.component.getRowIndexByKey(selectedItems[0]));
              this.esEdicionFila = true;
            }
          }
        },
        {
          text: "Crear actividad",
          disabled: this.esEdicionFila,
          onClick: () => {
            // e.component.addRow();
            this.adicionarFila(e, elemento);
            this.esEdicionFila = true;
          }
        },
        // {
        //   text: "Guardar cambios",
        //   disabled: !hasEditData,
        //   onClick: () => {
        //     e.component.saveEditData();
        //   }
        // },
        {
          text: "Cancelar",
          disabled: !this.esEdicionFila,
          onClick: () => {
            e.component.cancelEditData();
            this.esEdicionFila = false;
          }
        },
        {
          text: "Eliminar actividad",
          onClick: () => {
            if (selectedItems.length === 0) {
              showToast('No hay actividad seleccionada', 'error');
              return;
            }
  
            // Elimina filas seleccionadas
            let nom_act = "";
            let actividades:any = '';
            // if (elemento === 'tarea') {
              const index = this.DTareas.findIndex(a => a.ID_ACTIVIDAD === selectedItems[0]);
              actividades = this.DTareas.filter(a => a.ID_ACTIVIDAD_PADRE === this.DTareas[index].ID_ACTIVIDAD);
              nom_act = this.DTareas[index].NOMBRE;
            // };
            // if (elemento === 'responsabilidad') {
            //   const index = this.DResponsabilidades.findIndex(a => a.ID_ACTIVIDAD === selectedItems[0]);
            //   actividades = this.DResponsabilidades.filter(a => a.ID_ACTIVIDAD_PADRE === this.DResponsabilidades[index].ID_ACTIVIDAD);
            //   nom_act = this.DResponsabilidades[index].NOMBRE;
            // };
            var msj:string;
            if(actividades.length > 0)
              msj = 'La tarea seleccionada tiene tareas hijas registradas, si la elimina, las tareas hijas seran eliminadas!';
            else 
              msj = '¿Desea eliminar esta tarea: '+nom_act+'?';
            Swal.fire({
              title: '',
              text: msj,
              iconHtml: "<i class='icon-alert-ol'></i>",
              showCancelButton: true,
              confirmButtonColor: '#DF3E3E',
              cancelButtonColor: '#438ef1',
              cancelButtonText: 'No',
              confirmButtonText: 'Sí, eliminar'
            }).then((result) => {
              if (result.isConfirmed) {
                selectedItems.forEach((item:any) => {
                  const index = this.DTareas.findIndex(a => a.ID_ACTIVIDAD === item);
                  if(this.APLICACION === 'GES-001')
                    this.AccionEliminar(item, elemento);
                  if(this.APLICACION === 'GES-003') {
                    this.DTareas[index].ANULADO = true;
                    const prm:any = { accion: 'eliminar', data: this.DTareas[index] }
                    this.DatosResponsabilidades.emit(prm);
                  }
                  this.DTareas.splice(index, 1);
                  actividades.forEach((actividad:any) => {
                    const index = this.DTareas.findIndex(a => a.ID_ACTIVIDAD === actividad.ID_ACTIVIDAD);
                    this.DTareas.splice(index, 1);
                  });
                  this.TreeListTareas.instance.refresh();
                });
              }
            });
  
          }
        }
      );
  
      e.items = items;
    }
  }

  onRowClick(e:any) {
    if( !(e.event.target.parentElement.classList.contains("dx-treelist-expanded") ||
        e.event.target.parentElement.classList.contains("dx-treelist-collapsed") ||
        e.event.target.parentElement.classList.contains("dx-button-content") ) 
    ) {
      if (!this.readOnly) {
        if (!this.esEdicionFila) {
          if(this.APLICACION === 'GES-001') {
            if(e.data.CLASE !== 'RESPONSABILIDADES' && e.data.CLASE !== 'NODOS') {
              if (!this.esEdicionFila) {
                if(e.rowType === "data") {
                  if(e.data.COLABORADORES.findIndex((d:any) => d.ID_RESPONSABLE === this.USUARIO_LOCAL) !== -1) {
                    e.component.cancelEditData(this.filasSeleccData.rowIndex);
                    this.esEdicionFila = false;
                    showToast('No puede modificar esta Tarea al ser Colaborador.', 'warning');
                  } else {
                    e.component.editRow(e.rowIndex);
                    e.data.modoEdicion = true;
                    e.data.readOnlyResponsables = false;
                    e.data.readOnlyFechaInicio = false;
                    e.data.readOnlyFechaFinal = false;
                    this.esEdicionFila = true;
                    this.filasSeleccData = e;
                    this.dataTarea_prev = JSON.parse(JSON.stringify(e.data));
                    this.prmUsrAplBarReg.accion = 'update';
                  }
                }
              } else {
                e.component.cancelEditData(this.filasSeleccData.rowIndex);
                this.esEdicionFila = false;
                if(e.rowType === "data") {
                  if(e.data.COLABORADORES.findIndex((d:any) => d.ID_RESPONSABLE === this.USUARIO_LOCAL) !== -1) {
                    e.component.cancelEditData(this.filasSeleccData.rowIndex);
                    this.esEdicionFila = false;
                    showToast('No puede modificar esta Tarea al ser Colaborador.', 'warning');
                  } else {
                    e.component.editRow(e.rowIndex);
                    e.data.modoEdicion = true;
                    e.data.readOnlyResponsables = false;
                    e.data.readOnlyFechaInicio = false;
                    e.data.readOnlyResponsables = false;
                    this.esEdicionFila = true;
                    this.filasSeleccData = e;
                    this.dataTarea_prev = JSON.parse(JSON.stringify(e.data));
                    this.prmUsrAplBarReg.accion = 'update';
                  }
                }
              };
            } else {
              if(e.data.CLASE === 'RESPONSABILIDADES') {
                // if (!this.esEdicionFila) {
                //   if(e.rowType === "data") {
                //     e.component.editRow(e.rowIndex);
                //     e.data.modoEdicion = true;
                //     e.data.readOnlyResponsables = true;
                //     e.data.readOnlyFechaInicio = true;
                //     e.data.readOnlyResponsables = false;
                //     this.esEdicionFila = true;
                //     this.filasSeleccData = e;
                //     this.dataTarea_prev = JSON.parse(JSON.stringify(e.data));
                //     this.prmUsrAplBarReg.accion = 'update';
                //   }
                // } else {
                //   e.component.cancelEditData(this.filasSeleccData.rowIndex);
                //   this.esEdicionFila = false;
                //   if(e.rowType === "data") {
                //     e.component.editRow(e.rowIndex);
                //     e.data.modoEdicion = true;
                //     e.data.readOnlyResponsables = true;
                //     e.data.readOnlyFechaInicio = true;
                //     e.data.readOnlyResponsables = false;
                //     this.esEdicionFila = true;
                //     this.filasSeleccData = e;
                //     this.dataTarea_prev = JSON.parse(JSON.stringify(e.data));
                //     this.prmUsrAplBarReg.accion = 'update';
                //   }
                // };
                showToast('No puede modificar las Responsabilidades.', 'warning');
              };
            }
          };
          if(this.APLICACION === 'GES-003') {
            // Valida que haya informacion de producto principal
            if(e.rowType === "data") {
              e.component.editRow(e.rowIndex);
              e.data.modoEdicion = true;
              e.data.readOnlyResponsables = false;
              e.data.readOnlyFechaInicio = false;
              e.data.readOnlyResponsables = false;
              this.rowNew = false;
              this.esEdicionFila = true;
              this.filasSeleccData = e;
              this.dataTarea_prev = JSON.parse(JSON.stringify(e.data));
              this.rowApplyChanges = true;
              this.prmUsrAplBarReg.accion = 'update';
            }
          }
        } else {
          showToast('No puede modificar esta Tarea si esta en Edición la tarea anterior.', 'warning');
          if(this.filasSeleccData.rowIndex !== null && this.filasSeleccData.rowIndex !== undefined) {
            let rowIndex = this.filasSeleccData.rowIndex;
            let row = e.component.getRowElement(rowIndex)[0];
            row.classList.add("row-animation");
            this.focusedRowIndex = [rowIndex];
            setTimeout(() => {
              row.classList.remove("row-animation");
            }, 2000);
          }
        }
      }
    }
  }

  async adicionarFila(e:any, tipo:any) {

    const apiRest = this._sdatos.getConsecutivo('CONSECUTIVO','');
    let res = await lastValueFrom(apiRest, {defaultValue: true});
    res = JSON.parse(res.data); 
    this.CONSECUTIVO = res[0].CONSECUTIVO;

    if(tipo.match('TAREAS|RESPONSABILIDADES')) {
      const filaAdd: clsGesActividades = 
                      { ID_ACTIVIDAD : this.CONSECUTIVO,
                        ID_ACTIVIDAD_PADRE: e.row.data.ID_ACTIVIDAD,
                        NOMBRE : '',
                        DESCRIPCION : '',
                        RESPONSABLES : '',
                        COLABORADORES : [],
                        ESTADO : 'SIN INICIAR',
                        TIPO : '',
                        PRIORIDAD : '',
                        COSTO : 0,
                        FECHA_INICIO : new Date(),
                        FECHA_FIN : new Date(),
                        CLASE: tipo,
                        FRECUENCIA: '',
                        PROGRAMACION: '',
                        PERIODO_FRECUENCIA: [],
                        INTERVALO_FRECUENCIA : 0,
                        DURACION : '0',
                        ITEM : 1,
                        ARCHIVOS : [],
                        REPETIR: false,
                        TODO_DIA: false,
                        ANULADO: false,
                        visibleBtnComentarios: false,
                        readOnlyResponsables: false,
                        readOnlyFechaInicio: false,
                        readOnlyFechaFinal: false,
                        readOnlyTipo: false,
                        readOnlyRepetir: false
                      };
      // this.DTareas.splice(this.filasSeleccTareas[0], 0, filaAdd);
      this.DTareas.push(filaAdd);
      e.event.preventDefault();
      setTimeout(() => {
        e.component.editRow(e.component.getRowIndexByKey(this.CONSECUTIVO));
      }, 300);
    }
  }

  onSelectionChanged(e:any, elemento:any) {
    if(this.esEdicionFila) {
      if (this.CLASE_TAREAS === 'TAREAS')
        this.filasSeleccTareas = e.selectedRowKeys;
      else {
        this.filasSeleccResponsabilidades = e.selectedRowKeys;
        if(!this.readOnly)
          this.rowEdit = true;
      }
    }
  }

  valoresObjetos(obj: string, datos:any, accion:string) {
    
    if (obj === 'responsables' || obj === 'todos'){
      const prm:any = {};
      this._sdatos.getResponsables('RESPONSABLES', prm).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token !== undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        for (let i = 0; i < res.length; i++) {
          const element = res[i];
          element.ITEM = i;
          if(element.FOTO === '' || element.FOTO === undefined || element.FOTO === null) {
            const npos: any = element.NOMBRE.indexOf(" ");
            const name = element.NOMBRE.charAt(0).toUpperCase();
            const lastName = element.NOMBRE.substring(npos + 1, element.NOMBRE.length + 1);
            const Lape = lastName.charAt(0).toUpperCase();
            const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
            element.iconNameUser = newName;
          }
        };

        this.DResponsables = res;
        this.DColaboradores = res;

        // Baja las imagenes
        this._sgenerales.bajar_imagen('bajar imagenes',
              { RESPONSABLES: [{}], 
                params: { comprimir: true, tamX: 210, tamY: 280 } },'spActividades')
        .subscribe({ 
          next: (varch: any)=> {
            // Adiciona el path en el vector de la galería
            if (varch[0].ErrMensaje === '') {
              res.forEach((eleres:any) => {
                const ix = varch.findIndex((r:any) => r.etiqueta === eleres.ID_RESPONSABLE);
                if (ix !== -1) {
                  eleres.FOTO = varch[ix].path;
                  this.DResponsables.forEach((responsable:any) => {
                    if (responsable.ID_RESPONSABLE === eleres.ID_RESPONSABLE) {
                      responsable.FOTO = varch[ix].path;
                    }
                  });
                  this.DColaboradores.forEach((colaborador:any) => {
                    if (colaborador.ID_RESPONSABLE === eleres.ID_RESPONSABLE) {
                      colaborador.FOTO = varch[ix].path;
                    }
                  });
                }
              });
              
              if(this.APLICACION === 'GES-001') {
                this.groupedResponsables = false;

                this.DataResTareas.forEach((data:any) => {
                  if(data.CLASE !== 'NODOS') {
                    const posRes:any = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === data.RESPONSABLES.ID_RESPONSABLE);
                    if(posRes !== -1) {
                      const ID_RESPONSABLE:any = data.RESPONSABLES.ID_RESPONSABLE;
                      data.RESPONSABLES = {
                        ID_ACTIVIDAD: data.ID_ACTIVIDAD,
                        ID_RESPONSABLE: ID_RESPONSABLE,
                        NOMBRE: this.DResponsables[posRes].NOMBRE,
                        FOTO: this.DResponsables[posRes].FOTO,
                        iconNameUser: this.DResponsables[posRes].iconNameUser
                      }
                    } else {
                      const ID_RESPONSABLE:any = data.RESPONSABLES.ID_RESPONSABLE;
                      data.RESPONSABLES = {
                        ID_ACTIVIDAD: data.ID_ACTIVIDAD,
                        ID_RESPONSABLE: ID_RESPONSABLE,
                        NOMBRE: '',
                        FOTO: '',
                        iconNameUser: ''
                      }
                    }
                  }
                });

                this.onValueChangedFiltro('');
              };
              if(this.APLICACION === 'GES-003') {
                this.groupedResponsables = true;
                this.DColaboradores = res;
              };

            } else {
              if(this.APLICACION === 'GES-001') {
                this.groupedResponsables = false;
                this.DResponsables = res;
                this.DColaboradores = res;
              };
              if(this.APLICACION === 'GES-003') {
                this.groupedResponsables = true;
                this.DColaboradores = res;
              };
            }
          }, error: (err => {
            this.showModal('Error procesando imagenes: '+err.message, 'error');
          })
        });

      });
    };
    if (obj === 'actividad'){
      const prm:any = {ID_ACTIVIDAD: '-20'};
      this.loadingVisible = true;
      this._sdatos.getActividades('ACTIVIDAD', prm).subscribe((data: any)=> {
        this.loadingVisible = false;
        const res = validatorRes(data);
        if ( (data.token !== undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        if(res[0].ErrMensaje !== '') {
          showToast(res[0].ErrMensaje, 'error');
          this.DataResTareas = [];
          return;
        }
        for (let i = 0; i < res.length; i++) {
          const element = res[i];
          element.ITEM = i;
          element.visibleBtnComentarios = false;
          element.readOnlyResponsables = true;
          element.readOnlyTipo = true;
          if(element.PERIODO_FRECUENCIA === null || element.PERIODO_FRECUENCIA === '' || element.PERIODO_FRECUENCIA === undefined) {
            element.PERIODO_FRECUENCIA = [];
          } else {
            element.PERIODO_FRECUENCIA = JSON.parse(element.PERIODO_FRECUENCIA);
          }
        };
        this.DataResTareas = JSON.parse(JSON.stringify(res));
        this.DataResTareas.forEach((tarea:any) => {
          if (this.DataResTareas.findIndex((d:any) => tarea.ID_ACTIVIDAD_PADRE === d.ID_ACTIVIDAD ) === -1 ) {
            if ( tarea.CLASE === 'RESPONSABILIDADES'){
              tarea.TEMP = tarea.ID_ACTIVIDAD_PADRE;
              tarea.ID_ACTIVIDAD_PADRE = -20;
            };
            tarea.readOnlyFechaInicio = true;
            tarea.readOnlyFechaFinal = true;
          };
          // const prm:any = { data: tarea};
          // this.setProgramacion(prm, 'web');
        });
        this.DTareas = this.DataResTareas;
      });
    };
    if (obj === 'actividades' || obj === 'todos'){
      const prm:any = {USUARIO: datos.ID_RESPONSABLE};
      this.loadingVisible = true;
      this._sdatos.getActividades('ACTIVIDADES MAESTRO', prm).subscribe((data: any)=> {
        this.loadingVisible = false;
        const res = validatorRes(data);
        if ( (data.token !== undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        if(res[0].ErrMensaje !== '') {
          showToast(res[0].ErrMensaje, 'error');
          this.DataResTareas = [];
          this.DTareas = [];
          this.DActividades = [];
          this.DResponsabilidades = [];
          this.DEventos = [];
          return;
        }
        for (let i = 0; i < res.length; i++) {
          const element = res[i];
          element.ITEM = i;
          element.visibleBtnComentarios = false;
          element.readOnlyResponsables = true;
          element.readOnlyTipo = true;
          if(element.PERIODO_FRECUENCIA === null || element.PERIODO_FRECUENCIA === '' || element.PERIODO_FRECUENCIA === undefined) {
            element.PERIODO_FRECUENCIA = [];
          } else {
            element.PERIODO_FRECUENCIA = JSON.parse(element.PERIODO_FRECUENCIA);
          }
        };
        this.DataResTareas = JSON.parse(JSON.stringify(res));
        this.DataResTareas.forEach((tarea:any) => {
          if (this.DataResTareas.findIndex((d:any) => tarea.ID_ACTIVIDAD_PADRE === d.ID_ACTIVIDAD ) === -1 ) {
            if ( tarea.CLASE === 'TAREAS'){
              tarea.TEMP = tarea.ID_ACTIVIDAD_PADRE;
              tarea.ID_ACTIVIDAD_PADRE = -10;
            };
            if ( tarea.CLASE === 'RESPONSABILIDADES'){
              tarea.TEMP = tarea.ID_ACTIVIDAD_PADRE;
              tarea.ID_ACTIVIDAD_PADRE = -20;
            };
            if ( tarea.CLASE === 'EVENTOS'){
              tarea.TEMP = tarea.ID_ACTIVIDAD_PADRE;
              tarea.ID_ACTIVIDAD_PADRE = -30;
            };
            tarea.readOnlyFechaInicio = true;
            tarea.readOnlyFechaFinal = true;
          };
          const prm:any = { data: tarea};
          this.setProgramacion(prm, 'web');
        });
      });
    };
    if (obj === 'CONSECUTIVO'){
      this._sdatos.getConsecutivo('CONSECUTIVO', '').subscribe((data: any)=> {
        const res = validatorRes(data);
        if(res[0].ErrMensaje !== '') {
          showToast(res[0].ErrMensaje, 'error');
          this.TreeListTareas.instance.cancelEditData();
        };
        this.CONSECUTIVO = res[0].CONSECUTIVO;
      });
    };
    if (obj === 'estados' || obj === 'todos'){
      const prm:any = {};
      this._sdatos.getEstados('ESTADOS', prm).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        if(res[0].ErrMensaje !== '') {
          showToast(res[0].ErrMensaje, 'error');
          return;
        }
        this.DLEstados = res;
      });
    };
    if (obj === 'timeline'){
      const prm:any = {ID_ACTIVIDAD: this.FTareas.ID_ACTIVIDAD};
      this.loadingVisible = true;
      this._sdatos.getEstados('TIMELINE', prm).subscribe((data: any)=> {
        this.loadingVisible = false;
        const res = validatorRes(data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        if(res[0].ErrMensaje !== '') {
          showToast(res[0].ErrMensaje, 'error');
          return;
        }
        this.eventosHistorico = res;
        this.DTimeline = this.eventosHistorico.filter((d:any) => d.TIPO === 'MANUAL');
      });
      this.loadingVisible = false;
    };
    if (obj === 'config objeto'){
      const prm:any = {ID_USUARIO: this.USUARIO_LOCAL, ID_APLICACION: this.prmUsrAplBarReg.aplicacion, ID_OBJETO: 'TreeListTareas'};
      this._sdatos.getConsultaConfigObjeto('CONSULTA CONFIGURACION OBJETOS', prm).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        if(res[0].ErrMensaje !== '') {
          showToast(res[0].ErrMensaje, 'error');
          return;
        }
        const config_obj = JSON.parse(res[0].CONFIGURACION);
        return config_obj;
      });
    };
  }

  showModal(mensaje: any, title: any) {
    const tipo = title;
		Swal.fire({
			iconHtml: "<i class='icon-cancelar-ol error-color'></i>",
      confirmButtonColor: tipo==='Error' ? 'DF3E3E':'#0F4C81 !important',
			title: title,
			text: mensaje,
			allowOutsideClick: true,
			allowEscapeKey: false,
			allowEnterKey: false,
			backdrop: true,
			position: 'center',
			stopKeydownPropagation: false,
		});
	}

  mostrarOcultarFiltros(e:any) {
    this.MOFiltros = !this.MOFiltros;
  }


  // Configuración Operaciones Moviles

  ondblclickCard(accion:string, data:any) {
    this.dataTarea_prev = JSON.parse(JSON.stringify(this.FTareas));
    if(accion === 'nuevo'){
      this.activeAcordeonSubTareas = false;
      this.activeAcordeonHistorico = false;
      this.prmUsrAplBarReg.accion = 'new';
      this.newActivity(accion, data);
    }
    if(accion === 'editar') {
      this.FTareas = JSON.parse(JSON.stringify(data));
      this.valoresObjetos('timeline', '', '');
      //filtra las tareas hijas:
      switch (this.FTareas.CLASE) {
        case 'RESPONSABILIDADES':
          this.FTareas.SUB_TAREAS = this.DResponsabilidades.filter((d:any) => d.ID_ACTIVIDAD_PADRE === this.FTareas.ID_ACTIVIDAD);
          break;
        case 'TAREAS':
          this.FTareas.SUB_TAREAS = this.DActividades.filter((d:any) => d.ID_ACTIVIDAD_PADRE === this.FTareas.ID_ACTIVIDAD);
          break;
        case 'EVENTOS':
          this.FTareas.SUB_TAREAS = this.DEventos.filter((d:any) => d.ID_ACTIVIDAD_PADRE === this.FTareas.ID_ACTIVIDAD);
          break;
      
        default:
          break;
      }
      this.activeAcordeonSubTareas = true;
      this.activeAcordeonHistorico = true;
    }
    this.prmUsrAplBarReg.accion = 'update'
    this.visiblePopupEditarTareas = true;
    this.accionInMovil = accion;
    this.accordionPopupMovilExpand[1] = false;
    this.accordionPopupMovilExpand[0] = true;
  }

  async newActivity(accion:string, data:any) {
    if(data.CLASE === 'NODOS') {
      if(data.TIPO === 'Tareas') {
        this.FTareas.ID_ACTIVIDAD_PADRE = -10;
      }
      if(data.TIPO === 'Eventos') {
        this.FTareas.ID_ACTIVIDAD_PADRE = -20;
      }
    } else {
      this.FTareas.ID_ACTIVIDAD_PADRE = this.FTareas.ID_ACTIVIDAD;
    }
    this.FTareas.NOMBRE = '';
    this.FTareas.DESCRIPCION = '';
    this.FTareas.COLABORADORES = [];
    this.FTareas.ESTADO = 'Sin Iniciar';
    this.FTareas.PRIORIDAD = '';
    this.FTareas.FRECUENCIA = '';
    this.FTareas.PERIODO_FRECUENCIA = '';
    this.FTareas.INTERVALO_FRECUENCIA = 0;
    this.FTareas.COSTO = 0;
    this.FTareas.TODO_DIA = false;
    this.FTareas.ANULADO = false;
    this.FTareas.PROGRAMACION = '';
    
    this.FTareas.ACT_MIAS = false;
    this.FTareas.ACT_ASIG = false;
    this.FTareas.ACT_AREA = false;
    this.FTareas.ACT_COLAB = false;

    if (this.CLASE_TAREAS === 'TAREAS') {
      this.FTareas.CLASE = 'TAREAS';
      this.FTareas.RESPONSABLES = '';
      this.FTareas.FECHA_INICIO = new Date();
      this.FTareas.FECHA_FIN = new Date();
      this.FTareas.REPETIR = false;
      this.FTareas.readOnlyRepetir = false;
      this.FTareas.readOnlyFechaInicio = false;
      this.FTareas.readOnlyFechaFinal = false;
    };
    if (this.CLASE_TAREAS === 'RESPONSABILIDADES') {
      this.FTareas.CLASE = 'RESPONSABILIDADES';
      this.FTareas.FECHA_INICIO = null;
      this.FTareas.FECHA_FIN = null;
      this.FTareas.REPETIR = true;
      this.FTareas.readOnlyRepetir = true;
      this.FTareas.readOnlyFechaInicio = true;
      this.FTareas.readOnlyFechaFinal = true;
    };
    if (this.CLASE_TAREAS === 'EVENTOS') {
      this.FTareas.CLASE = 'EVENTOS';
      this.FTareas.RESPONSABLES = this.USUARIO_LOCAL;
      this.FTareas.FECHA_INICIO = new Date();
      this.FTareas.FECHA_FIN = new Date();
      this.FTareas.REPETIR = false;
      this.FTareas.readOnlyRepetir = false;
      this.FTareas.readOnlyFechaInicio = false;
      this.FTareas.readOnlyFechaFinal = false;
    };
    if (this.DTareas.length > 0) {
      const item = this.DTareas.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act});
      this.FTareas.ITEM = item.ITEM + 1;
    } else {
      this.FTareas.ITEM = 1;
    };
    if(this.APLICACION === 'GES-001') {
      const apiRest = this._sdatos.getConsecutivo('CONSECUTIVO', '');
      const resConsec = await lastValueFrom(apiRest, {defaultValue: true});
      const res = validatorRes(resConsec.data);
      if(res[0].ErrMensaje !== '') {
        showToast(res[0].ErrMensaje, 'error');
        // this.TreeListTareas.instance.cancelEditData();
      };
      this.CONSECUTIVO = res[0].CONSECUTIVO;
      this.FTareas.ID_ACTIVIDAD = this.CONSECUTIVO;
      this.FTareas.RESPONSABLES = '';
      this.FTareas.SUB_TAREAS = [];
      this.readOnlyTodoDia = false;
      this.readOnlyRepetir = false;
      this.readOnlyFrecuencia = false;
      this.activeAcordeonSubTareas = false;
      this.activeAcordeonHistorico = false;
    };
  }

  guardarTarea(e: any) {
    if(this.validatorData()) {
      this.opPrepararGuardar(this.FTareas, 'movil');
      this.accionInMovil = 'consulta';
      this.visiblePopupEditarTareas = false;
    }
  }

  cancelarTarea(e: any) {
    this.visiblePopupEditarTareas = false; 
    this.accionInMovil = '';
    this.conCambios = 0;
  }

  onSelectionChangedFiltroHistorico(e:any) {
    this.selectFiltroHistorico = e.item.value;
    switch (this.selectFiltroHistorico) {
      case 'Todo':
        this.DTimeline = this.eventosHistorico;
        break;

      case 'Novedades':
        this.DTimeline = this.eventosHistorico.filter((d:any) => d.TIPO === 'MANUAL');
        break;

      case 'Historico':
        this.DTimeline = this.eventosHistorico.filter((d:any) => d.TIPO === 'AUTOMATICO');
        break;
    
      default:
        this.DTimeline = this.eventosHistorico;
        break;
    }
  };

  guardarComentariosHistorico() {
    if(this.mesajeTextHistorico.length > 0) {
      var prm:any;
      prm = {USUARIO: this.USUARIO_LOCAL, DESCRIPCION: this.mesajeTextHistorico, ID_ACTIVIDAD: this.FTareas.ID_ACTIVIDAD};
      this._sdatos.saveComentarios('SAVE COMENTARIO', prm).subscribe((data: any) => {
        const res = validatorRes(data);
        const mensaje = res[0].ErrMensaje;
        if (mensaje !== '') {
          showToast(mensaje, 'error');
        } else {
          this.mesajeTextHistorico = '';
          this.valoresObjetos('timeline', '', '');
          showToast('Comentario agregado.', 'success');
        };
      },
        ((err:any) => {
          this._sdatos.loadingVisible = false;
          this.showModal(err.message, 'error');
        })
      );
    }
  }

  validatorData() {
    let mensaje:any='';
    var res:boolean = false;
    let isValid:boolean = false;
    let propiedadesVacias:any = [];
    let propiedadesVerificar:any = [];
    switch (this.CLASE_TAREAS) {
      case 'RESPONSABILIDADES':
        propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "PROGRAMACION", "CLASE", "FRECUENCIA", "REPETIR"];
        if((this.FTareas.NOMBRE !== '' && this.FTareas.NOMBRE !== null && this.FTareas.NOMBRE !== undefined) &&
          (this.FTareas.RESPONSABLES !== '' && this.FTareas.RESPONSABLES !== null && this.FTareas.RESPONSABLES !== undefined) &&
          (this.FTareas.PROGRAMACION !== '' && this.FTareas.PROGRAMACION !== null && this.FTareas.PROGRAMACION !== undefined) &&
          (this.FTareas.CLASE !== '' && this.FTareas.CLASE !== null && this.FTareas.CLASE !== undefined)
        ){
          if((this.FTareas.FRECUENCIA !== '' && this.FTareas.FRECUENCIA !== null && this.FTareas.FRECUENCIA !== undefined) && (this.FTareas.REPETIR === true)) {
            isValid = true;
            res = true;
          } else {
            for (let key in this.FTareas) {
              if (propiedadesVerificar.includes(key) && !this.FTareas[key]) {
                propiedadesVacias.push(key);
              }
            }
            if (propiedadesVacias.length > 0)
              mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

            res = false;
          };
        } else {
          for (let key in this.FTareas) {
            if (propiedadesVerificar.includes(key) && !this.FTareas[key]) {
              propiedadesVacias.push(key);
            }
          }
          if (propiedadesVacias.length > 0)
            mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

          res = false;
        }
        break;
        
      case 'TAREAS':
        propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "CLASE"];
        if((this.FTareas.NOMBRE !== '' && this.FTareas.NOMBRE !== null && this.FTareas.NOMBRE !== undefined) &&
          (this.FTareas.RESPONSABLES !== '' && this.FTareas.RESPONSABLES !== null && this.FTareas.RESPONSABLES !== undefined) &&
          (this.FTareas.CLASE !== '' && this.FTareas.CLASE !== null && this.FTareas.CLASE !== undefined)
        ){
          isValid = true;
          res = true;
        } else {
          for (let key in this.FTareas) {
            if (propiedadesVerificar.includes(key) && !this.FTareas[key]) {
              propiedadesVacias.push(key);
            }
          }
          if (propiedadesVacias.length > 0)
            mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

          isValid = false;
          res = false;
        }
        break;

      case 'EVENTOS':
        propiedadesVerificar = ["NOMBRE", "RESPONSABLES", "PROGRAMACION", "FECHA_INICIO", "FECHA_FIN"];
        if((this.FTareas.NOMBRE !== '' && this.FTareas.NOMBRE !== null && this.FTareas.NOMBRE !== undefined) &&
          (this.FTareas.RESPONSABLES !== '' && this.FTareas.RESPONSABLES !== null && this.FTareas.RESPONSABLES !== undefined) &&
          (this.FTareas.FECHA_INICIO !== '' && this.FTareas.FECHA_INICIO !== null && this.FTareas.FECHA_INICIO !== undefined) &&
          (this.FTareas.FECHA_FIN !== '' && this.FTareas.FECHA_FIN !== null && this.FTareas.FECHA_FIN !== undefined) &&
          (this.FTareas.PROGRAMACION !== '' && this.FTareas.PROGRAMACION !== null && this.FTareas.PROGRAMACION !== undefined)
        ){
          isValid = true;
          res = true;
        } else {
          for (let key in this.FTareas) {
            if (propiedadesVerificar.includes(key) && !this.FTareas[key]) {
              propiedadesVacias.push(key);
            }
          }
          if (propiedadesVacias.length > 0)
            mensaje = `Los campos ${propiedadesVacias.join(", ")} están vacíos, complete la información.`;

          isValid = false;
          res = false;
        }
        break;
    
      default:
        break;
    }
    if (res) {
      this.activeAcordeonSubTareas = true;
      this.activeAcordeonHistorico = true;
    } else {
      this.activeAcordeonSubTareas = false;
      this.activeAcordeonHistorico = false;
    }
    return res;
  }


}
