import { Component } from '@angular/core';

@Component({
    selector: 'app-contact-floating',
    standalone: true,
    templateUrl: './contact-floating.component.html',
    styleUrls: ['./contact-floating.component.css']
})
export class ContactFloatingComponent {
    phone = '0363656223';
    phoneDisplay = '0363 656 223';
    email = 'doitacketnoi@gmail.com';
}
