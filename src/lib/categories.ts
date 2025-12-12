import { readItem, readItems } from "@directus/sdk";

import { type ItemsQuery, directus } from "@/lib/directus";
import { retryDirectusOperation } from "@/lib/utils/retry";
import type { Post } from "./posts";

export interface Category {
  id?: number;
  status?: string;
  sort?: number | null;
  user_created?: string;
  date_created?: string; // ISO 8601 date string
  user_updated?: string;
  date_updated?: string; // ISO 8601 date string
  name?: string;
  slug?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  border_color?: string; // Hex color code
  fill_color?: string; // Hex color code
  category_image?: string;
  category_thumbnail?: string;
  pinned_post?: Post;
}

export async function getCategories(
  options?: ItemsQuery,
): Promise<Array<Category>> {
  const isShowIds = await getCategoryByShowStatus();

  const result = await retryDirectusOperation("getCategories", () =>
    directus.request(
      readItems("Category", {
        ...options,
        filter: {
          id: {
            _in: isShowIds,
          },
        },
      }),
    ),
  );

  if (!result.success) {
    throw result.error || new Error("Failed to fetch categories");
  }

  return result.data as Array<Category>;
}

export async function getCategoryById(
  itemId: string,
  options?: ItemsQuery,
): Promise<Category> {
  const result = await retryDirectusOperation("getCategoryById", () =>
    directus.request(readItem("Category", itemId, options)),
  );

  if (!result.success) {
    throw result.error || new Error("Failed to fetch category by ID");
  }

  return result.data as Category;
}

export async function getCategoryBySlug(
  slug: Category["slug"],
  options?: ItemsQuery,
): Promise<Category> {
  if (!slug) throw new Error("Invalid slug");

  const result = await retryDirectusOperation("getCategoryBySlug", () =>
    directus.request(
      readItems("Category", {
        fields: ["id"],
        filter: {
          slug: {
            _eq: slug,
          },
        },
      }),
    ),
  );

  if (!result.success) {
    throw result.error || new Error("Failed to fetch category by slug");
  }

  const items = result.data as Array<Category>;
  if (items.length === 0) {
    throw new Error("Category not found");
  }

  const categoryId = items[0]?.id;
  if (!categoryId) {
    throw new Error("Category ID is missing");
  }

  return getCategoryById(String(categoryId), options);
}

export async function getCategoryByShowStatus(): Promise<string[]> {
  const result = await retryDirectusOperation("getCategoryByShowStatus", () =>
    directus.request(
      readItems("Category", {
        fields: ["id"],
        filter: {
          is_in_menu: {
            _eq: true,
          },
        },
      }),
    ),
  );

  if (!result.success) {
    throw (
      result.error || new Error("Failed to fetch categories by show status")
    );
  }

  const items = result.data as Array<Category>;
  if (items.length === 0) {
    throw new Error("Category not found");
  }

  const categoryIds = items.map((item) => String(item.id));
  return categoryIds;
}
