import { readItems } from "@directus/sdk";
import { directus } from "./directus";

export async function getHome() {
  return directus.request(
    readItems("Home", {
      fields: [
        "*",
        "pinned_category.Pinned_Category_id.category.*",
        "pinned_category.Pinned_Category_id.pinned_posts.Blog_id.*",
        "pinned_category.Pinned_Category_id.pinned_posts.Blog_id.author.*",
        "pinned_category.Pinned_Category_id.pinned_posts.Blog_id.categories.*",
        "featured_posts.Blog_id.*",
        "featured_posts.Blog_id.author.*",
        "featured_posts.Blog_id.categories.*",
      ],
      filter: {
        status: {
          _eq: "published",
        },
      },
    }),
  );
}
