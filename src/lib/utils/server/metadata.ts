"use server";

import { getHome } from "../client/home";
import getAssets from "../shared/asset";

export async function getGlobalMetadata(hostname?: string) {
  const meta = await getHome();

  const global = {
    title: `CHANCEDEE JOBS MARKET "ตลาดงานของมนุษย์เงินเดือนที่ใหญ่ที่สุด"`,
    description: `CHANCEDEE JOBS MARKET "ตลาดงานของมนุษย์เงินเดือน"เพื่อคนวัยทำงานที่ใหญ่ที่สุด ค้นหางานตรงใจ ตรงกับไลฟ์สไตล์ความต้องการ งานที่ทำได้แบบไม่ Toxic ด้วยระบบแนะนำจากพฤติกรรม ให้คุณสัมผัสได้พบกับงานที่เหมาะกับตัวตนของคุณอย่างแม่นยำ จากบริษัทฯ ชั้นนำ น่าเชื่อถือ และอาชีพที่หลากหลาย ค้นพบงานที่เกิดมาเพื่อคุณที่นี่ CHANCEDEE JOBS MARKET`,
    openGraph: {
      type: "website", // This sets the og:type
      images: ["/images/jobmarket-opengraph-banner.jpg"],
      title: `CHANCEDEE JOBS MARKET "ตลาดงานของมนุษย์เงินเดือนที่ใหญ่ที่สุด"`,
      description: `CHANCEDEE JOBS MARKET "ตลาดงานของมนุษย์เงินเดือน"เพื่อคนวัยทำงานที่ใหญ่ที่สุด ค้นหางานตรงใจ ตรงกับไลฟ์สไตล์ความต้องการ งานที่ทำได้แบบไม่ Toxic ด้วยระบบแนะนำจากพฤติกรรม ให้คุณสัมผัสได้พบกับงานที่เหมาะกับตัวตนของคุณอย่างแม่นยำ จากบริษัทฯ ชั้นนำ น่าเชื่อถือ และอาชีพที่หลากหลาย ค้นพบงานที่เกิดมาเพื่อคุณที่นี่ CHANCEDEE JOBS MARKET`,
      url: `https://${hostname}/`,
    },
    twitter: {
      card: "summary_large_image",
      title: 'CHANCEDEE JOBS MARKET "ตลาดงานของมนุษย์เงินเดือนที่ใหญ่ที่สุด"',
      description: `CHANCEDEE JOBS MARKET "ตลาดงานของมนุษย์เงินเดือน"เพื่อคนวัยทำงานที่ใหญ่ที่สุด ค้นหางานตรงใจ ตรงกับไลฟ์สไตล์ความต้องการ งานที่ทำได้แบบไม่ Toxic ด้วยระบบแนะนำจากพฤติกรรม ให้คุณสัมผัสได้พบกับงานที่เหมาะกับตัวตนของคุณอย่างแม่นยำ จากบริษัทฯ ชั้นนำ น่าเชื่อถือ และอาชีพที่หลากหลาย ค้นพบงานที่เกิดมาเพื่อคุณที่นี่ CHANCEDEE JOBS MARKET`,
      images: [`https://${hostname}/images/jobmarket-opengraph-banner.jpg`], // Must be an absolute URL
    },
  };

  if (meta.length || meta.length > 0) {
    const metadata = meta[0]!;
    return Promise.resolve({
      title: metadata.meta_title,
      description: metadata.meta_description,
      openGraph: {
        type: "website", // This sets the og:type
        images: metadata.opengraph_image
          ? [getAssets(metadata.opengraph_image)]
          : [],
        title: metadata.opengraph_title,
        description: metadata.opengraph_description,
        url: `https://${hostname}/`,
      },
      twitter: {
        card: "summary_large_image",
        title: metadata.twitter_title,
        description: metadata.twitter_description,
        images: metadata.twitter_image ? [metadata.twitter_image] : [], // Must be an absolute URL
      },
    });
  } else {
    return Promise.resolve(global);
  }
}
