import type { Post } from "@/lib/posts";
import BlogCard from "./blog-card";

export const dynamic = "force-dynamic";
export const revalidate = false;

export function ExtendedBlogSection({
  featuredPosts,
}: { featuredPosts: Post[] }) {
  return (
    <div className="mt-6 sm:mt-7 grid auto-rows-fr grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
      {featuredPosts.map((post, index) => {
        return <BlogCard key={index} props={post} />;
      })}
    </div>
  );
}
