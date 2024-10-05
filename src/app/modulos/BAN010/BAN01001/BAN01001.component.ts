import { Component, Input } from '@angular/core';
import { DxDataGridModule, DxPopupModule } from 'devextreme-angular';
import { Observable, Subscription } from 'rxjs';
import { BANService } from 'src/app/services/BAN/BAN.service';

@Component({
  selector: 'app-BAN01001',
  templateUrl: './BAN01001.component.html',
  styleUrls: ['./BAN01001.component.css'],
  standalone: true,
  imports: [ DxPopupModule, DxDataGridModule ]
})
export class BAN01001Component {

  visiblePopup: boolean = false;
  configBotonAceptar: any;
  DLogAgenda: any;
  popUpLog: any;
  gridLog: any;
  tituloLog: any;
  private eventsSubscription: Subscription;

  @Input() events: Observable<any>;
  
  constructor(private _sdatos: BANService
             ) 
  { 
    this.configBotonAceptar = {
      icon: 'todo',
      text: 'Aceptar',
      onClick: this.accionPopUp.bind(this, 'aceptar')
    };
  }

  accionPopUp(accion) {

    this.visiblePopup = false;
    if (accion === 'cancelar') return;

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

  ngOnInit(): void { 
    this.DLogAgenda = [];
    this.eventsSubscription = this.events.subscribe((datos: any) => {
      if (datos.accion == 'activar') {
        this.visiblePopup = true;
        
        // Consulta el histórico de transacciones sobre la orden de compra
        this._sdatos.consulta('log agenda',{ CONSECUTIVO: datos.CONSECUTIVO },'BAN-010').subscribe((data: any) => {
          const res = JSON.parse(data.data);
          if ( (data.token != undefined) ){
            const refreshToken = data.token;
            localStorage.setItem("token", refreshToken);
          }
          this.DLogAgenda = res;
        });
  
      }
    });
  }

}
