import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';

export type ButtonMode = 'primary' | 'transparent';

@Component({
  selector: 'jym-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner],
})
export class ButtonComponent {
  mode = input<ButtonMode>('primary');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  icon = input<string>();
  form = input<string>();
  isLoading = input<boolean>(false);
}

