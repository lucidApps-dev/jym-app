import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';

import { StatsPage } from '../stats/stats.page';
import { WorkoutsPage } from '../workouts/workouts.page';

export interface TabItem {
  id: string;
  label: string;
  component: typeof WorkoutsPage | typeof StatsPage;
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
    WorkoutsPage,
    StatsPage,
  ],
  standalone: true,
})
export class TabsPage {
  readonly tabs: TabItem[] = [
    { id: 'workouts', label: 'Workouts', component: WorkoutsPage },
    { id: 'stats', label: 'Stats', component: StatsPage },
  ];

  readonly activeTabIndex = signal<number>(0);
  readonly activeTab = computed(() => this.tabs[this.activeTabIndex()]);
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
      // Prevent default scrolling while swiping horizontally
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
