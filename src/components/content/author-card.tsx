import getAssets from "@/lib/assets";
import type { Post } from "@/lib/posts";
import Image from "next/image";
import Link from "next/link";

const AuthorCard = ({ props }: { props: Post }) => {
  return (
    <Link
      href={props.author?.slug ? `/author/${props.author?.slug}` : "#"}
      className="flex flex-row gap-2 items-center max-w-56 no-underline"
    >
      <div className="flex flex-wrap w-8 h-8 overflow-hidden rounded-full gap-2 border-2 border-secondary-50 hover:border-primary-500 transition-colors duration-500">
        <Image
          alt={
            props.meta_title ||
            "How to build a beautiful landing page in minutes"
          }
          src={
            props.author?.profile_picture
              ? getAssets(props.author.profile_picture)
              : "/images/article-1.avif"
          }
          width={500}
          height={150}
          className="object-cover rounded-lg m-auto"
        />
      </div>
      <div className="flex flex-col gap-0">
        <p className="m-auto no-underline text-secondary-950 hover:text-primary-500 transition-colors duration-500">
          {props.author?.name}
        </p>
      </div>
    </Link>
  );
};

export default AuthorCard;
