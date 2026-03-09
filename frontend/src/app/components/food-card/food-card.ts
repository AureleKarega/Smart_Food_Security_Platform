import { Component, input, signal, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FoodListing, FoodService } from '../../services/food';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-food-card',
  imports: [DatePipe],
  templateUrl: './food-card.html',
  styleUrl: './food-card.scss',
})
export class FoodCard {
  listing = input.required<FoodListing>();
  currentListing = signal<FoodListing | null>(null);

  constructor(private foodService: FoodService, public auth: AuthService) {
    effect(() => {
      this.currentListing.set(this.listing());
    });
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      'cooked-meal': 'Cooked Meal',
      'raw-ingredients': 'Raw Ingredients',
      'snacks': 'Snacks',
      'beverages': 'Beverages',
      'baked-goods': 'Baked Goods',
      'fruits-vegetables': 'Fruits & Vegetables',
      'other': 'Other'
    };
    return labels[cat] || cat;
  }

  claim() {
    const l = this.currentListing();
    if (!this.auth.isLoggedIn() || !l) return;
    this.foodService.claimListing(l.id).subscribe({
      next: (res) => this.currentListing.set(res.listing),
      error: (err) => alert(err.error?.message || 'Failed to claim')
    });
  }

  isExpired(): boolean {
    const l = this.currentListing();
    return l ? new Date(l.expiresAt) < new Date() : false;
  }
}
