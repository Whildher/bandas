import { Component, OnInit } from '@angular/core';
import { DxButtonModule, DxDateBoxModule, DxDropDownButtonModule, DxFileUploaderModule, DxLoadPanelModule, DxPopupModule, DxScrollViewComponent, DxScrollViewModule, DxSelectBoxModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidatorModule, getElement } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { Subscription } from 'rxjs';
import { clsGES_INFO } from './clsGES_INFO.class';
import { validatorRes } from 'src/app/shared/validator/validator';
import notify from 'devextreme/ui/notify';
import { CommonModule } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import { TimelineModule } from "primeng/timeline";
import { CardModule } from "primeng/card";
import Swal from 'sweetalert2';
import { GES00Service } from 'src/app/shared/Tareas/Service/GES00.service';
import { showToast } from '../../../shared/toast/toastComponent.js';
import { RouterLink } from '@angular/router';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'GES_INFO',
  templateUrl: './GES_INFO.component.html',
  styleUrls: ['./GES_INFO.component.scss'],
  standalone: true,
  imports: [CommonModule, DxPopupModule, DxTagBoxModule, DxDateBoxModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule,
            DxButtonModule, MatDividerModule, TimelineModule, CardModule, DxLoadPanelModule, DxToolbarModule, DxValidatorModule,
            DxScrollViewModule, DxDropDownButtonModule, DxFileUploaderModule, RouterLink
          ]
})
export class GES_INFOComponent implements OnInit {

  subscription: Subscription;

  container: any;
  readOnly: boolean = false;
  visibleGesproInfo: boolean = false;
  loadingVisible: boolean = false;
  indAsoArchivo: boolean = false;
  mostrarSubirArchivos: boolean = false;
  tituloGesproInfo: string;
  mesajeText: string = '';
  base64DataFile: any;
  archivoDoc: any;
  indexOff: number = 0;
  DTimeline: any[];
  DLEstados: any = [];

  USUARIO_LOCAL: any = '';
  data_prev: any = '';
  new_data: clsGES_INFO;
  listEstados: any = ['Sin iniciar', 'En proceso', 'En pausa', 'Finalizado'];
  listPrioridad: any = ['Inmediato', 'Alta', 'Media', 'Baja'];
  itemsFiltro: any [] = [
    { value: 'Todo', name: 'Todo' },
    { value: 'Historico', name: 'Historico' },
    { value: 'Novedades', name: 'Novedades' }
  ];
  selectFiltro: string = 'Novedades';
  eventos: any[];
  valueFile: any[] = [];
  DResponsables: any = [];
  Darchivos: any = [];
  conCambios: number = 0;

  constructor(
    private _sdatos: GES00Service,
    public socket: SocketService
  ) {

    this.container = document.getElementById('container-body');

    this.subscription = this._sdatos
    .getObsGesproInfo().subscribe((data) => {
      this.new_data = JSON.parse(JSON.stringify(data.DATA));
      this.data_prev = JSON.parse(JSON.stringify(data.DATA));
      this.tituloGesproInfo = data.TITULO;
      this.visibleGesproInfo = data.VISIBLE;
      this.DResponsables = data.RESPONSABLES;
      // if(this.new_data.COLABORADORES.findIndex((d:any) => d.ID_RESPONSABLE === this.USUARIO_LOCAL) !== -1) {
      //   this.readOnly = true;
      // } else {
      //   this.readOnly = false;
      // }
      this.readOnly = data.readOnly;
      this.valoresObjetos('responsables', this.new_data.CLASE);
      this.valoresObjetos('timeline', '');
    });

    this.onSelectionChangedFiltro = this.onSelectionChangedFiltro.bind(this);
    this.guardarComentarios = this.guardarComentarios.bind(this);
  }

  ngOnInit(): void {
    this.archivoDoc = '';
    this.USUARIO_LOCAL = localStorage.getItem('usuario')?.toUpperCase();
    this.valoresObjetos('todos', '');
  }

  onValueChangedNombre(e:any) {
    this.new_data.NOMBRE = e.value;
    this.conCambios++;
  }

