import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FoodService, FoodListing } from '../../services/food';
import { FoodCard } from '../food-card/food-card';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink, FoodCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  listings: FoodListing[] = [];
  filteredListings: FoodListing[] = [];
  searchTerm = '';
  selectedCategory = '';
  loading = true;

  categories = [
    { value: '', label: 'All Categories' },
    { value: 'cooked-meal', label: 'Cooked Meals' },
    { value: 'raw-ingredients', label: 'Raw Ingredients' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'baked-goods', label: 'Baked Goods' },
    { value: 'fruits-vegetables', label: 'Fruits & Vegetables' },
    { value: 'other', label: 'Other' },
  ];

  constructor(private foodService: FoodService) {}

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.loading = true;
    const params: any = {};
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.searchTerm) params.search = this.searchTerm;

    this.foodService.getAllListings(params).subscribe({
      next: (res) => {
        this.listings = res.listings;
        this.filteredListings = res.listings;
        this.loading = false;
      },
      error: () => {
        this.listings = [];
        this.filteredListings = [];
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.loadListings();
  }

  onCategoryChange() {
    this.loadListings();
  }
}
