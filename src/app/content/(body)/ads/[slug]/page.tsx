import type { Metadata } from "next";

import RelatedBlog from "@/components/blog/related-blog";
import AuthorCard from "@/components/content/author-card";
import Container from "@/components/layout/Container";
import CatergoryCrumb from "@/components/navigation/category-crumb";
import TagCrumb from "@/components/navigation/tag-crumb";
import { getAdsBySlug } from "@/lib/ads";
import getAssets from "@/lib/assets";
import { updateCollectionItem } from "@/lib/directus";
import { type Media, getMediaByFiles } from "@/lib/media";
import parse from "html-react-parser";
import { JSDOM } from "jsdom";
import { CalendarDays } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";

interface PostParams {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PostParams): Promise<Metadata> {
  const { slug } = await params;
  const post = await getAdsBySlug(slug, {
    fields: ["title", "meta_title", "meta_description", "featured_image"],
  });
  const headersList = await headers();
  const hostname = headersList.get("host") || "www.chancedee.com";
  return {
    title: `${post.meta_title}`,
    description: `${post.meta_description}`,
    openGraph: {
      type: "website", // This sets the og:type
      title: `${post.open_graph_title ? post.open_graph_title : post.meta_title}`,
      description: `${post.meta_description}`,
      url: `https://${hostname}/ads/${slug}`,
    },
  };
}

function extractIdFromUrl(url: string) {
  const regex = /\/assets\/([^/]+)\.(jpg|jpeg|png|gif|webp|svg)(?:\?.*)?$/i;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function extractImageSourceDOM(html: string): string[] {
  const dom = new JSDOM(html);
  const images = dom.window.document.getElementsByTagName("img");
  return Array.from(images)
    .map((img: any) => extractIdFromUrl(img.src))
    .filter((img) => img !== null);
}

function replaceImageTags(
  html: string,
  media: Media[],
  replacementFn: (src: string, alt: string, mediaList: Media[]) => string,
): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const images = document.getElementsByTagName("img");

  Array.from(images).forEach((img: HTMLImageElement) => {
    const src = img.getAttribute("src") || "";
    const alt = img.getAttribute("alt") || "";

    const replacementHtml = replacementFn(src, alt, media);
    const replacementElement = document.createElement("div");
    replacementElement.innerHTML = replacementHtml;

    // Find the nearest parent <p> tag
    const parentP = img.closest("p");

    if (parentP) {
      // If a parent <p> tag is found, replace it
      parentP.parentNode?.replaceChild(replacementElement.firstChild!, parentP);
    } else {
      // If no parent <p> tag is found, replace the img tag itself
      img.parentNode?.replaceChild(replacementElement.firstChild!, img);
    }
  });

  return document.body.innerHTML;
}

const replacementFunction = (src: string, alt: string, mediaList: Media[]) => {
  const strippedSource = extractIdFromUrl(src);
  if (strippedSource) {
    const mediaFile = mediaList.find((media) => media.file === strippedSource);
    if (mediaFile) {
      // Create a new JSDOM instance
      const dom = new JSDOM();
      const document = dom.window.document;

      // Create the main div
      const figure = document.createElement("figure");
      figure.className = "w-full flex flex-col items-center";

      // Create the image element
      const img = document.createElement("img");
      img.src = src;
      img.alt = mediaFile.alt_text || alt;
      img.className = "mb-0 w-full max-w-4xl object-cover";

      // Create the paragraph element
      const figcaption = document.createElement("figcaption");
      figcaption.className = "mt-2 text-sm text-gray-600";
      figcaption.textContent = mediaFile.title || "";

      // Append the img and p to the main div
      figure.appendChild(img);
      figure.appendChild(figcaption);

      // Return the HTML string
      return figure.outerHTML;
    }
  }
  return `<img src="${src}" alt="${alt}" />`;
};

export default async function AdsPage({ params }: PostParams) {
  const { slug } = await params;
  const data = await getAdsBySlug(slug);
  let newCount = 1;
  if (data.id) {
    newCount = data.view_count ? data.view_count + 1 : 1;
    updateCollectionItem("Blog", data.id, { view_count: newCount });
  }

  const imageSources = extractImageSourceDOM(data.content_body || "");

  let modifiedHtml = data.content_body || "";
  if (imageSources.length > 0) {
    const media = await getMediaByFiles(imageSources);
    modifiedHtml = replaceImageTags(
      data.content_body || "",
      media,
      replacementFunction,
    );
  }

  return (
    <>
      <section className="font-light">
        <Container className="prose max-w-4xl pt-10 lg:pt-28">
          <CatergoryCrumb props={data} size="md" />
          <header className="flex flex-col items-start text-start mx-auto mb-16 mt-4 ">
            <h1 className="text-[2.5rem] leading-normal text-start font-semibold mb-4">
              {data.title}
            </h1>
            <p className="text-lg">{data.sub_title}</p>
            <div className=" flex flex-row gap-6 text-slate-600 items-center justify-center">
              <AuthorCard props={data} />
              <div className="flex flex-row gap-1 items-center text-sm">
                <CalendarDays className="w-6 h-6 shrink-0" />{" "}
                {data.date_created &&
                  new Date(data.date_created).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
              </div>
              <p>อ่านแล้ว {newCount}</p>
            </div>
            <Image
              alt="Image"
              src={
                data.featured_image
                  ? getAssets(data.featured_image)
                  : "/images/placeholder.png"
              }
              width={1024}
              height={768}
              className="object-cover w-full h-full rounded-xl overflow-hidden"
            />
          </header>
          <div className="font-light">{parse(modifiedHtml || "")}</div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-2 h-fit">
              {data.tags &&
                data.tags.map((tag, index) => (
                  <TagCrumb key={index} link={`${tag}`}>
                    {tag}
                  </TagCrumb>
                ))}
            </div>
          </div>
        </Container>
      </section>
      {data.related_posts && data.related_posts.length > 0 ? (
        <section className="px-4 lg:container flex flex-col items-center py-10">
          <h1 className="text-2xl font-semibold">บทความที่เกี่ยวข้อง</h1>
          <div className="mt-6 flex flex-wrap justify-center auto-rows-fr gap-4">
            {data.related_posts
              .filter((blog) => blog.related_Blog_id.status === "published")
              .map((rpost, index) => {
                const post = rpost.related_Blog_id;
                return <RelatedBlog key={index} props={post} />;
              })}
          </div>
        </section>
      ) : (
        <div className="block w-full h-20" />
      )}
    </>
  );
}
