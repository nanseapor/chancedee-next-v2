import type { Post } from "@/lib/posts";
import Link from "next/link";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const CategoryCrumb = ({
  props,
  size = "xs",
}: { props: Post; size?: Size }) => {
  if (!props.categories?.slug) return null;

  const sizeClasses: Record<Size, string> = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <div className="flex shrink-0">
      <Link
        href={`/category/${props.categories?.slug}`}
        className="flex shrink-0 hover:border-secondary-900 transition-all w-fit ease-out hover:scale-110 duration-700 no-underline"
      >
        <span
          className={`rounded-full border bg-accent px-3 py-0.5 ${sizeClasses[size]} text-accent-foreground`}
          style={{
            color: props.categories.border_color,
            backgroundColor: props.categories.fill_color,
            borderColor: props.categories.border_color,
          }}
        >
          {props.categories?.name}
        </span>
      </Link>
    </div>
  );
};

export default CategoryCrumb;
