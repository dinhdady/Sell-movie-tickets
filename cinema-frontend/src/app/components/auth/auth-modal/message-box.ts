import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message && message.length > 0" class="message" [ngClass]="type">
      <ng-container [ngSwitch]="type">
        <span *ngSwitchCase="'success'" class="icon-success">✔️</span>
        <span *ngSwitchCase="'error'" class="icon-error">❌</span>
      </ng-container>
      {{ message }}
    </div>
  `,
  styleUrls: ['./auth-modal.scss']
})
export class MessageBox {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
} 