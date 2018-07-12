import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedUserGuard implements CanActivate {
  constructor(private authService: AuthenticationService) { }

  canActivate(
    _next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.authenticated;
  }
}
