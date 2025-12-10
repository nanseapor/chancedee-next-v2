"use client";

import {
  bookmarkedBlogsAtom,
  initializeBookmarkedBlogsAtom,
  userAtom,
} from "@/store/atom-store";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

export function useBookmarkedBlogs() {
  const user = useAtomValue(userAtom);
  const [bookmarkedBlogs] = useAtom(bookmarkedBlogsAtom);
  const initializeBookmarkedBlogs = useSetAtom(initializeBookmarkedBlogsAtom);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeData() {
      if (user?.uid) {
        setIsLoading(true);
        try {
          await initializeBookmarkedBlogs(user.uid);
        } catch (error) {
          console.error("Error initializing bookmarked blogs:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (user) {
      initializeData();
    }
  }, [user?.uid, initializeBookmarkedBlogs]);

  return { blogs: bookmarkedBlogs, isLoading };
}
