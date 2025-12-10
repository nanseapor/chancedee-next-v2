import type { Metadata } from "next";

import BlogCard from "@/components/blog/blog-card";
import getAssets from "@/lib/assets";
import { getCategoryBySlug } from "@/lib/categories";
import { getGlobalMetadata } from "@/lib/directus";
import { type Post, getPosts } from "@/lib/posts";
import Image from "next/image";

export const dynamic = "force-dynamic";
const adsSlug = "ads";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const Category = await getCategoryBySlug(adsSlug, {
    fields: ["meta_title", "meta_description"],
  });
  global.title = `CATEGORY | ${Category?.meta_title || global.title}`;
  global.openGraph.title = `CATEGORY | ${Category?.meta_title || global.title}`;
  global.twitter.title = `CATEGORY | ${Category?.meta_title || global.title}`;
  return global;
}

export default async function AdsPage() {
  const data = await getCategoryBySlug(adsSlug);
  let featuredPosts: Post[] = [];
  if (data.id) {
    featuredPosts = await getPosts({
      filter: {
        categories: {
          _eq: data.id,
        },
      },
    });
  }

  return (
    <>
      <section className={`px-4 lg:container pt-5 lg:pt-16`}>
        <div className=" relative h-[50dvh] flex justify-center items-center">
          <Image
            alt="Image"
            src={
              data.category_image
                ? getAssets(data.category_image)
                : "/images/article-1.avif"
            }
            fill
            className="object-cover w-full h-full rounded-lg overflow-hidden"
          />
          <div className="absolute max-w-4xl mx-6 p-6 sm:p-10 rounded-xl bg-white/90 backdrop-blur-sm">
            <div className="flex flex-col  w-full h-full items-center justify-center gap-6 m-auto">
              <h1 className="text-[2rem] xl:text-[3rem] leading-none">
                {data.name}
              </h1>
              <div className="text-base">{data.meta_title}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 lg:container flex flex-col items-center gap-6 py-6 lg:py-12 sm:gap-7">
        {featuredPosts.length === 0 && (
          <div className="flex flex-col text-center justify-center w-full h-[30dvh]">
            <h2 className="text-2xl font-semibold">
              ขออภัย เราหาบล็อกที่คุณต้องการไม่เจอ
            </h2>
            <p className="text-lg">
              แต่ไม่ต้องกังวล คุณสามารถเลือกดูบล็อกอื่นๆ ได้ที่หน้าหลัก
            </p>
          </div>
        )}
        <div className="lg:mt-6 grid auto-rows-fr grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {featuredPosts.map((post, index) => {
            return <BlogCard key={index} props={post} />;
          })}
        </div>
      </section>
    </>
  );
}
