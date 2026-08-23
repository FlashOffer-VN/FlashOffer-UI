import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'avatar',
    standalone: true
})
export class AvatarPipe implements PipeTransform {
    transform(avatar?: string): string {
        return avatar || 'assets/avatars/avatar.jpg';
    }
}