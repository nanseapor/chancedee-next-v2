"use server";
import { readItems } from "@directus/sdk";
import { directus } from "./directus";

interface RegisterProps {
  title?: string;
  text?: string;
  image?: string;
}

export async function getRegisterBanner(): Promise<Array<RegisterProps>> {
  return directus.request(
    readItems("Register", {
      filter: {
        status: {
          _eq: "published",
        },
      },
    }),
  );
}
