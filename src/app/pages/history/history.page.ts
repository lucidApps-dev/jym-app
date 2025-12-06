import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'jym-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent],
  standalone: true,
})
export class HistoryPage {
  readonly hideHeader = input<boolean>(false);
}
