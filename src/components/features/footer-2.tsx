import { CSR, LEGALS } from "@/constant/constant";
import { getCategories } from "@/lib/categories";
import Image from "next/image";
import Link from "next/link";

export async function Footer2() {
  const categories = await getCategories({
    filter: {
      status: {
        _eq: "published",
      },
    },
  });

  const forthSection = LEGALS;
  return (
    <footer className="px-4  2xl:px-[12rem] flex flex-col items-center justify-center gap-10 min-h-[40dvh] border-t py-10">
      <div className="grid grid-cols-1 lg:p-10 items-center justify-center sm:justify-between sm:grid-cols-4 w-full gap-6">
        <div className="size-full">
          <Image alt="Image" src="/images/logo44.png" width={44} height={44} />
          <p className="text-muted-foreground text-balance">
            บริษัท เมตา พีเพิล จำกัด
          </p>
          <p className="text-muted-foreground text-balance font-light">
            709, 710 มิตรทาวน์ ออฟฟิศ ทาวเวอร์
          </p>
          <p className="text-muted-foreground text-balance font-light">
            พระราม 4 วังใหม่ ปทุมวัน 10330
            <br />
          </p>
        </div>
        <div className="mx-auto flex size-full flex-col items-start justify-start gap-1 md:w-fit font-light">
          {categories
            .sort((a, b) => {
              if (a.id && b.id) {
                return a.id - b.id;
              }
              return 0;
            })
            .map((category, index) => (
              <Link key={category.slug} href={`/category/${category.slug}`}>
                {category.name}
                <br />
              </Link>
            ))}
          <Link href="/ai-assistant">
            Chancedee mentor - AI
            <br />
          </Link>
        </div>
        <div className="mx-auto flex size-full flex-col items-start justify-start gap-1 md:w-fit font-light">
          {CSR.map((item, index) => (
            <Link key={index} href={item.link} target="_blank">
              {item.title}
              <br />
            </Link>
          ))}
        </div>
        <div className="mx-auto flex size-full flex-col items-start justify-start gap-1 md:w-fit font-light">
          {forthSection.map((item, index) => (
            <Link key={index} href={item.link} target="_blank">
              {item.title}
              <br />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
