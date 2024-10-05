import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import * as Papa from 'papaparse';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-pegardatos',
  templateUrl: './pegardatos.component.html',
  styleUrls: ['./pegardatos.component.css'],
  standalone: true,
  imports: [ DxPopupModule, CommonModule, DxButtonModule ]
})
export class PegardatosComponent {
  input: string = '';
  jsonOutput: string = '';
  tableData: any[] = [];
  headers: string[] = [];
  popupVisible: boolean = false;

  @Input() events: Observable<any>;
  @Input() datosPegado: any;
  @Input() readOnly: any;

  @Output() datosPegadoChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRespuestaPegar: EventEmitter<any> = new EventEmitter<any>();

  private eventsSubscription: Subscription;

  preVisualizar() {
    const results = Papa.parse(this.input, { header: true });
    this.tableData = results.data;
    this.jsonOutput = JSON.stringify(this.tableData, null, 2);
    this.headers = Object.keys(this.tableData[0]);
  }
  pegarDatosGrid() {
    const results = Papa.parse(this.input, { header: true });
    this.tableData = results.data;
    this.onRespuestaPegar.emit(this.tableData);
    this.popupVisible = false;
  }
  doTextareaValueChange(ev) {
    try {
      this.input = ev.target.value;
    } catch(e) {
      console.info('could not set textarea-value');
    }
  }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((datos: any) => {
      switch (datos.accion) {
        case 'editar':
          this.popupVisible = true;
          break;

        default:
          break;
        }
    });
  }

}
