import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatusTabItem {
    key: string;
    label: string;
    icon?: string;
    count?: number;
}

@Component({
    selector: 'app-status-tabs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './status-tabs.component.html',
    styleUrls: ['./status-tabs.component.css']
})
export class StatusTabsComponent {
    @Input() items: StatusTabItem[] = [];
    @Input() active = '';
    @Output() change = new EventEmitter<string>();

    onSelect(key: string): void {
        if (key === this.active) return;
        this.change.emit(key);
    }
}