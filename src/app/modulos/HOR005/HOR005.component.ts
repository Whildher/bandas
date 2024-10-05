import { Component, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { DxButtonComponent, DxButtonModule, DxCheckBoxComponent, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxComponent, DxDateBoxModule, DxDropDownBoxModule, DxFormComponent, DxFormModule, DxLoadPanelModule, 
         DxSelectBoxModule, 
         DxTabsModule, 
         DxTagBoxComponent, 
         DxTagBoxModule, 
         DxTextBoxModule, 
         DxTreeListModule,
         DxValidatorModule} from 'devextreme-angular';
import { SbarraService } from 'src/app/containers/regbarra/_sbarra.service';
import { SfiltroService } from 'src/app/shared/filtro/_sfiltro.service';
import { SvisorService } from 'src/app/shared/vistarapida/_svisor.service';
import { TabService } from 'src/app/containers/tabs/tab.service';
import { Subject, Subscription, lastValueFrom, takeUntil } from 'rxjs';
import { clsBarraRegistro } from 'src/app/containers/regbarra/_clsBarraReg';
import Swal from 'sweetalert2';
import { showToast } from '../../shared/toast/toastComponent';
import { GlobalVariables } from 'src/app/shared/common/global-variables';
import { VisorrepComponent } from 'src/app/shared/visorrep/visorrep.component';
import { validatorRes } from 'src/app/shared/validator/validator';
import { Tab } from 'src/app/containers/tabs/tab.model';
import { CommonModule, formatNumber } from '@angular/common';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import DataSource from 'devextreme/data/data_source';
import { clsPropietarios } from '../HOR002/clsHOR002.class';
import { FiltrobusqComponent } from 'src/app/shared/filtrobusq/filtrobusq.component';
import { GeninformesComponent } from 'src/app/shared/geninformes/geninformes.component';
import { HOR00101Component } from '../HOR001/HOR00101/HOR00101.component';
import { HOR00501Component } from './HOR00501/HOR00501.component';
import { clsItmRecaudos, clsRecaudos, clsTotalesRec } from './clsHOR005.class';
import { HOR00502Component } from './HOR00502/HOR00502.component';
import { HOR00503Component } from './HOR00503/HOR00503.component';

@Component({
  selector: 'app-HOR005',
  templateUrl: './HOR005.component.html',
  styleUrls: ['./HOR005.component.scss'],
  standalone: true,
  imports: [MatTabsModule, DxLoadPanelModule, DxFormModule, DxSelectBoxModule,
            DxDropDownBoxModule, DxDataGridModule, DxTreeListModule, DxButtonModule,
            DxTextBoxModule,DxTagBoxModule, DxValidatorModule,
            DxTabsModule, CommonModule, DxDateBoxModule, DxCheckBoxModule,
            FiltrobusqComponent, GeninformesComponent,
            HOR00101Component, HOR00501Component, HOR00502Component, HOR00503Component
    ]
})
export class HOR005Component {
  @ViewChild("formFacturas", { static: false }) formFacturas: DxFormComponent;
  @ViewChild("griFItemsFacturas", { static: false }) griFItemsFacturas: DxDataGridComponent;
  @ViewChild("tagArrendatarios", { static: false }) tagArrendatarios: DxTagBoxComponent;
  @ViewChild("xs_FECHA_ADQUISICION", { static: false }) fechaAdq: DxDateBoxComponent;
  @ViewChild("btnGenerar", { static: false }) btnGenerar: DxButtonComponent;

  send_dataUbicaciones: any;
  send_dataCondiciones: any;

  subscription: Subscription;
  subs_filtro: Subscription;
  subs_visor: Subscription;
  unSubscribe: Subject<boolean> = new Subject<boolean>();
  colCountByScreen: object;

  prmUsrAplBarReg: clsBarraRegistro;
	conCambios: number = 0;
  mnuAccion: string;
	VDatosReg: any;
  keyFila: any;

  tabsInfoAcreedores: string[] = ['Identificación','Ubicaciones','Financieros', 'Histórico'];

  FRecaudos: clsRecaudos;
  DItemsRecaudos: clsItmRecaudos[] = [];
  DConceptos: any = [];
  DMediosPago: any = [];
  DDocumentos: any;
  DPeriodos: any;
  DTotales: clsTotalesRec[] = [];
  DClientes: clsPropietarios[] = [];
  DClientesFacBase: any[] = [];
  DClientesFac: any;
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
  FRecaudos_prev: any;
  rowsSelectedPerfil: any;
  rowsSelectedRT: any;

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
  dropDownOptionsCliente: any = {
      width: 600, 
      height: 400, 
      hideOnParentScroll: true,
      container: '#router-container',
      toolbarItems: [{
        location: 'before', 
        toolbar: 'top',
        template: 'tempEncab',
      }]
    };
  tabVisible: any[] = ["block","none","none","none"];

  QFiltro: any;
  filterIdLegal: any ='';
  
  eventsSubjectInformes: Subject<any> = new Subject<any>();
  eventsSubjectFiltro: Subject<any> = new Subject<any>();
  eventsSubjectItems: Subject<any> = new Subject<any>();
  eventsSubjectItemsIndiv: Subject<any> = new Subject<any>();
  eventsSubjectCliente: Subject<any> = new Subject<any>();
  eventsSubjectConceptos: Subject<any> = new Subject<any>();
  eventsSubjectMediosPago: Subject<any> = new Subject<any>();
  customValueSboxContacto: boolean = false;

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
  
  constructor(
    private _sdatos: HOR001Service,
		private _sbarreg: SbarraService,
    private _sfiltro: SfiltroService,
    private SVisor: SvisorService,
    private tabService: TabService
  ) { 
    // Servicio de barra de registro
    this.subscription = this._sbarreg.getObsRegApl().subscribe((datreg) => {
        // Valida si la petición es para esta aplicacion
        if (datreg.aplicacion === this.prmUsrAplBarReg.aplicacion)
          this.opMenuRegistro(datreg);
      });

    // Respuesta del filtro
    this.subs_filtro = this._sfiltro.setObsFiltro.pipe().subscribe(resp => {
      // Ejecuta búsqueda -> Valida si la petición es para esta aplicacion
      const dfiltro = JSON.parse(resp);
      if (dfiltro.aplicacion === this.prmUsrAplBarReg.aplicacion)
        this.opPrepararBuscar(resp);
    })

    // Respuesta del visor de datos
    this.subs_visor = this.SVisor.getObs_Apl().subscribe(resp => {
      // Ubica el registro
      if (this.SVisor.PrmVisor.aplicacion !== this.prmUsrAplBarReg.aplicacion) return;
      if (resp.accion === 'abrir') return;
      const nx = this.VDatosReg.findIndex(d => d.ID_DOCUMENTO === resp.ID_DOCUMENTO);
      if (nx !== 0) {
        this.prmUsrAplBarReg.r_numReg = nx+1;
        this.opIrARegistro('r_numreg');
      }
    })

    this.colCountByScreen = {
      xs: 1,
      sm: 2,
      md: 2,
      lg: 2,
    };

      // toolbarItems: [				
			// 	{
			// 		widget: "dxButton",
			// 		location: "before",
			// 		toolbar: "top",
      //     name:'CrearCli',
      //     template: 'tempEncab',
			// 		options: {
			// 			template: function () {
			// 				return $("<div style='margin-top: 8px;'>").append("<span class='dxtagbox-toolbox-template'> Crear Cliente </span>");
			// 			},						
			// 			icon: "open",
      //       onClick: this.crearCliente.bind(this, 'crear'),
			// 		},
      // }]
      // }

    this.ValideExistencia = this.ValideExistencia.bind(this);

  }

  // Valores de cargue inicial
  valoresDefecto() {
    if(this.especAplicacion) {
      // Cuentas de email usuario
      this.especUsuarioEmail = this.especAplicacion.find((e:any) => e.NOMBRE_OBJETO === 'EMAIL USUARIO')?.TITULO ?? '';
      this.especModoEnvioEmail = this.especAplicacion.find((e:any) => e.NOMBRE_OBJETO === 'MODO ENVIO EMAIL')?.VALOR_DEFECTO ?? '';

    }
  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.prmUsrAplBarReg = {
      tabla: "RECAUDOS",
      aplicacion: "HOR-005",
      usuario: user,
      accion: "r_ini",
      error: "",
      r_numReg: 0,
      r_totReg: 0,
      operacion: {}
    };
    this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
    this.mnuAccion = '';
    this._sdatos.accion = 'r_ini';
    this.FRecaudos = new clsRecaudos;
    this.FRecaudos.TIPO = 'Masiva';

    // Inicializa datos
    this.valoresObjetos('todos');

    // Inicializa totales
    this.DTotales = [ { ITEM: 1, CONCEPTO: 'Sub total', FRM_VALOR: '0', VALOR: 0}, 
                      { ITEM: 2, CONCEPTO: 'Iva', FRM_VALOR: '0', VALOR: 0}
                    ];

  }

  ngAfterViewInit(): void {
    this.activarEdicion('ini');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subs_filtro.unsubscribe();
    this.subs_visor.unsubscribe();
  }

  // Llama a Acciones de registro
	opMenuRegistro(operMenu: clsBarraRegistro): void {
    // Activa modo de operacion para los demás componentes

		switch (operMenu.accion) {
			case "r_ini":
				const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "RECAUDOS",
          aplicacion: "HOR-005",
          usuario: user,
					accion: "r_ini",
					error: "",
					r_numReg: 0,
					r_totReg: 0,
					operacion: { }
				};
				this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
				break;

			case 'r_nuevo':
				this.mnuAccion = "new";
				this.opPrepararNuevo();
				break;

			case 'r_modificar':
				this.mnuAccion = "update";
				this.opPrepararModificar();
				break;

			case 'r_guardar':
				this.opPrepararGuardar(this.mnuAccion);
				break;

			case 'r_buscar':
				if (this._sfiltro.enConsulta === false) {
          this.opPrepararBuscar('filtro');
        } else {
          this.toaMessage = 'Consulta en proceso, por favor espere.';
          this.toaVisible = true;
          this.toaTipo = 'warning';
        }
				break;

			case 'r_buscar_ejec':
        this.opBlanquearForma();
        if (operMenu.operacion.filtro_arg) {
          this.opPrepararBuscar(operMenu.operacion.filtro_arg)
        }
        else {
          if (this._sfiltro.enConsulta === false) {
            this.opPrepararBuscar('');
          } else {
            showToast('Consulta en proceso, por favor espere.', 'warning');
          }
        }
				break;

			case 'r_eliminar':
				this.opEliminar();
				break;

      case "r_primero":
      case "r_anterior":
      case "r_siguiente":
      case "r_ultimo":
      case "r_numreg":
        this.opIrARegistro(operMenu.accion);
        break;

			case 'r_cancelar':
				var mensaje = '¿Desea cancelar la operación?';
				if (this.conCambios != 0) mensaje = '¿Desea cancelar sin guardar cambios?';
        Swal.fire({
          title: '',
          text: mensaje,
          iconHtml: "<i class='icon-alert-ol'></i>",
          showCancelButton: true,
          confirmButtonColor: '#DF3E3E',
          cancelButtonColor: '#438ef1',
          cancelButtonText: 'No',
          confirmButtonText: 'Sí, cancelar'
          }).then((result) => {
          if (result.isConfirmed) {
            this.prmUsrAplBarReg = {...this.prmUsrAplBarReg, operacion: {} }
            // Restituye los valores
            this.readOnly = true;
            this.prmUsrAplBarReg.accion = 'r_cancelar';
            this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
            this.mnuAccion = "";
            this.opIrARegistro('r_numreg');
          }
        });
				break;

			case 'r_vista':
				this.opVista();
				break;

			case 'r_imprimir':
        var prmRep = { ...operMenu.operacion, 
                         accion: 'previsualizar',
                         aplicacion: this.prmUsrAplBarReg.aplicacion, 
                         tabla: this.prmUsrAplBarReg.tabla,
                         usuario: this.prmUsrAplBarReg.usuario,
                         QFiltro: (operMenu.operacion.registro === 'todos') 
                                   ? this.QFiltro 
                                   : " RECAUDOS.ID_DOCUMENTO = '"+this.FRecaudos.ID_DOCUMENTO+"' AND RECAUDOS.CONSECUTIVO = "+this.FRecaudos.CONSECUTIVO
                        };
        if (operMenu.operacion.modo === 'previsualizar')

          this.eventsSubjectInformes.next(prmRep);
        if (operMenu.operacion.modo === 'pdf') {
          prmRep = { ...prmRep, accion: 'pdf' };
          this.eventsSubjectInformes.next(prmRep);
        }
        if (operMenu.operacion.modo === 'email') {
          let template = this.especAplicacion.find(e => e.NOMBRE_OBJETO === 'TEMPLATE')?.VALOR_DEFECTO ?? '';
          let asunto = this.especAplicacion.find(e => e.NOMBRE_OBJETO === 'ASUNTO EMAIL')?.VALOR_DEFECTO ?? '';
          let email_sale = this.especAplicacion.find(e => e.NOMBRE_OBJETO === 'EMAIL USUARIO')?.VALOR_DEFECTO ?? '';
          let nom_usr = this.especAplicacion.find(e => e.NOMBRE_OBJETO === 'EMAIL USUARIO')?.TITULO ?? '';
          var prmRep = { ...operMenu.operacion, 
                        accion: 'email',
                        asunto,
                        email_sale,
                        especUsuarioEmail: nom_usr,
                        nombre: this.FRecaudos.ID_DOCUMENTO,
                        email:  '',
                        template,
                        replacements: '',
                        dataSource: this.FRecaudos
                      };
          this.eventsSubjectInformes.next(prmRep);
        }
				break;

      case 'r_refrescar':
				this.valoresObjetos('todos');
        this.eventsSubjectItemsIndiv.next({ operacion: 'r_refrescar'});
				break;

			default:
				break;
		}
	}

  opPrepararNuevo(): void {
    // Activa componentes
    this.opBlanquearForma();
    this.customValueSboxContacto = true;
    this.treeBoxGrupo = [];
    this.activarEdicion('activo');
    this.valoresObjetos('documento');
    this.FRecaudos.ESTADO = 'REGISTRADO';
    this.FRecaudos.USUARIO = this.prmUsrAplBarReg.usuario;
    this.FRecaudos.TIPO_PAGO = 'CONTADO';

    // Activa grids
    this.eventsSubjectItems.next({ operacion: 'nuevo'});
    this.eventsSubjectConceptos.next({ operacion: 'nuevo'});
    this.eventsSubjectMediosPago.next({ operacion: 'nuevo'});
    
  }

  async opPrepararModificar()  {
		this.readOnly = false;

    // Valida la existencia
    this.activarEdicion('activo');
    const prm = { ID_CLIENTE: this.FRecaudos.ID_DOCUMENTO, accion: 'integridad referencial' };
    const apiRest = this._sdatos.validar('EXISTE TARIFA',prm,this.prmUsrAplBarReg.aplicacion);
    let res = await lastValueFrom(apiRest, {defaultValue: true});
    res = JSON.parse(res.data); 
    if (res[0].ErrMensaje !== '') {
      showToast(res[0].ErrMensaje, 'error');
      this.readOnlyLlave = true;
    }

  }

  ValidaDatos(Accion: string): boolean {
    var msg = '';
    if (Accion === "requerido"){
      if(this.FRecaudos.ID_DOCUMENTO === '') msg += 'Documento ,';
      if(this.FRecaudos.TIPO === '') msg += 'Tipo de facturación ,';
      if(this.FRecaudos.ID_CLIENTE === '' && this.FRecaudos.TIPO == 'Individual' ) msg += 'Falta cliente! ,';
      if(this.FRecaudos.FACTURA === '' && this.FRecaudos.TIPO == 'Individual' ) msg += 'No hay consecutivo de factura! ,';
      if (msg !== '') {
        this.showModal("Hay datos incompletos en los datos de la Factura: "+msg,"Faltan datos",'');
        return false;
      }
    }
    return true;
  }

  opPrepararGuardar(accion: string): void {
    // Acción validación de datos
    if (!this.ValidaDatos('requerido')){
      return;
    }

    const prmDatosGuardar = { FACTURA: this.FRecaudos, 
                              ITM_FACTURA: this.DItemsRecaudos, 
                              USUARIO: this.prmUsrAplBarReg.usuario
                             }

    // API guardado de datos
    var exito = false;
    this.loadingVisible = true;
    this._sdatos
    .save(accion, prmDatosGuardar, this.prmUsrAplBarReg.aplicacion)
    .subscribe(
      { next: (resp) => {
        this.loadingVisible = false;
        const res = JSON.parse(resp.data);
        if (res[0].ErrMensaje !== ""){
          this.showModal(res[0].ErrMensaje, 'error');
        } 
        else
        {
          this.readOnly = true;
          this.esEdicion = false;
          this.esCreacion = false;
          this.esVisibleSelecc = 'none';

          // Operaciones de barra
          if (this.mnuAccion === 'new'){
            this.QFiltro = " RECAUDOS.ID_DOCUMENTO = '"+this.FRecaudos.ID_DOCUMENTO+"' AND " +
                           " RECAUDOS.CONSECUTIVO = "+this.FRecaudos.CONSECUTIVO
            this.prmUsrAplBarReg = {
              ...this.prmUsrAplBarReg,
              error: "",
              accion: "r_navegar",
              r_numReg: 1,
              r_totReg: 1,
              operacion: {}
            };
          }
          else
            this.prmUsrAplBarReg = {
              ...this.prmUsrAplBarReg,
              error: "",
              accion: "r_navegar",
              operacion: {}
          };
          this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
          showToast('Registro actualizado', 'success');

        }
      },
      error: (e) => {
        this.loadingVisible = false;
        this.showModal('Error al guardar Facturas: '+e.error.message);
        }
      });

  }

  opPrepararBuscar(accion): void {
		if (accion === "filtro") 
    {

      // this._sfiltro.PrmFiltro = {
      //   Titulo: "Datos de filtro para Acreedores",
      //   accion: "PREPARAR FILTRO",
      //   Filtro: "",
      //   TablaBase: this.prmUsrAplBarReg.tabla,
      //   aplicacion: this.prmUsrAplBarReg.aplicacion
      // };
      // this._sfiltro.getObsFiltro.emit(true);

      const prmFiltro = {
        Titulo: "Datos de filtro para Facturacion",
        accion: "activar",
        Filtro: "",
        TablaBase: this.prmUsrAplBarReg.tabla,
        aplicacion: this.prmUsrAplBarReg.aplicacion,
        objRegistro: this._sbarreg, 
        objTab: this.tabService,
        usuario: this.prmUsrAplBarReg.usuario,
        title: 'Facturación'
      };
      this.eventsSubjectFiltro.next(prmFiltro);

    } 
    else 
    {
      this._sfiltro.enConsulta = true;
      // Extrae la estructura del filtro
      let prmDatosBuscar = JSON.parse(accion);
      let arrFiltro = prmDatosBuscar.ESTRUCTURA;
      const prm = { RECAUDOS: arrFiltro };

      // Ejecuta búsqueda API
      this.loadingVisible = true;
      this._sdatos
        .consulta('consulta', prm,this.prmUsrAplBarReg.aplicacion)
        .subscribe((data: any) => {
          const res = JSON.parse(data.data);
          if ( (data.token != undefined) ){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          const datares = res;
          if (datares[0].ErrMensaje === '') {
            // Asocia datos
            if ( datares??'' != '' ) {
              this.VDatosReg = datares;
              this.FRecaudos = datares[0];
              this.QFiltro = datares[0].QFILTRO;
              
              
              // Acondiciona peril tributario
              // if (this.FRecaudos.PERFIL_TRIBUTARIO??'' !== '') {
              //   this.FRecaudos.PERFIL_TRIBUTARIO = this.FRecaudos.PERFIL_TRIBUTARIO.split('|');
              // }

            }

          } else {
            this.VDatosReg = [];
            this.loadingVisible = false;
            //notificació
            showToast(datares[0].ErrMensaje, 'warning');
            //this.opBlanquearForma();
          }
          // Prepara la barra para navegación
          this.prmUsrAplBarReg = {...this.prmUsrAplBarReg,
            r_totReg: datares.length,
            r_numReg: 1,
            accion: 'r_navegar',
            operacion: {}
          }
          this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);

          // Trae los items en los componentes asociados
          this.opIrARegistro('r_primero');
          this.loadingVisible = false;
          this._sfiltro.enConsulta = false;
      });
    }
	}

  opEliminar(): void {
    Swal.fire({
      title: '',
      text: '',
      html:
        'Desea eliminar la tarifa <i>' +
        this.FRecaudos.ID_DOCUMENTO +
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
        this.AccionEliminar();
      }
    });
  }
  AccionEliminar(): void {
    // API eliminación de datos
    const prm = { ACREEDORES: { ID_CLIENTE: this.FRecaudos.ID_DOCUMENTO } };
    this._sdatos
      .delete('delete', prm, this.prmUsrAplBarReg.aplicacion)
      .subscribe((data) => {
        const res = JSON.parse(data.data);
        if (res[0].ErrMensaje !== ''){
          this.showModal(res[0].ErrMensaje, 'error');
          return;
        }

        // Elimina y posiciona en el Array de Consulta
        showToast('Tarifa eliminado!', 'success');
        this.readOnly = true;

        // Operaciones de barra
        this.prmUsrAplBarReg = {
          ...this.prmUsrAplBarReg,
          error: '',
          accion: 'r_navegar',
          operacion: {},
        };
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        this.opIrARegistro("Eliminado");
      });
  }


  // Navegación de registro
  opIrARegistro(accion: string): void {
    this.borderStyle = "none";
    this.prmUsrAplBarReg.accion = "r_numreg";
    switch (accion) {
      case "r_primero":
        this.prmUsrAplBarReg.r_numReg = 1;
        if (this.VDatosReg.length != 0){
          this.FRecaudos = JSON.parse(JSON.stringify(this.VDatosReg[0]));
          this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        }
        break;

      case "r_anterior":
        this.prmUsrAplBarReg.r_numReg =
          this.prmUsrAplBarReg.r_numReg === 1 ? 1 : this.prmUsrAplBarReg.r_numReg - 1;
        this.FRecaudos = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        break;

      case "r_siguiente":
        this.prmUsrAplBarReg.r_numReg =
        this.prmUsrAplBarReg.r_numReg === this.VDatosReg.length
          ? this.VDatosReg.length
          : this.prmUsrAplBarReg.r_numReg + 1;
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        this.FRecaudos = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
        break;

      case "r_ultimo":
        this.prmUsrAplBarReg.r_numReg = this.VDatosReg.length;
        this.FRecaudos = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        break;

      case "r_numreg":
        if (this.prmUsrAplBarReg.r_numReg !== 0) {
          // Valida si hubo cambio de ordenamiento en el visor
          if (this.SVisor.ColSort.Columna !== "") {
            if (this.SVisor.ColSort.Clase === "asc") {
              this.VDatosReg = this.VDatosReg.sort((a: any, b: any) =>
                a[this.SVisor.ColSort.Columna].toUpperCase() <
                b[this.SVisor.ColSort.Columna].toUpperCase()
                  ? -1
                  : 1
              );
            } else {
              this.VDatosReg = this.VDatosReg.sort((a: any, b: any) =>
                a[this.SVisor.ColSort.Columna].toUpperCase() >
                b[this.SVisor.ColSort.Columna].toUpperCase()
                  ? -1
                  : 1
              );
            }
          }
        }
        else {
          this.opBlanquearForma();
          setTimeout(() => {  
            this.formFacturas.instance.resetValues();  
          }, 100);  
        }
        break;

      case "Eliminado":
        this.VDatosReg.splice(this.prmUsrAplBarReg.r_numReg - 1, 1);
        if (this.prmUsrAplBarReg.r_numReg > this.prmUsrAplBarReg.r_totReg) {
          this.prmUsrAplBarReg.r_numReg = this.prmUsrAplBarReg.r_totReg;
        }
        if (this.VDatosReg.length >= 0) {
          this.FRecaudos =
            this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1];
        }
        break;

      default:
        break;
    }

    // activa/inactiva propiedades
    try {
      this._sdatos.accion = 'r_numreg';
      this.readOnly = true;
      this.readOnlyForm = true;
      this.readOnlyLlave = true;

      // Navega  los componentes items
      setTimeout(() => {

        if (this.FRecaudos.TIPO == 'Masiva' )
          this.eventsSubjectItems.next({ operacion: 'consulta',
                                        documento: this.FRecaudos.DOCUMENTO
                                      });
        else {
          // Muestra grid de totales
          this.eventsSubjectItemsIndiv.next({ operacion: 'consulta',
                                              documento: this.FRecaudos.DOCUMENTO
                                            });
          this.DTotales = this.FRecaudos.TOTALES;
        }
        
      }, 300);
      
    } catch (error) {
      this.showModal(error);
    }

  }

  opBlanquearForma(): void {
    this.FRecaudos = {
      ID_DOCUMENTO: '',
      CONSECUTIVO: 0,
      DOCUMENTO: '',
      DESCRIPCION: '',
      ESTADO: '',
      FECHA: new Date,
      FECHA_INICIAL: new Date,
      FECHA_FINAL: new Date,
      FECHA_VENCIMIENTO: new Date,
      FILTRO: '',
      HORA: new Date,
      PERIODO: '',
      USUARIO: '',
      EXTRAORDINARIA: false,
      TIPO: '',
      ID_CLIENTE: '',
      NOMBRE: '',
      FACTURA: '',
      ID_PROPIEDAD: '',
      TIPO_PAGO: '',
      TOTALES: ''
    };
    
    this.DItemsRecaudos = [];
    this.FRecaudos_prev = JSON.parse(JSON.stringify(this.FRecaudos));
    this.borderStyle = "none";

    // Inicializa adicionales
    this.eventsSubjectItems.next({ operacion: 'nuevo'});

  }

  opVista(): void {
		/*this.prmUsrAplBarReg.error = '';
		this.prmUsrAplBarReg.accion = 'pos_Visor';
		this.SVisor.DatosVisor = JSON.parse(JSON.stringify(this.VDatosReg));
		this.SVisor.PrmVisor = {
			Titulo: 'Productos',
			Columnas: [
				{ Nombre: 'PRODUCTO', Titulo: 'Producto' },
				{ Nombre: 'NOMBRE', Titulo: 'Descripción' },
				{ Nombre: 'ESTADO', Titulo: 'Estado' },
				{ Nombre: 'ID_GRUPO', Titulo: 'Grupo' },
				{ Nombre: 'INVENTARIO', Titulo: 'Inventario' },
			],
			PrmApl: this.prmUsrAplBarReg,
		};
		this.SVisor.setObsVisor.emit();*/
	}

  // Valide CLIENTEes
  async ValideExistencia(e: any) {
    if (this.readOnlyForm || !this.mnuAccion.match('new|update')) {
      return (true);
    }
    if (this.mnuAccion === 'update' && this.FRecaudos_prev.ID_DOCUMENTO === e.value) {
      return (true);
    }

    // Valida la existencia
    const prm = { ID_CLIENTE: e.value, accion: this.mnuAccion };
    const apiRest = this._sdatos.validar('EXISTE TARIFA',prm,this.prmUsrAplBarReg.aplicacion);
    let res = await lastValueFrom(apiRest, {defaultValue: true});
    res = JSON.parse(res.data); 
    if (res[0].ErrMensaje === '') {
      this.activarEdicion('activo');
      return (true);
    }
    else {
      showToast(res[0].ErrMensaje, 'error');
      var fNextEditor:any = this.formFacturas.instance.getEditor('ID_TASA');
      fNextEditor.focus();
      this.activarEdicion('inactivo');
      return (false);
    }
  
  }

  onChangeFecha(e) {
    //this.FRecaudos.FECHA = e.value;
    // this.fechaAdq.instance._refresh();
  }

  // Genera las facturas correspondientes por cada inmueble activo
  clickGenerarFac(e) {

    const prm = this.FRecaudos;
    this._sdatos.consulta('GENERACION', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
      const res = validatorRes(data);
      if ( (data.token != undefined)){
        const refreshToken = data.token;
        localStorage.setItem("token", refreshToken);
      }
      this.eventsSubjectItems.next({ operacion: 'generacion', dataSource: res });
      this.DItemsRecaudos = res;
    });

  }

  // Lista de posibles tarifas para generación
  verTarifa(item) {
    if (item)
      return (item.ID_TARIFA ? item.ID_TARIFA + '; ' + formatNumber(item.VALOR, 'en-US', '1.2-2') : item);
    else
      return "";
  }


  // Activa campos de la forma para edición 
  // dependiendo de la acción a realizar
  activarEdicion(accion) {
    switch (accion) {
      case 'llave':
        this.esEdicion = false;
        this.readOnly = true;
        this.readOnlyForm = false;
        this.readOnlyLlave = false;
        this.eventsSubjectItems.next({ operacion: 'inactivo' });
        break;
      case 'activo':
        this.esEdicion = true;
        this.readOnly = false;
        this.readOnlyForm = false;
        this.readOnlyLlave = false;
        this.eventsSubjectItems.next({ operacion: 'activo' });
        break;
      case 'consulta':
      case 'ini':
        this.esEdicion = false;
        this.readOnly = true;
        this.readOnlyForm = true;
        this.readOnlyLlave = true;
        this.eventsSubjectItems.next({ operacion: 'inactivo' });
        break;
    
      default:
        break;
    }
  }

  onTabChanged(e:any){
    switch (e.itemIndex) {
      case 0:
        this.tabVisible = ["block","none","none","none"];
        break;
      case 1:
        this.tabVisible = ["none","block","none","none"];
        break;
      case 2:
        this.tabVisible = ["none","none","block","none"];
        break;
      case 3:
        this.tabVisible = ["none","none","none","block"];
        break;
      default:
        break;
    }
  }

  // Refresca lista de items masiva
  onRespuestaItems(e: any) {
    if (e.operacion == 'datos') {
      this.DItemsRecaudos = e.data;
    }
  }

  // Refresca lista de items individual
  onRespuestaItemsIndiv(e: any) {
    this.DItemsRecaudos = e.data;
    this.DTotales = e.totales;
  }
  onRespuestaFiltro(e: any) {
  }

  onRespuestaConceptos(e: any) {
  }
  onRespuestaMediosPago(e: any) {
  }

  // Crea cliente, Refresca lista y agrega 
  onRespuestaCrearCliente(e: any) {

    if (e.accion === 'aceptar') {
      // Agragar a la lista
      const arrnuevo = { ID_CLIENTE: e.data.ID_CLIENTE, 
                         NOMBRE_COMPLETO: e.data.NOMBRE+(' '+e.data.NOMBRE2).trimEnd()+' '+e.data.APELLIDO+(' '+e.data.APELLIDO2).trimEnd()};
      // Adds the entry to the data source
      this.DClientesFac.store().insert(arrnuevo);
      // Reloads the data source
      this.DClientesFac.reload();

      // Selecciona cliente
      this.FRecaudos.ID_CLIENTE = e.data.ID_CLIENTE;
      this.FRecaudos.NOMBRE = e.data.NOMBRE+(' '+e.data.NOMBRE2).trimEnd()+' '+e.data.APELLIDO+(' '+e.data.APELLIDO2).trimEnd();
      
    }
  }

  // Tipo de factura
  onSeleccTipo(e: any): void {
    if (this.readOnly) return;
    
    this.FRecaudos.TIPO = e.value;

    // Activa objetos en la forma de acuerdo al tipo de facturación
    if (e.value === 'Individual') {
      if (this.DClientes.length == 0) this.valoresObjetos('clientes');

      this.FRecaudos.TIPO_PAGO = 'CONTADO';

      setTimeout(() => {
        this.eventsSubjectItemsIndiv.next({ operacion: 'nuevo' });
      }, 300);

      // Carga numero factura que sigue
      const prm = { };
      this._sdatos
        .consulta('CONSECUTIVO FACTURA', prm, this.prmUsrAplBarReg.aplicacion)
        .subscribe((data: any) => {
          const res = JSON.parse(data.data);
          if ( (data.token != undefined) ){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.FRecaudos.FACTURA = res[0].FACTURA;
        });

    }
    else {
      setTimeout(() => {
        this.eventsSubjectItems.next({ operacion: 'nuevo' });
      }, 300);

      this.FRecaudos.TIPO_PAGO = 'CREDITO';

      // Carga periodos
      const prm = { };
      this._sdatos
        .consulta('PERIODOS FACTURACION', prm, this.prmUsrAplBarReg.aplicacion)
        .subscribe((data: any) => {
          const res = JSON.parse(data.data);
          if ( (data.token != undefined) ){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.DPeriodos = res;
        });

    }
  }

  // Selección del cliente
  onSeleccPeriodo(e: any): void {
    const dper = this.DPeriodos.find(pe => pe.PERIODO === e.value);
    if (dper) {
      this.FRecaudos.FECHA_INICIAL = dper.Fecha_Inicio;
      this.FRecaudos.FECHA_FINAL = dper.Fecha_Fin;
    }
  }

  // Selección del cliente
  onSeleccCliente(e: any): void {
    const dcli = this.DClientesFacBase.find(ya => ya.ID_CLIENTE === e.value);
    if (dcli) {
      this.FRecaudos.NOMBRE = dcli.NOMBRE_COMPLETO;

      // Trae propiedades
      const prm = { ID_CLIENTE : e.value };
      this._sdatos
        .consulta('CONSULTA TENENCIA INMUEBLES', prm, "HOR-001")
        .subscribe((data: any) => {
          const res = JSON.parse(data.data);
          if ( (data.token != undefined) ){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.FRecaudos.ID_PROPIEDAD = res[0].PROPIEDAD;
        });

    }
  }

  // Abre popup para creación del cliente
  crearCliente(e, accion) {
    this.eventsSubjectCliente.next({ operacion: 'nuevo', titulo: 'Crear cliente' });
  }
  refreshClick(objeto) {
    // this.checkProSoloPrecio.instance.option("value", false);
    // this.checkProProveedor.instance.option("value", false);
    this.valoresObjetos('clientes');
  }
  irAClientes(e, cliente) {
    this.eventsSubjectCliente.next({ operacion: 'consulta cliente', titulo: 'Cliente '+cliente.NOMBRE_COMPLETO, 
          filtro: { CLIENTES: [{ CAMPO: "ID_CLIENTE", EXPRESION: cliente.ID_CLIENTE, TABLA: "CLIENTES" }] } });
    e.event.stopPropagation();
  }
  
  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj == 'documento' || obj == 'todos') {
      const prm = { ID_APLICACION : this.prmUsrAplBarReg.aplicacion, USUARIO: localStorage.getItem('usuario')};
      this._sdatos
        .consulta('DOCUMENTOS CONSECUTIVO', prm, this.prmUsrAplBarReg.aplicacion)
        .subscribe((data: any) => {
          const res = JSON.parse(data.data);
          if ( (data.token != undefined) ){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.DDocumentos = res;
          if(this.DDocumentos != null && this.DDocumentos.length == 1 && !this.readOnly){
            this.FRecaudos.DOCUMENTO = this.DDocumentos[0].DOCUMENTO;
            this.FRecaudos.ID_DOCUMENTO = this.DDocumentos[0].ID_DOCUMENTO;
            this.FRecaudos.CONSECUTIVO = this.DDocumentos[0].CONSECUTIVO;
          }
        });
    }

    if (obj == 'especificaciones' || obj == 'todos' ) {
      this._sdatos.consulta('ESPECIFICACIONES', 
                          { ID_APLICACION: this.prmUsrAplBarReg.aplicacion, USUARIO: this.prmUsrAplBarReg.usuario }, 
                          'ADM-011')
      .subscribe((data: any) => {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.especAplicacion = res;
        this.valoresDefecto();
  
      });
    }

    if (obj == 'clientes' || obj === 'todos' ) {
      this._sdatos.consulta('CLIENTES', 
                            { CONSULTA: 'basica', USUARIO: this.prmUsrAplBarReg.usuario }, 
                              'HOR-001')
      .subscribe((data: any) => {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DClientesFacBase = res;
        this.DClientesFac = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });

      });
    }

    if (obj === 'conceptos defecto' || obj === 'todos') {
      const prm = { ID_APLICACION: this.prmUsrAplBarReg.aplicacion, USUARIO: this.prmUsrAplBarReg.usuario };
      this._sdatos.consulta('CONCEPTOS DEFECTO', prm, "HOR-005").subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DConceptos = res[0].CONCEPTOS;
        this.DMediosPago = res[0].MEDIOS_PAGO;
        this.eventsSubjectConceptos.next({ operacion: 'ini', dataSource: this.DConceptos });
        this.eventsSubjectMediosPago.next({ operacion: 'ini', dataSource: this.DMediosPago });

      });
    }


  }

  // Imprimir reporte de aplicación
  imprimirReporte(id_reporte, archivo, datosrpt) {
		
    let filtroRep = {FILTRO: ''};
    const prmLiq = {  clid: localStorage.getItem('empresa'), 
                      usuario: localStorage.getItem('usuario'), 
                      idrpt: archivo,
                      id_reporte,
                      aplicacion: this.prmUsrAplBarReg.aplicacion,
                      tabla: this.prmUsrAplBarReg.tabla,
                      filtro: filtroRep
                    };

    // Si no existe, no está abierta entonces agrega Tab
    const listaTab = this.tabService.tabs.find(c => c.aplicacion === id_reporte);
    if (listaTab === undefined) 
      GlobalVariables.listaAplicaciones.unshift({ aplicacion: id_reporte, barra: undefined, statusEdicion: '' });

    // Abre pestaña con nuevo reporte
    this.tabService.addTab( new Tab(VisorrepComponent,    // visor
                                    datosrpt.text,        // título
                                    { parent: "PrincipalComponent", args: prmLiq }, // parámetro: reporte,filtro
                                    id_reporte,           // código del reporte
                                    '',
                                    'reporte',
                                    true
                          ));

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
