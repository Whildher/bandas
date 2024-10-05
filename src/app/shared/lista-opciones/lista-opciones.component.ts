import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DxListModule, DxPopupModule, DxTreeListComponent } from 'devextreme-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-opciones',
  templateUrl: './lista-opciones.component.html',
  styleUrls: ['./lista-opciones.component.css'],
  standalone: true,
  imports: [DxPopupModule, DxListModule]
})
export class ListaOpcionesComponent implements OnInit {

  @ViewChild('listOptions', { static: false }) listOptions: DxTreeListComponent;
  @Input('itemVisible') visiblePopup: boolean;
  @Input() incomingData: any;
  @Output() cerrarLista = new EventEmitter<boolean>();
  @Output() saveData = new EventEmitter<any>();
  
  listaOpciones: any [] = [];
  opcionesValue: any [] = [];

  selectAllModeValue = 'page';
  selectionModeValue = 'all';

  constructor() {
    this.aceptarCambios = this.aceptarCambios.bind(this);
  }

  ngOnInit(): void {
  }

  seleccProducto(e: any) {
    const pos:any = this.opcionesValue.findIndex((d:any) => d.PRODUCTO === e.itemData.PRODUCTO );
    if ( pos != -1 ){
      this.opcionesValue.splice(pos,1);
    } else {      
      this.opcionesValue.push({COPIA: e.itemData.PRODUCTO});
    }
  }

  onShown(e: any) {
    this.listaOpciones = this.incomingData;
  }

  onHidden(e: any) {
    this.cerrarLista.emit(false);
    this.visiblePopup = false;
  }

  aceptarCambios(e: any) {
    this.saveData.emit(this.opcionesValue);
  }

  cancelarCambios(e: any) {
    this.visiblePopup = false;
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
