import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PRO025Service {

  // Observers para los componentes
  private subject_ProAcreedores = new Subject<any>();
  private subjectCondiciones = new Subject<any>();

  // Modos de operación
  accion: any;

  constructor( private http:HttpClient ) { }

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

  // Promise consulta
  async pconsulta(accion: any, prmDatos: any, aplicacion: any): Promise<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);    
    aplicacion = aplicacion.replace('-','');
    let url = '/api/'+aplicacion+'/consulta';

    return await this.http.post<any>(url, body,
      { headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
          .toPromise()
          .then((res) => { 
            return res;
          })
          .catch((err) => { return throwError(() => new Error(err)); });
	}


  save(accion: any, prmDatos: any, aplicacion: any): Observable<any> {
    const prmJ = {
        "prmAccion": accion,
        "prmDatos": JSON.stringify(prmDatos),
        "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
        "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    aplicacion = aplicacion.replace('-','');
    let url = "/api/"+aplicacion+"/save";
    return this.http.post<any>(url, body,
        { headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }).
      pipe(
        map((vec: any) => {
          return vec;
        }),
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  delete(accion: any, prmDatos: any, aplicacion: any): Observable<any> {
    const prmJ = {
        "prmAccion": 'delete',
        "prmDatos": JSON.stringify(prmDatos),
        "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
        "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    const body = JSON.stringify(prmJ);
    aplicacion = aplicacion.replace('-','');
    let url = "/api/"+aplicacion+"/"+accion;
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
  };

}
