import type { ItemsQuery } from "./directus";
import { type Post, getPosts } from "./posts";

export async function searchPosts(
  keyword: string,
  options?: ItemsQuery,
): Promise<Post[]> {
  const items = await getPosts({
    search: keyword,
  });
  console.log("getpost by tag", items.length);
  if (items.length === 0) {
    return [];
  }
  return items;
  // return directus.request(readItem("Blog", slug, options));
}
