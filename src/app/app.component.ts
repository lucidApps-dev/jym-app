import { Component, inject, OnInit } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform , IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly platform = inject(Platform);
  private readonly translationService = inject(TranslationService);

  constructor() {}

  async ngOnInit(): Promise<void> {
    await this.translationService.init();

    if (this.platform.is('capacitor')) {
      await SplashScreen.show({
        showDuration: 2000,
        autoHide: true
      });
    }
  }
}
