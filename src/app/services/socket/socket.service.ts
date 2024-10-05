import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, map, throwError } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  // io = io("http://190.85.54.78:3001/",{
  io = io("http://192.168.10.101:3001/",{
    withCredentials: true,
    autoConnect: true
  });
  // io = io('socket',{
  //   withCredentials: true,
  //   autoConnect: true
  // });

  public chats: any = [];
  public chatsForUser: any = [];
  public infoChatActivo: any = {};
  public active_users: any [] = [];
  private USUARIO_LOCAL: any = '';
  private socketId: any = '';
  private ROOMS:any [] = [];
  
  private subjectEmitMessage = new Subject<any>();
  private subjectActiveChat = new Subject<any>();
  private subjectUserOnline = new Subject<any>();
  private subjectEmitNotifications = new Subject<any>();

  constructor( private http:HttpClient ) {
    this.USUARIO_LOCAL = localStorage.getItem('usuario')?.toUpperCase();
    this.inicioSession();
    this.upDateUserSeccion();
    this.getJoinRoom();
    this.onReceiveMessage();
    this.onReceiveNotifications();
  }

  // Usuario que se conecta al Chat
  inicioSession() {
    this.io.emit('section_started', { 
      id: this.USUARIO_LOCAL,
      usuario: this.USUARIO_LOCAL,
      action: 'login'
    });
  }

  setAciveChat(data:any): void {
    this.subjectActiveChat.next(data);
  }

  getAciveChat(): Observable<any> {
    return this.subjectActiveChat.asObservable();
  }

  //Unir a sala de chat
  setJoinRoom(data:any) {
    this.io.emit('joinRoom', data);
  }
  getJoinRoom() {
    this.io.on('joinRoom', (data) => {
      if (data.USUARIO === this.USUARIO_LOCAL) {
        this.io.emit('joinRoom', {...data, TYPE: 'unirme'});
      }
    });
  }

  //Actualiza inicio de seccion por usuario
  upDateUserSeccion() {
    this.io.on('session_update', (data, socket) => {
      this.socketId = socket;
      this.active_users = data;
      this.subjectUserOnline.next(this.active_users);
    });
  }
  //Actualiza los usuarios online
  getUserOnline(): Observable<any> {
    return this.subjectUserOnline.asObservable();
  }

  //Envio de Mensajes
  sendMessage(data:any) {
    this.io.emit('privateSendMessage', {data:data, socketId: this.socketId});
  }

  //Recepción de mensajes
  onReceiveMessage(){
    this.io.on('privateReveiceMessage', (data) => {
      //valida la existencia de la sala, si no existe la crea.
      const pos = this.ROOMS.findIndex((d:any) => d.idRoom === data.data.USER_RECEIVES.ROOM);
      if( (pos === -1 && (data.data.USER_RECEIVES.USUARIO === this.USUARIO_LOCAL)) ||
          (pos !== -1)
        ) {
        this.ROOMS.push({idRoom: data.data.USER_RECEIVES.ROOM});
        //cambia tipo de mensaje segun usuario enviado y recibido
        data.data.USER_RECEIVES.MENSAJES.forEach((msj:any) => {
          if (msj.USUARIO_ENV === this.USUARIO_LOCAL)
            msj.TYPE = 'sent';
          else if (msj.USUARIO_REC === this.USUARIO_LOCAL)
            msj.TYPE = 'received';
          
        });
        const npos:any = this.chats.findIndex((d:any) => d.USUARIO === data.data.USER_SENDS[0].USUARIO);
        if(npos === -1) {
          this.chats.push({
            ...data.data.USER_SENDS[0],
            MENSAJES: data.data.USER_RECEIVES.MENSAJES,
            ROOM: data.data.USER_RECEIVES.ROOM
          });
        } else {
          this.chats[npos].MENSAJES = data.data.USER_RECEIVES.MENSAJES;
        }
        this.infoChatActivo = {
          ...data.data.USER_SENDS[0],
          MENSAJES: data.data.USER_RECEIVES.MENSAJES,
          ROOM: data.data.USER_RECEIVES.ROOM
        };
        const newData:any = {
          CHATS: this.chats,
          INFOCHATACTIVO: this.infoChatActivo
        }
        this.subjectEmitMessage.next(newData);
      }
    });
  }

  //Emitir los mensajes recibidos
  emitMessage(): Observable<any> {
    return this.subjectEmitMessage.asObservable();
  }

  //Envio de Notificaciones
  sendNotifications(data:any) {
    this.io.emit('EnvioNotificacion', data);
  }
  onReceiveNotifications() {
    this.io.on('recivoNotificacion', (data) => {
      if (data.USUARIO_REC === this.USUARIO_LOCAL || data.USUARIO_REC === 'TODOS') {
        this.subjectEmitNotifications.next(data);
      }
    });
  }
  emitnotificactions(): Observable<any> {
    return this.subjectEmitNotifications.asObservable();
  }


  //comunicación DB
  saveInfo(accion: any, prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    let url = '/api/CHAT/save';
    return this.http.post<any>
      (url, 
        body,
        { headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
      .pipe(
        map((vec: any) => {
        return vec;
      }),
      catchError((err) => {
        return throwError(() => new Error(err));
      })
    );
  };

  getHistorial(accion: any, prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    let url = '/api/CHAT/historial';
    return this.http.post<any>
      (url, 
        body,
        { headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
      .pipe(
        map((vec: any) => {
        return vec;
      }),
      catchError((err) => {
        return throwError(() => new Error(err));
      })
    );
  };

  statusChange(accion: any, prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    let url = '/api/CHAT/cambio_estado';
    return this.http.post<any>
      (url, 
        body,
        { headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
      .pipe(
        map((vec: any) => {
        return vec;
      }),
      catchError((err) => {
        return throwError(() => new Error(err));
      })
    );
  };

}
