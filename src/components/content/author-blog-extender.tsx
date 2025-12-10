"use client";
import { getPostByAuthorSlug } from "@/lib/author";
import type { ItemsQuery } from "@/lib/directus";
import { pageinationAtom } from "@/store/atom-store";
import { useAtom } from "jotai";
import useSWRInfinite from "swr/infinite";
import { ExtendedBlogSection } from "../blog/extended-blog-section";
import { LoadingSpinner } from "../common/loading-spinner";
import { Button } from "../ui/button";

const fetcher = async (params: [slug: string, options?: ItemsQuery]) => {
  // In a real application, you would make an actual API call here
  const res = await getPostByAuthorSlug(params[0], params[1]);
  return res;
};

const AuthorBlogExtender = ({ slug }: { slug: string }) => {
  const [pagination, setPagination] = useAtom(pageinationAtom);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null; // reached the end
    return [
      slug,
      { limit: pagination.limit, offset: pageIndex * pagination.limit },
    ];
  };

  const { data, size, setSize, isLoading } = useSWRInfinite(getKey, fetcher);
  const featuredPosts = data ? data.flat() : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < pagination.limit);

  const loadMore = () => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  return (
    <section className="px-4  2xl:px-[12rem] flex flex-col items-center gap-6 py-6 lg:gap-8">
      {isLoading && <LoadingSpinner />}
      {featuredPosts.length > 0 && (
        <ExtendedBlogSection featuredPosts={featuredPosts} />
      )}
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
    </section>
  );
};

export default AuthorBlogExtender;
