import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  users = signal<any[]>([]);
  loading = signal(false);
  error = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  searchQuery = '';

  constructor(
    private admin: AdminService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isAdminOrModerator()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadUsers();
    
    // Subscribe to users state
    this.admin.users$.subscribe(users => {
      this.users.set(users);
    });
    
    this.admin.loading$.subscribe(loading => {
      this.loading.set(loading);
    });
    
    this.admin.error$.subscribe(error => {
      this.error.set(error || '');
    });
    
    this.admin.currentPage$.subscribe(page => {
      this.currentPage.set(page);
    });
    
    this.admin.totalPages$.subscribe(total => {
      this.totalPages.set(total);
    });
  }

  loadUsers() {
    this.admin.loadUsers();
  }

  updateRole(userId: string, role: 'student' | 'moderator' | 'admin') {
    this.admin.updateUserRole(userId, role).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update role');
      }
    });
  }

  toggleUserStatus(userId: string, isActive: boolean) {
    this.admin.toggleUserStatus(userId, isActive).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update user status');
      }
    });
  }

  viewUserDetails(userId: string) {
    // Navigate to user details page
    console.log('View user details:', userId);
  }

  searchUsers() {
    this.admin.searchUsers(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadUsers();
  }

  nextPage() {
    this.admin.nextPage();
  }

  prevPage() {
    this.admin.prevPage();
  }
}
