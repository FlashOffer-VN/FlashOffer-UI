import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { DemoComponent } from './pages/demo/demo.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: '/demo', pathMatch: 'full' },
            { path: 'demo', component: DemoComponent },
            { path: '**', redirectTo: '/demo' }
        ]
    }
];