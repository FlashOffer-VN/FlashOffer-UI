// step-confirmation/step-confirmation.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { InputComponent } from '../../../../shared/components/input/input.component';
import { PartnerSummaryComponent } from '../partner-summary/partner-summary.component';
import { AppService } from '@core/services/app.service';

@Component({
  selector: 'app-step-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    InputComponent,
    PartnerSummaryComponent
  ],
  templateUrl: './step-confirmation.component.html',
  styleUrls: ['./step-confirmation.component.css']
})
export class StepConfirmationComponent {
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
    if (errors['requiredTrue']) {
      return this._appService.instant('VALIDATION.REQUIRED_TRUE');
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
    if (errors['email']) {
      return this._appService.instant('VALIDATION.EMAIL');
    }
    if (errors['pattern']) {
      return this._appService.instant('VALIDATION.PATTERN');
    }

    return this._appService.instant('VALIDATION.INVALID');
  }
}