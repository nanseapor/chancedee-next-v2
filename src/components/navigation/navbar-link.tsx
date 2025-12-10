"use client";
import type { Category } from "@/lib/categories";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavbarLink = ({
  category,
  mobile,
}: { category: Category; mobile?: boolean }) => {
  const pathname = usePathname();
  if (mobile) {
    return (
      <Link
        key={category.slug}
        href={`/category/${category.slug}`}
        className={`flex pl-4 py-2 cursor-pointer items-center text-lg rounded-sm text-secondary-900 transition-colors hover:text-foreground ${
          pathname.endsWith(`/category/${category.slug}`)
            ? "bg-primary-100 text-primary-600"
            : "hover:bg-primary-100"
        }`}
      >
        {category.name}
        <br />
      </Link>
    );
  } else {
    return (
      <Link
        key={category.slug}
        href={`/category/${category.slug}`}
        className={`flex rounded-lg hover:bg-primary-100 p-2 px-4 transition-colors font-light duration-500 ${
          pathname.endsWith(`/category/${category.slug}`)
            ? "bg-primary-100 text-primary-600"
            : "hover:bg-primary-100"
        }`}
      >
        {category.name}
        <br />
      </Link>
    );
  }
};

export default NavbarLink;
