// step-personal/step-personal.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { InputComponent } from '../../../../shared/components/input/input.component';
import { AppService } from '@core/services/app.service';  // ✅ Import AppService

@Component({
  selector: 'app-step-personal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent
  ],
  templateUrl: './step-personal.component.html',
  styleUrls: ['./step-personal.component.css']
})
export class StepPersonalComponent {
  @Input() formGroup!: FormGroup;

  constructor(private _appService: AppService) { } 

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    // ✅ Dùng AppService để dịch
    if (errors['required']) {
      return this._appService.instant('VALIDATION.REQUIRED');
    }
    if (errors['email']) {
      return this._appService.instant('VALIDATION.EMAIL');
    }
    if (errors['minlength']) {
      return this._appService.instant('VALIDATION.MIN_LENGTH', {
        length: errors['minlength'].requiredLength
      });
    }
    if (errors['maxlength']) {
      return this._appService.instant('VALIDATION.MAX_LENGTH', {
        length: errors['maxlength'].requiredLength
      });
    }
    if (errors['pattern']) {
      if (fieldName === 'phone') {
        return this._appService.instant('VALIDATION.PATTERN_PHONE');
      }
      return this._appService.instant('VALIDATION.PATTERN');
    }

    return this._appService.instant('VALIDATION.INVALID');
  }
}