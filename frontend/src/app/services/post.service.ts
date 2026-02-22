import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, PostCreate, Comment, CommentCreate } from '../models/post.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`);
  }

  createPost(post: PostCreate): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, post, {
      headers: this.getHeaders()
    });
  }

  createComment(postId: number, comment: CommentCreate): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/posts/${postId}/comments`, comment, {
      headers: this.getHeaders()
    });
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/like`, {}, {
      headers: this.getHeaders()
    });
  }

  moderatePost(postId: number, isMisleading: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/moderate`, null, {
      headers: this.getHeaders(),
      params: { is_misleading: isMisleading.toString() }
    });
  }
}

