import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-add-data-popup',
  templateUrl: './add-data-popup.component.html',
  standalone: true,
  imports: [
    MatDialogTitle,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatCheckbox,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatButton,
    MatLabel
  ],
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
