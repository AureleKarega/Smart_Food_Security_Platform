import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface CommunityPost {
  _id: string;
  author: { _id: string; name: string; avatar: string };
  content: string;
  type: string;
  likes: string[];
  comments: { author: { _id: string; name: string }; content: string; createdAt: string }[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private apiUrl = 'http://localhost:3000/api/community';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getAllPosts(type?: string): Observable<{ posts: CommunityPost[] }> {
    const url = type ? `${this.apiUrl}?type=${type}` : this.apiUrl;
    return this.http.get<{ posts: CommunityPost[] }>(url);
  }

  createPost(data: { content: string; type: string }): Observable<{ post: CommunityPost }> {
    return this.http.post<{ post: CommunityPost }>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  likePost(id: string): Observable<{ post: CommunityPost }> {
    return this.http.put<{ post: CommunityPost }>(`${this.apiUrl}/${id}/like`, {}, { headers: this.getHeaders() });
  }

  addComment(id: string, content: string): Observable<{ post: CommunityPost }> {
    return this.http.post<{ post: CommunityPost }>(`${this.apiUrl}/${id}/comment`, { content }, { headers: this.getHeaders() });
  }
}
