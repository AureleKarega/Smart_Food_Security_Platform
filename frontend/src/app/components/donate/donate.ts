import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FoodService } from '../../services/food';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-donate',
  imports: [FormsModule],
  templateUrl: './donate.html',
  styleUrl: './donate.scss',
})
export class Donate {
  form = {
    title: '',
    description: '',
    category: 'cooked-meal',
    quantity: '',
    servings: 1,
    dietaryInfo: [] as string[],
    allergens: '',
    expiresAt: '',
    pickupLocation: '',
    pickupInstructions: ''
  };
  error = '';
  submitting = false;

  dietaryOptions = ['vegetarian', 'vegan', 'halal', 'gluten-free', 'dairy-free', 'nut-free'];

  constructor(
    private foodService: FoodService,
    public auth: AuthService,
    private router: Router
  ) {}

  toggleDietary(option: string) {
    const idx = this.form.dietaryInfo.indexOf(option);
    if (idx === -1) {
      this.form.dietaryInfo.push(option);
    } else {
      this.form.dietaryInfo.splice(idx, 1);
    }
  }

  isDietarySelected(option: string): boolean {
    return this.form.dietaryInfo.includes(option);
  }

  onSubmit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.error = '';
    this.submitting = true;

    this.foodService.createListing(this.form).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create listing';
        this.submitting = false;
      }
    });
  }
}
