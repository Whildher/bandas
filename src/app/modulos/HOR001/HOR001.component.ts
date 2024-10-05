import { Component, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxDropDownBoxModule, DxFormComponent, DxFormModule, DxLoadPanelModule, 
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
import notify from 'devextreme/ui/notify';
import { GlobalVariables } from 'src/app/shared/common/global-variables';
import { VisorrepComponent } from 'src/app/shared/visorrep/visorrep.component';
import { validatorRes } from 'src/app/shared/validator/validator';
import { Tab } from 'src/app/containers/tabs/tab.model';
import { XcSelectboxComponent } from 'src/app/shared/xc-selectbox/xc-selectbox.component';
import { CXP200Service } from 'src/app/services/CXP200/s_CXP200.service';
import { XcComboGridComponent } from 'src/app/shared/xc-combo-grid/xc-combo-grid.component';
import { DirtelinfoComponent } from 'src/app/shared/dirtelinfo/dirtelinfo.component';
import { FiltrobusqComponent } from 'src/app/shared/filtrobusq/filtrobusq.component';
import { GeninformesComponent } from 'src/app/shared/geninformes/geninformes.component';
import { clsClientes } from './clsHOR001.class';
import { CommonModule, formatNumber } from '@angular/common';
import { HOR00101Component } from './HOR00101/HOR00101.component';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-HOR001',
  templateUrl: './HOR001.component.html',
  styleUrls: ['./HOR001.component.css'],
  standalone: true,
  imports: [MatTabsModule, DxLoadPanelModule, DxFormModule, DxSelectBoxModule,
            DxDropDownBoxModule, DxDataGridModule, DxTreeListModule, DxButtonModule,
            XcSelectboxComponent, XcComboGridComponent, DxTextBoxModule,
            DxTagBoxModule, DirtelinfoComponent, DxValidatorModule,
            DxTabsModule, FiltrobusqComponent, GeninformesComponent, CommonModule,
            HOR00101Component
    ]
})
export class HOR001Component {
  @ViewChild("formClientes", { static: false }) formClientes: DxFormComponent;
  @ViewChild("gridPropiedades", { static: false }) gridPropiedades: DxDataGridComponent;
  @ViewChild("tagArrendatarios", { static: false }) tagArrendatarios: DxTagBoxComponent;
  

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

  FClientes: clsClientes;
  DPropiedades: any[] = [];
  DCiudades: any[] = [];
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
  especAplicacion: any;
  especUsuarioEmail: string = ''; 
  especModoEnvioEmail: string = ''; 

  focusedRowIndex: number;
  focusedRowKeyGrupos: string;
  focusedRowKeyContactos: string;
  focusedRowKeyRepresentante: string;
  aceptarButtonOptions: any;
  closeButtonOptions: any;
  FClientes_prev: any;
  rowsSelectedPerfil: any;
  rowsSelectedRT: any;

  DIdLegal: any = [];
  DGrupos: any = [];
  DTipos: any = [];
  DArrendatarios: any = [];
  DArrendatariosLista: any = [];
  DTarifas: any = [];
  DRepresentante: any = [];
  DPerfilTributario: any = [];
  DRT: any = [];
  DActividad: any = [];
  DidTributaria: any = [];
  DidPerfilesTributarios: any = [];
  DEstados: any[] = ['ACTIVO','INACTIVO'];
  DTipoIdLegal: any = [];
  DPersona: any = [];
  selectIdLegal: any[] = [];
  selectGrupo: any[] = [];
  selectContactos: any[] = [];
  selectRepresentante: any[] = [];
  selectPerfilTributario: any[] = [];
  selectTributario: any[] = [];
  selectActividad: any[] = [];
  treeBoxGrupo: any[] = [];
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
  
