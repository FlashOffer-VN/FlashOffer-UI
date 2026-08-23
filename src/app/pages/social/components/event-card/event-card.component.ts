// components/event-card/event-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialEvent } from '@core/models/social.model';

@Component({
    selector: 'app-event-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="event-card">
            <div class="event-card__image">
                <img [src]="event.image" [alt]="event.title">
                <span class="event-type">{{ event.type === 'online' ? 'Online' : 'Offline' }}</span>
            </div>
            <div class="event-card__content">
                <h3>{{ event.title }}</h3>
                <p>{{ event.description }}</p>
                <div class="event-card__info">
                    <span><i class="fas fa-calendar"></i> {{ event.date | date:'dd/MM/yyyy HH:mm' }}</span>
                    <span><i class="fas fa-map-marker-alt"></i> {{ event.location }}</span>
                </div>
                <div class="event-card__participants">
                    <span>{{ event.currentParticipants }}/{{ event.maxParticipants }}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="(event.currentParticipants / event.maxParticipants) * 100"></div>
                    </div>
                </div>
                <button class="register-btn" [class.registered]="event.isRegistered" (click)="register.emit(event)">
                    {{ event.isRegistered ? 'Đã đăng ký' : 'Đăng ký' }}
                </button>
            </div>
        </div>
    `,
    styles: [`
        .event-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.3s ease;
        }
        .event-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .event-card__image {
            position: relative;
            height: 160px;
        }
        .event-card__image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .event-card__image .event-type {
            position: absolute;
            top: 12px;
            right: 12px;
            padding: 4px 12px;
            background: rgba(0,0,0,0.6);
            color: white;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
        }
        .event-card__content { padding: 16px; }
        .event-card__content h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1F2937;
            margin: 0 0 4px;
        }
        .event-card__content p {
            font-size: 13px;
            color: #6B7280;
            margin: 0 0 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .event-card__info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 12px;
            color: #6B7280;
            margin-bottom: 12px;
        }
        .event-card__info i { width: 16px; }
        .event-card__participants { margin-bottom: 12px; }
        .event-card__participants span {
            font-size: 13px;
            color: #6B7280;
        }
        .progress-bar {
            height: 4px;
            background: #e5e7eb;
            border-radius: 4px;
            margin-top: 4px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #7C3AED, #A78BFA);
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .register-btn {
            width: 100%;
            padding: 8px;
            border: 1px solid #7C3AED;
            border-radius: 8px;
            background: transparent;
            color: #7C3AED;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .register-btn:hover {
            background: #7C3AED;
            color: white;
        }
        .register-btn.registered {
            background: #d1fae5;
            border-color: #10B981;
            color: #059669;
        }
    `]
})
export class EventCardComponent {
    @Input() event!: SocialEvent;
    @Output() register = new EventEmitter<SocialEvent>();
}