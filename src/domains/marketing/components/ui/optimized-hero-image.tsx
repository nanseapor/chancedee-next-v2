'use client';

import clsx from 'clsx';
import { getValidatedImageUrl, ImagePresets } from '@/lib/utils/client/image-middleware';

interface OptimizedHeroImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Client component that uses image middleware for validation and optimization
 * Uses regular img tag to test middleware directly without Next.js Image interference
 */
export default function OptimizedHeroImage({
  src,
  alt,
  width,
  height,
  className
}: OptimizedHeroImageProps) {
  // Generate optimized image URL - let middleware decide optimal dimensions
  const optimizedSrc = getValidatedImageUrl(src || '', {
    // Don't pass width/height - let middleware intelligently decide based on original image
    format: ImagePresets.hero.format,
    quality: ImagePresets.hero.quality,
    fallback: ImagePresets.hero.fallback
  });

  console.log('🖼️ OptimizedHeroImage (intelligent sizing):', {
    originalSrc: src,
    optimizedSrc,
    providedDimensions: `${width}x${height}`,
    hasOriginalImage: !!src,
    note: 'Middleware will determine optimal dimensions based on original image'
  });

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading="eager" // Load immediately since it's a hero image
      className={clsx(
        // Base styling
        'w-full object-cover',
        // Responsive classes
        'md:static md:box-border md:w-1/2 md:overflow-hidden md:px-0 md:align-baseline',
        // Loading state
        'transition-opacity duration-300',
        // Custom classes
        className
      )}
      onError={(e) => {
        console.error('🚨 Image failed to load from middleware:', optimizedSrc);
        // Fallback to placeholder if middleware fails
        e.currentTarget.src = '/images/image-placeholder.png';
      }}
    />
  );
}