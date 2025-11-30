import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'jym-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent],
  standalone: true,
})
export class StatsPage {
  readonly hideHeader = input<boolean>(false);
}
