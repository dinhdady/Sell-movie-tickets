import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './components/shared/header/header';
import { Footer } from './components/shared/footer/footer';
import { NotificationComponent } from './components/shared/notification/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Header, Footer, NotificationComponent],
  template: `
    <app-header *ngIf="!isAdminRoute()"></app-header>
    <main [class.admin-main]="isAdminRoute()">
      <router-outlet></router-outlet>
    </main>
    <app-footer *ngIf="!isAdminRoute()"></app-footer>
    <app-notification></app-notification>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 140px);
    }
    main.admin-main {
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'cinema-frontend';

  constructor(private router: Router) {}

  isAdminRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/admin');
  }
} 