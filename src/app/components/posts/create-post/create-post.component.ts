import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit {
  postForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      image: [null]
    });
  }

  get f() { return this.postForm.controls; }

  onFileChange(event: Event) {
    const inputElement = (event.target as HTMLInputElement);
    const file = inputElement.files && inputElement.files[0];
    if (file) {
      this.postForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.postForm.invalid) {
      return;
    }

    this.loading = true;

    const userId = this.authService.currentUserValue.id;
    const postPayload = {
      userId: userId,
      text: this.f.content.value
    };

    const formData = new FormData();
    formData.append('post', new Blob([JSON.stringify(postPayload)], { type: 'application/json' }));

    if (this.f.image.value) {
      formData.append('image', this.f.image.value);
    }

    this.postService.createPost(formData).subscribe({
      next: () => {
        this.router.navigate(['/posts']);
      },
      error: error => {
        this.error = error.error.message || 'Failed to create post';
        this.loading = false;
      }
    });
  }

  cancelCreate() {
    this.router.navigate(['/posts']);
  }
}
