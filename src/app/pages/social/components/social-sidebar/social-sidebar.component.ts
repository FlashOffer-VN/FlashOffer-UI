// components/social-sidebar/social-sidebar.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialMember, SocialEvent, SocialGroup } from '@core/models/social.model';

@Component({
    selector: 'app-social-sidebar',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
        <!-- Online Members -->
        <div class="sidebar-card">
            <h3><i class="fas fa-circle online-dot"></i> {{ 'SOCIAL.ONLINE' | translate }}</h3>
            <div class="online-members">
                <div *ngFor="let member of onlineMembers" class="online-member">
                    <img [src]="member.avatar" [alt]="member.name">
                    <div>
                        <span class="name">{{ member.name }}</span>
                        <span class="role">{{ member.role }}</span>
                    </div>
                    <span class="online-status"></span>
                </div>
            </div>
        </div>

        <!-- Upcoming Events -->
        <div class="sidebar-card">
            <h3><i class="fas fa-calendar-alt"></i> {{ 'SOCIAL.UPCOMING_EVENTS' | translate }}</h3>
            <div *ngFor="let event of events | slice:0:2" class="event-item">
                <div class="event-date">
                    <span class="day">{{ event.date | date:'dd' }}</span>
                    <span class="month">{{ event.date | date:'MMM' }}</span>
                </div>
                <div class="event-info">
                    <span class="title">{{ event.title }}</span>
                    <span class="location"><i class="fas fa-map-marker-alt"></i> {{ event.location }}</span>
                </div>
            </div>
        </div>

        <!-- Popular Groups -->
        <div class="sidebar-card">
            <h3><i class="fas fa-layer-group"></i> {{ 'SOCIAL.POPULAR_GROUPS' | translate }}</h3>
            <div *ngFor="let group of groups | slice:0:3" class="group-item">
                <i [class]="group.icon"></i>
                <div>
                    <span class="name">{{ group.name }}</span>
                    <span class="members">{{ group.members }} thành viên</span>
                </div>
                <button class="join-btn" [class.joined]="group.isJoined" (click)="joinGroup.emit(group)">
                    {{ group.isJoined ? 'Đã tham gia' : 'Tham gia' }}
                </button>
            </div>
        </div>
    `,
    styles: [`
        .social-sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .sidebar-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .sidebar-card h3 {
            font-size: 15px;
            font-weight: 700;
            color: #1F2937;
            margin: 0 0 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .sidebar-card h3 .online-dot {
            color: #10B981;
            font-size: 10px;
        }
        .online-members {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .online-member {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .online-member img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
        }
        .online-member .name {
            font-size: 14px;
            font-weight: 500;
            color: #1F2937;
            display: block;
        }
        .online-member .role {
            font-size: 12px;
            color: #6B7280;
        }
        .online-member .online-status {
            margin-left: auto;
            width: 8px;
            height: 8px;
            background: #10B981;
            border-radius: 50%;
        }
        .event-item {
            display: flex;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .event-item:last-child { border-bottom: none; }
        .event-date {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 48px;
            background: #f3f4f6;
            border-radius: 8px;
            padding: 4px 8px;
        }
        .event-date .day {
            font-size: 18px;
            font-weight: 700;
            color: #1F2937;
        }
        .event-date .month {
            font-size: 11px;
            color: #6B7280;
            text-transform: uppercase;
        }
        .event-info .title {
            font-size: 14px;
            font-weight: 500;
            color: #1F2937;
            display: block;
        }
        .event-info .location {
            font-size: 12px;
            color: #6B7280;
        }
        .group-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .group-item:last-child { border-bottom: none; }
        .group-item i {
            font-size: 24px;
            color: #7C3AED;
            width: 36px;
            text-align: center;
        }
        .group-item .name {
            font-size: 14px;
            font-weight: 500;
            color: #1F2937;
            display: block;
        }
        .group-item .members {
            font-size: 12px;
            color: #6B7280;
        }
        .group-item .join-btn {
            margin-left: auto;
            padding: 4px 14px;
            border: 1px solid #7C3AED;
            border-radius: 999px;
            background: transparent;
            color: #7C3AED;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .group-item .join-btn:hover {
            background: #7C3AED;
            color: white;
        }
        .group-item .join-btn.joined {
            background: #d1fae5;
            border-color: #10B981;
            color: #059669;
        }
        @media (max-width: 992px) {
            .social-sidebar {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 16px;
            }
        }
        @media (max-width: 768px) {
            .social-sidebar { grid-template-columns: 1fr; }
        }
    `]
})
export class SocialSidebarComponent {
    @Input() members: SocialMember[] = [];
    @Input() events: SocialEvent[] = [];
    @Input() groups: SocialGroup[] = [];

    @Output() joinGroup = new EventEmitter<SocialGroup>();

    get onlineMembers(): SocialMember[] {
        return this.members.filter(m => m.isOnline);
    }
}