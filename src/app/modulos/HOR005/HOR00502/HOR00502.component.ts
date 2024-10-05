import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import { clsTotalesRec } from '../clsHOR005.class';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-HOR00502',
  templateUrl: './HOR00502.component.html',
  styleUrls: ['./HOR00502.component.css'],
  standalone: true,
  imports: [ CommonModule, DxDataGridModule ]
})
export class HOR00502Component {

  DConceptos: clsTotalesRec[] = [];
  esVisibleSelecc: string = 'none';
  esEdicion: boolean = false;

  private eventsSubscription: Subscription;

  @Input() events: Observable<any>;

  @Input() visible: boolean;

  @Output() onRespuestaConceptos = new EventEmitter<any>;

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
          this.DConceptos = datos.dataSource;
          break;
      
        case 'consulta':
          // this.valoresObjetos('consulta', datos.documento);
          break;

        default:
          break;
      }
      this.activarEdicion(datos.operacion);

      // Inicializa datos
      // this.valoresObjetos('todos');
    });

  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }


}
