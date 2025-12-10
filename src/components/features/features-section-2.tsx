import { getCategories } from "@/lib/categories";
import ToolTipWrapper from "../common/tool-tip-wrapper";
import CategoryButton from "../navigation/category-button";

export async function Features2() {
  const categories = await getCategories({
    filter: {
      status: {
        _eq: "published",
      },
    },
  });
  return (
    <section className="px-4  2xl:px-[12rem] flex flex-col items-center gap-6 sm:gap-7 py-10">
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl text-balance text-center">
          Category
        </h2>
      </div>
      <div className="mt-6 gap-7 flex flex-wrap items-center justify-center">
        {categories
          .filter((cat) => cat.id !== 7)
          .sort((a, b) => {
            if (a.name && b.name) {
              return a.name.localeCompare(b.name);
            }
            return 0;
          })
          .map((category, index) => (
            <ToolTipWrapper key={index} text={category.description}>
              <CategoryButton category={category} />
            </ToolTipWrapper>
          ))}
      </div>
    </section>
  );
}
