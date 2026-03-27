import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AdminDashboard } from '../admin-dashboard/admin-dashboard';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.html',
  styleUrls: ['./admin-navbar.scss'],
})
export class AdminNavbar {
  menuOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  goToPublic(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }

  currentUser() {
    return this.authService.currentUser();
  }

  isAdmin() {
    return this.authService.hasRole('admin');
  }
}
