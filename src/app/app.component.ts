import { Component, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  form: FormGroup;
  counter: number;

  constructor(private fb: FormBuilder) {
    this.form = fb.group({
      counter: ['', [Validators.required, Validators.min(5), Validators.max(10)]],
    });
  }

}
