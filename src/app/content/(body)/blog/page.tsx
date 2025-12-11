import type { Metadata } from "next";

import BlogExtender from "@/components/blog/blog-extender";
import Container from "@/components/layout/Container";
import { getGlobalMetadata } from "@/lib/directus";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "www.chancedee.com";
  const global = await getGlobalMetadata(hostname);
  return global;
}

export default async function AllBlogPage({
  searchParams,
}: { searchParams: any }) {
  return (
    <>
      <section
        className={`relative h-[30dvh] flex justify-center items-center bg-gradient-to-r from-primary-200 to-secondary-200`}
      >
        <Container className="prose max-w-4xl -mt-8 p-6 rounded-xl m-auto">
          <header className="text-center m-auto">
            <h1 className="text-[2rem] xl:text-[3rem] m-auto text-secondary-900">
              {"บทความทั้งหมด"}
            </h1>
          </header>
        </Container>
      </section>
      <BlogExtender />
    </>
  );
}
