// partner-steps/partner-steps.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface Step {
  label: string; 
  icon: string;
}

@Component({
  selector: 'app-partner-steps',
  standalone: true,
  imports: [CommonModule, TranslateModule],  
  templateUrl: './partner-steps.component.html',  
  styleUrls: ['./partner-steps.component.css']  
})
export class PartnerStepsComponent {
  @Input() currentStep = 1;
  @Input() totalSteps = 4;

  steps: Step[] = [
    { label: 'PARTNER.STEP_1_TITLE', icon: 'fa-regular fa-user' },
    { label: 'PARTNER.STEP_2_TITLE', icon: 'fa-regular fa-building' },
    { label: 'PARTNER.STEP_3_TITLE', icon: 'fa-regular fa-chart-bar' },
    { label: 'PARTNER.STEP_4_TITLE', icon: 'fa-regular fa-check-circle' }
  ];

  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  isStepCompleted(step: number): boolean {
    return this.currentStep > step;
  }
}