import { CommonModule } from '@angular/common';
import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { ApiRestService } from 'src/app/services/usuarios/api-rest.service';
import { PasswordComponent } from 'src/app/views/password/password.component';
import Swal from 'sweetalert2';
import { HeaderComponent } from './header/header.component';
import { LeftvarComponent } from './leftvar/leftvar.component';
import { DxButtonModule, DxListModule, DxLoadPanelModule, DxScrollViewComponent, DxScrollViewModule, DxSpeedDialActionModule, DxTextAreaModule } from 'devextreme-angular';
import { validatorRes } from 'src/app/shared/validator/validator.js';
import { GeneralesService } from 'src/app/services/generales/generales.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { MatButtonModule } from '@angular/material/button';

import config from 'devextreme/core/config';
import { CHATComponent } from 'src/app/shared/CHAT/CHAT.component';
config({
  floatingActionButtonConfig: {
    icon: 'comment',
    position: {
      my: 'right bottom',
      at: 'right bottom',
      of: '#container-body',
      offset: '-16 -16'
    }
  }
});


@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss',
              '../../../../node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
              '../../../assets/xtein.scss'],
  standalone: true,
  imports: [CommonModule, LeftvarComponent, HeaderComponent, PasswordComponent,
            RouterOutlet, DxSpeedDialActionModule, DxListModule, DxButtonModule,
            DxTextAreaModule, DxScrollViewModule, MatButtonModule, DxLoadPanelModule,
            CHATComponent
          ]
})
export class DefaultLayoutComponent implements OnInit {

  @ViewChild('scrollViewBodyChat', { static: false }) scrollViewBodyChat: DxScrollViewComponent;

  TIEMPO_SESION: any;
  resizeObservable: Observable<Event>;
  collapsed: boolean;
  leftvarActive: any;
  bodyActive: any;
  subscription: Subscription;
  subscriptionMensages: Subscription;

  DUsuarios: any [] = [];
  chatsForUser: any [] = [];
  infoChatActivo: any = {};
  data_prev_mensaje: any = {};
  activeNewChat: boolean = false;
  activeChatUser: boolean = false;
  activeSendBtn: boolean = false;
  loadingVisible: boolean = false;
  mesajeText: string = '';
  USUARIO_LOCAL: any = '';

  constructor(
    private bnIdle: BnNgIdleService,
    private router: Router,
    private sData: ApiRestService,
    private _sgenerales: GeneralesService,
    public socket: SocketService
  ){
    this.subscription = this.sData.getObs_collapsed()
      .subscribe((prm) => {
        this.collapsed = prm;
    });

    const timeUser: any = localStorage.getItem('TIEMPO_SESION');
    this.TIEMPO_SESION = timeUser;
    this.bnIdle.startWatching(this.TIEMPO_SESION).subscribe((res) => {
      if(res) {
        Swal.fire({
					title: '',
					text: 'Tiempo de espera agotado, desea salir o continuar.?',
					iconHtml: "<i class='icon-alert-ol'></i>",
					showCancelButton: true,
					confirmButtonColor: '#DF3E3E',
					cancelButtonColor: '#438ef1',
					cancelButtonText: 'Continuar',
					confirmButtonText: 'Salir'
				  }).then((result) => {
					if (result.isConfirmed) {
            this.logout();
            this.router.navigate(['/']);
					}
				});
      }
    });

    // this.subscriptionMensages = this.socket.emitMessage()
    //   .subscribe((prm) => {
    //     this.receiveMessage(prm);
    // });

    this.valoresObjetos = this.valoresObjetos.bind(this);
    this.sendMsj = this.sendMsj.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
    this.onFocusInChat = this.onFocusInChat.bind(this);
  }

