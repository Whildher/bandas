import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class ApiRestService {

  public collapsed: boolean = false;
  private subject_collapsed = new Subject<any>();

  constructor(private http:HttpClient)
  { }

  // Comunicación Ordenamiento atributos
  setObs_collapsed(prmDatos: any): void {
    this.subject_collapsed.next(prmDatos);
  }
  getObs_collapsed(): Observable<any> {
    return this.subject_collapsed.asObservable();
  }

  usuarioValido(Accion: string, prmDatos: any): Observable<any> {
		const prmJ = {
			"prmAccion": Accion,
			"prmDatos": JSON.stringify(prmDatos),
      "prmConexion": "ConexionBD"
		};
    const body = JSON.stringify(prmJ);

    let url = '/api/usuarioValido';
    return this.http.post<any>(url, body,
      {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }).
      pipe(
        map((vec: any) => {
          // console.log('URL: '+url);
          return vec;
        }),
        catchError((err) => {
          return throwError(err);
        })
    );
	};

  usuarioLogin(Accion: string, prmDatos: any): Observable<any> {
		const prmJ = {
			"prmAccion": Accion,
			"prmDatos": JSON.stringify(prmDatos),
      "prmConexion": "ConexionBD"
		};
    const body = JSON.stringify(prmJ);
    let url = '/api/usuarioLogin';
    
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

  usuarioAplicaciones(Accion: string, prmDatos: any): Observable<any> {
		const prmJ = {
			"prmAccion": Accion,
			"prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
		};
    const body = JSON.stringify(prmJ);
    
    let url = '/api/home';
    
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
    let url = '/api/generales/consulta';
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

  
  getUsuarios(accion: any, prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    let url = '/api/usuarios';
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

  getResponsables(Accion: string, prmDatos: any): Observable<any> {
		const prmJ = {
			"prmAccion": Accion,
			"prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
		};
    const body = JSON.stringify(prmJ);
    let url = '/api/GES00/responsables';
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

  getAplicacion(accion: any, prmDatos: any): Observable<any> {
    const prmJ = {
        "prmAccion": accion,
        "prmDatos": JSON.stringify(prmDatos),
        "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
        "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    
    const body = JSON.stringify(prmJ);
    let url = '/api/CHAT/aplicacion';
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
