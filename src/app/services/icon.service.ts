import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.registerIcons();
  }

  private registerIcons(): void {
    const icons = [
      { name: 'twitter', path: 'assets/icons/twitter.svg' },
      { name: 'instagram', path: 'assets/icons/instagram.svg' },
      { name: 'pinterest', path: 'assets/icons/pinterest.svg' },
      { name: 'tiktok', path: 'assets/icons/tiktok.svg' },
      { name: 'reddit', path: 'assets/icons/reddit.svg' }
    ];

    icons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(
        icon.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
  }
} 