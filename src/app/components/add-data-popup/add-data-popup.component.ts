import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-data-popup',
  templateUrl: './add-data-popup.component.html',
  styleUrls: ['./add-data-popup.component.scss']
})
export class AddDataPopupComponent {
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

  onSubmit() {
    if (this.entryForm.valid) {
      this.dialogRef.close(this.entryForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 