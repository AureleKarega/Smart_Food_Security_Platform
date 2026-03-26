import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { AdminNavbar } from './components/admin-navbar/admin-navbar';
import { Footer } from './components/footer/footer';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar,],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'ALU FoodShare';
  
  constructor(private authService: AuthService, private router: Router) {}
  
  get isAdmin(): boolean {
    return this.authService.isAdminOrModerator() && this.router.url.startsWith('/admin');
  }

  get isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }
}
