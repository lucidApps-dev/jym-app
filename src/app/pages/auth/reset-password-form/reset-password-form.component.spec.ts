import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular/standalone';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ResetPasswordFormComponent } from './reset-password-form.component';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';

describe('ResetPasswordFormComponent', () => {
  let component: ResetPasswordFormComponent;
  let fixture: ComponentFixture<ResetPasswordFormComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLoadingController: jasmine.SpyObj<LoadingController>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['resetPassword']);
    mockAuthService.resetPassword.and.returnValue(of(void 0));

    const mockLoading = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    mockLoadingController = jasmine.createSpyObj('LoadingController', ['create']);
    mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));

    mockTranslationService = jasmine.createSpyObj('TranslationService', ['translate'], {
      currentLanguage: signal('fr'),
      translationsLoaded: signal(true),
    });
    mockTranslationService.translate.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [ResetPasswordFormComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when email is empty', () => {
      component.resetPasswordForm.patchValue({ email: '' });
      expect(component.resetPasswordForm.invalid).toBeTrue();
      expect(component.resetPasswordForm.get('email')?.hasError('required')).toBeTrue();
    });

    it('should mark form as invalid when email format is invalid', () => {
      component.resetPasswordForm.patchValue({ email: 'invalid-email' });
      component.resetPasswordForm.get('email')?.markAsTouched();
      fixture.detectChanges();
      
      expect(component.resetPasswordForm.get('email')?.invalid).toBeTrue();
      expect(component.resetPasswordForm.get('email')?.hasError('email')).toBeTrue();
    });

    it('should return correct error keys for email validation', () => {
      const emailControl = component.resetPasswordForm.get('email');
      
      // Test required error
      emailControl?.setValue('');
      emailControl?.markAsTouched();
      fixture.detectChanges();
      expect(component.emailErrorKey).toBe('auth.emailRequired');
      
      // Test email format error
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();
      expect(component.emailErrorKey).toBe('auth.emailInvalid');
      
      // Test no error when valid
      emailControl?.setValue('valid@example.com');
      emailControl?.markAsTouched();
      fixture.detectChanges();
      expect(component.emailErrorKey).toBeNull();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      const mockLoading = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
      mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));
    });

    it('should call authService.resetPassword when form is valid', async () => {
      component.resetPasswordForm.patchValue({ email: 'test@example.com' });
      
      await component.onSubmit();
      
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should not submit when form is invalid', async () => {
      component.resetPasswordForm.patchValue({ email: '' });
      
      await component.onSubmit();
      
      expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
    });

    it('should set success message and reset form on successful reset', async () => {
      component.resetPasswordForm.patchValue({ email: 'test@example.com' });
      
      await component.onSubmit();
      await fixture.whenStable();
      
      expect(component.successMessage()).toBe('auth.resetPasswordSuccess');
      expect(component.resetPasswordForm.get('email')?.value).toBeNull();
    });

    it('should set error message on reset password failure', async () => {
      component.resetPasswordForm.patchValue({ email: 'test@example.com' });
      
      const error = { code: 'auth/user-not-found', message: 'User not found' };
      mockAuthService.resetPassword.and.returnValue(throwError(() => error));
      
      await component.onSubmit();
      await fixture.whenStable();
      
      expect(component.errorMessage()).toBeTruthy();
      expect(component.successMessage()).toBeNull();
    });
  });

  describe('State and Behavior', () => {
    it('should disable form when isLoading is true', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      
      expect(component.resetPasswordForm.disabled).toBeTrue();
    });

    it('should show loading indicator during submission', async () => {
      component.resetPasswordForm.patchValue({ email: 'test@example.com' });
      
      const mockLoading = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
      mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));
      
      const submitPromise = component.onSubmit();
      
      expect(component.isLoading()).toBeTrue();
      expect(mockLoadingController.create).toHaveBeenCalled();
      
      await submitPromise;
      await fixture.whenStable();
    });

    it('should clear error and success messages when submitting', async () => {
      component.errorMessage.set('some error');
      component.successMessage.set('some success');
      component.resetPasswordForm.patchValue({ email: 'test@example.com' });
      
      await component.onSubmit();
      await fixture.whenStable();
      
      expect(component.successMessage()).toBe('auth.resetPasswordSuccess');
    });
  });
});

