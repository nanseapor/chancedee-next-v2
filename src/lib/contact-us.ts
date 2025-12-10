"use server";
import { readItems } from "@directus/sdk";
import { directus } from "./directus";

interface ContactUs {
  cover_image?: string;
}

export async function getContactusBanner(): Promise<Array<ContactUs>> {
  return directus.request(
    readItems("Contact_Us", {
      filter: {
        status: {
          _eq: "published",
        },
      },
    }),
  );
}
