import { retryDirectusOperation } from "@/lib/utils/retry";
import {
  createDirectus,
  createItem,
  deleteItem,
  readItem,
  readItems,
  rest,
  staticToken,
  updateItem,
} from "@directus/sdk";
import getAssets from "./assets";

export interface ItemsQuery {
  limit?: number;
  offset?: number;
  fields?: Array<string>;
  filter?: Record<
    string,
    | {
        _eq: string | number | boolean;
      }
    | {
        _some: {
          _eq: string | number;
        };
      }
    | {
        _lt: string;
      }
    | {
        _contains: string;
      }
    | {
        _in: Array<string>;
      }
    | {
        _neq: string;
      }
    | {
        slug: {
          _eq: string;
        };
      }
  >;
  search?: string;
  sort?: string[];
}

export const directus = createDirectus(
  String(process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT),
)
  .with(staticToken("YJW0bHq5mDaDhJWIGNxrCubVzXqAPGJM"))
  .with(
    rest({
      onRequest: (options) => ({
        ...options,
        // Use Next.js revalidation instead of cache: "no-store" to avoid Response.clone() issues
        // This prevents "Body has already been consumed" errors in Server Components
        next: { revalidate: 0 },
      }),
    }),
  );

export async function getItemById(
  collection: string,
  id: number | string,
  options?: ItemsQuery,
) {
  return directus.request(readItem(collection, id, options));
}

export async function createCollectionItem(
  collection: string,
  data: Record<string, unknown>,
) {
  return directus.request(createItem(collection, data));
}

export async function updateCollectionItem(
  collection: string,
  id: number | string,
  data: Partial<Record<string, unknown>>,
) {
  return directus.request(updateItem(collection, id, data));
}

export async function deleteCollectionItem(
  collection: string,
  id: number | string,
) {
  return directus.request(deleteItem(collection, id));
}

export async function getGlobalMetadata(hostname?: string) {
  const global = {
    title: `CHANCEDEE - จุดนัดพบ ของเหล่า Grower พื้นที่แลกเปลี่ยนเรียนรู้และเตรียมความพร้อมสำหรับวัยทำงานและมนุษย์เงินเดือน`,
    description: `จุดนัดพบ ของเหล่า Grower พื้นที่แลกเปลี่ยนเรียนรู้ เพื่อเตรียมความพร้อมสำหรับวัยทำงาน วิธีคิด ทักษะการใช้ชีวิตและเทคนิคการเอาตัวรอด ไลฟ์สไตล์คูล ๆ  เพื่อให้คุณเป็นวัยทำงานที่มีความสุขและไม่ตกเทรน ด้วยบทความและ Content ดี ๆ ที่ไม่ Toxic สำหรับคุณโดยเฉพาะ`,
    openGraph: {
      type: "website", // This sets the og:type
      images: ["/images/chancedee-opengraph-banner.jpg"],
      title: `จุดนัดพบ ของเหล่า Grower พื้นที่แลกเปลี่ยนเรียนรู้และเตรียมความพร้อมสำหรับวัยทำงานและมนุษย์เงินเดือน`,
      description: `จุดนัดพบ ของเหล่า Grower พื้นที่แลกเปลี่ยนเรียนรู้ เพื่อเตรียมความพร้อมสำหรับวัยทำงาน วิธีคิด ทักษะการใช้ชีวิตและเทคนิคการเอาตัวรอด ไลฟ์สไตล์คูล ๆ  เพื่อให้คุณเป็นวัยทำงานที่มีความสุขและไม่ตกเทรน ด้วยบทความและ Content ดี ๆ ที่ไม่ Toxic สำหรับคุณโดยเฉพาะ`,
      url: `https://${hostname}/`,
    },
    twitter: {
      card: "summary_large_image",
      title:
        "จุดนัดพบ ของเหล่า Grower พื้นที่แลกเปลี่ยนเรียนรู้และเตรียมความพร้อมสำหรับวัยทำงานและมนุษย์เงินเดือน",
      description:
        "จุดนัดพบ ของเหล่า Grower พื้นที่แลกเปลี่ยนเรียนรู้ เพื่อเตรียมความพร้อมสำหรับวัยทำงาน วิธีคิด ทักษะการใช้ชีวิตและเทคนิคการเอาตัวรอด ไลฟ์สไตล์คูล ๆ  เพื่อให้คุณเป็นวัยทำงานที่มีความสุขและไม่ตกเทรน ด้วยบทความและ Content ดี ๆ ที่ไม่ Toxic สำหรับคุณโดยเฉพาะ",
      images: [`https://${hostname}/images/chancedee-opengraph-banner.jpg`], // Must be an absolute URL
    },
  };

  const result = await retryDirectusOperation("getGlobalMetadata", () =>
    directus.request(
      readItems("Home", {
        filter: {
          status: {
            _eq: "published",
          },
        },
      }),
    ),
  );

  // If fetch fails, return the fallback global metadata
  if (!result.success) {
    console.error(
      "Failed to fetch global metadata from Directus, using fallback:",
      result.error,
    );
    return Promise.resolve(global);
  }

  const meta = result.data as Array<any>;

  if (meta.length || meta.length > 0) {
    const metadata = meta[0];
    return Promise.resolve({
      title: metadata.meta_title,
      description: metadata.meta_description,
      openGraph: {
        type: "website", // This sets the og:type
        images: [getAssets(metadata.opengraph_image)],
        title: metadata.opengraph_title,
        description: metadata.opengraph_description,
        url: `https://${hostname}/`,
      },
      twitter: {
        card: "summary_large_image",
        title: metadata.twitter_title,
        description: metadata.twitter_description,
        images: [metadata.twitter_image], // Must be an absolute URL
      },
    });
  } else {
    return Promise.resolve(global);
  }
}
