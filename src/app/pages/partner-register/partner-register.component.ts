// pages/partner-register/partner-register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AppService } from '../../core/services/app.service';
import { PartnerRegisterService } from './services/partner-register.service';
import { PartnerHeroComponent } from './components/partner-hero/partner-hero.component';
import { PartnerStepsComponent } from './components/partner-steps/partner-steps.component';
import { PartnerFormComponent } from './components/partner-form/partner-form.component';

@Component({
    selector: 'app-partner-register',
    standalone: true,
    imports: [
        CommonModule,
        PartnerHeroComponent,
        PartnerStepsComponent,
        PartnerFormComponent
    ],
    template: `
    <div class="partner-register-container">
      <app-partner-hero></app-partner-hero>

      <section class="partner-form-section">
        <div class="partner-form-wrapper">
          <app-partner-steps
            [currentStep]="currentStep"
            [totalSteps]="totalSteps">
          </app-partner-steps>

          <app-partner-form
            [currentStep]="currentStep"
            [totalSteps]="totalSteps"
            [isLoading]="isLoading"
            (stepChange)="onStepChange($event)"
            (submit)="onSubmit()">
          </app-partner-form>
        </div>
      </section>
    </div>
  `,
    styles: [`
    .partner-register-container {
      min-height: 100vh;
      background: #f8fafc;
    }

    .partner-form-section {
      max-width: 900px;
      margin: -2rem auto 4rem;
      padding: 0 1.5rem;
      position: relative;
      z-index: 2;
    }

    .partner-form-wrapper {
      background: white;
      border-radius: 1.5rem;
      padding: 2.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 768px) {
      .partner-form-wrapper {
        padding: 1.5rem;
      }
    }
  `]
})
export class PartnerRegisterComponent {
    currentStep = 1;
    totalSteps = 3;
    isLoading = false;

    constructor(
        private _appService: AppService,
        private partnerService: PartnerRegisterService,
        private router: Router
    ) { }

    onStepChange(step: number): void {
        this.currentStep = step;
    }

    onSubmit(): void {
        this.isLoading = true;

        // Lấy dữ liệu từ form (sẽ được emit từ PartnerFormComponent)
        // Ở đây giả định form data được lấy từ service hoặc event

        // Giả lập API call
        setTimeout(() => {
            this.isLoading = false;
            this._appService.showSuccess('Đăng ký đối tác thành công!');
            this.router.navigate(['/home']);
        }, 2000);
    }
}