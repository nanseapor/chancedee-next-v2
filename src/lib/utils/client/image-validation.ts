/**
 * Image validation utilities for checking if images can be loaded
 */

/**
 * Check if an image URL can be loaded successfully
 * @param url - The image URL to validate
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns Promise<boolean> - true if image loads successfully
 */
export async function validateImageUrl(
  url: string,
  timeout = 5000,
): Promise<boolean> {
  if (!url || typeof url !== "string") {
    console.log("❌ Image validation failed: Invalid URL provided", { url });
    return false;
  }

  // Check if it's a valid URL format
  try {
    new URL(url, window?.location?.origin || "https://dev.chancedee.com");
  } catch (error) {
    console.log("❌ Image validation failed: Invalid URL format", {
      url,
      error,
    });
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Image validation timeout:", { url, timeout });
      resolve(false);
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId);
      console.log("✅ Image validation successful:", {
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      resolve(true);
    };

    img.onerror = (error) => {
      clearTimeout(timeoutId);
      console.log("❌ Image validation failed: Load error", { url, error });
      resolve(false);
    };

    // Set crossOrigin to handle CORS issues
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

/**
 * Validate multiple image URLs and return the first valid one
 * @param urls - Array of image URLs to try
 * @param timeout - Timeout per image in milliseconds
 * @returns Promise<string | null> - First valid URL or null
 */
export async function findValidImageUrl(
  urls: string[],
  timeout = 3000,
): Promise<string | null> {
  console.log("🔍 Validating image URLs:", {
    count: urls.length,
    urls: urls.slice(0, 3),
  });

  for (const url of urls) {
    if (await validateImageUrl(url, timeout)) {
      console.log("✅ Found valid image URL:", url);
      return url;
    }
  }

  console.log("❌ No valid image URLs found from:", urls);
  return null;
}

/**
 * Client-side image preloader with cache
 */
class ImageCache {
  private cache = new Map<string, boolean>();
  private pendingValidations = new Map<string, Promise<boolean>>();

  /**
   * Validate and cache image URL result
   */
  async validateWithCache(url: string, timeout = 5000): Promise<boolean> {
    // Return cached result if available
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      console.log("📋 Using cached image validation result:", {
        url,
        valid: cached,
      });
      return cached;
    }

    // Return pending validation if in progress
    if (this.pendingValidations.has(url)) {
      console.log("⏳ Waiting for pending image validation:", { url });
      return await this.pendingValidations.get(url)!;
    }

    // Start new validation
    const validationPromise = validateImageUrl(url, timeout);
    this.pendingValidations.set(url, validationPromise);

    try {
      const isValid = await validationPromise;

      // Cache the result
      this.cache.set(url, isValid);
      this.pendingValidations.delete(url);

      console.log("💾 Cached image validation result:", {
        url,
        valid: isValid,
      });
      return isValid;
    } catch (error) {
      this.pendingValidations.delete(url);
      console.error("🚨 Image validation error:", { url, error });
      return false;
    }
  }

  /**
   * Clear cache for specific URL or all URLs
   */
  clearCache(url?: string) {
    if (url) {
      this.cache.delete(url);
      this.pendingValidations.delete(url);
      console.log("🗑️ Cleared image cache for:", url);
    } else {
      this.cache.clear();
      this.pendingValidations.clear();
      console.log("🗑️ Cleared entire image cache");
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      cachedCount: this.cache.size,
      pendingCount: this.pendingValidations.size,
      cachedUrls: Array.from(this.cache.keys()).slice(0, 5), // Show first 5
    };
  }
}

// Global image cache instance
export const imageCache = new ImageCache();

/**
 * Hook-like function to validate image with caching (for server components)
 * @param url - Image URL to validate
 * @param timeout - Timeout in milliseconds
 * @returns Promise<boolean>
 */
export async function useImageValidation(
  url: string,
  timeout = 3000,
): Promise<boolean> {
  if (!url) return false;

  // For server-side, we'll do a simple HEAD request check instead
  if (typeof window === "undefined") {
    try {
      // Server-side validation using fetch with HEAD request
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(timeout),
      });
      const contentType = response.headers.get("content-type");
      const isValid =
        response.ok && (contentType?.startsWith("image/") ?? false);
      console.log("🖥️ Server-side image validation:", {
        url,
        valid: isValid,
        status: response.status,
        contentType,
      });
      return isValid;
    } catch (error) {
      console.log("❌ Server-side image validation failed:", {
        url,
        error: String(error),
      });
      return false;
    }
  }

  // Client-side validation with cache
  return await imageCache.validateWithCache(url, timeout);
}
