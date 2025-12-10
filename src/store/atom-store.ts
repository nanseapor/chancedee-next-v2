"use client";
import { fetchBookmarkedBlogs } from "@/domains/content/services/server/actions/bookmark";
import type { Post } from "@/lib/posts";
import type { User } from "firebase/auth";
import { atom, createStore } from "jotai";

export const chancedeeStore = createStore();
export const searchAtom = atom("");
export const pageinationAtom = atom({
  limit: 18,
  offset: 0,
});

export const popupBannerAtom = atom(false);
export const userAtom = atom<User | null>(null);

export const bookmarkedBlogsAtom = atom<Post[]>();

export const initializeBookmarkedBlogsAtom = atom(
  null,
  async (get, set, uid: string) => {
    const blogs = await fetchBookmarkedBlogs(uid);
    set(bookmarkedBlogsAtom, blogs);
  },
);

// FAB Chat atoms
export const fabChatOpenAtom = atom(false);
export const fabChatPanelOpenAtom = atom(false);