  ngOnInit(): void {
    const screen:number = window.innerWidth;
    if(screen <= 768)
      this.collapsed = true;
    else
      this.collapsed = false;

    this.sData.collapsed = this.collapsed;
    this.valoresObjetos('usuarios');
    this.USUARIO_LOCAL = localStorage.getItem('usuario')?.toUpperCase();
  };

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  drawerToggle(): void {
    this.collapsed = !this.collapsed;
    this.sData.collapsed = this.collapsed;
    this.sData.setObs_collapsed(this.collapsed);
  }

  onResized(event:any) {
    const screen:number = event.target.innerWidth;
    if(screen <= 768)
      this.collapsed = true;
    else
      this.collapsed = false;

    this.sData.collapsed = this.collapsed;
  }

  onWindowScroll($event:Event) {
    var container_header:any = document.getElementById('container-header');
    var header:any = document.getElementById('header-aplicacion');
    const constainer = document.getElementById('container-body') as HTMLElement;
    const router_container = document.getElementById('router-container') as HTMLElement;
    const container_tabs = document.querySelector('mat-tab-header') as HTMLElement;
    container_header.classList.toggle("container-header-toggle", constainer.scrollTop > 0);
    router_container.classList.toggle("container-router-compensacion", constainer.scrollTop > 0);
    container_tabs.classList.toggle("fixed-container-header", constainer.scrollTop > 0);
    header.classList.toggle("header-toggle", constainer.scrollTop > 0);
  }

  logout(){
    localStorage.clear();
  }

  // Relocaliza la barra de herramientas
  dimensBarra() {
    var barra = document.getElementsByClassName('cls-reg-barra') as HTMLCollectionOf<HTMLElement>;
    barra[0].style.setProperty('margin-left','5vw !important;');
    barra[0].style.backgroundColor = 'yellow !important';
  }

  onSelectionChangedUsuario(e:any) {
    this.infoChatActivo = {...e.addedItems[0], MENSAJES: []};
    this.activeNewChat = false;
    const npos:any = this.chatsForUser.findIndex((d:any) => d.USUARIO === this.infoChatActivo.USUARIO)
    if(npos === -1) {
      this.chatsForUser.push({...this.infoChatActivo});
    }
    this.activeChatUser = true;
    this.socket.chats = this.chatsForUser;
    
    var nameRoom: string = '';
    if (this.infoChatActivo.ROOM === '' || this.infoChatActivo.ROOM === undefined || this.infoChatActivo.ROOM === null) {
      nameRoom = this.USUARIO_LOCAL+'_to_'+this.infoChatActivo.USUARIO;
      this.infoChatActivo.ROOM = nameRoom;
    }

    this.socket.setJoinRoom({...this.infoChatActivo, TYPE: 'crear'});
    this.valoresObjetos('historial');
  }

  showChats(e:any, tipo: string, datos: any) {
    switch (tipo) {
      case 'nuevo_chat':
        this.activeNewChat = !this.activeNewChat;
        this.activeChatUser = false;
        // this.valoresObjetos('historial');
        break;

      case 'chat_usuario':
        this.activeNewChat = false;
        this.activeChatUser = true;
        this.infoChatActivo = datos;
        // this.valoresObjetos('historial');
        break;

      case 'minimizar':
        this.activeNewChat = false;
        this.activeChatUser = false;
        break;

      case 'cerrar':
        this.activeNewChat = false;
        this.activeChatUser = false;
        const npos:any = this.chatsForUser.findIndex((d:any) => d.USUARIO === this.infoChatActivo.USUARIO)
        if(npos !== -1) {
          this.chatsForUser.splice(npos,1);
        }
        this.socket.chats = this.chatsForUser;
        break;

      default:
        break;
    }
  }

  onValueChangedMessage(e:any) {
    const mensaje = e.value;
    // Verificar si el mensaje consiste solo en espacios en blanco
    if (mensaje.trim() === '') {
      // Deshabilitar el botón de envío
      this.activeSendBtn = false;
    } else {
      // Habilitar el botón de envío
      this.activeSendBtn = true;
    }
  }

