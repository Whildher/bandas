import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { GeneralesService } from 'src/app/services/generales/generales.service';
import { SPasswordService } from 'src/app/views/password/-s-password.service';
import { clsBarraRegistro } from '../../regbarra/_clsBarraReg';
import { Router } from '@angular/router';
import { AngularResizeEventModule, ResizedEvent } from 'angular-resize-event';
import {MatBadgeModule} from '@angular/material/badge';
import { SbarraService } from '../../regbarra/_sbarra.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { RegbarraComponent } from '../../regbarra/regbarra.component';
import { CommonModule } from '@angular/common';
import { SocketService } from 'src/app/services/socket/socket.service';
import { ApiRestService } from 'src/app/services/usuarios/api-rest.service';
import Swal from 'sweetalert2';
import { validatorRes } from 'src/app/shared/validator/validator.js';
import { DxDateBoxModule, DxListComponent, DxListModule, DxLoadPanelModule, DxPopupModule, DxScrollViewComponent, DxSelectBoxModule } from 'devextreme-angular';
import { TabService } from '../../tabs/tab.service';
import { GlobalVariables } from 'src/app/shared/common/global-variables';
import { Tab } from '../../tabs/tab.model';
import { tabs } from 'src/app/shared/classes/tabs.class';
import { libtools } from 'src/app/shared/common/libtools';

@Component({
  selector: 'header-component',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [RegbarraComponent, AngularResizeEventModule, CommonModule, MatBadgeModule,
            DxDateBoxModule, DxListModule, DxPopupModule, DxSelectBoxModule,
            DxLoadPanelModule
          ],
  providers: [AngularResizeEventModule]
})
export class HeaderComponent implements OnInit {

  @ViewChild('scrollViewBodyChat', { static: false }) scrollViewBodyChat: DxScrollViewComponent;
  @ViewChild('listUsuarios', { static: false }) listUsuarios: DxListComponent;

  title = 'Dashboard';
  subscription: Subscription;
  subscriptionAplicaciones: Subscription;
  subscriptionNotifications: Subscription;
  subscriptionActiveChat: Subscription;
  subscriptionUserOnline: Subscription;
  prmUsrAplBarReg: clsBarraRegistro;
  activeIconPerfil: boolean = false;
  visibleBuscar: boolean = false;
  iconNameUser: any;
  matBadgeNotificaciones:number = 0;
  matBadgeInbox:number = 0;
  userName:any;
  
  DResponsables:any [] = [];
  DAplicaciones:any [] = [];
  Aplicaciones:any [] = [];
  notifications:any [] = [];
  selectAplicacion:any [] = [];
  USUARIO_LOCAL: any = '';
  
  ltool: any;
  DUsuarios: any [] = [];
  DUserOnline: any [] = [];
  chatsForUser: any [] = [];
  selectUsuario: any [] = [];
  loadingVisible: boolean = false;
  infoChatActivo: any = {};
  data_prev_mensaje: any = {};

