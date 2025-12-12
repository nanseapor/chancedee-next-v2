"use server";
import { aggregate, readItem, readItems } from "@directus/sdk";

import { type ItemsQuery, directus } from "@/lib/directus";
import type { Author } from "./author";
import { type Category, getCategoryByShowStatus } from "./categories";

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

export async function getPosts(options?: ItemsQuery): Promise<Array<Post>> {
  const posts = directus.request(
    readItems("Blog", {
      ...options,
      sort: ["-publication_date"],
      fields: options?.fields || ["*", "author.*", "categories.*"],
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

export async function getVisiblePosts(
  options?: ItemsQuery,
): Promise<Array<Post>> {
  const shoiwIds = await getCategoryByShowStatus();
  return getPosts({
    ...options,
    filter: {
      categories: {
        _in: shoiwIds,
      },
    },
  });
}

export const getTotalPostCount = async () => {
  const totalCount = await directus.request(
    aggregate("Blog", {
      aggregate: { count: "*" },
    }),
  );
  return totalCount[0]!.count;
};

export async function getFeaturedPosts(
  options?: ItemsQuery,
): Promise<Array<Post>> {
  const posts = directus.request(
    readItems("Blog", {
      ...options,
      fields: options?.fields || ["*", "author.*", "categories.*"],
      filter: {
        ...options?.filter,
        status: {
          _eq: "published",
        },
        is_featured: {
          _eq: true,
        },
      },
    }),
  );

  return posts;
}

export async function getPostById(
  itemId: string,
  options?: ItemsQuery,
): Promise<Post> {
  const post = directus.request(
    readItem("Blog", itemId, {
      ...options,
      fields: [
        "*",
        "author.*",
        "categories.*",
        "related_posts.related_Blog_id.*",
      ],
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

export async function getPostBySlug(
  slug: Post["slug"],
  options?: ItemsQuery,
): Promise<Post> {
  if (!slug) throw new Error("Invalid slug");
  const items = await getPosts({
    ...options,
    fields: [
      "*",
      "author.*",
      "categories.*",
      "related_posts.related_Blog_id.*",
      "related_posts.related_Blog_id.categories.*",
    ],
    filter: {
      slug: {
        _eq: slug,
      },
    },
  });
  if (items.length === 0) {
    throw new Error("Post not found");
  }
  return items[0]!;
}
