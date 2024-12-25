import { Component } from '@angular/core';
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
export class TripDescriptionComponent {
  tripHighlights = [
    { icon: 'landscape', text: 'Beautiful cross-country skiing trails in Lavaze' },
    { icon: 'hotel', text: 'Cozy stay at Casa al portico Val di Cembra' },
    { icon: 'schedule', text: 'Trip dates: January 31-February 10, 2025' },
    { icon: 'group', text: '2 adults, 1 child' }
  ];

  // Add your uploaded images
  images = [
    'assets/italy/2.png',
    'assets/italy/22.jpeg',
    'assets/italy/33.jpg',
    'assets/italy/44.jpg'
  ];
}
