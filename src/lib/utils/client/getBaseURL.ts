export function getBaseUrl() {
  // if (typeof window !== "undefined") {
  //   // Browser should use relative path
  //   return "";
  // }
  // if (process.env.VERCEL_URL) {
  //   // Reference for vercel.com
  //   return `https://${process.env.VERCEL_URL}`;
  // }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // Assume localhost
  return process.env.BASE_URL || `http://localhost:${process.env.PORT ?? 3000}`;
}
