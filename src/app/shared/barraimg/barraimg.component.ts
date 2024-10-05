import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DxTooltipModule } from 'devextreme-angular';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-barraimg',
  templateUrl: './barraimg.component.html',
  styleUrls: ['./barraimg.component.css'],
  standalone: true,
  imports: [CommonModule, DxTooltipModule]
})
export class BarraimgComponent implements OnInit {

  private eventsSubscription: Subscription;

  docParent: any;
  toolTipVisible: boolean = false;
  activa: boolean = false;
  targetIdTooltip: string;
  tooltipTitulo: string;
  tooltipInfo: string;
  activeBtn: any = [];
  wrapperAttr = { class: "cls-tooltip-bar" };
  menuItemsInfo = [{ name: 'icon-upload-file-sl', titulo: 'Subir imagen', info: 'Subir imagenes (jpg, png, tiff, bmp). Debe ser menor a 1Mb de tamaño' },
                   { name: 'icon-eliminar-sl', titulo: 'Eliminar imagen', info: 'Eliminar imagen actual' },
                   { name: 'icon-eliminar-todo-sl', titulo: 'Eliminar todas', info: 'Eliminar todas las imagenes de la galería' },
                  ]

  @Input('barraVisible') esVisible: boolean;

  @Input() targetElem: any;

  @Input() data: any;

  @Input() events: Observable<any>;

  @Output() onClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe((prmElem: any) => {
      this.docParent = prmElem.docElem;
      var gall = prmElem.docElem.getElementById(prmElem.target);
      switch (prmElem.accion) {
        case 'activar':
          this.activeBtn = prmElem.active;
          gall.addEventListener("mouseover", this.mouseover);
          gall.addEventListener("mouseleave", this.mouseleave);
          var barra = document.getElementById('tbar-img-xtein');
          if ( barra === null || barra === undefined ) {
            this.creaBarra(prmElem.docElem, gall);
          }
          else {
            gall.appendChild(document.getElementById('tbar-img-xtein'));
          }
          setTimeout(() => {
            var elembtn = this.docParent.getElementsByClassName('xs-icon-img');
            for (let i = 0; i < elembtn.length; i++) {
              const e = elembtn[i];
              if (e instanceof HTMLElement) {
                e.addEventListener("mouseover", ( event ) => {
                  this.toggleToolTip(e.id);
                });
                e.addEventListener("click", ( event ) => {
                  event.stopPropagation();
                  this.onClick.emit(e.id);
                }, false);
              }
            }
          }, 300);

          break;
      
        case 'inactivar':
          if (gall) {
            gall.removeEventListener('mouseover', this.mouseover);
            gall.removeEventListener('mouseleave', this.mouseleave);
          }
          break;

        default:
          break;
      }
    });                    

  }
  ngAfterViewInit(): void {

  }
  mouseover() { 
    const ele:any = document.getElementById('tbar-img-xtein');
    ele.style.display = 'block';
  }
  mouseleave() {
    const ele:any = document.getElementById('tbar-img-xtein');
    ele.style.display = 'none';
  }
  // Administra presentación de tool tips
  toggleToolTip(btnmenu:any) {
    this.targetIdTooltip = '#'+btnmenu;
    this.toolTipVisible = !this.toolTipVisible;
    const nx = this.menuItemsInfo.findIndex(m => m.name === btnmenu);
    if (nx >= 0) {
      this.tooltipTitulo = this.menuItemsInfo[nx].titulo;
      this.tooltipInfo = this.menuItemsInfo[nx].info;
    }
  }

  // Re-crea barra de botones
  creaBarra(docelem, target) {
    var b: HTMLDivElement = docelem.createElement('div');
    let divbarra = this.activeBtn[0] ? '<button type="button" class="mr-1 btn btn-tools xs-icon-img" id="icon-upload-file-sl">'+
                  '   <i class="icon-upload-file-sl" aria-hidden="true"></i>'+
                  '</button>' : '';
    divbarra += this.activeBtn[1] ? '<button type="button" class="mr-1 btn btn-tools xs-icon-img" id="icon-eliminar-sl">'+
                  '    <i class="icon-eliminar-sl" aria-hidden="true"></i>'+
                  '</button>' : '';
    divbarra += this.activeBtn[2] ? '<button type="button" class="mr-1 btn btn-tools xs-icon-img" id="icon-eliminar-todo-sl">'+
                  '    <i class="icon-eliminar-todo-sl" aria-hidden="true"></i>'+
                  '</button>' : '';
    b.innerHTML = divbarra;
    b.id = 'tbar-img-xtein';
    b.className = 'xs-bar-img';
    target.appendChild(b);
  }
  
  onShown(e) {
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

}
