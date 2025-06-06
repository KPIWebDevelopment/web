import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post } from '../../../models/post.model';
import { Comment } from '../../../models/comment.model';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit {
  post: Post;
  loading = false;
  error = '';
  commentForm: FormGroup;
  submittingComment = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private postService: PostService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Auth check is now handled by AuthGuard
    this.commentForm = this.formBuilder.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.loadPost();
  }

  loadPost() {
    this.loading = true;
    const postId = this.route.snapshot.paramMap.get('id');

    if (!postId) {
      this.router.navigate(['/posts']);
      return;
    }

    this.postService.getPosts()
      .subscribe(
        posts => {
          const foundPost = posts.find(post => post.id === postId);
          if (foundPost) {
            this.post = foundPost;
            this.post.imageUrl = 'https://iasa-bucket.s3.eu-north-1.amazonaws.com/post-images/' + this.post.id;
          } else {
            // Post not found in the list
            if (this.authService.isLoggedIn()) {
              this.error = 'Post not found';
            } else {
              this.error = ''; // Clear any existing error
            }
          }
          this.loading = false;
        },
        error => {
          // Only show error message if user is logged in
          if (this.authService.isLoggedIn()) {
            this.error = error.error.message || 'Failed to load post';
          } else {
            this.error = ''; // Clear any existing error
          }
          this.loading = false;
        }
      );
  }

  likePost() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.postService.likePost(this.post.id)
      .subscribe(
        () => {
          this.post.liked = !this.post.liked;
          if (this.post.liked) {
            this.post.likes = (this.post.likes || 0) + 1;
          } else {
            this.post.likes = (this.post.likes || 1) - 1;
          }
        },
        error => {
          this.error = error.error.message || 'Failed to like post';
        }
      );
  }

  addComment() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.commentForm.invalid) {
      return;
    }

    this.submittingComment = true;
    const content = this.commentForm.get('content').value;

    this.postService.addComment(this.post.id, content)
      .subscribe(
        comment => {
          if (!this.post.comments) {
            this.post.comments = [];
          }
          this.post.comments.push(comment);
          this.commentForm.reset();
          this.submittingComment = false;
        },
        error => {
          this.error = error.error.message || 'Failed to add comment';
          this.submittingComment = false;
        }
      );
  }

  goBack() {
    this.router.navigate(['/posts']);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get commentContent() { return this.commentForm.get('content'); }
}
