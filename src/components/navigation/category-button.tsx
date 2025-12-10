import getAssets from "@/lib/assets";
import type { Category } from "@/lib/categories";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const CategoryButton = ({ category }: { category: Category }) => {
  return (
    <Link href={`/category/${category.slug}`}>
      <Button
        size="default"
        variant="outline"
        className="flex justify-start gap-2 lg:gap-4 rounded-full border pl-1 lg:pl-3 pr-4 lg:pr-6 h-12 w-32 lg:w-60 lg:h-20 hover:bg-white hover:border-primary-500 transition-colors duration-700 ease-in-out"
      >
        <div className="w-10 h-10 lg:w-[56px] lg:h-[56px] rounded-full overflow-hidden flex items-center justify-center bg-background shrink-0">
          <Image
            alt="Image"
            src={
              category.category_thumbnail
                ? getAssets(category.category_thumbnail)
                : "/images/logo44.png"
            }
            width={100}
            height={100}
            className="object-cover w-full h-full"
          />
        </div>
        <p className="text-sm font-light lg:text-xl text-start text-wrap">
          {category.name}
        </p>
      </Button>
    </Link>
  );
};

export default CategoryButton;
