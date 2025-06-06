import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Post } from '../../../models/post.model';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  error = '';

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.postService.getPosts()
      .subscribe(
        posts => {
          this.posts = posts;
          this.posts.forEach(
            post => post.imageUrl = 'https://iasa-bucket.s3.eu-north-1.amazonaws.com/post-images/' + post.id
          );
          this.loading = false;
        },
        error => {
          this.error = error.error.message || 'Failed to load posts';
          this.loading = false;
        }
      );
  }

  likePost(post: Post) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.postService.likePost(post.id)
      .subscribe(
        () => {
          post.liked = !post.liked;
          if (post.liked) {
            post.likes = (post.likes || 0) + 1;
          } else {
            post.likes = (post.likes || 1) - 1;
          }
        },
        error => {
          this.error = error.error.message || 'Failed to like post';
        }
      );
  }

  createPost() {
    this.router.navigate(['/posts/create']);
  }

  viewPost(postId: string) {
    this.router.navigate(['/posts', postId]);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
