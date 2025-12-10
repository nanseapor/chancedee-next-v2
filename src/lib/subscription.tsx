"use server";
import { retryDirectusOperation } from "@/lib/utils/retry";
import { readItems } from "@directus/sdk";
import {
  type ItemsQuery,
  createCollectionItem,
  directus,
  updateCollectionItem,
} from "./directus";

export const subscribeNewsletter = async ({ email }: { email: string }) => {
  const existed = await getSubscriberByEmail(email);
  if (existed.length > 0 && existed[0].id) {
    return updateCollectionItem("newsletter_subscribers", existed[0].id, {
      status: "subscribed",
      last_modified: new Date().toISOString(),
    })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error("Subscribe newsletter errors", err);
        const errorArray = err.errors;
        const errorCodes = errorArray.map(
          (error: any) => error.extensions.code,
        );
        const errorMessage = errorArray
          .map((error: any) => error.message)
          .join(",");
        return {
          error: errorCodes as string,
          message: errorMessage as string,
          email: [errorMessage as string],
        };
      });
  } else {
    return createCollectionItem("newsletter_subscribers", {
      email,
      status: "subscribed",
      subscription_date: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error("Subscribe newsletter errors", err);
        const errorArray = err.errors;
        const errorCodes = errorArray.map(
          (error: any) => error.extensions.code,
        );
        if (errorCodes.includes("RECORD_NOT_UNIQUE")) {
          console.error("RECORD_NOT_UNIQUE", email);
          return {
            error: "RECORD_NOT_UNIQUE",
            message: "ไม่สามารถสมัครสมาชิกได้เนื่องจากมีอีเมล์นี้ในระบบแล้ว",
            email: ["ไม่สามารถสมัครสมาชิกได้เนื่องจากมีอีเมล์นี้ในระบบแล้ว"],
          };
        } else {
          const errorMessage = errorArray
            .map((error: any) => error.message)
            .join(",");
          return {
            error: errorCodes as string,
            message: errorMessage as string,
            email: [errorMessage as string],
          };
        }
      });
  }
};

export const unsubscribeNewsLetter = async ({ id }: { id: number }) => {
  return updateCollectionItem("newsletter_subscribers", id, {
    status: "unsubscribed",
    last_modified: new Date().toISOString(),
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.error("Unsubscribe newsletter errors", err);
      const errorArray = err.errors;
      const errorCodes = errorArray.map((error: any) => error.extensions.code);
      const errorMessage = errorArray
        .map((error: any) => error.message)
        .join(",");
      return {
        error: errorCodes as string,
        message: errorMessage as string,
        email: [errorMessage as string],
      };
    });
};

export interface Subscription {
  id?: number;
  email?: string;
}

export async function getSubscriberByEmail(
  email: string,
  options?: ItemsQuery,
): Promise<Subscription[]> {
  if (!email) throw new Error("Invalid id");

  const result = await retryDirectusOperation("getSubscriberByEmail", () =>
    directus.request(
      readItems("newsletter_subscribers", {
        ...options,
        filter: {
          email: {
            _eq: email,
          },
        },
      }),
    ),
  );

  if (!result.success) {
    throw result.error || new Error("Failed to fetch subscriber by email");
  }

  return result.data as Subscription[];
}

export async function getAllSubscribers(): Promise<Subscription[]> {
  const result = await retryDirectusOperation("getAllSubscribers", () =>
    directus.request(
      readItems("newsletter_subscribers", {
        filter: {
          status: {
            _eq: "subscribed",
          },
        },
      }),
    ),
  );

  if (!result.success) {
    throw result.error || new Error("Failed to fetch all subscribers");
  }

  return result.data as Subscription[];
}
