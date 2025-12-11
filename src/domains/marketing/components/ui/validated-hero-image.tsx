"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { findValidImageUrl } from '@/lib/utils/client/image-validation';

interface ValidatedHeroImageProps {
  primaryImageSrc?: string;
  fallbackImageSrc: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
}

/**
 * Client component that validates hero images before displaying them
 * Falls back to a reliable placeholder if the primary image fails to load
 */
export default function ValidatedHeroImage({
  primaryImageSrc,
  fallbackImageSrc,
  alt,
  width,
  height,
  sizes,
  className
}: ValidatedHeroImageProps) {
  const [validImageSrc, setValidImageSrc] = useState<string>(fallbackImageSrc);
  const [isLoading, setIsLoading] = useState<boolean>(!!primaryImageSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function validateImages() {
      if (!primaryImageSrc) {
        console.log('📷 No primary image provided, using fallback:', fallbackImageSrc);
        setValidImageSrc(fallbackImageSrc);
        setIsLoading(false);
        return;
      }

      console.log('🔍 Starting hero image validation:', { primaryImageSrc, fallbackImageSrc });
      setIsLoading(true);
      setHasError(false);

      try {
        // Try to find a valid image from primary and fallback options
        const imagesToTry = [primaryImageSrc, fallbackImageSrc];
        const validUrl = await findValidImageUrl(imagesToTry, 3000);

        if (!isMounted) return; // Component unmounted during validation

        if (validUrl) {
          console.log('✅ Valid hero image found:', validUrl);
          setValidImageSrc(validUrl);
          setHasError(validUrl === fallbackImageSrc && validUrl !== primaryImageSrc);
        } else {
          console.error('❌ No valid hero images found, using fallback as last resort');
          setValidImageSrc(fallbackImageSrc);
          setHasError(true);
        }
      } catch (error) {
        console.error('🚨 Hero image validation error:', error);
        if (isMounted) {
          setValidImageSrc(fallbackImageSrc);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    validateImages();

    return () => {
      isMounted = false;
    };
  }, [primaryImageSrc, fallbackImageSrc]);

  // Show loading state with a subtle skeleton
  if (isLoading) {
    return (
      <div
        className={clsx(
          'animate-pulse bg-neutral-200 dark:bg-neutral-700',
          'flex items-center justify-center',
          className
        )}
        style={{ width, height: Math.min(height, 400) }} // Reasonable max height for skeleton
      >
        <div className="text-neutral-400 dark:text-neutral-500">
          <svg
            className="h-12 w-12"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      <Image
        src={validImageSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={clsx(
          className,
          // Add subtle visual indicator if we're using fallback due to error
          hasError && 'opacity-90 ring-1 ring-yellow-200 dark:ring-yellow-800'
        )}
        priority={true} // Hero images should load with high priority
        onError={() => {
          console.error('🚨 Image failed to load even after validation:', validImageSrc);
          // Last resort: try to use fallback if we're not already using it
          if (validImageSrc !== fallbackImageSrc) {
            console.log('🔄 Attempting final fallback to:', fallbackImageSrc);
            setValidImageSrc(fallbackImageSrc);
            setHasError(true);
          }
        }}
      />
      
      {/* Development-only error indicator */}
      {process.env.NODE_ENV === 'development' && hasError && (
        <div className="absolute top-2 left-2 z-10 rounded bg-yellow-500/90 px-2 py-1 text-xs text-white">
          Using fallback image
        </div>
      )}
    </>
  );
}