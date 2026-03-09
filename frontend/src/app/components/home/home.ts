import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FoodService, FoodListing } from '../../services/food';
import { FoodCard } from '../food-card/food-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FoodCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  featuredListings: FoodListing[] = [];
  stats = { totalListings: 0, claimedListings: 0, totalUsers: 0, totalCo2Saved: 0, totalServings: 0 };

  constructor(private foodService: FoodService) {}

  ngOnInit() {
    this.foodService.getAllListings().subscribe({
      next: (res) => this.featuredListings = res.listings.slice(0, 3),
      error: () => this.featuredListings = []
    });
    this.foodService.getStats().subscribe({
      next: (res) => this.stats = res.stats,
      error: () => {}
    });
  }
}
