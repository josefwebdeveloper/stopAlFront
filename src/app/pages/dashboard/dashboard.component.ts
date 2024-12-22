import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AddDataPopupComponent } from '../../components/add-data-popup/add-data-popup.component';

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
export class DashboardComponent {
  constructor(private dialog: MatDialog) {}

  openAddDataPopup() {
    const dialogRef = this.dialog.open(AddDataPopupComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the result - maybe refresh dashboard data
        console.log('Entry added:', result);
      }
    });
  }
}
