import { CommonModule } from '@angular/common';
import { Component, signal, inject, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonInput,
  IonItem,
  IonLabel,
  LoadingController,
} from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { getAuthErrorMessage } from '../../../core/utils/auth.utils';
import { markFormGroupTouched } from '../../../core/utils/form.utils';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonInput,
    IonItem,
    IonLabel,
    ButtonComponent,
    FormErrorComponent,
    TranslatePipe,
  ],
})
export class ResetPasswordFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly loadingController = inject(LoadingController);
  public readonly translationService = inject(TranslationService);

  public readonly resetPasswordForm: FormGroup;
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);

  constructor() {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    effect(() => {
      if (this.isLoading()) {
        this.resetPasswordForm.disable();
      } else {
        this.resetPasswordForm.enable();
      }
    });
  }

  get emailErrorKey(): string | null {
    const emailControl = this.resetPasswordForm.get('email');
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

  async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.invalid) {
      markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const loading = await this.loadingController.create({
      message: this.translationService.translate('auth.loading.resetPassword'),
    });

    await loading.present();

    const { email } = this.resetPasswordForm.value;

    try {
      this.authService.resetPassword(email).subscribe({
        next: async () => {
          await loading.dismiss();
          this.successMessage.set('auth.resetPasswordSuccess');
          this.resetPasswordForm.reset();
        },
        error: async (error) => {
          await loading.dismiss();
          const errorMessage = getAuthErrorMessage(error?.code || error?.message || '') || 'auth.errors.resetPasswordFailed';
          this.errorMessage.set(errorMessage);
        },
      });
    } catch (error: any) {
      await loading.dismiss();
      const errorMessage = getAuthErrorMessage(error?.code || error?.message || '') || 'auth.errors.genericError';
      this.errorMessage.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }
}

