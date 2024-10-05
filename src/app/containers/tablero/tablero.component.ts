import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';

import * as drag from '../../../assets/js/drag.js';
import { GeneralesService } from 'src/app/services/generales/generales.service';
import { TabService } from '../tabs/tab.service';
import { tabs } from '../../shared/classes/tabs.class';
import { GlobalVariables } from '../../shared/common/global-variables';
import { Tab } from '../tabs/tab.model';
import { clsBarraRegistro } from '../regbarra/_clsBarraReg';
import { Subscription } from 'rxjs';
import { SbarraService } from '../regbarra/_sbarra.service';
import Swal from 'sweetalert2';
import { CommonModule, DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.scss',
              './stylesdrag.css',
              './bootstrap.min.css',
              './material-icons.css',
              '../../../assets/xtein.scss'
            ],


  standalone: true,
  imports: [CommonModule ]
})
export class TableroComponent implements OnInit {
  @HostBinding('class.projects-table') public readonly projectsTable = true;
  

  myCustomPalette1: string[];
  myCustomPalette2: string[];
  
  customizeLabel(e) {
    return `${e.argumentText}\n${e.valueText}`;
  }

  populationData: any [];
  pipe: any = new DecimalPipe('en-es');
  

  // Datos mas usadas
  tblMasUsadas: any;
  TAplicaciones: any;
  tblFavoritas: any;
  tblAplUsr: any;
  loadingVisible: boolean = false;
  visible: boolean = false;
  visibleListaFav: boolean = false;
  seleccAplFavUsr: any[] = [];
  prmUsrAplBarReg: clsBarraRegistro;
  subscription: Subscription;
  isPopupVisible: boolean = false;


  constructor(
    private _sdatos: GeneralesService,
    private tabService: TabService,
    private _sbarreg: SbarraService
    ) 
  {
    // Servicio de barra de registro
    this.subscription = this._sbarreg
    .getObsRegApl()
    .subscribe((datreg) => {
      // Valida si la petición es para esta aplicacion
      if (datreg.aplicacion === this.prmUsrAplBarReg.aplicacion)
        this.opMenuRegistro(datreg);
    });
    this.usuApl = this.usuApl.bind(this);
    
  }

  togglePopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
  }

  // Llama a Acciones de registro
  opMenuRegistro(operMenu: clsBarraRegistro): void {

    switch (operMenu.accion) {
      case "r_ini":
        const user:any = localStorage.getItem("usuario");
        this.prmUsrAplBarReg = {
          tabla: "PRODUCTOS",
          aplicacion: "PRO-022",
          usuario: user,
          accion: "r_ini",
          error: "",
          r_numReg: 0,
          r_totReg: 0,
          operacion: {}
        };
        this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);
        break;

      default:
        break;
    }
  }


  // Cargue de datos de widgets
  cargarDatos() {
    // Widget top ventas
    const prmv = { USUARIO: this.prmUsrAplBarReg.usuario };
    this._sdatos.consulta('USUARIOS APLICACIONES', prmv, 'BAN-001').subscribe((data: any)=> {
      const res = JSON.parse(data.data);
      if ( (data.token != undefined) ){
        const refreshToken = data.token;
        localStorage.setItem("token", refreshToken);
      }
      if (res[0].ErrMensaje === '') {
        this.TAplicaciones = res;
      }
    });

  }

  usuApl(aplicacion) {
    if (this.TAplicaciones)
      return this.TAplicaciones.findIndex(a => a.ID_APLICACION == aplicacion) != -1
    else
      return false;
  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.prmUsrAplBarReg = {
      tabla: "Tablero",
      aplicacion: "ADM-300",
      usuario: user,
      accion: "r_ini",
      error: "",
      r_numReg: 0,
      r_totReg: 0,
      operacion: {}
    };
    this._sbarreg.setObsMenuReg(this.prmUsrAplBarReg);

  }

  ngAfterViewInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // ****** Adiciona a la página de tareas la aplicacion seleccionada ******
  // Buscar en el arbol de aplicaciones si es una aplicacion
  // Abrir la aplicacion si no está abierta
  public abrirApl(aplicacion){
    
    const item = this.TAplicaciones.find(a => a.ID_APLICACION == aplicacion);

    const listaTab = this.tabService.tabs.find(c => c.aplicacion === item.ID_APLICACION);
    const compo:any = tabs.find(c => c.aplicacion === item.ID_APLICACION);
        
    if (listaTab === undefined) {
      // Adicione a la lista de aplicaciones abiertas
      GlobalVariables.listaAplicaciones.unshift({ aplicacion: item.ID_APLICACION, barra: undefined, statusEdicion: '' });

      // Crea pestaña contenedora de la aplicación
      this.tabService.addTab(
          new Tab(compo.component, 
                  item.NOMBRE, 
                  { parent: "PrincipalComponent" }, 
                  item.ID_APLICACION,
                  item.icon,
                  item.TABLA_APLICACION,
                  true));
      
      // Adiciona a las más usadas
      const prm = { aplicacion: item.ID_APLICACION, 
                    ip: this._sdatos.getIPAddress, 
                    usuario: localStorage.getItem('usuario') }
      this._sdatos.consulta('uso aplicacion',prm,'generales').subscribe((data: any)=> {
        const res = JSON.parse(data.data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
      });
    }

    // Si existe, activa Tab
    else {
      const indexTab = this.tabService.tabs.findIndex(c => c.aplicacion === item.ID_APLICACION);
      this.tabService.activaTab(indexTab);
    }

  }

  // Activa menu de apl del usuario
  abrirListaFav() {
    this.visibleListaFav = true;
  }
  clickAplFav(e:any) {
    // Toma la selección y adiciona/elimina favoritas
    this.tblFavoritas = [];
    for (var k=0; k < this.seleccAplFavUsr.length; k++) {
      const apl = this.tblAplUsr.find((a:any) => a.ID_APLICACION === this.seleccAplFavUsr[k]);
      this.tblFavoritas.push(apl);
    }
    this.visibleListaFav = false;
  }

  showModal(mensaje:any, titulo = 'Error!', msg_html= '') {
    Swal.fire({
      iconHtml: "<i class='icon-cancelar-ol error-color'></i>",
      confirmButtonColor: '#0F4C81',
      title: titulo,
      text: mensaje,
      allowOutsideClick: true,
      allowEscapeKey: false,
      allowEnterKey: false,
      backdrop: true,
      position: "center",
      html: msg_html,
      stopKeydownPropagation: false,
    });
  }

}
