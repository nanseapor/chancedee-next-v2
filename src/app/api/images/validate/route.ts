import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

interface ImageValidationParams {
  url: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fallback?: string;
}

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  channels: number;
  hasProfile: boolean;
  hasAlpha: boolean;
}

/**
 * Image validation and optimization middleware
 * Validates, resizes, optimizes, and serves images with caching
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse parameters
  const params: ImageValidationParams = {
    url: searchParams.get('url') || '',
    width: searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined,
    height: searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined,
    quality: searchParams.get('quality') ? parseInt(searchParams.get('quality')!) : 85,
    format: (searchParams.get('format') as 'webp' | 'jpeg' | 'png') || 'webp',
    fallback: searchParams.get('fallback') || '/images/image-placeholder.png'
  };

  console.log('🖼️ Image middleware request:', params);

  // Validate required parameters
  if (!params.url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  // Set cache headers
  const cacheHeaders = {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
    'CDN-Cache-Control': 'public, max-age=86400',
    'Vercel-CDN-Cache-Control': 'public, max-age=86400'
  };

  try {
    // Step 1: Validate and fetch the image
    const imageBuffer = await validateAndFetchImage(params.url, params.fallback!);
    
    // Step 2: Get image metadata
    const metadata = await getImageMetadata(imageBuffer);
    console.log('📊 Image metadata:', metadata);
    
    // Step 3: Check if image needs optimization
    const needsOptimization = shouldOptimizeImage(metadata, params);
    
    if (!needsOptimization) {
      console.log('✅ Image is already optimized, serving original');
      return new NextResponse(imageBuffer as BodyInit, {
        headers: {
          ...cacheHeaders,
          'Content-Type': `image/${metadata.format}`,
          'X-Image-Status': 'original',
          'X-Image-Size': metadata.size.toString(),
          'X-Image-Dimensions': `${metadata.width}x${metadata.height}`
        }
      });
    }

    // Step 4: Optimize the image
    const optimizedBuffer = await optimizeImage(imageBuffer, params, metadata);
    const optimizedMetadata = await getImageMetadata(optimizedBuffer);
    
    console.log('🎯 Image optimized:', {
      originalSize: metadata.size,
      optimizedSize: optimizedMetadata.size,
      savings: `${Math.round((1 - optimizedMetadata.size / metadata.size) * 100)  }%`,
      originalDimensions: `${metadata.width}x${metadata.height}`,
      optimizedDimensions: `${optimizedMetadata.width}x${optimizedMetadata.height}`
    });

    return new NextResponse(optimizedBuffer as BodyInit, {
      headers: {
        ...cacheHeaders,
        'Content-Type': `image/${params.format}`,
        'X-Image-Status': 'optimized',
        'X-Image-Original-Size': metadata.size.toString(),
        'X-Image-Optimized-Size': optimizedMetadata.size.toString(),
        'X-Image-Savings': `${Math.round((1 - optimizedMetadata.size / metadata.size) * 100).toString()  }%`,
        'X-Image-Dimensions': `${optimizedMetadata.width}x${optimizedMetadata.height}`
      }
    });

  } catch (error) {
    console.error('🚨 Image middleware error:', error);
    
    // Try to serve fallback image
    try {
      const fallbackBuffer = await getFallbackImage(params.fallback!);
      
      return new NextResponse(fallbackBuffer as BodyInit, {
        headers: {
          ...cacheHeaders,
          'Content-Type': 'image/png',
          'X-Image-Status': 'fallback',
          'X-Image-Error': error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } catch (fallbackError) {
      console.error('🚨 Fallback image also failed:', fallbackError);
      return new NextResponse('Image processing failed', { status: 500 });
    }
  }
}

/**
 * Validate and fetch image from URL with timeout and error handling
 */
async function validateAndFetchImage(url: string, fallbackPath: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    console.log('🔍 Fetching image from URL:', url);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ChanceDee-ImageBot/1.0',
        'Accept': 'image/*'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Additional validation: check if it's a valid image by trying to process it
    await sharp(buffer).metadata();

    console.log('✅ Image fetched and validated:', {
      url,
      size: buffer.length,
      contentType
    });

    return buffer;

  } catch (error) {
    clearTimeout(timeoutId);
    console.log('❌ Failed to fetch image from URL, trying fallback:', error);
    
    // Try fallback image from current domain first, then local file system
    const fallbackBuffer = await getFallbackImage(fallbackPath);
    
    console.log('✅ Using fallback image:', fallbackPath);
    return fallbackBuffer;
  }
}

/**
 * Get fallback image by trying current domain first, then local file system
 */
async function getFallbackImage(fallbackPath: string): Promise<Buffer> {
  // First try to fetch from current domain (works in production)
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'production'
      ? 'https://dev.chancedee.com' // Default production domain
      : 'http://localhost:3000';
    
    const fallbackUrl = `${baseUrl}${fallbackPath}`;
    console.log('🔄 Trying fallback from domain:', fallbackUrl);
    
    const response = await fetch(fallbackUrl, {
      headers: {
        'User-Agent': 'ChanceDee-ImageBot/1.0',
        'Accept': 'image/*'
      }
    });
    
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log('✅ Fallback image fetched from domain');
      return buffer;
    }
  } catch (domainError) {
    console.log('⚠️ Domain fallback failed:', domainError);
  }
  
  // Fallback to local file system (works in development)
  try {
    const fallbackFullPath = `${process.cwd()}/public${fallbackPath}`;
    console.log('🔄 Trying fallback from file system:', fallbackFullPath);
    const fallbackBuffer = await sharp(fallbackFullPath).toBuffer();
    console.log('✅ Fallback image loaded from file system');
    return fallbackBuffer;
  } catch (fileError) {
    console.error('❌ File system fallback also failed:', fileError);
    throw new Error(`Both domain and file system fallback failed for: ${fallbackPath}`);
  }
}

