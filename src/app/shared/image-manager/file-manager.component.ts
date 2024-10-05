import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FileService, FileItem } from './file.service';
import { Observable, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import * as pdfjsLib from 'pdfjs-dist';
import { BANService } from 'src/app/services/BAN/BAN.service';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css'],
  standalone: true,
  imports: [ MatButtonModule, MatIconModule, MatGridListModule, CommonModule ]
})
export class FileManagerComponent implements OnInit, AfterViewInit {
  files$: Observable<FileItem[]>;
  selectedFile: FileItem | null = null;
  @ViewChild('pdfCanvas') pdfCanvas: ElementRef;
  @ViewChild('pdfContainer') pdfContainer: ElementRef;
  
  private pdfDocument: any = null;

  @Input() events: Observable<any>;
  @Output() onRespuestaItems = new EventEmitter<any>;
  private eventsSubscription: Subscription;

  constructor(private fileService: FileService, private _sdatos: BANService ) {
    this.files$ = this.fileService.getFiles();
  }

  ngOnInit(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

    this.eventsSubscription = this.events.subscribe((datos: any) => {
      switch (datos.operacion) {
        case 'guardar':
          this.guardar(datos.prefijo);
          break;
      
        default:
          break;
      }

    });

  }

  ngAfterViewInit(): void {
    if (this.selectedFile && this.selectedFile.type === 'pdf') {
      this.renderPdf();
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileService.addFile(file);
    }
  }

  guardar(prefijo: any) {
    const prm = { prefijo, archivos: this.fileService.files };
    this._sdatos
    .guardarArchivos('guardar archivos', prm, "generales")
    .subscribe(
      { next: (resp) => {
        const res = JSON.parse(resp.data);
      },
      error: (e) => {
        console.log('Error al guardar archivos '+e.error.message);
        }
      });
  }

  previewFile(file: FileItem) {
    this.selectedFile = file;
    if (file.type === 'pdf') {
      this.loadPdf(file.url);
    }
  }

  closePreview() {
    this.selectedFile = null;
    this.pdfDocument = null;
  }

  deleteFile(id: number) {
    this.fileService.deleteFile(id);
    if (this.selectedFile && this.selectedFile.id === id) {
      this.closePreview();
    }
  }

  private loadPdf(url: string) {
    pdfjsLib.getDocument(url).promise.then(pdf => {
      this.pdfDocument = pdf;
      this.renderPdf();
    }).catch(error => {
      console.error('Error loading PDF:', error);
    });

  }

  private async renderPdf() {
    if (!this.pdfDocument || !this.pdfContainer) {
      return;
    }

    const container = this.pdfContainer.nativeElement;
    container.innerHTML = ''; // Clear previous content

    const numPages = this.pdfDocument.numPages;
    const scale = 1.5;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await this.pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext);

        container.appendChild(canvas);

        // Add some space between pages
        if (pageNum < numPages) {
          const spacer = document.createElement('div');
          spacer.style.height = '20px';
          container.appendChild(spacer);
        }
      } catch (error) {
        console.error(`Error rendering page ${pageNum}:`, error);
      }
    }
  }

}