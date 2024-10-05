import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DxFormComponent, DxFormModule, DxPopupComponent, DxPopupModule, DxSelectBoxModule } from 'devextreme-angular';
import { clsClientes } from '../clsHOR001.class';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import { Observable, Subscription, lastValueFrom } from 'rxjs';
import { showToast } from '../../../shared/toast/toastComponent.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-HOR00101',
  templateUrl: './HOR00101.component.html',
  styleUrls: ['./HOR00101.component.css'],
  standalone: true,
  imports: [ DxFormModule, DxPopupModule, DxSelectBoxModule ]
})
export class HOR00101Component {
  @ViewChild("popFactPrv", { static: false }) popFactPrv: DxPopupComponent;
  @ViewChild("formArrendatarios", { static: false }) formArrendatarios: DxFormComponent;

  FArrendatarios: clsClientes;
  DPropiedades: any[] = [];
  DCiudades: any[] = [];
  readOnly: boolean = false;
  DTipoIdLegal: any = [];
  DPersona: any = [];
  configBotonAceptar: any;
  configBotonCancelar: any;
  visiblePopup: boolean = false;
  popUpLog: any;
  gridLog: any;
  loadingVisible: boolean = false;
  titAplicacion: string;
  accion: string;
        
  private eventsSubscription: Subscription;

  @Input() events: Observable<any>;

  @Input() visible: boolean;

  @Output() onGuardarDatos = new EventEmitter<any>;

  
  constructor(private _sdatos: HOR001Service) 
  { 
    this.configBotonAceptar = {
      icon: 'todo',
      text: 'Aceptar',
      onClick: this.accionPopUp.bind(this, 'aceptar')
    };
    this.configBotonCancelar = {
      icon: 'close',
      text: 'Cancelar',
      onClick: this.accionPopUp.bind(this, 'cancelar')
    };

    this.ValideExistencia = this.ValideExistencia.bind(this);

  }

  onShown(e: any) {
  }
  onHidden(e:any) {
    this.visiblePopup = false;
  }
  onInitializedPopUp(e: any) {
    this.popUpLog = e.component;
  }
  onInitializedGrid(e: any) {
    this.gridLog = e.component;
  }
  onResizeEnd(e: any) {
    //let popupHeight = Number(this.popUpVisor.instance.option("height"))?? 400;
    let popupHeight = Number(this.popUpLog.option("height"))?? 400;
    this.gridLog.option("height",popupHeight-100);
  }
  accionPopUp(accion) {

    if (accion === 'aceptar') {

      // Guarda lista de preparación para pagos
      const user:any = localStorage.getItem("usuario");
      const prmGuardar = { PROPIETARIO: this.FArrendatarios, GRUPO: 'ARRENDATARIO', USUARIO: user };
      this.loadingVisible = true;
      this._sdatos
        .save('new', prmGuardar, "HOR-001")
        .subscribe((resp) => {
          this.loadingVisible = false;
          const res = JSON.parse(resp.data);
          if (res[0].ErrMensaje !== ""){
            this.showModal(res[0].ErrMensaje, 'error');
            return;
          } 
          else
          {
            this.visiblePopup = false;
            this.onGuardarDatos.emit({ accion, data: this.FArrendatarios })
          }
        });
  
    }
    else {
      this.visiblePopup = false;
    }
    return;
  }

  onSeleccTipoIdLegal(e) {
    this.FArrendatarios.TIPO = e.value;
  }
  onSeleccPersona(e) {
    this.FArrendatarios.PERSONA = e.value;
  }
  onSeleccCiudad(e) {
    this.FArrendatarios.CIUDAD = e.value;
  }

  // Valide CLIENTEes
  async ValideExistencia(e: any) {
    if (this.readOnly) return (true);

    // Valida la existencia
    const prm = { ID_CLIENTE: e.value, accion: 'new' };
    const apiRest = this._sdatos.validar('EXISTE CLIENTE',prm,'HOR-001');
    let res = await lastValueFrom(apiRest, {defaultValue: true});
    res = JSON.parse(res.data); 
    if (res[0].ErrMensaje === '') {
      return (true);
    }
    else {
      showToast(res[0].ErrMensaje, 'error');
      var fNextEditor:any = this.formArrendatarios.instance.getEditor('ID_CLIENTE');
      fNextEditor.focus();
      return (false);
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

    if (obj == 'consulta cliente') {
      const prm = opcion;
      this._sdatos.consulta('consulta', prm, "HOR-001").subscribe((data: any) => {
          var res = JSON.parse(data.data);
          if ( (data.token != undefined)){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.FArrendatarios = res[0];
      });
    }

  }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((datos: any) => {
      this.accion = datos.operacion;
      switch (datos.operacion) {
        case 'nuevo':
          this.visiblePopup = true;
          this.FArrendatarios = new clsClientes();
          this.FArrendatarios.ESTADO = 'ACTIVO'
          this.FArrendatarios.ID_GRUPO = 'ARRENDATARIO'
          this.titAplicacion = datos.titulo;
          this.readOnly = false;
          break;
      
        case 'consulta':
          this.FArrendatarios = datos.dataSource;
          break;
          
        case 'consulta cliente':
          this.FArrendatarios = new clsClientes();
          this.titAplicacion = datos.titulo;
          this.visiblePopup = true;
          this.readOnly = true;
          this.valoresObjetos('consulta cliente', datos.filtro);
          break;
          
        default:
          break;
      }
    });
    this.valoresObjetos('todos');

  }
  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
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
      customClass : { container : 'msg-swal' },
			stopKeydownPropagation: false,
		});
	}

}
