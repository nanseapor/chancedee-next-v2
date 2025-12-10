"use server";
import { readItems } from "@directus/sdk";
import {
  type ItemsQuery,
  createCollectionItem,
  deleteCollectionItem,
  directus,
} from "./directus";
import type { Post } from "./posts";

interface Bookmarks {
  id?: string;
  firebase_uid?: string;
  bookmarked_blogs?: [
    {
      Blog_id: Post;
    },
  ];
}

export const getBookmarkedBlogs = async ({
  uid,
  options,
}: {
  uid: string;
  options?: ItemsQuery;
}): Promise<Array<Bookmarks>> => {
  console.warn("Getting bookmarked blogs for", uid);
  return directus.request(
    readItems("User_Bookmark", {
      ...options,
      fields: [
        "*",
        "bookmarked_blogs.Blog_id.*",
        "bookmarked_blogs.Blog_id.categories.*",
        "bookmarked_blogs.Blog_id.author.*",
      ],
      filter: {
        firebase_uid: {
          _eq: uid,
        },
        status: {
          _eq: "published",
        },
      },
    }),
  );
};

export const addBookMark = async ({
  uid,
  blogId,
}: {
  uid: string;
  blogId: string;
}) => {
  const existing = await getBookmarkedBlogs({ uid });
  if (!existing || existing.length === 0 || !existing[0].id) {
    return createCollectionItem("User_Bookmark", {
      status: "published",
      firebase_uid: uid,
      bookmarked_blogs: [],
    }).then((res) => {
      if (!res.id) {
        throw new Error(
          "Failed to create user bookmark id cannot be found",
          res,
        );
      }
      const bookmark = {
        User_Bookmark_id: res.id,
        Blog_id: blogId,
      };
      return createCollectionItem("User_Bookmark_Blog", bookmark);
    });
  } else {
    const existingBookmark = existing[0]?.bookmarked_blogs?.find((item) => {
      item.Blog_id.id === blogId;
    });
    if (!!existingBookmark) {
      throw new Error("Bookmark already added to the list");
    } else {
      const bookmark = {
        User_Bookmark_id: existing[0].id,
        Blog_id: blogId,
      };
      return createCollectionItem("User_Bookmark_Blog", bookmark);
    }
  }
};

export const removeBookmark = async ({
  uid,
  blogId,
}: {
  uid: string;
  blogId: string;
}) => {
  const bookmarks = await getBookmarkedBlogs({ uid });
  if (!bookmarks || bookmarks.length === 0 || !bookmarks[0].id) {
    return {
      error: "RECORD_NOT_UNIQUE",
      message: "ไม่สามารถยกเลิกบุคมาร์คได้เนื่องจากไม่มีบุคมาร์คนี้ในระบบ",
      email: ["ไม่สามารถยกเลิกบุคมาร์คได้เนื่องจากไม่มีบุคมาร์คนี้ในระบบ"],
    };
  }
  const existing = await directus.request(
    readItems("User_Bookmark_Blog", {
      filter: {
        User_Bookmark_id: {
          _eq: bookmarks[0].id,
        },
        Blog_id: {
          _eq: blogId,
        },
      },
    }),
  );
  console.warn("Deleting bookmark blog", existing[0]);
  if (!existing || existing.length === 0 || !existing[0].id) {
    return {
      error: "RECORD_NOT_UNIQUE",
      message: "ไม่สามารถยกเลิกบุคมาร์คได้เนื่องจากไม่มีบุคมาร์คนี้ในระบบ",
      email: ["ไม่สามารถยกเลิกบุคมาร์คได้เนื่องจากไม่มีบุคมาร์คนี้ในระบบ"],
    };
  }
  return deleteCollectionItem("User_Bookmark_Blog", existing[0].id);
};
