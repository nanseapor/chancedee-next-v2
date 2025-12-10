// TODO: This is SSR blog lists loader, if no longer be used, please remove it.

import type { Category } from "@/lib/categories";
import type { Post } from "@/lib/posts";
import BlogCard from "../blog/blog-card";

export const dynamic = "force-dynamic";
export const revalidate = false;

export async function HomeContentSection({
  category,
  featuredPosts,
}: { category: Category; featuredPosts: Post[] }) {
  return (
    <section className="px-4  2xl:px-[12rem] flex flex-col items-center gap-6 py-6 sm:py-10 lg:gap-8">
      <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl text-balance text-center">
        {category.name}
      </h2>
      <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
        {featuredPosts.map((post, index) => {
          return <BlogCard key={index} props={post} />;
        })}
      </div>
      {/* <Link href={`/category/${category.slug}`}>
        <Button
          size="default"
          variant="outline"
          className="flex gap-2 lg:gap-4 rounded-full border px-4 lg:px-6 h-12  hover:bg-white hover:border-primary-500 transition-colors duration-700 ease-in-out"
        >
          <p className="text-base">อ่าน {category.name} ทั้งหมด</p>
        </Button>
      </Link> */}
    </section>
  );
}
