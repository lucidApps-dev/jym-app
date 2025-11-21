import { CommonModule } from '@angular/common';
import { Component, input, output, signal, inject, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logoGoogle, logoApple, chevronForwardOutline, helpCircleOutline } from 'ionicons/icons';
import {
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonSpinner,
    IonIcon,
    LoadingController,
    Platform,
  } from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { getAuthErrorMessage } from '../../../core/utils/auth.utils';
import { markFormGroupTouched } from '../../../core/utils/form.utils';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

export type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonSpinner,
    IonIcon,
    ButtonComponent,
    FormErrorComponent,
    TranslatePipe,
  ],
})
export class AuthFormComponent {
  mode = input.required<AuthMode>();
  authSuccess = output<void>();
  openResetPassword = output<void>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loadingController = inject(LoadingController);
  private readonly platform = inject(Platform);
  public readonly translationService = inject(TranslationService);

  public readonly authForm: FormGroup;
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly titleKey = () => this.mode() === 'login' ? 'auth.login' : 'auth.createAccount';
  public readonly submitButtonKey = () => this.mode() === 'login' ? 'auth.login' : 'auth.register';
  public readonly googleButtonKey = () => this.mode() === 'login' ? 'auth.signInWithGoogle' : 'auth.signUpWithGoogle';
  public readonly appleButtonKey = () => this.mode() === 'login' ? 'auth.signInWithApple' : 'auth.signUpWithApple';
  public readonly formId = () => `${this.mode()}-form`;
  public readonly emailInputId = () => `${this.mode()}-email`;
  public readonly passwordInputId = () => `${this.mode()}-password`;
  public readonly emailErrorId = () => `${this.mode()}-email-error`;
  public readonly passwordErrorId = () => `${this.mode()}-password-error`;
  public readonly formErrorId = () => `${this.mode()}-form-error`;
  public readonly isIphone = () => this.platform.is('ios');

  constructor() {
    addIcons({ logoGoogle, logoApple, chevronForwardOutline, helpCircleOutline });
    
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    effect(() => {
      if (this.isLoading()) {
        this.authForm.disable();
      } else {
        this.authForm.enable();
      }
    });
  }

  get emailErrorKey(): string | null {
    const emailControl = this.authForm.get('email');
    if (!emailControl?.touched || !emailControl.invalid) {
      return null;
    }

    if (emailControl.errors?.['required']) {
      return 'auth.emailRequired';
    }
    if (emailControl.errors?.['email']) {
      return 'auth.emailInvalid';
    }

    return null;
  }

  get passwordErrorKey(): string | null {
    const passwordControl = this.authForm.get('password');
    if (!passwordControl?.touched || !passwordControl.invalid) {
      return null;
    }

    if (passwordControl.errors?.['required']) {
      return 'auth.passwordRequired';
    }
    if (passwordControl.errors?.['minlength']) {
      return 'auth.passwordMinLength';
    }

    return null;
  }

  async onGoogleSignIn(): Promise<void> {
     // TODO: Implement Google Sign In
     this.errorMessage.set(this.translationService.translate('auth.errors.googleSignInNotImplemented'));
  }

  async onAppleSignIn(): Promise<void> {
    // TODO: Implement Apple Sign In
    this.errorMessage.set(this.translationService.translate('auth.errors.appleSignInNotImplemented'));
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      markFormGroupTouched(this.authForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const loading = await this.loadingController.create({
      message: this.translationService.translate(
        this.mode() === 'login' ? 'auth.loading.login' : 'auth.loading.register'
      ),
    });
    
    await loading.present();

    const { email, password } = this.authForm.value;

    try {
      if (this.mode() === 'login') {
        this.authService.login(email, password).subscribe({
          next: async () => {
            await loading.dismiss();
            this.authSuccess.emit();
            this.router.navigateByUrl('/tabs');
          },
          error: async (error) => {
            await loading.dismiss();
            const errorMessage = getAuthErrorMessage(error?.code || error?.message || '') || 'auth.errors.loginFailed';
            this.errorMessage.set(errorMessage);
          },
        });
      } else {
        this.authService.register(email, password).subscribe({
          next: async () => {
            await loading.dismiss();
            this.authSuccess.emit();
            this.router.navigateByUrl('/tabs');
          },
          error: async (error) => {
            await loading.dismiss();
            const errorMessage = getAuthErrorMessage(error?.code || error?.message || '') || 'auth.errors.registerFailed';
            this.errorMessage.set(errorMessage);
          },
        });
      }
    } catch (error: any) {
      await loading.dismiss();
      const errorMessage = getAuthErrorMessage(error?.code || error?.message || '') || 'auth.errors.genericError';
      this.errorMessage.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }
}

