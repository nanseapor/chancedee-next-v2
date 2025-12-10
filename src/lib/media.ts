import { readItems } from "@directus/sdk";
import { type ItemsQuery, directus } from "./directus";

export interface Media {
  id?: string;
  status?: string;
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  title?: string;
  slug?: string;
  file?: string;
  media_type?: string;
  alt_text?: string;
  transcript?: string;
  duration?: string;
  dimensions?: string;
  file_size?: string;
  MIME_Type?: string;
  author_creator?: string;
  copyright_information?: string;
  tags?: string;
  usage_rights?: string;
  featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  related_content?: string[];
}

export async function getMedia(options?: ItemsQuery): Promise<Array<Media>> {
  const media = await directus.request(
    readItems("Media", {
      ...options,
      fields: options?.fields || ["*"],
      filter: {
        ...options?.filter,
        status: {
          _eq: "published",
        },
      },
    }),
  );
  return media;
}

export async function getMediaByFiles(
  file: string[],
  options?: ItemsQuery,
): Promise<Array<Media>> {
  if (!file) throw new Error("Invalid file");
  const items = await getMedia({
    ...options,
    fields: ["*"],
    filter: {
      file: {
        _in: file,
      },
    },
  });
  return items;
}
