"use server";
import * as cheerio from "cheerio";

export const replaceImageHTML = (htmlContent: string) => {
  const htmlPayload = cheerio.load(htmlContent);
  // Make images responsive
  htmlPayload("img").each((index, element) => {
    htmlPayload(element).css({
      "max-width": "100%",
      height: "auto",
      display: "block",
      margin: "0 auto",
    });
  });
  return htmlPayload.html();
};
