import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MEN1000Service {

  constructor( private http: HttpClient ) { }

  // Consultas varias
  consulta(accion: any, prmDatos: any, aplicacion: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);    
    aplicacion = aplicacion.replace('-','');
    let url = '/api/'+aplicacion+'/consulta';
    return this.http.post<any>(url, body,
      { headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }).
    pipe(
      map((vec: any) => {
        return vec;
      }),
      catchError((err) => {
        return throwError(() => new Error(err));
      })
    );
  }

}
