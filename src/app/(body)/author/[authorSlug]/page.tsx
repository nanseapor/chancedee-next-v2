import AuthorBlogExtender from "@/components/content/author-blog-extender";
import Container from "@/components/layout/Container";
import getAssets from "@/lib/assets";
import { getAuthorBySlug } from "@/lib/author";
import { getGlobalMetadata } from "@/lib/directus";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";

interface SlugParams {
  params: {
    authorSlug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SlugParams): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "www.chancedee.com";
  const global = await getGlobalMetadata(hostname);
  global.title = `มุมนักเขียน CHANCEDEE`;
  global.openGraph.title = `มุมนักเขียน CHANCEDEE`;
  global.twitter.title = `มุมนักเขียน CHANCEDEE`;
  return global;
}

export default async function TagsPage({ params }: SlugParams) {
  const author = await getAuthorBySlug(params.authorSlug);

  return (
    <>
      <section className="relative py-4 flex justify-center items-center">
        <Container className="prose max-w-4xl p-4 sm:p-6 rounded-xl m-auto">
          <header className="text-center m-auto">
            <div className="rounded-full h-32 w-32 sm:h-40 sm:w-40 flex items-center justify-center m-auto bg-gradient-to-r from-primary-200 to-secondary-200 my-4 sm:my-6">
              <Image
                src={
                  author?.profile_picture
                    ? getAssets(author.profile_picture)
                    : "/public/images/logo44.png"
                }
                alt={author?.name || "Author Image"}
                width={144}
                height={144}
                className="rounded-full m-auto bg-white"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl m-auto text-secondary-900 font-bold mb-4">
              {author?.name}
            </h1>
            <div className="space-y-2 px-4 sm:px-6 md:px-8">
              {author?.bio && (
                <p className="text-sm sm:text-base lg:text-lg text-gray-800 max-w-2xl mx-auto">
                  {author.bio}
                </p>
              )}
              <div className="flex flex-row gap-6">
                {author?.job_title && (
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">
                    {author.job_title}
                  </p>
                )}
                {author?.area_of_expertise && (
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">
                    {author.area_of_expertise}
                  </p>
                )}
              </div>
            </div>
          </header>
        </Container>
      </section>
      <AuthorBlogExtender slug={params.authorSlug} />
    </>
  );
}
