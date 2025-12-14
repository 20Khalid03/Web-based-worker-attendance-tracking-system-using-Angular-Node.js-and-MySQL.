import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      const userRole = this.authService.getUserRole();
      const requiredRole = route.data['role'] as string;
  
      if (requiredRole && userRole !== requiredRole) {
        if (userRole === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (userRole === 'ouvrier') {
          this.router.navigate(['/dashboard-ouvrier']);
        }
        return false;
      }
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
  
}