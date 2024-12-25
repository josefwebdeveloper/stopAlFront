import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-trip-description',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './trip-description.component.html',
  styleUrls: ['./trip-description.component.scss']
})
export class TripDescriptionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('contentContainer') contentContainer!: ElementRef;

  tripHighlights = [
    { icon: 'landscape', text: 'Beautiful cross-country skiing trails in Lavaze' },
    { icon: 'hotel', text: 'Cozy stay at Casa al portico Val di Cembra' },
    { icon: 'schedule', text: 'Trip dates: January 31-February 10, 2025' },
    { icon: 'group', text: 'Elena, Mark, Joseph and special guest Anton' }
  ];

  images = [
    'assets/italy/2.png',
    'assets/italy/22.jpeg',
    'assets/italy/33.jpg',
    'assets/italy/44.jpg'
  ];

  private scrollInterval: any;
  private currentPosition = 0;
  private readonly SCROLL_SPEED = 0.5;
  private readonly SCROLL_INTERVAL = 16;
  private isManualScrolling = false;
  private manualScrollTimeout: any;

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.startAutoScroll();
    }, 500);
  }

  ngOnDestroy() {
    this.stopAutoScroll();
    if (this.manualScrollTimeout) {
      clearTimeout(this.manualScrollTimeout);
    }
  }

  @HostListener('wheel')
  onMouseWheel() {
    this.handleManualScroll();
  }

  @HostListener('touchstart')
  onTouchStart() {
    this.handleManualScroll();
  }

  private handleManualScroll() {
    // Stop auto-scroll when user interacts
    this.stopAutoScroll();
    this.isManualScrolling = true;

    // Clear existing timeout
    if (this.manualScrollTimeout) {
      clearTimeout(this.manualScrollTimeout);
    }

    // Resume auto-scroll after 5 seconds of no manual scrolling
    this.manualScrollTimeout = setTimeout(() => {
      this.isManualScrolling = false;
      this.currentPosition = this.contentContainer.nativeElement.scrollTop;
      this.startAutoScroll();
    }, 5000);
  }

  private startAutoScroll() {
    if (this.isManualScrolling) return;

    const container = this.contentContainer.nativeElement;
    const totalHeight = container.scrollHeight - container.clientHeight;

    this.scrollInterval = setInterval(() => {
      if (this.currentPosition >= totalHeight) {
        this.currentPosition = 0;
        container.scrollTop = 0;
      } else {
        this.currentPosition += this.SCROLL_SPEED;
        container.scrollTop = this.currentPosition;
      }
    }, this.SCROLL_INTERVAL);
  }

  private stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }
}
