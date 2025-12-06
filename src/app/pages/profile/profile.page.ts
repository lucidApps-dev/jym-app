import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';
import { WorkoutService } from '@core/services/workout.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'jym-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    TranslatePipe,
  ],
  standalone: true,
})
export class ProfilePage {
  readonly hideHeader = input<boolean>(false);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly authService = inject(AuthService);
  private readonly workoutService = inject(WorkoutService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);

  private readonly user$ = toSignal(this.authService.getUser(), {
    initialValue: null,
  });

  readonly userEmail = computed(() => this.user$()?.email ?? '');
  readonly userInitial = computed(() => {
    const email = this.userEmail();
    if (!email) {
      return '?';
    }
    return email.trim().charAt(0).toUpperCase();
  });

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/auth');
    });
  }

  onSettings(): void {
    // TODO: Implémenter les paramètres
  }

  onNavigateToWorkouts(): void {
    this.router.navigate(['/workouts']);
  }

  async onDeleteAccount(): Promise<void> {
    const user = this.user$();

    if (!user?.uid) {
      this.error.set(
        this.translationService.translate('profile.errors.userNotConnected')
      );
      return;
    }

    const confirmMessage = this.translationService.translate(
      'profile.deleteAccount.confirm'
    );
    const confirmed = confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.workoutService.deleteAllWorkouts(user.uid);
      await this.authService.deleteAccount(user);

      this.router.navigateByUrl('/auth');
    } catch (error) {
      this.error.set(
        this.translationService.translate('profile.errors.deleteAccount')
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
