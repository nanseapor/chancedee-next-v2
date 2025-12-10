import { getCategories } from "@/lib/categories";
import { getPosts } from "@/lib/posts";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "www.chancedee.com";

  // Fetch all blog posts
  const posts = await getPosts();
  const categories = await getCategories();

  // Create sitemap entries for blog posts
  interface SitemapEntry {
    url: string;
    lastModified: Date;
    changeFrequency:
      | "yearly"
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "never";
    priority: number;
  }

  const entries: SitemapEntry[] = [];
  entries.push({
    url: `https://${hostname}/`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  });
  entries.push({
    url: `https://${hostname}/blog`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  });
  entries.push({
    url: `https://${hostname}/search`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  });
  entries.push({
    url: `https://${hostname}/contact`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  });
  entries.push({
    url: `https://${hostname}/blog/job-advertisement`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  });
  entries.push({
    url: `https://${hostname}/blog/company-advertisement`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  });
  entries.push({
    url: `https://${hostname}/blog/product-advertisement`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  });
  posts.forEach((post) => {
    entries.push({
      url: `https://${hostname}/blog/${post.slug}`,
      lastModified: post.publication_date
        ? new Date(post.publication_date)
        : new Date(),
      changeFrequency: "yearly",
      priority: 1,
    });
  });

  categories.forEach((category) => {
    entries.push({
      url: `https://${hostname}/category/${category.slug}`,
      lastModified: category.date_updated
        ? new Date(category.date_updated)
        : new Date(),
      changeFrequency: "yearly",
      priority: 1,
    });
  });

  return entries;
}