  eventsSubjectFiltro: Subject<any> = new Subject<any>();
  eventsSubjectInformes: Subject<any> = new Subject<any>();
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
  adapterConfig = {
    getValue: () => {
      return this.FClientes.ID_LEGAL;
    },
    applyValidationResults: (e) => {
      this.borderStyle = e.isValid ? "none" : "1px solid red";
    },
    validationRequestsCallbacks: this.callbacks
  };
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

    // Respuesta del visor de datos
    this.subs_visor = this.SVisor.getObs_Apl().subscribe(resp => {
      // Ubica el registro
      if (this.SVisor.PrmVisor.aplicacion !== this.prmUsrAplBarReg.aplicacion) return;
      if (resp.accion === 'abrir') return;
      const nx = this.VDatosReg.findIndex(d => d.ID_CLIENTE === resp.ID_CLIENTE);
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

    this.dropDownOptionsArr = {
      wrapperAttr: {
					id: "tagBoxDD"
				},
			toolbarItems: [				
				{
					widget: "dxButton",
					location: "after",
					toolbar: "top",
          name:'CrearArr',
					options: {
						template: function () {
							return $("<div style='margin-top: 8px;'>").append("<span class='dxtagbox-toolbox-template'> Crear Arrendatario </span>");
						},						
						icon: "open",
            onClick: this.crearArre.bind(this, 'crear'),
					},
				}]}

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
      tabla: "CLIENTES",
      aplicacion: "HOR-001",
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
    this.FClientes = new clsClientes;

    // Inicializa datos
    this.valoresObjetos('todos');

  }

  ngAfterViewInit(): void {
    this.activarEdicion('ini');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subs_filtro.unsubscribe();
    this.subs_visor.unsubscribe();
  }


  onRespuestaFiltro(e: any) {
  }

  onKeyDownPerfil(e: any) {
    e.event.preventDefault();
    return false;
  }

  // Cambios en la Rep Tributaria
  onValueRT(e:any) {
    if ((e.value !== null) && (e.value !== undefined) && (e.value !== '')) {
      
    }
  }

  onSeleccEstado(e: any): void {
    this.FClientes.ESTADO = e.value;
  }

  onSeleccClase(e: any): void {
    this.FClientes.CLASE = e.value;
  }

  // Llama a Acciones de registro
	opMenuRegistro(operMenu: clsBarraRegistro): void {
    // Activa modo de operacion para los demás componentes

		switch (operMenu.accion) {
			case "r_ini":
				const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "CLIENTES",
          aplicacion: "HOR-001",
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
        if (GlobalVariables.idAplicacionActiva !== this.prmUsrAplBarReg.aplicacion) return;
        if (this._sfiltro.enConsulta === false) {
          this.opPrepararBuscar('filtro');
        } else {
          showToast('Consulta en proceso, por favor espere.', 'warning');
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
                                   : " CLIENTES.ID_CLIENTE = '"+this.FClientes.ID_CLIENTE+"'" 
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
                        nombre: this.FClientes.NOMBRE_COMPLETO,
                        email: this.DEmail.length !== 0 ? this.DEmail[0].EMAIL : '',
                        template,
                        replacements: '',
                        dataSource: this.FClientes
                      };
          this.eventsSubjectInformes.next(prmRep);
        }
				break;

			default:
				break;
		}
	}

  opPrepararNuevo(): void {
    // Activa componentes
    this.opBlanquearForma();
    this.FClientes.ESTADO = 'ACTIVO';
    this.FClientes.FECHA_REGISTRO = new Date();
    this.customValueSboxContacto = true;
    this.eventsSubjectArre.next('reset');
    this.treeBoxGrupo = [];
    this.activarEdicion('llave');
  }

