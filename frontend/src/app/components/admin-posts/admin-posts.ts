import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-posts',
  imports: [DatePipe, FormsModule],
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.scss',
})
export class AdminPosts implements OnInit {
  loading = signal(true);
  error = signal('');

  posts = signal<any[]>([]);
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
          this.posts.set(res.recentPosts || []);
          const postsTotal = res.pagination?.postsTotal || 0;
          this.totalPages.set(Math.max(Math.ceil(postsTotal / this.limit), 1));
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load community posts');
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

  remove(postId: number) {
    this.adminService.deletePost(postId).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message || 'Failed to remove post')
    });
  }
}

