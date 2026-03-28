import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth';
import { apiPath } from '../api-path';

export interface AdminOverviewResponse {
  stats: {
    totalUsers: number;
    totalAdmins: number;
    totalListings: number;
    activeListings: number;
    claimedListings: number;
    totalPosts: number;
    totalRequests: number;
    pendingRequests: number;
  };
  activity: Array<{ day: string; count: number }>;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = apiPath('/api/admin');
  
  // State management
  private usersSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private currentPageSubject = new BehaviorSubject<number>(1);
  private totalPagesSubject = new BehaviorSubject<number>(1);

  // Public observables
  users$ = this.usersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  currentPage$ = this.currentPageSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getOverview(): Observable<AdminOverviewResponse> {
    return this.http.get<AdminOverviewResponse>(`${this.apiUrl}/overview`, { headers: this.getHeaders() });
  }

  getActivity(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity`, { headers: this.getHeaders() });
  }

  getActivityPaged(params: { page?: number; limit?: number; search?: string }): Observable<any> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return this.http.get(`${this.apiUrl}/activity?${query.toString()}`, { headers: this.getHeaders() });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  getUsersPaged(params: { page?: number; limit?: number; search?: string }): Observable<any> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    return this.http.get(`${this.apiUrl}/users?${query.toString()}`, { headers: this.getHeaders() });
  }

  getAuditLogs(params: { page?: number; limit?: number }): Observable<any> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    return this.http.get(`${this.apiUrl}/audit-logs?${query.toString()}`, { headers: this.getHeaders() });
  }

  updateUserRole(userId: string, role: 'student' | 'moderator' | 'admin'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}/role`, { role }, { headers: this.getHeaders() });
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/moderation/posts/${postId}`, { headers: this.getHeaders() });
  }

  deleteListing(listingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/moderation/listings/${listingId}`, { headers: this.getHeaders() });
  }

  // User management methods
  loadUsers(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.getUsersPaged({ page: this.currentPageSubject.value }).subscribe({
      next: (response) => {
        this.usersSubject.next(response.users || []);
        this.totalPagesSubject.next(response.totalPages || 1);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next(error.message || 'Failed to load users');
        this.loadingSubject.next(false);
      }
    });
  }

  toggleUserStatus(userId: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}/status`, { isActive }, { headers: this.getHeaders() });
  }

  searchUsers(searchQuery: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.getUsersPaged({ page: 1, search: searchQuery }).subscribe({
      next: (response) => {
        this.usersSubject.next(response.users || []);
        this.totalPagesSubject.next(response.totalPages || 1);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next(error.message || 'Failed to search users');
        this.loadingSubject.next(false);
      }
    });
  }

  nextPage(): void {
    const current = this.currentPageSubject.value;
    const total = this.totalPagesSubject.value;
    if (current < total) {
      this.currentPageSubject.next(current + 1);
      this.loadUsers();
    }
  }

  prevPage(): void {
    const current = this.currentPageSubject.value;
    if (current > 1) {
      this.currentPageSubject.next(current - 1);
      this.loadUsers();
    }
  }
}
