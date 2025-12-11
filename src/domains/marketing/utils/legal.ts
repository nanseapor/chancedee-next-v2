import { readItems } from "@directus/sdk";

import { directus, ItemsQuery } from "./directus";

export interface Legal {
  id?: number;
  date_created?: string;
  content_body?: string;
  slug?: string;
  title?: string;
  publication_date?: string;
  categories?: number;
  status?: string;
}

export async function getLegals(options?: ItemsQuery): Promise<Array<Legal>> {
  const legals = await directus.request(readItems("Terms_and_policy", {
    ...options,
    fields: options?.fields || ["*"],
    filter: {
      ...options?.filter,
      status: {
        _eq: "published"
      },
    }
  }));

  return legals;
}


export async function getLegalBySlug(
  slug: Legal["slug"],
  options?: ItemsQuery,
): Promise<Legal> {
  if (!slug) throw new Error("Invalid slug");
  const items = await getLegals({
    ...options,
    filter: {
      slug: {
        _eq: slug,
      },
    },
  });
  if (items.length === 0) {
    throw new Error("Legal not found");
  }
  return items[0];
}
