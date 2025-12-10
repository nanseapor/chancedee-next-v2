/**
 * Performance Monitoring Utility for ChanceDee Application
 *
 * Purpose: Track and measure performance of critical operations,
 * particularly Firestore queries and data fetching operations.
 *
 * See: docs/performance-optimization-plan.md - Phase 5
 */

/**
 * Performance metrics storage
 */
interface PerformanceMetric {
  label: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitorClass {
  private timers: Map<string, number> = new Map();
  private metrics: PerformanceMetric[] = [];
  private readonly isDevelopment = process.env.NODE_ENV === "development";
  private readonly maxMetrics = 100; // Keep last 100 metrics

  /**
   * Start timing an operation
   *
   * @param label - Unique identifier for the operation
   *
   * @example
   * ```typescript
   * PerformanceMonitor.start('getUserData:abc123');
   * // ... do work
   * PerformanceMonitor.end('getUserData:abc123');
   * ```
   */
  start(label: string): void {
    if (!this.isDevelopment) return;

    const timestamp = performance.now();
    this.timers.set(label, timestamp);
    console.log(`⏱️  [Performance] Started: ${label}`);
  }

  /**
   * End timing an operation and log the duration
   *
   * @param label - Unique identifier for the operation (must match start)
   * @returns Duration in milliseconds
   */
  end(label: string, success = true, error?: string): number {
    if (!this.isDevelopment) return 0;

    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`⚠️  [Performance] No start time found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    const icon = success ? "✅" : "❌";
    const color = success ? "\x1b[32m" : "\x1b[31m"; // Green or Red
    const reset = "\x1b[0m";

    console.log(
      `${icon} ${color}[Performance]${reset} ${label}: ${duration.toFixed(2)}ms${error ? ` (${error})` : ""}`,
    );

    // Store metric
    this.metrics.push({
      label,
      duration,
      timestamp: Date.now(),
      success,
      error,
    });

    // Clean up old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this.timers.delete(label);
    return duration;
  }

  /**
   * Measure an async operation and automatically log timing
   *
   * @param label - Unique identifier for the operation
   * @param fn - Async function to measure
   * @returns Result of the async function
   *
   * @example
   * ```typescript
   * const userData = await PerformanceMonitor.measure(
   *   'getUserDataPropsById',
   *   () => getUserDataPropsById(uid)
   * );
   * ```
   */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isDevelopment) {
      return fn();
    }

    this.start(label);
    try {
      const result = await fn();
      this.end(label, true);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.end(label, false, errorMessage);
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   *
   * @param label - Unique identifier for the operation
   * @param fn - Function to measure
   * @returns Result of the function
   */
  measureSync<T>(label: string, fn: () => T): T {
    if (!this.isDevelopment) {
      return fn();
    }

    this.start(label);
    try {
      const result = fn();
      this.end(label, true);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.end(label, false, errorMessage);
      throw error;
    }
  }

  /**
   * Get performance statistics for a specific operation pattern
   *
   * @param labelPattern - Pattern to match operation labels (regex string)
   * @returns Statistics object
   *
   * @example
   * ```typescript
   * const stats = PerformanceMonitor.getStats('getUserData');
   * console.log(`Avg: ${stats.average}ms, P95: ${stats.p95}ms`);
   * ```
   */
  getStats(labelPattern: string): {
    count: number;
    average: number;
    median: number;
    min: number;
    max: number;
    p95: number;
    successRate: number;
  } {
    if (!this.isDevelopment) {
      return {
        count: 0,
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        p95: 0,
        successRate: 0,
      };
    }

    const pattern = new RegExp(labelPattern);
    const matchingMetrics = this.metrics.filter((m) => pattern.test(m.label));

    if (matchingMetrics.length === 0) {
      return {
        count: 0,
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        p95: 0,
        successRate: 0,
      };
    }

    const durations = matchingMetrics
      .map((m) => m.duration)
      .sort((a, b) => a - b);
    const successCount = matchingMetrics.filter((m) => m.success).length;

    return {
      count: matchingMetrics.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: durations[Math.floor(durations.length / 2)],
      min: durations[0],
      max: durations[durations.length - 1],
      p95: durations[Math.floor(durations.length * 0.95)],
      successRate: (successCount / matchingMetrics.length) * 100,
    };
  }

  /**
   * Log a summary of all collected metrics
   */
  logSummary(): void {
    if (!this.isDevelopment) return;

    console.group("📊 Performance Summary");

    // Group metrics by operation type (first part of label before colon)
    const groupedMetrics = new Map<string, PerformanceMetric[]>();

    for (const metric of this.metrics) {
      const operation = metric.label.split(":")[0] || metric.label;
      if (!groupedMetrics.has(operation)) {
        groupedMetrics.set(operation, []);
      }
      groupedMetrics.get(operation)?.push(metric);
    }

    // Log stats for each operation type
    for (const [operation, metrics] of groupedMetrics) {
      const durations = metrics.map((m) => m.duration);
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const successRate =
        (metrics.filter((m) => m.success).length / metrics.length) * 100;

      console.log(
        `  ${operation}: ${metrics.length} calls, ${avg.toFixed(2)}ms avg, ${successRate.toFixed(0)}% success`,
      );
    }

    console.groupEnd();
  }

  /**
   * Clear all stored metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
    if (this.isDevelopment) {
      console.log("🗑️  [Performance] Metrics cleared");
    }
  }

  /**
   * Get all metrics (for debugging)
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

// Export singleton instance
export const PerformanceMonitor = new PerformanceMonitorClass();

/**
 * Helper function to create a performance-monitored version of any async function
 *
 * @param label - Label for the operation
 * @param fn - Function to wrap
 * @returns Wrapped function that logs performance
 *
 * @example
 * ```typescript
 * const monitoredFetch = withPerformanceMonitoring(
 *   'fetchUserData',
 *   (uid: string) => getUserDataPropsById(uid)
 * );
 *
 * const data = await monitoredFetch('abc123');
 * ```
 */
export function withPerformanceMonitoring<TArgs extends any[], TReturn>(
  label: string,
  fn: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const labelWithArgs = `${label}(${args.map((a) => String(a).slice(0, 20)).join(", ")})`;
    return PerformanceMonitor.measure(labelWithArgs, () => fn(...args));
  };
}

/**
 * Decorator for class methods (experimental)
 *
 * @example
 * ```typescript
 * class UserRepository {
 *   @performanceMonitored('UserRepository.getById')
 *   async getById(id: string) {
 *     // ... implementation
 *   }
 * }
 * ```
 */
export function performanceMonitored(label: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return PerformanceMonitor.measure(label, () =>
        originalMethod.apply(this, args),
      );
    };

    return descriptor;
  };
}

// Log summary on page unload in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.addEventListener("beforeunload", () => {
    PerformanceMonitor.logSummary();
  });
}
