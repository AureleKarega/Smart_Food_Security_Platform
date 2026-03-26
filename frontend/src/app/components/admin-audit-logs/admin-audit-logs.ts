import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [DatePipe, JsonPipe],
  templateUrl: './admin-audit-logs.html',
  styleUrl: './admin-audit-logs.scss',
})
export class AdminAuditLogs implements OnInit {
  loading = signal(true);
  error = signal('');

  auditLogs = signal<any[]>([]);
  page = signal(1);
  limit = 8;
  totalPages = signal(1);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');

    this.adminService.getAuditLogs({ page: this.page(), limit: this.limit }).subscribe({
      next: (res: any) => {
        this.auditLogs.set(res.logs || []);
        this.totalPages.set(res.pagination?.totalPages || 1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load audit logs');
        this.loading.set(false);
      }
    });
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }
}

