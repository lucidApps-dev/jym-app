import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonModal,
  IonButtons,
  IonButton,
  IonIcon,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, chevronForwardOutline, helpCircleOutline } from 'ionicons/icons';

import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';
import { AuthFormComponent } from '@pages/auth/auth-form/auth-form.component';
import { ResetPasswordFormComponent } from '@pages/auth/reset-password-form/reset-password-form.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CarouselComponent, CarouselImage } from '@shared/components/carousel/carousel.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonModal,
    IonButtons,
    IonButton,
    IonIcon,
    CarouselComponent,
    AuthFormComponent,
    ResetPasswordFormComponent,
    ButtonComponent,
    TranslatePipe,
  ],
})
export class AuthPage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastController = inject(ToastController);
  private readonly loadingController = inject(LoadingController);
  public readonly translationService = inject(TranslationService);

  public readonly isLoginModalOpen = signal<boolean>(false);
  public readonly isRegisterModalOpen = signal<boolean>(false);
  public readonly isResetPasswordModalOpen = signal<boolean>(false);

  public readonly carouselImages = signal<CarouselImage[]>([]);

  constructor() {
    addIcons({ close, chevronForwardOutline, helpCircleOutline });
    
    effect(() => {
      this.translationService.translationsLoaded();
      this.translationService.currentLanguage();
      this.updateCarouselImages();
    });
  }

  async ngOnInit(): Promise<void> {
    const biometricAvailable = await this.authService.isBiometricAvailable();
    const hasBiometricCredentials = await this.authService.hasBiometricCredentials();

    if (hasBiometricCredentials && biometricAvailable) {
      setTimeout(() => {
        this.tryBiometricLogin();
      }, 300);
    }
  }

  async tryBiometricLogin(): Promise<void> {
    const biometricAvailable = await this.authService.isBiometricAvailable();
    const hasBiometricCredentials = await this.authService.hasBiometricCredentials();

    if (!biometricAvailable || !hasBiometricCredentials) {
      return;
    }

    const loading = await this.loadingController.create({
      message: this.translationService.translate('auth.biometricAuthentication'),
    });
  
    await loading.present();

    try {
      await this.authService.loginWithBiometric();
      await loading.dismiss();
      await this.onAuthSuccess();
    } catch (error: any) {
      await loading.dismiss();
      // Don't show error if the user has cancelled
      if (error?.message && !error.message.includes('cancel')) {
        const toast = await this.toastController.create({
          message: this.translationService.translate('auth.biometricAuthenticationError'),
          duration: 3000,
          color: 'danger',
        });
        await toast.present();
      }
    }
  }

  private updateCarouselImages(): void {
    this.carouselImages.set([
      {
        url: 'assets/images/auth-bg-3.jpg',
        alt: this.translationService.translate('carousel.slide1.alt'),
        title: this.translationService.translate('carousel.slide1.title'),
      },
      {
        url: 'assets/images/auth-bg-3.jpg',
        alt: this.translationService.translate('carousel.slide2.alt'),
        title: this.translationService.translate('carousel.slide2.title'),
      },
      {
        url: 'assets/images/auth-bg-3.jpg',
        alt: this.translationService.translate('carousel.slide3.alt'),
        title: this.translationService.translate('carousel.slide3.title'),
      },
    ]);
  }

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
  }

  openRegisterModal(): void {
    this.isRegisterModalOpen.set(true);
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen.set(false);
  }

  openResetPasswordModal(): void {
    this.isResetPasswordModalOpen.set(true);
  }

  closeResetPasswordModal(): void {
    this.isResetPasswordModalOpen.set(false);
  }

  async onAuthSuccess(): Promise<void> {
    this.isLoginModalOpen.set(false);
    this.isRegisterModalOpen.set(false);
    await this.router.navigate(['/tabs']);
  }
}
