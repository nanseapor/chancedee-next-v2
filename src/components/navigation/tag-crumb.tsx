import Link from "next/link";

const TagCrumb = ({
  link,
  children,
}: { link: string; children: React.ReactNode }) => {
  const url = decodeURIComponent(link).trim();
  if (!url || url === "") return <></>;
  return (
    <Link
      href={`/tags/${url}`}
      className="flex shrink-0 no-underline hover:border-secondary-900 transition-all w-fit ease-out hover:scale-110 duration-700"
    >
      <span
        className={`rounded-full border bg-accent px-3 py-0.5 text-xs font-light text-accent-foreground `}
      >
        {children}
      </span>
    </Link>
  );
};

export default TagCrumb;
