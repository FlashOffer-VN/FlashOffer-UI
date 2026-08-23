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
        <div class="sidebar-card mb-2">
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
        <div class="sidebar-card mb-2">
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
        <div class="sidebar-card mb-2">
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
        /* Container - có khoảng cách giữa các card */
        .social-sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Card */
        .sidebar-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            transition: box-shadow 0.2s ease;
        }

        .sidebar-card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
            padding: 4px 0;
            border-radius: 8px;
            transition: background 0.2s ease;
            cursor: pointer;
        }

        .online-member:hover {
            background: #f3f4f6;
        }

        .online-member img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e5e7eb;
        }

        .online-member .name {
            font-size: 14px;
            font-weight: 500;
            color: #1F2937;
            display: block;
            line-height: 1.3;
        }

        .online-member .role {
            font-size: 12px;
            color: #6B7280;
            display: block;
        }

        .online-member .online-status {
            margin-left: auto;
            width: 10px;
            height: 10px;
            background: #10B981;
            border-radius: 50%;
            flex-shrink: 0;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .event-item {
            display: flex;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
            cursor: pointer;
            transition: background 0.2s ease;
            border-radius: 6px;
            padding-left: 4px;
        }

        .event-item:hover {
            background: #f8fafc;
        }

        .event-item:last-child {
            border-bottom: none;
        }

        .event-date {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 48px;
            background: #f3f4f6;
            border-radius: 8px;
            padding: 4px 8px;
            flex-shrink: 0;
        }

        .event-date .day {
            font-size: 18px;
            font-weight: 700;
            color: #1F2937;
            line-height: 1.2;
        }

        .event-date .month {
            font-size: 11px;
            color: #6B7280;
            text-transform: uppercase;
            font-weight: 600;
        }

        .event-info {
            flex: 1;
            min-width: 0;
        }

        .event-info .title {
            font-size: 14px;
            font-weight: 500;
            color: #1F2937;
            display: block;
            line-height: 1.3;
            margin-bottom: 2px;
        }

        .event-info .location {
            font-size: 12px;
            color: #6B7280;
            display: block;
        }

        .event-info .location i {
            margin-right: 4px;
            font-size: 11px;
        }

        .group-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .group-item:last-child {
            border-bottom: none;
        }

        .group-item i {
            font-size: 28px;
            color: #7C3AED;
            width: 36px;
            text-align: center;
            flex-shrink: 0;
        }

        .group-item .name {
            font-size: 14px;
            font-weight: 500;
            color: #1F2937;
            display: block;
            line-height: 1.3;
        }

        .group-item .members {
            font-size: 12px;
            color: #6B7280;
            display: block;
        }

        .group-item .join-btn {
            margin-left: auto;
            padding: 5px 16px;
            border: 1.5px solid #7C3AED;
            border-radius: 999px;
            background: transparent;
            color: #7C3AED;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .group-item .join-btn:hover {
            background: #7C3AED;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
        }

        .group-item .join-btn.joined {
            background: #d1fae5;
            border-color: #10B981;
            color: #059669;
        }

        .group-item .join-btn.joined:hover {
            background: #a7f3d0;
            border-color: #059669;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
        }

        @media (max-width: 992px) {
            .social-sidebar {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 16px;
            }

            .sidebar-card {
                padding: 16px;
            }
        }

        @media (max-width: 768px) {
            .social-sidebar {
                grid-template-columns: 1fr 1fr;
                gap: 14px;
            }

            .sidebar-card {
                padding: 14px 16px;
            }

            .online-member .name {
                font-size: 13px;
            }

            .event-info .title {
                font-size: 13px;
            }

            .group-item .name {
                font-size: 13px;
            }

            .group-item .join-btn {
                padding: 4px 12px;
                font-size: 11px;
            }
        }

        @media (max-width: 480px) {
            .social-sidebar {
                grid-template-columns: 1fr;
                gap: 12px;
            }

            .sidebar-card {
                padding: 12px 14px;
            }

            .online-member img {
                width: 32px;
                height: 32px;
            }

            .event-date {
                min-width: 40px;
                padding: 2px 6px;
            }

            .event-date .day {
                font-size: 16px;
            }

            .event-date .month {
                font-size: 10px;
            }

            .group-item i {
                font-size: 24px;
                width: 30px;
            }
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