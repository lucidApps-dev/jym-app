import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ItemReorderEventDetail } from '@ionic/angular';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonReorder,
  IonReorderGroup,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  checkmarkOutline,
  reorderThreeOutline,
  trashOutline,
} from 'ionicons/icons';

import { Workout, WorkoutExercise } from '@app/core/services/workout.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

export interface WorkoutFormValue {
  name: string;
  exercises: Omit<WorkoutExercise, 'order'>[];
}

@Component({
  selector: 'jym-workout-form',
  standalone: true,
  templateUrl: './workout-form.component.html',
  styleUrls: ['./workout-form.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonReorderGroup,
    IonReorder,
    ButtonComponent,
    TranslatePipe,
  ],
})
export class WorkoutFormComponent {
  readonly workout = input<Workout | null>(null);
  readonly createWorkout = output<WorkoutFormValue>();
  readonly updateWorkout = output<WorkoutFormValue>();

  workoutName = signal<string>('');
  readonly exercises = signal<Omit<WorkoutExercise, 'order'>[]>([]);
  readonly hasExercises = computed(() => this.exercises().length > 0);
  readonly isEditMode = computed(() => this.workout() !== null);
  readonly isSubmitDisabled = computed(
    () =>
      this.workoutName().trim().length === 0 ||
      this.exercises().some((exercise) => exercise.name.trim().length === 0)
  );

  constructor() {
    addIcons({
      addOutline,
      checkmarkOutline,
      reorderThreeOutline,
      trashOutline,
    });

    effect(() => {
      const workoutData = this.workout();
      if (workoutData) {
        this.workoutName.set(workoutData.name);
        this.exercises.set(
          workoutData.exercises
            .sort((a, b) => a.order - b.order)
            .map((exercise) => ({
              id: exercise.id,
              name: exercise.name,
            }))
        );
      } else {
        this.resetForm();
      }
    });
  }

  onAddExercise(): void {
    const newExercise: Omit<WorkoutExercise, 'order'> = {
      id: crypto.randomUUID(),
      name: '',
    };
    this.exercises.update((current) => [...current, newExercise]);
  }

  onRemoveExercise(index: number): void {
    this.exercises.update((current) =>
      current.filter((_, idx) => idx !== index)
    );
  }

  onExerciseNameChange(index: number, name: string): void {
    this.exercises.update((current) => {
      const updated = [...current];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  }

  onReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const updated = [...this.exercises()];
    const [moved] = updated.splice(event.detail.from, 1);
    updated.splice(event.detail.to, 0, moved);
    this.exercises.set(updated);
    event.detail.complete();
  }

  onSubmitWorkout(): void {
    if (this.isSubmitDisabled()) {
      return;
    }

    const formValue: WorkoutFormValue = {
      name: this.workoutName().trim(),
      exercises: this.exercises().map((exercise) => ({ ...exercise })),
    };

    if (this.isEditMode()) {
      this.updateWorkout.emit(formValue);
    } else {
      this.createWorkout.emit(formValue);
    }

    if (!this.isEditMode()) {
      this.resetForm();
    }
  }

  trackByExerciseId = (
    _: number,
    exercise: Omit<WorkoutExercise, 'order'>
  ): string => exercise.id;

  private resetForm(): void {
    this.workoutName.set('');
    this.exercises.set([]);
  }
}
