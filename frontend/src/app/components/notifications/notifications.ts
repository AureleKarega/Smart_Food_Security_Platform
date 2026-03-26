import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NotificationItem, NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  imports: [RouterLink, DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  notifications = signal<NotificationItem[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(
    public auth: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading.set(true);
    this.error.set('');

    this.notificationService.getNotifications().subscribe({
      next: (items) => {
        this.notifications.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load notifications');
        this.loading.set(false);
      }
    });
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
        );
      },
      error: () => {}
    });
  }
}
