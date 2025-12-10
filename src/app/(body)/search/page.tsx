import type { Metadata } from "next";

import BlogCard from "@/components/blog/blog-card";
import Container from "@/components/layout/Container";
import SearchBar from "@/components/navigation/search-bar";
import { getGlobalMetadata } from "@/lib/directus";
import { searchPosts } from "@/lib/search";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = false;
interface SearchParams {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  searchParams,
}: SearchParams): Promise<Metadata> {
  const headersList = headers();
  const hostname = headersList.get("host") || "www.chancedee.com";
  const global = await getGlobalMetadata(hostname);
  global.title = `คำค้นหา CHANCEDEE | ${searchParams?.keyword || global.title}`;
  global.openGraph.title = `คำค้นหา CHANCEDEE | ${searchParams?.keyword || global.title}`;
  global.twitter.title = `คำค้นหา CHANCEDEE | ${searchParams?.keyword || global.title}`;
  return global;
}

export default async function SearchPage({ searchParams }: SearchParams) {
  if (!searchParams?.keyword) {
    return (
      <section
        className={`relative h-[30dvh] flex justify-center items-center bg-gradient-to-r from-primary-200 to-secondary-200`}
      >
        <Container className="absolute prose max-w-4xl p-10 rounded-xl">
          <header className="text-center m-auto">
            <h1 className="text-5xl leading-none mb-4">
              No search term provided
            </h1>
          </header>
        </Container>
      </section>
    );
  }
  const search = Array.isArray(searchParams.keyword)
    ? searchParams.keyword.map((kw) => decodeURI(kw)).join(" ")
    : decodeURI(searchParams.keyword);
  const featuredPosts = await searchPosts(search);

  return (
    <>
      <section
        className={`relative h-[30dvh] flex justify-center items-center bg-gradient-to-r from-primary-200 to-secondary-200`}
      >
        <div className="bg-white flex w-full max-w-screen-sm rounded-lg shadow-md">
          <SearchBar />
        </div>
      </section>
      <section className="px-4 lg:container flex flex-col items-center gap-6 py-16 sm:gap-7">
        {featuredPosts.length === 0 && (
          <div className="flex flex-col text-center justify-center w-full h-[30dvh]">
            <h2 className="text-2xl font-semibold">
              ขออภัย เราหาบล็อกด้วยคำว่า "{search}" ไม่เจอ
            </h2>
            <p className="text-lg">แต่ไม่ต้องกังวล ลองใช้คำค้นหาอื่นดูไหม?</p>
          </div>
        )}
        <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {featuredPosts.map((post, index) => {
            return <BlogCard key={index} props={post} />;
          })}
        </div>
      </section>
    </>
  );
}