  sendMsj() {
    if(this.activeSendBtn) {
      this.infoChatActivo.MENSAJES.push({
        FECHA: new Date(),
        USUARIO_ENV: this.USUARIO_LOCAL,
        USUARIO_REC: this.infoChatActivo.USUARIO,
        DESCRIPCION: this.mesajeText,
        ESTADO: 'Enviado',
        APLICACION: 'CHAT',
        FECHA_UPDATE: new Date(),
        TYPE: 'sent'
      });
  
      this.mesajeText = '';
      //guardado de mensaje en DB
      const prm = ({
        TIPO: 'MENSAJE',
        DATOS: this.infoChatActivo.MENSAJES[this.infoChatActivo.MENSAJES.length - 1]
      });
      // API guardado de datos
      this.socket.saveInfo('save', prm).subscribe((data) => {
        const res = JSON.parse(data.data);
        if (res[0].ErrMensaje !== '') {
          this.showModal(res[0].ErrMensaje, 'Error al guardar el mensaje');
        } else {
          this.infoChatActivo.MENSAJES[this.infoChatActivo.MENSAJES.length - 1].ITEM = res[0].ITEM;
          const userSend:any = this.DUsuarios.filter((d:any) => d.USUARIO === this.USUARIO_LOCAL);
          let mensajeInfo = {
            USER_SENDS: userSend,
            USER_RECEIVES: this.infoChatActivo
          }
          //Envio de msj a usuario
          this.socket.sendMessage(mensajeInfo);
        }
      });
      this.data_prev_mensaje = JSON.parse(JSON.stringify(this.infoChatActivo.MENSAJES));
      this.scrollViewBodyChat.instance.scrollTo({ top: this.scrollViewBodyChat.instance.scrollHeight() });
    }
  }

  receiveMessage(data:any) {
    const npos:any = this.chatsForUser.findIndex((d:any) => d.USUARIO === data.INFOCHATACTIVO.USUARIO);
    // if (this.chatsForUser.length > 0) {
		// 	const item = this.chatsForUser.reduce((ant:any, act:any)=>{return (ant.ITEM > act.ITEM) ? ant : act}) 
		// 	data.INFOCHATACTIVO.ITEM = item.ITEM + 1;
		// } else {
		// 	data.INFOCHATACTIVO.ITEM = 2;
		// }
    if(npos === -1) {
      this.chatsForUser.push(data.INFOCHATACTIVO);
    } else {
      this.chatsForUser[npos].MENSAJES = data.INFOCHATACTIVO.MENSAJES;
    }
    this.infoChatActivo = data.INFOCHATACTIVO;
    this.mesajeText = '';
    this.activeChatUser = true;
    this.activeNewChat = false;
    setTimeout(() => {
      this.scrollViewBodyChat.instance.scrollTo({ top: this.scrollViewBodyChat.instance.scrollHeight() });
      var container_chat:any = document.getElementById('chat-activo');
      container_chat.classList.add('chat-intermitente');
    }, 400);
    
  }

