"use server";

// Note: convertHtmlToText has been moved to @/lib/utils/server/text-processing
// This re-export is maintained for backward compatibility
import { convertHtmlToText as convertHtmlToTextUtil } from "@/lib/utils/server/text-processing";
export const convertHtmlToText = convertHtmlToTextUtil;
