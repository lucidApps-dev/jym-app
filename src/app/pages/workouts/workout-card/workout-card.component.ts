import { Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisVertical, play } from 'ionicons/icons';

import { Workout } from '@app/core/services/workout.service';

@Component({
  selector: 'jym-workout-card',
  standalone: true,
  templateUrl: './workout-card.component.html',
  styleUrls: ['./workout-card.component.scss'],
  imports: [IonButton, IonIcon],
})
export class WorkoutCardComponent {
  readonly workout = input.required<Workout>();
  readonly exercisesCountText = input.required<string>();
  readonly isLoading = input<boolean>(false);

  readonly playClick = output<string>();
  readonly menuClick = output<Workout>();

  constructor() {
    addIcons({ play, ellipsisVertical });
  }

  onPlayClick(): void {
    this.playClick.emit(this.workout().id);
  }

  onMenuClick(): void {
    this.menuClick.emit(this.workout());
  }
}
