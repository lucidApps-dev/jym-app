import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    CommonModule,
  ],
  standalone: true,
})
export class Tab1Page {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user$ = this.authService.getUser();

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/auth');
    });
  }
}
