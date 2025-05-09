import { Component, EventEmitter, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageService } from '../../services/image.service';
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImageCropperModule
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent {
  @Output() imageUploaded = new EventEmitter<string>();
  
  imageChangedEvent: Event | null = null;
  croppedImage: string | null = null;
  isUploading = false;

  constructor(
    private imageService: ImageService,
    private dialogRef: MatDialogRef<ImageCropperComponent>
  ) {}

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64 || '';
  }

  loadImageFailed(): void {
    console.error('Image load failed');
    // Show error notification
  }

  resetImage(): void {
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.dialogRef.close();
  }

  async uploadImage(): Promise<void> {
    if (!this.croppedImage) {
      return;
    }

    this.isUploading = true;

    try {
      // Convert base64 to blob
      const blob = this.dataURItoBlob(this.croppedImage);
      const file = new File([blob], 'progress-photo.png', { type: 'image/png' });

      // Upload image
      this.imageService.uploadImage(file).subscribe({
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
    } catch (error) {
      console.error('Error processing image:', error);
      this.isUploading = false;
    }
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  }
} 