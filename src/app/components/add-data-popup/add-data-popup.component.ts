import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogModule, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    selector: 'app-add-data-popup',
    templateUrl: './add-data-popup.component.html',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatButtonModule,
        MatNativeDateModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions
    ],
    styleUrls: ['./add-data-popup.component.scss']
})
export class AddDataPopupComponent implements OnInit {
  entryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDataPopupComponent>
  ) {
    this.entryForm = this.fb.group({
      weight: [''],
      sleep: [''],
      alcohol: [false],
      alcoholPrice: [''],
      activityCalories: [''],
      date: [new Date()]
    });
  }

  ngOnInit() {
    this.entryForm = this.fb.group({
      weight: ['', { updateOn: 'blur' }],
      sleep: ['', { updateOn: 'blur' }],
      alcohol: [false],
      alcoholPrice: ['', { updateOn: 'blur' }],
      activityCalories: ['', { updateOn: 'blur' }],
      date: [new Date()]
    });
  }

  onSubmit() {
    if (this.entryForm.valid) {
      this.dialogRef.close(this.entryForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
