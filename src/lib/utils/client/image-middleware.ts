/**
 * Client utilities for using the image validation and optimization middleware
 */

interface ImageMiddlewareOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  fallback?: string;
}

/**
 * Get the base URL for the current environment
 */
function getBaseUrl(): string {
  // Server-side
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL || "https://dev.chancedee.com";
  }

  // Client-side
  return window.location.origin;
}

/**
 * Generate URL for image middleware with validation and optimization
 * @param imageUrl - The original image URL to validate and optimize
 * @param options - Optimization options
 * @returns Absolute URL to the middleware endpoint for Next.js Image compatibility
 */
export function getValidatedImageUrl(
  imageUrl: string,
  options: ImageMiddlewareOptions = {},
): string {
  if (!imageUrl) {
    return options.fallback || "/images/image-placeholder.png";
  }

  // If it's already a local image, return as-is
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
    return imageUrl;
  }

  const params = new URLSearchParams();
  // Don't double-encode - URLSearchParams.set() already handles encoding
  params.set("url", imageUrl);

  if (options.width) params.set("width", options.width.toString());
  if (options.height) params.set("height", options.height.toString());
  if (options.quality) params.set("quality", options.quality.toString());
  if (options.format) params.set("format", options.format);
  if (options.fallback) params.set("fallback", options.fallback);

  // Return absolute URL for Next.js Image optimization compatibility
  const baseUrl = getBaseUrl();
  const middlewareUrl = `${baseUrl}/api/images/validate?${params.toString()}`;

  console.log("🔗 Generated absolute middleware URL:", {
    original: imageUrl,
    middleware: middlewareUrl,
    baseUrl,
  });

  return middlewareUrl;
}

/**
 * Predefined configurations for common use cases
 */
export const ImagePresets = {
  hero: {
    width: 800,
    height: 600,
    format: "webp" as const,
    quality: 85,
    fallback: "/images/image-placeholder.png",
  },

  thumbnail: {
    width: 300,
    height: 200,
    format: "webp" as const,
    quality: 80,
    fallback: "/images/image-placeholder.png",
  },

  avatar: {
    width: 150,
    height: 150,
    format: "webp" as const,
    quality: 90,
    fallback: "/icons/ui-avatar-default.svg",
  },

  card: {
    width: 400,
    height: 250,
    format: "webp" as const,
    quality: 85,
    fallback: "/images/image-placeholder.png",
  },
} as const;

/**
 * Generate validated image URL using preset configuration
 * @param imageUrl - Original image URL
 * @param preset - Preset name from ImagePresets
 * @returns Middleware URL with preset options
 */
export function getValidatedImageUrlWithPreset(
  imageUrl: string,
  preset: keyof typeof ImagePresets,
): string {
  return getValidatedImageUrl(imageUrl, ImagePresets[preset]);
}

/**
 * Generate responsive image URLs for different screen sizes
 * @param imageUrl - Original image URL
 * @param options - Base options to extend
 * @returns Object with different sizes for responsive images
 */
export function getResponsiveImageUrls(
  imageUrl: string,
  options: ImageMiddlewareOptions = {},
) {
  const baseOptions = { format: "webp" as const, quality: 85, ...options };

  return {
    mobile: getValidatedImageUrl(imageUrl, { ...baseOptions, width: 480 }),
    tablet: getValidatedImageUrl(imageUrl, { ...baseOptions, width: 768 }),
    desktop: getValidatedImageUrl(imageUrl, { ...baseOptions, width: 1200 }),
    original: getValidatedImageUrl(imageUrl, baseOptions),
  };
}

/**
 * Generate Next.js Image component compatible props
 * @param imageUrl - Original image URL
 * @param options - Optimization options
 * @returns Props object for Next.js Image component
 */
export function getImageProps(
  imageUrl: string,
  options: ImageMiddlewareOptions & {
    alt: string;
    width: number;
    height: number;
    sizes?: string;
    priority?: boolean;
  },
) {
  const { alt, width, height, sizes, priority, ...middlewareOptions } = options;

  return {
    src: getValidatedImageUrl(imageUrl, middlewareOptions),
    alt,
    width,
    height,
    sizes: sizes || `(max-width: 768px) 100vw, ${width}px`,
    priority: priority || false,
  };
}

/**
 * Preload critical images using the middleware
 * @param imageUrls - Array of image URLs to preload
 * @param options - Optimization options
 */
export function preloadImages(
  imageUrls: string[],
  options: ImageMiddlewareOptions = {},
): void {
  if (typeof window === "undefined") return; // Server-side guard

  imageUrls.forEach((url) => {
    if (!url) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = getValidatedImageUrl(url, options);
    link.onload = () => console.log("✅ Preloaded image:", url);
    link.onerror = () => console.log("❌ Failed to preload image:", url);

    document.head.appendChild(link);
  });
}

/**
 * Development helper to log image optimization stats
 */
export function logImageStats(
  imageUrl: string,
  options: ImageMiddlewareOptions = {},
): void {
  if (process.env.NODE_ENV !== "development") return;

  const middlewareUrl = getValidatedImageUrl(imageUrl, options);

  console.group("🖼️ Image Middleware Stats");
  console.log("Original URL:", imageUrl);
  console.log("Middleware URL:", middlewareUrl);
  console.log("Options:", options);
  console.groupEnd();
}
