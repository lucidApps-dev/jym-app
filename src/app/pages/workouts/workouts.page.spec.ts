import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular/standalone';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { WorkoutsPage } from './workouts.page';
import { AuthService } from '@app/core/services/auth.service';
import { WorkoutService } from '@app/core/services/workout.service';
import { TranslationService } from '@app/core/services/translation.service';

describe('WorkoutsPage', () => {
  let component: WorkoutsPage;
  let fixture: ComponentFixture<WorkoutsPage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockWorkoutService: jasmine.SpyObj<WorkoutService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActionSheetController: jasmine.SpyObj<ActionSheetController>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

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

    mockTranslationService = jasmine.createSpyObj(
      'TranslationService',
      ['translate'],
      {
        currentLanguage: signal('fr'),
        translationsLoaded: signal(true),
      }
    );
    mockTranslationService.translate.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [WorkoutsPage],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: WorkoutService, useValue: mockWorkoutService },
        { provide: Router, useValue: mockRouter },
        { provide: ActionSheetController, useValue: mockActionSheetController },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose hasWorkouts as false when there are no workouts', () => {
    expect(component.hasWorkouts()).toBeFalse();
  });

  it('should expose hasWorkouts as true when workouts exist', async () => {
    const mockWorkouts = [
      { id: '1', name: 'Force', exercises: [] },
      { id: '2', name: 'Push Day', exercises: [] },
    ];
    mockWorkoutService.getWorkouts.and.returnValue(of(mockWorkouts));
    mockAuthService.getUser.and.returnValue(of({ uid: 'test-user-id' } as any));

    const newFixture = TestBed.createComponent(WorkoutsPage);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    await newFixture.whenStable();

    expect(newComponent.hasWorkouts()).toBeTrue();
    expect(newComponent.workouts().length).toBe(2);
  });

  it('should toggle workout modal state', () => {
    component.onCreateWorkout();
    expect(component.isWorkoutModalOpen()).toBeTrue();

    component.closeWorkoutModal();
    expect(component.isWorkoutModalOpen()).toBeFalse();
  });

  it('should create workout when form emits payload', async () => {
    component.onCreateWorkout();
    expect(component.isWorkoutModalOpen()).toBeTrue();

    await component.onWorkoutCreated({
      name: 'Push Day',
      exercises: [],
    });

    expect(mockWorkoutService.createWorkout).toHaveBeenCalledWith(
      'test-user-id',
      jasmine.objectContaining({
        name: 'Push Day',
        exercises: [],
      })
    );
    expect(component.isWorkoutModalOpen()).toBeFalse();
  });
});
