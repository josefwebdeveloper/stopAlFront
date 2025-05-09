import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Output() imageUploaded = new EventEmitter<string>();
  
  imageFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;

  constructor(
    private imageService: ImageService,
    private dialogRef: MatDialogRef<ImageUploadComponent>
  ) {}

  handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.imageFile = target.files[0];
      this.createImagePreview();
    }
  }

  createImagePreview(): void {
    if (!this.imageFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(this.imageFile);
  }

  resetImage(): void {
    this.imageFile = null;
    this.previewUrl = null;
    this.dialogRef.close();
  }

  uploadImage(): void {
    if (!this.imageFile) {
      return;
    }

    this.isUploading = true;

    this.imageService.uploadImage(this.imageFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.imageUploaded.emit(response.url);
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.isUploading = false;
      }
    });
  }
} 