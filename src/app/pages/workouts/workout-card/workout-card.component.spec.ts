import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Timestamp } from 'firebase/firestore';

import { WorkoutCardComponent } from './workout-card.component';
import { Workout } from '@app/core/services/workout.service';

describe('WorkoutCardComponent', () => {
  let component: WorkoutCardComponent;
  let fixture: ComponentFixture<WorkoutCardComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('workout', mockWorkout);
    fixture.componentRef.setInput('exercisesCountText', '2 exercices');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should display workout name', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('h3');
      expect(nameElement?.textContent?.trim()).toBe('Push Day');
    });

    it('should display exercises count text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const countElement = compiled.querySelector('p');
      expect(countElement?.textContent?.trim()).toBe('2 exercices');
    });

    it('should have isLoading default to false', () => {
      expect(component.isLoading()).toBeFalse();
    });

    it('should accept isLoading input', () => {
      fixture.componentRef.setInput('isLoading', true);
      fixture.detectChanges();
      expect(component.isLoading()).toBeTrue();
    });

    it('should update displayed workout name when input changes', () => {
      const updatedWorkout: Workout = {
        ...mockWorkout,
        name: 'Pull Day',
      };
      fixture.componentRef.setInput('workout', updatedWorkout);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('h3');
      expect(nameElement?.textContent?.trim()).toBe('Pull Day');
    });

    it('should update displayed exercises count text when input changes', () => {
      fixture.componentRef.setInput('exercisesCountText', '5 exercices');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const countElement = compiled.querySelector('p');
      expect(countElement?.textContent?.trim()).toBe('5 exercices');
    });
  });

  describe('Play Button', () => {
    it('should emit playClick with workout id when play button is clicked', () => {
      const playSpy = spyOn(component.playClick, 'emit');
      component.onPlayClick();

      expect(playSpy).toHaveBeenCalledWith('workout-1');
    });

    it('should disable play button when isLoading is true', () => {
      fixture.componentRef.setInput('isLoading', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const playButton = compiled.querySelector(
        '.workout-card-play-button'
      ) as HTMLIonButtonElement;
      expect(playButton?.disabled).toBeTrue();
    });

    it('should enable play button when isLoading is false', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const playButton = compiled.querySelector(
        '.workout-card-play-button'
      ) as HTMLIonButtonElement;
      expect(playButton?.disabled).toBeFalse();
    });

    it('should have play icon in play button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const playIcon = compiled.querySelector(
        '.workout-card-play-button ion-icon[name="play"]'
      );
      expect(playIcon).toBeTruthy();
    });
  });

  describe('Menu Button', () => {
    it('should emit menuClick with workout when menu button is clicked', () => {
      const menuSpy = spyOn(component.menuClick, 'emit');
      component.onMenuClick();

      expect(menuSpy).toHaveBeenCalledWith(mockWorkout);
    });

    it('should disable menu button when isLoading is true', () => {
      fixture.componentRef.setInput('isLoading', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const menuButton = compiled.querySelector(
        '.workout-card-menu-button'
      ) as HTMLIonButtonElement;
      expect(menuButton?.disabled).toBeTrue();
    });

    it('should enable menu button when isLoading is false', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const menuButton = compiled.querySelector(
        '.workout-card-menu-button'
      ) as HTMLIonButtonElement;
      expect(menuButton?.disabled).toBeFalse();
    });

    it('should have ellipsis-vertical icon in menu button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const menuIcon = compiled.querySelector(
        '.workout-card-menu-button ion-icon[name="ellipsis-vertical"]'
      );
      expect(menuIcon).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have workout-card class on root element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const rootElement = compiled.querySelector('.workout-card');
      expect(rootElement).toBeTruthy();
    });

    it('should have both play and menu buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const playButton = compiled.querySelector('.workout-card-play-button');
      const menuButton = compiled.querySelector('.workout-card-menu-button');

      expect(playButton).toBeTruthy();
      expect(menuButton).toBeTruthy();
    });

    it('should have workout name and exercises count in info section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('h3');
      const countElement = compiled.querySelector('p');

      expect(nameElement).toBeTruthy();
      expect(countElement).toBeTruthy();
    });
  });

  describe('Event Handlers', () => {
    it('should call onPlayClick when play button is clicked', () => {
      const playSpy = spyOn(component, 'onPlayClick');
      const compiled = fixture.nativeElement as HTMLElement;
      const playButton = compiled.querySelector(
        '.workout-card-play-button'
      ) as HTMLElement;

      playButton?.click();
      fixture.detectChanges();

      expect(playSpy).toHaveBeenCalled();
    });

    it('should call onMenuClick when menu button is clicked', () => {
      const menuSpy = spyOn(component, 'onMenuClick');
      const compiled = fixture.nativeElement as HTMLElement;
      const menuButton = compiled.querySelector(
        '.workout-card-menu-button'
      ) as HTMLElement;

      menuButton?.click();
      fixture.detectChanges();

      expect(menuSpy).toHaveBeenCalled();
    });
  });

  describe('Workout with different data', () => {
    it('should handle workout with no exercises', () => {
      const workoutNoExercises: Workout = {
        id: 'workout-2',
        name: 'Empty Workout',
        exercises: [],
      };

      fixture.componentRef.setInput('workout', workoutNoExercises);
      fixture.componentRef.setInput('exercisesCountText', '0 exercice');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('h3');
      const countElement = compiled.querySelector('p');

      expect(nameElement?.textContent?.trim()).toBe('Empty Workout');
      expect(countElement?.textContent?.trim()).toBe('0 exercice');
    });

    it('should handle workout with many exercises', () => {
      const workoutManyExercises: Workout = {
        id: 'workout-3',
        name: 'Full Body',
        exercises: Array.from({ length: 10 }, (_, i) => ({
          id: `ex-${i}`,
          name: `Exercise ${i + 1}`,
          order: i + 1,
        })),
      };

      fixture.componentRef.setInput('workout', workoutManyExercises);
      fixture.componentRef.setInput('exercisesCountText', '10 exercices');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('h3');
      const countElement = compiled.querySelector('p');

      expect(nameElement?.textContent?.trim()).toBe('Full Body');
      expect(countElement?.textContent?.trim()).toBe('10 exercices');
    });

    it('should handle workout with long name', () => {
      const workoutLongName: Workout = {
        id: 'workout-4',
        name: 'Very Long Workout Name That Should Be Truncated',
        exercises: [],
      };

      fixture.componentRef.setInput('workout', workoutLongName);
      fixture.componentRef.setInput('exercisesCountText', '0 exercice');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('h3');
      expect(nameElement?.textContent?.trim()).toBe(
        'Very Long Workout Name That Should Be Truncated'
      );
      expect(nameElement?.classList.contains('truncate')).toBeTrue();
    });
  });
});
