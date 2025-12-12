import { readItems } from "@directus/sdk";

import { type ItemsQuery, directus } from "@/lib/directus";
import { type RetryOptions, retryWithBackoff } from "@/lib/utils/retry";

export interface Home {
  id?: string;
  meta_title?: string;
  meta_description?: string;
  opengraph_title?: string;
  opengraph_description?: string;
  opengraph_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  hero_title?: string;
  hero_sub_title?: string;
  hero_image?: string;
  hero_media?: [];
  featured_companies?: Array<{
    Featured_Company_id: {
      featured_url: string;
      featured_image: string;
    };
  }>;
  featured_jobs?: Array<{
    Featured_Jobs_id: {
      featured_url: string;
      featured_image: string;
    };
  }>;
  job_categories?: Array<{
    Job_Categories_id: {
      id: string;
      name: string;
      description: string;
      url: string;
      thumbnail: string;
    };
  }>;
}

/**
 * Custom retry configuration for getHome with faster retries
 */
const HOME_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // Start with 1 second (faster than default)
  maxDelay: 8000, // Max 8 seconds
  timeout: 25000, // 25 second timeout per request
};

/**
 * Validates if the home data is complete and has essential fields
 */
function validateHomeData(data: Array<Home>): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    console.log("❌ Home data validation failed: empty or invalid array");
    return false;
  }

  const homeItem = data[0];

  // Check for essential text content fields (more lenient - don't require image)
  const hasEssentialTextFields =
    homeItem &&
    (homeItem.hero_title || homeItem.hero_sub_title || homeItem.meta_title);

  if (!hasEssentialTextFields) {
    console.log(
      "❌ Home data validation failed: missing essential text fields",
      {
        has_hero_title: !!homeItem?.hero_title,
        has_hero_sub_title: !!homeItem?.hero_sub_title,
        has_meta_title: !!homeItem?.meta_title,
      },
    );
    return false;
  }

  // Log hero_image status separately (not required for validation but important for debugging)
  const heroImageStatus = homeItem?.hero_image;
  if (!heroImageStatus) {
    console.log(
      "⚠️ Hero image missing from Directus data - will use fallback image",
    );
  } else if (
    typeof heroImageStatus === "string" &&
    heroImageStatus.trim().length > 0
  ) {
    console.log("📷 Hero image found in Directus data:", heroImageStatus);
  } else {
    console.log(
      "⚠️ Hero image field exists but is empty - will use fallback image",
    );
  }

  // console.log("✅ Home data validation passed", {
  //   has_hero_title: !!homeItem.hero_title,
  //   has_hero_sub_title: !!homeItem.hero_sub_title,
  //   has_hero_image: !!homeItem.hero_image,
  //   hero_image_value: homeItem.hero_image,
  //   has_meta_title: !!homeItem.meta_title,
  //   featured_companies_count: homeItem.featured_companies?.length || 0,
  //   featured_jobs_count: homeItem.featured_jobs?.length || 0,
  //   job_categories_count: homeItem.job_categories?.length || 0,
  // });

  return true;
}

/**
 * Fallback data when Directus fails completely
 */
const FALLBACK_HOME_DATA: Home = {
  id: "fallback",
  hero_title: "Welcome to ChanceDee",
  hero_sub_title: "Find your dream job today",
  meta_title: "ChanceDee - Find Your Dream Job",
  meta_description:
    "Discover amazing career opportunities with Thailand's leading job platform",
  hero_image: "/images/image-placeholder.png", // Add fallback hero image
  featured_companies: [],
  featured_jobs: [],
  job_categories: [],
};

export async function getHome(options?: ItemsQuery): Promise<Array<Home>> {
  console.log("🎯 Starting getHome operation with custom retry configuration");

  const result = await retryWithBackoff(async () => {
    console.log("🔄 Fetching home data from Directus...");

    // Create timeout controller for this request
    const abortController = new AbortController();
    const timeoutId = setTimeout(
      () => abortController.abort(),
      HOME_RETRY_CONFIG.timeout!,
    );

    try {
      const response = await directus.request(
        readItems("Job_Market_Home", {
          fields: [
            "*",
            "featured_jobs.Featured_Jobs_id.*",
            "featured_companies.Featured_Company_id.*",
            "job_categories.id.*",
            "job_categories.Job_Categories_id.*",
          ],
          filter: {
            ...options?.filter,
            status: {
              _eq: "published",
            },
          },
        }),
      );

      clearTimeout(timeoutId);

      // console.log("🔍 Directus raw response:", {
      //   type: typeof response,
      //   isArray: Array.isArray(response),
      //   isNull: response === null,
      //   isUndefined: response === undefined,
      //   length: Array.isArray(response) ? response.length : "N/A",
      //   keys:
      //     typeof response === "object" && response
      //       ? Object.keys(response).slice(0, 10)
      //       : "N/A",
      //   hasHomeData:
      //     typeof response === "object" && response && "hero_title" in response,
      // });

      // Check if response looks like request config (has method, headers, etc.)
      if (
        typeof response === "object" &&
        response &&
        ("method" in response || "headers" in response || "signal" in response)
      ) {
        console.error(
          "❌ Received request config instead of response data. This indicates a Directus SDK issue.",
        );
        throw new Error(
          "Invalid response format from Directus: received request config instead of data",
        );
      }

      // Validate and normalize response
      if (response === null || response === undefined) {
        console.log("❌ Directus returned null/undefined, retry needed");
        throw new Error("Directus returned null/undefined response");
      }

      let normalizedResponse: Array<Home>;

      if (!Array.isArray(response)) {
        console.log(
          "📦 Directus returned non-array response, wrapping in array:",
          typeof response,
        );
        // Verify it's a valid home data object before wrapping
        if (typeof response === "object" && response) {
          normalizedResponse = [response as Home];
        } else {
          console.error(
            "❌ Directus returned invalid response format:",
            typeof response,
          );
          throw new Error("Invalid response format from Directus");
        }
      } else {
        normalizedResponse = response as Array<Home>;
      }

      console.log(
        `📋 Normalized response with ${normalizedResponse.length} items`,
      );

      // Validate the data quality - this will trigger retry if data is incomplete
      if (!validateHomeData(normalizedResponse)) {
        throw new Error(
          "Home data validation failed - incomplete or missing essential fields",
        );
      }

      console.log(`✅ Home data successfully fetched and validated`);
      return normalizedResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      // Log the specific error for debugging
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(`🚫 Home data fetch attempt failed: ${errorMessage}`);

      throw error;
    }
  }, HOME_RETRY_CONFIG);

  if (result.success && result.data) {
    console.log(`🎉 getHome succeeded after ${result.attempts} attempts`);
    return result.data;
  }

  // Log error but don't crash the application
  console.error(
    `💥 Failed to fetch home data after ${result.attempts} attempts, using fallback data:`,
    result.error,
  );

  // Return fallback data to prevent application crash
  return [FALLBACK_HOME_DATA];
}
