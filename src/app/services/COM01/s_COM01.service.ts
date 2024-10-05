import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class COMO1Service {

  constructor(private http:HttpClient) { }

  getGrupoProductos(Accion: string, prmDatos: any): Observable<any> {
		const prmJ = {
			"prmAccion": Accion,
			"prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: '00' },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
		};
    const body = JSON.stringify(prmJ);

    let url = '/api/COM001/getGrupoProductos';
    
    return this.http.post<any>(url, body,
      {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }).
      pipe(
        map((vec: any) => {
          return vec;
        }),
        catchError((err) => {
          return throwError(err);
        })
    );
	}

  getProveedores(Accion: string, prmDatos: any): Observable<any> {
    const prmJ = {
			"prmAccion": Accion,
			"prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: '00' },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
		};
    const body = JSON.stringify(prmJ);

    let url = '/api/COM001/getProveedores';
    
    return this.http.post<any>(url, body,
      {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }).
      pipe(
        map((vec: any) => {
          return vec;
        }),
        catchError((err) => {
          return throwError(err);
        })
    );
	}

  getBodegas(Accion: string, prmDatos: any): Observable<any> {
		const prmJ = {
			"prmAccion": Accion,
			"prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: '00' },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
		};
    const body = JSON.stringify(prmJ);

    let url = '/api/COM001/getBodegas';
    
    return this.http.post<any>(url, body,
      {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }).
      pipe(
        map((vec: any) => {
          return vec;
        }),
        catchError((err) => {
          return throwError(err);
        })
    );
	}

  getGenerar(Accion: string, prmDatos: any): Observable<any> {
		const prmJ = {
			"prmAccion": Accion,
			"prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: '00' },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
		};
    const body = JSON.stringify(prmJ);

    let url = '/api/COM001/getGenerar';
    
    return this.http.post<any>(url, body,
      {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }).
      pipe(
        map((vec: any) => {
          return vec;
        }),
        catchError((err) => {
          return throwError(err);
        })
    );
	}

}
