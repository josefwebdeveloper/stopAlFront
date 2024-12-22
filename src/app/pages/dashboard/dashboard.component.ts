import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AddDataPopupComponent } from '../../components/add-data-popup/add-data-popup.component';
import { AuthService } from '../../services/auth.service';
import { EntryData } from '../../interfaces/entry-data.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ]
})
export class DashboardComponent implements OnInit {
  dashboardData: EntryData[] = [];
  latestEntry?: EntryData;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.authService.getEntries().subscribe({
      next: (entries) => {
        this.dashboardData = entries;
        this.latestEntry = entries[0]; // Assuming entries are sorted by date
        console.log('Loaded entries:', entries);
      },
      error: (error) => {
        console.error('Error loading entries:', error);
        if (error.status === 401) {
          this.authService.loginWithGoogle();
        }
      }
    });
  }

  openAddDataPopup() {
    const dialogRef = this.dialog.open(AddDataPopupComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: EntryData | undefined) => {
      if (result) {
        this.authService.addEntry(result).subscribe({
          next: (response) => {
            console.log('Entry added successfully:', response);
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('Error adding entry:', error);
            if (error.status === 401) {
              // Not authenticated
              this.authService.loginWithGoogle();
            }
          }
        });
      }
    });
  }
}