  onFocusInChat(e:any) {
    var container_chat:any = document.getElementById('chat-activo');
    container_chat.classList.remove('chat-intermitente');
    document.getElementById('text_mensaje')?.focus();
    
    //cambio de estado de mensaje en DB

    // Compara los arreglos y obtén los JSON que no están en data_prev
    if(this.data_prev_mensaje.length > 0) {
      const newMsj = this.infoChatActivo.MENSAJES.filter((obj:any) => {
        // Compara cada objeto en this.infoChatActivo.MENSAJES con data_prev
        return !this.data_prev_mensaje.some((prevObj:any) => {
          // Compara propiedades clave (USUARIO_ENV, USUARIO_REC, DESCRIPCION)
          return (
            obj.USUARIO_ENV === prevObj.USUARIO_ENV &&
            obj.USUARIO_REC === prevObj.USUARIO_REC &&
            obj.DESCRIPCION === prevObj.DESCRIPCION
          );
        });
      });
      for (let i = 0; i < newMsj.length; i++) {
        if ( newMsj[i].TYPE === 'received') {
          newMsj[i].FECHA_UPDATE = new Date();
          const prm = ({
            TIPO: 'MENSAJE',
            DATOS: newMsj[i]
          });
          this.socket.statusChange('CAMBIO ESTADO', prm).subscribe((data) => {
            const res = JSON.parse(data.data);
            if (res[0].ErrMensaje !== '') {
              this.showModal(res[0].ErrMensaje, 'Error al guardar cambio de estado del mensaje.');
            } else {
              const npos:any = this.infoChatActivo.MENSAJES.findIndex((d:any) => d.ITEM === newMsj[i].ITEM);
              if (npos !== -1)
              this.infoChatActivo.MENSAJES[npos].ESTADO = res[0].ESTADO;
              this.data_prev_mensaje = JSON.parse(JSON.stringify(this.infoChatActivo.MENSAJES));
            }
          });
        }
      }
    } else {
      for (let i = 0; i < this.infoChatActivo.MENSAJES.length; i++) {
        if ( this.infoChatActivo.MENSAJES[i].TYPE === 'received' && this.infoChatActivo.MENSAJES[i].ESTADO === 'Enviado') {
          this.infoChatActivo.MENSAJES[i].FECHA_UPDATE = new Date();
          const prm = ({
            TIPO: 'MENSAJE',
            DATOS: this.infoChatActivo.MENSAJES[i]
          });
          this.socket.statusChange('CAMBIO ESTADO', prm).subscribe((data) => {
            const res = JSON.parse(data.data);
            if (res[0].ErrMensaje !== '') {
              this.showModal(res[0].ErrMensaje, 'Error al guardar cambio de estado del mensaje.');
            } else {
              const npos:any = this.infoChatActivo.MENSAJES.findIndex((d:any) => d.ITEM === this.infoChatActivo.MENSAJES[i].ITEM);
              if (npos !== -1) {
                this.infoChatActivo.MENSAJES[npos].ESTADO = res[0].ESTADO;
                this.data_prev_mensaje = JSON.parse(JSON.stringify(this.infoChatActivo.MENSAJES));
              }
            }
          });
        }
      }
    }
  }

  valoresObjetos(obj:string) {
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
          this._sgenerales.bajar_imagen('bajar imagenes', { RESPONSABLES: [{}], 
            params: { comprimir: true, tamX: 300, tamY: 400 } },'spActividades')
            .subscribe({
              next: (varch: any)=> {
                // Adiciona el path en el vector de la galería
                if (varch[0].ErrMensaje === '') {
                  newArray.forEach((eleres:any) => {
                    const ix = varch.findIndex((r:any) => r.etiqueta === eleres.USUARIO);
                    if (ix !== -1) {
                      eleres.FOTO = varch[ix].path;
                      newArray.forEach((usuario:any) => {
                        if (usuario.USUARIO === eleres.USUARIO) {
                          usuario.FOTO = varch[ix].path;
                        }
                      });
                    } else {
                      const npos: any = eleres.NOMBRE.indexOf(" ");
                      const name = eleres.NOMBRE.charAt(0).toUpperCase();
                      const lastName = eleres.NOMBRE.substring(npos + 1, eleres.NOMBRE.length + 1);
                      const Lape = lastName.charAt(0).toUpperCase();
                      const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
                      eleres.iconNameUser = newName;
                    }
                  });
                } else {
                  newArray.forEach((eleres:any) => {
                    const npos: any = eleres.NOMBRE.indexOf(" ");
                    const name = eleres.NOMBRE.charAt(0).toUpperCase();
                    const lastName = eleres.NOMBRE.substring(npos + 1, eleres.NOMBRE.length + 1);
                    const Lape = lastName.charAt(0).toUpperCase();
                    const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
                    eleres.iconNameUser = newName;
                  });
                }
                this.DUsuarios = newArray;
              }, error: (err => {
                this.showModal('Error procesando imagenes: '+err.message, 'error');
              })
            });
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
