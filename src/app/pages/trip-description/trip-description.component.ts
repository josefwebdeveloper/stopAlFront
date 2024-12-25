import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
  private readonly SCROLL_SPEED = 1; // pixels per interval
  private readonly SCROLL_INTERVAL = 30; // milliseconds

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  private startAutoScroll() {
    this.scrollInterval = setInterval(() => {
      const container = this.contentContainer.nativeElement;
      const maxScroll = container.scrollHeight - container.clientHeight;

      if (this.currentPosition >= maxScroll) {
        this.currentPosition = 0;
      } else {
        this.currentPosition += this.SCROLL_SPEED;
      }

      container.scrollTop = this.currentPosition;
    }, this.SCROLL_INTERVAL);
  }

  private stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }
}
