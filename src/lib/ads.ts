"use server";
import { readItem, readItems } from "@directus/sdk";

import { type ItemsQuery, directus } from "@/lib/directus";
import type { Author } from "./author";
import type { Category } from "./categories";

export interface Post {
  id?: string;
  date_created?: string;
  tags?: string[];
  content_body?: string;
  slug?: string;
  title?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  publication_date?: string;
  sub_title?: string;
  related_posts?: relatedPost[];
  status?: string;
  open_graph_title?: string;
  open_graph_image?: string;
  twitter_card_title?: string;
  twitter_card_description?: string;
  twitter_card_image?: string;
  view_count?: number;
  author?: Author;
  categories?: Category;
}

export interface relatedPost {
  related_Blog_id: Post;
}

export async function getAds(options?: ItemsQuery): Promise<Array<Post>> {
  const posts = directus.request(
    readItems("Ads", {
      ...options,
      sort: ["-publication_date"],
      fields: options?.fields || ["*", "author.*"],
      filter: {
        ...options?.filter,
        status: {
          _eq: "published",
        },
      },
    }),
  );

  return posts;
}

export async function getAdsById(
  itemId: string,
  options?: ItemsQuery,
): Promise<Post> {
  const post = directus.request(
    readItem("Ads", itemId, {
      ...options,
      fields: ["*", "author.*"],
      filter: {
        ...options?.filter,
        status: {
          _eq: "published",
        },
      },
    }),
  );
  return post;
}

export async function getAdsBySlug(
  slug: Post["slug"],
  options?: ItemsQuery,
): Promise<Post> {
  if (!slug) throw new Error("Invalid slug");
  const items = await getAds({
    ...options,
    fields: ["*", "author.*"],
    filter: {
      slug: {
        _eq: slug,
      },
    },
  });
  if (items.length === 0) {
    throw new Error("Ads not found");
  }
  const ad = items[0];
  if (!ad) {
    throw new Error("Ads not found");
  }
  return ad;
}
