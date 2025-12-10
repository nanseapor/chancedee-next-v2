"use client";

import { useBookmarkedBlogs } from "@/hooks/use-bookmarked-blogs";
import { addBookMark, removeBookmark } from "@/lib/bookmark";
import type { Post } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { userAtom } from "@/store/atom-store";
import { useAtomValue } from "jotai";
import { Bookmark } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface BookmarkButtonProps {
  blog: Post;
  isBookmarked?: boolean;
  setIsBookmarked?: (isBookmarked: boolean) => void;
  className?: string;
}

export function BookmarkButton({ blog, className }: BookmarkButtonProps) {
  const user = useAtomValue(userAtom);
  const pathname = usePathname();
  const router = useRouter();

  const { blogs: bookmark, isLoading } = useBookmarkedBlogs();
  const [isBookmarked, setIsBookmarked] = useState<boolean>();

  useEffect(() => {
    // Set bookmark initial states
    if (!isLoading && bookmark && bookmark.length > 0) {
      console.log("Bookmark is loaded");
      const status = !!bookmark.find((item) => item.id === blog.id);
      setIsBookmarked(status);
    } else {
      setIsBookmarked(undefined);
    }
  }, [bookmark, blog.id, isLoading]);

  const toggleBookmark = useCallback(() => {
    const newState = !isBookmarked;
    if (isLoading) {
      console.warn("Bookmark is loading. Please wait.");
      return; // Prevent multiple clicks
    } else {
      if (user?.uid && blog.id) {
        console.log("Toggle bookmark", newState);
        setIsBookmarked && setIsBookmarked(newState);
        if (newState) {
          // Add bookmark
          addBookMark({ uid: user.uid, blogId: blog.id }).then((res) => {
            console.log("Bookmark added.", res);
          });
        } else {
          // Remove bookmark
          removeBookmark({ uid: user.uid, blogId: blog.id }).then((res) => {
            console.log("Bookmark removed.", res);
            if (pathname === `/profile`) {
              router.refresh();
            }
          });
        }
      } else {
        localStorage.setItem("redirect", pathname);
        window.location.href = "/auth/sign-in";
        console.warn("User is not logged in or blog id is not available.");
      }
    }
  }, [isBookmarked, setIsBookmarked, user?.uid, blog.id, isLoading]);

  return (
    <button
      onClick={toggleBookmark}
      disabled={bookmark === undefined || isLoading || !blog.id}
      className={cn(
        "p-2 rounded-full transition-colors duration-200",
        isBookmarked
          ? "text-yellow-500 hover:text-yellow-600"
          : "text-gray-500 hover:text-gray-600",
        className,
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className={cn(
          "w-6 h-6 transition-transform duration-200",
          isBookmarked && "fill-current scale-110",
          !user && "text-gray-300",
        )}
      />
    </button>
  );
}
