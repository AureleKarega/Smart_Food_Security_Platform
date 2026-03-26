import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-listings',
  imports: [DatePipe, FormsModule],
  templateUrl: './admin-listings.html',
  styleUrl: './admin-listings.scss',
})
export class AdminListings implements OnInit {
  loading = signal(true);
  error = signal('');

  listings = signal<any[]>([]);
  search = signal('');
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

    this.adminService
      .getActivityPaged({ page: this.page(), limit: this.limit, search: this.search().trim() })
      .subscribe({
        next: (res: any) => {
          this.listings.set(res.recentListings || []);
          const listingsTotal = res.pagination?.listingsTotal || 0;
          this.totalPages.set(Math.max(Math.ceil(listingsTotal / this.limit), 1));
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load food listings');
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

  onSearch() {
    this.page.set(1);
    this.load();
  }

  remove(listingId: number) {
    this.adminService.deleteListing(listingId).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message || 'Failed to remove listing')
    });
  }
}

