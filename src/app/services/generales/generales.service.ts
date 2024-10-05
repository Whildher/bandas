import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { BehaviorSubject, Observable, Subject, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
  })
export class GeneralesService {
  public apiData: any;
  public onDataChanged: BehaviorSubject<any>;
  public APLICACIONES: any [] = [];

  private subjectEmitAplicaciones = new Subject<any>();

  constructor(private http: HttpClient) {
    this.onDataChanged = new BehaviorSubject({});
  }

  //Emitir las aplicaciones del usuario
  setAplicaciones(prmDatos: any): void {
    this.subjectEmitAplicaciones.next(prmDatos);
  }
  getAplicaciones(): Observable<any> {
    return this.subjectEmitAplicaciones.asObservable();
  }

  // Obtiene la IP de conexion cliente local
  public getIPAddress()  
  {  
    return this.http.get("http://api.ipify.org/?format=json");  
  }

  // API para Enviar correo electronico
  public sendMail(accion: any, prmDatos: any, aplicacion: any): Observable<any> 
  {  
    const prmJ = {
        "prmAccion": accion,
        "prmDatos": JSON.stringify(prmDatos),
        "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
        "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
  
    const body = JSON.stringify(prmJ);    
    aplicacion = aplicacion.replace('-','');
    let url = '/api/generales/emailer';
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


  // API de reportes para exportar PDF y devolver stream
  public ExportarPDF(prmDatos: any): Observable<Blob> 
  {  
    const body = JSON.stringify(prmDatos);    
    // let params = new HttpParams().set("urlprm", encodeURIComponent(prmDatos));
    let url = '/reportes/ApiReport/ExportPDF';
    return this.http.post<any>(url, body,
      { headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        responseType : 'blob' as 'json' }).
      pipe(
        map((vec: any) => {
          return vec;
        }),
        catchError((err) => {
          return throwError(() => new Error(err));
        })
    );
  }

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

  // Buscar Rutas tipo layout planta
  columnas(prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": "columnas",
      "prmDatos": JSON.stringify(prmDatos),
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    const body = JSON.stringify(prmJ);    
    let url = "/api/generales/columnas";
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
    }

  // Cargar archivo a la url de la aplicación
  cargar_archivo(ruta: any, prmDatos: any): Observable<any> {
    const prmJ = {
      "prmAccion": ruta,
      "prmDatos": prmDatos,
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    const body = JSON.stringify(prmJ);    
    let url = "/api/generales/cargar_archivo";
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
    }

  // Bajar archivo a la url de la aplicación
  bajar_archivo(accion: any, prmDatos: any, sqlProc: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      sqlProc,
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    const body = JSON.stringify(prmJ);    
    let url = "/api/generales/bajar_archivo";
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
  }

  // Bajar imagenes a la url de la aplicación con varias opciones
  bajar_imagen(accion: any, prmDatos: any, sqlProc: any): Observable<any> {
    const prmJ = {
      "prmAccion": accion,
      "prmDatos": JSON.stringify(prmDatos),
      sqlProc,
      "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
      "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
    const body = JSON.stringify(prmJ);    
    let url = "/api/generales/bajar_imagen";
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
  }

  // API para Enviar correo electronico
  public log(accion: any, prmDatos: any, aplicacion: any): Observable<any> 
  {  
    const prmJ = {
        "prmAccion": accion,
        "prmDatos": JSON.stringify(prmDatos),
        "prmConexion": { EMPRESA: localStorage.getItem('empresa') },
        "prmTokenDatos": { USUARIO: localStorage.getItem('usuario'), EMPRESA: localStorage.getItem('empresa'), TOKEN: localStorage.getItem('token') }
    };
  
    const body = JSON.stringify(prmJ);    
    aplicacion = aplicacion.replace('-','');
    let url = '/api/generales/log';
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
