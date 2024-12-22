import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AddDataPopupComponent } from '../../components/add-data-popup/add-data-popup.component';
import { AuthService } from '../../services/auth.service';
import { EntryData } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ]
})
export class DashboardComponent implements OnInit {
  dashboardData: EntryData[] = [];

  constructor(
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // TODO: Implement getEntries endpoint and service method
    // this.authService.getEntries().subscribe((entries: EntryData[]) => {
    //   this.dashboardData = entries;
    // });
  }

  openAddDataPopup() {
    const dialogRef = this.dialog.open(AddDataPopupComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: EntryData | undefined) => {
      if (result) {
        this.authService.addEntry(result).subscribe({
          next: (response: EntryData) => {
            console.log('Entry added successfully:', response);
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('Error adding entry:', error);
            // TODO: Add error handling/user notification
          }
        });
      }
    });
  }
}
