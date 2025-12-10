"use server";

import { JSDOM } from "jsdom";

/**
 * Converts HTML content to plain text by removing all HTML tags
 * @param html - HTML string to convert
 * @returns Object containing the cleaned text or empty string if input is undefined
 */
export async function convertHtmlToText(html?: string) {
  if (!html) {
    return { text: "" };
  }

  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const textContent = document.body.textContent || "";
    const cleanedText = textContent.replace(/\s+/g, " ").trim();

    return { text: cleanedText };
  } catch (error) {
    console.error("Error converting HTML to text:", error);
    return { error: "Failed to convert HTML to text", text: "" };
  }
}
