// components/partner-steps/partner-steps.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Step {
    label: string;
    icon: string;
}

@Component({
    selector: 'app-partner-steps',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="partner-steps">
      <div class="partner-steps__bar">
        <div
          class="partner-steps__progress"
          [style.width.%]="((currentStep - 1) / (totalSteps - 1)) * 100">
        </div>
      </div>
      <div class="partner-steps__items">
        @for (step of steps; track $index) {
          <div
            class="partner-step"
            [class.active]="isStepActive($index + 1)"
            [class.completed]="isStepCompleted($index + 1)">
            <div class="partner-step__circle">
              @if (isStepCompleted($index + 1)) {
                <i class="fa-solid fa-check"></i>
              } @else {
                <i [class]="step.icon"></i>
              }
            </div>
            <span class="partner-step__label">{{ step.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .partner-steps {
      margin-bottom: 2.5rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .partner-steps__bar {
      position: relative;
      height: 4px;
      background: #e5e7eb;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .partner-steps__progress {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #7C3AED, #A78BFA);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .partner-steps__items {
      display: flex;
      justify-content: space-between;
      position: relative;
    }

    .partner-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .partner-step__circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      background: #e5e7eb;
      color: #6B7280;
      border: 3px solid transparent;
    }

    .partner-step.active .partner-step__circle {
      background: #7C3AED;
      color: white;
      border-color: #7C3AED;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }

    .partner-step.completed .partner-step__circle {
      background: #10B981;
      color: white;
      border-color: #10B981;
    }

    .partner-step__label {
      font-size: 0.75rem;
      color: #6B7280;
      font-weight: 500;
      text-align: center;
      transition: color 0.3s ease;
    }

    .partner-step.active .partner-step__label {
      color: #7C3AED;
      font-weight: 600;
    }

    .partner-step.completed .partner-step__label {
      color: #10B981;
    }

    @media (max-width: 768px) {
      .partner-step__label {
        font-size: 0.6rem;
      }

      .partner-step__circle {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .partner-steps__items {
        gap: 0.5rem;
      }

      .partner-step__label {
        display: none;
      }
    }
  `]
})
export class PartnerStepsComponent {
    @Input() currentStep = 1;
    @Input() totalSteps = 3;

    steps: Step[] = [
        { label: 'Thông tin cá nhân', icon: 'fa-regular fa-user' },
        { label: 'Thông tin doanh nghiệp', icon: 'fa-regular fa-building' },
        { label: 'Xác nhận đăng ký', icon: 'fa-regular fa-check-circle' }
    ];

    isStepActive(step: number): boolean {
        return this.currentStep === step;
    }

    isStepCompleted(step: number): boolean {
        return this.currentStep > step;
    }
}