  constructor( 
    private _sdatosPaswword: SPasswordService,
    private router: Router,
    private _sbarreg: SbarraService,
    public socket: SocketService,
    private sData: ApiRestService,
    private _sgenerales: GeneralesService,
    private tabService: TabService,
    private _sdatos: GeneralesService
  ) {
    this.subscription = this._sbarreg.getObsMenuReg()
    .subscribe((prmBarra) => {
      // Procesa acción...
      this.prmUsrAplBarReg = prmBarra;
    });

    this.subscriptionNotifications = this.socket.emitnotificactions()
    .subscribe((prm) => {
      var notificacion:any = prm;
      const res:any = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === notificacion.USUARIO_ENV);
      if (this.notifications.length > 0) {
        const item = this.notifications.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act});
        notificacion.ITEM = item.ITEM + 1;
      } else {
        notificacion.ITEM = 1;
      };
      notificacion.USUARIO_ENV = this.DResponsables[res];
      this.notifications.push(notificacion);
      this.matBadgeNotificaciones += 1;
    });

    this.subscriptionUserOnline = this.socket.getUserOnline()
      .subscribe((prm) => {
        this.DUserOnline = prm;
        this.configureUserOnline();
    });

    // Recibe de productos
    this.subscriptionAplicaciones = this._sdatos
      .getAplicaciones()
      .subscribe((apli:any) => {
        this.Aplicaciones = apli;
        const newArray:any = apli.filter((d:any) => d.TIPO === 'aplicacion')
        this.DAplicaciones = newArray;
    });
    
    this.ltool = new libtools(this._sbarreg, this.tabService);

  }
  
  ngOnInit(): void {
    this.displayUsuario();
    this.displayEmpresa();
    this.displayFotoUsuario();
    this.valoresObjetos('todos', '');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscriptionAplicaciones.unsubscribe();
    this.subscriptionNotifications.unsubscribe();
    this.subscriptionActiveChat.unsubscribe();
  }

  displayUsuario(){
    this.userName = localStorage.getItem('user_name');
    this.USUARIO_LOCAL = localStorage.getItem('usuario')?.toUpperCase();
    return this.userName;
  }

  displayEmpresa(){
    const empresa:any = localStorage.getItem('nombre empresa');
    return empresa;
  }

  displayFotoUsuario(){
    let foto:any = localStorage.getItem('foto_perfil_user');
    if ( foto === 'null' || foto === '') {
      foto = '';
      this.activeIconPerfil = true;
      this.createIconName();
    }
    return foto;
  }

  configureUserOnline() {
    this.DUserOnline.forEach((user:any) => {
      if (this.DUsuarios.length > 0) {
        const npos:any = this.DUsuarios.findIndex((d:any) => d.USUARIO === user.usuario);
        if(npos !== -1)
          this.DUsuarios[npos].ESTADO = 'ONLINE';
      }
    });
  }

  onResized(event: ResizedEvent, obj:string) {
    const width:number = event.newRect.width;
    const height:number = event.newRect.height;
    // console.log('width: '+width+' | height: '+height);
    if(obj === 'barra') {
      if(width >= 652) {
       //No oculta iconos 
       this._sbarreg.setOnResized(0);
      };
      if(width >= 590 && width < 652) {
        //se oculta el grupo de iconos  # 4
        this._sbarreg.setOnResized(4);
      };
      if(width >= 300 && width < 590) {
        //se oculta el grupo de iconos  # 3 y 4
        this._sbarreg.setOnResized(3);
      };
      if(width < 300) {
        //se oculta el grupo de iconos  # 2 al 4
        this._sbarreg.setOnResized(2);
      };
    };
    if (obj === 'header') {
      // 228 - 178
      const width:number = event.newRect.width;
      const icon_campana:any = document.getElementById('icon-bell-ol-header');
      const icon_inbox:any = document.getElementById('icon-inbox-ol-header');
      const icon_buscar:any = document.getElementById('icon-buscar-ol-header');
      const nombres_header:any = document.getElementById('nombres-header');
      if(width <= 89) {
        icon_inbox.style.display = 'none';
        icon_campana.style.display = 'none';
        icon_buscar.style.display = 'none';
        // nombres_header.style.display = 'none';
      };
      if(width >= 90 && width <= 119) {
        icon_inbox.style.display = 'none';
        icon_campana.style.display = 'none';
        icon_buscar.style.display = 'none';
        // nombres_header.style.display = '';
      };
      if(width >= 120 && width <= 159) {
        icon_inbox.style.display = 'none';
        icon_campana.style.display = 'none';
        icon_buscar.style.display = '';
        // nombres_header.style.display = '';
      };
      if(width >= 160 && width <= 199) {
        icon_inbox.style.display = 'none';
        icon_campana.style.display = '';
        icon_buscar.style.display = '';
        // nombres_header.style.display = '';
      };
      if(width >= 200) {
        icon_inbox.style.display = '';
        icon_campana.style.display = '';
        icon_buscar.style.display = '';
        // nombres_header.style.display = '';
      };
    }
  }

  openBuscar(e:any) {
    this.visibleBuscar = !this.visibleBuscar;
  }

  createIconName() {
    const npos: any = this.userName.indexOf(" ");
    const name = this.userName.charAt(0).toUpperCase();
    const lastName = this.userName.substring(npos + 1, this.userName.length + 1);
    const Lape = lastName.charAt(0).toUpperCase();
    const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
    this.iconNameUser = newName;
  }

  logout(){
    this.router.navigate(['']);
    this.activeIconPerfil = false;
    localStorage.clear();
  }

  changePassword() {
    const usuario:any = localStorage.getItem('usuario');
    const data:any = { CAMBIO_PASSWORD: true, USUARIO: usuario };
    this._sdatosPaswword.setPassword(data);
  }

  abrirNotificaciones(e:any) {
    this.matBadgeNotificaciones = 0;
  }

  onSelectionChangedUsuario(e:any) {
    this.socket.setAciveChat(e.addedItems[0]);
    this.selectUsuario = [];
    // this.infoChatActivo = {...e.addedItems[0], MENSAJES: []};
    // const npos:any = this.chatsForUser.findIndex((d:any) => d.USUARIO === this.infoChatActivo.USUARIO)
    // if(npos === -1) {
    //   this.chatsForUser.push({...this.infoChatActivo});
    // }
    // this.socket.chats = this.chatsForUser;
    
    // var nameRoom: string = '';
    // if (this.infoChatActivo.ROOM === '' || this.infoChatActivo.ROOM === undefined || this.infoChatActivo.ROOM === null) {
    //   nameRoom = this.USUARIO_LOCAL+'_to_'+this.infoChatActivo.USUARIO;
    //   this.infoChatActivo.ROOM = nameRoom;
    // }

    // this.socket.setJoinRoom({...this.infoChatActivo, TYPE: 'crear'});
    // this.valoresObjetos('historial', '');
  }

  // ****** Adiciona a la página de tareas la aplicacion seleccionada ******
  // Buscar en el arbol de aplicaciones si es una aplicacion
  // Abrir la aplicacion si no está abierta
  async abrirApl(item:any){
    // const prm = { USUARIO: this.USUARIO_LOCAL, APLICACION: item.APLICACION};
    // const apiRest = this.sData.getAplicacion('GET APLICACION', prm);
    // const res = await lastValueFrom(apiRest, {defaultValue: true});
    // const datos = JSON.parse(res.data);

    this.ltool.abrirApl(item, 'abrir aplicacion'); 

    // let aplicacion = item.APLICACION.ID_APLICACION;
    // let nom_aplicacion = item.APLICACION.NOMBRE;
    // item.NOMBRE_APLICACION = item.APLICACION.NOMBRE;
    // const listaTab = this.tabService.tabs.find(c => c.aplicacion === aplicacion);
    // const compo:any = tabs.find(c => c.aplicacion === aplicacion);
    // // Si no existe, no está abierta entonces agrega Tab
    // if (listaTab === undefined) {
    //   this.router.navigate(['home/principal'], {skipLocationChange: true});

    //   // Adicione a la lista de aplicaciones abiertas
    //   GlobalVariables.listaAplicaciones.unshift({ aplicacion: aplicacion, barra: undefined, statusEdicion: '' });

    //   // Crea pestaña contenedora de la aplicación
    //   this.tabService.addTab(
    //     new Tab(compo.component,
    //             item.APLICACION.NOMBRE,
    //             { parent: "PrincipalComponent", args: item.APLICACION.ID_APLICACION },
    //             aplicacion,
    //             item.APLICACION.IMAGEN_URL,
    //             item.APLICACION.TABLA_APLICACION,
    //             true)
    //   );
    // } else {
    //   const indexTab = this.tabService.tabs.findIndex(c => c.aplicacion === aplicacion);
    //   this.tabService.tabs[indexTab].title = nom_aplicacion;
    //   this.tabService.activaTab(indexTab, item.ID_APLICACION);
    // }

    item.FECHA_UPDATE = new Date();
    const data1 = ({
      TIPO: 'NOTIFICACION',
      DATOS: item
    });
    this.socket.statusChange('CAMBIO ESTADO', data1).subscribe((data) => {
      const res = JSON.parse(data.data);
      if (res[0].ErrMensaje !== '') {
        this.showModal(res[0].ErrMensaje, 'Error al guardar cambio de estado de la notificación.');
      } else {
        const npos:any = this.notifications.findIndex((d:any) => d.ITEM === item.ITEM);
        if (npos !== -1)
          this.notifications[npos].ESTADO = res[0].ESTADO;
      }
    });

  }

  onSelectBusqueda(e:any) {
    const data:any = e.itemData;
    // Verifica si es una aplicacion multiple con uso de aplicacion padre
    var subm:any = this.Aplicaciones.filter((d:any) => d.ID_APLICACION === data.ID_APLICACION);
    let aplicacion = data.ID_APLICACION;
    let nom_aplicacion = data.NOMBRE;
    if (subm.length !== 0) {
      if (subm[0].PARAMETROS !== '') {
        aplicacion = subm[0].PARAMETROS;
        nom_aplicacion = subm[0].NOMBRE;
      }
    }

    const apli:any = {
      component: '',
      title: nom_aplicacion,
      tabData: '',
      ID_APLICACION: aplicacion,
      icon: data.icon,
      TABLA: data.TABLA_APLICACION,
      active: false
    }
    this.ltool.abrirApl(apli, 'abrir aplicacion');
    this.selectAplicacion = [];
  }

  valoresObjetos(obj: string, accion:string) {
    // if (obj === 'responsables' || obj === 'todos'){
    //   const prm:any = {};
    //   this.sData.getResponsables('RESPONSABLES', prm).subscribe((data: any)=> {
    //     const res = validatorRes(data);
    //     if ( (data.token !== undefined) ){
    //       const refreshToken = data.token;
    //       localStorage.setItem("token", refreshToken);
    //     }
    //     for (let i = 0; i < res.length; i++) {
    //       const element = res[i];
    //       element.ITEM = i;
    //       if(element.FOTO === '' || element.FOTO === undefined || element.FOTO === null) {
    //         const npos: any = element.NOMBRE.indexOf(" ");
    //         const name = element.NOMBRE.charAt(0).toUpperCase();
    //         const lastName = element.NOMBRE.substring(npos + 1, element.NOMBRE.length + 1);
    //         const Lape = lastName.charAt(0).toUpperCase();
    //         const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
    //         element.iconNameUser = newName;
    //       }
    //     };

    //     this.DResponsables = res;

    //     // Baja las imagenes
    //     // this._sgenerales.bajar_imagen('bajar imagenes',
    //     //       { RESPONSABLES: [{}], 
    //     //         params: { comprimir: true, tamX: 210, tamY: 280 } },'spActividades')
    //     // .subscribe({ 
    //     //   next: (varch: any)=> {
    //     //     // Adiciona el path en el vector de la galería
    //     //     if (varch[0].ErrMensaje === '') {
    //     //       res.forEach((eleres:any) => {
    //     //         const ix = varch.findIndex((r:any) => r.etiqueta === eleres.ID_RESPONSABLE);
    //     //         if (ix !== -1) {
    //     //           eleres.FOTO = varch[ix].path;
    //     //           this.DResponsables.forEach((responsable:any) => {
    //     //             if (responsable.ID_RESPONSABLE === eleres.ID_RESPONSABLE) {
    //     //               responsable.FOTO = varch[ix].path;
    //     //             }
    //     //           });
    //     //         }
    //     //       });
    //     //       // this.valoresObjetos('notificaciones', '');
    //     //     }
    //     //   }, error: (err => {
    //     //     this.showModal('Error procesando imagenes: '+err.message, 'error');
    //     //   })
    //     // });

    //   });
    // };
    // if (obj === 'notificaciones' || obj === 'todos'){
    //   const prm:any = {USUARIO: this.USUARIO_LOCAL};
    //   this.socket.getHistorial('HISTORICO NOTIFICACION', prm).subscribe((data: any)=> {
    //     const res = validatorRes(data);
    //     if ( (data.token !== undefined) ){
    //       const refreshToken = data.token;
    //       localStorage.setItem("token", refreshToken);
    //     }
    //     setTimeout(() => {
    //       const newArray = res;
    //       const mensaje = newArray[0].ErrMensaje;
    //       if (mensaje !== '') {
    //         this.notifications = [];
    //       } else {
    //         newArray.forEach((notificacion:any) => {
    //           const npos:any = this.DResponsables.findIndex((d:any) => d.ID_RESPONSABLE === notificacion.USUARIO_ENV);
    //           notificacion.USUARIO_ENV = this.DResponsables[npos];
    //           if (notificacion.ESTADO === 'Enviado')
    //             this.matBadgeNotificaciones += this.matBadgeNotificaciones;

    //           this.sData.getAplicacion('GET APLICACION', {APLICACION: notificacion.APLICACION}).subscribe({
    //             next: (varch: any)=> {
    //               const datos = JSON.parse(varch.data);
    //               if (datos[0].ErrMensaje === '') {
    //                 notificacion.APLICACION = datos[0];
    //               }

    //               const dataPrev:any[] = this.notifications.filter((d:any) => d.APLICACION === notificacion.APLICACION.ID_APLICACION);
    //               if (dataPrev.length <= 0) {
    //                 const npos:any = this.notifications.findIndex((d:any) => d.ITEM === notificacion.ITEM);
    //                 if (npos !== -1)
    //                   this.notifications[npos] = notificacion;
    //                 else
    //                   this.notifications.push({...notificacion, GRUPO: false});
    //               } else {
    //                 const newD:any = {
    //                   APLICACION: notificacion.APLICACION.ID_APLICACION,
    //                   NOTIFICACIONES: dataPrev,
    //                   GRUPO: true,
    //                   FECHA: notificacion.FECHA_UPDATE
    //                 }
    //                 this.notifications.push(newD);
    //               }

    //               // const npos:any = this.notifications.findIndex((d:any) => d.ITEM === notificacion.ITEM);
    //               // if (npos !== -1)
    //               //   this.notifications[npos] = notificacion;
    //               // else
    //               //   this.notifications.push(notificacion);
    //             }, error: (err => {
    //               this.showModal(err.message, 'error');
    //             })
    //           });
    //         });
    //       };
    //     }, 600);
    //   });
    // };
    if (obj === 'usuarios' || obj === 'todos'){
      const prm:any = {};
      this.sData.getUsuarios('USUARIOS', prm).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token !== undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        const newArray = res;
        const mensaje = newArray[0].ErrMensaje;
        if (mensaje != '') {
          this.showModal(mensaje, 'Error');
        } else {
          // Baja las imagenes
          // this._sgenerales.bajar_imagen('bajar imagenes', { RESPONSABLES: [{}], 
          //   params: { comprimir: true, tamX: 300, tamY: 400 } },'spActividades')
          //   .subscribe({
          //     next: (varch: any)=> {
          //       // Adiciona el path en el vector de la galería
          //       if (varch[0].ErrMensaje === '') {
          //         newArray.forEach((eleres:any) => {
          //           const ix = varch.findIndex((r:any) => r.etiqueta === eleres.USUARIO);
          //           if (ix !== -1) {
          //             eleres.FOTO = varch[ix].path;
          //             newArray.forEach((usuario:any) => {
          //               if (usuario.USUARIO === eleres.USUARIO) {
          //                 usuario.FOTO = varch[ix].path;
          //               }
          //             });
          //             eleres.ESTADO = 'OFFLINE';
          //           } else {
          //             const npos: any = eleres.NOMBRE.indexOf(" ");
          //             const name = eleres.NOMBRE.charAt(0).toUpperCase();
          //             const lastName = eleres.NOMBRE.substring(npos + 1, eleres.NOMBRE.length + 1);
          //             const Lape = lastName.charAt(0).toUpperCase();
          //             const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
          //             eleres.iconNameUser = newName;
          //             eleres.ESTADO = 'OFFLINE';
          //           }
          //         });
          //       } else {
          //         newArray.forEach((eleres:any) => {
          //           const npos: any = eleres.NOMBRE.indexOf(" ");
          //           const name = eleres.NOMBRE.charAt(0).toUpperCase();
          //           const lastName = eleres.NOMBRE.substring(npos + 1, eleres.NOMBRE.length + 1);
          //           const Lape = lastName.charAt(0).toUpperCase();
          //           const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
          //           eleres.iconNameUser = newName;
          //           eleres.ESTADO = 'OFFLINE';
          //         });
          //       }
          //       this.DUsuarios = newArray;
          //       this.configureUserOnline();
          //     }, error: (err => {
          //       this.showModal('Error procesando imagenes: '+err.message, 'error');
          //     })
          //   });
        };
      });
    };
    if (obj === 'historial'){
      this.loadingVisible = true;
      const prm:any = {USUARIO_ENV: this.USUARIO_LOCAL, USUARIO_REC: this.infoChatActivo.USUARIO};
      this.socket.getHistorial('HISTORICO CHAT', prm).subscribe((data: any)=> {
        this.loadingVisible = false;
        const res = validatorRes(data);
        if ( (data.token !== undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        const newArray = res;
        const mensaje = newArray[0].ErrMensaje;
        if (mensaje !== '') {
          // this.showModal(mensaje, 'Error');
          this.infoChatActivo.MENSAJES = [];
        } else {
          newArray.forEach((msj:any) => {
            if(msj.USUARIO_REC === this.USUARIO_LOCAL)
              msj.TYPE = 'received';
            else
              msj.TYPE = 'sent';
          });
          this.data_prev_mensaje = JSON.parse(JSON.stringify(newArray));
          this.infoChatActivo.MENSAJES = newArray;
          setTimeout(() => {
            this.scrollViewBodyChat.instance.scrollTo({ top: this.scrollViewBodyChat.instance.scrollHeight() });
          }, 400);
        };
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


}