"use client";
import { getPosts, getTotalPostCount } from "@/lib/posts";
import { pageinationAtom } from "@/store/atom-store";
import { useAtom } from "jotai";
import Link from "next/link";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { LoadingSpinner } from "../common/loading-spinner";
import { ExtendedBlogSection } from "./extended-blog-section";

const BlogPagination = () => {
  const [pagination, setPagination] = useAtom(pageinationAtom);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null; // reached the end
    return { limit: pagination.limit, offset: pageIndex * pagination.limit };
  };

  const { data: totalPosts } = useSWR("totalPosts", getTotalPostCount);
  const { data, size, setSize, isLoading } = useSWRInfinite(getKey, getPosts);

  const featuredPosts = data ? data.flat() : [];
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

  const totalPages = Math.ceil(Number(totalPosts) / pagination.limit);

  return (
    <section className="px-4  2xl:px-[12rem] flex flex-col items-center gap-6 py-6 sm:py-24 lg:gap-8">
      {isLoading && <LoadingSpinner />}
      {featuredPosts.length > 0 && (
        <ExtendedBlogSection featuredPosts={featuredPosts} />
      )}
      <div>
        <Link href={size <= 2 ? "/" : `?page=${size - 1}`}>
          &laquo; Previous
        </Link>
        {Array.from(Array(totalPages), (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={page === 1 ? "/" : `?page=${page}`}
            className={page === size ? "active" : ""}
          >
            {page}
          </Link>
        ))}
        <Link href={!isLoadingMore ? `?page=${size + 1}` : `?page=${size}`}>
          Next &raquo;
        </Link>
      </div>
    </section>
  );
};

export default BlogPagination;
