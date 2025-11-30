import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  close,
  logOutOutline,
  createOutline,
  trashOutline,
  ellipsisVertical,
  play,
} from 'ionicons/icons';
import { switchMap, catchError, of } from 'rxjs';

import { AuthService } from '@app/core/services/auth.service';
import { TranslationService } from '@app/core/services/translation.service';
import { WorkoutService, Workout } from '@app/core/services/workout.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

import { WorkoutCardComponent } from './workout-card/workout-card.component';
import {
  WorkoutFormComponent,
  WorkoutFormValue,
} from './workout-form/workout-form.component';

@Component({
  selector: 'jym-workouts',
  templateUrl: 'workouts.page.html',
  styleUrls: ['workouts.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonModal,
    IonButtons,
    IonIcon,
    IonSpinner,
    ButtonComponent,
    WorkoutFormComponent,
    WorkoutCardComponent,
    TranslatePipe,
    CommonModule,
  ],
  standalone: true,
})
export class WorkoutsPage {
  readonly hideHeader = input<boolean>(false);
  readonly isWorkoutModalOpen = signal(false);
  readonly isLoading = signal(false);
  readonly isLoadingWorkouts = signal(true);
  readonly error = signal<string | null>(null);
  readonly editingWorkout = signal<Workout | null>(null);
  readonly selectedWorkout = signal<Workout | null>(null);

  private readonly authService = inject(AuthService);
  private readonly workoutService = inject(WorkoutService);
  private readonly router = inject(Router);
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly translationService = inject(TranslationService);

  private readonly user = toSignal(this.authService.getUser(), {
    initialValue: null,
  });

  private readonly workouts$ = toSignal(
    this.authService.getUser().pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of([]);
        }
        return this.workoutService.getWorkouts(user.uid).pipe(
          catchError((error) => {
            console.error('Error loading workouts:', error);
            this.error.set(
              this.translationService.translate('workouts.errors.loading')
            );
            return of([]);
          })
        );
      })
    ),
    { initialValue: undefined }
  );

  readonly workouts = computed(() => this.workouts$() ?? []);
  readonly hasWorkouts = computed(() => this.workouts().length > 0);

  constructor() {
    addIcons({
      addOutline,
      close,
      logOutOutline,
      createOutline,
      trashOutline,
      ellipsisVertical,
      play,
    });

    effect(() => {
      const workouts = this.workouts$();
      const user = this.user();

      if (workouts === undefined) {
        if (user?.uid) {
          this.isLoadingWorkouts.set(true);
        } else {
          this.isLoadingWorkouts.set(false);
        }
      } else {
        this.isLoadingWorkouts.set(false);
      }
    });
  }

  onCreateWorkout(): void {
    this.editingWorkout.set(null);
    this.isWorkoutModalOpen.set(true);
  }

  onEditWorkout(workout: Workout): void {
    this.selectedWorkout.set(null);
    this.editingWorkout.set(workout);
    this.isWorkoutModalOpen.set(true);
  }

  async onOpenMenu(workout: Workout): Promise<void> {
    this.selectedWorkout.set(workout);

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'workout-action-sheet',
      buttons: [
        {
          text: this.translationService.translate('workouts.actions.edit'),
          icon: 'create-outline',
          cssClass: 'workout-action-sheet-edit',
          handler: () => {
            this.onEditFromMenu();
          },
        },
        {
          text: this.translationService.translate('workouts.actions.delete'),
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.onDeleteFromMenu();
          },
        },
        {
          text: this.translationService.translate('workouts.actions.cancel'),
          icon: 'close',
          role: 'cancel',
          cssClass: 'workout-action-sheet-cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  onEditFromMenu(): void {
    const workout = this.selectedWorkout();
    if (workout) {
      this.onEditWorkout(workout);
    }
  }

  onDeleteFromMenu(): void {
    const workout = this.selectedWorkout();
    if (workout) {
      this.selectedWorkout.set(null);
      void this.onDeleteWorkout(workout);
    }
  }

  closeWorkoutModal(): void {
    this.isWorkoutModalOpen.set(false);
    this.editingWorkout.set(null);
  }

  onLaunchWorkout(workoutId: string): void {
    void workoutId;
  }

  async onWorkoutCreated(workout: WorkoutFormValue): Promise<void> {
    const user = this.user();

    if (!user?.uid) {
      this.error.set(
        this.translationService.translate('workouts.errors.userNotConnected')
      );
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const exercises = workout.exercises.map((exercise, index) => ({
        id: exercise.id,
        name: exercise.name.trim(),
        order: index + 1,
      }));

      await this.workoutService.createWorkout(user.uid, {
        name: workout.name,
        exercises,
      });

      this.closeWorkoutModal();
    } catch (error) {
      this.error.set(
        this.translationService.translate('workouts.errors.create')
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async onWorkoutUpdated(workout: WorkoutFormValue): Promise<void> {
    const user = this.user();
    const editingWorkout = this.editingWorkout();

    if (!user?.uid || !editingWorkout) {
      this.error.set(
        this.translationService.translate('workouts.errors.workoutNotFound')
      );
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const exercises = workout.exercises.map((exercise, index) => ({
        id: exercise.id,
        name: exercise.name.trim(),
        order: index + 1,
      }));

      await this.workoutService.updateWorkout(user.uid, editingWorkout.id, {
        name: workout.name,
        exercises,
      });

      this.closeWorkoutModal();
    } catch (error) {
      this.error.set(
        this.translationService.translate('workouts.errors.update')
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDeleteWorkout(workout: Workout): Promise<void> {
    const user = this.user();

    if (!user?.uid) {
      this.error.set(
        this.translationService.translate('workouts.errors.userNotConnected')
      );
      return;
    }

    const confirmMessage = this.translationService
      .translate('workouts.delete.confirm')
      .replace('{{name}}', workout.name);
    const confirmed = confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.workoutService.deleteWorkout(user.uid, workout.id);
    } catch (error) {
      this.error.set(
        this.translationService.translate('workouts.errors.delete')
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  getExercisesCountText(count: number): string {
    const key =
      count === 1
        ? 'workouts.list.exercisesCount.one'
        : 'workouts.list.exercisesCount.other';
    return this.translationService
      .translate(key)
      .replace('{{count}}', count.toString());
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/auth');
    });
  }

  trackWorkoutById = (_: number, workout: Workout): string => workout.id;
}
