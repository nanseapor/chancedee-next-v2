import type { Post } from "@/lib/posts";
import BlogCardHorizontal from "./blog-card-horizontal";

export const dynamic = "force-dynamic";
export const revalidate = false;

export function ExtendedBlogHorizontal({
  featuredPosts,
}: { featuredPosts: Post[] }) {
  return (
    <div className="mt-6 sm:mt-7 grid auto-rows-fr grid-cols-1 gap-7">
      {featuredPosts.map((post, index) => {
        return <BlogCardHorizontal key={index} props={post} size="compact" />;
      })}
    </div>
  );
}
