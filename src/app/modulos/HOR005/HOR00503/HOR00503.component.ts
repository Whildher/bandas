import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DxDataGridModule, DxSelectBoxModule } from 'devextreme-angular';
import { clsMediosPago } from '../clsHOR005.class';
import { Observable, Subscription } from 'rxjs';
import { HOR001Service } from 'src/app/services/HOR001/HOR001.service';
import { validatorRes } from 'src/app/shared/validator/validator';

@Component({
  selector: 'app-HOR00503',
  templateUrl: './HOR00503.component.html',
  styleUrls: ['./HOR00503.component.css'],
  standalone: true,
  imports: [ DxDataGridModule, DxSelectBoxModule ]
})
export class HOR00503Component {

  DMediosPago: clsMediosPago[] = [];
  DBancos: any;
  esVisibleSelecc: string = 'none';
  esEdicion: boolean = false;

  private eventsSubscription: Subscription;

  @Input() events: Observable<any>;

  @Input() visible: boolean;

  @Output() onRespuestaConceptos = new EventEmitter<any>;

  constructor(
    private _sdatos: HOR001Service,
  ) 
  {   }

  onCellPrepared(e){
    if (e.rowType === 'totalFooter') {
        if (e.summaryItems.length > 0 && e.summaryItems[0].value > 0) {
          e.cellElement.querySelector(".dx-datagrid-summary-item").style.fontSize = '16px';
          e.cellElement.querySelector(".dx-datagrid-summary-item").style.fontWeight = 'bold';
          e.cellElement.querySelector(".dx-datagrid-summary-item").style.color = 'green';
        }
      }
      if (e.rowType === 'data') {
        if (e.data.CONCEPTO == 'Sub total') {
          e.cellElement.style.fontSize = '16px';
          e.cellElement.style.fontWeight = 'bold';
        }
        if (e.data.CONCEPTO == 'Sub total') {
          e.cellElement.style.fontSize = '16px';
          e.cellElement.style.fontWeight = 'bold';
        }
      }
      
  }

  onValueChangedBanco(e, cellInfo) {
    cellInfo.data.ID_BANCO = e.value;
    const nx = this.DBancos.findIndex(d => d.ID_BANCO === e.value);
    if (nx !== 0) {
      cellInfo.data.BANCO_CUENTA = this.DBancos[nx].NOMBRE;
    }
  }
  verBanco(item) {
    if (item)
      return (item.NOMBRE);
    else
      return "";
  }

  // **** Cargue de datos iniciales y/o refrescar todos los datos asociados a objetos
  valoresObjetos(obj: string, opcion: any = undefined){

    if (obj === 'bancos' || obj === 'todos') {
      const prm = {  };
      this._sdatos.consulta('BANCOS', prm, 'HOR-005').subscribe((data: any)=> {
        const res = validatorRes(data);
        if ( (data.token != undefined)){
          const refreshToken = data.token;
          localStorage.setItem("token", refreshToken);
        }
        this.DBancos = res;
      });
    }
  }

  // Activa campos de la forma para edición 
  // dependiendo de la acción a realizar
  activarEdicion(accion) {
    switch (accion) {
      case 'consulta':
      case 'inactivo':
        this.esVisibleSelecc = 'none';
        this.esEdicion = false;
        break;
      case 'activo':
      case 'nuevo':
        this.esVisibleSelecc = 'always';
        this.esEdicion = true;
        break;
      case 'generacion':
        this.esVisibleSelecc = 'always';
        this.esEdicion = false;
        break;
    
      default:
        break;
    }
  }

  ngOnInit(): void {
    const user:any = localStorage.getItem("usuario");
    this.eventsSubscription = this.events.subscribe((datos: any) => {
      switch (datos.operacion) {
        case 'ini':
          this.DMediosPago = datos.dataSource;
          break;
      
        case 'consulta':
          // this.valoresObjetos('consulta', datos.documento);
          break;

        default:
          break;
      }
      this.activarEdicion(datos.operacion);

      // Inicializa datos
      this.valoresObjetos('todos');
    });

  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }



}
