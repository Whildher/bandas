import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PRO008Service {

  constructor(private http:HttpClient) { }

  getSecciones(prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": "qsecciones",
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);    
    let url = '/api/getSecciones';
    
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
	};

  getTurnos(accion:any, prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    let url = '/api/PRO008/getTurnos';
    
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
	};

  getJornadasTurnos(accion:any, prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    let url = '/api/PRO008/getJornadasTurnos';
    
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
	};

  getBasesdelCosto(accion:any, prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    let url = '/api/PRO008/getBasesdelCosto';
    
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
	};

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

  save(prmAccion: any, prmDatos: any): Observable<any> {
    const prmJ = {
        "prmAccion": prmAccion,
        "prmDatos": JSON.stringify(prmDatos),
        "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
        "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);    
    let url = '/api/PRO008/'+prmAccion;
    
    return this.http.post<any>(url, body,
      {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }).
      pipe(
        map((vec: any) => {
          return vec;
        }),
        catchError((err) => {
          return throwError(() => new Error(err));
        })
        );
	};

  delete(prmAccion: any, prmDatos: any): Observable<any> {
    const prmJ = {
        "prmAccion": prmAccion,
        "prmDatos": JSON.stringify(prmDatos),
        "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
        "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);    
    let url = '/api/PRO008/'+prmAccion;
    
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
	};

  empleadosSecciones(prmAccion: any, prmDatos: any): Observable<any> {
    const prmJ = {
        "prmAccion": prmAccion,
        "prmDatos": JSON.stringify(prmDatos),
        "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
        "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);    
    let url = '/api/PRO009/empleadosSecciones';
    
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
	};

  // Valida existencia de una llave de la tabla
  validellave(accion: any, prmDatos: any, aplicacion: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);    
    aplicacion = aplicacion.replace('-','');
    let url = '/api/'+aplicacion+'/existencia';
    return this.http.post<any>
      (url,
        body,
        { headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
      .pipe(
        map((vec: any) => {
        return vec;
      }),
      catchError((err) => {
        return throwError(() => new Error(err));
      })
      );
  }

}
