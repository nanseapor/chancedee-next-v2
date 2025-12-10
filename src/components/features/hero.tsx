import { Card, CardContent } from "@/components/ui/card";
import getAssets from "@/lib/assets";
import type { Post } from "@/lib/posts";
import { shuffle } from "@/lib/shuffling";
import Image from "next/image";
import Link from "next/link";
import AuthorCard from "../content/author-card";
import CatergoryCrumb from "../navigation/category-crumb";
import { AspectRatio } from "../ui/aspect-ratio";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function Hero({ featuredPosts }: { featuredPosts: Post[] }) {
  // const featuredPosts = await getFeaturedPosts();
  // const featuredPosts = originalPosts.sort(() => Math.random() - 0.5);
  const shuffledItems = shuffle(featuredPosts);
  const mainFeature = shuffledItems[0];
  const secondaryFeatures = shuffledItems.slice(1, 5);
  const padding = Array.from(Array(4 - secondaryFeatures.length).keys());

  return (
    <section
      id={"hero"}
      className="px-4  2xl:px-[12rem] flex flex-col items-center gap-10 py-6 sm:py-10 lg:gap-8"
    >
      <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl text-balance text-center">
        บทความแนะนำสำหรับคุณ
      </h2>
      <div className="flex gap-6 flex-col xl:flex-row w-full">
        {mainFeature ? (
          <Card className="rounded-lg border bg-card text-card-foreground shadow-sm xl:w-3/5 hover:shadow-xl transistion-shadow duration-300 ease-in-out">
            <CardContent className="p-0 flex flex-col h-full">
              <Link href={`/blog/${mainFeature.slug}`} className="flex p-6">
                {/* <div className="relative h-[60dvh] rounded-lg overflow-hidden w-full"> */}
                <AspectRatio
                  ratio={16 / 9}
                  className="w-full h-full m-auto rounded-lg overflow-hidden"
                >
                  <Image
                    alt="Image"
                    src={
                      mainFeature.featured_image
                        ? getAssets(mainFeature.featured_image)
                        : "/images/placeholder.png"
                    }
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    fill
                    className="object-cover"
                  />
                </AspectRatio>
                {/* </div> */}
              </Link>
              <div className="w-full flex flex-row">
                <Link
                  href={`/blog/${mainFeature.slug}`}
                  className="flex w-6 shrink-0"
                ></Link>
                <CatergoryCrumb props={mainFeature} />
                <Link
                  href={`/blog/${mainFeature.slug}`}
                  className="flex w-full"
                ></Link>
              </div>
              <Link
                href={`/blog/${mainFeature.slug}`}
                className="flex flex-col gap-6 p-6 pt-4"
              >
                <h3 className="text-[2rem] font-semibold leading-tight tracking-tight">
                  {mainFeature.meta_title}
                </h3>
                <p className="text-base text-muted-foreground font-light">
                  {mainFeature.meta_description}
                </p>
              </Link>
              <div className="relative h-full">
                <Link
                  href={`/blog/${mainFeature.slug}`}
                  className="block h-full min-h-16 shrink-0"
                ></Link>
                <div className="absolute bottom-6 start-6">
                  <AuthorCard props={mainFeature} />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-lg border bg-card text-card-foreground shadow-sm xl:w-3/5">
            <CardContent className="p-6 flex flex-col gap-4">
              <AspectRatio
                ratio={16 / 9}
                className="w-full h-full m-auto rounded-lg overflow-hidden"
              >
                <Image
                  alt="Image"
                  src="/images/placeholder.png"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  fill
                  className="object-cover"
                />
              </AspectRatio>
              <div className="flex flex-col gap-6">
                <div className="flex flex-row gap-2">
                  <div className="rounded-full border bg-accent px-3 py-0.5 text-xs text-muted-foreground">
                    Category
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <h3 className="text-[2rem] text-muted-foreground font-semibold leading-none tracking-tight mt-3">
                    Title
                  </h3>
                  <p className="text-sm text-muted-foreground font-light">
                    Description
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="gap-5 flex flex-col xl:w-[40dvw]">
          {secondaryFeatures.map((post, index) => (
            <Card
              key={index}
              className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-xl transistion-shadow duration-300 ease-in-out h-full"
            >
              <CardContent className="flex flex-col sm:flex-row p-0 h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex p-4 xl:p-6 w-full sm:w-2/5 shrink-0 xl:pr-0"
                >
                  <AspectRatio
                    ratio={16 / 9}
                    className="w-full h-full m-auto rounded-lg overflow-hidden"
                  >
                    <Image
                      alt="Image"
                      src={
                        post.featured_image
                          ? getAssets(post.featured_image)
                          : "/images/placeholder.png"
                      }
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </AspectRatio>
                </Link>
                <div className="flex flex-col justify-center">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex shrink-0 h-6 w-full"
                  ></Link>
                  <div className="w-full flex flex-row">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex w-6 shrink-0"
                    ></Link>
                    <CatergoryCrumb props={post} />
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex w-full"
                    ></Link>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex p-6 pt-0 w-full h-full"
                  >
                    <h3 className="text-lg font-semibold leading-normal tracking-tight mt-3">
                      {post.title}
                    </h3>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {padding.map((_, index) => (
            <Card
              key={index}
              className="rounded-lg border bg-card text-card-foreground shadow-sm h-full"
            >
              <CardContent className="flex flex-col sm:flex-row p-0 h-full">
                <div className="flex p-4 xl:p-6 w-full sm:w-2/5 shrink-0 xl:pr-0">
                  <AspectRatio
                    ratio={16 / 9}
                    className="w-full h-full m-auto rounded-lg overflow-hidden"
                  >
                    <Image
                      alt="Image"
                      src="/images/placeholder.png"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </AspectRatio>
                </div>
                <div className="flex flex-col p-4 xl:p-6 pl-0 xl:pl-4  justify-center">
                  <div className="flex flex-row gap-2">
                    <div className="rounded-full border bg-accent px-3 py-0.5 text-xs text-muted-foreground">
                      Category
                    </div>
                  </div>
                  <div className="flex w-full">
                    <h3 className="text-lg text-muted-foreground font-semibold leading-normal tracking-tight mt-3">
                      Title
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
