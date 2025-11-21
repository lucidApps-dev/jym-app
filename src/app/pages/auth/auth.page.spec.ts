import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular/standalone';
import { signal } from '@angular/core';

import { AuthPage } from './auth.page';
import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';

describe('AuthPage', () => {
  let component: AuthPage;
  let fixture: ComponentFixture<AuthPage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockLoadingController: jasmine.SpyObj<LoadingController>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'isBiometricAvailable',
      'hasBiometricCredentials',
      'loginWithBiometric',
    ]);
    mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(false));
    mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(false));
    mockAuthService.loginWithBiometric.and.returnValue(Promise.resolve({} as any));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockToastController.create.and.returnValue(Promise.resolve(mockToast));

    const mockLoading = jasmine.createSpyObj('HTMLIonLoadingElement', ['present', 'dismiss']);
    mockLoadingController = jasmine.createSpyObj('LoadingController', ['create']);
    mockLoadingController.create.and.returnValue(Promise.resolve(mockLoading));

    mockTranslationService = jasmine.createSpyObj('TranslationService', ['translate'], {
      currentLanguage: signal('fr'),
      translationsLoaded: signal(true),
    });
    mockTranslationService.translate.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastController, useValue: mockToastController },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Modal Management', () => {
    it('should open login modal', () => {
      component.openLoginModal();
      expect(component.isLoginModalOpen()).toBeTrue();
    });

    it('should close login modal', () => {
      component.isLoginModalOpen.set(true);
      component.closeLoginModal();
      expect(component.isLoginModalOpen()).toBeFalse();
    });

    it('should open register modal', () => {
      component.openRegisterModal();
      expect(component.isRegisterModalOpen()).toBeTrue();
    });

    it('should close register modal', () => {
      component.isRegisterModalOpen.set(true);
      component.closeRegisterModal();
      expect(component.isRegisterModalOpen()).toBeFalse();
    });

    it('should open reset password modal', () => {
      component.openResetPasswordModal();
      expect(component.isResetPasswordModalOpen()).toBeTrue();
    });

    it('should close reset password modal', () => {
      component.isResetPasswordModalOpen.set(true);
      component.closeResetPasswordModal();
      expect(component.isResetPasswordModalOpen()).toBeFalse();
    });
  });

  describe('Auth Success', () => {
    it('should close modals and navigate on auth success', async () => {
      component.isLoginModalOpen.set(true);
      component.isRegisterModalOpen.set(true);
      
      await component.onAuthSuccess();
      
      expect(component.isLoginModalOpen()).toBeFalse();
      expect(component.isRegisterModalOpen()).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs']);
    });
  });

  describe('Biometric Login', () => {
    it('should not attempt biometric login if not available', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(false));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(true));
      
      await component.tryBiometricLogin();
      
      expect(mockAuthService.loginWithBiometric).not.toHaveBeenCalled();
    });

    it('should not attempt biometric login if no credentials', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(true));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(false));
      
      await component.tryBiometricLogin();
      
      expect(mockAuthService.loginWithBiometric).not.toHaveBeenCalled();
    });

    it('should attempt biometric login if available and has credentials', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(true));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(true));
      
      await component.tryBiometricLogin();
      
      expect(mockAuthService.loginWithBiometric).toHaveBeenCalled();
      expect(mockLoadingController.create).toHaveBeenCalled();
    });

    it('should handle biometric login success', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(true));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(true));
      
      const onAuthSuccessSpy = spyOn(component, 'onAuthSuccess').and.returnValue(Promise.resolve());
      
      await component.tryBiometricLogin();
      
      expect(onAuthSuccessSpy).toHaveBeenCalled();
    });

    it('should show error toast on biometric login failure', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(true));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(true));
      mockAuthService.loginWithBiometric.and.returnValue(
        Promise.reject({ message: 'Authentication failed' })
      );
      
      await component.tryBiometricLogin();
      
      expect(mockToastController.create).toHaveBeenCalled();
    });

    it('should not show error toast if user cancelled biometric login', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(true));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(true));
      mockAuthService.loginWithBiometric.and.returnValue(
        Promise.reject({ message: 'User cancelled' })
      );
      
      await component.tryBiometricLogin();
      
      expect(mockToastController.create).not.toHaveBeenCalled();
    });
  });

  describe('Carousel Images', () => {
    it('should have carousel images initialized', () => {
      expect(component.carouselImages().length).toBe(3);
      expect(component.carouselImages()[0].url).toBe('assets/images/auth-bg-3.jpg');
    });

    it('should have translated alt and title for carousel images', () => {
      const images = component.carouselImages();
      expect(images[0].alt).toBe('translated text');
      expect(images[0].title).toBe('translated text');
      expect(images[1].alt).toBe('translated text');
      expect(images[1].title).toBe('translated text');
      expect(images[2].alt).toBe('translated text');
      expect(images[2].title).toBe('translated text');
    });
  });

  describe('ngOnInit', () => {
    it('should attempt biometric login if available and has credentials', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(true));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(true));
      
      spyOn(component, 'tryBiometricLogin');
      
      await component.ngOnInit();
      
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(component.tryBiometricLogin).toHaveBeenCalled();
    });

    it('should not attempt biometric login if not available', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(false));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(true));
      
      spyOn(component, 'tryBiometricLogin');
      
      await component.ngOnInit();
      
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(component.tryBiometricLogin).not.toHaveBeenCalled();
    });

    it('should not attempt biometric login if no credentials', async () => {
      mockAuthService.isBiometricAvailable.and.returnValue(Promise.resolve(true));
      mockAuthService.hasBiometricCredentials.and.returnValue(Promise.resolve(false));
      
      spyOn(component, 'tryBiometricLogin');
      
      await component.ngOnInit();
      
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(component.tryBiometricLogin).not.toHaveBeenCalled();
    });
  });
});

