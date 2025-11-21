import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular/standalone';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AuthFormComponent, AuthMode } from './auth-form.component';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';

describe('AuthFormComponent', () => {
  let component: AuthFormComponent;
  let fixture: ComponentFixture<AuthFormComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLoadingController: jasmine.SpyObj<LoadingController>;
  let mockPlatform: jasmine.SpyObj<Platform>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'register']);
    mockAuthService.login.and.returnValue(of({} as any));
    mockAuthService.register.and.returnValue(of({} as any));

    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);

    const mockLoading = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    mockLoadingController = jasmine.createSpyObj('LoadingController', ['create']);
    mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));

    mockPlatform = jasmine.createSpyObj('Platform', ['is']);
    mockPlatform.is.and.returnValue(false);

    mockTranslationService = jasmine.createSpyObj('TranslationService', ['translate'], {
      currentLanguage: signal('fr'),
      translationsLoaded: signal(true),
    });
    mockTranslationService.translate.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [AuthFormComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: Platform, useValue: mockPlatform },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mode', 'login' as AuthMode);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when email is empty', () => {
      component.authForm.patchValue({ email: '', password: 'password123' });
      expect(component.authForm.invalid).toBeTrue();
      expect(component.authForm.get('email')?.hasError('required')).toBeTrue();
    });

    it('should mark form as invalid when email format is invalid', () => {
      component.authForm.patchValue({ email: 'invalid-email', password: 'password123' });
      component.authForm.get('email')?.markAsTouched();
      fixture.detectChanges();
      
      expect(component.authForm.get('email')?.invalid).toBeTrue();
      expect(component.authForm.get('email')?.hasError('email')).toBeTrue();
    });

    it('should mark form as invalid when password is empty', () => {
      component.authForm.patchValue({ email: 'test@example.com', password: '' });
      expect(component.authForm.invalid).toBeTrue();
      expect(component.authForm.get('password')?.hasError('required')).toBeTrue();
    });

    it('should mark form as invalid when password is too short', () => {
      component.authForm.patchValue({ email: 'test@example.com', password: '12345' });
      component.authForm.get('password')?.markAsTouched();
      fixture.detectChanges();
      
      expect(component.authForm.get('password')?.invalid).toBeTrue();
      expect(component.authForm.get('password')?.hasError('minlength')).toBeTrue();
    });

    it('should return correct error keys for email validation', () => {
      const emailControl = component.authForm.get('email');
      
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

    it('should return correct error keys for password validation', () => {
      const passwordControl = component.authForm.get('password');
      
      // Test required error
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();
      fixture.detectChanges();
      expect(component.passwordErrorKey).toBe('auth.passwordRequired');
      
      // Test minlength error
      passwordControl?.setValue('12345');
      passwordControl?.markAsTouched();
      fixture.detectChanges();
      expect(component.passwordErrorKey).toBe('auth.passwordMinLength');
      
      // Test no error when valid
      passwordControl?.setValue('password123');
      passwordControl?.markAsTouched();
      fixture.detectChanges();
      expect(component.passwordErrorKey).toBeNull();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      const mockLoading = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
      mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));
    });

    it('should call authService.login when mode is login and form is valid', async () => {
      fixture.componentRef.setInput('mode', 'login' as AuthMode);
      component.authForm.patchValue({ email: 'test@example.com', password: 'password123' });
      
      await component.onSubmit();
      
      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should call authService.register when mode is register and form is valid', async () => {
      fixture.componentRef.setInput('mode', 'register' as AuthMode);
      component.authForm.patchValue({ email: 'test@example.com', password: 'password123' });
      
      await component.onSubmit();
      
      expect(mockAuthService.register).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should not submit when form is invalid', async () => {
      component.authForm.patchValue({ email: '', password: '' });
      
      await component.onSubmit();
      
      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should emit authSuccess and navigate on successful login', async () => {
      fixture.componentRef.setInput('mode', 'login' as AuthMode);
      component.authForm.patchValue({ email: 'test@example.com', password: 'password123' });
      
      spyOn(component.authSuccess, 'emit');
      
      await component.onSubmit();
      
      await fixture.whenStable();
      
      expect(component.authSuccess.emit).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/tabs');
    });

    it('should emit authSuccess and navigate on successful register', async () => {
      fixture.componentRef.setInput('mode', 'register' as AuthMode);
      component.authForm.patchValue({ email: 'test@example.com', password: 'password123' });
      
      spyOn(component.authSuccess, 'emit');
      
      await component.onSubmit();

      await fixture.whenStable();
      
      expect(component.authSuccess.emit).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/tabs');
    });

    it('should set error message on login failure', async () => {
      fixture.componentRef.setInput('mode', 'login' as AuthMode);
      component.authForm.patchValue({ email: 'test@example.com', password: 'password123' });
      
      const error = { code: 'auth/invalid-credential', message: 'Invalid credential' };
      mockAuthService.login.and.returnValue(throwError(() => error));
      
      await component.onSubmit();
      
      await fixture.whenStable();
      
      expect(component.errorMessage()).toBeTruthy();
    });

    it('should set error message on register failure', async () => {
      fixture.componentRef.setInput('mode', 'register' as AuthMode);
      component.authForm.patchValue({ email: 'test@example.com', password: 'password123' });
      
      const error = { code: 'auth/email-already-in-use', message: 'Email already in use' };
      mockAuthService.register.and.returnValue(throwError(() => error));
      
      await component.onSubmit();
      
      await fixture.whenStable();
      
      expect(component.errorMessage()).toBeTruthy();
    });
  });

  describe('State and Behavior', () => {
    it('should disable form when isLoading is true', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      
      expect(component.authForm.disabled).toBeTrue();
    });

    it('should show loading indicator during submission', async () => {
      fixture.componentRef.setInput('mode', 'login' as AuthMode);
      component.authForm.patchValue({ email: 'test@example.com', password: 'password123' });
      
      const mockLoading = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
      mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));
      
      const submitPromise = component.onSubmit();
      
      expect(component.isLoading()).toBeTrue();
      expect(mockLoadingController.create).toHaveBeenCalled();
      
      await submitPromise;
      await fixture.whenStable();
    });

    it('should display Apple button only on iOS platform', () => {
      // Test non-iOS
      mockPlatform.is.and.returnValue(false);
      fixture.detectChanges();
      expect(component.isIphone()).toBeFalse();
      
      // Test iOS
      mockPlatform.is.and.returnValue(true);
      fixture.detectChanges();
      expect(component.isIphone()).toBeTrue();
    });
  });
});

