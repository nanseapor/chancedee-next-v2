/**
 * Performance Monitoring Utility
 *
 * Provides development-time performance tracking for database operations
 * and critical paths to identify bottlenecks and measure optimization impact.
 *
 * Usage:
 * ```typescript
 * // Automatic measurement
 * const result = await PerformanceMonitor.measure('getUserData', async () => {
 *   return await fetchUserData();
 * });
 *
 * // Manual measurement
 * PerformanceMonitor.start('complexOperation');
 * // ... do work ...
 * PerformanceMonitor.end('complexOperation');
 * ```
 */

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  private static enabled = process.env.NODE_ENV === 'development';

  /**
   * Start timing a labeled operation
   */
  static start(label: string): void {
    if (!this.enabled) return;

    this.timers.set(label, performance.now());
    console.log(`⏱️  [${label}] Started`);
  }

  /**
   * End timing for a labeled operation and return duration
   */
  static end(label: string): number {
    if (!this.enabled) return 0;

    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`⚠️  [${label}] No start time found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    // Color code based on performance
    const emoji = duration < 100 ? '✅' : duration < 500 ? '⚡' : '🐌';
    console.log(`${emoji} [${label}] Completed in ${duration.toFixed(2)}ms`);

    return duration;
  }

  /**
   * Measure an async function execution time
   */
  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) {
      return await fn();
    }

    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      console.error(`❌ [${label}] Failed:`, error);
      this.timers.delete(label);
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution time
   */
  static measureSync<T>(label: string, fn: () => T): T {
    if (!this.enabled) {
      return fn();
    }

    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      console.error(`❌ [${label}] Failed:`, error);
      this.timers.delete(label);
      throw error;
    }
  }

  /**
   * Clear all active timers
   */
  static clear(): void {
    this.timers.clear();
  }

  /**
   * Get all active timer labels
   */
  static getActiveTimers(): string[] {
    return Array.from(this.timers.keys());
  }
}
