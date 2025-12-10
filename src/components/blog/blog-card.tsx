"use client";

import getAssets from "@/lib/assets";
import type { Post } from "@/lib/posts";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import AuthorCard from "../content/author-card";
import CatergoryCrumb from "../navigation/category-crumb";
import { AspectRatio } from "../ui/aspect-ratio";
import { Card, CardContent } from "../ui/card";
const BookmarkComponent = dynamic(
  () => import("../content/bookmark-component"),
  { ssr: false },
);

type Size = "normal" | "compact";

const BlogCard = ({ props, size = "normal" }: { props: Post; size?: Size }) => {
  return (
    <Card className="h-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <CardContent className="p-0 flex flex-col h-full w-full">
        <Link href={`/blog/${props.slug}`} className="flex p-5">
          <AspectRatio ratio={16 / 9} className="w-full">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image
                alt={
                  props.meta_title ||
                  "How to build a beautiful landing page in minutes"
                }
                src={
                  props.featured_image
                    ? getAssets(props.featured_image)
                    : "/images/article-1.avif"
                }
                fill
                sizes="(max-width: 640px) 100dvw, (max-width: 768px) 50dvw, 33dvw"
                className="object-cover"
              />
            </div>
          </AspectRatio>
        </Link>
        <div className="w-full flex flex-row">
          <Link
            href={`/blog/${props.slug}`}
            className="flex w-5 shrink-0"
          ></Link>
          <CatergoryCrumb props={props} />
          <Link href={`/blog/${props.slug}`} className="flex w-full"></Link>
        </div>
        <Link
          href={`/blog/${props.slug}`}
          className="flex flex-col justify-between h-full p-5"
        >
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold">{props.title}</h4>
            <p className="mb-auto text-muted-foreground font-light">
              {props.sub_title}
            </p>
          </div>
        </Link>
        <div className="relative h-full w-full">
          <div className="flex w-full shrink-0 min-h-16 h-full justify-end items-end px-5 pb-5">
            <Link href={`/blog/${props.slug}`} className="flex w-full">
              <div className="flex w-full h-full justify-end items-end text-xs text-muted-foreground leading-loose py-2">
                {props.publication_date &&
                  new Date(props.publication_date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
            </Link>
            <BookmarkComponent blog={props} />
          </div>
          <div className="absolute bottom-6 start-5">
            <AuthorCard props={props} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