/**
 * Get comprehensive image metadata
 */
async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length,
    channels: metadata.channels || 0,
    hasProfile: !!metadata.icc,
    hasAlpha: metadata.hasAlpha || false
  };
}

/**
 * Determine intelligent resize dimensions based on original image
 */
function getOptimalDimensions(metadata: ImageMetadata, params: ImageValidationParams): { width?: number; height?: number } {
  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  const originalAspectRatio = originalWidth / originalHeight;
  
  // Maximum dimensions for different use cases
  const MAX_HERO_WIDTH = 1200;
  const MAX_HERO_HEIGHT = 800;
  const MIN_QUALITY_THRESHOLD = 800; // Don't downscale below this width unless necessary
  
  console.log(`📏 Original dimensions: ${originalWidth}x${originalHeight} (ratio: ${originalAspectRatio.toFixed(2)})`);
  
  // If no specific dimensions requested, use intelligent defaults
  if (!params.width && !params.height) {
    // For hero images, ensure good quality across viewports
    if (originalWidth > MAX_HERO_WIDTH || originalHeight > MAX_HERO_HEIGHT) {
      // Scale down large images while maintaining aspect ratio
      const scaleByWidth = MAX_HERO_WIDTH / originalWidth;
      const scaleByHeight = MAX_HERO_HEIGHT / originalHeight;
      const scale = Math.min(scaleByWidth, scaleByHeight);
      
      return {
        width: Math.round(originalWidth * scale),
        height: Math.round(originalHeight * scale)
      };
    }
    
    // Don't upscale smaller images, use original size
    return { width: originalWidth, height: originalHeight };
  }
  
  // If specific dimensions are requested, be smart about it
  let targetWidth = params.width;
  let targetHeight = params.height;
  
  // If only one dimension is specified, calculate the other maintaining aspect ratio
  if (targetWidth && !targetHeight) {
    targetHeight = Math.round(targetWidth / originalAspectRatio);
  } else if (targetHeight && !targetWidth) {
    targetWidth = Math.round(targetHeight * originalAspectRatio);
  }
  
  // Don't upscale beyond original dimensions unless specifically requested
  if (targetWidth! > originalWidth || targetHeight! > originalHeight) {
    console.log(`⚠️ Requested dimensions ${targetWidth}x${targetHeight} larger than original ${originalWidth}x${originalHeight}, using original size`);
    return { width: originalWidth, height: originalHeight };
  }
  
  // Don't downscale too much if it would hurt quality significantly
  if (targetWidth! < MIN_QUALITY_THRESHOLD && originalWidth > MIN_QUALITY_THRESHOLD) {
    const scale = MIN_QUALITY_THRESHOLD / originalWidth;
    console.log(`📈 Preventing excessive downscaling, using minimum quality threshold`);
    return {
      width: Math.round(originalWidth * scale),
      height: Math.round(originalHeight * scale)
    };
  }
  
  return { width: targetWidth, height: targetHeight };
}

/**
 * Determine if image needs optimization based on metadata and parameters
 */
function shouldOptimizeImage(metadata: ImageMetadata, params: ImageValidationParams): boolean {
  const maxSize = 500 * 1024; // 500KB
  
  // Always optimize if image is too large
  if (metadata.size > maxSize) {
    console.log(`🔧 Image needs optimization: size ${metadata.size} > ${maxSize} bytes`);
    return true;
  }
  
  // Always optimize if format conversion is beneficial
  if (params.format === 'webp' && metadata.format !== 'webp') {
    console.log(`🔧 Image needs optimization: format conversion ${metadata.format} → ${params.format}`);
    return true;
  }
  
  // Check if intelligent resizing would be beneficial
  const optimalDimensions = getOptimalDimensions(metadata, params);
  const needsResize = optimalDimensions.width !== metadata.width || optimalDimensions.height !== metadata.height;
  
  if (needsResize) {
    console.log(`🔧 Image needs optimization: intelligent resize ${metadata.width}x${metadata.height} → ${optimalDimensions.width}x${optimalDimensions.height}`);
    return true;
  }
  
  return false;
}

/**
 * Optimize image with resizing, format conversion, and quality adjustment
 */
async function optimizeImage(
  buffer: Buffer, 
  params: ImageValidationParams, 
  metadata: ImageMetadata
): Promise<Buffer> {
  let pipeline = sharp(buffer);
  
  // Use intelligent dimensions based on original image
  const optimalDimensions = getOptimalDimensions(metadata, params);
  
  if (optimalDimensions.width && optimalDimensions.height) {
    console.log(`🎯 Resizing to optimal dimensions: ${optimalDimensions.width}x${optimalDimensions.height}`);
    pipeline = pipeline.resize(optimalDimensions.width, optimalDimensions.height, {
      fit: 'inside', // Maintain aspect ratio
      withoutEnlargement: true // Don't upscale
    });
  }
  
  // Convert format and set quality
  switch (params.format) {
    case 'webp':
      pipeline = pipeline.webp({ 
        quality: params.quality,
        effort: 4 // Good balance of compression vs speed
      });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ 
        quality: params.quality,
        progressive: true
      });
      break;
    case 'png':
      pipeline = pipeline.png({ 
        compressionLevel: 8,
        adaptiveFiltering: true
      });
      break;
  }
  
  // Remove metadata for smaller file size
  pipeline = pipeline.keepMetadata();
  
  return await pipeline.toBuffer();
}