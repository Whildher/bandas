import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DxButtonModule, DxListModule, DxLoadPanelModule, DxScrollViewComponent, DxScrollViewModule, DxSpeedDialActionModule, DxTextAreaModule } from 'devextreme-angular';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';
import { GeneralesService } from 'src/app/services/generales/generales.service';
import { ApiRestService } from 'src/app/services/usuarios/api-rest.service';
import { validatorRes } from 'src/app/shared/validator/validator.js';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-CHAT',
  templateUrl: './CHAT.component.html',
  styleUrls: ['./CHAT.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, DxListModule, DxButtonModule,
            DxTextAreaModule, DxScrollViewModule, MatButtonModule, DxLoadPanelModule,
            MatBadgeModule
          ]
})
export class CHATComponent {

  @ViewChild('scrollViewBodyChat', { static: false }) scrollViewBodyChat: DxScrollViewComponent;

  subscription: Subscription;
  subscriptionActiveChat: Subscription;
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

  matBadgeInbox:number = 0;

  constructor(
    private sData: ApiRestService,
    private _sgenerales: GeneralesService,
    public socket: SocketService
  ){
    this.subscriptionMensages = this.socket.emitMessage()
      .subscribe((prm) => {
        this.receiveMessage(prm);
    });

    this.subscriptionActiveChat = this.socket.getAciveChat()
      .subscribe((prm) => {
        this.onSelectionChangedUsuario(prm);
    });

    this.valoresObjetos = this.valoresObjetos.bind(this);
    this.sendMsj = this.sendMsj.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
    this.onFocusInChat = this.onFocusInChat.bind(this);
  }
  
  ngOnInit(): void {
    this.USUARIO_LOCAL = localStorage.getItem('usuario')?.toUpperCase();
    this.valoresObjetos('usuarios');
  };

  ngOnDestroy() {
    this.subscriptionMensages.unsubscribe();
    this.subscriptionActiveChat.unsubscribe();
  }
  
  onSelectionChangedUsuario(e:any) {
    this.infoChatActivo = {...e, MENSAJES: []};
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
      this.infoChatActivo.USUARIO_LOCAL = this.USUARIO_LOCAL;
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
        this.infoChatActivo.matBadgeInbox = 0;
        // this.valoresObjetos('historial');
        setTimeout(() => {
          this.scrollViewBodyChat.instance.scrollTo({ top: this.scrollViewBodyChat.instance.scrollHeight() });
        }, 400);
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
      setTimeout(() => {
        this.scrollViewBodyChat.instance.scrollTo({ top: this.scrollViewBodyChat.instance.scrollHeight() });
      }, 400);
    }
  }

  receiveMessage(data:any) {
    var contMsj:number = 0;
    const npos:any = this.chatsForUser.findIndex((d:any) => d.USUARIO === data.INFOCHATACTIVO.USUARIO);
    data.INFOCHATACTIVO.MENSAJES.forEach((msj:any) => {
      if (msj.ESTADO === 'Enviado')
        contMsj += 1;
    });
    data.INFOCHATACTIVO.matBadgeInbox = contMsj;
    if (npos === -1) {
      this.chatsForUser.push(data.INFOCHATACTIVO);
    } else {
      this.chatsForUser[npos].MENSAJES = data.INFOCHATACTIVO.MENSAJES;
      this.chatsForUser[npos].matBadgeInbox = data.INFOCHATACTIVO.matBadgeInbox;
    }
    if (this.activeChatUser && (this.infoChatActivo.USUARIO !== data.INFOCHATACTIVO.USUARIO)) {
      this.activeChatUser = false;
      this.infoChatActivo = {};
    } else if (this.activeChatUser && (this.infoChatActivo.USUARIO === data.INFOCHATACTIVO.USUARIO)) {
      this.activeChatUser = true;
      this.infoChatActivo.MENSAJES = this.chatsForUser[npos].MENSAJES;
      setTimeout(() => {
        this.scrollViewBodyChat.instance.scrollTo({ top: this.scrollViewBodyChat.instance.scrollHeight() });
        // var container_chat:any = document.getElementById('chat-activo');
        // var burbuja_chat:any = document.getElementById('btn-chat-activo');
        // container_chat.classList.add('chat-intermitente');
        // burbuja_chat.classList.add('chat-intermitente');
      }, 400);
    }
    this.mesajeText = '';
    // this.activeNewChat = false;
  }

  onFocusInChat(e:any) {
    // var container_chat:any = document.getElementById('chat-activo');
    // container_chat.classList.remove('chat-intermitente');
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
    this.infoChatActivo.matBadgeInbox = 0;

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
