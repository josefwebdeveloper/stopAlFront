import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ImageUploadResponse {
  message: string;
  imageId: string;
  url: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    weight: number | null;
    weightDate: Date | null;
  };
}

export interface Image {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  createdAt: Date | null;
  weight: number | null;
  weightDate: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('user') ? 
        JSON.parse(localStorage.getItem('user') || '{}')?.token : ''}`
    });
  }

  uploadImage(imageFile: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post<ImageUploadResponse>(
      `${environment.apiUrl}/api/upload-image`,
      formData,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getImages(): Observable<{ message: string, images: Image[] }> {
    return this.http.get<{ message: string, images: Image[] }>(
      `${environment.apiUrl}/api/images`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  deleteImage(imageId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/api/images/${imageId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
} 