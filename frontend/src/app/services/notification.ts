import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface NotificationItem {
  id: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = '/api/notifications';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  markAsRead(notificationId: string): Observable<NotificationItem> {
    return this.http.patch<NotificationItem>(
      `${this.apiUrl}/${notificationId}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
