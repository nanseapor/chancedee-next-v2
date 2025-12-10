"use server";
import { readItem, readItems } from "@directus/sdk";
import { getCategoryByShowStatus } from "./categories";
import { type ItemsQuery, directus } from "./directus";
import { type Post, getPosts } from "./posts";

export interface Author {
  id?: string; // UUID for author's id
  status?: string; // e.g., "published"
  user_created?: string; // UUID for the user who created it
  date_created?: string; // ISO date string
  name?: string; // Author's name
  slug?: string; // URL-friendly name
  bio?: string; // Short biography
  job_title?: string; // Job title
  profile_picture?: string;
  area_of_expertise?: string; // Area of expertise
  social_media_links?: string; // Social media links
  company?: string; // Company
}

export async function getAuthorById(
  itemId: string,
  options?: ItemsQuery,
): Promise<Author> {
  return directus.request(
    readItem("Author", itemId, {
      ...options,
      filter: {
        status: {
          _eq: "published",
        },
      },
    }),
  );
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const author = await directus.request(
    readItems("Author", {
      filter: {
        slug: {
          _eq: slug,
        },
      },
    }),
  );
  if (author.length > 0) {
    return author[0];
  }
  return null;
}

export async function getAuthorImageById(itemId: string): Promise<string> {
  const author = await directus.request(
    readItem("Author", itemId, {
      fields: ["profile_picture"],
    }),
  );
  const photo = author.profile_picture
    ? String(process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT) +
      "assets/" +
      author.profile_picture
    : "/images/placeholder.png";
  return photo;
}

export async function getPostByAuthorSlug(
  slug: string,
  options?: ItemsQuery,
): Promise<Post[]> {
  const shoiwIds = await getCategoryByShowStatus();
  const posts = await getPosts({
    ...options,
    filter: {
      ...options?.filter,
      categories: {
        _in: shoiwIds,
      },
      author: {
        slug: {
          _eq: slug,
        },
      },
    },
  });
  return posts;
}

export async function getPostByAuthor(
  authorId: string,
  options?: ItemsQuery,
): Promise<Post[]> {
  const items = await getPosts({
    ...options,
    filter: {
      ...options?.filter,
      author: {
        _eq: authorId,
      },
    },
  });
  console.log("getpost by Author", items.length);
  if (items.length === 0) {
    throw new Error("Post not found");
  }
  return items;
}
