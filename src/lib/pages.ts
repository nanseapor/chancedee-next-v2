import { readItem, readItems } from "@directus/sdk";

import { type ItemsQuery, directus } from "@/lib/directus";

export interface Page {
  id?: string;
  date_created?: string;
  tags?: string[];
  content_body?: string;
  content_type?: string;
  slug?: string;
  title?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  publication_date?: string;
}

export async function getPages(options?: ItemsQuery): Promise<Array<Page>> {
  return directus.request(
    readItems("Blog", {
      ...options,
      filter: {
        ...options?.filter,
        status: {
          _eq: "published",
        },
      },
    }),
  );
}

export async function getPageBySlug(
  slug: Page["slug"],
  options?: ItemsQuery,
): Promise<Page> {
  if (!slug) throw new Error("Invalid slug");
  return directus.request(
    readItem("Blog", slug, {
      ...options,
      filter: {
        ...options?.filter,
        status: {
          _eq: "published",
        },
      },
    }),
  );
}
