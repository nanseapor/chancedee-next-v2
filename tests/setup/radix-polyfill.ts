/**
 * Polyfill for Radix UI components in JSDOM environment
 *
 * Radix UI uses pointer events that JSDOM doesn't fully support.
 * This polyfill adds the missing methods to make tests work.
 */

// Only run in test environment
if (typeof window !== 'undefined') {
  // Polyfill PointerEvent if not available
  if (!window.PointerEvent) {
    class MockPointerEvent extends MouseEvent {
      public pointerId: number;
      public width: number;
      public height: number;
      public pressure: number;
      public tangentialPressure: number;
      public tiltX: number;
      public tiltY: number;
      public twist: number;
      public pointerType: string;
      public isPrimary: boolean;

      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId ?? 0;
        this.width = params.width ?? 1;
        this.height = params.height ?? 1;
        this.pressure = params.pressure ?? 0;
        this.tangentialPressure = params.tangentialPressure ?? 0;
        this.tiltX = params.tiltX ?? 0;
        this.tiltY = params.tiltY ?? 0;
        this.twist = params.twist ?? 0;
        this.pointerType = params.pointerType ?? 'mouse';
        this.isPrimary = params.isPrimary ?? true;
      }

      public getCoalescedEvents(): PointerEvent[] {
        return [];
      }

      public getPredictedEvents(): PointerEvent[] {
        return [];
      }
    }

    window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;
  }

  // Polyfill pointer capture methods on HTMLElement
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = function (_pointerId: number): boolean {
      return false;
    };
  }

  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = function (_pointerId: number): void {
      // No-op for tests
    };
  }

  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = function (_pointerId: number): void {
      // No-op for tests
    };
  }

  // Polyfill scrollIntoView (used by Radix for focus management)
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function (_options?: ScrollIntoViewOptions | boolean): void {
      // No-op for tests
    };
  }

  // Polyfill ResizeObserver (used by some Radix components)
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      constructor(_callback: ResizeObserverCallback) {}
      observe(_target: Element, _options?: ResizeObserverOptions): void {}
      unobserve(_target: Element): void {}
      disconnect(): void {}
    };
  }
}

export {};
