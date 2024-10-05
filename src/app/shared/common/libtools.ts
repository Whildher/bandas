import { Subscription } from 'rxjs';
import { clsBarraRegistro } from '../../containers/regbarra/_clsBarraReg';
import { SbarraService } from '../../containers/regbarra/_sbarra.service';
import { Tab } from '../../containers/tabs/tab.model';
import { TabService } from '../../containers/tabs/tab.service';
import { GeneralesService } from '../../services/generales/generales.service';
import { tabs } from '../classes/tabs.class';
import { GlobalVariables } from './global-variables';

export class libtools {

  subscription: Subscription;

  constructor(
    private _sbarreg: SbarraService,
    private tabService: TabService
  ) { }

  //---------------------------------------------------------//
  //    Abrir una aplicacion desde otra con parámetros       //
  prmUsrAplBarReg: clsBarraRegistro;
  public abrirApl(compoApl:any, accion:any) {

    const listaTab = this.tabService.tabs.find(c => c.aplicacion === compoApl.ID_APLICACION && c.title === compoApl.title);
    const compo:any = tabs.find(c => c.aplicacion === compoApl.ID_APLICACION);
        
    if (listaTab === undefined) {
      // Adicione a la lista de aplicaciones abiertas
      GlobalVariables.listaAplicaciones.unshift({ aplicacion: compoApl.ID_APLICACION, barra: undefined, statusEdicion: '' });

      // Crea pestaña contenedora de la aplicación
      this.tabService.addTab(
          new Tab(compo.component, 
                  compoApl.title, 
                  { parent: "PrincipalComponent" }, 
                  compoApl.ID_APLICACION,
                  compoApl.icon,
                  compoApl.TABLA,
                  true));
      
      // Adiciona a las más usadas
      // const prm = { aplicacion: compoApl.aplicacion, 
      //               ip: this._sdatos.getIPAddress, 
      //               usuario: localStorage.getItem('usuario') }
      // this._sdatos.consulta('uso aplicacion',prm,'generales').subscribe((data: any)=> {
      //   const res = JSON.parse(data.data);
      //   if ( (data.token != undefined) ){
      //     const refreshToken = data.token;
      //     localStorage.setItem("token", refreshToken);
      //   }
      // });
    }
    // Si existe, activa Tab
    else {
      const indexTab = this.tabService.tabs.findIndex(c => c.aplicacion === compoApl.ID_APLICACION);
      this.tabService.activaTab(indexTab);
    }

    if(accion === 'consulta') {
      // Envia evento de búsqueda
      setTimeout(() => {
        this.prmUsrAplBarReg = {
          tabla: compoApl.TABLA,
          aplicacion: compoApl.ID_APLICACION,
          usuario: compoApl.user,
          accion: 'r_buscar_ejec',
          error: '',
          r_numReg: 0,
          r_totReg: 0,
          operacion: { filtro_arg: compoApl.FILTRO },
        };
        this._sbarreg.setObsRegApl(this.prmUsrAplBarReg);
      }, 600);
    }
  
  }

  possible: any = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  public makeRandom(lengthOfCode: number) {
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += this.possible.charAt(Math.floor(Math.random() * this.possible.length));
    }
      return text;
  }
    
}