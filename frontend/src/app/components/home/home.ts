import { Component, OnInit, signal } from '@angular/core';
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
  featuredListings = signal<FoodListing[]>([]);
  stats = signal({ totalListings: 0, claimedListings: 0, totalUsers: 0, totalCo2Saved: 0, totalServings: 0 });

  constructor(private foodService: FoodService) {}

  ngOnInit() {
    this.foodService.getAllListings().subscribe({
      next: (res) => this.featuredListings.set(res.listings.slice(0, 3)),
      error: () => this.featuredListings.set([])
    });
    this.foodService.getStats().subscribe({
      next: (res) => this.stats.set(res.stats),
      error: () => {}
    });
  }
}
