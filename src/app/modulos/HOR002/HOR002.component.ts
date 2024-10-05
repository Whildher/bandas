import { Component, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { DxButtonModule, DxCheckBoxComponent, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxComponent, DxDateBoxModule, DxDropDownBoxModule, DxFormComponent, DxFormModule, DxLoadPanelModule, 
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
import { clsArrendatarios, clsPropiedades, clsPropietarios } from './clsHOR002.class';
import { CommonModule, formatNumber } from '@angular/common';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import DataSource from 'devextreme/data/data_source';
import { HOR00202Component } from './HOR00202/HOR00202.component';
import { HOR00201Component } from './HOR00201/HOR00201.component';
import { FiltrobusqComponent } from 'src/app/shared/filtrobusq/filtrobusq.component';

@Component({
  selector: 'app-HOR002',
  templateUrl: './HOR002.component.html',
  styleUrls: ['./HOR002.component.css'],
  standalone: true,
  imports: [MatTabsModule, DxLoadPanelModule, DxFormModule, DxSelectBoxModule,
            DxDropDownBoxModule, DxDataGridModule, DxTreeListModule, DxButtonModule,
            DxTextBoxModule,DxTagBoxModule, DxValidatorModule,
            DxTabsModule, CommonModule, DxDateBoxModule, DxCheckBoxModule,
            HOR00202Component, HOR00201Component, FiltrobusqComponent
    ]
})
export class HOR002Component {
  @ViewChild("formPropiedades", { static: false }) formPropiedades: DxFormComponent;
  @ViewChild("gridPropietarios", { static: false }) gridPropietarios: DxDataGridComponent;
  @ViewChild("tagArrendatarios", { static: false }) tagArrendatarios: DxTagBoxComponent;
  @ViewChild("xs_FECHA_ADQUISICION", { static: false }) fechaAdq: DxDateBoxComponent;
  @ViewChild("chFacturable", { static: false }) chFacturable: DxCheckBoxComponent;
  
  

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

  FPropiedades: clsPropiedades;
  DPropietarios: clsPropietarios[] = [];
  DArrendatarios: clsArrendatarios[] = [];
  DListaPropBase: any[] = [];
  DListaProp: any;
  DListaArreBase: any = [];
  DListaArre: any = [];
  DPropiedadesPadreBase: any[] = [];
  DPropiedadesPadre: any = [];
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
  
  customValTarifa: boolean = false;
  eventsSubjectInformes: Subject<any> = new Subject<any>();
  eventsSubjectFiltro: Subject<any> = new Subject<any>();
  eventsSubjectProp: Subject<any> = new Subject<any>();
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
    // this.subs_filtro = this._sfiltro.setObsFiltro.pipe().subscribe(resp => {
    //   // Ejecuta búsqueda -> Valida si la petición es para esta aplicacion
    //   const dfiltro = JSON.parse(resp);
    //   if (dfiltro.aplicacion === this.prmUsrAplBarReg.aplicacion)
    //     this.opPrepararBuscar(resp);
    // })

    // Respuesta del visor de datos
    this.subs_visor = this.SVisor.getObs_Apl().subscribe(resp => {
      // Ubica el registro
      if (this.SVisor.PrmVisor.aplicacion !== this.prmUsrAplBarReg.aplicacion) return;
      if (resp.accion === 'abrir') return;
      const nx = this.VDatosReg.findIndex(d => d.ID_PROPIEDAD === resp.ID_PROPIEDAD);
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
      tabla: "INMUEBLES",
      aplicacion: "HOR-002",
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
    this.FPropiedades = new clsPropiedades;

    // Inicializa datos
    this.valoresObjetos('todos');

  }

  ngAfterViewInit(): void {
    this.activarEdicion('ini');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subs_visor.unsubscribe();
  }


  onSeleccEstado(e: any): void {
    this.FPropiedades.ESTADO = e.value;
  }

  // Llama a Acciones de registro
	opMenuRegistro(operMenu: clsBarraRegistro): void {
    // Activa modo de operacion para los demás componentes

		switch (operMenu.accion) {
			case "r_ini":
				const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "INMUEBLES",
          aplicacion: "HOR-002",
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
                                   : " CLIENTES.ID_PROPIEDAD = '"+this.FPropiedades.ID_PROPIEDAD+"'" 
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
                        nombre: this.FPropiedades.ID_PROPIEDAD,
                        email: this.DEmail.length !== 0 ? this.DEmail[0].EMAIL : '',
                        template,
                        replacements: '',
                        dataSource: this.FPropiedades
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
    this.FPropiedades.ESTADO = 'ACTIVO';
    this.FPropiedades.FECHA_ADQUISICION = new Date();
    this.customValTarifa = false;
    this.eventsSubjectArre.next('reset');
    this.eventsSubjectProp.next('reset');
    this.treeBoxGrupo = [];
    this.activarEdicion('llave');
  }

  async opPrepararModificar()  {
		this.readOnly = false;

    // Valida la existencia
    this.customValTarifa = false;
    this.activarEdicion('activo');
    const prm = { ID_CLIENTE: this.FPropiedades.ID_PROPIEDAD, accion: 'integridad referencial' };
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
      if(this.FPropiedades.ID_PROPIEDAD === '') msg += 'Id Propiedad ,';
      if(this.FPropiedades.ID_TARIFA === null || this.FPropiedades.ID_TARIFA === '') msg += 'Tarifa,';
      if(this.FPropiedades.TIPO_INMUEBLE === '') msg += 'Tipo Inmueble ,';
      if(this.FPropiedades.NUM_INMUEBLE === '') msg += 'Numero Inmueble ,';
      if(this.FPropiedades.OCUPACION === '') msg += 'Ocupación ,';
      if (msg !== '') {
        this.showModal("Hay datos incompletos en los datos del Inmueble: "+msg,"Faltan datos",'');
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

    const prmDatosGuardar = { INMUEBLES: this.FPropiedades, 
                              PROPIETARIOS: this.DPropietarios, 
                              ARRENDATARIOS: this.DArrendatarios,
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
          this.QFiltro = " INMUEBLES.ID_PROPIEDAD = '"+this.FPropiedades.ID_PROPIEDAD+"'"
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
        this.eventsSubjectProp.next({operacion: 'inactivo'});

        showToast('Registro actualizado', 'success');

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
        Titulo: "Datos de filtro para Inmuebles",
        accion: "activar",
        Filtro: "",
        TablaBase: this.prmUsrAplBarReg.tabla,
        aplicacion: this.prmUsrAplBarReg.aplicacion,
        objRegistro: this._sbarreg, 
        objTab: this.tabService,
        usuario: this.prmUsrAplBarReg.usuario,
        title: 'Inmuebles'
      };
      this.eventsSubjectFiltro.next(prmFiltro);

    } 
    else 
    {
      this._sfiltro.enConsulta = true;
      // Extrae la estructura del filtro
      let prmDatosBuscar = JSON.parse(accion);
      let arrFiltro = prmDatosBuscar.ESTRUCTURA;
      const prm = { INMUEBLES: arrFiltro };

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
              this.FPropiedades = datares[0];
              this.QFiltro = datares[0].QFILTRO;
              
              
              // Acondiciona peril tributario
              // if (this.FPropiedades.PERFIL_TRIBUTARIO??'' !== '') {
              //   this.FPropiedades.PERFIL_TRIBUTARIO = this.FPropiedades.PERFIL_TRIBUTARIO.split('|');
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
        this.FPropiedades.ID_PROPIEDAD +
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
    const prm = { ACREEDORES: { ID_CLIENTE: this.FPropiedades.ID_PROPIEDAD } };
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
          this.FPropiedades = JSON.parse(JSON.stringify(this.VDatosReg[0]));
          this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        }
        break;

      case "r_anterior":
        this.prmUsrAplBarReg.r_numReg =
          this.prmUsrAplBarReg.r_numReg === 1 ? 1 : this.prmUsrAplBarReg.r_numReg - 1;
        this.FPropiedades = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        break;

      case "r_siguiente":
        this.prmUsrAplBarReg.r_numReg =
        this.prmUsrAplBarReg.r_numReg === this.VDatosReg.length
          ? this.VDatosReg.length
          : this.prmUsrAplBarReg.r_numReg + 1;
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        this.FPropiedades = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
        break;

      case "r_ultimo":
        this.prmUsrAplBarReg.r_numReg = this.VDatosReg.length;
        this.FPropiedades = JSON.parse(JSON.stringify(this.VDatosReg[this.prmUsrAplBarReg.r_numReg - 1]));
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
            this.formPropiedades.instance.resetValues();  
          }, 100);  
        }
        break;

      case "Eliminado":
        this.VDatosReg.splice(this.prmUsrAplBarReg.r_numReg - 1, 1);
        if (this.prmUsrAplBarReg.r_numReg > this.prmUsrAplBarReg.r_totReg) {
          this.prmUsrAplBarReg.r_numReg = this.prmUsrAplBarReg.r_totReg;
        }
        if (this.VDatosReg.length >= 0) {
          this.FPropiedades =
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
      if (this.FPropiedades.FECHA_ADQUISICION == null) this.FPropiedades.FECHA_ADQUISICION = new Date();

      // Valores de sbox
      this.customValTarifa = true;

      // DataSource's asociados
      this.DPropietarios = JSON.parse(JSON.stringify(this.FPropiedades["PROPIETARIOS"]));
      this.DArrendatarios = JSON.parse(JSON.stringify(this.FPropiedades["ARRENDATARIOS"]));
  
      // Navega  los componentes items
      this.eventsSubjectProp.next({ operacion: 'consulta', dataSource: this.DPropietarios });
      this.eventsSubjectArre.next({ operacion: 'consulta', dataSource: this.DArrendatarios });
      
    } catch (error) {
      this.showModal(error);
    }

  }

  opBlanquearForma(): void {
    this.FPropiedades = {
      ID_PROPIEDAD: '',
      ID_PROPIEDAD_PADRE: '',
      TIPO_INMUEBLE: '',
      NUM_INMUEBLE: '',
      TIPO_INMUEBLE2: '',
      NUM_INMUEBLE2: '',
      DOMICILIO: '',
      ID_UBICACION: '',
      ESTADO: '',
      FECHA_ADQUISICION: new Date(),
      MATRICULA: '',
      ID_TARIFA: '',
      TELEFONO: '',
      OCUPACION: '',
      DEPENDIENTES: '',
      OBSERVACIONES: '',
    };
    
    this.DContactoAdic = [];
    this.DEmail = [];
    this.DDirecciones = [];
    this.DTelefonos = [];
    this.DCondiciones = [];
    this.DCLIENTEesPro = [];
    this.DBancos = [];
    this.FPropiedades_prev = JSON.parse(JSON.stringify(this.FPropiedades));
    this.borderStyle = "none";

    // Inicializa adicionales
    this.eventsSubjectArre.next({ operacion: 'nuevo'});
    this.eventsSubjectProp.next({ operacion: 'nuevo'});

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
    if (this.mnuAccion === 'update' && this.FPropiedades_prev.ID_PROPIEDAD === e.value) {
      return (true);
    }

    // Valida la existencia
    const prm = { ID_CLIENTE: e.value, accion: this.mnuAccion };
    const apiRest = this._sdatos.validar('EXISTE INMUEBLE',prm,this.prmUsrAplBarReg.aplicacion);
    let res = await lastValueFrom(apiRest, {defaultValue: true});
    res = JSON.parse(res.data); 
    if (res[0].ErrMensaje === '') {
      this.activarEdicion('activo');
      return (true);
    }
    else {
      showToast(res[0].ErrMensaje, 'error');
      var fNextEditor:any = this.formPropiedades.instance.getEditor('ID_PROPIEDAD');
      fNextEditor.focus();
      this.activarEdicion('inactivo');
      return (false);
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
        this.eventsSubjectProp.next({ operacion: 'inactivo' });
        this.eventsSubjectArre.next({ operacion: 'inactivo' });
        break;
      case 'activo':
        this.esEdicion = true;
        this.readOnly = false;
        this.readOnlyForm = false;
        this.readOnlyLlave = false;
        this.eventsSubjectProp.next({ operacion: 'activo' });
        this.eventsSubjectArre.next({ operacion: 'activo' });
        break;
      case 'consulta':
      case 'ini':
        this.esEdicion = false;
        this.readOnly = true;
        this.readOnlyForm = true;
        this.readOnlyLlave = true;
        this.eventsSubjectProp.next({ operacion: 'inactivo' });
        this.eventsSubjectArre.next({ operacion: 'inactivo' });
        break;
    
      default:
        break;
    }
  }

  onSeleccCiudad(e) {
    this.FPropiedades.ID_UBICACION = e.value;
  }
  onChangeFecha(e) {
    this.FPropiedades.FECHA_ADQUISICION = e.value;
    this.fechaAdq.instance._refresh();
  }
  onValueChangedFac(e, cellInfo) {

  }
  
  verCiudad(item) {
    if (item)
      return item.ID_UBICACION + '; ' + item.NOMBRE;
    else
      return "";
  }
  verTarifa(item) {
    if (item)
      return (item.ID_TARIFA ? item.ID_TARIFA + '; ' + formatNumber(item.VALOR, 'en-US', '1.2-2') : item);
    else
      return "";
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

  onValueChangedArre(e) {
  }

  // Refresca lista y agrega a Propietarios
  onRespuestaProp(e: any) {
    if (e.operacion == 'facturable') {
      this.eventsSubjectArre.next(e);
    }
    if (e.operacion == 'datos') {
      this.DPropietarios = e.data;
    }
  }
  // Refresca lista y agrega a arrendatarios
  onRespuestaArre(e: any) {
    if (e.operacion == 'facturable') {
      this.eventsSubjectProp.next(e);
    }
    if (e.operacion == 'datos') {
      this.DArrendatarios = e.data;
    }
  }
  onRespuestaFiltro(e: any) {
  }
  
  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj == 'ciudades' || obj == 'todos') {
      opcion = opcion == undefined ? {TIPO_UBICACION: 'Ciudad' } : opcion;
      const prm = opcion;
      this._sdatos.consulta('ubicaciones', prm, "ADM-006").subscribe((data: any) => {
          var res = JSON.parse(data.data);
          if ( (data.token != undefined)){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.DCiudadesLista = res;
          this.DCiudades = new DataSource({
            store: res,  
            paginate: true,
            pageSize: 20
          });
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

    if (obj === 'padres' || obj === 'todos') {
      const prm = { ID_PROPIEDAD: opcion };
      this._sdatos.consulta('PROPIEDADES PADRE', prm, this.prmUsrAplBarReg.aplicacion).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DPropiedadesPadreBase = res;
        this.DPropiedadesPadre = new DataSource({
          store: res,  
          paginate: true,
          pageSize: 20
        });

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
