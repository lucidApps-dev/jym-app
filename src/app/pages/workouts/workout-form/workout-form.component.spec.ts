import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Timestamp } from 'firebase/firestore';

import { WorkoutFormComponent } from './workout-form.component';
import { Workout, WorkoutExercise } from '@app/core/services/workout.service';

describe('WorkoutFormComponent', () => {
  let component: WorkoutFormComponent;
  let fixture: ComponentFixture<WorkoutFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form in create mode', () => {
      expect(component.workoutName()).toBe('');
      expect(component.exercises().length).toBe(0);
      expect(component.isEditMode()).toBeFalse();
    });

    it('should initialize with workout data in edit mode', () => {
      const mockWorkout: Workout = {
        id: 'workout-1',
        name: 'Push Day',
        exercises: [
          { id: 'ex-1', name: 'Bench Press', order: 1 },
          { id: 'ex-2', name: 'Shoulder Press', order: 2 },
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      fixture.componentRef.setInput('workout', mockWorkout);
      fixture.detectChanges();

      expect(component.workoutName()).toBe('Push Day');
      expect(component.exercises().length).toBe(2);
      expect(component.exercises()[0].name).toBe('Bench Press');
      expect(component.exercises()[1].name).toBe('Shoulder Press');
      expect(component.isEditMode()).toBeTrue();
    });

    it('should sort exercises by order when initializing', () => {
      const mockWorkout: Workout = {
        id: 'workout-1',
        name: 'Push Day',
        exercises: [
          { id: 'ex-2', name: 'Shoulder Press', order: 2 },
          { id: 'ex-1', name: 'Bench Press', order: 1 },
        ],
      };

      fixture.componentRef.setInput('workout', mockWorkout);
      fixture.detectChanges();

      expect(component.exercises()[0].name).toBe('Bench Press');
      expect(component.exercises()[1].name).toBe('Shoulder Press');
    });

    it('should reset form when workout input changes to null', () => {
      const mockWorkout: Workout = {
        id: 'workout-1',
        name: 'Push Day',
        exercises: [{ id: 'ex-1', name: 'Bench Press', order: 1 }],
      };

      fixture.componentRef.setInput('workout', mockWorkout);
      fixture.detectChanges();

      expect(component.workoutName()).toBe('Push Day');

      fixture.componentRef.setInput('workout', null);
      fixture.detectChanges();

      expect(component.workoutName()).toBe('');
      expect(component.exercises().length).toBe(0);
    });
  });

  describe('Exercise Management', () => {
    it('should add a new exercise', () => {
      expect(component.exercises().length).toBe(0);

      component.onAddExercise();

      expect(component.exercises().length).toBe(1);
      expect(component.exercises()[0].name).toBe('');
      expect(component.exercises()[0].id).toBeDefined();
    });

    it('should remove an exercise by index', () => {
      component.onAddExercise();
      component.onAddExercise();
      component.onAddExercise();

      expect(component.exercises().length).toBe(3);

      const firstExerciseId = component.exercises()[0].id;
      component.onRemoveExercise(0);

      expect(component.exercises().length).toBe(2);
      expect(component.exercises()[0].id).not.toBe(firstExerciseId);
    });

    it('should update exercise name', () => {
      component.onAddExercise();
      const exerciseId = component.exercises()[0].id;

      component.onExerciseNameChange(0, 'Bench Press');

      expect(component.exercises()[0].name).toBe('Bench Press');
      expect(component.exercises()[0].id).toBe(exerciseId);
    });

    it('should reorder exercises', () => {
      component.onAddExercise();
      component.onAddExercise();
      component.onExerciseNameChange(0, 'First');
      component.onExerciseNameChange(1, 'Second');

      const mockEvent = {
        detail: {
          from: 0,
          to: 1,
          complete: jasmine.createSpy('complete'),
        },
      } as any;

      component.onReorder(mockEvent);

      expect(component.exercises()[0].name).toBe('Second');
      expect(component.exercises()[1].name).toBe('First');
      expect(mockEvent.detail.complete).toHaveBeenCalled();
    });

    it('should expose hasExercises computed correctly', () => {
      expect(component.hasExercises()).toBeFalse();

      component.onAddExercise();
      expect(component.hasExercises()).toBeTrue();

      component.onRemoveExercise(0);
      expect(component.hasExercises()).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit when workout name is empty', () => {
      component.workoutName.set('');
      expect(component.isSubmitDisabled()).toBeTrue();
    });

    it('should disable submit when workout name is only whitespace', () => {
      component.workoutName.set('   ');
      expect(component.isSubmitDisabled()).toBeTrue();
    });

    it('should disable submit when exercise name is empty', () => {
      component.workoutName.set('Push Day');
      component.onAddExercise();
      expect(component.isSubmitDisabled()).toBeTrue();
    });

    it('should disable submit when exercise name is only whitespace', () => {
      component.workoutName.set('Push Day');
      component.onAddExercise();
      component.onExerciseNameChange(0, '   ');
      expect(component.isSubmitDisabled()).toBeTrue();
    });

    it('should enable submit when form is valid', () => {
      component.workoutName.set('Push Day');
      component.onAddExercise();
      component.onExerciseNameChange(0, 'Bench Press');
      expect(component.isSubmitDisabled()).toBeFalse();
    });

    it('should disable submit when at least one exercise has empty name', () => {
      component.workoutName.set('Push Day');
      component.onAddExercise();
      component.onAddExercise();
      component.onExerciseNameChange(0, 'Bench Press');
      component.onExerciseNameChange(1, '');
      expect(component.isSubmitDisabled()).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form is disabled', () => {
      const createSpy = spyOn(component.createWorkout, 'emit');
      const updateSpy = spyOn(component.updateWorkout, 'emit');

      component.workoutName.set('');
      component.onSubmitWorkout();

      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should emit createWorkout in create mode', () => {
      const createSpy = spyOn(component.createWorkout, 'emit');
      const updateSpy = spyOn(component.updateWorkout, 'emit');
      component.workoutName.set('Push Day');
      component.onAddExercise();
      component.onExerciseNameChange(0, 'Bench Press');

      component.onSubmitWorkout();

      expect(createSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Push Day',
          exercises: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: jasmine.any(String),
              name: 'Bench Press',
            }),
          ]),
        })
      );
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should emit updateWorkout in edit mode', () => {
      const mockWorkout: Workout = {
        id: 'workout-1',
        name: 'Push Day',
        exercises: [],
      };

      fixture.componentRef.setInput('workout', mockWorkout);
      fixture.detectChanges();

      const createSpy = spyOn(component.createWorkout, 'emit');
      const updateSpy = spyOn(component.updateWorkout, 'emit');
      component.workoutName.set('Updated Push Day');
      component.onAddExercise();
      component.onExerciseNameChange(0, 'Bench Press');

      component.onSubmitWorkout();

      expect(updateSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Updated Push Day',
          exercises: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: jasmine.any(String),
              name: 'Bench Press',
            }),
          ]),
        })
      );
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should reset form after submission in create mode', () => {
      const createSpy = spyOn(component.createWorkout, 'emit');
      component.workoutName.set('Push Day');
      component.onAddExercise();
      component.onExerciseNameChange(0, 'Bench Press');

      component.onSubmitWorkout();

      expect(component.workoutName()).toBe('');
      expect(component.exercises().length).toBe(0);
    });

    it('should not reset form after submission in edit mode', () => {
      const mockWorkout: Workout = {
        id: 'workout-1',
        name: 'Push Day',
        exercises: [],
      };

      fixture.componentRef.setInput('workout', mockWorkout);
      fixture.detectChanges();

      const updateSpy = spyOn(component.updateWorkout, 'emit');
      component.workoutName.set('Updated Push Day');
      component.onAddExercise();
      component.onExerciseNameChange(0, 'Bench Press');

      component.onSubmitWorkout();

      expect(component.workoutName()).toBe('Updated Push Day');
      expect(component.exercises().length).toBe(1);
    });

    it('should trim workout name on submission', () => {
      const createSpy = spyOn(component.createWorkout, 'emit');
      component.workoutName.set('  Push Day  ');
      component.onAddExercise();
      component.onExerciseNameChange(0, 'Bench Press');

      component.onSubmitWorkout();

      expect(createSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Push Day',
        })
      );
    });

    it('should include all exercises in submission payload', () => {
      const createSpy = spyOn(component.createWorkout, 'emit');
      component.workoutName.set('Push Day');
      component.onAddExercise();
      component.onAddExercise();
      component.onExerciseNameChange(0, 'Bench Press');
      component.onExerciseNameChange(1, 'Shoulder Press');

      component.onSubmitWorkout();

      expect(createSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          exercises: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: jasmine.any(String),
              name: 'Bench Press',
            }),
            jasmine.objectContaining({
              id: jasmine.any(String),
              name: 'Shoulder Press',
            }),
          ]),
        })
      );
      expect(createSpy.calls.mostRecent().args[0].exercises.length).toBe(2);
    });
  });

  describe('trackByExerciseId', () => {
    it('should return exercise id', () => {
      component.onAddExercise();
      const exercise = component.exercises()[0];

      const result = component.trackByExerciseId(0, exercise);

      expect(result).toBe(exercise.id);
    });
  });
});