  onInitializedFromResponsables(e:any, data:any) {
    for (let i = 0; i < data.length; i++) {
      const npos: any = data[i].NOMBRE.indexOf(" ");
      const name = data[i].NOMBRE.charAt(0).toUpperCase();
      const lastName = data[i].NOMBRE.substring(npos + 1, data[i].NOMBRE.length + 1);
      const Lape = lastName.charAt(0).toUpperCase();
      const newName: string = name.charAt(0).toUpperCase() + Lape.charAt(0).toUpperCase();
      data[i].iconNameUser = newName;
    }
  }

  onValueChangedFechaInicial(e:any) {
    this.new_data.FECHA_INICIO = e.value;
    this.conCambios++;
  }

  onValueChangedFechaFinal(e: any) {
    this.new_data.FECHA_FIN = e.value;
    this.conCambios++;
  }
  
  onValueRESPONSABLE(e:any) {
    this.new_data.RESPONSABLES = e.value;
    this.conCambios++;
  }

  onSelectionPrioridad(e:any) {
    if(e.value !== '') {
      this.new_data.PRIORIDAD = e.value;
    }
    this.conCambios++;
  }

  onSeleccEstado(e:any) {
    if(e.value !== '') {
      this.new_data.ESTADO = e.value;
    }
    this.conCambios++;
  }

  onValueChangedDescripcion(e:any) {
    this.conCambios++;
  }

  onSelectionChangedFiltro(e:any) {
    this.selectFiltro = e.item.value;
    switch (this.selectFiltro) {
      case 'Todo':
        this.DTimeline = this.eventos;
        break;

      case 'Novedades':
        this.DTimeline = this.eventos.filter((d:any) => d.TIPO === 'MANUAL');
        break;

      case 'Historico':
        this.DTimeline = this.eventos.filter((d:any) => d.TIPO === 'AUTOMATICO');
        break;
    
      default:
        this.DTimeline = this.eventos;
        break;
    }
  };

  aceptarBottom(e:any) {
    if(this.conCambios > 0) {
      this.visibleGesproInfo = false;
      this.conCambios = 0;
      this._sdatos.setObsActividades({ accion: 'update', DATA_PREV: this.data_prev, NEW_DATA: this.new_data, CLASE: this.new_data.CLASE });
      // if(this.validatingData()) {
      // } else {
      //   showToast('Faltan datos, por favot complete los datos.', 'error');
      // }
    } else {
      showToast('No hay cambios por guardar.', 'warning');
    }
  }

  showUploadFile(e:any) {
    this.mostrarSubirArchivos = !this.mostrarSubirArchivos;
  }

  onBeforeSendArchivos(e:any) {
    if(e.file !== undefined && e.file !== null && e.file !== '') {
      var prm:any;
      prm = {USUARIO: this.USUARIO_LOCAL, ARCHIVO: e.file, ID_ACTIVIDAD: this.new_data.ID_ACTIVIDAD};
      this._sdatos.saveArchivos('SAVE ARCHIVO', prm).subscribe((data: any) => {
        const res = validatorRes(data);
        const mensaje = res[0].ErrMensaje;
        if (mensaje !== '') {
          showToast(mensaje, 'error');
        } else {
          this.mostrarSubirArchivos = !this.mostrarSubirArchivos;
          this.valueFile = [];
          this.valoresObjetos('timeline', '');
          showToast('Archivo enviado.', 'success');
        };
      },
        ((err:any) => {
          this._sdatos.loadingVisible = false;
          this.showModal(err.message);
        })
      );
    }
  }

