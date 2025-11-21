import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselComponent, CarouselImage } from './carousel.component';

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;
  const mockImages: CarouselImage[] = [
    { url: 'image1.jpg', alt: 'Image 1', title: 'Title 1' },
    { url: 'image2.jpg', alt: 'Image 2', title: 'Title 2' },
    { url: 'image3.jpg', alt: 'Image 3', title: 'Title 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('images', mockImages);
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Navigation', () => {
    it('should start at index 0', () => {
      expect(component.currentSlideIndex()).toBe(0);
    });

    it('should go to next slide', () => {
      component.nextSlide();
      expect(component.currentSlideIndex()).toBe(1);
    });

    it('should cycle to first slide when at last slide', () => {
      component.currentSlideIndex.set(mockImages.length - 1);
      component.nextSlide();
      expect(component.currentSlideIndex()).toBe(0);
    });

    it('should go to previous slide', () => {
      component.currentSlideIndex.set(1);
      component.previousSlide();
      expect(component.currentSlideIndex()).toBe(0);
    });

    it('should cycle to last slide when at first slide', () => {
      component.currentSlideIndex.set(0);
      component.previousSlide();
      expect(component.currentSlideIndex()).toBe(mockImages.length - 1);
    });

    it('should go to specific slide', () => {
      component.goToSlide(2);
      expect(component.currentSlideIndex()).toBe(2);
    });
  });

  describe('Autoplay', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should start autoplay when images are provided', () => {
      const newFixture = TestBed.createComponent(CarouselComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.componentRef.setInput('images', mockImages);
      newFixture.detectChanges();
      
      const nextSlideSpy = spyOn(newComponent, 'nextSlide');
      
      // Advance time to trigger autoplay
      jasmine.clock().tick(3000);
      
      expect(nextSlideSpy).toHaveBeenCalled();
      
      newComponent.ngOnDestroy();
    });

    it('should not start autoplay if interval is 0', () => {
      fixture.componentRef.setInput('autoplayInterval', 0);
      fixture.detectChanges();
      
      const nextSlideSpy = spyOn(component, 'nextSlide');
      
      jasmine.clock().tick(3000);
      
      expect(nextSlideSpy).not.toHaveBeenCalled();
    });

    it('should not start autoplay if only one image', () => {
      fixture.componentRef.setInput('images', [mockImages[0]]);
      fixture.detectChanges();
      
      const nextSlideSpy = spyOn(component, 'nextSlide');
      
      jasmine.clock().tick(3000);
      
      expect(nextSlideSpy).not.toHaveBeenCalled();
    });

    it('should restart autoplay when going to specific slide', () => {
      const nextSlideSpy = spyOn(component, 'nextSlide');
      
      component.goToSlide(1);
      jasmine.clock().tick(3000);
      
      expect(nextSlideSpy).toHaveBeenCalled();
    });

    it('should use custom autoplay interval', () => {
      fixture.componentRef.setInput('autoplayInterval', 5000);
      fixture.detectChanges();
      
      const nextSlideSpy = spyOn(component, 'nextSlide');
      
      jasmine.clock().tick(3000);
      expect(nextSlideSpy).not.toHaveBeenCalled();
      
      jasmine.clock().tick(2000);
      expect(nextSlideSpy).toHaveBeenCalled();
    });
  });

  describe('Touch Events', () => {
    it('should handle touch start', () => {
      const touchEvent = new TouchEvent('touchstart', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 100, clientY: 100, screenX: 100, screenY: 100, pageX: 100, pageY: 100, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
      });
      
      component.onTouchStart(touchEvent);
      
      expect(component['isSwiping']).toBeFalse();
    });

    it('should handle touch move and detect horizontal swipe', () => {
      const touchStartEvent = new TouchEvent('touchstart', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 100, clientY: 100, screenX: 100, screenY: 100, pageX: 100, pageY: 100, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
      });
      
      component.onTouchStart(touchStartEvent);
      
      const touchMoveEvent = new TouchEvent('touchmove', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: 110, screenX: 200, screenY: 110, pageX: 200, pageY: 110, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
        cancelable: true,
      });
      
      const preventDefaultSpy = spyOn(touchMoveEvent, 'preventDefault');
      component.onTouchMove(touchMoveEvent);
      
      expect(component['isSwiping']).toBeTrue();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle touch end with swipe left', () => {
      const touchStartEvent = new TouchEvent('touchstart', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: 100, screenX: 200, screenY: 100, pageX: 200, pageY: 100, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
      });
      
      component.onTouchStart(touchStartEvent);
      component['isSwiping'] = true;
      
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 50, clientY: 100, screenX: 50, screenY: 100, pageX: 50, pageY: 100, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
      });
      
      const nextSlideSpy = spyOn(component, 'nextSlide');
      component.onTouchEnd(touchEndEvent);
      
      expect(nextSlideSpy).toHaveBeenCalled();
      expect(component['isSwiping']).toBeFalse();
    });

    it('should handle touch end with swipe right', () => {
      const touchStartEvent = new TouchEvent('touchstart', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 50, clientY: 100, screenX: 50, screenY: 100, pageX: 50, pageY: 100, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
      });
      
      component.onTouchStart(touchStartEvent);
      component['isSwiping'] = true;
      
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: 100, screenX: 200, screenY: 100, pageX: 200, pageY: 100, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
      });
      
      const previousSlideSpy = spyOn(component, 'previousSlide');
      component.onTouchEnd(touchEndEvent);
      
      expect(previousSlideSpy).toHaveBeenCalled();
      expect(component['isSwiping']).toBeFalse();
    });

    it('should not handle swipe if distance is too small', () => {
      const touchStartEvent = new TouchEvent('touchstart', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 100, clientY: 100, screenX: 100, screenY: 100, pageX: 100, pageY: 100, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
      });
      
      component.onTouchStart(touchStartEvent);
      component['isSwiping'] = true;
      
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 120, clientY: 100, screenX: 120, screenY: 100, pageX: 120, pageY: 100, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 })],
      });
      
      const nextSlideSpy = spyOn(component, 'nextSlide');
      const previousSlideSpy = spyOn(component, 'previousSlide');
      component.onTouchEnd(touchEndEvent);
      
      expect(nextSlideSpy).not.toHaveBeenCalled();
      expect(previousSlideSpy).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should stop autoplay on destroy', () => {
      jasmine.clock().install();
      
      const nextSlideSpy = spyOn(component, 'nextSlide');
      component.ngOnDestroy();
      
      jasmine.clock().tick(3000);
      
      expect(nextSlideSpy).not.toHaveBeenCalled();
      
      jasmine.clock().uninstall();
    });
  });
});

