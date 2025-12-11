import { BlogSection } from "@/components/blog/blog-section";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import PopupBanner from "@/components/common/popup-banner";
import { HomeContentSection } from "@/components/content/home-content-sections";
import BubbleHero from "@/components/features/bubble-hero";
import { Features2 } from "@/components/features/features-section-2";
import { Hero } from "@/components/features/hero";
import type { Category } from "@/lib/categories";
import { getHome } from "@/lib/home";
import { type Popup, getPopups } from "@/lib/popup";
import type { Post } from "@/lib/posts";
import { default as dynamicImport } from "next/dynamic";
const NewsletterSubscription = dynamicImport(
  () => import("@/components/content/newsletter-subscription"),
  {
    loading: () => <LoadingSpinner />,
  },
);

interface PinnedPosts {
  Blog_id: Post;
}
interface PinnedCategory {
  Pinned_Category_id: { category: Category; pinned_posts: PinnedPosts[] };
}

export default async function Home() {
  const homeData = await getHome();

  const popups: Popup[] = await getPopups();

  return (
    <>
      <PopupBanner popups={popups} />
      <BubbleHero />
      <Features2 />
      <Hero
        featuredPosts={homeData[0].featured_posts.map(
          (post: PinnedPosts) => post.Blog_id,
        )}
      />
      {homeData &&
        homeData.length > 0 &&
        homeData[0].pinned_category.map((categoryData: PinnedCategory) => {
          return (
            <HomeContentSection
              key={categoryData.Pinned_Category_id.category.id}
              category={categoryData.Pinned_Category_id.category}
              featuredPosts={categoryData.Pinned_Category_id.pinned_posts.map(
                (post: PinnedPosts) => post.Blog_id,
              )}
            />
          );
        })}
      <BlogSection />
      {/* <BlogExtender /> */}
      <NewsletterSubscription />
      {/* <Footer2 /> */}
    </>
  );
}

export const dynamic = "force-dynamic";