  async opPrepararModificar()  {
		this.readOnly = false;

    // Valida la existencia
    this.activarEdicion('activo');
    const prm = { ID_CLIENTE: this.FClientes.ID_CLIENTE, accion: 'integridad referencial' };
    const apiRest = this._sdatos.validar('EXISTE CLIENTE',prm,this.prmUsrAplBarReg.aplicacion);
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
      if(this.FClientes.ID_CLIENTE === '') msg += 'Id Acreedor ,';
      if(this.FClientes.ID_LEGAL == null) msg += 'Id Legal,';
      if(this.FClientes.NOMBRE === null || this.FClientes.NOMBRE === '') msg += 'Nombre CLIENTE,';
      if(this.FClientes.TIPO === '') msg += 'Tipo CLIENTE ,';
      if(this.FClientes.ID_GRUPO === '') msg += 'Grupo CLIENTE ,';
      if(this.FClientes.PERFIL_TRIBUTARIO === '') msg += 'Perfil Tributario ,';
      if(this.FClientes.RT === '') msg += 'Representación tributaria ,';
      if(this.FClientes.CLASE === '') msg += 'Clase CLIENTE ,';
      if(this.DEmail === undefined || this.DEmail.length === 0) msg += 'Correos: No se ha asociado ningún correo.';
      if(this.DDirecciones === undefined || this.DDirecciones.length === 0) msg += 'Direcciones: No se ha asociado ninguna dirección.';
      if (msg !== '') {
        this.showModal("Hay datos incompletos en los datos del CLIENTE: "+msg,"Faltan datos",'');
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

    const prmDatosGuardar = { ACREEDOR: this.FClientes, 
                              PROPIEDADES: this.DPropiedades, 
                              USUARIO: this.prmUsrAplBarReg.usuario
                             }

    // API guardado de datos
    var exito = false;
    this.loadingVisible = true;
    this._sdatos
    .save(accion, prmDatosGuardar, this.prmUsrAplBarReg.aplicacion)
    .subscribe((resp) => {
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
          this.QFiltro = " CLIENTES.ID_CLIENTE = '"+this.FClientes.ID_CLIENTE+"'"
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
    });

  }

  opPrepararBuscar(accion): void {
		if (accion === "filtro") 
    {

      const prmFiltro = {
        Titulo: "Datos de filtro para Propietarios/Arrendatarios",
        accion: "activar",
        Filtro: "",
        TablaBase: this.prmUsrAplBarReg.tabla,
        aplicacion: this.prmUsrAplBarReg.aplicacion,
        objRegistro: this._sbarreg, 
        objTab: this.tabService,
        usuario: this.prmUsrAplBarReg.usuario,
        title: 'Propietarios'
      };
      this.eventsSubjectFiltro.next(prmFiltro);

    } 
    else 
    {
      this._sfiltro.enConsulta = true;
      // Extrae la estructura del filtro
      let prmDatosBuscar = JSON.parse(accion);
      let arrFiltro = prmDatosBuscar.ESTRUCTURA;
      const prm = { CLIENTES: arrFiltro };

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
              this.FClientes = datares[0];
              this.QFiltro = datares[0].QFILTRO;
              
              this.selectRepresentante = [this.FClientes.REPRESENTANTE];
              this.selectIdLegal = [this.FClientes.ID_LEGAL];
              this.selectGrupo = [this.FClientes.ID_GRUPO];
              
              // Acondiciona peril tributario
              // if (this.FClientes.PERFIL_TRIBUTARIO??'' !== '') {
              //   this.FClientes.PERFIL_TRIBUTARIO = this.FClientes.PERFIL_TRIBUTARIO.split('|');
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
        'Desea eliminar el CLIENTE <i>' +
        this.FClientes.ID_CLIENTE +
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
    const prm = { ACREEDORES: { ID_CLIENTE: this.FClientes.ID_CLIENTE } };
    this._sdatos
      .delete('delete', prm, this.prmUsrAplBarReg.aplicacion)
      .subscribe((data) => {
        const res = JSON.parse(data.data);
        if (res[0].ErrMensaje !== ''){
          this.showModal(res[0].ErrMensaje, 'error');
          return;
        }

        // Elimina y posiciona en el Array de Consulta
        showToast('CLIENTE eliminado!', 'success');
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
          this.FClientes = JSON.parse(JSON.stringify(this.VDatosReg[0]));
          this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        }
        break;

      case "r_anterior":
        this.prmUsrAplBarReg.r_numReg =
          this.prmUsrAplBarReg.r_numReg === 1 ? 1 : this.prmUsrAplBarReg.r_numReg - 1;
        this.FClientes = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        break;

      case "r_siguiente":
        this.prmUsrAplBarReg.r_numReg =
        this.prmUsrAplBarReg.r_numReg === this.VDatosReg.length
          ? this.VDatosReg.length
          : this.prmUsrAplBarReg.r_numReg + 1;
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        this.FClientes = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
        break;

      case "r_ultimo":
        this.prmUsrAplBarReg.r_numReg = this.VDatosReg.length;
        this.FClientes = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
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
            this.formClientes.instance.resetValues();  
          }, 100);  
        }
        break;

      case "Eliminado":
        this.VDatosReg.splice(this.prmUsrAplBarReg.r_numReg - 1, 1);
        if (this.prmUsrAplBarReg.r_numReg > this.prmUsrAplBarReg.r_totReg) {
          this.prmUsrAplBarReg.r_numReg = this.prmUsrAplBarReg.r_totReg;
        }
        if (this.VDatosReg.length >= 0) {
          this.FClientes =
            this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1];
        }
        break;

