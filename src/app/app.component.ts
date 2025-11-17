import { Component, inject, OnInit } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform , IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly platform = inject(Platform);

  constructor() {}

  async ngOnInit(): Promise<void> {
    if (this.platform.is('capacitor')) {
      await SplashScreen.show({
        showDuration: 2000,
        autoHide: true
      });
    }
  }
}
