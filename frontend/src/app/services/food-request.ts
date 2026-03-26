import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface FoodRequestItem {
  id: string;
  foodName: string;
  location: string;
  status: 'pending' | 'notified' | string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class FoodRequestService {
  private apiUrl = '/api/requests';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  createRequest(data: { foodName: string; location?: string }): Observable<FoodRequestItem> {
    return this.http.post<FoodRequestItem>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  getMyRequests(): Observable<FoodRequestItem[]> {
    return this.http.get<FoodRequestItem[]>(this.apiUrl, { headers: this.getHeaders() });
  }
}
