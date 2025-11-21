import { CommonModule } from '@angular/common';
import { Component, input, signal, OnDestroy, effect } from '@angular/core';

export interface CarouselImage {
  url: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CarouselComponent implements OnDestroy {
  images = input.required<CarouselImage[]>();
  autoplayInterval = input<number>(3000);
  height = input<string>('80vh');

  public readonly currentSlideIndex = signal<number>(0);
  private autoplayIntervalId?: ReturnType<typeof setInterval>;
  
  // Swipe detection properties
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  private isSwiping = false;
  private readonly minSwipeDistance = 50; // Minimum distance in pixels to trigger a swipe
  private readonly maxVerticalSwipeRatio = 0.5; // Maximum ratio of vertical to horizontal movement to consider it a horizontal swipe

  constructor() {
    effect(() => {
      if (this.images().length > 0) {
        this.startAutoplay();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  nextSlide(): void {
    const currentIndex = this.currentSlideIndex();
    const maxIndex = this.images().length - 1;
    this.currentSlideIndex.set(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }

  previousSlide(): void {
    const currentIndex = this.currentSlideIndex();
    const maxIndex = this.images().length - 1;
    this.currentSlideIndex.set(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }

  goToSlide(index: number): void {
    this.currentSlideIndex.set(index);
    this.restartAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (this.autoplayInterval() > 0 && this.images().length > 1) {
      this.autoplayIntervalId = setInterval(() => {
        this.nextSlide();
      }, this.autoplayInterval());
    }
  }

  private stopAutoplay(): void {
    if (this.autoplayIntervalId) {
      clearInterval(this.autoplayIntervalId);
      this.autoplayIntervalId = undefined;
    }
  }

  private restartAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
    this.isSwiping = false;
    this.stopAutoplay(); // Pause autoplay during swipe
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
    this.restartAutoplay(); // Resume autoplay after swipe
  }

  private handleSwipe(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const absDeltaX = Math.abs(deltaX);

    // Check if swipe distance is sufficient
    if (absDeltaX > this.minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go to previous slide
        this.previousSlide();
      } else {
        // Swipe left - go to next slide
        this.nextSlide();
      }
    }
  }
}

