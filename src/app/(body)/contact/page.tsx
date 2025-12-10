import NewsletterSubscription from "@/components/content/newsletter-subscription";
import ContactUs from "@/components/forms/contact-us";
import getAssets from "@/lib/assets";
import { getContactusBanner } from "@/lib/contact-us";

export const dynamic = "force-dynamic";

export default async function Contact() {
  const data = await getContactusBanner();
  const imageBanner =
    data && data.length > 0 && data[0].cover_image
      ? getAssets(data[0].cover_image)
      : "/images/article-3.avif";
  return (
    <>
      <ContactUs cover_image={imageBanner} />
      <NewsletterSubscription />
    </>
  );
}
