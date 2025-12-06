import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'jym-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent],
  standalone: true,
})
export class DashboardPage {
  readonly hideHeader = input<boolean>(false);
}
