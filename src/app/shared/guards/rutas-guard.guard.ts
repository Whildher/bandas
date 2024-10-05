import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class RutasGuardGuard implements CanActivate {
  
  constructor (private router: Router){ }
  
  redirect(flag: boolean): any {
    if(!flag) {
      this.router.navigate(['/'])
    }
  }
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let ACCESS: boolean;      
    if ("token" in localStorage) {
      ACCESS = true;
    } else {
      ACCESS = false;
    }
    return ACCESS;
  }
  
}
