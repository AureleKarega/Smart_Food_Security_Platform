import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FoodRequestItem, FoodRequestService } from '../../services/food-request';

@Component({
  selector: 'app-food-request',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './food-request.html',
  styleUrl: './food-request.scss',
})
export class FoodRequest implements OnInit {
  form = {
    foodName: '',
    location: ''
  };

  requests = signal<FoodRequestItem[]>([]);
  loading = signal(true);
  submitting = signal(false);
  error = signal('');

  constructor(
    public auth: AuthService,
    private foodRequestService: FoodRequestService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadRequests();
  }

  loadRequests() {
    this.loading.set(true);
    this.error.set('');

    this.foodRequestService.getMyRequests().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load your requests');
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (!this.form.foodName.trim()) {
      this.error.set('Food name is required');
      return;
    }

    this.error.set('');
    this.submitting.set(true);

    this.foodRequestService
      .createRequest({
        foodName: this.form.foodName.trim(),
        location: this.form.location.trim()
      })
      .subscribe({
        next: () => {
          this.form.foodName = '';
          this.form.location = '';
          this.submitting.set(false);
          this.loadRequests();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to submit request');
          this.submitting.set(false);
        }
      });
  }
}
