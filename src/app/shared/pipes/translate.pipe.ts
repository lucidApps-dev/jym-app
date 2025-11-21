import { Pipe, PipeTransform, inject, ChangeDetectorRef, effect } from '@angular/core';

import { TranslationService } from '@core/services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private lastKey: string = '';
  private lastValue: string = '';

  constructor() {
    effect(() => {
      this.translationService.currentLanguage();
      if (this.lastKey) {
        this.lastValue = this.translationService.translate(this.lastKey);
        this.cdr.markForCheck();
      }
    });
  }

  transform(key: string): string {
    if (key !== this.lastKey) {
      this.lastKey = key;
    }
    this.lastValue = this.translationService.translate(key);
    return this.lastValue;
  }
}

