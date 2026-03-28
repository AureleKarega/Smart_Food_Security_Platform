import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-food-requests',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './admin-food-requests.html',
  styleUrl: './admin-food-requests.scss',
})
export class AdminFoodRequests implements OnInit {
  loading = signal(true);
  error = signal('');
  requests = signal<any[]>([]);
  statusFilter = signal<'all' | 'pending' | 'approved' | 'rejected' | 'notified'>('pending');
  page = signal(1);
  limit = 12;
  totalPages = signal(1);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.adminService
      .getFoodRequests({
        page: this.page(),
        limit: this.limit,
        status: this.statusFilter()
      })
      .subscribe({
        next: (res: any) => {
          this.requests.set(res.requests || []);
          this.totalPages.set(res.pagination?.totalPages || 1);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load food requests');
          this.loading.set(false);
        }
      });
  }

  onFilterChange() {
    this.page.set(1);
    this.load();
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

  approve(req: { id: string }) {
    this.error.set('');
    this.adminService.approveFoodRequest(req.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message || 'Approve failed')
    });
  }

  reject(req: { id: string }) {
    const reason = window.prompt('Optional reason (sent to the user in a notification):', '') ?? '';
    this.error.set('');
    this.adminService.rejectFoodRequest(req.id, reason.trim()).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message || 'Reject failed')
    });
  }
}
