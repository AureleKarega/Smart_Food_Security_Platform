import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface FoodListing {
  _id: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  servings: number;
  dietaryInfo: string[];
  allergens: string;
  expiresAt: string;
  pickupLocation: string;
  pickupInstructions: string;
  imageUrl: string;
  status: string;
  donor: { _id: string; name: string; avatar: string };
  claimedBy: any;
  co2Saved: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private apiUrl = 'http://localhost:3000/api/food';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getAllListings(params?: { category?: string; search?: string }): Observable<{ listings: FoodListing[] }> {
    let url = this.apiUrl;
    const queryParams: string[] = [];
    if (params?.category) queryParams.push(`category=${params.category}`);
    if (params?.search) queryParams.push(`search=${params.search}`);
    if (queryParams.length) url += '?' + queryParams.join('&');
    return this.http.get<{ listings: FoodListing[] }>(url);
  }

  getListingById(id: string): Observable<{ listing: FoodListing }> {
    return this.http.get<{ listing: FoodListing }>(`${this.apiUrl}/${id}`);
  }

  createListing(data: Partial<FoodListing>): Observable<{ listing: FoodListing }> {
    return this.http.post<{ listing: FoodListing }>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  claimListing(id: string): Observable<{ listing: FoodListing }> {
    return this.http.put<{ listing: FoodListing }>(`${this.apiUrl}/${id}/claim`, {}, { headers: this.getHeaders() });
  }

  deleteListing(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getStats(): Observable<{ stats: any }> {
    return this.http.get<{ stats: any }>(`${this.apiUrl}/stats`);
  }
}
