"use client";
import { BookmarkIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { getBookmarkedBlogs } from "@/lib/bookmark";
import type { ItemsQuery } from "@/lib/directus";
import { pageinationAtom } from "@/store/atom-store";
import { useAtomValue } from "jotai";
import useSWRInfinite from "swr/infinite";
import { ExtendedBlogHorizontal } from "../blog/extended-blog-horizontal";
import { LoadingSpinner } from "../common/loading-spinner";

const fetcher = async (params: [slug: string, options?: ItemsQuery]) => {
  // In a real application, you would make an actual API call here
  const res = await getBookmarkedBlogs({ uid: params[0], options: params[1] });
  return res;
};

function BookmarksSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="flex flex-col h-full">
          <CardHeader className="p-0">
            <Skeleton className="w-full h-48 rounded-t-lg" />
          </CardHeader>
          <CardContent className="flex-grow p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

const BookmarkTabs = () => {
  const pagination = useAtomValue(pageinationAtom);
  const { user, loading } = useFirebaseAuth();
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null; // reached the end
    return [
      user?.uid,
      { limit: pagination.limit, offset: pageIndex * pagination.limit },
    ];
  };

  const { data, size, setSize, isLoading, error } = useSWRInfinite(
    getKey,
    fetcher,
  );

  const fetchedData = data ? data.flat() : [];
  const bookmarkPosts =
    data && data.length > 0 && fetchedData[0]?.bookmarked_blogs
      ? fetchedData[0]?.bookmarked_blogs?.map((blog) => blog.Blog_id)
      : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && (data[data.length - 1]?.length ?? 0) < pagination.limit);

  const loadMore = () => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  return (
    <>
      <Suspense fallback={<BookmarksSkeleton />}>
        {<ExtendedBlogHorizontal featuredPosts={bookmarkPosts} />}
        {!isReachingEnd && (
          <Button
            size="default"
            variant="outline"
            className="flex gap-2 lg:gap-4 rounded-full border px-4 lg:px-6 h-12  hover:bg-white hover:border-primary-500 transition-colors duration-700 ease-in-out"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            <p className="text-[1.25rem]">
              {isLoadingMore ? "Loading..." : "Load more"}
            </p>
          </Button>
        )}
      </Suspense>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        bookmarkPosts?.length === 0 && (
          <div className="text-center py-12">
            <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No bookmarks
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by bookmarking some blogs.
            </p>
            <div className="mt-6">
              <Button>
                <Link href="/">Browse Blogs</Link>
              </Button>
            </div>
          </div>
        )
      )}
    </>
  );
};

export { BookmarkTabs };