  guardarComentarios() {
    if(this.mesajeText.length > 0 || this.Darchivos.length > 0) {
      const prm:any = { 
        USUARIO: this.USUARIO_LOCAL,
        DESCRIPCION: this.mesajeText,
        ID_ACTIVIDAD: this.new_data.ID_ACTIVIDAD,
        ARCHIVOS: this.Darchivos
      };
      this._sdatos.saveComentarios('SAVE COMENTARIO', prm).subscribe((data: any) => {
        const res = validatorRes(data);
        const mensaje = res[0].ErrMensaje;
        if (mensaje !== '') {
          showToast(mensaje, 'error');
        } else {
          this.mesajeText = '';
          this.valoresObjetos('timeline', '');
          showToast('Comentario agregado.', 'success');

          //Envio de Notificaciones
          //notificacion al Responsable
          const usr_env:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === prm.USUARIO);
          const usr_rec:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === prm.ACTIVIDAD.RESPONSABLES.ID_RESPONSABLE);
          var msj:any = '';
          if (this.new_data.CLASE === 'RESPONSABILIDADES' || this.new_data.CLASE === 'TAREAS') {
            if (prm.DESCRIPCION !== '')
              msj = usr_env[0].NOMBRE+', agrego comentarios a una TAREA';
            else if (prm.ARCHIVOS.length > 0)
              msj = usr_env[0].NOMBRE+', agrego archivos a una TAREA';
          };
          if (this.new_data.CLASE === 'EVENTO') {
            if (prm.DESCRIPCION !== '')
              msj = usr_env[0].NOMBRE+', agrego comentarios a un EVENTO';
            else if (prm.ARCHIVOS.length > 0)
              msj = usr_env[0].NOMBRE+', agrego archivos a un EVENTO';
          }

          const dataNotificacion:any = {
            APLICACION: 'GES-001',
            FECHA: new Date(),
            USUARIO_ENV: this.USUARIO_LOCAL,
            USUARIO_REC: usr_rec[0].ID_RESPONSABLE,
            DESCRIPCION: msj,
            TIPO: 'AUTOMATICA',
            FECHA_UPDATE: new Date(),
            ESTADO: 'Enviado'
          }
          // API guardado de datos
          const data1:any = {
            TIPO: 'NOTIFICACION',
            DATOS: dataNotificacion
          }
          this.socket.saveInfo('save', data1).subscribe((data) => {
            const res = JSON.parse(data.data);
            if (res[0].ErrMensaje !== '') {
              this.showModal(res[0].ErrMensaje);
            } else {
              this.socket.sendNotifications(dataNotificacion);
            }
          });

          prm.ACTIVIDAD.COLABORADORES.forEach((ele:any) => {
            const usr_rec:any = this.DResponsables.filter((d:any) => d.ID_RESPONSABLE === ele.ID_RESPONSABLE);
            const dataNotificacion:any = {
              FECHA: new Date(),
              USUARIO_ENV: this.USUARIO_LOCAL,
              USUARIO_REC: usr_rec[0].ID_RESPONSABLE,
              DESCRIPCION: msj,
              TIPO: 'AUTOMATICA',
              ESTADO: 'Enviado',
              APLICACION: 'GES-001',
              FECHA_UPDATE: new Date()
            }
            const data2:any = {
              TIPO: 'NOTIFICACION',
              DATOS: dataNotificacion
            }
            // API guardado de datos
            this.socket.saveInfo('save', data2).subscribe((data) => {
              const res = JSON.parse(data.data);
              if (res[0].ErrMensaje !== '') {
                this.showModal(res[0].ErrMensaje);
              } else {
                this.socket.sendNotifications(dataNotificacion);
              }
            });
          });

        };
      },
        ((err:any) => {
          this._sdatos.loadingVisible = false;
          this.showModal(err.message);
        })
      );
    };
    // if(this.Darchivos.length > 0) {
    //   const user_name = localStorage.getItem('user_name')?.toUpperCase();
    //   const item = this.Darchivos.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act});
    //   var msj:any = '';
    //   if(this.Darchivos.length === 1) msj = 'Un archivo adjunto.';
    //   if(this.Darchivos.length > 1) msj = this.Darchivos.length +' archivos adjuntos.';
    //   this.eventos.push({
    //     DESCRIPCION: msj,
    //     ErrMensaje: '',
    //     FECHA: new Date(),
    //     ID_ACTIVIDAD: this.new_data.ID_ACTIVIDAD,
    //     ITEM: item.ITEM + 1,
    //     NOMBRE: user_name,
    //     TIPO: 'MANUAL',
    //     USUARIO: this.USUARIO_LOCAL,
    //     ARCHIVOS: this.Darchivos
    //   });
    // }
    this.Darchivos = [];
    this.mesajeText = '';
    this.mostrarSubirArchivos = false;
  }

  validatingData() {
    if(  (this.new_data.RESPONSABLES.length > 0)
      && (this.new_data.FECHA_INICIO !== null && this.new_data.FECHA_INICIO !== undefined)
      && (this.new_data.FECHA_FIN !== null && this.new_data.FECHA_FIN !== undefined)
      && (this.new_data.PRIORIDAD !== '')
      && (this.new_data.ESTADO !== '')
      && (this.new_data.DESCRIPCION !== '')
    ) {
      return true;
    } else {
      return false;
    }
  }

  closeBottom(e:any) {
    this.visibleGesproInfo = false;
    this.conCambios = 0;
  }

  onClickEliminarArchivo(e:any, archivo:any) {
    const npos:any = this.Darchivos.findIndex((d:any) => d.ITEM === archivo.ITEM && d.ARCHIVO === archivo.ARCHIVO);
    this.Darchivos.splice(npos, 1);
  }

  // Abrir archivo
  onClickAbrir(archPDF, cellInfo) {
    // Si está en modo visualizacion, asigna fila de datos
    if (cellInfo !== undefined)
      this.new_data = cellInfo;

    // Tipos de archivos
    const signatures = {
      JVBERi0: "application/pdf",
      R0lGODdh: "image/gif",
      R0lGODlh: "image/gif",
      iVBORw0KGgo: "image/png",
      TU0AK: "image/tiff",
      "/9j/": "image/jpg",
      UEs: "application/vnd.openxmlformats-officedocument.",
      PK: "application/zip",
    };
    var fileType = '';
    for (var s in signatures) {
      if (this.new_data.IMAGEN.indexOf(s) !== -1) {
        fileType = signatures[s];
        // return
        break;
      }
    }
    if (fileType.match('image')) {
      var image = new Image();
      image.src = this.new_data.IMAGEN;
      var w = window.open("");
      w?.document.write("<style>img{max-width: 75%;}</style>", image.outerHTML);
    }
    if (fileType.match('pdf')) {
      let pdfWindow = window.open("");
      pdfWindow?.document.write("<iframe width='100%' height='100%' src='" + this.new_data.IMAGEN +"#view=FitH'></iframe>");
    }

  }

  // Cargar archivo
  onClickCargar(archPDF:any) {
    this.operArcImg('cargar', archPDF);
  }

  // Llama al cargue del archivo
  datArchivo: any;
  operArcImg(operArch:any, archivo:any) {

    // Operación de cargue de archivo
    if(operArch.match('cargar|icon-upload-file-sl')) {
      let input = document.createElement('input');
      this.datArchivo = archivo;
      input.type = 'file';
      input.multiple = true;
      input.accept="image/*,video/*,.pdf,.csv";
      this.indAsoArchivo = false;
      input.addEventListener("change", (e) => {
        if (!this.indAsoArchivo) this.fileChangeEvent(e, this.datArchivo);
      });
      if (!this.indAsoArchivo) input.click();
    }
  }

  imageError: string = '';
  tamArchivoImg: any;
  imgBase64zip: any;
  fileChangeEvent(fileInput:any, tarea:any) {
    var res: boolean = false;
    const signatures = {
      JVBERi0: "application/pdf",
      R0lGODdh: "image/gif",
      R0lGODlh: "image/gif",
      iVBORw0KGgo: "image/png",
      TU0AK: "image/tiff",
      "/9j/": "image/jpg",
      UEs: "application/vnd.openxmlformats-officedocument.",
      PK: "application/zip",
    };
    this.imageError = '';
    this.indAsoArchivo = true;
    for (let i = 0; i < fileInput.target.files.length; i++) {
      const file = fileInput.target.files[i];
      const larch = file.name;
      const tipoArchivo:any = file.type;
      var icon:any = '';
    
      // Icono segun tipo de archivo
      if (tipoArchivo.includes('image')) {
        icon = 'icon-image-ol';
      } else if (tipoArchivo.includes('pdf')) {
        icon = 'icon-pdf-doc-sl';
      } else if (tipoArchivo.includes('excel') || tipoArchivo.includes('spreadsheetml') || tipoArchivo.includes('word')) {
        icon = 'icon-doc-ol';
      } else { //otros
        icon = 'icon-link-ol';
      }
  
      if(this.Darchivos.length === 0) {
        this.Darchivos = [{
          USUARIO: this.USUARIO_LOCAL,
          ITEM: 1,
          ARCHIVO: larch,
          ID_ACTIVIDAD: tarea.ID_ACTIVIDAD,
          IMAGEN: '',
          icon: icon
        }];
      } else {
        const item = this.Darchivos.reduce((ant, act)=>{return (ant.ITEM > act.ITEM) ? ant : act});
        this.Darchivos.push({
          USUARIO: this.USUARIO_LOCAL,
          ITEM: item.ITEM + 1,
          ARCHIVO: larch,
          ID_ACTIVIDAD: tarea.ID_ACTIVIDAD,
          IMAGEN: '',
          icon: icon
        });
      }
      this.archivoDoc = larch;
      if (fileInput.target.files && file) {
        // Size Filter Bytes
        const max_size = 100000;
        const allowed_types = ['image/png', 'image/jpeg', 'image/jpeg', 'application/pdf'];
        const max_height = 15200;
        const max_width = 25600;
  
        /*if (file.size > max_size) {
          this.imageError = 'El máximo tamaño no debe supearar los 1.000.000 Kbytes ó ' + max_size / 1000000 + 'Mb';
          this.showModal(this.imageError);
          return false;
        }*/
        this.tamArchivoImg = file.size;
  
        /*if (!_.includes(allowed_types, file.type)) {
          this.imageError = 'Only Images are allowed ( JPG | PNG )';
          return false;
        }*/
        var fileType = '';
        const reader = new FileReader();
        reader.onload = (e: any) => {
          for (var s in signatures) {
            if (e.target.result.indexOf(s) !== 0) {
              var fileType = signatures[s];
              // return
              break;
            }
          }
          this.base64DataFile = e.target.result;
          const npos:any = this.Darchivos.findIndex((d:any) => d.ARCHIVO === larch)
          this.Darchivos[npos].IMAGEN = e.target.result;
          // this.new_data = archivo;
          this.mostrarSubirArchivos = true;
          if (fileType.match('image')) {
            const image = new Image();
            image.src = e.target.result;
            image.onload = async (rs:any) => {
              const img_height = rs.currentTarget['height'];
              const img_width = rs.currentTarget['width'];
  
              if (img_height > max_height && img_width > max_width) {
                this.imageError =
                  'Máximas dimensiones permitidas: ' +
                  max_height +
                  '*' +
                  max_width +
                  'px';
                this.showModal(this.imageError);
                res = false;
              } else {
                // Guarda archivo en la url
                const ext = larch.substring(larch.lastIndexOf(".")+1);
                var imgBase64Path = e.target.result;
  
                // Redimensionar tamaño si supera determinado tamaño
                if (this.tamArchivoImg > 10000) {
                  // await this.compressImage(imgBase64Path, 200, 200, img_width, img_height).then(compressed => {
                  //   imgBase64Path = compressed;
                  // })
                }
  
                // this.usuarioImg = imgBase64Path;
  
                res = true;
              }
            };
          }
        };
  
        if (this.imageError === '') reader.readAsDataURL(file);

        res = true;
      } else {
        res = false;
      }
    };
    return res;
  }

  valoresObjetos(obj: string, datos:any) {
    if (obj === 'estados' || obj === 'todos'){
      const prm:any = {};
      this._sdatos.getEstados('ESTADOS', prm).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        if(res[0].ErrMensaje !== '') {
          showToast(res[0].ErrMensaje, 'error');
          return;
        }
        this.DLEstados = res;
      });
    };
    if (obj === 'responsables' || obj === 'todos'){
      const prm:any = {};
      this._sdatos.getResponsables('RESPONSABLES', prm).subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token !== undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        for (let i = 0; i < res.length; i++) {
          const element = res[i];
          element.ITEM = i;
        }
        if(datos === 'TAREAS') {
          this.DResponsables = res[0].RESPONSABLES;
        };
        if(datos === 'RESPONSABILIDADES') {
          this.DResponsables = new DataSource({
            store: new ArrayStore({
              data: res[0].CARGOS,
              key: 'ID_RESPONSABLE',
            }),
            group: 'TIPO',
          });
        }
      });
    };
    if (obj === 'timeline'){
      const prm:any = {ID_ACTIVIDAD: this.new_data.ID_ACTIVIDAD};
      this.loadingVisible = true;
      this._sdatos.getEstados('TIMELINE', prm).subscribe((data: any)=> {
        this.loadingVisible = false;
        const res = validatorRes(data);
        if ( (data.token != undefined) ){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        if(res[0].ErrMensaje !== '') {
          showToast(res[0].ErrMensaje, 'error');
          return;
        }
        res.forEach((event:any) => {
          if(event.ARCHIVOS === undefined || event.ARCHIVOS === null) event.ARCHIVOS = [];
        });
        this.eventos = res;
        this.DTimeline = this.eventos.filter((d:any) => d.TIPO === 'MANUAL');
      });
      this.loadingVisible = false;
    };
  }

  showModal(mensaje:any) {
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
			stopKeydownPropagation: false,
		});
	}
}
