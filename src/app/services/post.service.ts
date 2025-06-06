import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';
import { Comment } from '../models/comment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost/posts';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createPost(formData: FormData): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, formData, { headers });
  }

  likePost(postId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/like`, {}, { headers: this.getHeaders() });
  }

  addComment(postId: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/${postId}/comments`,
      { content },
      { headers: this.getHeaders() }
    );
  }

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`, { headers: this.getHeaders() });
  }
}
