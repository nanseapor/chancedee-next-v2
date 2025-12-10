import getAssets from "@/lib/assets";
import type { Post } from "@/lib/posts";
import Image from "next/image";
import Link from "next/link";
import CategoryCrumb from "../navigation/category-crumb";
import { AspectRatio } from "../ui/aspect-ratio";
import { Card, CardContent } from "../ui/card";

type Size = "normal" | "compact";

export const dynamic = "force-dynamic";

const RelatedBlog = ({
  props,
  size = "normal",
}: { props: Post; size?: Size }) => {
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-xl transistion-shadow duration-300 ease-in-out w-full lg:w-[512px] min-h-max">
      <CardContent className="flex flex-col sm:flex-row p-0 h-full">
        <Link
          href={`/blog/${props.slug}`}
          className="flex p-4 xl:p-6 w-full sm:w-2/5 shrink-0 xl:pr-0"
        >
          <AspectRatio
            ratio={16 / 9}
            className="w-full h-full m-auto rounded-lg overflow-hidden"
          >
            <Image
              alt="Image"
              src={
                props.featured_image
                  ? getAssets(props.featured_image)
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
            href={`/blog/${props.slug}`}
            className="flex shrink-0 h-6 w-full"
          ></Link>
          <div className="w-full flex flex-row">
            <Link
              href={`/blog/${props.slug}`}
              className="flex w-6 shrink-0"
            ></Link>
            <CategoryCrumb props={props} />
            <Link href={`/blog/${props.slug}`} className="flex w-full"></Link>
          </div>
          <Link
            href={`/blog/${props.slug}`}
            className="flex p-6 pt-0 w-full h-full"
          >
            <h3 className="text-lg font-semibold leading-normal tracking-tight mt-3">
              {props.title}
            </h3>
          </Link>
        </div>
      </CardContent>
    </Card>
    // <Card className="h-full shadow-none hover:border-primary-500 max-w-80">
    //   <CardContent className="p-0 flex flex-col h-full w-full gap-6">
    //     <Link href={`/blog/${props.slug}`} className="flex">
    //       <AspectRatio ratio={16 / 9} className="w-full">
    //         <div className="relative w-full h-full rounded-sm overflow-hidden">
    //           <Image
    //             alt={props.meta_title || props.title || ""}
    //             src={props.featured_image ? getAssets(props.featured_image) : "/images/article-1.avif"}
    //             fill
    //             sizes="(max-width: 640px) 100dvw, (max-width: 768px) 50dvw, 33dvw"
    //             className="object-cover"
    //           />
    //         </div>
    //       </AspectRatio>
    //     </Link>
    //     <div className="flex flex-col h-full gap-4 shadow-primary-500 hover:drop-shadow-xl transition-shadow">
    //       <Link href={`/blog/${props.slug}`} className="flex flex-col justify-between h-full">
    //         <div className="flex flex-col gap-4">
    //           <h4 className="text-lg font-semibold">
    //             {props.title}
    //           </h4>
    //         </div>
    //       </Link>
    //     </div>
    //   </CardContent>
    // </Card>
  );
};

export default RelatedBlog;
