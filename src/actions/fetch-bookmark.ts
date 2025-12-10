"use server";

import { getBookmarkedBlogs } from "@/lib/bookmark";

export async function fetchBookmarkedBlogs(uid: string) {
  try {
    const data = await getBookmarkedBlogs({ uid });
    return data[0]?.bookmarked_blogs?.map((item) => item.Blog_id) || [];
  } catch (error) {
    console.error("Error fetching bookmarked blogs:", error);
    return [];
  }
}
