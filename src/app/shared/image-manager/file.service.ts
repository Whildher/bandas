import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FileItem {
  id: number;
  name: string;
  url: string;
  type: 'image' | 'pdf';
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  public files: FileItem[] = [];
  private filesSubject = new BehaviorSubject<FileItem[]>([]);

  constructor() { }

  getFiles(): Observable<FileItem[]> {
    return this.filesSubject.asObservable();
  }

  addFile(file: File | Blob, fileName?: string) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && e.target.result) {
        const newFile: FileItem = {
          id: this.files.length + 1,
          name: fileName || (file instanceof File ? file.name : `File ${this.files.length + 1}`),
          url: e.target.result as string,
          type: this.getFileType(file)
        };
        this.files.push(newFile);
        this.filesSubject.next(this.files);
      }
    };
    reader.readAsDataURL(file);
  }

  deleteFile(id: number) {
    this.files = this.files.filter(f => f.id !== id);
    this.filesSubject.next(this.files);
  }

  private getFileType(file: File | Blob): 'image' | 'pdf' {
    if (file instanceof File) {
      return file.type.startsWith('image/') ? 'image' : 'pdf';
    } else {
      // For Blob, we might need to infer the type from other information
      // This is a simple example; you might need more sophisticated type detection
      return (file.type && file.type.startsWith('image/')) ? 'image' : 'pdf';
    }
  }
}