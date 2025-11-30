import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { TabsPage } from './tabs.page';
import { AuthService } from '@core/services/auth.service';
import { WorkoutService } from '@core/services/workout.service';
import { TranslationService } from '@core/services/translation.service';
import { ActionSheetController } from '@ionic/angular/standalone';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockWorkoutService: jasmine.SpyObj<WorkoutService>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;
  let mockActionSheetController: jasmine.SpyObj<ActionSheetController>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getUser',
      'logout',
    ]);
    mockAuthService.getUser.and.returnValue(of({ uid: 'test-user-id' } as any));
    mockAuthService.logout.and.returnValue(of(void 0));

    mockWorkoutService = jasmine.createSpyObj('WorkoutService', [
      'getWorkouts',
      'createWorkout',
      'updateWorkout',
      'deleteWorkout',
    ]);
    mockWorkoutService.getWorkouts.and.returnValue(of([]));
    mockWorkoutService.createWorkout.and.returnValue(
      Promise.resolve('new-workout-id')
    );
    mockWorkoutService.updateWorkout.and.returnValue(Promise.resolve());
    mockWorkoutService.deleteWorkout.and.returnValue(Promise.resolve());

    mockTranslationService = jasmine.createSpyObj(
      'TranslationService',
      ['translate'],
      {
        currentLanguage: signal('fr'),
        translationsLoaded: signal(true),
      }
    );
    mockTranslationService.translate.and.returnValue('translated text');

    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);

    const mockActionSheet = jasmine.createSpyObj('HTMLIonActionSheetElement', [
      'present',
    ]);
    mockActionSheetController = jasmine.createSpyObj('ActionSheetController', [
      'create',
    ]);
    mockActionSheetController.create.and.returnValue(
      Promise.resolve(mockActionSheet)
    );

    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: WorkoutService, useValue: mockWorkoutService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ActionSheetController, useValue: mockActionSheetController },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should have 3 tabs', () => {
      expect(component.tabs.length).toBe(3);
    });

    it('should have workouts and stats tabs', () => {
      expect(component.tabs[0].id).toBe('workouts');
      expect(component.tabs[0].label).toBe('workouts');
      expect(component.tabs[1].id).toBe('stats');
      expect(component.tabs[1].label).toBe('stats');
      expect(component.tabs[2].id).toBe('profile');
      expect(component.tabs[2].label).toBe('profile');
    });

    it('should start at index 0', () => {
      expect(component.activeTabIndex()).toBe(0);
    });

    it('should compute activeTab correctly', () => {
      expect(component.activeTab().id).toBe('workouts');
      expect(component.activeTab().label).toBe('workouts');
    });
  });

  describe('Tab Navigation (Tap)', () => {
    it('should change active tab when clicking on a tab', () => {
      component.onTabClick(1);
      expect(component.activeTabIndex()).toBe(1);
      expect(component.activeTab().id).toBe('stats');
    });

    it('should change active tab back to first tab', () => {
      component.onTabClick(1);
      component.onTabClick(0);
      expect(component.activeTabIndex()).toBe(0);
      expect(component.activeTab().id).toBe('workouts');
    });

    it('should update activeTab computed when changing tab', () => {
      component.onTabClick(1);
      expect(component.activeTab().id).toBe('stats');
      expect(component.activeTab().label).toBe('stats');
    });
  });

  describe('Swipe Navigation', () => {
    const createTouchEvent = (
      type: string,
      screenX: number,
      screenY: number
    ): TouchEvent => {
      const touch = {
        screenX,
        screenY,
        clientX: screenX,
        clientY: screenY,
        identifier: 0,
        target: document.createElement('div'),
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        force: 0,
        pageX: screenX,
        pageY: screenY,
      } as Touch;

      return {
        type,
        changedTouches: [touch],
        touches: [touch],
        targetTouches: [touch],
        altKey: false,
        bubbles: true,
        cancelable: true,
        ctrlKey: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        metaKey: false,
        shiftKey: false,
        timeStamp: Date.now(),
        preventDefault: jasmine.createSpy('preventDefault'),
      } as unknown as TouchEvent;
    };

    describe('onTouchStart', () => {
      it('should record touch start position', () => {
        const event = createTouchEvent('touchstart', 100, 50);
        component.onTouchStart(event);
        expect(component['touchStartX']).toBe(100);
        expect(component['touchStartY']).toBe(50);
        expect(component['isSwiping']).toBe(false);
      });
    });

    describe('onTouchMove', () => {
      beforeEach(() => {
        const startEvent = createTouchEvent('touchstart', 100, 50);
        component.onTouchStart(startEvent);
      });

      it('should detect horizontal swipe when deltaX is significant', () => {
        const moveEvent = createTouchEvent('touchmove', 200, 55);
        component.onTouchMove(moveEvent);
        expect(component['isSwiping']).toBe(true);
        expect(moveEvent.preventDefault).toHaveBeenCalled();
      });

      it('should not detect swipe when movement is too small', () => {
        const moveEvent = createTouchEvent('touchmove', 105, 55);
        component.onTouchMove(moveEvent);
        expect(component['isSwiping']).toBe(false);
      });

      it('should not detect swipe when movement is primarily vertical', () => {
        const moveEvent = createTouchEvent('touchmove', 110, 200);
        component.onTouchMove(moveEvent);
        expect(component['isSwiping']).toBe(false);
      });
    });

    describe('onTouchEnd and handleSwipe', () => {
      beforeEach(() => {
        const startEvent = createTouchEvent('touchstart', 100, 50);
        component.onTouchStart(startEvent);
      });

      it('should navigate to next tab on swipe left (sufficient distance)', () => {
        const moveEvent = createTouchEvent('touchmove', 200, 50);
        component.onTouchMove(moveEvent);

        const endEvent = createTouchEvent('touchend', 0, 50);
        component.onTouchEnd(endEvent);

        expect(component.activeTabIndex()).toBe(1);
        expect(component.activeTab().id).toBe('stats');
      });

      it('should navigate to previous tab on swipe right (sufficient distance)', () => {
        component.onTabClick(1);

        const startEvent = createTouchEvent('touchstart', 100, 50);
        component.onTouchStart(startEvent);

        const moveEvent = createTouchEvent('touchmove', 50, 50);
        component.onTouchMove(moveEvent);

        const endEvent = createTouchEvent('touchend', 200, 50);
        component.onTouchEnd(endEvent);

        expect(component.activeTabIndex()).toBe(0);
        expect(component.activeTab().id).toBe('workouts');
      });

      it('should not navigate when swipe distance is insufficient', () => {
        const moveEvent = createTouchEvent('touchmove', 120, 50);
        component.onTouchMove(moveEvent);

        const endEvent = createTouchEvent('touchend', 130, 50);
        component.onTouchEnd(endEvent);

        expect(component.activeTabIndex()).toBe(0);
      });

      it('should cycle to last tab when swiping right from first tab', () => {
        const moveEvent = createTouchEvent('touchmove', 50, 50);
        component.onTouchMove(moveEvent);

        const endEvent = createTouchEvent('touchend', 200, 50);
        component.onTouchEnd(endEvent);

        expect(component.activeTabIndex()).toBe(2);
        expect(component.activeTab().id).toBe('profile');
      });

      it('should cycle to first tab when swiping left from last tab', () => {
        component.onTabClick(2);

        const startEvent = createTouchEvent('touchstart', 100, 50);
        component.onTouchStart(startEvent);

        const moveEvent = createTouchEvent('touchmove', 200, 50);
        component.onTouchMove(moveEvent);

        const endEvent = createTouchEvent('touchend', 0, 50);
        component.onTouchEnd(endEvent);

        expect(component.activeTabIndex()).toBe(0);
        expect(component.activeTab().id).toBe('workouts');
      });

      it('should reset isSwiping flag after touch end', () => {
        const moveEvent = createTouchEvent('touchmove', 200, 50);
        component.onTouchMove(moveEvent);
        expect(component['isSwiping']).toBe(true);

        const endEvent = createTouchEvent('touchend', 50, 50);
        component.onTouchEnd(endEvent);

        expect(component['isSwiping']).toBe(false);
      });

      it('should not handle swipe if not detected as swiping', () => {
        const endEvent = createTouchEvent('touchend', 110, 50);
        component.onTouchEnd(endEvent);

        expect(component.activeTabIndex()).toBe(0);
      });
    });
  });

  describe('Integration: Tap and Swipe Synchronization', () => {
    it('should maintain consistency between tap and swipe navigation', () => {
      expect(component.activeTabIndex()).toBe(0);
      component.onTabClick(1);
      expect(component.activeTabIndex()).toBe(1);

      // Navigate back to tab 0 via swipe
      const createTouchEvent = (
        type: string,
        screenX: number,
        screenY: number
      ): TouchEvent => {
        const touch = {
          screenX,
          screenY,
          clientX: screenX,
          clientY: screenY,
          identifier: 0,
          target: document.createElement('div'),
          radiusX: 0,
          radiusY: 0,
          rotationAngle: 0,
          force: 0,
          pageX: screenX,
          pageY: screenY,
        } as Touch;

        return {
          type,
          changedTouches: [touch],
          touches: [touch],
          targetTouches: [touch],
          altKey: false,
          bubbles: true,
          cancelable: true,
          ctrlKey: false,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: true,
          metaKey: false,
          shiftKey: false,
          timeStamp: Date.now(),
          preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as TouchEvent;
      };

      const startEvent = createTouchEvent('touchstart', 100, 50);
      component.onTouchStart(startEvent);

      const moveEvent = createTouchEvent('touchmove', 50, 50);
      component.onTouchMove(moveEvent);

      const endEvent = createTouchEvent('touchend', 200, 50);
      component.onTouchEnd(endEvent);

      expect(component.activeTabIndex()).toBe(0);
      expect(component.activeTab().id).toBe('workouts');
    });
  });
});
