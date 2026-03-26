import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AdminService, AdminOverviewResponse } from '../../services/admin';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  loading = signal(true);
  error = signal('');

  overview = signal<AdminOverviewResponse | null>(null);
  recentListings = signal<any[]>([]);
  recentPosts = signal<any[]>([]);
  recentRequests = signal<any[]>([]);
  users = signal<any[]>([]);
  auditLogs = signal<any[]>([]);
  activitySearch = '';
  usersSearch = '';
  activityPage = signal(1);
  usersPage = signal(1);
  logsPage = signal(1);
  usersTotalPages = signal(1);
  logsTotalPages = signal(1);

  constructor(
    public auth: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isAdminOrModerator()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.error.set('');

    this.adminService.getOverview().subscribe({
      next: (overview) => {
        this.overview.set(overview);
        this.adminService.getActivityPaged({ page: this.activityPage(), limit: 8, search: this.activitySearch }).subscribe({
          next: (activityRes: any) => {
            this.recentListings.set(activityRes.recentListings || []);
            this.recentPosts.set(activityRes.recentPosts || []);
            this.recentRequests.set(activityRes.recentRequests || []);

            this.adminService.getUsersPaged({ page: this.usersPage(), limit: 8, search: this.usersSearch }).subscribe({
              next: (usersRes: any) => {
                this.users.set(usersRes.users || []);
                this.usersTotalPages.set(usersRes.pagination?.totalPages || 1);

                this.adminService.getAuditLogs({ page: this.logsPage(), limit: 8 }).subscribe({
                  next: (logsRes: any) => {
                    this.auditLogs.set(logsRes.logs || []);
                    this.logsTotalPages.set(logsRes.pagination?.totalPages || 1);
                    this.loading.set(false);
                    setTimeout(() => this.scrollForRoute(), 0);
                  },
                  error: (err) => {
                    this.error.set(err.error?.message || 'Failed to load audit logs');
                    this.loading.set(false);
                    setTimeout(() => this.scrollForRoute(), 0);
                  }
                });
              },
              error: (err) => {
                this.error.set(err.error?.message || 'Failed to load user management data');
                this.loading.set(false);
                setTimeout(() => this.scrollForRoute(), 0);
              }
            });
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Failed to load activity feed');
            this.loading.set(false);
            setTimeout(() => this.scrollForRoute(), 0);
          }
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load admin analytics');
        this.loading.set(false);
        setTimeout(() => this.scrollForRoute(), 0);
      }
    });
  }

  updateRole(userId: string, role: 'student' | 'moderator' | 'admin') {
    this.adminService.updateUserRole(userId, role).subscribe({
      next: () => this.loadAll(),
      error: (err) => this.error.set(err.error?.message || 'Failed to update role')
    });
  }

  removePost(postId: number) {
    this.adminService.deletePost(postId).subscribe({
      next: () => this.loadAll(),
      error: (err) => this.error.set(err.error?.message || 'Failed to remove post')
    });
  }

  removeListing(listingId: number) {
    this.adminService.deleteListing(listingId).subscribe({
      next: () => this.loadAll(),
      error: (err) => this.error.set(err.error?.message || 'Failed to remove listing')
    });
  }

  onSearchActivity() {
    this.activityPage.set(1);
    this.loadAll();
  }

  onSearchUsers() {
    this.usersPage.set(1);
    this.loadAll();
  }

  nextUsersPage() {
    if (this.usersPage() < this.usersTotalPages()) {
      this.usersPage.update((p) => p + 1);
      this.loadAll();
    }
  }

  prevUsersPage() {
    if (this.usersPage() > 1) {
      this.usersPage.update((p) => p - 1);
      this.loadAll();
    }
  }

  nextLogsPage() {
    if (this.logsPage() < this.logsTotalPages()) {
      this.logsPage.update((p) => p + 1);
      this.loadAll();
    }
  }

  prevLogsPage() {
    if (this.logsPage() > 1) {
      this.logsPage.update((p) => p - 1);
      this.loadAll();
    }
  }

  private scrollForRoute() {
    const url = this.router.url;
    let targetId = 'admin-panel-overview';

    if (url.includes('/admin/audit')) {
      targetId = 'admin-panel-audit-logs';
    } else if (url.includes('/admin/posts')) {
      targetId = 'admin-panel-moderation-posts';
    } else if (url.includes('/admin/listings')) {
      targetId = 'admin-panel-moderation-listings';
    }

    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
}
