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

const BlogCardHorizontal = ({
  props,
  size = "normal",
}: { props: Post; size?: Size }) => {
  return (
    <Card className="w-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 p-4">
            <Link href={`/blog/${props.slug}`} className="block w-full">
              <AspectRatio ratio={16 / 9} className="w-full">
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
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover rounded-lg"
                />
              </AspectRatio>
            </Link>
          </div>
          <div className="flex flex-col justify-between md:w-2/3 p-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <CatergoryCrumb props={props} />
                <AuthorCard props={props} />
              </div>
              <Link href={`/blog/${props.slug}`} className="block">
                <h4 className="text-xl font-semibold mb-2">{props.title}</h4>
                <p className="text-muted-foreground font-light mb-4">
                  {props.sub_title}
                </p>
              </Link>
            </div>
            <div className="flex items-center justify-end">
              <div className="text-xs text-muted-foreground">
                {props.publication_date &&
                  new Date(props.publication_date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
              <BookmarkComponent blog={props} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCardHorizontal;
