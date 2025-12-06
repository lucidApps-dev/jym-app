import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';

import { AuthService } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

import { DashboardPage } from '../dashboard/dashboard.page';
import { HistoryPage } from '../history/history.page';
import { ProfilePage } from '../profile/profile.page';
import { StatsPage } from '../stats/stats.page';

export interface TabItem {
  id: string;
  label: string;
  component:
    | typeof DashboardPage
    | typeof HistoryPage
    | typeof StatsPage
    | typeof ProfilePage;
}

@Component({
  selector: 'jym-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    DashboardPage,
    HistoryPage,
    StatsPage,
    ProfilePage,
    TranslatePipe,
  ],
  standalone: true,
})
export class TabsPage {
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);

  readonly tabs: TabItem[] = [
    { id: 'dashboard', label: 'dashboard', component: DashboardPage },
    { id: 'history', label: 'history', component: HistoryPage },
    { id: 'stats', label: 'stats', component: StatsPage },
    { id: 'profile', label: 'profile', component: ProfilePage },
  ];

  readonly translatedTabs = computed(() =>
    this.tabs.map((tab) => ({
      ...tab,
      translatedLabel: this.translationService.translate(`tabs.${tab.label}`),
      ariaLabel: `${this.translationService.translate(
        'tabs.goTo'
      )} ${this.translationService.translate(`tabs.${tab.label}`)}`,
    }))
  );

  readonly activeTabIndex = signal<number>(0);
  readonly activeTab = computed(() => this.tabs[this.activeTabIndex()]);

  private readonly user$ = toSignal(this.authService.getUser(), {
    initialValue: null,
  });

  readonly userEmail = computed(() => this.user$()?.email ?? '');
  readonly avatarLetter = computed(() => {
    const email = this.userEmail();
    if (!email) {
      return '?';
    }
    return email.trim().charAt(0).toUpperCase();
  });

  readonly profileTabIndex = computed(() =>
    this.tabs.findIndex((tab) => tab.id === 'profile')
  );

  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  private isSwiping = false;
  private readonly minSwipeDistance = 50;
  private readonly maxVerticalSwipeRatio = 0.5;

  onTabClick(index: number): void {
    this.activeTabIndex.set(index);
  }

  onAvatarClick(): void {
    const profileIndex = this.tabs.findIndex((tab) => tab.id === 'profile');
    if (profileIndex !== -1) {
      this.onTabClick(profileIndex);
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
    this.isSwiping = false;
  }

  onTouchMove(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const deltaX = Math.abs(touch.screenX - this.touchStartX);
    const deltaY = Math.abs(touch.screenY - this.touchStartY);

    // Determine if this is a horizontal swipe
    if (deltaX > 10 && deltaX > deltaY * (1 / this.maxVerticalSwipeRatio)) {
      this.isSwiping = true;
      event.preventDefault();
    }
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;

    if (this.isSwiping) {
      this.handleSwipe();
    }

    this.isSwiping = false;
  }

  private handleSwipe(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const absDeltaX = Math.abs(deltaX);

    // Check if swipe distance is sufficient
    if (absDeltaX > this.minSwipeDistance) {
      const currentIndex = this.activeTabIndex();
      const maxIndex = this.tabs.length - 1;

      if (deltaX > 0) {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
        this.activeTabIndex.set(newIndex);
      } else {
        const newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
        this.activeTabIndex.set(newIndex);
      }
    }
  }
}
