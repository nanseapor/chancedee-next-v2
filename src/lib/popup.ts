"use server";
import { readItem, readItems } from "@directus/sdk";

import { type ItemsQuery, directus } from "@/lib/directus";
import type { Author } from "./author";

export interface Popup {
  id?: string;
  date_created?: string;
  slug?: string;
  title?: string;
  featured_image?: string;
  publication_date?: string;
  sub_title?: string;
  status?: string;
  author?: Author;
  popup_link_url?: string;
}

export interface relatedPost {
  related_Blog_id: Popup;
}

export async function getPopups(options?: ItemsQuery): Promise<Array<Popup>> {
  const posts = directus.request(
    readItems("Popup", {
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

export async function getPopupById(
  itemId: string,
  options?: ItemsQuery,
): Promise<Popup> {
  const post = directus.request(
    readItem("Popup", itemId, {
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

export async function getPopupBySlug(
  slug: Popup["slug"],
  options?: ItemsQuery,
): Promise<Popup> {
  if (!slug) throw new Error("Invalid slug");
  const items = await getPopups({
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
  return items[0];
}