      default:
        break;
    }

    // activa/inactiva propiedades
    try {
      this._sdatos.accion = 'r_numreg';
      this.treeBoxGrupo = [this.FClientes.ID_GRUPO];
      this.readOnly = true;
      this.readOnlyForm = true;
      this.readOnlyLlave = true;
      if (this.FClientes.FECHA_REGISTRO == null) this.FClientes.FECHA_REGISTRO = new Date();

      // DataSource's asociados
      this.DPropiedades = this.FClientes["PROPIEDADES"];
  
    } catch (error) {
      this.showModal(error);
    }

  }

  opBlanquearForma(): void {
    this.FClientes = {
      ID_CLIENTE: '',
      ESTADO: '',
      ID_LEGAL: '',
      NOMBRE: '',
      NOMBRE2: '',
      NOMBRE_COMPLETO: '',
      APELLIDO: '',
      APELLIDO2: '',
      APELLIDO_COMPLETO: '',
      TIPO: '',
      PERFIL_TRIBUTARIO: '',
      PERFIL_TASAS: '',
      ID_GRUPO: '',
      CONTACTO: '',
      NOMBRE_CONTACTO: '',
      REPRESENTANTE: '',
      CLASE: '',
      COMENTARIOS: '',
      FECHA_REGISTRO: new Date(),
      RT: '',
      TIPO_ID: '',
      PERSONA: '',
      CIUDAD: '',
      DIRECCION: '',
      EMAIL: '',
      TELEFONO: ''

    };
    
    this.DContactoAdic = [];
    this.DEmail = [];
    this.DDirecciones = [];
    this.DTelefonos = [];
    this.DCondiciones = [];
    this.DCLIENTEesPro = [];
    this.DBancos = [];
    this.FClientes_prev = JSON.parse(JSON.stringify(this.FClientes));
    this.borderStyle = "none";

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
    if (this.mnuAccion === 'update' && this.FClientes_prev.ID_CLIENTE === e.value) {
      return (true);
    }

    // Valida la existencia
    const prm = { ID_CLIENTE: e.value, accion: this.mnuAccion };
    const apiRest = this._sdatos.validar('EXISTE CLIENTE',prm,this.prmUsrAplBarReg.aplicacion);
    let res = await lastValueFrom(apiRest, {defaultValue: true});
    res = JSON.parse(res.data); 
    if (res[0].ErrMensaje === '') {
      this.activarEdicion('activo');
      return (true);
    }
    else {
      showToast(res[0].ErrMensaje, 'error');
      var fNextEditor:any = this.formClientes.instance.getEditor('ID_CLIENTE');
      fNextEditor.focus();
      this.activarEdicion('inactivo');
      return (false);
    }
  
  }

  // Valide Id Legal
  ValideIdLegal(e: any) {
    if (this.readOnlyForm || !this.mnuAccion.match('new|update')) {
      return (true);
    }

    // Valida la existencia
    if (isNaN(e.value)) {
      return (false);
    }
    else {
      return (true);
    }
  
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
        break;
      case 'activo':
        this.esEdicion = true;
        this.readOnly = false;
        this.readOnlyForm = false;
        this.readOnlyLlave = false;
        break;
      case 'consulta':
      case 'ini':
        this.esEdicion = false;
        this.readOnly = true;
        this.readOnlyForm = true;
        this.readOnlyLlave = true;
        break;
    
      default:
        break;
    }
  }

  getGrupos() {
    const prm = { ID_GRUPO: 'CLIENTEES' };
    this._sdatos.consulta('GRUPOS',prm,this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
      const res = JSON.parse(data);
      this.DGrupos = res;
    });
  }

  getIdLegal() {
    const prm = { };
    this._sdatos.consulta('ID LEGALES', prm, "ADM-205").subscribe((data: any)=> {
      const res = JSON.parse(data);
      this.DIdLegal = res;
    });
  }

  showIdTributarias() {
    this.idTributariasVisible = true;
    this.aceptarButtonOptions = {
      icon: 'fi fi-br-checkbox',
      text: 'Aceptar',
      onClick(e) {
        const message = `OK!!!`;
        notify({
          message,
          with: '300px',
          position: {
            my: 'center bottom',
            at: 'center bottom',
          },
        }, 'success', 3000);
      },
    };
    this.closeButtonOptions = {
      icon: 'fi fi-br-cross-circle',
      text: 'Cancelar',
      onClick(e) {
        this.idTributariasVisible = false;
      },
    };
  }

  getTributarias(){
    const prm = { };
    this._sdatos.consulta('LISTA GRAVAMENES', prm, 'generales').subscribe((data: any)=> {
      const res = JSON.parse(data.data);
      if ( (data.token != undefined) ){
        const refreshToken = data.token;
        localStorage.setItem("token", refreshToken);
      }
      this.DidTributaria = res;
    });
  }

  getPerfilesTributarios(){
    const prm = { };
    this._sdatos.consulta('PIV PERFIL TRIBUTARIO', prm, 'generales').subscribe((data: any)=> {
      const res = JSON.parse(data.data);
      if ( (data.token != undefined) ){
        const refreshToken = data.token;
        localStorage.setItem("token", refreshToken);
      }
      this.DidPerfilesTributarios = res;
    });
  }

  onKeyDownGrupo(e) {
    e.component.open();
  }

  onSeleccTipoIdLegal(e) {
    this.FClientes.TIPO = e.value;
  }
  onSeleccPersona(e) {
    this.FClientes.PERSONA = e.value;
  }
  onSeleccCiudad(e) {
    this.FClientes.CIUDAD = e.value;
  }

  onContentReadyGrupo(e:any) {
    if(e.rowType === 'data') {
      if(!e.data.ASIGNABLE) {
        e.cellElement.style.opacity = '.5'
      }
    }
  }
  onSelectionGrupo(e:any) {
    if(e.selectedRowKeys.length > 0) {
      if(e.selectedRowsData[0].ASIGNABLE) {
        this.isTreeBoxOpened = false;
        this.FClientes.ID_GRUPO = e.selectedRowKeys[0];
      } else {
        this.FClientes.ID_GRUPO = '';
        this.treeBoxGrupo = [];
        this.isTreeBoxOpened = true;
      }
    } else {
      this.FClientes.ID_GRUPO = '';
      this.treeBoxGrupo = [];
    }
  }
  
  onKeyDownContactos(e) {
    e.component.open();
  }

  onValueChangedPerfilTributario(e: any) {
    
  }
  onSelectionChangedPerfilTributario(e) {
    this.selectPerfilTributario = e.selectedRowKeys;
  }
  
  onSelectionChangedTributario(e) {
    this.selectTributario = e.selectedRowKeys;
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

  initNewRow(e){
    e.data.ITEM = 0;
    e.data.TIPO = '';
    e.data.ID_PROPIEDAD = '';
    e.data.NUM_PROPIEDAD = '';
    e.data.UBICACION = '';
    e.data.NUM_UBICACION = '';
    e.data.DOMICILIO = '';
    e.data.LISTA_ARRENDATARIOS = '';
    e.data.LISTA_TARIFA = '';
    e.data.ARRENDATARIO = [];
    if (this.DPropiedades.length > 0) {
      const item = this.DPropiedades.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act}) 
      e.data.ITEM = item.ITEM + 1;
    }
    else {
      e.data.ITEM = 1;
    }
    e.data.isEdit = false;
  }

  insertedRow(e){
    this.rowApplyChanges = false;
    this.esVisibleSelecc = 'always';
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
  }
  onEditingStart(e) {
    this.esVisibleSelecc = 'none';
    e.data.isEdit = true;
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
        }
      }
    if (e.rowType === "header" && e.rowIndex === 2 && !this.esEdicion) {
      e.rowElement.style.display = "none";
    }
  }

  onRowValidating(e: any) {
    // Valida completitud
    var errMsg = '';
    if (e.newData.TIPO !== undefined && e.newData.TIPO == '') 
      errMsg = 'Falta seleccionar tipo propiedad';
    if (e.newData.ID_PROPIEDAD !== undefined && e.newData.ID_PROPIEDAD <= 0) 
      errMsg = 'Falta seleccionar número propiedad';
    if (e.newData.ID_TARIFA !== undefined && e.newData.ID_TARIFA == "") 
      errMsg = 'Falta seleccionar tarifa';
    if (errMsg !== '') {
      e.isValid = false;
      showToast(errMsg, 'warning');
      return;
    }
  }
  onFocusedRowChanged(e){
    const rowData = e.row && e.row.data;
    if (rowData) {
      this.valoresObjetos('atributos');
    }
  }
  onEditCanceled(e) {
    this.esVisibleSelecc = 'always';
  }
  onValueChangedArre(e, cellInfo) {
    cellInfo.data.LISTA_ARRENDATARIOS = "";
    e.value.forEach(elearre => {
      const darre = this.DArrendatariosLista.find(a => a.ID_CLIENTE == elearre);
      if (darre) {
        cellInfo.data.LISTA_ARRENDATARIOS = cellInfo.data.LISTA_ARRENDATARIOS + 
                                            (cellInfo.data.LISTA_ARRENDATARIOS !== "" ? " | " : "") + 
                                            elearre + "; " + darre.NOMBRE_COMPLETO;
      }
    });
  }
  onValueChangedTarifa(e, cellInfo) {
    cellInfo.data.LISTA_TARIFA = "";
    const darre = this.DTarifas.find(a => a.ID_TARIFA == e.value);
    if (darre) {
      cellInfo.data.LISTA_TARIFA = e.value + "; " + formatNumber(darre.VALOR, 'en-US', '1.2-2');
    }
  }

  crearArre(e, accion) {
    this.eventsSubjectArre.next({ operacion: 'nuevo', titulo: 'Arrendatarios'});
  }
  
  operGrid(e, operacion) {
    switch (operacion) {
      case 'new':
        this.gridPropiedades.instance.addRow();
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
        this.gridPropiedades.instance.saveEditData();
        this.rowApplyChanges = false;
        this.rowNew = true;
        this.esVisibleSelecc = 'always';
        break;
      case 'cancel':
        this.gridPropiedades.instance.cancelEditData();
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
              const index = this.DPropiedades.findIndex(a => a.ITEM === key);
              this.DPropiedades.splice(index, 1);
            });
            this.gridPropiedades.instance.refresh();
            this.conCambios++;
          }
        });
        break;

      default:
        break;
    }
  }

  // Refresca lista y agrega a arrendatarios
  onRespuestaCrear(e: any) {

    if (e.accion === 'aceptar') {
      // Agragar a la lista
      const arrnuevo = { ID_CLIENTE: e.data.ID_CLIENTE, 
                         NOMBRE_COMPLETO: e.data.NOMBRE+(' '+e.data.NOMBRE2).trimEnd()+' '+e.data.APELLIDO+(' '+e.data.APELLIDO2).trimEnd()};
      // Adds the entry to the data source
      this.DArrendatarios.store().insert(arrnuevo);
      // Reloads the data source
      this.DArrendatarios.reload();

      // Agrega a la lista en la celda
      let selec: any[] = this.tagArrendatarios.instance.option('value')!;
      selec = [ ...selec, e.data.ID_CLIENTE ];
      this.tagArrendatarios.instance.option('value', selec);
      
      // Lista arrentadarios para desplegar
      let listaArr = "";
      selec.forEach(elearre => {
        const darre = this.DArrendatariosLista.find(a => a.ID_CLIENTE == elearre);
        if (darre) {
          listaArr = listaArr + (listaArr !== "" ? " | " : "") + 
                     elearre + "; " + darre.NOMBRE_COMPLETO;
        }
      });
      var rowIndex = this.gridPropiedades.instance.getRowIndexByKey(this.keyFila);  
      this.gridPropiedades.instance.cellValue(rowIndex, "LISTA_ARRENDATARIOS", listaArr);

    }
  }

  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj == 'id_legal' || obj == 'todos') {
      const prm = { };
      this._sdatos.consulta('ID LEGALES', prm, "ADM-205").subscribe((data: any)=> {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DTipoIdLegal = res[0].TIPOS_ID;
        this.DPersona = res[0].PERSONA;
      });
    }

    if (obj == 'ciudades' || obj == 'todos') {
      opcion = opcion == undefined ? {TIPO_UBICACION: 'Ciudad' } : opcion;
      const prm = opcion;
      this._sdatos.consulta('ubicaciones', prm, "ADM-006").subscribe((data: any) => {
          var res = JSON.parse(data.data);
          if ( (data.token != undefined)){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.DCiudades = res;
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

    if (obj === 'grupos' || obj === 'todos') {
      const prm = { ID_GRUPO_PADRE: 'CLIENTES' };
      this._sdatos.consulta('ARBOL GRUPOS', prm, "ADM-203").subscribe((data: any)=> {
        const res = validatorRes(data);
        if (res[0].ErrMensaje !== '') {
          this.showModal(res[0].ErrMensaje);
        } 
        // Refresca 
        this.DGrupos = res;
      });
    }

    if (obj === 'tipos' || obj === 'todos') {
      const prm = { ID_DOMINIO: 'DIRECCIONES', ID_GRUPO_DOMINIO: 'NOMENCLATURA' };
      this._sdatos.consulta('DOMINIOS', prm, "generales").subscribe((data: any)=> {
        const res = validatorRes(data);
        if (res[0].ErrMensaje !== '') {
          this.showModal(res[0].ErrMensaje);
        } else {
          this.DTipos = res;
        }
        // Refresca también el de partes
        this.DTipos = res;
      });
    }

    if (obj === 'arrendatarios' || obj === 'todos') {
      const prm = { ID_GRUPO: 'ARRENDATARIO' };
      this._sdatos.consulta('ARRENDATARIOS', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DArrendatariosLista = res;
        this.DArrendatarios = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });
      });
    }

    if (obj === 'tarifas' || obj === 'todos') {
      const prm = { ID_LISTA: 'TARIFAS' };
      this._sdatos.consulta('TARIFAS', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DTarifas = res;
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
