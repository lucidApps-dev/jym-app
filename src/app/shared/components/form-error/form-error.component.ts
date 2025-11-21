import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { IonText } from '@ionic/angular/standalone';

import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'jym-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss'],
  standalone: true,
  imports: [CommonModule, IonText, TranslatePipe],
})
export class FormErrorComponent {
  errorKey = input<string | null | undefined>();
  errorId = input<string>();
  ariaLive = input<'polite' | 'assertive'>('polite');
  cssClass = input<string>('text-sm');
}

