import type { Metadata } from "next";

import BlogCard from "@/components/blog/blog-card";
import Container from "@/components/layout/Container";
import { getGlobalMetadata } from "@/lib/directus";
import { getPostByTag } from "@/lib/tags";
import { headers } from "next/headers";

interface TagsParams {
  params: {
    tagSlug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TagsParams): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "www.chancedee.com";
  const global = await getGlobalMetadata(hostname);
  global.title = `TAG CHANCEDEE | ${params?.tagSlug || global.title}`;
  global.openGraph.title = `TAG CHANCEDEE | ${params?.tagSlug || global.title}`;
  global.twitter.title = `TAG CHANCEDEE | ${params?.tagSlug || global.title}`;
  return global;
}

export default async function TagsPage({ params }: TagsParams) {
  const tag = decodeURI(params.tagSlug);
  const featuredPosts = await getPostByTag(tag);

  console.log("tag", tag);

  return (
    <>
      <section
        className={`relative h-[30dvh] flex justify-center items-center bg-gradient-to-r from-primary-200 to-secondary-200`}
      >
        <Container className="prose max-w-4xl -mt-8 p-6 rounded-xl m-auto">
          <header className="text-center m-auto">
            <h1 className="text-[2rem] xl:text-[3rem] m-auto text-secondary-900">
              {tag}
            </h1>
          </header>
        </Container>
      </section>
      <section className="px-4 lg:container  flex flex-col items-center gap-6 py-16 sm:gap-7">
        <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {featuredPosts.map((post, index) => {
            return <BlogCard key={index} props={post} />;
          })}
        </div>
      </section>
    </>
  );
}
