import { Component, Input } from '@angular/core';
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
  @Input() listing!: FoodListing;

  constructor(private foodService: FoodService, public auth: AuthService) {}

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
    if (!this.auth.isLoggedIn()) return;
    this.foodService.claimListing(this.listing._id).subscribe({
      next: (res) => this.listing = res.listing,
      error: (err) => alert(err.error?.message || 'Failed to claim')
    });
  }

  isExpired(): boolean {
    return new Date(this.listing.expiresAt) < new Date();
  }
}
