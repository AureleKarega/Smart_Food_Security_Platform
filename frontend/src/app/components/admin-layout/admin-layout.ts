import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavbar } from '../admin-navbar/admin-navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminNavbar, Footer],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {}
