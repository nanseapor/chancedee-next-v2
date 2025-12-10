"use server";

import { readItems, updateItem } from "@directus/sdk";
import { directus } from "./directus";

export interface NewsletterProps {
  id?: string;
  title?: string;
  content?: string;
  sent_date?: string;
}

async function getCMSNewsLetter(): Promise<Array<NewsletterProps>> {
  return directus.request(
    readItems("Newsletter", {
      filter: {
        status: {
          _eq: "published",
        },
      },
    }),
  );
}

async function patchSentNewsletter(id: string) {
  const data = {
    status: "archived",
  };
  return directus.request(updateItem("Newsletter", id, data));
}

export { getCMSNewsLetter, patchSentNewsletter };
