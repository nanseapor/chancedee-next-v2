import type { ItemsQuery } from "./directus";
import { type Post, getPosts } from "./posts";

export async function getPostByTag(
  tag: string,
  options?: ItemsQuery,
): Promise<Post[]> {
  const items = await getPosts({
    filter: {
      tags: {
        _contains: tag,
      },
    },
  });
  console.log("getpost by tag", items.length);
  if (items.length === 0) {
    throw new Error("Post not found");
  }
  return items;
}
